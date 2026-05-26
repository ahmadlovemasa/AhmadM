import { GoogleGenerativeAI } from "@google/generative-ai";

export const runtime = 'edge'; 

export async function POST(req) {
  try {
    const { prompt } = await req.json();
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return Response.json({ summary: response.text() });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
