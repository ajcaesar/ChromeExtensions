// indeedContent.js
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'extractJobData') {

      function getTextContent(selector) {
          const element = document.querySelector(selector);
          return element ? element.textContent.trim() : '';
      }

      const jobTitle = getTextContent('.job-title');
      const companyName = getTextContent('.hiring-company"]');
      const location = getTextContent('.hiring-location"]');
      const payRange = getTextContent('.t_compensation');

      const jobDetails = {
          jobTitle,
          companyName,
          location,
          payRange,
      };

      sendResponse(jobDetails);
  }
  return true;
});




// Add this function to your index.js file
export default function extractZipRecruiter() {
    let jb = {};
    chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
      const activeTab = tabs[0];
      if (activeTab.url.includes('ziprecruiter.com/jobs') || activeTab.url.includes('ziprecruiter.com/ojob')) {
        chrome.tabs.sendMessage(activeTab.id, {action: 'extractJobData'}, (response) => {
          if (response) {
            
            // Assuming you have input fields for these job details
            if (document.querySelector('.job-title')) {
              jb["title"] = document.getElementById('.job-title').textContent.trim();
            }
            if (document.querySelector('.hiring_company')) {
              jb["company"] = document.querySelector('.hiring_company').textContent.trim();
            }
            if (document.querySelector('.hiring_location')) {
              jb["location"] = document.querySelector('.hiring_location').textContent.trim();
            }
            if (document.querySelector('.t_compensation')) {
              jb["compensation"] = document.getElementById('description').textContent.trim();
            }
            return jb
          }
        });
      } else {
        alert('not a valid page. must be a /ojob or /jobs page');
      }
    });
  }

  