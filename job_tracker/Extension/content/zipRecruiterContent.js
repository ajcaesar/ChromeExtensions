
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'extractJobData') {
      console.log('executing zipr');
      const c = document.querySelector(".job_details_tile");

      function getTextContent(selector) {
          const element = c.querySelector(selector);
          return element ? element.textContent.trim() : '';
      }

      const jobTitle = getTextContent('.job_title');
      const companyName = getTextContent('.hiring_company');
      const location = getTextContent('.hiring_location');
      const payRange = getTextContent('.t_compensation');

      const jobDetails = {
          jobTitle,
          companyName,
          location,
          payRange,
      };

      console.log(jobDetails); // Debugging output
      sendResponse(jobDetails); // Send the job details object back to the background or popup script
  }
});
