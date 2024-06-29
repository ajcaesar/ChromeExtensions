const addColButton = document.getElementById("add-section");
const overlay = document.getElementById("overlay");
const newColForm = document.getElementById("new-column");
const newColDel = document.getElementById("new-col-del");
const inputs = document.getElementById("all-inputs");
let delButtons = document.querySelectorAll(".col-del-button");

let colNames = JSON.parse(localStorage.getItem("colNames")) || [];
let colInputs = JSON.parse(localStorage.getItem("colInputs")) || {};

let urlInput = document.getElementById("site-link");
const urlInputBtn = document.getElementById("input-url-in");

function setInputs() {
   colInputs = JSON.parse(localStorage.getItem("colInputs")) || {};
   let allInputs =  document.querySelectorAll(".addedContainer");
   for (let input of allInputs) {
        let lab = colInputs[input.querySelector('.column-label').textContent];
        if(lab) {
            input.querySelector(".column-input").value = lab;
        }
   }
}

// Function to get and set the current tab's URL
function setCurrentTabUrl() {
    // Check if Chrome API is available
    if (chrome && chrome.tabs) {
        console.log('set in place')
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            if (tabs[0] && tabs[0].url) {
                urlInput.value = tabs[0].url;
            }
        });
    } else {
        console.log("Chrome API not available. Are you testing in a browser?");
    }
    renderNames();
    setInputs();
}

// ... rest of your code
const removeCol = (event) => {
    const targetElement = event.target.closest('.container');
    const labelElement = targetElement.querySelector('.column-label');
    const colName = labelElement.textContent;
    colNames = colNames.filter(name => name !== colName);
    localStorage.setItem("colNames", JSON.stringify(colNames));
    delete colInputs.colName;
    localStorage.setItem("colInputs", JSON.stringify(colInputs));
    renderNames();
    setInputs();
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
    }
    delButtons = document.querySelectorAll(".col-del-button");
    urlInput = document.getElementById("site-link");
    delButtons.forEach(button => {
        button.addEventListener("click", removeCol);
    });
    setInputs();
};

const addInput = (event) => {
    let title = event.target.id;
    colInputs[title] = event.target.value;
    localStorage.setItem("colInputs", JSON.stringify(colInputs));
}

const saveToSpreadsheet = (event) => {
    return;
}

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



