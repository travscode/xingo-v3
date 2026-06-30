import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { recordOpenAiUsage } from "@/lib/openai-usage";

interface UsageRequestBody {
  eventId?: string;
  source?: "realtime" | "other";
  model?: string;
  promptTokens?: number;
  completionTokens?: number;
  totalTokens?: number;
  moduleId?: string;
  scenarioId?: string;
  attemptId?: string;
}

/**
 * Records client-side OpenAI usage, such as realtime token usage emitted by transport events.
 */
export async function POST(request: Request) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = (await request.json()) as UsageRequestBody;
    const eventId = typeof body.eventId === "string" ? body.eventId.trim() : "";
    const source = body.source === "other" ? "other" : "realtime";
    const model = typeof body.model === "string" ? body.model.trim() : "";
    const promptTokens =
      typeof body.promptTokens === "number" ? Math.max(0, body.promptTokens) : 0;
    const completionTokens =
      typeof body.completionTokens === "number"
        ? Math.max(0, body.completionTokens)
        : 0;
    const totalTokens =
      typeof body.totalTokens === "number" ? Math.max(0, body.totalTokens) : 0;

    if (!eventId || !model || totalTokens <= 0) {
      return NextResponse.json(
        { error: "eventId, model, and totalTokens are required." },
        { status: 400 },
      );
    }

    await recordOpenAiUsage({
      eventId,
      clerkId: userId,
      source,
      model,
      promptTokens,
      completionTokens,
      totalTokens,
      moduleId: typeof body.moduleId === "string" ? body.moduleId : undefined,
      scenarioId: typeof body.scenarioId === "string" ? body.scenarioId : undefined,
      attemptId: typeof body.attemptId === "string" ? body.attemptId : undefined,
      requestPath: "/api/openai/usage",
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[/api/openai/usage]", error);
    return NextResponse.json(
      { error: "Unable to record OpenAI usage." },
      { status: 500 },
    );
  }
}
