// api/analysis/basic.ts
import { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import { Database } from '@oizumi98/supabase-types';
import { BasicAnalysisResponse } from '@oizumi98/shared-types';

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
    const start = req.query.start as string || new Date().toISOString().split('T')[0];
    const end = req.query.end as string || new Date().toISOString().split('T')[0];

    // Supabase client with types
    const supabase = createClient<Database>(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_ANON_KEY!
    );

    // TODO: 認証ミドルウェアの実装後、ユーザーIDを取得
    // const user = await authenticateUser(req);

    // 基本的なレスポンス（仮実装）
    const response: BasicAnalysisResponse = {
      status: 'success',
      data: {
        summary: {
          total_amount: 0,
          total_items: 0,
          average_satisfaction: 0,
          period,
          start_date: start,
          end_date: end
        },
        category_spending: [],
        satisfaction_trend: [],
        decision_speed_analysis: {
          planned: { count: 0, average_satisfaction: 0, percentage: 0 },
          impulse: { count: 0, average_satisfaction: 0, percentage: 0 }
        }
      },
      cache_info: {
        cached: false,
        updated_at: new Date().toISOString()
      }
    };

    res.status(200).json(response);
  } catch (error) {
    console.error('Basic analysis error:', error);
    
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