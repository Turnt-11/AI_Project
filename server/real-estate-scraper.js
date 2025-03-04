const puppeteer = require('puppeteer');
const { supabase } = require('./lib/supabase');

async function scrapeRealEstate() {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-web-security',
      '--disable-features=IsolateOrigins,site-per-process',
      '--window-size=1920,1080',
      '--disable-notifications',
      '--disable-dev-shm-usage',
    ],
    defaultViewport: { width: 1920, height: 1080 }
  });

  try {
    const page = await browser.newPage();
    
    // Set multiple headers to look more like a real browser
    await page.setExtraHTTPHeaders({
      'Accept-Language': 'en-US,en;q=0.9',
      'Accept-Encoding': 'gzip, deflate, br',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
      'Connection': 'keep-alive',
      'Upgrade-Insecure-Requests': '1',
      'Cache-Control': 'max-age=0',
    });

    // Enable JavaScript in the page
    await page.setJavaScriptEnabled(true);

    console.log('Navigating to realtor.ca...');
    
    // First navigate to the homepage
    await page.goto('https://www.realtor.ca', {
      waitUntil: 'networkidle0',
      timeout: 60000
    });

    // Wait a bit to simulate human behavior
    await page.waitForTimeout(3000);

    // Then navigate to the search page
    console.log('Navigating to search page...');
    await page.goto('https://www.realtor.ca/map#view=list&Sort=6-D&GeoIds=g30_f2m5h95s&Type=0&ZoomLevel=11&LatitudeMax=43.85654&LongitudeMax=-79.18555&LatitudeMin=43.58158&LongitudeMin=-79.63546&PropertyTypeGroupID=1', {
      waitUntil: 'networkidle0',
      timeout: 60000
    });

    console.log('Waiting for content to load...');
    
    // Wait for any loading indicators to disappear
    await page.waitForFunction(() => {
      const loader = document.querySelector('.loading-overlay');
      return !loader || loader.style.display === 'none';
    }, { timeout: 60000 });

    // Try different selectors that might indicate listings
    const selectors = [
      '.cardCon',
      '.listingCard',
      '[data-testid="listing-card"]',
      '.property-card',
      '#listingContainer .card'
    ];

    let foundSelector = null;
    for (const selector of selectors) {
      try {
        await page.waitForSelector(selector, { 
          timeout: 10000,
          visible: true 
        });
        foundSelector = selector;
        console.log(`Found listings with selector: ${selector}`);
        break;
      } catch (e) {
        console.log(`Selector ${selector} not found, trying next...`);
      }
    }

    if (!foundSelector) {
      throw new Error('Could not find any listing selectors');
    }

    // Take a screenshot for debugging
    await page.screenshot({ path: 'debug-screenshot.png' });

    console.log('Extracting listings...');
    const listings = await page.evaluate((selector) => {
      return Array.from(document.querySelectorAll(selector)).map(listing => ({
        price: listing.querySelector('[class*="Price"]')?.textContent?.trim(),
        address: listing.querySelector('[class*="Address"]')?.textContent?.trim(),
        details: listing.querySelector('[class*="Details"]')?.textContent?.trim(),
        link: listing.querySelector('a')?.href,
      }));
    }, foundSelector);

    console.log(`Found ${listings.length} listings`);
    if (listings.length > 0) {
      console.log('Sample listing:', listings[0]);
    }

    if (listings.length === 0) {
      throw new Error('No listings found - page might have changed structure');
    }

    // Store in Supabase
    const { data, error } = await supabase
      .from('real_estate_listings')
      .upsert(
        listings.map(listing => ({
          ...listing,
          created_at: new Date().toISOString(),
        })),
        { onConflict: ['link'] }
      );

    if (error) {
      console.error('Supabase error:', error);
      throw error;
    }

    console.log('Stored listings:', data);
    return listings;

  } catch (error) {
    console.error('Scraping error:', error);
    // Save page content for debugging
    if (page) {
      const html = await page.content();
      require('fs').writeFileSync('error-page.html', html);
    }
    throw error;
  } finally {
    await browser.close();
  }
}

module.exports = { scrapeRealEstate }; 