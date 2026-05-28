import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const { text } = await req.json();

    // 1. التلخيص من OpenAI
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: `قم بتلخيص هذا النص: ${text}` }]
      }),
    });

    const data = await response.json();
    const summary = data.choices[0].message.content;

    // 2. استخدام الاتصال المباشر (REST API) بدون الاعتماد على أي مكتبات خارجية
    // هذا الكود لا يتطلب وجود supabase-js في الـ package.json، لذا سيتخطى خطأ الـ Build
    await fetch(`${process.env.SUPABASE_URL}/rest/v1/summaries`, {
      method: 'POST',
      headers: {
        'apikey': process.env.SUPABASE_KEY,
        'Authorization': `Bearer ${process.env.SUPABASE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify({ original_text: text, summary_result: summary })
    });

    return NextResponse.json({ summary });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
