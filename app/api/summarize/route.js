import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

export async function POST(req) {
  try {
    const { text } = await req.json();

    // 1. طلب التلخيص من OpenAI
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

    // 2. الحفظ في Supabase (هنا اللحظة الحاسمة)
    const { error } = await supabase.from('summaries').insert([
      { original_text: text, summary_result: summary }
    ]);

    if (error) {
      console.error("Supabase Error:", error);
      return NextResponse.json({ error: "فشل الحفظ: " + error.message }, { status: 500 });
    }

    return NextResponse.json({ summary });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
