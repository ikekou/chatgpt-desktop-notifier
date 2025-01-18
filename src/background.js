// 通知IDを生成する関数
function generateNotificationId() {
  return `chatgpt-notification-${Date.now()}`;
}

// 通知を表示する関数
function showNotification(text) {
  const notificationId = generateNotificationId();

  try {
    chrome.notifications.create(notificationId, {
      iconUrl: 'icons/icon128.png',
      type: 'basic',
      title: 'ChatGPT Response',
      message: text
    }, (createdId) => {
      if (chrome.runtime.lastError) {
        console.error('❌ 通知の作成に失敗しました:', chrome.runtime.lastError);
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
    console.error('❌ 予期せぬエラーが発生しました:', error);
  }
}

// content scriptからのメッセージを受け取る
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'SHOW_NOTIFICATION') {
    showNotification(message.text);
    sendResponse({ success: true });
  } else {
    sendResponse({ success: false, error: 'Unknown message type' });
  }
  
  return true; // 非同期レスポンスのために必要
});