export const runtime = 'edge';

export async function POST(req) {
  try {
    const { text } = await req.json(); // نكتفي باستقبال النص فقط للتجربة

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: text || "مرحباً" }]
      }),
    });

    const data = await response.json();
    
    // إذا كان هناك خطأ من OpenAI، سنظهره بوضوح
    if (data.error) {
      return Response.json({ error: data.error.message }, { status: 500 });
    }

    return Response.json({ summary: data.choices[0].message.content });
  } catch (error) {
    return Response.json({ error: "خطأ غير متوقع: " + error.message }, { status: 500 });
  }
}
