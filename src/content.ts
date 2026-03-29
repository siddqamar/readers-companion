// Content script to extract page content
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "getPageContent") {
    const bodyText = document.body.innerText;
    const title = document.title;
    sendResponse({ title, content: bodyText });
  }
  return true;
});
