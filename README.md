# ChatGPT Desktop Notifier

ChatGPTの出力完了時にデスクトップ通知を送信するChrome拡張機能です。

## 機能

- ChatGPTの出力完了時にデスクトップ通知を送信
- 通知音の設定が可能

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
│   ├── background.ts    # バックグラウンドスクリプト
│   ├── content.ts       # コンテンツスクリプト
│   ├── popup/          # ポップアップUI関連
│   │   ├── popup.html
│   │   ├── popup.css
│   │   └── popup.ts
│   └── utils/          # ユーティリティ
│       └── sound.ts
├── manifest.json       # 拡張機能マニフェスト
├── webpack.config.js   # Webpackの設定
└── package.json       # プロジェクト設定
```

## ライセンス

ISC