"use client";

import { useState, useEffect, useRef } from "react";
import { FaRobot, FaBrain, FaCode, FaCopy, FaCheck, FaHistory, FaImage, FaTrash } from "react-icons/fa";

export default function Home() {
  const [text, setText] = useState("");
  const [image, setImage] = useState<string | null>(null); // لحفظ الصورة بصيغة Base64
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const [sumType, setSumType] = useState("bullets"); 
  const [sumLength, setSumLength] = useState("detailed"); 
  const [history, setHistory] = useState<string[]>([]);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const savedHistory = localStorage.getItem("ahmad_ai_history");
    if (savedHistory) setHistory(JSON.parse(savedHistory));
  }, []);

  const saveToHistory = (newSummary: string) => {
    const updated = [newSummary, ...history.slice(0, 4)]; 
    setHistory(updated);
    localStorage.setItem("ahmad_ai_history", JSON.stringify(updated));
  };

  // دالة تحويل الصورة المرفوعة إلى Base64
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAction = async (isQuiz = false) => {
    if (!text && !image) {
      alert("الرجاء إدخال نص أو رفع صورة سلايد أولاً!");
      return;
    }
    setLoading(true);
    if (!isQuiz) setSummary("");

    try {
      const response = await fetch("/api/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          text, 
          image, // إرسال الصورة للسيرفر
          type: sumType, 
          length: sumLength, 
          generateQuiz: isQuiz 
        }),
      });

      const data = await response.json();
      if (response.ok) {
        if (isQuiz) {
          setSummary((prev) => prev + "\n\n" + "============ 📝 الكويز الذكي ============\n\n" + data.summary);
        } else {
          setSummary(data.summary);
          saveToHistory(data.summary);
        }
      } else {
        alert(data.error || "حدث خطأ أثناء المعالجة");
      }
    } catch (error) {
      alert("فشل الاتصال بالسيرفر");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!summary) return;
    navigator.clipboard.writeText(summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;

  return (
    <div style={styles.container} dir="rtl">
      <style>{`
        body { margin: 0; background-color: #0b0f19; font-family: sans-serif; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-thumb { background: #10b981; border-radius: 10px; }
      `}</style>
      
      <header style={styles.header}>
        <div style={styles.logo}>
          AM<span style={{ color: "#10b981" }}>Notebook</span>
        </div>
        <div style={styles.badge}>● تحليل الصور والسلايدات مفعّل 📸</div>
      </header>

      <main style={styles.mainGrid}>
        
        {/* البوكس اليمين: التحكم والإدخال */}
        <div style={styles.card}>
          <div>
            <h2 style={styles.cardTitle}>لوحة التحكم الذكية ✨</h2>
            <p style={styles.cardSubtitle}>اكتب نصوصك أو ارفع صورة السلايد مباشرة لتحليلها.</p>
          </div>

          <div style={styles.optionsContainer}>
            <div style={styles.optionGroup}>
              <label style={styles.label}>أسلوب التلخيص:</label>
              <select value={sumType} onChange={(e) => setSumType(e.target.value)} style={styles.select}>
                <option value="bullets">نقاط رئيسية (Bullets)</option>
                <option value="paragraph">فقرة نصية مدمجة</option>
                <option value="qa">سؤال وجواب (Q&A)</option>
              </select>
            </div>

            <div style={styles.optionGroup}>
              <label style={styles.label}>حجم التلخيص:</label>
              <select value={sumLength} onChange={(e) => setSumLength(e.target.value)} style={styles.select}>
                <option value="detailed">تفصيلي شامل للمادة</option>
                <option value="short">مكثف ومختصر جداً</option>
              </select>
            </div>
          </div>

          {/* منطقة الإدخال المختلط (نص + صورة) */}
          <div style={{ position: "relative", display: "flex", flexDirection: "column", gap: "10px" }}>
            <textarea
              style={styles.textarea}
              placeholder="الصق نصوص المحاضرات هنا... (أو ارفع صورة من الزر بالأسفل)"
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
            <div style={styles.wordCounter}>عدد الكلمات: {wordCount}</div>

            {/* معاينة الصورة المرفوعة */}
            {image && (
              <div style={styles.imagePreviewContainer}>
                <img src={image} alt="Slide preview" style={styles.imagePreview} />
                <button onClick={() => setImage(null)} style={styles.deleteImageBtn} title="حذف الصورة">
                  <FaTrash />
                </button>
              </div>
            )}

            {/* كبسة رفع الصورة المخفية */}
            <input 
              type="file" 
              accept="image/*" 
              ref={fileInputRef} 
              onChange={handleImageChange} 
              style={{ display: "none" }} 
            />
            
            <button 
              type="button"
              onClick={() => fileInputRef.current?.click()} 
              style={image ? { ...styles.uploadBtn, borderColor: "#10b981", color: "#10b981" } : styles.uploadBtn}
            >
              <FaImage /> {image ? "تغيير صورة السلايد المرفوعة" : "إرفاق صورة لقطة شاشة / سلايد"}
            </button>
          </div>

          <button
            onClick={() => handleAction(false)}
            disabled={loading}
            style={loading ? { ...styles.button, backgroundColor: "#1e293b", color: "#64748b" } : styles.button}
          >
            {loading ? "جاري معالجة السلايدات..." : "اضغط للتحليل والتلخيص الفوري ⚡"}
          </button>
        </div>

        {/* البوكس اليسار: النتائج */}
        <div style={styles.leftColumn}>
          
          <div style={styles.resultCard}>
            <div style={styles.resultHeader}>
              <div style={{ display: "flex", alignItems: "center" }}>
                <FaRobot style={{ color: "#10b981" }} />
                <span style={{ marginRight: "8px" }}>الملخص والنتائج الذكية</span>
              </div>
              {summary && (
                <button onClick={handleCopy} style={styles.copyButton} title="نسخ النتيجة">
                  {copied ? <FaCheck style={{ color: "#10b981" }} /> : <FaCopy />}
                </button>
              )}
            </div>
            
            <div style={styles.resultBody}>
              {summary || "بانتظار نصوصك أو صور السلايدات لتوليد السحر الأكاديمي هنا..."}
            </div>

            {summary && !summary.includes("📝 الكويز الذكي") && (
              <button 
                onClick={() => handleAction(true)} 
                disabled={loading}
                style={styles.quizButton}
              >
                🎯 اختبر نفسك: حوّل هذا المحتوى إلى كويز (MCQ) سريع!
              </button>
            )}
          </div>

          <div style={styles.miniGrid}>
            <div style={styles.miniCard}>
              <div style={{ display: "flex", alignItems: "center", gap: "6px", fontWeight: "bold", fontSize: "13px" }}>
                <FaHistory style={{ color: "#3b82f6" }} />
                <span>آخر التلخيصات اليوم:</span>
              </div>
              <div style={styles.historyList}>
                {history.length === 0 ? (
                  <span style={{ color: "#475569", fontSize: "11px" }}>لا يوجد تلخيصات سابقة بعد.</span>
                ) : (
                  history.map((h, i) => (
                    <div key={i} onClick={() => setSummary(h)} style={styles.historyItem}>
                      📄 ملخص رقم {i + 1} (اضغط للعرض)
                    </div>
                  ))
                )}
              </div>
            </div>

            <div style={styles.miniCard}>
              <FaBrain style={{ color: "#a855f7", marginBottom: "5px" }} />
              <div style={{ fontWeight: "bold", fontSize: "13px" }}>التحليل البصري</div>
              <div style={{ color: "#64748b", fontSize: "11px" }}>ارفع صور الجداول، الرسومات البيانية أو نصوص السلايدات ليتم تفكيكها فوراً.</div>
            </div>
          </div>

        </div>

      </main>

      <footer style={styles.footer}>
        <FaCode style={{ color: "#475569" }} />
        <span style={{ marginRight: "6px" }}>Created by <span style={{ color: "#10b981", fontWeight: "bold" }}>Ahmad</span></span>
      </footer>
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    minHeight: "100vh",
    backgroundColor: "#0b0f19",
    color: "#ffffff",
    padding: "0 20px",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    maxWidth: "1200px",
    width: "100%",
    margin: "0 auto",
    padding: "20px 0",
    borderBottom: "1px solid #1e293b",
  },
  logo: {
    fontSize: "24px",
    fontWeight: "bold",
    letterSpacing: "1px",
  },
  badge: {
    fontSize: "12px",
    backgroundColor: "rgba(16, 185, 129, 0.1)",
    border: "1px solid rgba(16, 185, 129, 0.2)",
    padding: "6px 12px",
    borderRadius: "20px",
    color: "#10b981",
  },
  mainGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "30px",
    maxWidth: "1200px",
    width: "100%",
    margin: "30px auto",
    flexGrow: 1,
    alignItems: "stretch",
  },
  card: {
    backgroundColor: "#111827",
    border: "1px solid #1e293b",
    borderRadius: "16px",
    padding: "24px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    gap: "15px",
  },
  cardTitle: {
    fontSize: "22px",
    fontWeight: "bold",
    margin: "0 0 4px 0",
  },
  cardSubtitle: {
    color: "#94a3b8",
    fontSize: "13px",
    margin: 0,
  },
  optionsContainer: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "15px",
    backgroundColor: "#070a12",
    padding: "12px",
    borderRadius: "12px",
    border: "1px solid #1e293b",
  },
  optionGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "5px",
  },
  label: {
    fontSize: "11px",
    color: "#94a3b8",
    fontWeight: "bold",
  },
  select: {
    backgroundColor: "#111827",
    color: "white",
    border: "1px solid #334155",
    padding: "8px",
    borderRadius: "8px",
    fontSize: "12px",
    outline: "none",
    cursor: "pointer",
  },
  textarea: {
    width: "100%",
    height: "150px",
    backgroundColor: "#070a12",
    border: "1px solid #334155",
    borderRadius: "12px",
    padding: "15px",
    paddingBottom: "30px",
    color: "#ffffff",
    fontSize: "14px",
    resize: "none",
    outline: "none",
  },
  wordCounter: {
    position: "absolute",
    top: "125px",
    left: "15px",
    fontSize: "11px",
    color: "#475569",
  },
  uploadBtn: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    backgroundColor: "transparent",
    border: "1px dashed #334155",
    borderRadius: "8px",
    padding: "10px",
    color: "#94a3b8",
    fontSize: "13px",
    cursor: "pointer",
  },
  imagePreviewContainer: {
    position: "relative",
    width: "100%",
    height: "100px",
    borderRadius: "8px",
    overflow: "hidden",
    border: "1px solid #1e293b",
  },
  imagePreview: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
  deleteImageBtn: {
    position: "absolute",
    top: "8px",
    left: "8px",
    backgroundColor: "rgba(239, 68, 68, 0.8)",
    border: "none",
    color: "white",
    borderRadius: "4px",
    padding: "5px 8px",
    cursor: "pointer",
  },
  button: {
    width: "100%",
    backgroundColor: "#10b981",
    color: "#000000",
    border: "none",
    borderRadius: "12px",
    padding: "14px",
    fontSize: "15px",
    fontWeight: "bold",
    cursor: "pointer",
  },
  leftColumn: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    gap: "20px",
  },
  resultCard: {
    flexGrow: 1,
    backgroundColor: "#111827",
    border: "1px solid #1e293b",
    borderRadius: "16px",
    padding: "24px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    minHeight: "300px",
  },
  resultHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    fontSize: "14px",
    fontWeight: "bold",
    borderBottom: "1px solid #1e293b",
    paddingBottom: "10px",
    marginBottom: "10px",
  },
  copyButton: {
    background: "none",
    border: "none",
    color: "#94a3b8",
    cursor: "pointer",
    fontSize: "16px",
    display: "flex",
    alignItems: "center",
  },
  resultBody: {
    color: "#cbd5e1",
    fontSize: "14px",
    lineHeight: "1.6",
    overflowY: "auto",
    maxHeight: "180px",
    whiteSpace: "pre-wrap",
    flexGrow: 1,
  },
  quizButton: {
    backgroundColor: "rgba(234, 179, 8, 0.1)",
    border: "1px solid rgba(234, 179, 8, 0.3)",
    color: "#eab308",
    borderRadius: "8px",
    padding: "10px",
    fontSize: "12px",
    fontWeight: "bold",
    cursor: "pointer",
    marginTop: "10px",
  },
  miniGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "15px",
  },
  miniCard: {
    backgroundColor: "rgba(17, 24, 39, 0.6)",
    border: "1px solid #1e293b",
    borderRadius: "12px",
    padding: "15px",
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },
  historyList: {
    display: "flex",
    flexDirection: "column",
    gap: "5px",
    overflowY: "auto",
    maxHeight: "60px",
  },
  historyItem: {
    fontSize: "11px",
    color: "#10b981",
    cursor: "pointer",
    textDecoration: "underline",
  },
  footer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: "20px 0",
    fontSize: "12px",
    color: "#475569",
    borderTop: "1px solid #1e293b",
    marginTop: "20px",
  },
};
