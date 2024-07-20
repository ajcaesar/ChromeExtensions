console.log("running ziprecruiter");

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'extractJobData') {
      const c = document.querySelector(".JobDetails_jobDetailsContainer__y9P3L");

      function getTextContent(selector) {
          const element = c.querySelector(selector);
          return element ? element.textContent.trim() : '';
      }

      const jobTitle = getTextContent('.heading_Level1__soLZs');
      const companyName = getTextContent('.EmployerProfile_employerInfo__d8uSE h4');
      const location = getTextContent('.JobDetails_location__mSg5h');
      const payRange = getTextContent('.SalaryEstimate_salaryRange__brHFy');

      const jobDetails = {
          jobTitle,
          companyName,
          location,
          payRange,
      };

      console.log(jobDetails); // Debugging output
      sendResponse(jobDetails); // Send the job details object back to the background or popup script
  }
  return true;
});
