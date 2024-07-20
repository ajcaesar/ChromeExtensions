console.log("running linkedin");

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'extractJobData') {
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
        sendResponse(jobDetails);
        }
    });
  