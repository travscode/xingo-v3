import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import OpenAI from "openai";
import { buildAssessmentInstructions, practiceAssessmentSchema } from "@/lib/ai";
import type { Scenario } from "@/types/scenario";
import type { TranscriptEntry } from "@/types/session";

interface AssessRequestBody {
  scenario: Scenario;
  transcriptEntries: TranscriptEntry[];
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
    const client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
    const body = (await request.json()) as AssessRequestBody;
    const scenario = body?.scenario;
    const transcriptEntries = Array.isArray(body?.transcriptEntries) ? body.transcriptEntries : [];

    if (!scenario || transcriptEntries.length === 0) {
      return NextResponse.json(
        { error: "Scenario and transcript entries are required." },
        { status: 400 },
      );
    }

    const response = await client.responses.create({
      model: process.env.OPENAI_ASSESSMENT_MODEL ?? "gpt-4.1-mini",
      input: buildAssessmentInstructions(scenario, transcriptEntries),
      text: {
        format: {
          type: "json_schema",
          ...practiceAssessmentSchema,
        },
      },
    });

    const parsed = JSON.parse(response.output_text);
    return NextResponse.json(parsed);
  } catch (error) {
    console.error("[/api/practice/assess]", error);
    return NextResponse.json(
      { error: "Assessment failed." },
      { status: 500 },
    );
  }
}
