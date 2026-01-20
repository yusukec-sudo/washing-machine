import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";

export type AnalysisResult = {
  success: true;
  detected: string[];
  conclusion: string;
  notes: string[];
  recommendation: string;
} | {
  success: false;
  error: string;
  shouldRetry: boolean;
};

const SYSTEM_PROMPT = `あなたは洗濯表示（ケアラベル）の専門家です。
アップロードされた画像から洗濯タグ/洗濯表示を読み取り、以下のJSON形式で回答してください。

洗濯記号（JIS L0001 / ISO 3758）やテキストの両方を認識してください。

出力形式:
{
  "confidence": "high" | "medium" | "low",
  "detected": [
    "素材: 綿100%",
    "洗濯: 40°C以下で洗濯機可",
    "漂白: 禁止",
    "乾燥: タンブラー乾燥可",
    "アイロン: 中温まで可",
    "ドライ: 石油系溶剤可"
  ],
  "conclusion": "この衣類の洗い方の結論を1文で（例：「通常の洗濯機で洗えます」「手洗いが必要です」）",
  "notes": ["注意点1", "注意点2", "注意点3"],
  "recommendation": "おすすめの洗濯方法を1つ具体的に"
}

ルール:
- detectedには画像から読み取った事実を箇条書きで記載（素材、洗濯、漂白、乾燥、アイロン、ドライクリーニングなど）
- 記号だけでなくテキスト情報（産地、ブランド名以外）も含める
- notesは最大3つまで。重要な注意点のみ
- 画像が不鮮明、洗濯タグでない、または読み取れない場合は confidence を "low" にする
- 日本語で回答する
- JSONのみを返す（説明文は不要）`;

export async function POST(request: NextRequest) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json({
        success: false,
        error: "APIキーが設定されていません",
        shouldRetry: false,
      } satisfies AnalysisResult, { status: 500 });
    }

    const { image } = await request.json();

    if (!image) {
      return NextResponse.json({
        success: false,
        error: "画像が送信されていません",
        shouldRetry: true,
      } satisfies AnalysisResult, { status: 400 });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    // Extract base64 data and mime type
    const matches = image.match(/^data:(.+);base64,(.+)$/);
    if (!matches) {
      return NextResponse.json({
        success: false,
        error: "画像形式が不正です",
        shouldRetry: true,
      } satisfies AnalysisResult, { status: 400 });
    }

    const mimeType = matches[1];
    const base64Data = matches[2];

    const result = await model.generateContent([
      SYSTEM_PROMPT,
      {
        inlineData: {
          mimeType,
          data: base64Data,
        },
      },
    ]);

    const response = result.response;
    const text = response.text();

    // Parse JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return NextResponse.json({
        success: false,
        error: "解析結果の形式が不正です。別の画像で再度お試しください。",
        shouldRetry: true,
      } satisfies AnalysisResult, { status: 500 });
    }

    const parsed = JSON.parse(jsonMatch[0]);

    // Check confidence level
    if (parsed.confidence === "low") {
      return NextResponse.json({
        success: false,
        error: "画像が不鮮明か、洗濯タグを認識できませんでした。鮮明な画像を再アップロードしてください。",
        shouldRetry: true,
      } satisfies AnalysisResult, { status: 200 });
    }

    return NextResponse.json({
      success: true,
      detected: parsed.detected || [],
      conclusion: parsed.conclusion,
      notes: parsed.notes.slice(0, 3),
      recommendation: parsed.recommendation,
    } satisfies AnalysisResult);

  } catch (error) {
    console.error("Analysis error:", error);
    return NextResponse.json({
      success: false,
      error: "解析中にエラーが発生しました。しばらく待ってから再度お試しください。",
      shouldRetry: true,
    } satisfies AnalysisResult, { status: 500 });
  }
}
