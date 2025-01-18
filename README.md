# ChatGPT Desktop Notifier

ChatGPTの出力完了時にデスクトップ通知を送信するChrome拡張機能です。

## 機能

- ChatGPTの出力完了時にデスクトップ通知を送信
- 通知音のON/OFF設定
- デスクトップ通知のON/OFF設定
- 通知の表示時間設定（1-60秒）
- 応答完了判定の待ち時間設定（1-10秒）
- テスト機能
  - 通知音のテスト
  - デスクトップ通知のテスト

## 開発環境のセットアップ

### 必要条件

- Node.js (v14以上推奨)
- npm (v6以上推奨)

### インストール

```bash
# 依存パッケージのインストール
npm install
```

### ビルド方法

```bash
# 本番用ビルド
npm run build

# 開発用ビルド（ファイル監視モード）
npm run dev

# ビルドファイルのクリーン
npm run clean
```

### Chrome拡張機能としての読み込み方

1. Chromeで `chrome://extensions` を開く
2. 右上の「デベロッパーモード」をオンにする
3. 「パッケージ化されていない拡張機能を読み込む」をクリック
4. `dist` ディレクトリを選択

## プロジェクト構造

```
.
├── src/
│   ├── background.js    # バックグラウンドスクリプト
│   ├── content.js       # コンテンツスクリプト
│   ├── icons/          # アイコンファイル
│   │   ├── icon.svg
│   │   └── icon128.png
│   ├── popup/          # ポップアップUI関連
│   │   ├── popup.html
│   │   ├── popup.css
│   │   └── popup.js
│   └── utils/          # ユーティリティ
│       └── sound.js    # 通知音関連
├── webpack-plugins/    # Webpackプラグイン
│   └── version-incrementer.js
├── manifest.json       # 拡張機能マニフェスト（Manifest V3）
├── webpack.config.js   # Webpackの設定
└── package.json       # プロジェクト設定
```

## 主な機能の説明

### 通知設定

- **Sound Alert**: 応答完了時の通知音を有効/無効にします
- **Desktop Alert**: デスクトップ通知を有効/無効にします
- **Notification Duration**: デスクトップ通知の表示時間を設定します（1-60秒）
- **Response Completion Delay**: ChatGPTの応答が完了したと判断するまでの待ち時間を設定します（1-10秒）

### テスト機能

- **Test Sound**: 現在の設定で通知音をテスト再生します
- **Test Notification**: 現在の設定でデスクトップ通知をテスト表示します

## ライセンス

ISC