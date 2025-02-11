interface NotificationMessage {
  type: 'SHOW_NOTIFICATION';
  text: string;
}

interface NotificationResponse {
  success: boolean;
  error?: string;
}

// 通知IDを生成する関数
function generateNotificationId(): string {
  return `chatgpt-notification-${Date.now()}`;
}

// 通知を表示する関数
function showNotification(text: string): void {
  const notificationId = generateNotificationId();

  try {
    chrome.notifications.create(notificationId, {
      iconUrl: 'icons/icon128.png',
      type: 'basic',
      title: 'ChatGPT Response',
      message: text
    }, (createdId) => {
      if (chrome.runtime.lastError) {
        console.error('❌ Failed to create notification:', chrome.runtime.lastError);
      }
    });

    // 設定された待ち時間後に通知を自動的に閉じる
    chrome.storage.sync.get(['waitTime'], (result) => {
      const waitTime = (result.waitTime ?? 5) * 1000; // ミリ秒に変換
      setTimeout(() => {
        chrome.notifications.clear(notificationId);
      }, waitTime);
    });

  } catch (error) {
    console.error('❌ An unexpected error occurred:', error);
  }
}

// content scriptからのメッセージを受け取る
chrome.runtime.onMessage.addListener((
  message: NotificationMessage,
  sender: chrome.runtime.MessageSender,
  sendResponse: (response: NotificationResponse) => void
) => {
  if (message.type === 'SHOW_NOTIFICATION') {
    showNotification(message.text);
    sendResponse({ success: true });
  } else {
    sendResponse({ success: false, error: 'Unknown message type' });
  }
  
  return true; // 非同期レスポンスのために必要
});