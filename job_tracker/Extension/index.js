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

// Function to get and set the current tab's URL
function setCurrentTabUrl() {
    // Check if Chrome API is available
    if (chrome && chrome.tabs) {
        console.log('set in place');
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
    setWidths();
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


// At the beginning of your file
const signInButton = document.getElementById('signin');
let isSignedIn = false;

function checkSignInStatus() {
    chrome.identity.getAuthToken({ interactive: false }, function(token) {
      if (chrome.runtime.lastError) {
        console.log('Not signed in');
        updateSignInButton(false);
        chooseSpreadsheetButton.style.display = 'none';
      } else {
        console.log('Signed in');
        isSignedIn = true;
        oauthToken = token;
        updateSignInButton(true);
        chooseSpreadsheetButton.style.display = 'inline-block';
        fetchUserInfo(token);
      }
    });
  }

// Function to update button text and functionality
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

// Modified sign-in function
function signIn() {
  chrome.identity.getAuthToken({ interactive: true }, function(token) {
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

// New sign-out function
function signOut() {
  chrome.identity.getAuthToken({ interactive: false }, function(token) {
    if (!chrome.runtime.lastError) {
      // Revoke token
      fetch(`https://accounts.google.com/o/oauth2/revoke?token=${token}`)
        .then(() => {
          chrome.identity.removeCachedAuthToken({ token: token }, function() {
            console.log('Signed out successfully');
            isSignedIn = false;
            updateSignInButton(false);
          });
        })
        .catch(error => console.error('Error revoking token:', error));
    }
  });
}

// Function to fetch user info (unchanged)
function fetchUserInfo(token) {
  fetch('https://www.googleapis.com/oauth2/v1/userinfo?alt=json', {
    headers: {
      Authorization: 'Bearer ' + token
    }
  })
  .then(response => response.json())
  .then(data => {
    console.log('User info:', data);
    // Here you can update your UI with the user's information
  })
  .catch(error => console.error('Error fetching user info:', error));
}

// Call this function when the extension loads
document.addEventListener('DOMContentLoaded', checkSignInStatus);

// Remove the old event listener
// signInButton.addEventListener('click', signIn);

const chooseSpreadsheetButton = document.getElementById('chooseSpreadsheet');
let pickerApiLoaded = false;
let oauthToken;

function loadPickerApi() {
  gapi.load('picker', {'callback': onPickerApiLoad});
}

function onPickerApiLoad() {
  pickerApiLoaded = true;
  createPicker();
}

function createPicker() {
  if (pickerApiLoaded && oauthToken) {
    const picker = new google.picker.PickerBuilder()
      .addView(google.picker.ViewId.SPREADSHEETS)
      .setOAuthToken(oauthToken)
      .setDeveloperKey('YOUR_DEVELOPER_KEY') // Replace with your actual developer key
      .setCallback(pickerCallback)
      .build();
    picker.setVisible(true);
  }
}

function pickerCallback(data) {
  if (data[google.picker.Response.ACTION] == google.picker.Action.PICKED) {
    const doc = data[google.picker.Response.DOCUMENTS][0];
    const spreadsheetId = doc[google.picker.Document.ID];
    const spreadsheetUrl = doc[google.picker.Document.URL];
    console.log('The user selected: ' + spreadsheetUrl);
    // Here you can save the spreadsheetId or URL for later use
    // For example, you might want to store it in chrome.storage
    chrome.storage.sync.set({selectedSpreadsheetId: spreadsheetId}, function() {
      console.log('Spreadsheet ID saved');
    });
  }
}

// Add an event listener for the Choose Spreadsheet button
chooseSpreadsheetButton.addEventListener('click', function() {
  if (!pickerApiLoaded) {
    loadPickerApi();
  } else {
    createPicker();
  }
});