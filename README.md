# 買ったものリスト Node.js API

買ったものリスト分析API - Node.js中間層

## システム構成

```
React Native → **Node.js API** → FastAPI
                     ↑↓
                 Supabase（認証確認・キャッシュ保存）
```

### Node.js APIの役割

- **分析専用API**: CRUD操作はSupabaseに直接アクセス
- **認証ミドルウェア**: SupabaseのJWTトークン検証
- **データ前処理**: Supabaseから取得したデータをFastAPI用に変換
- **キャッシュ制御**: analysis_cacheテーブルでの結果管理
- **エラーハンドリング**: 統一エラーフォーマット

## 技術スタック

- **プラットフォーム**: Vercel（サーバーレス）
- **言語**: TypeScript + Node.js 22
- **認証**: Supabase JWT検証
- **キャッシュ**: 24時間、analysis_cacheテーブル
- **型定義**: `@oizumi98/supabase-types`, `@oizumi98/shared-types`
- **コード品質**: ESLint（フォーマット統合）

## 前提条件

- **Node.js** v22.0.0以上
- **Git**
- **GitHub Personal Access Token**（型定義パッケージアクセス用）
- **Supabaseプロジェクトへのアクセス権限**

## 環境構築

### 1. リポジトリクローン・初期化

```bash
git clone <repository-url>
cd shopping-list-nodejs-api
```

### 2. GitHub Packages認証設定

```bash
# .env.localファイル作成
cp .env.example .env.local

# GitHub Personal Access Tokenを設定
# .env.localのGITHUB_TOKENに実際のトークン値を設定
```

**GitHub Personal Access Token作成方法:**
1. GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Generate new token (classic)
3. スコープ: `read:packages` にチェック
4. トークンをコピーして`.env.local`に設定

### 3. パッケージインストール

```bash
# 型定義パッケージ（認証必要）
source .env.local && npm install @oizumi98/supabase-types @oizumi98/shared-types

# その他のパッケージ
npm install @supabase/supabase-js
npm install --save-dev @types/node typescript @vercel/node

# ESLint関連
npm install --save-dev eslint @typescript-eslint/parser @typescript-eslint/eslint-plugin @eslint/js

# Git hooks（オプション）
npm install --save-dev husky lint-staged
```

### 4. TypeScript設定

```bash
# tsconfig.json生成
npx tsc --init
```

生成後、プロジェクトに適した設定に修正してください。

### 5. Vercel設定

```bash
# Vercelにログイン
npx vercel login

# プロジェクトリンク
npx vercel link
```

質問への回答:
- "Set up and deploy?" → `y`
- "Which scope?" → 個人アカウント選択
- "Link to existing project?" → `n`（新規プロジェクト）
- "What's your project's name?" → `shopping-list-nodejs-api`
- "In which directory is your code located?" → `./`

### 6. 環境変数設定

```bash
# Vercel環境変数設定（Development, Preview, Production全て選択）
npx vercel env add SUPABASE_URL
npx vercel env add SUPABASE_ANON_KEY
npx vercel env add FASTAPI_URL

# ローカル環境変数同期
npx vercel env pull .env.local
```

**設定値:**
- `SUPABASE_URL`: https://yqbqqnoouztzlkspiapr.supabase.co
- `SUPABASE_ANON_KEY`: Supabase Dashboard → Settings → API → anon public
- `FASTAPI_URL`: http://localhost:8000（開発時）

### 7. Git Hooks設定（オプション）

```bash
# Husky初期化
npx husky init

# pre-commitフック設定
echo "npx lint-staged" > .husky/pre-commit
chmod +x .husky/pre-commit
```

## 開発

### 開発サーバー起動

```bash
npm run dev
```

サーバーが起動したら以下のURLで動作確認:
- http://localhost:3000/api/analysis/basic
- http://localhost:3000/api/analysis/pattern

### 利用可能なコマンド

```bash
# 開発サーバー起動
npm run dev

# TypeScript型チェック
npm run type-check

# ESLint実行
npm run lint

# ESLint自動修正（フォーマット含む）
npm run lint:fix

# 型定義パッケージ更新
npm run install:types
```

### コーディング規約

- **フォーマット**: ESLintで統一（Prettierは使用しない）
- **型安全性**: TypeScript strict mode
- **import文**: ESモジュール形式
- **コミット前**: `npm run lint:fix`で自動フォーマット

## API仕様

### エンドポイント

| エンドポイント | メソッド | 用途 |
|---|---|---|
| `/api/analysis/basic` | GET | 基本分析（集計、満足度分析） |
| `/api/analysis/pattern` | GET | パターン分析（機械学習、クラスタリング） |

### レスポンス形式

成功時:
```json
{
  "status": "success",
  "data": { ... },
  "cache_info": {
    "cached": false,
    "updated_at": "2025-09-21T16:27:38.030Z"
  }
}
```

エラー時:
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "ユーザー向けメッセージ",
    "severity": "high|medium|low",
    "retryable": true|false,
    "timestamp": "2025-09-21T16:27:38.030Z"
  }
}
```

## ファイル構成

```
shopping-list-nodejs-api/
├── README.md
├── package.json
├── tsconfig.json
├── vercel.json
├── eslint.config.js
├── .env.local                    # ローカル環境変数
├── .env.example                  # 環境変数テンプレート
├── .gitignore
├── .husky/                       # Git hooks
├── api/                          # API Routes
│   └── analysis/
│       ├── basic.ts              # GET /api/analysis/basic
│       └── pattern.ts            # GET /api/analysis/pattern
└── lib/                          # 共通ライブラリ（今後実装）
    ├── auth.ts                   # 認証ミドルウェア
    ├── supabase.ts               # Supabaseクライアント
    ├── cache.ts                  # キャッシュ制御
    ├── errors.ts                 # エラーハンドリング
    └── fastapi.ts                # FastAPI連携
```

## トラブルシューティング

### 型定義パッケージのインストールエラー

```bash
# 認証エラー
npm error 404 Not Found - GET https://registry.npmjs.org/@oizumi98%2fshared-types
```

**解決方法:**
1. GitHub Personal Access Tokenが正しく設定されているか確認
2. `.npmrc`ファイルが存在するか確認
3. 環境変数を読み込んでからインストール: `source .env.local && npm install`

### Vercel開発サーバーのESモジュールエラー

```bash
Error: Cannot require() ES Module in a cycle
```

**解決方法:**
1. package.jsonに`"type": "module"`が設定されているか確認
2. tsconfig.jsonの`"module": "ESNext"`設定を確認
3. Vercelキャッシュクリア: `rm -rf .vercel && npx vercel link`

### TypeScriptコンパイルエラー

```bash
tsc: The TypeScript Compiler - Version 5.9.2
```

**原因:** tsconfig.jsonが見つからない、または設定が不適切

**解決方法:**
1. tsconfig.jsonが存在するか確認
2. package.jsonから`build`スクリプトを削除（Vercelが自動コンパイル）

### ESLintエラー

```bash
Error: Key "comma-dangle": Value "es5" should be equal to one of the allowed values
```

**原因:** ESLint v9で`comma-dangle`の設定値が変更

**解決方法:** eslint.config.jsで`'es5'` → `'always-multiline'`に修正

### Git Commit Hook エラー

```bash
husky - pre-commit script failed (code 127)
```

**解決方法:**
1. lint-stagedがインストールされているか確認: `npm list lint-staged`
2. .husky/pre-commitファイルの内容確認: `cat .husky/pre-commit`
3. 実行権限確認: `chmod +x .husky/pre-commit`

## 関連リンク

- [Vercel公式ドキュメント](https://vercel.com/docs)
- [Supabase公式ドキュメント](https://supabase.com/docs)
- [TypeScript公式ドキュメント](https://www.typescriptlang.org/)
- [ESLint公式ドキュメント](https://eslint.org/)

## 型定義パッケージ

このプロジェクトでは以下の型定義パッケージを使用:

- `@oizumi98/supabase-types`: Supabase DB型定義（自動生成）
- `@oizumi98/shared-types`: API型定義（手動作成）

**更新方法:**
```bash
npm run install:types
```

**使用例:**
```typescript
import { Database } from '@oizumi98/supabase-types';
import { BasicAnalysisResponse } from '@oizumi98/shared-types';

const supabase = createClient<Database>(url, key);
const response: BasicAnalysisResponse = await fetchAPI();
```
