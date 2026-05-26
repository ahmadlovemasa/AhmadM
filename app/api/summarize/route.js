export const runtime = 'edge';

export async function POST(req) {
  const { prompt } = await req.json();

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }]
      }),
    });

    const data = await response.json();
    
    if (!response.ok) throw new Error(data.error?.message || "فشل الاتصال");

    return Response.json({ summary: data.choices[0].message.content });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
