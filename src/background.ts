// 通知IDを生成する関数
function generateNotificationId(): string {
  return `chatgpt-notification-${Date.now()}`;
}

// 通知を表示する関数
function showNotification(text: string) {
  const notificationId = generateNotificationId();
  chrome.notifications.create(notificationId, {
    type: 'basic',
    iconUrl: chrome.runtime.getURL('icon128.png'),
    title: 'ChatGPT Response',
    message: text,
    priority: 2
  });

  // 5秒後に通知を自動的に閉じる
  setTimeout(() => {
    chrome.notifications.clear(notificationId);
  }, 5000);
}

// content scriptからのメッセージを受け取る
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'SHOW_NOTIFICATION') {
    showNotification(message.text);
  }
  return true;
});