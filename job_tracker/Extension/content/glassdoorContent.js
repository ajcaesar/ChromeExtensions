chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'extractJobData') {
        let c = document.querySelector(".JobDetails_jobDetailsContainer__y9P3L");
        
        function getTextContent(selector) {
            const element = c.querySelector(selector);
            return element ? element.textContent.trim() : '';
            }
        
            // Extract the job title, company name, location, and pay range
            const jobTitle = getTextContent('.heading_Level1__soLZs');
            const companyName = getTextContent('.EmployerProfile_employerInfo__d8uSE h4');
            const location = getTextContent('.JobDetails_location__mSg5h');
            const payRange = getTextContent('.SalaryEstimate_salaryRange__brHFy');
        
            // Create a job details object
            const jobDetails = {
            jobTitle,
            companyName,
            location,
            payRange,
            };
        
            // Output the job details object to the console
            console.log(jobDetails);
        
            // Optionally return the job details object if needed for further processing
            sendResponse(jobDetails);
} return true;
});
