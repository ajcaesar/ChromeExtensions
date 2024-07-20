console.log("running indeed");

// indeedContent.js
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'extractJobData') {
        let c = document.querySelector(".jobsearch-JobComponent");

        function getTextContent(selector) {
            const element = c.querySelector(selector);
            return element ? element.textContent.trim() : '';
        }

        const jobTitle = getTextContent('.jobsearch-JobInfoHeader-title');
        const companyName = getTextContent('[data-testid="inlineHeader-companyName"]');
        const location = getTextContent('[data-testid="inlineHeader-companyLocation"]');
        const payRange = getTextContent('#salaryInfoAndJobType .css-19j1a75');

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
