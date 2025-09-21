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

**GitHub Personal Access Token作成:**
- GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
- スコープ: `read:packages` にチェック

### 3. パッケージインストール

```bash
# 型定義パッケージ（認証必要）
source .env.local && npm install @oizumi98/supabase-types @oizumi98/shared-types

# その他のパッケージ
npm install
```

### 4. TypeScript・ESLint設定

```bash
# tsconfig.json生成
npx tsc --init
```

### 5. Vercel設定

```bash
# Vercelにログイン
npx vercel login

# プロジェクトリンク
npx vercel link
```

### 6. 環境変数設定

```bash
# Vercel環境変数設定（全環境選択）
npx vercel env add SUPABASE_URL
npx vercel env add SUPABASE_ANON_KEY
npx vercel env add FASTAPI_URL

# ローカル環境変数同期
npx vercel env pull .env.local
```

### 7. 開発サーバー起動

```bash
npm run dev
```

動作確認: http://localhost:3000/api/analysis/basic

## 開発

### 利用可能なコマンド

```bash
# 開発サーバー起動
npm run dev

# TypeScript型チェック
npm run type-check

# ESLint実行・自動修正
npm run lint:fix

# 型定義パッケージ更新
npm run install:types
```

### コーディング規約・ESLint

このプロジェクトではESLintでコード品質とフォーマットを統一管理しています。

**基本的な使い方:**
```bash
# コードをチェック
npm run lint

# 自動修正（フォーマット含む）
npm run lint:fix
```

**開発フロー:**
1. コードを書く
2. `npm run lint:fix`で自動修正
3. コミット（pre-commitで自動チェック）

- **型安全性**: TypeScript strict mode
- **コミット前**: 自動で`npm run lint:fix`が実行される

## API仕様

### エンドポイント

| エンドポイント | メソッド | 用途 |
|---|---|---|
| `/api/analysis/basic` | GET | 基本分析（集計、満足度分析） |
| `/api/analysis/pattern` | GET | パターン分析（機械学習、クラスタリング） |

### レスポンス形式

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

## ファイル構成

```
shopping-list-nodejs-api/
├── api/                          # API Routes
│   └── analysis/
│       ├── basic.ts              # GET /api/analysis/basic
│       └── pattern.ts            # GET /api/analysis/pattern
├── lib/                          # 共通ライブラリ（今後実装）
├── package.json
├── tsconfig.json
├── vercel.json
├── eslint.config.js
└── .env.local                    # ローカル環境変数
```

## トラブルシューティング

### 型定義パッケージのインストールエラー

```bash
npm error 404 Not Found - @oizumi98/shared-types
```

**解決方法:**
1. GitHub Personal Access Tokenが設定されているか確認
2. 環境変数を読み込んでからインストール: `source .env.local && npm install`

### Vercel開発サーバーエラー

```bash
Error: Cannot require() ES Module in a cycle
```

**解決方法:** Vercelキャッシュクリア: `rm -rf .vercel && npx vercel link`

### Git Commit Hook エラー

```bash
husky - pre-commit script failed (code 127)
```

**解決方法:**
1. lint-stagedがインストールされているか確認: `npm list lint-staged`
2. 実行権限確認: `chmod +x .husky/pre-commit`

## 型定義パッケージ

- `@oizumi98/supabase-types`: Supabase DB型定義（自動生成）
- `@oizumi98/shared-types`: API型定義（手動作成）

**使用例:**
```typescript
import { Database } from '@oizumi98/supabase-types';
import { BasicAnalysisResponse } from '@oizumi98/shared-types';

const supabase = createClient<Database>(url, key);
const response: BasicAnalysisResponse = await fetchAPI();
```