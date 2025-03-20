chrome.action.onClicked.addListener(function(){ 
    let url = chrome.runtime.getURL('popup.html');
    chrome.tabs.create({url:url})
})