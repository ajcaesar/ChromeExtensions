export default function extractLinkedIn() {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const activeTab = tabs[0];
      if (activeTab.url.includes('linkedin.com/jobs/view')){
        chrome.tabs.sendMessage(activeTab.id, { action: 'extractJobData' }, (response) => {
          if (response) {
            let c = document.querySelector(".details.mx-details-container-padding");
  
            function getTextContent(selector) {
              const element = c.querySelector(selector);
              return element ? element.textContent.trim() : '';
            }
  
            // Extract the job title, company name, location, and pay range
            const jobTitle = getTextContent('.top-card-layout__title');
            const companyName = getTextContent('.topcard__org-name-link.topcard__flavor--black-link');
            const location = getTextContent('[topcard__org-name-link.topcard__flavor--black-link');
            const postDate = getTextContent(".posted-time-ago__text");
  
            // // Extract the job overview and description
            // const jobOverview = getTextContent('#jobDescriptionTitleHeading');
            // const jobDescription = Array.from(c.querySelectorAll('#jobDescriptionText p'))
            //   .map(p => p.textContent.trim())
            //   .join(' ');
  
            // // Extract the principal duties and responsibilities, and qualifications
            // const duties = Array.from(c.querySelectorAll('#jobDescriptionText ul:nth-of-type(1) li'))
            //   .map(li => li.textContent.trim());
            // const qualifications = Array.from(c.querySelectorAll('#jobDescriptionText ul:nth-of-type(2) li'))
            //   .map(li => li.textContent.trim());
  
            // // Extract the required and preferred skills
            // const requiredSkills = Array.from(c.querySelectorAll('#jobDescriptionText ul:nth-of-type(3) li'))
            //   .map(li => li.textContent.trim());
            // const preferredSkills = Array.from(c.querySelectorAll('#jobDescriptionText ul:nth-of-type(4) li'))
            //   .map(li => li.textContent.trim());
  
            // Create a job details object
            const jobDetails = {
              jobTitle,
              companyName,
              location,
              postDate,
            };
  
            // Output the job details object to the console
            console.log(jobDetails);
  
            // Optionally return the job details object if needed for further processing
            return jobDetails;
          }
        });
      } else {
        alert('Not a valid page. Must be a /viewjob or /jobs page');
      }
    });
  }
  