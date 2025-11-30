import requests
from bs4 import BeautifulSoup
import json
import random
import time
from faker import Faker

fake = Faker()

BASE_URL = "https://aztechshop.az/noutbuklar/?limit=96"
OUTPUT_FILE = "aztech_products.json"

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
}

def get_soup(url):
    try:
        response = requests.get(url, headers=HEADERS, timeout=10)
        response.raise_for_status()
        return BeautifulSoup(response.content, 'html.parser')
    except Exception as e:
        print(f"Error fetching {url}: {e}")
        return None

def get_high_res_image_url(img_url):
    """Convert image URL to high resolution by replacing dimensions"""
    if '533x398' in img_url:
        return img_url.replace('533x398', '1300x1300')
    elif '80x80' in img_url:
        return img_url.replace('80x80', '1300x1300')
    return img_url

def scrape_listing_page(url):
    """Scrape all products from the listing page"""
    soup = get_soup(url)
    if not soup:
        return []
    
    products = []
    product_thumbs = soup.select('.product-thumb')
    
    print(f"Found {len(product_thumbs)} product listings")
    
    for thumb in product_thumbs:
        try:
            # Title and Link
            title_link = thumb.select_one('.product-thumb__name')
            if not title_link:
                continue
                
            title = title_link.get_text(strip=True)
            product_url = title_link.get('href', '')
            
            # Price
            price = 0
            price_tag = thumb.select_one('.price')
            if price_tag:
                price_text = price_tag.get('data-price') or price_tag.get_text(strip=True)
                try:
                    # Remove currency symbols and convert to float
                    price_clean = price_text.replace('₼', '').replace(',', '').strip()
                    price = float(price_clean) if price_clean and price_clean != '0' else random.randint(500, 3000)
                except ValueError:
                    price = float(random.randint(500, 3000))
            else:
                price = float(random.randint(500, 3000))
            
            # Images - get from data-img attributes
            images = []
            
            # Main image - exclude icons/stickers
            main_img = thumb.select_one('.product-thumb__image > a > img')
            if main_img:
                img_src = main_img.get('src')
                if img_src and 'Stiker' not in img_src:
                    high_res_url = get_high_res_image_url(img_src)
                    images.append(high_res_url)
                
                # Additional images from data-additional attribute
                data_additional = main_img.get('data-additional')
                if data_additional:
                    additional_urls = data_additional.split('||')
                    for url in additional_urls:
                        if url and url not in images:
                            high_res_url = get_high_res_image_url(url)
                            images.append(high_res_url)
            
            # Also check data-img attributes in addit items
            for addit_item in thumb.select('.product-thumb__addit-item'):
                img_url = addit_item.get('data-img')
                if img_url and img_url not in images:
                    high_res_url = get_high_res_image_url(img_url)
                    images.append(high_res_url)
            
            if not images:
                images = [f"https://loremflickr.com/640/480/laptop?lock={random.randint(1, 100)}"]
            
            # Brand - extract from title or use fallback
            brand = "Unknown"
            if "ASUS" in title.upper():
                brand = "Asus"
            elif "LENOVO" in title.upper():
                brand = "Lenovo"
            elif "MSI" in title.upper():
                brand = "MSI"
            elif "HP" in title.upper():
                brand = "HP"
            elif "DELL" in title.upper():
                brand = "Dell"
            elif "ACER" in title.upper():
                brand = "Acer"
            
            # Description - use title or generate
            description = title
            
            # Generate specs (simplified, as we don't have them from listing page)
            specs = {
                "Source": "Listing Page",
                "URL": product_url
            }
            
            # Check for special price/discount
            has_special = thumb.select_one('.price-old')
            discount = random.uniform(5, 15) if has_special else 0
            
            product = {
                "id": random.randint(1000, 9999),
                "title": title,
                "description": description,
                "price": price,
                "discountPercentage": round(discount, 2),
                "rating": round(random.uniform(3.5, 5.0), 2),
                "stock": random.randint(0, 50),
                "brand": brand,
                "category": "laptops",
                "thumbnail": images[0],
                "images": images,
                "specs": specs,
                "url": product_url
            }
            
            products.append(product)
            
        except Exception as e:
            print(f"Error parsing product: {e}")
            continue
    
    return products

def main():
    print("Starting AztechShop scraper...")
    
    all_products = []
    
    # Scrape from multiple pages
    pages_to_scrape = [
        "https://aztechshop.az/noutbuklar/?limit=96",
        "https://aztechshop.az/noutbuklar/?limit=96&page=2"
    ]
    
    for page_num, page_url in enumerate(pages_to_scrape, 1):
        print(f"\nFetching from Page {page_num}: {page_url}")
        products = scrape_listing_page(page_url)
        
        if products:
            all_products.extend(products)
            print(f"Added {len(products)} products from page {page_num}")
        else:
            print(f"No products found on page {page_num}")
        
        # Be polite - wait between pages
        if page_num < len(pages_to_scrape):
            time.sleep(2)
    
    if not all_products:
        print("No products found!")
        return
    
    # Save Data
    with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
        json.dump(all_products, f, indent=2, ensure_ascii=False)
        
    print(f"\n{'='*50}")
    print(f"Scraping complete!")
    print(f"Total products saved: {len(all_products)}")
    print(f"Output file: {OUTPUT_FILE}")
    print(f"{'='*50}")

if __name__ == "__main__":
    main()
