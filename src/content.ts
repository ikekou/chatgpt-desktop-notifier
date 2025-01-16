import { playNotificationSound } from './utils/sound';

interface NotificationSettings {
  soundEnabled: boolean;
  desktopEnabled: boolean;
}

// 設定の初期値
let settings: NotificationSettings = {
  soundEnabled: true,
  desktopEnabled: true,
};

// 設定を読み込む
chrome.storage.sync.get(['soundEnabled', 'desktopEnabled'], (result) => {
  settings = {
    soundEnabled: result.soundEnabled ?? true,
    desktopEnabled: result.desktopEnabled ?? true,
  };
});

// 設定変更を監視
chrome.storage.onChanged.addListener((changes) => {
  if (changes.soundEnabled) {
    settings.soundEnabled = changes.soundEnabled.newValue;
  }
  if (changes.desktopEnabled) {
    settings.desktopEnabled = changes.desktopEnabled.newValue;
  }
});

// ChatGPTの応答を監視する関数
function observeChatGPTResponse() {
  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
        const lastNode = mutation.addedNodes[mutation.addedNodes.length - 1];
        if (lastNode instanceof HTMLElement && 
            lastNode.classList.contains('markdown') && 
            !lastNode.classList.contains('notified')) {
          
          // 通知済みとしてマーク
          lastNode.classList.add('notified');

          // 応答テキストを取得（最初の100文字）
          const responseText = lastNode.textContent?.slice(0, 100) ?? 'New response from ChatGPT';

          console.log('🤖 ChatGPT応答を検出しました:', {
            timestamp: new Date().toISOString(),
            preview: responseText,
            notificationSettings: {
              sound: settings.soundEnabled,
              desktop: settings.desktopEnabled
            }
          });

          // 通知を送信
          if (settings.desktopEnabled) {
            chrome.runtime.sendMessage({
              type: 'SHOW_NOTIFICATION',
              text: responseText
            });
          }

          // 音声通知
          if (settings.soundEnabled) {
            playNotificationSound();
          }
        }
      }
    }
  });

  // メインのチャットコンテナを監視
  const chatContainer = document.querySelector('main');
  if (chatContainer) {
    observer.observe(chatContainer, {
      childList: true,
      subtree: true
    });
    console.log('🔍 ChatGPTの応答監視を開始しました');
  }
}

// ページ読み込み完了時に監視を開始
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', observeChatGPTResponse);
} else {
  observeChatGPTResponse();
}