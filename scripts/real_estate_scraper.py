import requests
from bs4 import BeautifulSoup
import json
import time
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import os
from supabase import create_client, Client

# Initialize Supabase client
supabase: Client = create_client(
    os.getenv('SUPABASE_URL'),
    os.getenv('SUPABASE_SERVICE_KEY')
)

def setup_driver():
    chrome_options = Options()
    chrome_options.add_argument("--headless")
    chrome_options.add_argument("--no-sandbox")
    chrome_options.add_argument("--disable-dev-shm-usage")
    return webdriver.Chrome(options=chrome_options)

def scrape_realtor_ca():
    base_url = "https://www.realtor.ca/map#view=list&Province=ON&Sort=6-D"
    driver = setup_driver()
    listings = []
    
    try:
        driver.get(base_url)
        WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.CLASS_NAME, "listingCard"))
        )
        
        # Extract listing data
        listing_cards = driver.find_elements(By.CLASS_NAME, "listingCard")
        
        for card in listing_cards:
            try:
                listing = {
                    'title': card.find_element(By.CLASS_NAME, "listingCard__title").text,
                    'price': card.find_element(By.CLASS_NAME, "listingCard__price").text,
                    'location': card.find_element(By.CLASS_NAME, "listingCard__address").text,
                    'bedrooms': card.find_element(By.CLASS_NAME, "listingCard__beds").text,
                    'bathrooms': card.find_element(By.CLASS_NAME, "listingCard__baths").text,
                    'image_url': card.find_element(By.TAG_NAME, "img").get_attribute("src"),
                    'listing_url': card.find_element(By.TAG_NAME, "a").get_attribute("href"),
                    'source_website': 'realtor.ca'
                }
                listings.append(listing)
            except Exception as e:
                print(f"Error extracting listing: {e}")
                
    finally:
        driver.quit()
    
    return listings

def scrape_point2homes():
    base_url = "https://www.point2homes.com/CA/Real-Estate-Listings/ON.html"
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    }
    
    listings = []
    
    try:
        response = requests.get(base_url, headers=headers)
        soup = BeautifulSoup(response.text, 'html.parser')
        
        for item in soup.select('.item-wrap'):
            try:
                listing = {
                    'title': item.select_one('.item-title').text.strip(),
                    'price': item.select_one('.item-price').text.strip(),
                    'location': item.select_one('.item-address').text.strip(),
                    'bedrooms': item.select_one('.item-baths').text.strip(),
                    'bathrooms': item.select_one('.item-baths').text.strip(),
                    'image_url': item.select_one('img')['src'],
                    'listing_url': item.select_one('a')['href'],
                    'source_website': 'point2homes.com'
                }
                listings.append(listing)
            except Exception as e:
                print(f"Error extracting listing: {e}")
                
    except Exception as e:
        print(f"Error scraping Point2Homes: {e}")
    
    return listings

def save_to_supabase(listings):
    for listing in listings:
        try:
            # Clean up price string and convert to numeric
            price = float(listing['price'].replace('$', '').replace(',', ''))
            
            data = {
                'title': listing['title'],
                'price': price,
                'location': listing['location'],
                'bedrooms': int(listing['bedrooms'].split()[0]) if listing['bedrooms'] else None,
                'bathrooms': float(listing['bathrooms'].split()[0]) if listing['bathrooms'] else None,
                'image_url': listing['image_url'],
                'listing_url': listing['listing_url'],
                'source_website': listing['source_website']
            }
            
            supabase.table('real_estate_listings').upsert(
                data,
                on_conflict='listing_url'
            ).execute()
            
        except Exception as e:
            print(f"Error saving listing to Supabase: {e}")

def main():
    # Scrape listings from multiple sources
    realtor_listings = scrape_realtor_ca()
    point2homes_listings = scrape_point2homes()
    
    # Combine all listings
    all_listings = realtor_listings + point2homes_listings
    
    # Save to Supabase
    save_to_supabase(all_listings)

if __name__ == "__main__":
    main() 