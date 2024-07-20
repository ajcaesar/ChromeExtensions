// Define the script that extracts job details from a Glassdoor job posting
export default function extractGlassdoor(){

    chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
        const activeTab = tabs[0];
        if (activeTab.url.includes('glassdoor.com/job-listing') || activeTab.url.includes('glassdoor.com/Job')) {
          chrome.tabs.sendMessage(activeTab.id, {action: 'extractJobData'}, (response) => {
            if (response) {

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
                
                  // // Extract the job overview and description
                  // const jobOverview = getTextContent('.JobDetails_jobDescription__uW_fK');
                  // const jobDescription = Array.from(document.querySelectorAll('.JobDetails_jobDescription__uW_fK p'))
                  //   .map(p => p.textContent.trim())
                  //   .join(' ');
                
                  // // Extract the principal duties and responsibilities, and qualifications
                  // const duties = Array.from(document.querySelectorAll('.JobDetails_jobDescription__uW_fK ul:nth-of-type(1) li'))
                  //   .map(li => li.textContent.trim());
                  // const qualifications = Array.from(document.querySelectorAll('.JobDetails_jobDescription__uW_fK ul:nth-of-type(2) li'))
                  //   .map(li => li.textContent.trim());
                
                  // // Extract the required and preferred skills
                  // const requiredSkills = Array.from(document.querySelectorAll('.JobDetails_jobDescription__uW_fK ul:nth-of-type(3) li'))
                  //   .map(li => li.textContent.trim());
                  // const preferredSkills = Array.from(document.querySelectorAll('.JobDetails_jobDescription__uW_fK ul:nth-of-type(4) li'))
                  //   .map(li => li.textContent.trim());
                
                  // // Extract the company ratings
                  // const companyRatings = {
                  //   overall: getTextContent('.JobDetails_companyRatingGrid__0s2qc .RatingHeadline_sectionRatingScoreLeft__di1of'),
                  //   recommendToFriend: getTextContent('.JobDetails_employerStatsDonuts__uWTLY li:nth-of-type(1) text'),
                  //   approveOfCEO: getTextContent('.JobDetails_employerStatsDonuts__uWTLY li:nth-of-type(2) text'),
                  //   ratings: {
                  //     careerOpportunities: getTextContent('.JobDetails_ratingTrendList__3G4DA li:nth-of-type(1) .JobDetails_ratingScore___xSXK'),
                  //     compBenefits: getTextContent('.JobDetails_ratingTrendList__3G4DA li:nth-of-type(2) .JobDetails_ratingScore___xSXK'),
                  //     cultureValues: getTextContent('.JobDetails_ratingTrendList__3G4DA li:nth-of-type(3) .JobDetails_ratingScore___xSXK'),
                  //     seniorManagement: getTextContent('.JobDetails_ratingTrendList__3G4DA li:nth-of-type(4) .JobDetails_ratingScore___xSXK'),
                  //     workLifeBalance: getTextContent('.JobDetails_ratingTrendList__3G4DA li:nth-of-type(5) .JobDetails_ratingScore___xSXK')
                  //   }
                  // };
                
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
                  return jobDetails;
        }
        return {};
    });
    } else {
          alert('not a valid page. must be a /Job or /job-listing page');
        }
      });
    }