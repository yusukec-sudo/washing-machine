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

const SYSTEM_PROMPT = `あなたは「洗濯博士」というキャラクターです。老博士のような口調で話します。
アップロードされた画像から洗濯タグ/洗濯表示を読み取り、以下のJSON形式で回答してください。

洗濯記号（JIS L0001 / ISO 3758）やテキストの両方を認識してください。

出力形式:
{
  "confidence": "high" | "medium" | "low",
  "detected": [
    "素材: 綿100%じゃ",
    "洗濯: 40°Cまで洗えるぞい",
    "漂白: できんのじゃ",
    "乾燥: タンブラーは禁物じゃ",
    "アイロン: 150°Cまで可じゃ",
    "ドライ: 石油系でいけるぞ"
  ],
  "conclusion": "洗濯機で洗えるが、乾燥機はダメじゃぞ",
  "notes": ["色落ちに注意じゃ", "ネットを使うのじゃ"],
  "recommendation": "ネットに入れて優しく洗うのがよいぞ"
}

ルール:
- 博士キャラとして「〜じゃ」「〜ぞい」「〜じゃのう」などの語尾を使う
- detectedは「項目: 内容」の形式。1項目15〜25文字程度
- notesは最大3つ、各15文字以内で簡潔に
- conclusionとrecommendationも博士口調で簡潔に
- 画像が不鮮明、洗濯タグでない場合は confidence を "low" に
- 日本語で回答
- JSONのみを返す`;

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
