from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options

def get_page_html(chrome_driver_path, output_file):
    options = Options()
    options.add_argument('--no-sandbox')
    options.add_argument('--disable-dev-shm-usage')
    options.add_argument('--headless')  # Run in headless mode
    options.add_argument('--disable-gpu')  # Disable GPU for headless mode
    
    service = Service(chrome_driver_path)
    driver = webdriver.Chrome(service=service, options=options)
    try:
        driver.get("https://perplexity.ai")
        html = driver.page_source
        with open(output_file, 'w', encoding='utf-8') as file:
            file.write(html)
        return "HTML written to file successfully"
    except Exception as e:
        return f"Exception: {str(e)}"
    finally:
        driver.quit()  # Ensure the driver is closed

if __name__ == "__main__":
    chrome_driver_path = '/Users/ajcaesar/Downloads/chromedriver'
    output_file = 'perplexity_ai_page.html'
    result = get_page_html(chrome_driver_path, output_file)
    print(result)
