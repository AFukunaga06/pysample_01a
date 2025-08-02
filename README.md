# JANコード管理アプリ

JANコードの管理と、テキストからJANコードから重量までの自動抽出を行うアプリケーションです。デスクトップ版とWeb版の両方を提供しています。

## 機能

### 1. JANコードコピー
- Google Sheetsから指定した番目のJANコードを取得してコピー
- 次へ進む、一つ戻るボタンで連続操作
- デモモードでGoogle Sheets未接続時も動作

### 2. 座標取得
- 画面上の範囲をドラッグしてテキストをコピー
- 開始位置と終了位置を指定して自動ドラッグ

### 3. テキスト抽出
- **デスクトップ版**: OCRを使わずにドラッグした範囲のテキストから正規表現でJANコードから重量を抽出
- **Web版**: テキスト入力によるJANコードと重量の抽出
- 対応する重量形式：
  - `123g`、`123G`
  - `123グラム`
  - `重量：123g`、`重量 123g`
  - `123ｇ`（全角）
- 13桁または8桁のJANコードを自動検出
- 抽出結果を自動的にクリップボードにコピー

## デスクトップ版の使用方法

### 必要なライブラリ
```bash
pip install customtkinter gspread oauth2client pyperclip pyautogui pillow
```

### 実行方法
```bash
python jan_code_app.py
```

## Web版の使用方法

### インストール
```bash
pip install -r requirements.txt
```

### ローカル起動
```bash
python app.py
```

ブラウザで `http://localhost:5000` にアクセスしてください。

### Azure App Serviceへのデプロイ

1. **Azure App Serviceの作成**
   - Azure Portalで新しいApp Serviceを作成
   - ランタイムスタック: Python 3.11
   - オペレーティングシステム: Linux

2. **環境変数の設定**
   - Azure Portal > App Service > 設定 > 構成
   - アプリケーション設定に以下を追加：
     - `GOOGLE_CREDENTIALS_JSON`: Google Sheets APIのJSONキーファイルの内容全体
     - `SPREADSHEET_KEY`: Google SheetsのスプレッドシートID

3. **デプロイ方法**

   **方法1: Azure CLI使用**
   ```bash
   az webapp up --name your-app-name --resource-group your-resource-group --runtime "PYTHON:3.11"
   ```

   **方法2: GitHub Actions使用**
   - GitHub Actionsワークフローを設定
   - Azure App Serviceへの自動デプロイを構成

   **方法3: ZIP デプロイ**
   - プロジェクトをZIPファイルに圧縮
   - Azure Portal > App Service > デプロイセンター > ZIP デプロイ

4. **起動コマンドの設定**
   - Azure Portal > App Service > 設定 > 構成 > 全般設定
   - 起動コマンド: `gunicorn --bind=0.0.0.0 --timeout 600 app:app`

### Docker使用

```bash
# イメージのビルド
docker build -t jan-code-app .

# コンテナの実行
docker run -p 5000:5000 -e GOOGLE_CREDENTIALS_JSON='{"type":"service_account",...}' jan-code-app
```

## 使用例

### デスクトップ版

#### JANコードコピー
1. アプリケーションを起動
2. 「指定した番目」に数値を入力
3. 「JANコードコピー」ボタンをクリック
4. クリップボードにJANコードがコピーされます

#### テキスト抽出機能の使い方
1. 「抽出開始位置」ボタンをクリック
2. アプリが非表示になったら、抽出したいテキスト範囲の左上角にマウスを置く
3. 「抽出終了位置」ボタンが有効になるのでクリック
4. 抽出したいテキスト範囲の右下角にマウスを置く
5. 「JANコード～重量抽出」ボタンをクリック
6. アプリが自動的に範囲をドラッグしてテキストを取得し、JANコードから重量までを抽出してクリップボードにコピー

### Web版

#### JANコードコピー
1. ブラウザでアプリケーションにアクセス
2. 「指定した番目」に数値を入力
3. 「JANコードを取得」ボタンをクリック
4. JANコードがクリップボードにコピーされます

#### テキスト抽出
1. テキストエリアにJANコードと重量を含むテキストを入力
2. 「JANコード～重量抽出」ボタンをクリック
3. 抽出されたテキストがクリップボードにコピーされます

## Google Sheets API設定

1. Google Cloud Consoleでプロジェクトを作成
2. Google Sheets APIを有効化
3. サービスアカウントを作成し、JSONキーファイルをダウンロード
4. **デスクトップ版**: JSONファイルをアプリケーションと同じディレクトリに配置
5. **Web版**: JSONファイルの内容を環境変数 `GOOGLE_CREDENTIALS_JSON` に設定
6. Google Sheetsでサービスアカウントのメールアドレスを共有設定に追加

### 環境変数設定（オプション）
- `GOOGLE_CREDENTIALS_PATH`: 認証ファイルのパス（デスクトップ版）
- `GOOGLE_CREDENTIALS_JSON`: 認証ファイルの内容（Web版）
- `SPREADSHEET_KEY`: スプレッドシートのキー
- `WINDOW_POSITION`: ウィンドウ位置（`x,y`形式、デスクトップ版のみ）

## ファイル出力
- `extract_result.txt`: テキスト抽出結果の詳細ログ
- `coordinates_and_content.txt`: 座標取得機能の結果ログ

## ファイル構成

```
pysample_01a/
├── jan_code_app.py          # デスクトップ版メインアプリ
├── app.py                   # Web版Flaskアプリ
├── requirements.txt         # Python依存関係
├── Dockerfile              # Docker設定
├── startup.sh              # Azure起動スクリプト
├── web.config              # Azure App Service設定
├── templates/
│   └── index.html          # Web版HTMLテンプレート
└── static/
    ├── css/style.css       # Web版スタイルシート
    └── js/app.js           # Web版JavaScript
```

## 技術仕様
- Python 3.11対応
- **デスクトップ版**: CustomTkinter使用の現代的なGUI
- **Web版**: Flask使用のWebアプリケーション
- 正規表現によるテキストパターンマッチング
- Google Sheets API連携
- クリップボード操作とマウス自動化（デスクトップ版のみ）

## 注意事項
- **デスクトップ版**: Windows環境での動作を前提
- **Web版**: クロスプラットフォーム対応
- Google Sheets機能を使用する場合は認証ファイルが必要
- 認証ファイルがない場合はデモモードで動作

## トラブルシューティング

### Google Sheets接続エラー
- 認証ファイルのパスを確認（デスクトップ版）
- 環境変数の設定を確認（Web版）
- サービスアカウントの権限を確認
- スプレッドシートの共有設定を確認

### OCR機能が動作しない（デスクトップ版のみ）
- 画面解像度の設定を確認
- 座標の設定を再確認
- アプリケーションの管理者権限を確認

### Web版でクリップボードにコピーできない
- HTTPS接続を使用してください（localhost以外）
- ブラウザのクリップボード権限を確認してください
