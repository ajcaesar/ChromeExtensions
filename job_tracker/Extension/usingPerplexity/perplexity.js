chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'getPerplexityResponse') {
        fetch('http://127.0.0.1:5000/perplexity', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                url: request.prompt,
            }),
        })
        .then(response => response.json())
        .then(data => sendResponse({response: data.response}))
        .catch(error => sendResponse({error: error.toString()}));// Will respond asynchronously
    }
    return true;
});