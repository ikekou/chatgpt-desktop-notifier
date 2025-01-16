// 通知IDを生成する関数
function generateNotificationId(): string {
  return `chatgpt-notification-${Date.now()}`;
}

// 通知を表示する関数
function showNotification(text: string) {
  console.log('📣 通知を作成します:', text);
  
  const notificationId = generateNotificationId();
  console.log('🏷 生成された通知ID:', notificationId);

  try {
    chrome.notifications.create(notificationId, {
      type: 'basic',
      iconUrl: chrome.runtime.getURL('icons/icon128.png'),
      title: 'ChatGPT Response',
      message: text,
      priority: 2
    }, (createdId) => {
      if (chrome.runtime.lastError) {
        console.error('❌ 通知の作成に失敗しました:', chrome.runtime.lastError);
      } else {
        console.log('✅ 通知が正常に作成されました。ID:', createdId);
      }
    });

    // 5秒後に通知を自動的に閉じる
    setTimeout(() => {
      chrome.notifications.clear(notificationId, (wasCleared) => {
        console.log(`🧹 通知のクリア ${wasCleared ? '成功' : '失敗'}:`, notificationId);
      });
    }, 5000);

  } catch (error) {
    console.error('❌ 予期せぬエラーが発生しました:', error);
  }
}

// content scriptからのメッセージを受け取る
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('📨 メッセージを受信しました:', message);
  
  if (message.type === 'SHOW_NOTIFICATION') {
    console.log('🎯 SHOW_NOTIFICATION メッセージを処理します');
    showNotification(message.text);
    sendResponse({ success: true });
  } else {
    console.log('⚠️ 未知のメッセージタイプです:', message.type);
    sendResponse({ success: false, error: 'Unknown message type' });
  }
  
  return true; // 非同期レスポンスのために必要
});