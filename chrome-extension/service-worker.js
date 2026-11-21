const BLOCK_RULE_ID = 1000;
const ALLOW_START = 1001;
const clean = (value) => String(value || '').toLowerCase().trim().replace(/^https?:\/\//, '').split('/')[0].replace(/^www\./, '');
async function activate(sites, pageHost, endAt) {
  const domains = [...new Set([...sites, pageHost].map(clean).filter(v => /^(localhost|\d{1,3}(?:\.\d{1,3}){3}|[a-z0-9.-]+\.[a-z]{2,})$/.test(v)))];
  const old = await chrome.declarativeNetRequest.getDynamicRules();
  await chrome.declarativeNetRequest.updateDynamicRules({
    removeRuleIds: old.map(rule => rule.id),
    addRules: [
      { id: BLOCK_RULE_ID, priority: 1, action: { type: 'block' }, condition: { regexFilter: '^https?://', resourceTypes: ['main_frame','sub_frame','stylesheet','script','image','font','object','xmlhttprequest','ping','media','websocket','other'] } },
      ...domains.map((domain, index) => ({ id: ALLOW_START + index, priority: 2, action: { type: 'allow' }, condition: { requestDomains: [domain], resourceTypes: ['main_frame','sub_frame','stylesheet','script','image','font','object','xmlhttprequest','ping','media','websocket','other'] } }))
    ]
  });
  await chrome.storage.local.set({ focusGuardActive: true, allowedDomains: domains, focusEndAt: endAt || 0 });
  await chrome.alarms.clear('study-focus-end');
  if (endAt && endAt > Date.now()) chrome.alarms.create('study-focus-end', { when: endAt });
}
async function deactivate() {
  const rules = await chrome.declarativeNetRequest.getDynamicRules();
  await chrome.declarativeNetRequest.updateDynamicRules({ removeRuleIds: rules.map(rule => rule.id) });
  await chrome.alarms.clear('study-focus-end');
  await chrome.storage.local.set({ focusGuardActive: false, allowedDomains: [], focusEndAt: 0 });
}
chrome.runtime.onMessage.addListener((message, sender) => {
  if (message?.type === 'SSLC_FOCUS_START') activate(message.sites || [], message.pageHost || new URL(sender.url).hostname, message.endAt);
  if (message?.type === 'SSLC_FOCUS_END') deactivate();
  if (message?.type === 'SSLC_EXTENSION_HELLO') chrome.tabs.sendMessage(sender.tab.id, { type: 'SSLC_EXTENSION_READY' }).catch(() => {});
});

chrome.alarms.onAlarm.addListener((alarm) => { if (alarm.name === 'study-focus-end') deactivate(); });
