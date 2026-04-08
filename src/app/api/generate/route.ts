import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { prompt } = await request.json();
    if (!prompt || typeof prompt !== "string") {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error("GEMINI_API_KEY not found in environment");
      return NextResponse.json({ error: "Gemini API key not configured" }, { status: 500 });
    }

    console.log("Calling Gemini API with prompt:", prompt.substring(0, 50));

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp-image-generation:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `Generate a high quality, beautiful image based on this description: ${prompt}`,
                },
              ],
            },
          ],
          generationConfig: {
            responseModalities: ["TEXT", "IMAGE"],
          },
        }),
      }
    );

    const data = await response.json();
    console.log("Gemini response status:", response.status);
    console.log("Gemini response keys:", Object.keys(data));

    if (!response.ok) {
      console.error("Gemini API error:", JSON.stringify(data));
      return NextResponse.json(
        { error: data.error?.message || "Gemini API error", details: data },
        { status: response.status }
      );
    }

    const candidates = data.candidates;
    if (!candidates || candidates.length === 0) {
      console.error("No candidates in response:", JSON.stringify(data));
      return NextResponse.json(
        { error: "Nenhuma imagem gerada", details: data },
        { status: 500 }
      );
    }

    const parts = candidates[0].content?.parts || [];
    const imagePart = parts.find(
      (p: { inlineData?: { mimeType: string; data: string } }) => p.inlineData
    );
    const textPart = parts.find(
      (p: { text?: string }) => p.text
    );

    if (imagePart?.inlineData) {
      return NextResponse.json({
        image: `data:${imagePart.inlineData.mimeType};base64,${imagePart.inlineData.data}`,
        description: textPart?.text || "",
      });
    }

    console.error("No image in parts:", JSON.stringify(parts.map((p: Record<string, unknown>) => Object.keys(p))));
    return NextResponse.json(
      { error: "Nenhuma imagem na resposta", details: { partsKeys: parts.map((p: Record<string, unknown>) => Object.keys(p)) } },
      { status: 500 }
    );
  } catch (error) {
    console.error("Generate API error:", error);
    const msg = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: "Erro ao gerar imagem: " + msg },
      { status: 500 }
    );
  }
}
