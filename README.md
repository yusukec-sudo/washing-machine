# 🧺 洗濯タグ解析 (Laundry Tag Analyzer)

洗濯表示（ケアラベル）の画像をアップロードすると、AIが内容を解析して洗い方をアドバイスするWebアプリです。

## 機能

- 画像アップロード（ドラッグ&ドロップ / ファイル選択）
- Google Gemini 1.5 Flash によるマルチモーダル解析
- 解析結果の表示（結論・注意点・おすすめ）
- 履歴の保存（localStorage）

## セットアップ

### 1. 依存関係のインストール

```bash
npm install
```

### 2. 環境変数の設定

`.env.local.example` をコピーして `.env.local` を作成し、Gemini API キーを設定してください。

```bash
cp .env.local.example .env.local
```

API キーは [Google AI Studio](https://aistudio.google.com/app/apikey) で無料で取得できます。

```
GEMINI_API_KEY=your_api_key_here
```

### 3. 開発サーバーの起動

```bash
npm run dev
```

ブラウザで http://localhost:3000 を開いてください。

## 使い方

1. 洗濯タグの写真を撮影またはスキャン
2. 画像をドラッグ&ドロップ、またはクリックして選択
3. 「解析する」ボタンをクリック
4. 結果を確認（必要に応じて保存）

## 技術スタック

- **フレームワーク**: Next.js 16 (App Router)
- **言語**: TypeScript
- **スタイリング**: Tailwind CSS v4
- **AI**: Google Gemini 1.5 Flash
- **データ保存**: localStorage

## コマンド一覧

| コマンド | 説明 |
|---------|------|
| `npm run dev` | 開発サーバー起動 |
| `npm run build` | 本番ビルド |
| `npm run start` | 本番サーバー起動 |
| `npm run lint` | ESLint チェック |
