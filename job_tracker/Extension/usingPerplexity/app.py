from flask import Flask, request, jsonify
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.support.ui import WebDriverWait
from selenium.common.exceptions import TimeoutException, NoSuchElementException
import time
from selenium.webdriver.support import expected_conditions as EC
import subprocess

app = Flask(__name__)

def move_behind():
    # Call the AppleScript to move the browser to Desktop 2
    subprocess.run(["osascript", "move_to_desktop_2.scpt"])

def GetPerplexityResponse(prompt, chrome_driver_path):
    
    options = webdriver.ChromeOptions()
    options.add_argument('--no-sandbox')
    options.add_argument('--disable-dev-shm-usage')
    service = Service(chrome_driver_path)
    driver = webdriver.Chrome(service=service, options=options)
    try:
        driver.get("https://perplexity.ai")
        move_behind()
        element = driver.find_element(By.CSS_SELECTOR, "textarea[placeholder='Ask anything...']")
        element.send_keys(prompt)
        time.sleep(1)
        button = driver.find_element(By.CSS_SELECTOR, "button[aria-label=\'Submit\']")
        driver.execute_script("arguments[0].click();", button)
        code_element = WebDriverWait(driver, 7).until(
        EC.presence_of_element_located((By.CSS_SELECTOR, "code"))
        )
        code_text = code_element.text
        time.sleep(1.5)
        code_text = driver.find_element(By.CSS_SELECTOR, "code").text
        
        # Clean up the text
        lines = code_text.split('\n')
        cleaned_lines = [line.strip() for line in lines if line.strip()]
        cleaned_code = '\n'.join(cleaned_lines)
        return cleaned_code
        
    except TimeoutException:
        return "TimeoutException: Element not found within the given time"
    except NoSuchElementException:
        return "NoSuchElementException: Element not found"
    except Exception as e:
        return f"Exception: {str(e)}"
    finally: 
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
    return ("""JSON with jobTitle, company, location, payRange, deadline for """ + url.split("www.")[-1] + """. Code format. Strings only. Use "" if not found.""")

@app.route('/perplexity', methods=['POST'])
def perplexity():
    data = request.json
    url = data.get('url')
    chrome_driver_path = '/Users/ajcaesar/Downloads/chromedriver'
    response = GetPerplexityResponse(promptify(url), chrome_driver_path)
    print("response: " + response)
    return jsonify({'response': response})

if __name__ == '__main__':
    app.run(port=5000)
