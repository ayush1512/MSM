import logging
import requests
import random
import time
import re
import json
from bs4 import BeautifulSoup
from urllib.parse import quote_plus, urljoin
from together import Together

class MedicineWebScraper:
    """Web scraper for gathering medicine information from pharmaceutical websites"""
    
    def __init__(self, debug=False):
        """Initialize the scraper with website configurations"""
        self.debug = debug
        self.sources = [
            {
                "name": "Netmeds",
                "search_url": "https://www.netmeds.com/catalogsearch/result?q={}",
                "user_agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
            },
            {
                "name": "1mg",
                "search_url": "https://www.1mg.com/search/all?name={}",
                "user_agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
            },
            {
                "name": "PharmEasy",
                "search_url": "https://pharmeasy.in/search/all?name={}",
                "user_agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
            },
            {
                "name": "Apollo247",
                "search_url": "https://www.apollo247.com/search?query={}",
                "user_agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
            }
        ]
        # Add Together API client for text processing
        self.together_client = Together()
        self.llm_model = "meta-llama/Llama-3.3-70B-Instruct-Turbo-Free"
        self.extraction_prompt = """
        Extract detailed information about this medicine from the provided HTML/text content. 
        Return ONLY valid JSON format with the following structure:
        
        {
            "product_name": "Full medicine name",
            "product_manufactured": "Manufacturer name",
            "salt_composition": "Full composition details",
            "sub_category": "Medicine category",
            "product_price": "Price with currency symbol",
            "medicine_desc": "Detailed description",
            "side_effects": ["Side effect 1", "Side effect 2", ...],
            "drug_interactions": "Information about interactions",
            "storage": "Storage information",
            "additional_notes": "Any other important information"
            "image_url": "Main image of medicine or product which present in url format"

        }
        
        If any field is not found, include it as null. Be thorough in extracting information.
        Don't include any explanations or text outside the JSON object - return ONLY the JSON.
        """

    def search_and_scrape_medicine(self, medicine_name):
        """
        Search for medicine across multiple sources and scrape details.
        If image_url is missing, continue searching other sources until found.
        """
        sources = self.sources.copy()
        best_data = None

        for source in sources:
            try:
                logging.info(f"Searching for {medicine_name} on {source['name']}")
                search_url = source['search_url'].format(quote_plus(medicine_name))
                headers = {
                    "User-Agent": source["user_agent"],
                    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
                    "Accept-Language": "en-US,en;q=0.5",
                    "Connection": "keep-alive",
                    "Upgrade-Insecure-Requests": "1",
                    "Cache-Control": "max-age=0"
                }
                if self.debug:
                    logging.debug(f"Requesting URL: {search_url}")
                response = requests.get(search_url, headers=headers, timeout=15)
                if response.status_code != 200:
                    logging.warning(f"Request failed for {source['name']}: {response.status_code} status code")
                    if self.debug and response.status_code != 404:
                        with open(f"debug_{source['name']}_error.html", "w", encoding="utf-8") as f:
                            f.write(response.text)
                    continue
                if self.debug:
                    with open(f"debug_{source['name']}_search.html", "w", encoding="utf-8") as f:
                        f.write(response.text)
                product_url = self._parse_search_results(response.text, medicine_name, source['name'], base_url=response.url)
                if not product_url:
                    logging.info(f"No results found on {source['name']} for {medicine_name}")
                    continue
                time.sleep(random.uniform(1, 3))
                if self.debug:
                    logging.debug(f"Found product URL: {product_url}")
                product_response = requests.get(product_url, headers=headers, timeout=15)
                if product_response.status_code != 200:
                    logging.warning(f"Failed to fetch product page from {source['name']}: {product_response.status_code}")
                    continue
                if self.debug:
                    with open(f"debug_{source['name']}_product.html", "w", encoding="utf-8") as f:
                        f.write(product_response.text)
                medicine_data = self._extract_medicine_details(
                    product_response.text, 
                    source['name'],
                    medicine_name,
                    product_url
                )
                if medicine_data:
                    # If we already have data, but no image_url, and this one has image_url, merge it in
                    if best_data is None:
                        best_data = medicine_data
                    else:
                        # If best_data has no image_url but this one does, update image_url
                        if (not best_data.get("image_url")) and medicine_data.get("image_url"):
                            best_data["image_url"] = medicine_data["image_url"]
                    # If we now have image_url, return immediately
                    if best_data.get("image_url"):
                        logging.info(f"Successfully scraped details for {medicine_name} from {source['name']} (with image)")
                        return best_data
            except requests.RequestException as e:
                logging.warning(f"Request failed for {source['name']}: {str(e)}")
            except Exception as e:
                logging.error(f"Error scraping {source['name']}: {str(e)}")
        # If we reach here, return best_data (may be None or missing image_url)
        if best_data:
            logging.info(f"Returning best available data for {medicine_name} (image_url may be missing)")
        else:
            logging.warning(f"Could not find information for {medicine_name} on any source")
        return best_data

    def _parse_search_results(self, html_content, medicine_name, source_name, base_url=None):
        """
        Parse search results to find the product URL
        
        Returns: 
            URL to product page or None if not found
        """
        soup = BeautifulSoup(html_content, 'html.parser')

        if source_name == "1mg":
            # Look for product cards with the class mentioned by user
            cards = soup.select("div.style__horizontal-card___1Zwmt.style__height-158___1XIvD")
            for card in cards:
                a_tag = card.find("a", href=True)
                if a_tag:
                    # Optionally check name match here if needed
                    href = a_tag["href"]
                    if href.startswith("/"):
                        return f"https://www.1mg.com{href}"
                    return href

            # Fallback: try other selectors for product links
            fallback_selectors = [
                "div.style__product-card___1gbex a",
                "div.style__product-box___3oEU6 a",
                "div.col-md-3 a",
                "a"
            ]
            for selector in fallback_selectors:
                for a_tag in soup.select(selector):
                    href = a_tag.get("href", "")
                    text = a_tag.get_text(strip=True)
                    if (medicine_name.lower() in text.lower() or self._is_name_match(text, medicine_name)) and (
                        "/drugs/" in href or "/otc/" in href or "/tablets/" in href or "/capsules/" in href or "/cream/" in href
                    ):
                        if href.startswith("/"):
                            return f"https://www.1mg.com{href}"
                        return href

        # ...existing code for Netmeds, PharmEasy, Apollo247, and base_url fallback...
        return None
    
    def _is_name_match(self, found_name, search_name):
        """Check if the found name is a match for what we're searching for"""
        found_lower = found_name.lower()
        search_lower = search_name.lower()
        
        if search_lower == found_lower:
            return True
        
        if search_lower in found_lower:
            words_in_search = search_lower.split()
            words_in_found = found_lower.split()
            
            if len(words_in_search) > 1:
                matching_words = 0
                for word in words_in_search:
                    if any(word in found_word for found_word in words_in_found):
                        matching_words += 1
                if matching_words >= len(words_in_search) / 2:
                    return True
            
            if words_in_search[0] == words_in_found[0]:
                return True
            
            if search_lower.replace(" ", "") in found_lower.replace(" ", ""):
                return True
            
            if len(search_lower) <= 3 and search_lower in found_lower:
                return True
        
        return False
    
    def _extract_medicine_details(self, html_content, source_name, medicine_name, product_url=None):
        """
        Extract medicine details from product page using Together LLM
        
        Returns:
            Dict with medicine details
        """
        soup = BeautifulSoup(html_content, 'html.parser')
        medicine_data = {
            "product_name": medicine_name,
            "source": source_name,
            "url": product_url
        }
        
        try:
            main_content = None
            
            if source_name == "1mg":
                main_content = soup.select_one("div.DrugOverview__content___3nCO5, div.ProductDescription__content___1rfvD")
            elif source_name == "Netmeds":
                main_content = soup.select_one("div.inner-content, div.product-detail")
            elif source_name == "PharmEasy":
                main_content = soup.select_one("div.MedicineOverviewSection_medicineContainer__gGsPN, div.style__container___2ZDHh")
            elif source_name == "Apollo247":
                main_content = soup.select_one("div.MedicineDetailsContent, div.MuiCardContent-root")
            
            if not main_content:
                main_content = soup.select_one("body")
            
            content_text = main_content.get_text(separator="\n", strip=True) if main_content else html_content
            
            context = f"Medicine Name: {medicine_name}\nURL: {product_url}\n\nContent:\n{content_text}"
            
            if len(context) > 8000:
                context = context[:8000] + "..."
            
            llm_data = self._process_with_together_llm(context)
            
            if llm_data:
                medicine_data.update(llm_data)
            else:
                traditional_data = self._extract_medicine_details_traditional(soup, source_name, medicine_name)
                if traditional_data:
                    medicine_data.update(traditional_data)
            
            # --- PharmEasy image extraction ---
            if source_name == "PharmEasy" and not medicine_data.get("image_url"):
                # Try to extract image url from the specific swiper-slide class
                img_div = soup.select_one(
                    "div.swiper-slide.ProductImageCarousel_productImageContainer__cfrYX.ProductImageCarousel_onlyImage__lLWIq.ProductImageCarousel_pdpImageMobile__eud5r.swiper-slide-active.swiper-slide-visible"
                )
                if img_div:
                    img_tag = img_div.find("img")
                    if img_tag and img_tag.has_attr("src"):
                        medicine_data["image_url"] = img_tag["src"]
            
            return medicine_data
            
        except Exception as e:
            logging.error(f"Error extracting medicine details using LLM: {str(e)}")
            if self.debug:
                import traceback
                logging.error(traceback.format_exc())
            
            try:
                traditional_data = self._extract_medicine_details_traditional(soup, source_name, medicine_name)
                if traditional_data:
                    medicine_data.update(traditional_data)
            except Exception as e2:
                logging.error(f"Traditional extraction also failed: {str(e2)}")
            
            return medicine_data if len(medicine_data) > 2 else None
    
    def _process_with_together_llm(self, content_text):
        """Process content text with Together LLM to extract structured information"""
        try:
            response = self.together_client.chat.completions.create(
                model=self.llm_model,
                messages=[
                    {"role": "system", "content": "You are an expert at extracting structured information about medicines from web pages."},
                    {"role": "user", "content": self.extraction_prompt + "\n\n" + content_text}
                ],
                temperature=0.2,
                max_tokens=2000
            )
            
            if hasattr(response, 'choices') and response.choices:
                result = response.choices[0].message.content
                
                json_match = re.search(r'```json\s*([\s\S]*?)\s*```', result)
                if json_match:
                    json_str = json_match.group(1)
                else:
                    json_match = re.search(r'(\{[\s\S]*\})', result)
                    if json_match:
                        json_str = json_match.group(1)
                    else:
                        json_str = result
                
                try:
                    extracted_data = json.loads(json_str)
                    return extracted_data
                except json.JSONDecodeError as e:
                    logging.error(f"Failed to parse JSON from LLM response: {str(e)}")
                    logging.debug(f"JSON string attempted to parse: {json_str}")
                    return None
            
            return None
            
        except Exception as e:
            logging.error(f"Error processing with Together LLM: {str(e)}")
            return None
            
    def _extract_medicine_details_traditional(self, soup, source_name, medicine_name):
        """Traditional HTML-based extraction as fallback"""
        medicine_data = {}
        
        if source_name == "1mg":
            try:
                product_name_selectors = [
                    "h1.DrugHeader__title-content___2ZaPo",
                    "div.DrugHeader__title-container___T5ZQl h1",
                    "div.ProductTitle__product-title___3QMYH",
                    "div.style__pro-title___3jEIO"
                ]
                
                for selector in product_name_selectors:
                    name_elem = soup.select_one(selector)
                    if name_elem:
                        medicine_data["product_name"] = name_elem.text.strip()
                        break
                
                manufacturer_selectors = [
                    "div.DrugHeader__manufacturer___2Lo7m",
                    "div.ProductTitle__manufacturer___ksLyz",
                    "div.saltInfo span.saltInfo__manufacturer___2gow6",
                ]
                
                for selector in manufacturer_selectors:
                    mfr_elem = soup.select_one(selector)
                    if mfr_elem:
                        manufacturer_text = mfr_elem.text.strip()
                        if "Mfr:" in manufacturer_text:
                            manufacturer_text = manufacturer_text.replace("Mfr:", "").strip()
                        elif "Marketer" in manufacturer_text:
                            manufacturer_text = manufacturer_text.replace("Marketer", "").strip()
                        medicine_data["product_manufactured"] = manufacturer_text
                        break
                
            except Exception as e:
                logging.error(f"Error in traditional extraction for 1mg: {str(e)}")
        
        return medicine_data
