import { playNotificationSound } from './utils/sound';

interface Settings {
  soundEnabled: boolean;
  desktopEnabled: boolean;
  waitTime: number;
  completionDelay: number;
}

interface StorageChanges {
  [key: string]: chrome.storage.StorageChange;
}

(function() {
  // デバッグモード
  const DEBUG = false;

  // 状態管理
  let isGenerating = false;       // ChatGPTが応答生成中かどうか
  let lastResponseTime = 0;       // 最後に応答(メッセージ)を検知した時刻
  let messageObserver: MutationObserver | null = null;     // メッセージ用MutationObserver
  let buttonObserver: MutationObserver | null = null;      // 送信ボタン用MutationObserver

  // デバッグ用ログ関数
  function debugLog(category: string, message: string, data?: any): void {
    if (!DEBUG) return;
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] [${category}] ${message}`, data || '');
  }

  // 設定の初期値
  let settings: Settings = {
    soundEnabled: true,
    desktopEnabled: true,
    waitTime: 5, // 通知表示時間のデフォルト5秒
    completionDelay: 2, // 応答完了判定の待ち時間のデフォルト2秒
  };

  // 設定を読み込む
  chrome.storage.sync.get(['soundEnabled', 'desktopEnabled', 'waitTime', 'completionDelay'], (result) => {
    settings = {
      soundEnabled: result.soundEnabled ?? true,
      desktopEnabled: result.desktopEnabled ?? true,
      waitTime: result.waitTime ?? 5,
      completionDelay: result.completionDelay ?? 2,
    };
  });

  // 設定変更を監視
  chrome.storage.onChanged.addListener((changes: StorageChanges) => {
    if (changes.soundEnabled) {
      settings.soundEnabled = changes.soundEnabled.newValue;
    }
    if (changes.desktopEnabled) {
      settings.desktopEnabled = changes.desktopEnabled.newValue;
    }
    if (changes.completionDelay) {
      settings.completionDelay = changes.completionDelay.newValue;
    }
  });

  /**
   * チャットメッセージの変化を監視し、完了を検知したら通知を行う
   */
  function createMessageObserver(): void {
    // すでにオブザーバーが作成済みなら一度disconnectする
    if (messageObserver) {
      messageObserver.disconnect();
    }

    messageObserver = new MutationObserver((mutations) => {
      debugLog('MessageObserver', 'Mutation detected', {
        mutationsCount: mutations.length,
        isGenerating
      });

      if (!isGenerating) {
        debugLog('MessageObserver', 'Skipped: Not generating');
        return;
      }

      const messages = document.querySelectorAll('[data-message-author-role="assistant"]');
      debugLog('MessageObserver', 'Assistant messages found', {
        count: messages.length
      });

      if (!messages.length) return;

      const lastMessage = messages[messages.length - 1];
      if (!lastMessage) return;

      const prevResponseTime = lastResponseTime;
      lastResponseTime = Date.now();
      
      debugLog('MessageObserver', 'Message updated', {
        messageText: lastMessage.textContent?.slice(0, 50),
        timeSinceLastUpdate: lastResponseTime - prevResponseTime
      });
    });

    // ChatGPTのメッセージリストに該当しそうな要素を探す
    const messageContainer = document.querySelector('main');
    if (messageContainer) {
      messageObserver.observe(messageContainer, {
        childList: true,
        subtree: true,
        characterData: true,
      });
    } else {
      console.warn('❌ Message container not found');
    }
  }

  /**
   * フォーム（送信ボタン）を監視して、生成開始や完了を検知
   */
  function createButtonObserver(): boolean {
    // すでにオブザーバーが作成済みなら一度disconnectする
    if (buttonObserver) {
      buttonObserver.disconnect();
    }

    buttonObserver = new MutationObserver((mutations) => {
      debugLog('ButtonObserver', 'Mutation detected', {
        mutationsCount: mutations.length
      });

      const stopButton = document.querySelector('button[data-testid="stop-button"]');
      debugLog('ButtonObserver', 'Stop button state', {
        exists: !!stopButton,
        currentGeneratingState: isGenerating
      });

      // ストップボタンの有無で生成中かどうかを判断
      if (stopButton && !isGenerating) {
        // 応答生成開始
        debugLog('ButtonObserver', '🟢 Generation started');
        isGenerating = true;
        createMessageObserver(); // 応答を監視する
        lastResponseTime = Date.now();
      } else if (!stopButton && isGenerating) {
        // 生成が完了した
        debugLog('ButtonObserver', '🔵 Generation potentially complete, scheduling final check');
        setTimeout(checkIfDone, 1000); // 最後のメッセージ更新を待つため少し待機
      }
    });

    // ボタンを含む要素を監視
    const buttonContainer = document.querySelector('form') || document.querySelector('main');
    if (buttonContainer) {
      buttonObserver.observe(buttonContainer, {
        attributes: true,
        childList: true,
        subtree: true
      });
      return true;
    } else {
      console.warn('❌ Button container not found');
      return false;
    }
  }

  /**
   * 応答完了したかどうかを最終判定する関数
   */
  function checkIfDone(): void {
    debugLog('CheckIfDone', 'Starting completion check', {
      isGenerating,
      completionDelay: settings.completionDelay
    });

    if (!isGenerating) {
      debugLog('CheckIfDone', 'Skipped: Not generating');
      return;
    }

    const now = Date.now();
    const timeSinceLastResponse = now - lastResponseTime;

    debugLog('CheckIfDone', 'Time analysis', {
      now,
      lastResponseTime,
      timeSinceLastResponse,
      requiredDelay: settings.completionDelay * 1000
    });

    // 設定された時間以上メッセージの更新がなければ完了とみなす
    if (timeSinceLastResponse > settings.completionDelay * 1000) {
      debugLog('CheckIfDone', '🔴 Generation complete');
      // 完了
      isGenerating = false;

      // 最新のアシスタントメッセージを取得して通知テキストにする
      const messages = document.querySelectorAll('[data-message-author-role="assistant"]');
      const lastMessage = messages[messages.length - 1];
      const notificationText = lastMessage?.textContent?.slice(0, 100) || 'New response from ChatGPT';

      debugLog('CheckIfDone', 'Preparing notification', {
        messageCount: messages.length,
        notificationText
      });

      // デスクトップ通知
      if (settings.desktopEnabled && chrome.runtime?.id) {
        debugLog('CheckIfDone', 'Sending desktop notification');
        chrome.runtime.sendMessage({
          type: 'SHOW_NOTIFICATION',
          text: notificationText
        }).catch(error => {
          console.warn('Failed to send notification:', error);
        });
      }

      // 音声通知
      if (settings.soundEnabled) {
        debugLog('CheckIfDone', 'Playing notification sound');
        playNotificationSound();
      }
    } else {
      debugLog('CheckIfDone', '⏳ Still updating, scheduling next check');
      // まだ更新されているかもしれないので再度チェック
      setTimeout(checkIfDone, 2000);
    }
  }

  /**
   * 初期化関数: フォームとメッセージ要素の検出をリトライする
   */
  function init(): void {
    if (!createButtonObserver()) {
      let retryCount = 0;
      const retryInterval = setInterval(() => {
        retryCount++;
        if (createButtonObserver()) {
          clearInterval(retryInterval);
        } else if (retryCount >= 10) {
          clearInterval(retryInterval);
          console.warn('⚠️ Form detection aborted');
        }
      }, 1000);
    }
  }

  // ページ読み込み完了時に監視を開始
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // ページの表示状態が変更された時も監視を開始
  // これはタブが非アクティブから復帰した時などに必要
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      init();
    }
  });
})();