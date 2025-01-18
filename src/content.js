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
    console.log('⚙️ 設定を読み込みました:', settings);
  });

  // 設定変更を監視
  chrome.storage.onChanged.addListener((changes) => {
    if (changes.soundEnabled) {
      settings.soundEnabled = changes.soundEnabled.newValue;
      console.log('⚙️ 音声通知設定を更新:', settings.soundEnabled);
    }
    if (changes.desktopEnabled) {
      settings.desktopEnabled = changes.desktopEnabled.newValue;
      console.log('⚙️ デスクトップ通知設定を更新:', settings.desktopEnabled);
    }
    if (changes.completionDelay) {
      settings.completionDelay = changes.completionDelay.newValue;
      console.log('⚙️ 応答完了判定の待ち時間を更新:', settings.completionDelay);
    }
  });

  /**
   * チャットメッセージの変化を監視し、完了を検知したら通知を行う
   */
  function createMessageObserver() {
    // すでにオブザーバーが作成済みなら一度disconnectする
    if (messageObserver) {
      console.log('🔄 既存のメッセージ監視を解除');
      messageObserver.disconnect();
    }

    messageObserver = new MutationObserver((mutations) => {
      if (!isGenerating) return; // 応答生成中のみチェック

      const messages = document.querySelectorAll('[data-message-author-role="assistant"]');
      console.log('👀 メッセージ更新を検知:', {
        mutationsCount: mutations.length,
        messagesCount: messages.length
      });

      if (!messages.length) return;

      const lastMessage = messages[messages.length - 1];
      if (!lastMessage) return;

      // メッセージテキストがまだ変化し続けている可能性があるため、
      // ミューテーションがあるたびに時刻を更新
      lastResponseTime = Date.now();
      console.log('⏱️ 最終応答時刻を更新:', new Date(lastResponseTime).toISOString());
    });

    // ChatGPTのメッセージリストに該当しそうな要素を探す
    const messageContainer = document.querySelector('main');
    if (messageContainer) {
      messageObserver.observe(messageContainer, {
        childList: true,
        subtree: true,
        characterData: true,
      });
      console.log('✅ メッセージコンテナの監視を開始:', {
        element: messageContainer.tagName,
        children: messageContainer.children.length
      });
    } else {
      console.warn('❌ メッセージコンテナが見つかりませんでした');
    }
  }

  /**
   * フォーム（送信ボタン）を監視して、生成開始や完了を検知
   */
  function createButtonObserver() {
    // すでにオブザーバーが作成済みなら一度disconnectする
    if (buttonObserver) {
      console.log('🔄 既存のボタン監視を解除');
      buttonObserver.disconnect();
    }

    buttonObserver = new MutationObserver(() => {
      const stopButton = document.querySelector('button[data-testid="stop-button"]');
      console.log('👀 ストップボタンの状態:', {
        exists: !!stopButton,
        currentlyGenerating: isGenerating
      });

      // ストップボタンの有無で生成中かどうかを判断
      if (stopButton && !isGenerating) {
        // 応答生成開始
        isGenerating = true;
        console.log('📝 ChatGPT応答の生成を開始しました');
        createMessageObserver(); // 応答を監視する
        lastResponseTime = Date.now();
      } else if (!stopButton && isGenerating) {
        // 生成が完了した
        console.log('🤔 応答生成が完了しました');
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
      console.log('✅ ボタンコンテナの監視を開始:', {
        element: buttonContainer.tagName,
        children: buttonContainer.children.length
      });
      return true;
    } else {
      console.warn('❌ ボタンコンテナが見つかりませんでした');
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

    console.log('⏱️ 最終メッセージ更新からの経過時間:', {
      ms: timeSinceLastResponse,
      seconds: Math.round(timeSinceLastResponse / 1000)
    });

    // 設定された時間以上メッセージの更新がなければ完了とみなす
    if (timeSinceLastResponse > settings.completionDelay * 1000) {
      // 完了
      isGenerating = false;
      console.log(`✅ ${timeSinceLastResponse}ms経過した 応答完了を検知`);

      // 最新のアシスタントメッセージを取得して通知テキストにする
      const messages = document.querySelectorAll('[data-message-author-role="assistant"]');
      const lastMessage = messages[messages.length - 1];
      const notificationText = lastMessage?.textContent?.slice(0, 100) || 'New response from ChatGPT';

      console.log('📝 最終メッセージ:', {
        length: messages.length,
        preview: notificationText
      });

      // デスクトップ通知
      if (settings.desktopEnabled) {
        console.log('📢 デスクトップ通知を送信');
        chrome.runtime.sendMessage({
          type: 'SHOW_NOTIFICATION',
          text: notificationText
        });
      }

      // 音声通知
      if (settings.soundEnabled) {
        console.log('🔔 音声通知を再生');
        playNotificationSound();
      }
    } else {
      // まだ更新されているかもしれないので再度チェック
      console.log('⏳ まだ更新が続いている可能性があるため再チェックを予約');
      setTimeout(checkIfDone, 2000);
    }
  }

  /**
   * 初期化関数: フォームとメッセージ要素の検出をリトライする
   */
  function init() {
    console.log('🚀 ChatGPT通知機能の初期化を開始');
    
    if (!createButtonObserver()) {
      let retryCount = 0;
      const retryInterval = setInterval(() => {
        retryCount++;
        console.log(`🔄 フォームを再検索中... (試行: ${retryCount}/10)`);
        if (createButtonObserver()) {
          clearInterval(retryInterval);
          console.log('✅ フォームの検出に成功しました');
        } else if (retryCount >= 10) {
          clearInterval(retryInterval);
          console.warn('⚠️ フォームの検出を中止します');
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
      console.log('👁️ ページが表示状態になったため監視を再開');
      init();
    }
  });
})();