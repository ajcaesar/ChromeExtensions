const addColButton = document.getElementById("add-section");
const overlay = document.getElementById("overlay");
const newColForm = document.getElementById("new-column");
const newColDel = document.getElementById("new-col-del");
const inputs = document.getElementById("all-inputs");
let delButtons = document.querySelectorAll(".col-del-button");

const csvForm = document.getElementById("csv-title");
const csvDel = document.getElementById("csv-del");

let colNames = JSON.parse(localStorage.getItem("colNames")) || [];
let colInputs = JSON.parse(localStorage.getItem("colInputs")) || {};
let colWidths = JSON.parse(localStorage.getItem("colWidths")) || {};

let urlInput = document.getElementById("site-link");
const urlInputBtn = document.getElementById("input-url-in");
const saveLinkBtn = document.getElementById("save-link");
const downloadBtn = document.getElementById("download-csv");

function setInputs() {
    colInputs = JSON.parse(localStorage.getItem("colInputs")) || {};
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
        console.log(`Updated width for ${label}: ${width}`);
    }
}

function setCurrentTabUrl() {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        urlInput.value = tabs[0].url;
        const sanitizedUrl = `"${tabs[0].url}"`;
        colInputs['url'] = sanitizedUrl;
        localStorage.setItem("colInputs", JSON.stringify(colInputs));
    });
    renderNames();
    setInputs();
    setWidths();
}

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
    for (let container of containers) {
        container.querySelector(".column-input").addEventListener("input", addInput);
        new ResizeObserver(handleResize).observe(container);
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

const saveToCSV = () => {
    let csvContent = "data:text/csv;charset=utf-8,";
    let headers = ["Column", "Input"];
    let rows = [["url", colInputs["url"] || ""]]; // Include URL row

    colNames.forEach(col => {
        rows.push([col, colInputs[col] || ""]);
    });

    csvContent += headers.join(",") + "\n";
    rows.forEach(row => {
        csvContent += row.join(",") + "\n";
    });

    localStorage.setItem("csvData", csvContent);
    console.log("CSV saved to localStorage");

    // Clear inputs after saving
    colNames.forEach(col => {
        colInputs[col] = "";
    });
    colInputs["url"] = "";
    localStorage.setItem("colInputs", JSON.stringify(colInputs));
    renderNames();
};

const downloadCSV = () => {
    let csvContent = localStorage.getItem("csvData");
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
    localStorage.setItem("colNames", JSON.stringify(colNames));
    colNameInput.value = "";
    newColForm.classList.toggle("hide");
    overlay.classList.toggle("hide");
    renderNames();
});

document.getElementById("clear-csv").addEventListener("click", ()=> {
    localStorage.setItem("csvData", "");
});


