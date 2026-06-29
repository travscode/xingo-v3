import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import OpenAI from "openai";

interface TranslateRequestBody {
  text?: string;
}

/**
 * Normalizes model output so the UI can safely replace the original transcript text.
 */
function normalizeTranslation(value: string) {
  return value.trim();
}

export async function POST(request: Request) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json(
      { error: "OPENAI_API_KEY is not configured." },
      { status: 500 },
    );
  }

  try {
    const body = (await request.json()) as TranslateRequestBody;
    const text = typeof body?.text === "string" ? body.text.trim() : "";

    if (!text) {
      return NextResponse.json(
        { error: "Transcript text is required." },
        { status: 400 },
      );
    }

    const client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const response = await client.responses.create({
      model: process.env.OPENAI_TRANSLATION_MODEL ?? "gpt-4.1-mini",
      input: [
        {
          role: "system",
          content:
            "Translate the user's text into natural English. Preserve meaning, tone, and medically or legally relevant terminology. If the text is already in English, return it unchanged. Return only the translated English text with no explanation, labels, or quotes.",
        },
        {
          role: "user",
          content: text,
        },
      ],
    });

    const translation = normalizeTranslation(response.output_text || text);

    if (!translation) {
      return NextResponse.json(
        { error: "Translation failed." },
        { status: 500 },
      );
    }

    return NextResponse.json({ translation });
  } catch (error) {
    console.error("[/api/practice/translate]", error);
    return NextResponse.json(
      { error: "Translation failed." },
      { status: 500 },
    );
  }
}
