// 通知IDを生成する関数
function generateNotificationId() {
  return `chatgpt-notification-${Date.now()}`;
}

// 通知を表示する関数
function showNotification(text) {
  console.log('📣 通知を作成します:', text);
  
  const notificationId = generateNotificationId();
  console.log('🏷 生成された通知ID:', notificationId);

  try {
    chrome.notifications.create(notificationId, {
      iconUrl: 'icons/icon128.png',
      type: 'basic',
      title: 'ChatGPT Response',
      message: text
    }, (createdId) => {
      if (chrome.runtime.lastError) {
        console.error('❌ 通知の作成に失敗しました:', chrome.runtime.lastError);
      } else {
        console.log('✅ 通知が正常に作成されました。ID:', createdId);
      }
    });

    // 設定された待ち時間後に通知を自動的に閉じる
    chrome.storage.sync.get(['waitTime'], (result) => {
      const waitTime = (result.waitTime ?? 5) * 1000; // ミリ秒に変換
      console.log(`⏱ 通知を ${waitTime/1000} 秒後に閉じます`);
      
      setTimeout(() => {
        chrome.notifications.clear(notificationId, (wasCleared) => {
          console.log(`🧹 通知のクリア ${wasCleared ? '成功' : '失敗'}:`, notificationId);
        });
      }, waitTime);
    });

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