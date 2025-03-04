import express from 'express';
import axios from 'axios';
import cheerio from 'cheerio';
import puppeteer from 'puppeteer';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

// Scrape Realtor.ca using Puppeteer
async function scrapeRealtorCa() {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();
    await page.goto('https://www.realtor.ca/map#view=list&Province=ON&Sort=6-D');
    await page.waitForSelector('.listingCard');

    const listings = await page.evaluate(() => {
      const cards = document.querySelectorAll('.listingCard');
      return Array.from(cards).map(card => ({
        title: card.querySelector('.listingCard__title')?.textContent?.trim(),
        price: card.querySelector('.listingCard__price')?.textContent?.trim(),
        location: card.querySelector('.listingCard__address')?.textContent?.trim(),
        bedrooms: card.querySelector('.listingCard__beds')?.textContent?.trim(),
        bathrooms: card.querySelector('.listingCard__baths')?.textContent?.trim(),
        image_url: card.querySelector('img')?.getAttribute('src'),
        listing_url: card.querySelector('a')?.getAttribute('href'),
        source_website: 'realtor.ca'
      }));
    });

    return listings;
  } finally {
    await browser.close();
  }
}

// Scrape Point2Homes using Axios and Cheerio
async function scrapePoint2Homes() {
  try {
    const { data } = await axios.get(
      'https://www.point2homes.com/CA/Real-Estate-Listings/ON.html',
      {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      }
    );

    const $ = cheerio.load(data);
    const listings: any[] = [];

    $('.item-wrap').each((_, element) => {
      listings.push({
        title: $(element).find('.item-title').text().trim(),
        price: $(element).find('.item-price').text().trim(),
        location: $(element).find('.item-address').text().trim(),
        bedrooms: $(element).find('.item-beds').text().trim(),
        bathrooms: $(element).find('.item-baths').text().trim(),
        image_url: $(element).find('img').attr('src'),
        listing_url: $(element).find('a').attr('href'),
        source_website: 'point2homes.com'
      });
    });

    return listings;
  } catch (error) {
    console.error('Error scraping Point2Homes:', error);
    return [];
  }
}

// Save listings to Supabase
async function saveToSupabase(listings: any[]) {
  for (const listing of listings) {
    try {
      const price = parseFloat(listing.price.replace(/[$,]/g, ''));

      const data = {
        title: listing.title,
        price,
        location: listing.location,
        bedrooms: listing.bedrooms ? parseInt(listing.bedrooms.split(' ')[0]) : null,
        bathrooms: listing.bathrooms ? parseFloat(listing.bathrooms.split(' ')[0]) : null,
        image_url: listing.image_url,
        listing_url: listing.listing_url,
        source_website: listing.source_website
      };

      await supabase
        .from('real_estate_listings')
        .upsert(data, { onConflict: 'listing_url' });

    } catch (error) {
      console.error('Error saving listing:', error);
    }
  }
}

// API endpoint to trigger scraping
app.post('/api/scrape', async (req, res) => {
  try {
    const [realtorListings, point2homesListings] = await Promise.all([
      scrapeRealtorCa(),
      scrapePoint2Homes()
    ]);

    const allListings = [...realtorListings, ...point2homesListings];
    await saveToSupabase(allListings);

    res.json({ 
      success: true, 
      message: `Scraped ${allListings.length} listings` 
    });
  } catch (error) {
    console.error('Scraping error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to scrape listings' 
    });
  }
});

// Schedule scraping every 6 hours
setInterval(async () => {
  try {
    const [realtorListings, point2homesListings] = await Promise.all([
      scrapeRealtorCa(),
      scrapePoint2Homes()
    ]);

    const allListings = [...realtorListings, ...point2homesListings];
    await saveToSupabase(allListings);
    
    console.log(`Scheduled scraping completed: ${allListings.length} listings`);
  } catch (error) {
    console.error('Scheduled scraping error:', error);
  }
}, 6 * 60 * 60 * 1000);

app.listen(port, () => {
  console.log(`Real estate scraper running on port ${port}`);
}); 