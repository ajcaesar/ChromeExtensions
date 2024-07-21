from flask import Flask, request, jsonify
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.support.ui import WebDriverWait
from selenium.common.exceptions import TimeoutException
import time
import pyperclip
from selenium.webdriver.support import expected_conditions as EC

app = Flask(__name__)

def GetPerplexityResponse(prompt, chrome_driver_path, max_retries=1, headless=False):
    options = webdriver.ChromeOptions()
    if headless:
        options.add_argument('--headless')
    service = Service(chrome_driver_path)
    driver = webdriver.Chrome(service=service, options=options)
    try:
        driver.get("https://perplexity.ai")
        element = driver.find_element(By.CSS_SELECTOR, "textarea[placeholder='Ask anything...']")
        element.send_keys(prompt)
        time.sleep(1)
        button = driver.find_element(By.CSS_SELECTOR, "button[aria-label=\'Submit\']")
        driver.execute_script("arguments[0].click();", button)
        code_element = WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((By.CSS_SELECTOR, "code"))
        )
        code_text = code_element.text
        

        # Clean up the text
        lines = code_text.split('\n')
        cleaned_lines = [line.strip() for line in lines if line.strip()]
        cleaned_code = '\n'.join(cleaned_lines)
        return cleaned_code
    
    except Exception as e:
        print(Exception)
        return "null"
    driver.close()

def string_to_dict(input_string):
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

def promptify (url):
    return ("""get json of just location, company, jobTitle, compensation for """ + url.split("www.")[-1] + " . data as strings")

@app.route('/perplexity', methods=['POST'])
def perplexity():
    data = request.json
    url = data.get('url')
    chrome_driver_path = '/Users/ajcaesar/Downloads/chromedriver'
    response = GetPerplexityResponse(promptify(url), chrome_driver_path, headless=False)
    print("response: " + response)
    return jsonify({'response': response})

if __name__ == '__main__':
    app.run(port=5000)
