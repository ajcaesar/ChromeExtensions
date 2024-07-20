
const addColButton = document.getElementById("add-section");
const overlay = document.getElementById("overlay");
const newColForm = document.getElementById("new-column");
const newColDel = document.getElementById("new-col-del");
const inputs = document.getElementById("all-inputs");
let delButtons = document.querySelectorAll(".col-del-button");

const csvForm = document.getElementById("csv-title");
const csvDel = document.getElementById("csv-del");

let colNames = localStorage.getItem("colNames") ? JSON.parse(localStorage.getItem("colNames")) : [];
let colInputs = localStorage.getItem("colInputs") ? JSON.parse(localStorage.getItem("colInputs")) : {};
let colWidths = localStorage.getItem("colWidths") ? JSON.parse(localStorage.getItem("colWidths")) : {};
let items = localStorage.getItem("total-items") ? JSON.parse(localStorage.getItem("total-items")) : [];
let totalCols = localStorage.getItem("totalCols") ? JSON.parse(localStorage.getItem("totalCols")) : [...colNames];
let numItems = localStorage.getItem("numItems") ? JSON.parse(localStorage.getItem("numItems")) : 0;

let autoFill = document.getElementById("input-data-automatic");

let numItemsInput = document.getElementById("num-items");

numItemsInput.textContent =  numItems + " jobs saved";

let urlInput = document.getElementById("site-link");
const urlInputBtn = document.getElementById("input-url-in");
const saveLinkBtn = document.getElementById("save-link");
const downloadBtn = document.getElementById("download-csv");

const possibleUrls1 = ['glassdoor.com/job-listing', 'glassdoor.com/Job', 'indeed.com/viewjob', 'indeed.com/jobs', 
    'linkedin.com/jobs/view', 'ziprecruiter.com/jobs', 'ziprecruiter.com/ojob']

function setInputs() {
    colInputs = localStorage.getItem("colInputs") ? JSON.parse(localStorage.getItem("colInputs")) : {};
    let allInputs = document.querySelectorAll(".addedContainer");
    for (let input of allInputs) {
        let lab = colInputs[input.querySelector('.column-label').textContent];
        if (lab) {
            input.querySelector(".column-input").value = lab;
        }
    }
    if (colInputs['url']) {
        urlInput.value = colInputs['url'];
    }
}

function setWidths() {
    let allInputs = document.querySelectorAll(".addedContainer");
    for (let input of allInputs) {
        let colName = input.querySelector('.column-label').textContent;
        let width = colWidths[colName];
        if (width) {
            input.style.width = width;
        }
    }
}

function handleResize(entries) {
    for (let entry of entries) {
        let container = entry.target;
        let label = container.querySelector('.column-label').textContent;
        let width = container.getBoundingClientRect().width + 'px';
        colWidths[label] = width;
        localStorage.setItem("colWidths", JSON.stringify(colWidths));
        // console.log(`Updated width for ${label}: ${width}`);
    }
}

function extractTargetInfo(url) {
    // Remove the protocol
    let urlWithoutProtocol = url.replace(/(^\w+:|^)\/\//, '');
    
    // Find the part before '.com'
    let partBeforeDotCom = urlWithoutProtocol.split('.com')[0];
  
    // Find the part after the last period before '.com'
    let parts = partBeforeDotCom.split('.');
    let targetInfo = parts.length > 1 ? parts[parts.length - 1] : parts[0];
  
    return targetInfo;
  }
  

function setCurrentTabUrl() {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        urlInput.value = tabs[0].url;
        const sanitizedUrl = `"${tabs[0].url}"`;
        colInputs['url'] = sanitizedUrl;
        localStorage.setItem("colInputs", JSON.stringify(colInputs));
        if (possibleUrls1.some(substring => sanitizedUrl.includes(substring))) {
            autoFill.style.display = "block";
            autoFill.className = extractTargetInfo(sanitizedUrl);
        }
        else {
            autoFill.style.display = "none";
        }
    });
    renderNames();
    setInputs();
    setWidths();
}

const possibleUrls = [
    { regex: /linkedin\.com\/jobs\/view/, script: 'content/linkedInContent.js' },
    { regex: /glassdoor\.com\/job-listing/, script: 'content/glassdoorContent.js' },
    { regex: /glassdoor\.com\/Job/, script: 'content/glassdoorContent.js' },
    { regex: /indeed\.com\/viewjob/, script: 'content/indeedContent.js' },
    { regex: /indeed\.com\/jobs/, script: 'content/indeedContent.js' },
    { regex: /ziprecruiter\.com\/jobs/, script: 'content/zipRecruiterContent.js' },
    { regex: /ziprecruiter\.com\/ojob/, script: 'content/zipRecruiterContent.js' }
  ];
  
  function injectContentScript(url, tabId) {
    const match = possibleUrls.find(obj => obj.regex.test(url));
    if (match) {
      console.log(match.script);
      chrome.scripting.executeScript({
        target: { tabId: tabId },
        files: [match.script]
      }, () => {
        chrome.tabs.sendMessage(tabId, { action: 'extractJobData' }, (response) => {
            if (response) {
            console.log('Job data extracted:', response); // Debugging output
            colNames = Object.keys(response);
            totalCols = [...colNames];
            localStorage.setItem("colNames", JSON.stringify(colNames));
            localStorage.setItem("totalCols", JSON.stringify(totalCols));
            colInputs = Object.assign({}, response);
            colInputs['url'] = `"${url}"`;
            localStorage.setItem("colInputs", JSON.stringify(colInputs));
            renderNames();
          } else {
            console.error('No response received from content script'); // Error handling
          }
        });
      });
    } else {
      alert('Not a valid job listing page.');
    }
  }
  
  document.addEventListener('DOMContentLoaded', () => {
    setCurrentTabUrl();
    urlInputBtn.addEventListener('click', setCurrentTabUrl);
    autoFill.addEventListener("click", () => {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            const activeTab = tabs[0];
            injectContentScript(activeTab.url, activeTab.id);
        });
    });
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const activeTab = tabs[0];
    injectContentScript(activeTab.url, activeTab.id);
    });
  });

const removeCol = (event) => {
    const targetElement = event.target.closest('.container');
    const labelElement = targetElement.querySelector('.column-label');
    const colName = labelElement.textContent;
    colNames = colNames.filter(name => name !== colName);
    localStorage.setItem("colNames", JSON.stringify(colNames));
    delete colInputs[colName];
    localStorage.setItem("colInputs", JSON.stringify(colInputs));
    delete colWidths[colName];
    localStorage.setItem("colWidths", JSON.stringify(colWidths));
    renderNames();
    setInputs();
    setWidths();
}

let containers;
const renderNames = () => {
    let str = `<div class="container">
        <label class="column-label" id="url" for="site-link">url</label>
        <input class="column-input" type="text" id="site-link">
    </div>`;
    for (let col of colNames) {
        str += `<div class="container addedContainer">
        <button class="del btn btn-block btn-danger col-del-button"><i class="fas fa-trash"></i></button>
        <label class="column-label" for="${col}">${col}</label>
        <input class="column-input" type="text" id="${col}">
    </div>`;
    }
    inputs.innerHTML = str;
    containers = document.querySelectorAll(".addedContainer");
    for (let container1 of containers) {
        container1.querySelector(".column-input").addEventListener("input", addInput);
        new ResizeObserver(handleResize).observe(container1);
    }
    delButtons = document.querySelectorAll(".col-del-button");
    urlInput = document.getElementById("site-link");
    delButtons.forEach(button => {
        button.addEventListener("click", removeCol);
    });
    setInputs();
    setWidths();
};

const addInput = (event) => {
    let title = event.target.id;
    colInputs[title] = event.target.value;
    localStorage.setItem("colInputs", JSON.stringify(colInputs));
}

const csvInput = (event) => {
    event.preventDefault();
    csvForm.classList.toggle("hide");
    overlay.classList.toggle("hide");
}

function escapeCSV(value) {
    if (value.includes('"')) {
        value = value.replace(/"/g, '""');
    }
    if (value.includes(",") || value.includes("\n")) {
        value = `"${value}"`;
    }
    return value;
}

const saveToCSV = () => {
    const c = document.querySelectorAll(".addedContainer");
    let arr = [escapeCSV(document.querySelector("#site-link").value)];

    let count = 0;
    for (let r of c) {
        let i = r.querySelector(".column-label").textContent;
        while (i !== totalCols[count].trim()) {
            arr.push("");
            count += 1;
        }
        arr.push(escapeCSV(r.querySelector(".column-input").value) || "");
        count += 1;
    }
    items.push(arr);
    localStorage.setItem("total-items", JSON.stringify(items));

    // Clear inputs after saving
    colNames.forEach(col => {
        colInputs[col] = "";
    });
    colInputs["url"] = "";
    localStorage.setItem("colInputs", JSON.stringify(colInputs));
    renderNames();
    numItems += 1;
    numItemsInput.textContent = numItems + " jobs saved";
    localStorage.setItem("numItems", JSON.stringify(numItems));
};

const downloadCSV = (event) => {
    event.preventDefault();
    let csvContent = "data:text/csv;charset=utf-8,";
    let headers = totalCols;
    headers.unshift("url")
    let filled = new Array(headers.length).fill(false);

    for (let x of items) {
        for (let i=0; i < x.length; i++) {
            if(x[i].trim().length > 0) {
                filled[i] = true;
            }
        }
    }

    let filteredItems = items.map(row => 
        row.filter((_, index) => filled[index])
    );

    // Filter out empty columns from headers
    let filteredHeaders = headers.filter((_, index) => filled[index]);

    csvContent += filteredHeaders.join(",") + "\n";
    
    filteredItems.forEach(row => {
        csvContent += row.join(",") + "\n";
    });

    if (!csvContent) {
        console.log("No CSV data found in localStorage");
        return;
    }
    const csvTitle = document.getElementById("csv-title-input").value;
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${csvTitle}.csv`);
    document.body.appendChild(link); // Required for FF
    link.click(); // This will download the data file named "data.csv"
    document.body.removeChild(link);
    items = filteredItems;
    filteredHeaders.shift();
    totalCols = filteredHeaders;
    localStorage.setItem("totalCols", JSON.stringify(totalCols));
    localStorage.setItem("total-items", JSON.stringify(items));
};

saveLinkBtn.addEventListener('click', saveToCSV);
downloadBtn.addEventListener('click', csvInput);
csvForm.addEventListener("submit", downloadCSV)
csvDel.addEventListener("click", (event) => {
    event.preventDefault();
    csvForm.classList.toggle("hide");
    overlay.classList.toggle("hide");
})

// Set URL when the extension loads
document.addEventListener('DOMContentLoaded', setCurrentTabUrl);

// Set URL when the button is clicked
urlInputBtn.addEventListener('click', setCurrentTabUrl);

addColButton.addEventListener("click", (event) => {
    event.preventDefault();
    newColForm.classList.toggle("hide");
    overlay.classList.toggle("hide");
});

newColDel.addEventListener("click", (event) => {
    event.preventDefault();
    newColForm.classList.toggle("hide");
    overlay.classList.toggle("hide");
});

newColForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const colNameInput = document.getElementById("new-column-input-text");

    if (!colNameInput.value) {
        return;
    }
    colNames.push(colNameInput.value);
    totalCols.push(colNameInput.value);
    localStorage.setItem("colNames", JSON.stringify(colNames));
    localStorage.setItem("totalCols", JSON.stringify(totalCols));
    colNameInput.value = "";
    newColForm.classList.toggle("hide");
    overlay.classList.toggle("hide");
    renderNames();
});

document.getElementById("clear-csv").addEventListener("click", ()=> {
    items = [];
    localStorage.setItem("total-items", JSON.stringify([]));
    totalCols = [...colNames];
    localStorage.setItem("totalCols", JSON.stringify(totalCols));
    numItemsInput.textContent = "0 jobs saved";
    numItems = 0;
    localStorage.setItem("numItems", JSON.stringify(0));
});

