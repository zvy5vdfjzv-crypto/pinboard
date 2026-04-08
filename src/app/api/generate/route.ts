import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { prompt } = await request.json();

    if (!prompt || typeof prompt !== "string") {
      return NextResponse.json(
        { error: "Prompt is required" },
        { status: 400 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "Gemini API key not configured" },
        { status: 500 }
      );
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp-image-generation:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{parts: [{text: `Generate a high quality, beautiful image based on this description: ${prompt}`}]}],
          generationConfig: {responseModalities: ["TEXT", "IMAGE"]},
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.text();
      console.error("Gemini API error:", errorData);
      return NextResponse.json({error: "Erro ao gerar imagem. Tente novamente."},{status: 500});
    }

    const data = await response.json();
    const candidates = data.candidates || [];
    for (const candidate of candidates) {
      const parts = candidate.content?.parts || [];
      for (const part of parts) {
        if (part.inlineData) {
          const mimeType = part.inlineData.mimeType || "image/png";
          const base64 = part.inlineData.data;
          return NextResponse.json({ imageUrl: `data:${mimeType};base64,${base64}` });
        }
      }
    }
    return NextResponse.json({error: "Nenhuma imagem foi gerada. Tente um prompt diferente."},{status: 200});
  } catch (error) {
    console.error("Generate error:", error);
    return NextResponse.json({error: "Erro interno. Tente novamente."},{status: 500});
  }
}
