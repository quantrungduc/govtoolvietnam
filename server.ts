import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";

dotenv.config();

// Initialize Gemini SDK server-side
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

const app = express();
const PORT = 3000;

// Increase payload sizes for file upload & OCR base64
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// --- API ROUTES ---

// 1. Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", time: new Date().toISOString() });
});

// 2. Check Thể thức Văn bản (Nghị định 30/2020/NĐ-CP)
app.post("/api/tool/check-the-thuc", async (req, res) => {
  try {
    const { content } = req.body;
    if (!content) {
      return res.status(400).json({ error: "Nội dung văn bản không được để trống" });
    }

    const systemInstruction = `Bạn là một chuyên gia pháp chế hành chính Việt Nam, am hiểu sâu sắc Nghị định 30/2020/NĐ-CP về công tác văn thư.
Nhiệm vụ của bạn là rà soát văn bản tiếng Việt được nhập vào và phân tích xem có bất kỳ lỗi thể thức nào (lỗi căn lề, lỗi thứ tự trình bày các thành phần: Quốc hiệu tiêu ngữ, Tên cơ quan ban hành, Số ký hiệu, Địa danh ngày tháng, Tên loại văn bản, Trích yếu nội dung, Phần chữ ký đóng dấu, Nơi nhận...).
Hãy trả về một phân tích chi tiết dưới dạng JSON gồm:
1. score: Điểm số thể thức văn bản từ 0 đến 100.
2. overallReview: Nhận xét tổng quan ngắn gọn về thể thức.
3. violations: Mảng các lỗi hành chính thể thức phát hiện được, mỗi lỗi gồm:
   - element: Thành phần văn bản bị lỗi (ví dụ: "Quốc hiệu Tiêu ngữ", "Chữ ký", "Địa danh Ngày tháng", "Nơi nhận"...)
   - severity: "Lỗi nghiêm trọng" hoặc "Cảnh báo" hoặc "Khuyến nghị"
   - description: Chi tiết lỗi theo chuẩn Nghị định 30 (ví dụ: Tiêu ngữ viết thiếu dấu gạch nối, ngày tháng không ghi bằng chữ cho số nhỏ hơn 10...)
   - originalText: Đoạn văn bản chứa lỗi
   - suggestion: Gợi ý sửa đổi chính xác theo mẫu Nghị định 30.
4. standardTemplate: Bản mẫu mô phỏng bố cục chuẩn của loại văn bản tương ứng chứa nội dung của họ dưới dạng văn bản đã chuẩn hóa thể thức hành chính sơ bộ.`;

    const prompt = `Hãy rà soát văn bản hành chính sau đây:\n\n${content}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            score: { type: Type.INTEGER },
            overallReview: { type: Type.STRING },
            violations: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  element: { type: Type.STRING },
                  severity: { type: Type.STRING },
                  description: { type: Type.STRING },
                  originalText: { type: Type.STRING },
                  suggestion: { type: Type.STRING },
                },
                required: ["element", "severity", "description", "suggestion"]
              }
            },
            standardTemplate: { type: Type.STRING }
          },
          required: ["score", "overallReview", "violations", "standardTemplate"]
        }
      }
    });

    res.json(JSON.parse(response.text || "{}"));
  } catch (err: any) {
    console.error("Error at check-the-thuc:", err);
    res.status(500).json({ error: err.message || "Lỗi máy chủ khi rà soát thể thức" });
  }
});

// 3. Check Lỗi Chính tả & Văn phong hành chính
app.post("/api/tool/check-chinh-ta", async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) {
      return res.status(400).json({ error: "Nội dung cần soát lỗi không được để trống" });
    }

    const systemInstruction = `Bạn là một trợ lý biên tập văn bản hành chính chuyên nghiệp của chính phủ Việt Nam.
Nhiệm vụ của bạn là rà soát kỹ văn bản tiếng Việt để tìm các lỗi:
1. Lỗi chính tả tiếng Việt.
2. Lỗi dấu câu, lỗi viết hoa sai quy chuẩn.
3. Lỗi từ ngữ địa phương, tiếng bồi, từ ngữ quá thông tục không phù hợp với văn phong hành chính trang trọng.
4. Lỗi lặp từ, lỗi diễn đạt rườm rà.

Mẫu phản hồi phải là JSON bao gồm:
1. correctedText: Toàn bộ văn bản đã được sửa đổi sạch sẽ và chuẩn hóa văn phong hành chính.
2. issues: Danh sách các lỗi phát hiện được, mỗi lỗi gồm:
   - type: Loại lỗi ("spelling" - lỗi chính tả, hoặc "grammar" - lỗi ngữ pháp/dấu câu, hoặc "style" - lỗi văn phong/từ ngữ hành chính).
   - original: Từ hoặc cụm từ bị lỗi gốc.
   - corrected: Từ hoặc cụm từ được sửa lại.
   - reason: Giải thích ngắn gọn lý do tại sao lỗi và tại sao chọn từ sửa đổi.
   - index: vị trí ước tính hoặc đoạn văn ngắn chứa lỗi để người dùng dễ tra cứu.`;

    const prompt = `Soát lỗi chính tả và văn phong hành chính cho đoạn sau:\n\n${text}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            correctedText: { type: Type.STRING },
            issues: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  type: { type: Type.STRING },
                  original: { type: Type.STRING },
                  corrected: { type: Type.STRING },
                  reason: { type: Type.STRING },
                  index: { type: Type.STRING }
                },
                required: ["type", "original", "corrected", "reason"]
              }
            }
          },
          required: ["correctedText", "issues"]
        }
      }
    });

    res.json(JSON.parse(response.text || "{}"));
  } catch (err: any) {
    console.error("Error at check-chinh-ta:", err);
    res.status(500).json({ error: err.message || "Lỗi máy chủ khi rà soát chính tả" });
  }
});

// 4. Bóc tách Văn bản (OCR Pro) using multimodal
app.post("/api/tool/ocr-pro", async (req, res) => {
  try {
    const { imageBase64, mimeType } = req.body;
    if (!imageBase64) {
      return res.status(400).json({ error: "Thiếu dữ liệu hình ảnh bóc tách" });
    }

    // Process using Gemini 3.5-flash which has multimodal abilities
    const imagePart = {
      inlineData: {
        mimeType: mimeType || "image/png",
        data: imageBase64,
      },
    };

    const promptText = {
      text: "Hãy bóc tách toàn bộ chữ viết trong hình ảnh văn bản này một cách chính xác tuyệt đối. Hãy sửa lỗi gõ hoặc lỗi nhận diện quang học (OCR) nếu có để chữ viết được mạch lạc, giữ nguyên cấu trúc phân đoạn, tiêu đề. Trả về định dạng Markdown sạch sẽ với bố cục dễ nhìn. Ngoài ra, hãy đưa ra một tóm tắt ngắn khoảng 3 câu về nội dung chính của văn bản này đặt ở đầu đoạn dưới dạng mục 'Tóm tắt nhanh'.",
    };

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: { parts: [imagePart, promptText] },
    });

    res.json({ text: response.text });
  } catch (err: any) {
    console.error("Error at ocr-pro:", err);
    res.status(500).json({ error: err.message || "Lỗi máy chủ khi thực hiện OCR" });
  }
});

// 5. Smart Citation (Trích dẫn Luật) with Google Search grounding
app.post("/api/tool/smart-citation", async (req, res) => {
  try {
    const { query, context } = req.body;
    if (!query) {
      return res.status(400).json({ error: "Vui lòng nhập nội dung tra cứu hoặc điều khoản" });
    }

    const fullPrompt = `Hãy tìm kiếm và đề xuất các điều khoản luật hành chính Việt Nam chính xác liên quan đến việc này: "${query}".
${context ? `Bối cảnh văn bản đi kèm: "${context}"` : ''}

Yêu cầu cụ thể:
1. Đưa ra danh sách các căn cứ pháp lý thích hợp (Bộ luật, Luật, Nghị định, Thông tư...) liên quan đến yêu cầu tra cứu.
2. Với mỗi căn cứ, trích dẫn chính xác Số ký hiệu văn bản quy phạm pháp luật, Tên điều khoản, nội dung cốt lõi và cách viết câu dẫn chiếu chuẩn trong văn bản hành chính (ví dụ: "Căn cứ Luật Tổ chức Chính phủ ngày...").
3. Thêm một mảng đề xuất viết "Phần căn cứ pháp lý mở đầu" (Ví dụ: Căn cứ Hiến pháp..., Căn cứ Luật...) cho một văn bản quyết định hoặc tờ trình liên quan.

Nhập kết quả trả về dưới dạng JSON có cấu trúc sau:
{
  "summary": "Tóm tắt định hướng luồng pháp lý ngắn gọn",
  "citations": [
    {
      "source": "Tên văn bản luật quy phạm (ví dụ: Luật Ban hành văn bản quy phạm pháp luật 2015)",
      "clause": "Điều ... Khoản ...",
      "summaryContent": "Nội dung vắn tắt áp dụng",
      "citationPhrase": "Câu dẫn chiếu mẫu đề nghị sử dụng trong văn bản hành chính"
    }
  ],
  "openingCitationDraft": "Đoạn văn soạn thảo mẫu phần căn cứ ban đầu của Quyết định/Tờ trình gồm các luật vừa tìm thấy phối hợp lại thành chuẩn Nghị định 30.",
  "searchSources": []
}`;

    // Use Gemini with Google Search tool enabled
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: fullPrompt,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING },
            citations: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  source: { type: Type.STRING },
                  clause: { type: Type.STRING },
                  summaryContent: { type: Type.STRING },
                  citationPhrase: { type: Type.STRING }
                },
                required: ["source", "clause", "summaryContent", "citationPhrase"]
              }
            },
            openingCitationDraft: { type: Type.STRING }
          },
          required: ["summary", "citations", "openingCitationDraft"]
        }
      },
    });

    const parsedResult = JSON.parse(response.text || "{}");

    // Extract search groundings if available to enrich UI
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    if (chunks) {
      parsedResult.searchSources = chunks.map((c: any) => ({
        title: c.web?.title || "Nguồn bổ trợ",
        uri: c.web?.uri || "#"
      })).filter((c: any) => c.uri !== "#");
    } else {
      parsedResult.searchSources = [];
    }

    res.json(parsedResult);
  } catch (err: any) {
    console.error("Error at smart-citation:", err);
    res.status(500).json({ error: err.message || "Lỗi máy chủ khi tra cứu căn cứ luật" });
  }
});

// 6. Trợ lý Bóc băng & Tổng hợp Kết luận
app.post("/api/tool/boc-bang", async (req, res) => {
  try {
    const { transcript, title, type } = req.body;
    if (!transcript) {
      return res.status(400).json({ error: "Nội dung ghi chép cuộc họp không được để trống" });
    }

    const systemInstruction = `Bạn là một trợ lý thư ký tổng hợp văn bản xuất sắc cho UBND và ban ngành chính phủ Việt Nam.
Nhiệm vụ của bạn là tiếp nhận biên bản ghi âm gõ thô, bản thảo chép lời họp hành từ người dùng và tổng hợp thành một "Thông báo kết luận cuộc họp" hoặc "Biên bản cuộc họp" chuẩn hóa nghiêm ngặt theo Nghị định 30/2020/NĐ-CP và văn phong chính luận, quyết định hành chính Việt Nam.

Cơ cấu tóm tắt kết quả trả về dưới dạng JSON gồm:
1. meetingTitle: Tiêu đề cuộc họp hành chính chuẩn hóa.
2. keyDecisions: Mảng các quyết định, kết luận cốt lõi đã được thống nhất tại cuộc họp.
3. assignedTasks: Mảng các nhiệm vụ được phân công cụ thể gồm:
   - taskName: Chi tiết đầu việc được giao.
   - assignee: Đơn vị/cá nhân chủ trì thực hiện.
   - cooperator: Đơn vị/cá nhân phối hợp thực hiện (nếu có).
   - deadline: Thời hạn hoàn thành (ví dụ: trước ngày 15/6/2026 hoặc "báo cáo định kỳ hằng tháng").
4. documentDraft: Dự thảo văn bản Thông báo kết luận cuộc họp hoàn chỉnh có đầy đủ tiêu đề Quốc hiệu, kính gửi, nội dung kết luận phân chia theo nội dung phát biểu chỉ đạo của người chủ trì họp, và phần ký tên chịu trách nhiệm mô phỏng chuẩn Nghị định 30.`;

    const prompt = `Hãy tổng hợp và soạn thảo văn bản kết luận cuộc họp từ ghi chép thô sau:\n\nTiêu đề họp đề xuất: ${title || "Chưa có"}\nLoại tài liệu: ${type || "Thông báo kết luận"}\nNội dung ghi chép:\n${transcript}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            meetingTitle: { type: Type.STRING },
            keyDecisions: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            assignedTasks: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  taskName: { type: Type.STRING },
                  assignee: { type: Type.STRING },
                  cooperator: { type: Type.STRING },
                  deadline: { type: Type.STRING }
                },
                required: ["taskName", "assignee", "deadline"]
              }
            },
            documentDraft: { type: Type.STRING }
          },
          required: ["meetingTitle", "keyDecisions", "assignedTasks", "documentDraft"]
        }
      }
    });

    res.json(JSON.parse(response.text || "{}"));
  } catch (err: any) {
    console.error("Error at boc-bang:", err);
    res.status(500).json({ error: err.message || "Lỗi máy chủ khi bóc băng kết luận" });
  }
});

// --- VITE & STATIC SERVING SETUP ---

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    // Mount Vite middleware in development
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Serve static files in production
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`GovTools Vietnam Server running on port ${PORT}`);
  });
}

startServer();
