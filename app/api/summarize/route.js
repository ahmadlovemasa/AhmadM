import { NextResponse } from "next/server";
import OpenAI from "openai";
export const runtime = 'nodejs';
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req) {
  try {
    // استقبال النص، الصورة (Base64)، والخيارات من الواجهة
    const { text, image, type, length, generateQuiz } = await req.json();

    // التأكد من أن المستخدم أدخل نصاً أو صورة على الأقل
    if (!text && !image) {
      return NextResponse.json({ error: "الرجاء إدخال نص أو رفع صورة سلايد أولاً!" }, { status: 400 });
    }

    // بناء الأوامر (Prompt) الأكاديمية
    let systemPrompt = "أنت مساعد أكاديمي محترف ومخصص لطلبة الجامعات. مهمتك هي تحليل وتلخيص النصوص أو صور السلايدات والمحاضرات بدقة.";
    
    if (generateQuiz) {
      systemPrompt += " المطلوب ليس تلخيصاً، بل إنشاء كويز مكون من 3 أسئلة اختيار من متعدد (MCQ) بناءً على المحتوى المقدم، مع توضيح الإجابة الصحيحة لكل سؤال بأسلوب مرتب وواضح.";
    } else {
      systemPrompt += ` المطلوب تلخيص المحتوى كـ ${type === "bullets" ? "نقاط رئيسية واضحة (Bullet Points)" : type === "qa" ? "أسئلة وأجوبة مراجعة (Q&A)" : "فقرة مدمجة ومترابطة"}.`;
      systemPrompt += ` حجم التلخيص يجب أن يكون ${length === "short" ? "مكثف جداً ومختصر (للمراجعة السريعة)" : "تفصيلي وشامل لكل الأفكار الرئيسية فرع بفرع"}.`;
    }

    // تجهيز محتوى الرسالة (تتحمل نص وصورة معاً)
    const userContent = [];

    // إذا في نص ضيفه
    if (text) {
      userContent.push({ type: "text", text: text });
    }

    // إذا في صورة مرفوعة (Base64) مررها للنموذج بالصيغة المدعومة من OpenAI
    if (image) {
      userContent.push({
        type: "image_url",
        image_url: {
          url: image, // الـ Base64 string بيبدأ بـ data:image/...
        },
      });
    }

    const response = await openai.chat.completions.create({
      model: "gpt-4o", 
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userContent },
      ],
    });

    return NextResponse.json({ summary: response.choices[0].message.content });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "حدث خطأ في السيرفر أثناء معالجة المحتوى" }, { status: 500 });
  }
}
