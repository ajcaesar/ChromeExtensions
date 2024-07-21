import cloudscraper
from flask import Flask, request, jsonify
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.support.ui import WebDriverWait
from selenium.common.exceptions import TimeoutException, NoSuchElementException
from selenium.webdriver.support import expected_conditions as EC
import time
import subprocess

app = Flask(__name__)

def move_behind():
    # Call the AppleScript to move the browser to Desktop 2
    subprocess.run(["osascript", "move_to_desktop_2.scpt"])

def get_perplexity_page(url):
    print(f"Fetching page content from: {url}")
    scraper = cloudscraper.create_scraper()
    response = scraper.get(url)
    if response.status_code == 200:
        print("Page content retrieved successfully")
        return response.text
    else:
        print(f"Failed to retrieve page content. Status code: {response.status_code}")
        return None

def GetPerplexityResponse(prompt, chrome_driver_path, initial_content):
    print("Setting up ChromeDriver")
    options = webdriver.ChromeOptions()
    options.add_argument('--no-sandbox')
    options.add_argument('--disable-dev-shm-usage')
    options.add_argument('--headless')  # Run headless
    service = Service(chrome_driver_path)
    driver = webdriver.Chrome(service=service, options=options)
    try:
        print("Loading initial content into ChromeDriver")
        driver.get("data:text/html;charset=utf-8," + initial_content)
        move_behind()
        print("Locating the input element for prompt")
        element = driver.find_element(By.CSS_SELECTOR, "textarea[placeholder='Ask anything...']")
        element.send_keys(prompt)
        time.sleep(1)
        print("Clicking the submit button")
        button = driver.find_element(By.CSS_SELECTOR, "button[aria-label='Submit']")
        driver.execute_script("arguments[0].click();", button)
        print("Waiting for response code element")
        code_element = WebDriverWait(driver, 7).until(
            EC.presence_of_element_located((By.CSS_SELECTOR, "code"))
        )
        code_text = code_element.text
        time.sleep(1.5)
        code_text = driver.find_element(By.CSS_SELECTOR, "code").text
        
        # Clean up the text
        print("Cleaning up the response text")
        lines = code_text.split('\n')
        cleaned_lines = [line.strip() for line in lines if line.strip()]
        cleaned_code = '\n'.join(cleaned_lines)
        print("Response received and cleaned successfully")
        return cleaned_code
        
    except TimeoutException:
        print("Timeout exception occurred")
        return "TimeoutException: Element not found within the given time"
    except NoSuchElementException:
        print("NoSuchElementException occurred")
        return "NoSuchElementException: Element not found"
    except Exception as e:
        print(f"An exception occurred: {str(e)}")
        return f"Exception: {str(e)}"
    finally:
        print("Closing the ChromeDriver")
        driver.quit()
    
def string_to_dict(input_string):
    print("Converting string to dictionary")
    # Remove curly braces and split the string into lines
    lines = input_string.strip('{}').strip().split('\n')
    
    # Create a dictionary to store the key-value pairs
    data = {}
    
    for line in lines:
        # Split each line into key and value
        key, value = line.split(':', 1)
        
        # Remove quotation marks and whitespace
        key = key.strip().strip('"')
        value = value.strip().strip(',').strip()
        
        # Convert "null" to None, otherwise keep the value as is
        if value.lower() == 'null':
            value = None
        elif value.startswith('"') and value.endswith('"'):
            value = value.strip('"')
        
        # Add to the dictionary
        data[key] = value
    
    return data

def promptify(url):
    print(f"Generating prompt for URL: {url}")
    return f"get json of just location, company, jobTitle, payRange, deadline for {url.split('www.')[-1]} . data as strings. json as code, no text. none if not found"

@app.route('/perplexity', methods=['POST'])
def perplexity():
    data = request.json
    url = data.get('url')
    print(f"Received URL: {url}")
    chrome_driver_path = '/Users/ajcaesar/Downloads/chromedriver'
    
    # Get initial content using cloudscraper
    initial_content = get_perplexity_page(url)
    if not initial_content:
        print("Failed to retrieve initial content")
        return jsonify({'response': 'Failed to retrieve initial content'}), 500
    
    response = GetPerplexityResponse(promptify(url), chrome_driver_path, initial_content)
    print(f"Response: {response}")
    return jsonify({'response': response})

if __name__ == '__main__':
    print("Starting Flask app")
    app.run(port=5000)
