// DOM要素の取得
const soundEnabledCheckbox = document.getElementById('soundEnabled') as HTMLInputElement;
const desktopEnabledCheckbox = document.getElementById('desktopEnabled') as HTMLInputElement;
const statusElement = document.getElementById('status') as HTMLDivElement;

// 設定を保存する関数
function saveSettings() {
  const settings = {
    soundEnabled: soundEnabledCheckbox.checked,
    desktopEnabled: desktopEnabledCheckbox.checked
  };

  chrome.storage.sync.set(settings, () => {
    // 保存完了を表示
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

// 保存された設定を読み込む
chrome.storage.sync.get(['soundEnabled', 'desktopEnabled'], (result) => {
  soundEnabledCheckbox.checked = result.soundEnabled ?? true;
  desktopEnabledCheckbox.checked = result.desktopEnabled ?? true;
});

// イベントリスナーの設定
soundEnabledCheckbox.addEventListener('change', saveSettings);
desktopEnabledCheckbox.addEventListener('change', saveSettings);