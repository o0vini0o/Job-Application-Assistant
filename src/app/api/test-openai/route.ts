import { NextRequest, NextResponse } from "next/server";
import { analyzeJobPosting } from "@/lib/utils/services/openai";

export async function POST(req: NextRequest) {
  console.log("✅ /api/test-openai called");
  try {
    const { jobDescription, jobUrl } = await req.json();

    if (!jobDescription && !jobUrl) {
      return NextResponse.json(
        { error: "jobDescription or jobUrl is required" },
        { status: 400 }
      );
    }

    const analysisResult = await analyzeJobPosting({ jobDescription, jobUrl });

    return NextResponse.json(analysisResult, { status: 200 });
  } catch (error) {
    console.error("OpenAI analysis error:", error);
    return NextResponse.json(
      { error: "Failed to analyze job posting" },
      { status: 500 }
    );
  }
}
