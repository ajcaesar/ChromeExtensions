const addColButton = document.getElementById("add-section");
const overlay = document.getElementById("overlay");
const newColForm = document.getElementById("new-column");
const newColDel = document.getElementById("new-col-del");
const inputs = document.getElementById("all-inputs");
let delButtons = document.querySelectorAll(".col-del-button");

let colNames = JSON.parse(localStorage.getItem("colNames")) || [];
let colInputs = JSON.parse(localStorage.getItem("colInputs")) || {};
let colWidths = JSON.parse(localStorage.getItem("colWidths")) || {};

let urlInput = document.getElementById("site-link");
const urlInputBtn = document.getElementById("input-url-in");
const spreadsheetUrlInput = document.getElementById("spreadsheet-url");
const saveLinkButton = document.getElementById("save-link");

function setInputs() {
    colInputs = JSON.parse(localStorage.getItem("colInputs")) || {};
    let allInputs = document.querySelectorAll(".addedContainer");
    for (let input of allInputs) {
        let lab = colInputs[input.querySelector('.column-label').textContent];
        if (lab) {
            input.querySelector(".column-input").value = lab;
        }
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
        let width = container.getBoundingClientRect().width + 'px'; // Ensure we get the width in pixels
        colWidths[label] = width;
        localStorage.setItem("colWidths", JSON.stringify(colWidths));
        console.log(`Updated width for ${label}: ${width}`);
    }
}

function setCurrentTabUrl() {
    if (chrome && chrome.tabs) {
        console.log('set in place');
        chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
            if (tabs[0] && tabs[0].url) {
                urlInput.value = tabs[0].url;
            }
        });
    } else {
        console.log("Chrome API not available. Are you testing in a browser?");
    }
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
        <label class="column-label" id="url" for="site-link">URL</label>
        <input class="column-input" type="text" id="site-link">
    </div>`;
    for (let col of colNames) {
        str += `<div class="container addedContainer">
        <button class="del btn btn-block btn-danger col-del-button"><i class="fas fa-trash"></i></button>
        <label class="column-label" for="${col}">${col}</label>
        <input class="column-input" type="text" id="${col}">
    </div>`;
    }
    str += `<div class="container">
        <input class="column-input" type="text" id="spreadsheet-url">
    </div>`;
    inputs.innerHTML = str;
    containers = document.querySelectorAll(".addedContainer");
    for (let container of containers) {
        container.querySelector(".column-input").addEventListener("input", addInput);
        new ResizeObserver(handleResize).observe(container);
    }
    delButtons = document.querySelectorAll(".col-del-button");
    urlInput = document.getElementById("site-link");
    spreadsheetUrlInput = document.getElementById("spreadsheet-url");
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

const saveToSpreadsheet = (event) => {
    event.preventDefault();
    const spreadsheetUrl = spreadsheetUrlInput.value;
    const data = {
        url: urlInput.value,
        ...colInputs
    };
    
    // Parse the spreadsheet ID from the URL
    const spreadsheetId = spreadsheetUrl.split('/d/')[1].split('/')[0];
    
    // Use Google Sheets API to save data to the spreadsheet
    if (isSignedIn) {
        gapi.client.sheets.spreadsheets.values.append({
            spreadsheetId: spreadsheetId,
            range: 'Sheet1!A1', // Adjust the range according to your needs
            valueInputOption: 'RAW',
            resource: {
                values: [
                    Object.values(data)
                ]
            }
        }).then(response => {
            console.log('Data saved to spreadsheet:', response);
        }, error => {
            console.error('Error saving data to spreadsheet:', error);
        });
    } else {
        console.log('User is not signed in.');
    }
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

const signInButton = document.getElementById('signin');
let isSignedIn = false;

function checkSignInStatus() {
    chrome.identity.getAuthToken({ interactive: false }, function (token) {
        if (chrome.runtime.lastError) {
            console.log('Not signed in');
            updateSignInButton(false);
        } else {
            console.log('Signed in');
            isSignedIn = true;
            oauthToken = token;
            updateSignInButton(true);
            fetchUserInfo(token);
        }
    });
}

function updateSignInButton(signedIn) {
    if (signedIn) {
        signInButton.textContent = 'Sign out';
        signInButton.removeEventListener('click', signIn);
        signInButton.addEventListener('click', signOut);
    } else {
        signInButton.textContent = 'Sign in with Google';
        signInButton.removeEventListener('click', signOut);
        signInButton.addEventListener('click', signIn);
    }
}

function signIn() {
    chrome.identity.getAuthToken({ interactive: true }, function (token) {
        if (chrome.runtime.lastError) {
            console.error(chrome.runtime.lastError);
        } else {
            console.log('Signed in successfully. Token:', token);
            isSignedIn = true;
            updateSignInButton(true);
            fetchUserInfo(token);
        }
    });
}

function signOut() {
    chrome.identity.getAuthToken({ interactive: false }, function (token) {
        if (!chrome.runtime.lastError) {
            fetch(`https://accounts.google.com/o/oauth2/revoke?token=${token}`)
                .then(() => {
                    chrome.identity.removeCachedAuthToken({ token: token }, function () {
                        console.log('Signed out successfully');
                        isSignedIn = false;
                        updateSignInButton(false);
                    });
                })
                .catch(error => console.error('Error revoking token:', error));
        }
    });
}

function fetchUserInfo(token) {
    fetch('https://www.googleapis.com/oauth2/v1/userinfo?alt=json', {
        headers: {
            Authorization: 'Bearer ' + token
        }
    })
        .then(response => response.json())
        .then(data => {
            console.log('User info:', data);
        })
        .catch(error => console.error('Error fetching user info:', error));
}

document.addEventListener('DOMContentLoaded', checkSignInStatus);
saveLinkButton.addEventListener('click', saveToSpreadsheet);
