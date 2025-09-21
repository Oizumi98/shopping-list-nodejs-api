// api/analysis/pattern.ts
import { VercelRequest, VercelResponse } from '@vercel/node';
import { PatternAnalysisResponse } from '@oizumi98/shared-types';

interface APIError {
  success: false;
  error: {
    code: string;
    message: string;
    severity: 'high' | 'medium' | 'low';
    retryable: boolean;
    timestamp: string;
  };
}

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Only allow GET requests
  if (req.method !== 'GET') {
    const error: APIError = {
      success: false,
      error: {
        code: 'METHOD_NOT_ALLOWED',
        message: 'このエンドポイントはGETリクエストのみサポートします',
        severity: 'low',
        retryable: false,
        timestamp: new Date().toISOString()
      }
    };
    res.status(405).json(error);
    return;
  }

  try {
    // Query parameters with type safety
    const period = req.query.period as string || '1month';

    // TODO: 認証ミドルウェアの実装後、実際のデータ分析
    // TODO: FastAPI連携の実装

    // パターン分析の仮実装
    const response: PatternAnalysisResponse = {
      status: 'success',
      data: {
        purchase_clusters: [
          {
            cluster_id: 1,
            cluster_name: '計画的高満足購入',
            description: '事前検討が長く、満足度が持続する購入パターン',
            items_count: 0,
            characteristics: {
              avg_satisfaction_initial: 0,
              avg_satisfaction_month: 0,
              dominant_categories: [],
              avg_amount: 0,
              planned_ratio: 0
            }
          }
        ],
        insights: [
          {
            type: 'info',
            title: 'データが不足しています',
            message: '分析に必要なデータが不足しています。もう少し購入記録を追加してください。',
            confidence: 1.0
          }
        ],
        correlations: {
          amount_satisfaction: {
            correlation: 0,
            description: '分析に十分なデータがありません'
          },
          planning_satisfaction: {
            correlation: 0,
            description: '分析に十分なデータがありません'
          }
        }
      },
      cache_info: {
        cached: false,
        updated_at: new Date().toISOString()
      }
    };

    res.status(200).json(response);
  } catch (error) {
    console.error('Pattern analysis error:', error);
    
    const apiError: APIError = {
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: '分析処理中にエラーが発生しました',
        severity: 'high',
        retryable: true,
        timestamp: new Date().toISOString()
      }
    };
    
    res.status(500).json(apiError);
  }
}