import cloudscraper

def get_perplexity_page(url, output_file):
    scraper = cloudscraper.create_scraper()
    response = scraper.get(url)
    if response.status_code == 200:
        with open(output_file, 'w', encoding='utf-8') as file:
            file.write(response.text)
        return "HTML written to file successfully"
    else:
        return f"Failed to retrieve the page. Status code: {response.status_code}"

if __name__ == "__main__":
    url = "https://perplexity.ai"
    output_file = 'perplexity_ai_page1.html'
    result = get_perplexity_page(url, output_file)
