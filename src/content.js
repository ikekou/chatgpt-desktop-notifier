import { playNotificationSound } from './utils/sound';

(function() {
  let isGenerating = false;       // ChatGPTが応答生成中かどうか
  let lastResponseTime = 0;       // 最後に応答(メッセージ)を検知した時刻
  let messageObserver = null;     // メッセージ用MutationObserver
  let buttonObserver = null;      // 送信ボタン用MutationObserver

  // 設定の初期値
  let settings = {
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
  chrome.storage.onChanged.addListener((changes) => {
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
  function createMessageObserver() {
    // すでにオブザーバーが作成済みなら一度disconnectする
    if (messageObserver) {
      messageObserver.disconnect();
    }

    messageObserver = new MutationObserver((mutations) => {
      if (!isGenerating) return; // 応答生成中のみチェック

      const messages = document.querySelectorAll('[data-message-author-role="assistant"]');
      if (!messages.length) return;

      const lastMessage = messages[messages.length - 1];
      if (!lastMessage) return;

      // メッセージテキストがまだ変化し続けている可能性があるため、
      // ミューテーションがあるたびに時刻を更新
      lastResponseTime = Date.now();
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
  function createButtonObserver() {
    // すでにオブザーバーが作成済みなら一度disconnectする
    if (buttonObserver) {
      buttonObserver.disconnect();
    }

    buttonObserver = new MutationObserver(() => {
      const stopButton = document.querySelector('button[data-testid="stop-button"]');

      // ストップボタンの有無で生成中かどうかを判断
      if (stopButton && !isGenerating) {
        // 応答生成開始
        isGenerating = true;
        createMessageObserver(); // 応答を監視する
        lastResponseTime = Date.now();
      } else if (!stopButton && isGenerating) {
        // 生成が完了した
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
  function checkIfDone() {
    if (!isGenerating) return;

    const now = Date.now();
    const timeSinceLastResponse = now - lastResponseTime;

    // 設定された時間以上メッセージの更新がなければ完了とみなす
    if (timeSinceLastResponse > settings.completionDelay * 1000) {
      // 完了
      isGenerating = false;

      // 最新のアシスタントメッセージを取得して通知テキストにする
      const messages = document.querySelectorAll('[data-message-author-role="assistant"]');
      const lastMessage = messages[messages.length - 1];
      const notificationText = lastMessage?.textContent?.slice(0, 100) || 'New response from ChatGPT';

      // デスクトップ通知
      if (settings.desktopEnabled) {
        chrome.runtime.sendMessage({
          type: 'SHOW_NOTIFICATION',
          text: notificationText
        });
      }

      // 音声通知
      if (settings.soundEnabled) {
        playNotificationSound();
      }
    } else {
      // まだ更新されているかもしれないので再度チェック
      setTimeout(checkIfDone, 2000);
    }
  }

  /**
   * 初期化関数: フォームとメッセージ要素の検出をリトライする
   */
  function init() {
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