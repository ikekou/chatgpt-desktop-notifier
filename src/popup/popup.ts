import { playNotificationSound } from '../utils/sound';

// DOM要素の取得
const soundEnabledCheckbox = document.getElementById('soundEnabled') as HTMLInputElement;
const desktopEnabledCheckbox = document.getElementById('desktopEnabled') as HTMLInputElement;
const testSoundButton = document.getElementById('testSound') as HTMLButtonElement;
const testNotificationButton = document.getElementById('testNotification') as HTMLButtonElement;
const statusElement = document.getElementById('status') as HTMLDivElement;

// 設定を保存する関数
function saveSettings() {
  const settings = {
    soundEnabled: soundEnabledCheckbox.checked,
    desktopEnabled: desktopEnabledCheckbox.checked
  };

  chrome.storage.sync.set(settings, () => {
    showStatus('設定を保存しました');
  });
}

// ステータスメッセージを表示する関数
function showStatus(message: string) {
  statusElement.textContent = message;
  statusElement.classList.add('show');

  // 2秒後にメッセージを非表示にする
  setTimeout(() => {
    statusElement.classList.remove('show');
  }, 2000);
}

// 音声通知をテストする関数
function testSound() {
  if (!soundEnabledCheckbox.checked) {
    showStatus('⚠️ 音声通知が無効になっています');
    return;
  }
  playNotificationSound();
  showStatus('🔊 音声通知をテストしました');
}

// デスクトップ通知をテストする関数
function testNotification() {
  console.log('🔔 デスクトップ通知テストを開始します');
  
  if (!desktopEnabledCheckbox.checked) {
    console.log('⚠️ デスクトップ通知が無効になっています');
    showStatus('⚠️ デスクトップ通知が無効になっています');
    return;
  }

  console.log('📤 background.tsにメッセージを送信します');
  chrome.runtime.sendMessage(
    {
      type: 'SHOW_NOTIFICATION',
      text: 'これはテスト通知です。ChatGPT Desktop Notifierは正常に動作しています。'
    },
    (response) => {
      console.log('📥 background.tsからの応答:', response);
      if (chrome.runtime.lastError) {
        console.error('❌ エラーが発生しました:', chrome.runtime.lastError);
        showStatus('⚠️ 通知の送信に失敗しました');
      }
    }
  );
  
  showStatus('💬 デスクトップ通知をテストしました');
}

// 保存された設定を読み込む
chrome.storage.sync.get(['soundEnabled', 'desktopEnabled'], (result) => {
  soundEnabledCheckbox.checked = result.soundEnabled ?? true;
  desktopEnabledCheckbox.checked = result.desktopEnabled ?? true;
});

// イベントリスナーの設定
soundEnabledCheckbox.addEventListener('change', saveSettings);
desktopEnabledCheckbox.addEventListener('change', saveSettings);
testSoundButton.addEventListener('click', testSound);
testNotificationButton.addEventListener('click', testNotification);