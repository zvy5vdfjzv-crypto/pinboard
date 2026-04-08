import { NextResponse } from "next/server";

export async function GET() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return NextResponse.json({ error: "No API key" });
  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
  const data = await res.json();
  const models = (data.models || []).map((m: { name: string; supportedGenerationMethods: string[] }) => ({ name: m.name, methods: m.supportedGenerationMethods }));
  return NextResponse.json({ models });
}
