(() => {
  const allowedPage = location.hostname;
  window.addEventListener('message', (event) => {
    if (event.source !== window || !event.data || !['SSLC_FOCUS_START','SSLC_FOCUS_END','SSLC_FOCUS_PING'].includes(event.data.type)) return;
    chrome.runtime.sendMessage({
      type: event.data.type,
      sites: Array.isArray(event.data.sites) ? event.data.sites : [],
      pageHost: allowedPage,
      endAt: event.data.endAt
    });
  });
  chrome.runtime.sendMessage({ type: 'SSLC_EXTENSION_HELLO' });
  chrome.runtime.onMessage.addListener((message) => {
    if (message?.type === 'SSLC_EXTENSION_READY') window.postMessage({ type: 'SSLC_EXTENSION_READY' }, '*');
  });
})();
