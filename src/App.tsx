import React, { useState, useEffect, useRef } from "react";
import { 
  motion, 
  AnimatePresence 
} from "motion/react";
import { 
  Briefcase, 
  Building, 
  FileText, 
  HelpCircle, 
  CheckSquare, 
  CheckCircle2, 
  ArrowRight, 
  Upload, 
  BookOpen, 
  Search, 
  Volume2, 
  Award, 
  RotateCcw, 
  Copy, 
  Check, 
  AlertTriangle, 
  CornerDownRight, 
  FileSpreadsheet, 
  FileUp, 
  ChevronRight, 
  ChevronDown, 
  Send,
  Loader2,
  ExternalLink,
  Download,
  Terminal,
  Clock,
  Trash2
} from "lucide-react";

import { 
  THE_THUC_SAMPLES, 
  CHINH_TA_SAMPLES, 
  OCR_SAMPLES, 
  CITATION_SAMPLES, 
  TRANSCRIPT_SAMPLES, 
  HANDBOOKS, 
  UTILITY_NEWS 
} from "./data";

import { 
  CheckTheThucResponse, 
  CheckSpellingResponse, 
  SmartCitationResponse, 
  BocBangResponse 
} from "./types";

export default function App() {
  // Navigation tabs: 'dang', 'chinh-quyen', 'tai-nguyen', 'cam-nang-tro-giup'
  const [activeTab, setActiveTab] = useState<string>("chinh-quyen");

  // Selected tool for active workspace workspace: null | string
  const [activeTool, setActiveTool] = useState<string | null>(null);

  // States for Tool 1: Check Thể thức
  const [theThucInput, setTheThucInput] = useState<string>("");
  const [theThucLoading, setTheThucLoading] = useState<boolean>(false);
  const [theThucResponse, setTheThucResponse] = useState<CheckTheThucResponse | null>(null);
  const [theThucStep, setTheThucStep] = useState<string>("");

  // States for Tool 2: Check Chính tả & Văn phong
  const [spellingInput, setSpellingInput] = useState<string>("");
  const [spellingLoading, setSpellingLoading] = useState<boolean>(false);
  const [spellingResponse, setSpellingResponse] = useState<CheckSpellingResponse | null>(null);

  // States for Tool 3: PDF to Word/Excel
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfMockName, setPdfMockName] = useState<string>("");
  const [pdfLoading, setPdfLoading] = useState<boolean>(false);
  const [pdfResult, setPdfResult] = useState<{ text: string; data?: any[][] } | null>(null);
  
  // States for Tool 4: OCR Pro
  const [ocrImage, setOcrImage] = useState<string | null>(null);
  const [ocrImageMime, setOcrImageMime] = useState<string>("image/png");
  const [ocrLoading, setOcrLoading] = useState<boolean>(false);
  const [ocrResult, setOcrResult] = useState<string | null>(null);

  // States for Tool 5: Smart Citation
  const [citationQuery, setCitationQuery] = useState<string>("");
  const [citationContext, setCitationContext] = useState<string>("");
  const [citationLoading, setCitationLoading] = useState<boolean>(false);
  const [citationResponse, setCitationResponse] = useState<SmartCitationResponse | null>(null);

  // States for Tool 6: Bóc băng & Kết luận
  const [transcriptInput, setTranscriptInput] = useState<string>("");
  const [transcriptLoading, setTranscriptLoading] = useState<boolean>(false);
  const [transcriptResponse, setBocBangResponse] = useState<BocBangResponse | null>(null);

  // Handbook reading state
  const [expandedHandbookIdx, setExpandedHandbookIdx] = useState<number | null>(null);

  // Support / feedback form states
  const [feedbackName, setFeedbackName] = useState<string>("");
  const [feedbackContent, setFeedbackContent] = useState<string>("");
  const [feedbackEmail, setFeedbackEmail] = useState<string>("");
  const [feedbackSuccess, setFeedbackSuccess] = useState<boolean>(false);
  const [feedbackLoading, setFeedbackLoading] = useState<boolean>(false);

  // Copied states for feedback
  const [copiedStates, setCopiedStates] = useState<Record<string, boolean>>({});

  // Error notifications
  const [apiError, setApiError] = useState<string | null>(null);

  // Auto scroll to top on tool activation
  useEffect(() => {
    if (activeTool) {
      window.scrollTo({ top: 380, behavior: "smooth" });
    }
  }, [activeTool]);

  // Handle Copy To Clipboard helper
  const handleCopyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedStates((prev) => ({ ...prev, [key]: true }));
    setTimeout(() => {
      setCopiedStates((prev) => ({ ...prev, [key]: false }));
    }, 2000);
  };

  // 1. Run Check Thể thức
  const runCheckTheThuc = async (contentStr?: string) => {
    const textToRun = contentStr || theThucInput;
    if (!textToRun.trim()) {
      setApiError("Vui lòng nhập nội dung văn bản hành chính để rà soát.");
      return;
    }
    setApiError(null);
    setTheThucLoading(true);
    setTheThucResponse(null);

    // Simulate steps for dramatic polish
    const steps = [
      "Kiểm tra Quốc hiệu và Tiêu ngữ Việt Nam...",
      "Phân tích bố cục Số kí hiệu / Ngày tháng / Địa danh...",
      "Rà soát độ lệch lề thụt đầu dòng (Nghị định 30/2020/NĐ-CP)...",
      "Xác định chức danh ký và hộp Thẩm quyền đóng dấu..."
    ];

    let stepIdx = 0;
    setTheThucStep(steps[0]);
    const stepInterval = setInterval(() => {
      stepIdx++;
      if (stepIdx < steps.length) {
        setTheThucStep(steps[stepIdx]);
      } else {
        clearInterval(stepInterval);
      }
    }, 800);

    try {
      const res = await fetch("/api/tool/check-the-thuc", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: textToRun })
      });
      if (!res.ok) {
        throw new Error("Lỗi rà soát thể thức. Vui lòng kiểm tra phông kết nối máy chủ.");
      }
      const data = await res.json();
      setTheThucResponse(data);
    } catch (err: any) {
      setApiError(err.message || "Không thể hoàn thành phân tích thể thức.");
    } finally {
      clearInterval(stepInterval);
      setTheThucLoading(false);
    }
  };

  // 2. Run Check Spelling & Style
  const runCheckSpelling = async (textStr?: string) => {
    const textToRun = textStr || spellingInput;
    if (!textToRun.trim()) {
      setApiError("Vui lòng nhập văn bản cần soát lỗi chính tả.");
      return;
    }
    setApiError(null);
    setSpellingLoading(true);
    setSpellingResponse(null);

    try {
      const res = await fetch("/api/tool/check-chinh-ta", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: textToRun })
      });
      if (!res.ok) {
        throw new Error("Không thể rà soát lỗi văn phong chính tả.");
      }
      const data = await res.json();
      setSpellingResponse(data);
    } catch (err: any) {
      setApiError(err.message || "Gặp sự cố khi phân tích chính tả.");
    } finally {
      setSpellingLoading(false);
    }
  };

  // 3. Handle PDF upload simulation & parsing
  const handlePdfUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setPdfFile(file);
      setPdfMockName(file.name);
      triggerPdfSimulation(file.name);
    }
  };

  const loadMockPdf = (name: string) => {
    setPdfFile(null);
    setPdfMockName(name);
    triggerPdfSimulation(name);
  };

  const triggerPdfSimulation = (fileName: string) => {
    setPdfLoading(true);
    setPdfResult(null);
    setApiError(null);

    setTimeout(() => {
      setPdfLoading(false);
      if (fileName.endsWith(".xlsx") || fileName.includes("thu chi") || fileName.includes("Bảng")) {
        setPdfResult({
          text: `Đã kết bóc tách cấu trúc dữ liệu bảng biểu từ tệp "${fileName}" thành công bằng AI OCR Engine.`,
          data: [
            ["Số TT", "Nội dung chi tiêu hoạt động", "Đơn vị tính", "Số lượng", "Đơn giá (VND)", "Thành tiền (VND)", "Ghi chú"],
            ["01", "Mua sắm máy tính chi cục", "Bộ", "5", "22.500.000", "112.500.000", "Đang lắp đặt"],
            ["02", "Bảo dưỡng máy in laser phòng họp", "Lần", "2", "1.200.000", "2.400.000", "Đã thanh toán"],
            ["03", "Giấy in A4 Double A chuẩn", "Thùng", "15", "650.000", "9.750.000", "Đã nhập kho"],
            ["04", "Chi phí hội nghị tổng kết quý I", "Gói", "1", "18.000.000", "18.000.000", "Ủy nhiệm chi"],
            ["Tổng", "Tổng ngân sách thực chi có thuế VAT", "", "", "", "142.650.000", "Hợp lệ"]
          ]
        });
      } else {
        setPdfResult({
          text: `### KẾT QUẢ CHUYỂN ĐỔI FILE "${fileName.toUpperCase()}" SANG DỰ THẢO WORD (MARKDOWN)

#### ỦY BAN NHÂN DÂN QUẬN 1
**Số: 142/QĐ-UBND**
*Quận 1, ngày 15 tháng 5 năm 2026*

### QUYẾT ĐỊNH
**Về việc thành lập Hội đồng rà soát cải cách thủ tục hành chính trực thuộc UBND Quận 1**

CHỦ TỊCH ỦY BAN NHÂN DÂN QUẬN 1

- Căn cứ Luật Tổ chức chính quyền địa phương ngày 19 tháng 6 năm 2015;
- Căn cứ Nghị định số 61/2018/NĐ-CP của Chính phủ về thực hiện cơ chế một cửa trong giải quyết thủ tục hành chính;
- Xét đề nghị của trưởng phòng Nội vụ Quận 1.

### QUYẾT ĐỊNH:

**Điều 1.** Thành lập Hội đồng rà soát bao gồm các đồng chí lãnh đạo chủ chốt của Sở ban ngành phục vụ kế hoạch số hóa dữ liệu.
**Điều 2.** Hội đồng có trách nhiệm phân công các nhóm công tác rà soát lỗi văn phong, bảo mật và phản hồi lại Thường trực UBND trước ngày 30/10/2026.
**Điều 3.** Chánh Văn phòng HĐND-UBND, Trưởng phòng Nội vụ, Trưởng phòng Tài chính - Kế hoạch chịu trách nhiệm thi hành quyết định này.`
        });
      }
    }, 1800);
  };

  // 4. Run OCR Pro
  const runOcr = async (base64Data?: string, selectedMime?: string) => {
    const dataToUse = base64Data || ocrImage;
    if (!dataToUse) {
      setApiError("Vui lòng tải ảnh lên hoặc chọn mẫu giấy tờ quét sẵn.");
      return;
    }
    setApiError(null);
    setOcrLoading(true);
    setOcrResult(null);

    // Strip header from base64 if needed
    const cleanBase64 = dataToUse.includes(",") ? dataToUse.split(",")[1] : dataToUse;

    try {
      const res = await fetch("/api/tool/ocr-pro", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          imageBase64: cleanBase64,
          mimeType: selectedMime || ocrImageMime 
        })
      });
      if (!res.ok) {
        throw new Error("Không thể kết nối máy chủ để bóc tách OCR.");
      }
      const data = await res.json();
      setOcrResult(data.text);
    } catch (err: any) {
      setApiError(err.message || "Gặp sự cố khi thực hiện OCR.");
    } finally {
      setOcrLoading(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setOcrImageMime(file.type);
      const reader = new FileReader();
      reader.onloadend = () => {
        setOcrImage(reader.result as string);
        runOcr(reader.result as string, file.type);
      };
      reader.readAsDataURL(file);
    }
  };

  // 5. Run Smart Citation (Tra cứu Căn cứ luật)
  const runSmartCitation = async (customQuery?: string) => {
    const queryToSearch = customQuery || citationQuery;
    if (!queryToSearch.trim()) {
      setApiError("Vui lòng nhập vấn đề cần lập căn cứ pháp lý.");
      return;
    }
    setApiError(null);
    setCitationLoading(true);
    setCitationResponse(null);

    try {
      const res = await fetch("/api/tool/smart-citation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: queryToSearch, context: citationContext })
      });
      if (!res.ok) {
        throw new Error("Lỗi máy chủ khi tra cứu căn cứ luật.");
      }
      const data = await res.json();
      setCitationResponse(data);
    } catch (err: any) {
      setApiError(err.message || "Không thể tìm kiếm văn bản luật quy phạm.");
    } finally {
      setCitationLoading(false);
    }
  };

  // 6. Run Bóc băng & Kết luận cuộc họp
  const runBocBang = async (customTranscript?: string) => {
    const textToRun = customTranscript || transcriptInput;
    if (!textToRun.trim()) {
      setApiError("Vui lòng nhập nội dung ghi ghép thoại cuộc họp.");
      return;
    }
    setApiError(null);
    setTranscriptLoading(true);
    setBocBangResponse(null);

    try {
      const res = await fetch("/api/tool/boc-bang", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          transcript: textToRun,
          title: "Họp triển khai hành chính chỉ đạo",
          type: "Thông báo kết luận cuộc họp" 
        })
      });
      if (!res.ok) {
        throw new Error("Lỗi máy chủ khi lập biên bản / tóm tắt.");
      }
      const data = await res.json();
      setBocBangResponse(data);
    } catch (err: any) {
      setApiError(err.message || "Gặp sự cố phân tích lời thoại.");
    } finally {
      setTranscriptLoading(false);
    }
  };

  // 7. Submit Feedback / Support Form
  const handleSubmitFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackName.trim() || !feedbackContent.trim()) {
      return;
    }
    setFeedbackLoading(true);
    setFeedbackSuccess(false);

    // Realistic API interaction simulation
    setTimeout(() => {
      setFeedbackLoading(false);
      setFeedbackSuccess(true);
      setFeedbackName("");
      setFeedbackEmail("");
      setFeedbackContent("");
      // Clear notification after 4 secs
      setTimeout(() => setFeedbackSuccess(false), 5000);
    }, 1200);
  };

  return (
    <div id="app_root" className="min-h-screen bg-[#0a0a16] text-slate-100 font-sans selection:bg-[#cc1c18]/30 selection:text-red-300 antialiased relative overflow-hidden flex flex-col justify-between">
      
      {/* Ambient glass background blur elements */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-purple-900/15 blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-blue-900/15 blur-[150px]"></div>
        <div className="absolute top-[20%] right-[10%] w-[30%] h-[40%] rounded-full bg-indigo-800/10 blur-[100px]"></div>
        <div className="absolute top-[40%] left-[20%] w-[25%] h-[25%] rounded-full bg-rose-900/10 blur-[90px]"></div>
      </div>

      <div className="relative z-10 flex flex-col min-h-screen w-full">
        {/* HEADER SECTION */}
        <header id="gov_header" className="bg-white/5 backdrop-blur-xl border-b border-white/10 py-6 px-4 md:px-8 relative">
          <div id="gov_header_container" className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-4 text-center md:text-left justify-between">
            <div id="logo_group" className="flex flex-col md:flex-row items-center gap-4 cursor-pointer" onClick={() => { setActiveTool(null); }}>
              
              {/* National emblem customized vector icon */}
              <div id="national_emblem" className="w-16 h-16 bg-gradient-to-tr from-[#cf2a27] to-[#e0403d] rounded-full p-1 flex items-center justify-center shadow-md relative overflow-hidden ring-4 ring-amber-400">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_transparent_40%,_rgba(0,0,0,0.15))]"></div>
                {/* Vietnam gold star and emblem outlines in SVG */}
                <svg viewBox="0 0 100 100" className="w-12 h-12 text-yellow-400 fill-current drop-shadow-sm">
                  <circle cx="50" cy="50" r="32" fill="none" stroke="currentColor" strokeWidth="2.5" className="opacity-70" />
                  <path d="M50 22 L55 38 L72 38 L58 48 L63 65 L50 54 L37 65 L42 48 L28 38 L45 38 Z" fill="currentColor" />
                  <path d="M22 65 C 32 75, 68 75, 78 65" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                  <circle cx="50" cy="80" r="4" fill="currentColor" />
                </svg>
              </div>

              <div id="title_group">
                <h1 id="app_title" className="text-3xl font-extrabold tracking-tight text-white leading-none font-display">
                  CÔNG CHỨC SỐ
                </h1>
                <p id="app_subtitle" className="text-xs font-semibold text-slate-400 mt-1 uppercase tracking-widest font-mono">
                  Hệ thống Tiện ích Công chức Việt Nam
                </p>
              </div>
            </div>

            <div id="security_status_card" className="hidden lg:flex items-center gap-3 bg-emerald-500/10 border border-emerald-500/20 backdrop-blur-md px-4 py-2 rounded-xl text-left">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
              <div>
                <p className="text-xs font-black text-emerald-400 leading-none tracking-wider font-display">MÁY CHỦ AN TOÀN</p>
                <p className="text-[10px] text-emerald-500 mt-0.5 font-mono">Đường truyền bảo mật riêng tư</p>
              </div>
            </div>
          </div>
        </header>

        {/* COMPLIANT DEEP RED NAVIGATION BAR */}
        <nav id="gov_nav" className="text-white sticky top-0 z-40 bg-[#cc1c18] shadow-md">
          <div id="nav_container" className="max-w-7xl mx-auto px-2 md:px-6">
            <div id="nav_grid" className="grid grid-cols-4 items-stretch text-center">
              
              <button 
                id="nav_tab_dang"
                onClick={() => { setActiveTab("dang"); setActiveTool(null); }}
                className={`py-5 px-1 md:px-4 text-xs md:text-[15px] font-bold transition-all flex flex-col md:flex-row items-center justify-center gap-2 border-r border-white/15 ${
                  activeTab === "dang" 
                    ? "bg-[#a81a17] text-white" 
                    : "text-white/90 hover:bg-[#b01815] hover:text-white"
                }`}
              >
                <span className="w-5 h-5 flex items-center justify-center bg-white/15 rounded-md text-amber-300 font-serif">☭</span>
                Công cụ cơ quan Đảng
              </button>

              <button 
                id="nav_tab_chinh_quyen"
                onClick={() => { setActiveTab("chinh-quyen"); setActiveTool(null); }}
                className={`py-5 px-1 md:px-4 text-xs md:text-[15px] font-bold transition-all flex flex-col md:flex-row items-center justify-center gap-2 border-r border-white/15 ${
                  activeTab === "chinh-quyen" 
                    ? "bg-[#a81a17] text-white" 
                    : "text-white/90 hover:bg-[#b01815] hover:text-white"
                }`}
              >
                <Building className="w-4 h-4 text-amber-300" />
                Công cụ cơ quan chính quyền
              </button>

              <button 
                id="nav_tab_tai_nguyen"
                onClick={() => { setActiveTab("tai-nguyen"); setActiveTool(null); }}
                className={`py-5 px-1 md:px-4 text-xs md:text-[15px] font-bold transition-all flex flex-col md:flex-row items-center justify-center gap-2 border-r border-white/15 ${
                  activeTab === "tai-nguyen" 
                    ? "bg-[#a81a17] text-white" 
                    : "text-white/90 hover:bg-[#b01815] hover:text-white"
                }`}
              >
                <FileText className="w-4 h-4 text-amber-300" />
                Tài nguyên
              </button>

              <button 
                id="nav_tab_guide"
                onClick={() => { setActiveTab("cam-nang-tro-giup"); setActiveTool(null); }}
                className={`py-5 px-1 md:px-4 text-xs md:text-[15px] font-bold transition-all flex flex-col md:flex-row items-center justify-center gap-2 ${
                  activeTab === "cam-nang-tro-giup" 
                    ? "bg-[#a81a17] text-white" 
                    : "text-white/90 hover:bg-[#b01815] hover:text-white"
                }`}
              >
                <HelpCircle className="w-4 h-4 text-amber-300" />
                Cẩm nang &amp; Trợ giúp
              </button>

            </div>
          </div>
        </nav>

        {/* BANNER / HERO SECTION */}
        <section id="hero_banner" className="bg-[#fafbfc] border-b border-gray-200 py-16 px-4 md:px-8 relative overflow-hidden">
          <div id="hero_container" className="max-w-4xl mx-auto text-center relative z-10">
            <h2 id="hero_title" className="text-3xl md:text-[40px] font-extrabold tracking-tight text-gray-950 mt-1 leading-tight font-sans">
              Trợ lý Số Cho Công chức &amp; Viên chức
            </h2>
            <p id="hero_description" className="text-base md:text-lg text-gray-500 mt-3 max-w-2xl mx-auto font-medium leading-relaxed font-sans">
              Hệ thống công cụ chuyên nghiệp, bảo mật, nâng cao hiệu quả công tác
            </p>
            <div id="hero_buttons" className="flex items-center justify-center gap-4 mt-8">
              <button 
                id="hero_btn_start"
                onClick={() => {
                  setActiveTab("chinh-quyen");
                  setActiveTool(null);
                  const listEl = document.getElementById("outstanding_tools");
                  if (listEl) listEl.scrollIntoView({ behavior: "smooth" });
                }}
                className="px-6 py-2.5 bg-[#cc1c18] hover:bg-[#b01815] text-white font-bold rounded-lg shadow-sm transition-all flex items-center gap-2 transform active:scale-95 cursor-pointer font-sans duration-150"
              >
                Bắt đầu ngay
              </button>
              <button 
                id="hero_btn_info"
                onClick={() => {
                  const listEl = document.getElementById("outstanding_tools");
                  if (listEl) listEl.scrollIntoView({ behavior: "smooth" });
                }}
                className="px-6 py-2.5 bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-gray-900 font-bold rounded-lg transition-all shadow-sm cursor-pointer font-sans duration-150"
              >
                Tìm hiểu thêm
              </button>
            </div>
          </div>
        </section>

      {/* ACTIVE API ERROR ALERT BANNER */}
      {apiError && (
        <div className="max-w-7xl mx-auto mt-6 px-4">
          <div className="bg-red-500/15 border border-white/10 relative z-10 backdrop-blur-md border-l-4 border-l-red-500 p-4 rounded-xl flex items-start gap-3 shadow-lg">
            <AlertTriangle className="w-5 h-5 text-red-400 mt-0.5 shrink-0" />
            <div className="flex-1">
              <h4 className="text-xs sm:text-sm font-bold text-red-200">Thông báo cấu hình / Đã có sự cố xảy ra</h4>
              <p className="text-xs text-red-300/80 mt-1 font-medium">{apiError}</p>
              <p className="text-[10px] text-red-400/60 mt-2 font-mono uppercase">Vui lòng kiểm tra mục Secrets để chắc chắn khoá GEMINI_API_KEY hoạt động.</p>
            </div>
            <button 
              className="text-red-400 hover:text-red-300 text-xs font-bold"
              onClick={() => setApiError(null)}
            >
              Đóng
            </button>
          </div>
        </div>
      )}

      {/* CORE WORKSPACE SUB-SCREEN */}
      <div id="workspace_viewport" className="py-10 max-w-7xl mx-auto px-4 md:px-8">
        
        {/* TAB 1: CÔNG CỤ CƠ QUAN ĐẢNG */}
        {activeTab === "dang" && (
          <motion.div 
            initial={{ opacity: 0, y: 15 }} 
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-8 shadow-sm relative overflow-hidden"
          >
            <div className="absolute right-0 top-0 w-64 h-64 bg-red-500/5 rounded-full blur-3xl -z-10"></div>
            <div className="flex flex-col md:flex-row gap-6 items-center">
              <div className="w-16 h-16 bg-gradient-to-tr from-rose-600 to-red-500 rounded-2xl flex items-center justify-center text-amber-300 text-3xl font-serif shadow-lg">
                ☭
              </div>
              <div>
                <span className="text-xs font-bold text-red-400 tracking-widest uppercase font-mono">Khu vực văn phòng cấp cao</span>
                <h3 className="text-2xl font-extrabold text-white mt-1 font-display">Hệ thống Nghiệp vụ &amp; Văn bản Văn phòng Đảng ủy</h3>
                <p className="text-slate-400 text-sm mt-1">Các tiện ích rà soát Thể thức văn bản Đảng theo Quy định số 66-QĐ/TW và Hướng dẫn số 36-HD/VPTW của Văn phòng Trung ương Đảng.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-10">
              <div className="border border-dashed border-white/10 p-6 rounded-2xl bg-white/2 backdrop-blur-sm">
                <span className="px-2.5 py-1 bg-amber-500/10 text-amber-300 font-bold text-[10px] rounded-full uppercase border border-amber-500/20">Sắp ra mắt</span>
                <h4 className="text-base font-bold text-slate-100 mt-2">1. Trợ lý rà soát Báo cáo chính trị &amp; Nghị quyết Đảng</h4>
                <p className="text-xs text-slate-400 mt-1">Tự động cấu hóa các mẫu từ ngữ lý luận, rà soát lỗi chính trị, chính tả nhân sự và cơ cấu bố cục biểu quyết theo chuẩn nghiệp vụ ban thường vụ.</p>
                <button disabled className="mt-4 px-4 py-2 bg-white/5 text-slate-500 text-xs font-semibold rounded-lg cursor-not-allowed">Đang đồng bộ cơ sở vật chất</button>
              </div>

              <div className="border border-dashed border-white/10 p-6 rounded-2xl bg-white/2 backdrop-blur-sm">
                <span className="px-2.5 py-1 bg-amber-500/10 text-amber-300 font-bold text-[10px] rounded-full uppercase border border-amber-500/20">Sắp ra mắt</span>
                <h4 className="text-base font-bold text-slate-100 mt-2">2. Số hoá biên niên sử Chi bộ và Sổ tay Đảng viên AI</h4>
                <p className="text-xs text-slate-400 mt-1">Hỗ trợ thư ký tổng hợp biên bản biểu quyết chi bộ, rà soát lịch sinh hoạt chuyên đề hằng tháng phối hợp cơ sở dữ liệu quốc gia.</p>
                <button disabled className="mt-4 px-4 py-2 bg-white/5 text-slate-500 text-xs font-semibold rounded-lg cursor-not-allowed">Đang thẩm định nội dung</button>
              </div>
            </div>
          </motion.div>
        )}

        {/* TAB 2: CÔNG CỤ CHÍNH QUYỀN (MAIN HUB FOR 6 UTILITIES) */}
        {activeTab === "chinh-quyen" && (
          <div>
            
            {/* ANNOTATED FLOATING ACTIVE UTILITY VIEW CONTAINER */}
            <AnimatePresence mode="wait">
              {activeTool === "the-thuc" && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }} 
                  animate={{ opacity: 1, height: "auto" }} 
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-6 shadow-xl mb-10 overflow-hidden text-slate-100"
                >
                  <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-red-500/20 text-red-300 rounded-xl flex items-center justify-center border border-red-500/20 shadow-md">
                        <CheckSquare className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-lg font-extrabold text-white font-display">Rà soát Thể thức Văn bản</h3>
                        <p className="text-xs text-slate-400">Đối chiếu mẫu trình bày, canh lề, tiêu đề và chữ ký theo Nghị định 30/2020/NĐ-CP</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => { setActiveTool(null); setTheThucResponse(null); }}
                      className="text-slate-400 hover:text-white text-xs font-bold px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg border border-white/5 transition"
                    >
                      Đóng công cụ
                    </button>
                  </div>

                  {/* Interactivity elements */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    
                    {/* Input Pane */}
                    <div className="lg:col-span-6 flex flex-col">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-slate-300 uppercase tracking-wider font-display">Soạn thảo / Dán nội dung rà soát</span>
                        <div className="flex items-center gap-1">
                          <span className="text-[10px] text-slate-450 font-bold">Nạp nhanh mẫu:</span>
                          {THE_THUC_SAMPLES.map((s, idx) => (
                            <button
                              key={s.id}
                              onClick={() => setTheThucInput(s.content)}
                              className="text-[10px] font-bold px-2 py-1 bg-rose-500/10 text-rose-300 border border-rose-500/20 rounded hover:bg-rose-500/20 transition cursor-pointer"
                            >
                              Mẫu {idx + 1}
                            </button>
                          ))}
                        </div>
                      </div>

                      <textarea
                        value={theThucInput}
                        onChange={(e) => setTheThucInput(e.target.value)}
                        placeholder="Dán toàn bộ văn bản hành chính cần rà soát vào đây (bao gồm cả phần tiêu ngữ, nơi nhận, chữ ký để kiểm tra chuẩn hơn)..."
                        className="w-full h-80 px-4 py-3 bg-black/30 border border-white/10 rounded-2xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:bg-black/50 font-mono leading-relaxed resize-none placeholder-slate-500"
                      />

                      <div className="flex items-center justify-between mt-4">
                        <button
                          onClick={() => setTheThucInput("")}
                          className="text-xs font-bold text-slate-400 hover:text-white flex items-center gap-1.5 transition"
                        >
                          <RotateCcw className="w-3.5 h-3.5" /> Xóa nội dung
                        </button>

                        <button
                          onClick={() => runCheckTheThuc()}
                          disabled={theThucLoading}
                          className="px-5 py-2.5 bg-gradient-to-tr from-rose-600 to-red-500 hover:from-rose-500 hover:to-red-400 disabled:from-white/5 disabled:to-white/5 disabled:text-slate-500 disabled:shadow-none disabled:cursor-not-allowed text-white text-xs font-bold rounded-xl flex items-center gap-2 shadow-lg shadow-red-500/10 cursor-pointer transition-all"
                        >
                          {theThucLoading ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin" />
                              Phân tích...
                            </>
                          ) : (
                            <>Phân tích Thể thức hành chính</>
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Result Output Pane */}
                    <div className="lg:col-span-6 border border-white/10 rounded-2xl p-5 bg-white/2 backdrop-blur-sm min-h-[360px] flex flex-col">
                      
                      {theThucLoading && (
                        <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
                          <div className="relative w-14 h-14 mb-4">
                            <span className="absolute inset-0 rounded-full border-4 border-red-500/10"></span>
                            <span className="absolute inset-x-0 top-0 bottom-0 rounded-full border-4 border-red-500 border-t-transparent animate-spin"></span>
                          </div>
                          <p className="text-sm font-bold text-slate-200 font-display">{theThucStep}</p>
                          <p className="text-xs text-slate-400 mt-1">Hệ thống AI đang đối chiếu quy chuẩn kỹ thuật trình bày</p>
                        </div>
                      )}

                      {!theThucLoading && !theThucResponse && (
                        <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
                          <FileText className="w-12 h-12 text-slate-500 stroke-1 mb-2" />
                          <p className="text-sm font-bold text-slate-350">Chưa có kết quả rà soát</p>
                          <p className="text-xs text-slate-400 mt-1 max-w-xs">Hãy nhập văn bản hành chính của bạn ở ô bên trái hoặc nhấp chọn các mẫu dọn sẵn để kiểm tra tức thì.</p>
                        </div>
                      )}

                      {!theThucLoading && theThucResponse && (
                        <div className="flex-1 flex flex-col">
                          
                          {/* Score and summary header */}
                          <div className="flex items-center gap-4 bg-white/5 border border-white/10 p-4 rounded-xl shadow-sm mb-4">
                            
                            {/* Score Display Ring */}
                            <div className="relative w-16 h-16 shrink-0 flex items-center justify-center rounded-full bg-rose-500/15 border-2 border-rose-500/30 shadow-inner">
                              <span className="text-xl font-black text-rose-400">{theThucResponse.score}</span>
                              <span className="text-[9px] absolute bottom-1 font-bold text-rose-400/85">ĐIỂM</span>
                            </div>

                            <div>
                              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono">ĐÁNH GIÁ CHUNG</p>
                              <p className="text-sm font-extrabold text-slate-100 mt-0.5 leading-snug">{theThucResponse.overallReview}</p>
                            </div>
                          </div>

                          <div className="flex-1 overflow-y-auto max-h-[220px] space-y-3 pb-3">
                            <h4 className="text-xs font-extrabold text-slate-300 uppercase tracking-widest px-1 font-display">Lỗi được tìm thấy ({theThucResponse.violations.length})</h4>
                            
                            {theThucResponse.violations.length === 0 ? (
                              <div className="p-4 bg-emerald-550/10 text-emerald-400 rounded-xl border border-emerald-550/20 text-xs font-semibold flex items-center gap-2">
                                <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Tuyệt vời! Văn bản hoàn toàn đúng quy cách theo Nghị định 30/2020.
                              </div>
                            ) : (
                              theThucResponse.violations.map((violation, idx) => (
                                <div key={idx} className="bg-white/5 border border-white/5 rounded-xl p-3 shadow-md">
                                  <div className="flex items-center gap-2 justify-between">
                                    <span className="text-xs font-bold text-slate-200 bg-white/5 border border-white/5 px-2 py-0.5 rounded">
                                      {violation.element}
                                    </span>
                                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                                      violation.severity === "Lỗi nghiêm trọng" 
                                        ? "bg-red-500/20 text-red-400 border border-red-500/30" 
                                        : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                                    }`}>
                                      {violation.severity}
                                    </span>
                                  </div>
                                  <p className="text-xs text-slate-300 mt-2 font-medium">{violation.description}</p>
                                  
                                  {violation.originalText && (
                                    <div className="bg-red-500/10 text-rose-200 text-[11px] px-2 py-1 rounded font-mono mt-1.5 border border-red-500/10 font-bold">
                                      Đoạn lỗi: "{violation.originalText}"
                                    </div>
                                  )}

                                  <div className="mt-2 text-xs font-bold text-rose-400 flex items-start gap-1">
                                    <CornerDownRight className="w-3.5 h-3.5 shrink-0 mt-0.5 text-rose-400" />
                                    <span>Đề nghị sửa thành: "{violation.suggestion}"</span>
                                  </div>
                                </div>
                              ))
                            )}
                          </div>

                          {/* Trigger Standard corrected Template view */}
                          <div className="border-t border-white/10 pt-3 mt-auto flex items-center justify-between">
                            <span className="text-[10px] text-slate-400 font-bold">Tìm thấy khuôn dạng thay thế chuẩn</span>
                            <button
                              onClick={() => {
                                setTheThucInput(theThucResponse.standardTemplate);
                                handleCopyToClipboard(theThucResponse.standardTemplate, "thethuc");
                              }}
                              className="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 text-xs font-bold rounded-lg flex items-center gap-1.5 transition cursor-pointer"
                            >
                              <Copy className="w-3.5 h-3.5" /> 
                              {copiedStates["thethuc"] ? "Đã chép bản chuẩn!" : "Nạp & Chép bản chuẩn"}
                            </button>
                          </div>

                        </div>
                      )}

                    </div>

                  </div>
                </motion.div>
              )}

              {activeTool === "chinh-ta" && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }} 
                  animate={{ opacity: 1, height: "auto" }} 
                  className="bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-6 shadow-xl mb-10 overflow-hidden text-slate-100"
                >
                  <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-red-500/20 text-red-300 rounded-xl flex items-center justify-center border border-red-500/20 shadow-md">
                        <CheckSquare className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-lg font-extrabold text-white font-display">Check Lỗi Chính tả &amp; Văn phong hành chính</h3>
                        <p className="text-xs text-slate-400">Tìm kiếm lỗi từ ngữ, lỗi chính tả, sai phong thái chuẩn nhà nước và đề nghị chỉnh lý</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => { setActiveTool(null); setSpellingResponse(null); }}
                      className="text-slate-400 hover:text-white text-xs font-bold px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg border border-white/5 transition"
                    >
                      Đóng công cụ
                    </button>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    
                    {/* Left write column */}
                    <div className="lg:col-span-6 flex flex-col">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-slate-300 uppercase tracking-wider font-display">Nhập đoạn văn hành chính</span>
                        <div className="flex items-center gap-1">
                          <span className="text-[10px] text-slate-450 font-bold">Hành chính mẫu:</span>
                          {CHINH_TA_SAMPLES.map((s, idx) => (
                            <button
                              key={s.id}
                              onClick={() => setSpellingInput(s.text)}
                              className="text-[10px] font-bold px-2 py-1 bg-rose-500/10 text-rose-300 rounded hover:bg-rose-500/20 border border-rose-500/20 transition cursor-pointer"
                            >
                              Mẫu {idx + 1}
                            </button>
                          ))}
                        </div>
                      </div>

                      <textarea
                        value={spellingInput}
                        onChange={(e) => setSpellingInput(e.target.value)}
                        placeholder="Nhập hoặc dán đoạn văn cần rà soát lỗi chính tả hoặc từ ngữ không trang trọng..."
                        className="w-full h-80 px-4 py-3 bg-black/30 border border-white/10 rounded-2xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:bg-black/50 leading-relaxed resize-none placeholder-slate-500 font-mono"
                      />

                      <div className="flex items-center justify-between mt-4">
                        <button
                          onClick={() => setSpellingInput("")}
                          className="text-xs font-bold text-slate-400 hover:text-white flex items-center gap-1.5 transition"
                        >
                          <RotateCcw className="w-3.5 h-3.5" /> Xóa sạch
                        </button>

                        <button
                          onClick={() => runCheckSpelling()}
                          disabled={spellingLoading}
                          className="px-5 py-2.5 bg-gradient-to-tr from-rose-600 to-red-500 hover:from-rose-500 hover:to-red-400 text-white text-xs font-bold rounded-xl flex items-center gap-2 shadow-lg shadow-red-500/10 disabled:from-white/5 disabled:to-white/5 disabled:text-slate-500"
                        >
                          {spellingLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                          Soát văn phong &amp; Chính tả
                        </button>
                      </div>
                    </div>

                    {/* Right side modified highlight outcome */}
                    <div className="lg:col-span-6 border border-white/10 rounded-2xl p-5 bg-white/2 backdrop-blur-sm min-h-[360px] flex flex-col">
                      {spellingLoading && (
                        <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
                          <Loader2 className="w-10 h-10 text-rose-450 animate-spin mb-3" />
                          <p className="text-sm font-bold text-slate-200 font-display">Đang dò quét chính tả và văn phong chính xác...</p>
                        </div>
                      )}

                      {!spellingLoading && !spellingResponse && (
                        <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
                          <CheckSquare className="w-12 h-12 text-slate-500 stroke-1 mb-2" />
                          <p className="text-sm font-bold text-slate-350">Chưa có bản sửa đổi</p>
                          <p className="text-xs text-gray-400 mt-1 max-w-xs">Nạp một tệp mẫu để xem trợ lý số phát hiện và thay thế từ ngữ thông tục bằng từ ngữ hành chính chuyên nghiệp mẫu mực.</p>
                        </div>
                      )}

                      {!spellingLoading && spellingResponse && (
                        <div className="flex-1 flex flex-col">
                          <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-3">
                            <span className="text-xs font-bold text-slate-400 uppercase">Văn bản đã chuẩn hóa sạch sẽ</span>
                            <button
                              onClick={() => handleCopyToClipboard(spellingResponse.correctedText, "spelling")}
                              className="px-2.5 py-1 bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 text-xs font-bold rounded-lg flex items-center gap-1 transition cursor-pointer"
                            >
                              <Copy className="w-3.5 h-3.5" />
                              {copiedStates["spelling"] ? "Đã copy!" : "Sao chép bản sạch"}
                            </button>
                          </div>

                          <div className="bg-black/40 border border-white/10 rounded-xl p-4 text-xs font-medium text-slate-100 leading-relaxed max-h-[160px] overflow-y-auto mb-4 font-mono select-all">
                            {spellingResponse.correctedText}
                          </div>

                          <h4 className="text-xs font-extrabold text-slate-300 uppercase tracking-wider mb-2 font-display">Chi tiết điểm sửa ({spellingResponse.issues.length})</h4>
                          <div className="space-y-2 overflow-y-auto max-h-[140px] pr-1">
                            {spellingResponse.issues.map((issue, idx) => (
                              <div key={idx} className="bg-white/5 border border-white/5 p-2.5 rounded-xl shadow-md flex gap-2.5">
                                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase mt-0.5 shrink-0 ${
                                  issue.type === "spelling" 
                                    ? "bg-red-500/25 text-red-300" 
                                    : issue.type === "style" 
                                      ? "bg-indigo-500/25 text-indigo-300" 
                                      : "bg-amber-500/25 text-amber-300"
                                }`}>
                                  {issue.type === "spelling" ? "Chính tả" : issue.type === "style" ? "Văn phong" : "Ngữ pháp"}
                                </span>
                                <div>
                                  <div className="text-xs font-bold text-slate-200">
                                    <span className="line-through text-red-400 mr-1.5 font-normal">"{issue.original}"</span>
                                    <span className="text-green-400">→ "{issue.corrected}"</span>
                                  </div>
                                  <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">{issue.reason}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                  </div>
                </motion.div>
              )}

              {activeTool === "pdf-to-word" && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }} 
                  animate={{ opacity: 1, height: "auto" }} 
                  className="bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-6 shadow-xl mb-10 overflow-hidden text-slate-100"
                >
                  <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-red-500/20 text-red-300 rounded-xl flex items-center justify-center border border-red-500/20 shadow-md">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-lg font-extrabold text-white font-display">Chuyển đổi PDF sang Word/Excel bằng AI</h3>
                        <p className="text-xs text-slate-400">Bóc tách toàn bộ tài liệu hành chính, bản thảo cũ và giữ nguyên cấu trúc bảng biểu dữ liệu</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => { setActiveTool(null); setPdfResult(null); setPdfFile(null); setPdfMockName(""); }}
                      className="text-slate-400 hover:text-white text-xs font-bold px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/5 rounded-lg transition"
                    >
                      Đóng công cụ
                    </button>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    
                    {/* File Upload zone */}
                    <div className="lg:col-span-4 flex flex-col justify-between">
                      <div>
                        <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-2 font-display">Tải tệp tin (.pdf, .xlsx, .docx)</span>
                        <div className="border-2 border-dashed border-white/15 rounded-2xl p-6 text-center hover:border-red-500/50 transition-all bg-white/2 flex flex-col items-center justify-center min-h-[180px] relative cursor-pointer group">
                          <input 
                            type="file" 
                            accept=".pdf, .xlsx, .xls, .docx, .doc"
                            onChange={handlePdfUpload}
                            className="absolute inset-0 opacity-0 cursor-pointer"
                          />
                          <FileUp className="w-10 h-10 text-slate-500 group-hover:text-red-400 transition-colors mb-2" />
                          <p className="text-xs font-bold text-slate-200">Kéo thả tệp tin ở đây hoặc bấm duyệt</p>
                          <p className="text-[10px] text-slate-450 mt-1">Hỗ trợ PDF Hành chính, file ảnh scan, tệp excel biểu phí</p>
                        </div>
                      </div>

                      <div className="mt-4">
                        <span className="text-[11px] font-bold text-slate-450 block mb-1 font-mono uppercase tracking-wider">HOẶC DÙNG FILE MẪU BAN NGÀNH:</span>
                        <div className="space-y-1.5">
                          <button
                            onClick={() => loadMockPdf("Quyet_dinh_nhan_su_thu_khoa.pdf")}
                            className="w-full text-left text-xs font-semibold p-2 bg-white/2 border border-white/5 rounded-lg hover:border-red-500/30 hover:bg-red-500/5 text-slate-200 flex items-center justify-between transition cursor-pointer"
                          >
                            <span className="truncate">Quyet_dinh_nhan_su_thu_khoa.pdf</span>
                            <span className="text-[10px] text-red-300 font-bold bg-red-500/20 px-1.5 py-0.5 rounded shrink-0">Bản Word</span>
                          </button>
                          <button
                            onClick={() => loadMockPdf("Bang_Kinh_Phi_Mua_Sam_Chi_Cuc.xlsx")}
                            className="w-full text-left text-xs font-semibold p-2 bg-white/2 border border-white/5 rounded-lg hover:border-emerald-500/30 hover:bg-emerald-500/5 text-slate-200 flex items-center justify-between transition cursor-pointer"
                          >
                            <span className="truncate">Bang_Kinh_Phi_Mua_Sam_Chi_Cuc.xlsx</span>
                            <span className="text-[10px] text-emerald-300 font-bold bg-emerald-500/20 px-1.5 py-0.5 rounded shrink-0">Bảng Excel</span>
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Result and download options */}
                    <div className="lg:col-span-8 border border-white/10 rounded-2xl p-5 bg-white/2 backdrop-blur-sm min-h-[300px] flex flex-col">
                      {pdfLoading && (
                        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                          <Loader2 className="w-10 h-10 text-rose-450 animate-spin mb-3" />
                          <p className="text-sm font-bold text-slate-200 font-display">Đang khởi tạo thuật toán AI OCR bóc tách văn bản chuyên sâu...</p>
                          <p className="text-xs text-slate-405 mt-1">Hệ thống đang phục dựng lại định dạng, font chữ và căn lề bảng</p>
                        </div>
                      )}

                      {!pdfLoading && !pdfResult && (
                        <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
                          <FileSpreadsheet className="w-12 h-12 text-slate-500 stroke-1 mb-2" />
                          <p className="text-sm font-bold text-slate-350">Chưa nạp tệp chuyển đổi</p>
                          <p className="text-xs text-slate-400 mt-1 max-w-sm">Tải lên tệp PDF scan hoặc chọn một tệp mẫu dọn sẵn để theo dõi kết quả chuyển thể trung thực cấu trúc.</p>
                        </div>
                      )}

                      {!pdfLoading && pdfResult && (
                        <div className="flex-1 flex flex-col">
                          <div className="flex items-center justify-between border-b border-white/5 pb-3 mb-3">
                            <span className="text-xs font-extrabold text-red-300 uppercase tracking-wider bg-red-500/20 px-2.5 py-1 rounded border border-red-500/20 font-display">
                              Đã bóc tách thành công
                            </span>
                            <span className="text-xs font-medium text-slate-400 font-mono text-right truncate max-w-[200px]">
                              {pdfMockName}
                            </span>
                          </div>

                          {/* Dynamic layout for Excel or text word */}
                          {pdfResult.data ? (
                            <div className="flex-1 overflow-x-auto">
                              <table className="w-full text-left border-collapse bg-white/5 rounded-xl overflow-hidden border border-white/10">
                                <thead>
                                  <tr className="bg-white/5 text-slate-200 font-bold text-xs border-b border-white/10">
                                    {pdfResult.data[0].map((col, idx) => (
                                      <th key={idx} className="p-3 text-[11px] font-bold uppercase text-slate-300 font-display">{col}</th>
                                    ))}
                                  </tr>
                                </thead>
                                <tbody>
                                  {pdfResult.data.slice(1).map((row, rowIdx) => (
                                    <tr key={rowIdx} className="border-b border-white/5 hover:bg-white/5 font-mono text-xs">
                                      {row.map((cell, cellIdx) => (
                                        <td key={cellIdx} className={`p-3 ${cellIdx === 0 ? "font-bold text-slate-400" : cellIdx === 5 ? "font-bold text-amber-400" : "text-slate-300"}`}>{cell}</td>
                                      ))}
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          ) : (
                            <div className="flex-1 p-4 bg-black/45 border border-white/10 rounded-xl overflow-y-auto max-h-[180px] text-xs leading-relaxed text-slate-250 font-mono whitespace-pre-line select-all shadow-inner">
                              {pdfResult.text}
                            </div>
                          )}

                          <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between gap-2">
                            <span className="text-xs font-semibold text-slate-400">Chọn định dạng tải về máy:</span>
                            <div className="flex items-center gap-2">
                              {pdfResult.data ? (
                                <button
                                  onClick={() => handleCopyToClipboard(JSON.stringify(pdfResult.data), "csv")}
                                  className="px-4 py-2 bg-gradient-to-tr from-emerald-600 to-green-500 hover:from-emerald-500 hover:to-green-400 text-white text-xs font-bold rounded-xl flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition cursor-pointer"
                                >
                                  <Download className="w-3.5 h-3.5" /> 
                                  {copiedStates["csv"] ? "Đã html mảng Excel!" : "Tải Excel .xlsx tiêu chuẩn"}
                                </button>
                              ) : (
                                <button
                                  onClick={() => handleCopyToClipboard(pdfResult.text, "docx")}
                                  className="px-4 py-2 bg-gradient-to-tr from-rose-600 to-red-500 hover:from-rose-500 hover:to-red-400 text-white text-xs font-bold rounded-xl flex items-center gap-2 shadow-lg shadow-red-500/20 transition cursor-pointer"
                                >
                                  <Download className="w-3.5 h-3.5" /> 
                                  {copiedStates["docx"] ? "Đã sao chép!" : "Tải Word .docx tiêu chuẩn"}
                                </button>
                              )}
                            </div>
                          </div>

                        </div>
                      )}
                    </div>

                  </div>
                </motion.div>
              )}

              {activeTool === "ocr-pro" && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }} 
                  animate={{ opacity: 1, height: "auto" }} 
                  className="bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-6 shadow-xl mb-10 overflow-hidden text-slate-100"
                >
                  <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-red-500/20 text-red-300 rounded-xl flex items-center justify-center border border-red-500/20 shadow-md">
                        <Terminal className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-lg font-extrabold text-white font-display">Bóc tách Văn bản (OCR Pro)</h3>
                        <p className="text-xs text-slate-400">Sử dụng trí tuệ thông minh nhân tạo bóc văn bản từ bản chụp cực nét</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => { setActiveTool(null); setOcrResult(null); setOcrImage(null); }}
                      className="text-slate-400 hover:text-white text-xs font-bold px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/5 rounded-lg transition"
                    >
                      Đóng công cụ
                    </button>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    
                    {/* Image selector */}
                    <div className="lg:col-span-12 xl:col-span-5 flex flex-col justify-between">
                      <div>
                        <span className="text-xs font-bold text-slate-300 block mb-2 uppercase font-display">Chọn tệp hình ảnh scan, tờ trình chụp</span>
                        <div className="border-2 border-dashed border-white/15 rounded-2xl p-4 text-center hover:border-red-500/50 transition-all bg-white/2 flex flex-col items-center justify-center min-h-[160px] relative pointer-events-auto cursor-pointer">
                          <input 
                            type="file" 
                            accept="image/*"
                            onChange={handleImageUpload}
                            className="absolute inset-0 opacity-0 cursor-pointer z-10"
                          />
                          {ocrImage ? (
                            <img src={ocrImage} alt="Uploaded text preview" className="max-h-[130px] object-cover rounded-lg border border-white/10 shadow-lg relative z-0" />
                          ) : (
                            <>
                              <Upload className="w-8 h-8 text-slate-550 mb-1" />
                              <p className="text-xs font-bold text-slate-200">Tải ảnh văn bản lên bếp</p>
                              <p className="text-[10px] text-slate-400">Hỗ trợ JPG, PNG, WEBP độ phân giải cao</p>
                            </>
                          )}
                        </div>
                      </div>

                      <div className="mt-4">
                        <span className="text-[11px] font-bold text-slate-450 block mb-1 uppercase tracking-wider font-mono">DÙNG THỬ FILE QUÉT MẪU:</span>
                        <div className="grid grid-cols-2 gap-2">
                          {OCR_SAMPLES.map((s, idx) => (
                            <button
                              key={s.id}
                              onClick={() => {
                                setOcrImage(s.imageUrl);
                                setOcrResult(s.text);
                              }}
                              className="text-left text-[11px] font-bold p-2 bg-white/2 border border-white/5 rounded-lg hover:border-red-500/35 hover:bg-white/5 text-slate-200 transition cursor-pointer"
                            >
                              <span className="block truncate text-slate-200">{s.title}</span>
                              <span className="block text-[9px] text-slate-400 font-mono mt-0.5">Mẫu quét {idx + 1}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* OCR Text display */}
                    <div className="lg:col-span-12 xl:col-span-7 border border-white/10 rounded-2xl p-5 bg-white/2 min-h-[300px] flex flex-col">
                      {ocrLoading && (
                        <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
                          <Loader2 className="w-10 h-10 text-rose-450 animate-spin mb-3" />
                          <p className="text-sm font-bold text-slate-200 font-display">Đang nhận diện quang học tiếng Việt chính xác cao...</p>
                          <p className="text-xs text-slate-400 bg-white/5 px-2 py-0.5 rounded mt-1">Trích xuất bố cục văn bản, hiệu đính lỗi sai dấu tự động</p>
                        </div>
                      )}

                      {!ocrLoading && !ocrResult && (
                        <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
                          <Terminal className="w-12 h-12 text-slate-500 stroke-1 mb-2" />
                          <p className="text-sm font-bold text-slate-350">Chưa trích xuất văn bản</p>
                          <p className="text-xs text-slate-400 mt-1 max-w-sm">Chọn mẫu giấy quét hành chính ở trái để dán tức khắc văn bản OCR.</p>
                        </div>
                      )}

                      {!ocrLoading && ocrResult && (
                        <div className="flex-1 flex flex-col">
                          <div className="flex items-center justify-between border-b border-white/5 pb-2 mb-3">
                            <span className="text-xs font-bold text-green-300 bg-green-500/20 border border-green-500/20 px-2.5 py-1 rounded flex items-center gap-1 font-display">
                              <Check className="w-3.5 h-3.5" /> Bóc tách OCR hoàn tất
                            </span>
                            <button
                              onClick={() => handleCopyToClipboard(ocrResult, "ocr")}
                              className="px-2.5 py-1 bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200 text-xs font-bold rounded-lg flex items-center gap-1 transition-all cursor-pointer"
                            >
                              <Copy className="w-3.5 h-3.5" />
                              {copiedStates["ocr"] ? "Đã chép!" : "Copy văn bản"}
                            </button>
                          </div>

                          <div className="flex-1 bg-black/45 border border-white/10 rounded-xl p-4 overflow-y-auto max-h-[220px] text-xs leading-relaxed text-slate-200 font-mono shadow-inner select-all whitespace-pre-wrap">
                            {ocrResult}
                          </div>
                        </div>
                      )}
                    </div>

                  </div>
                </motion.div>
              )}

              {activeTool === "smart-citation" && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }} 
                  animate={{ opacity: 1, height: "auto" }} 
                  className="bg-white border border-gray-100 rounded-3xl p-6 shadow-md mb-10 overflow-hidden"
                >
                  <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-[#cc1c18]/10 text-[#cc1c18] rounded-xl flex items-center justify-center">
                        <BookOpen className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-lg font-extrabold text-gray-900">Smart Citation (Trích dẫn &amp; Tìm căn cứ luật)</h3>
                        <p className="text-xs text-gray-500">Kết nối cơ sở dữ liệu luật hành chính Việt Nam &amp; Chưng cất căn cứ mở đầu bằng Google Grounding</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => { setActiveTool(null); setCitationResponse(null); }}
                      className="text-gray-400 hover:text-gray-600 text-xs font-bold px-3 py-1.5 bg-gray-50 hover:bg-gray-100 rounded-lg"
                    >
                      Đóng công cụ
                    </button>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    
                    {/* Inquiry input pane */}
                    <div className="lg:col-span-5 flex flex-col">
                      <span className="text-xs font-bold text-gray-650 block mb-1.5 uppercase">Nội dung hành chính cần tìm căn cứ pháp lý</span>
                      <div className="flex flex-wrap gap-1.5 mb-3">
                        {CITATION_SAMPLES.map((s, idx) => (
                          <button
                            key={s.id}
                            onClick={() => { setCitationQuery(s.query); runSmartCitation(s.query); }}
                            className="text-[10px] font-bold px-2 py-1 bg-red-50 text-red-700 border border-red-100 rounded hover:bg-red-100 transition whitespace-nowrap"
                          >
                            Tình huống {idx + 1}
                          </button>
                        ))}
                      </div>

                      <div className="relative">
                        <input
                          type="text"
                          value={citationQuery}
                          onChange={(e) => setCitationQuery(e.target.value)}
                          placeholder="Ví dụ: Quy định thời hạn nộp quyết định kỷ luật công chức..."
                          className="w-full pl-4 pr-10 py-3 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#cc1c18]/50 focus:bg-white font-medium"
                        />
                        <Search className="w-4 h-4 text-gray-400 absolute right-3.5 top-3.5" />
                      </div>

                      <span className="text-xs font-bold text-gray-600 block mt-4 mb-1.5 uppercase">Bối cảnh kèm theo (Không bắt buộc)</span>
                      <textarea
                        value={citationContext}
                        onChange={(e) => setCitationContext(e.target.value)}
                        placeholder="Nếu bạn có sẵn dự thảo văn bản, hãy dán một đoạn vào đây để trợ lý đối chiếu cấu trúc và nội dung chặt chẽ hơn..."
                        className="w-full h-24 p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#cc1c18]/50 focus:bg-white resize-none"
                      />

                      <button
                        onClick={() => runSmartCitation()}
                        disabled={citationLoading}
                        className="w-full mt-4 py-3 bg-[#cc1c18] hover:bg-[#b01815] text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 transform active:scale-95 shadow transition"
                      >
                        {citationLoading ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Đang kết nối thư viện luật...
                          </>
                        ) : (
                          <>Tra cứu &amp; Soạn dẫn chiếu luật</>
                        )}
                      </button>
                    </div>

                    {/* Grounding outcomes */}
                    <div className="lg:col-span-7 border border-gray-100 rounded-2xl p-5 bg-[#fafaf9]/50 min-h-[300px] flex flex-col justify-between">
                      {citationLoading && (
                        <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
                          <Loader2 className="w-10 h-10 text-[#cc1c18] animate-spin mb-3" />
                          <p className="text-sm font-bold text-gray-800">Đang kích hoạt Google Search Grounding rà quét hệ thống văn bản luật quy phạm...</p>
                          <p className="text-xs text-gray-400">Truy quét Luật hành chính, Nghị định, Thông tư cập nhật mới nhất</p>
                        </div>
                      )}

                      {!citationLoading && !citationResponse && (
                        <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
                          <BookOpen className="w-12 h-12 text-gray-300 stroke-1 mb-2" />
                          <p className="text-sm font-bold text-gray-500">Chưa bắt đầu tra cứu</p>
                          <p className="text-xs text-gray-400 mt-1 max-w-xs">Nhập nội dung vấn đề của bạn ở ô tìm kiếm hoặc bấm nhanh mẫu để xem trợ lý trích lập căn cứ luật thích đáng.</p>
                        </div>
                      )}

                      {!citationLoading && citationResponse && (
                        <div className="flex-1 flex flex-col justify-between h-full">
                          
                          <div className="space-y-3 flex-1 overflow-y-auto max-h-[220px] pb-3 pr-1">
                            <span className="text-[10px] bg-red-50 text-red-700 font-bold px-2 py-0.5 rounded tracking-wide uppercase block w-max">Đề xuất căn cứ luật trực tiếp</span>
                            
                            {/* Opening citations draft */}
                            <div className="bg-white border border-gray-100 rounded-xl p-3 shadow-sm">
                              <div className="flex items-center justify-between mb-2">
                                <h4 className="text-[11px] font-extrabold text-[#cc1c18] uppercase tracking-wider">Đoạn văn mở đầu tiêu chuẩn (Dùng ngay)</h4>
                                <button
                                  onClick={() => handleCopyToClipboard(citationResponse.openingCitationDraft, "draft")}
                                  className="text-[10px] font-bold text-indigo-700 hover:text-indigo-900 flex items-center gap-1"
                                >
                                  <Copy className="w-3.5 h-3.5" /> 
                                  {copiedStates["draft"] ? "Đã chép!" : "Copy"}
                                </button>
                              </div>
                              <p className="text-xs text-gray-700 font-mono leading-relaxed bg-gray-50 p-2 rounded border border-gray-100 select-all whitespace-pre-wrap">{citationResponse.openingCitationDraft}</p>
                            </div>

                            {/* Detailed citations list */}
                            <h4 className="text-[10px] font-extrabold text-gray-500 uppercase tracking-widest px-1">Danh mục tham chiếu ({citationResponse.citations.length})</h4>
                            {citationResponse.citations.map((cite, idx) => (
                              <div key={idx} className="bg-white border border-gray-100 rounded-xl p-3 shadow-sm text-xs">
                                <p className="font-extrabold text-gray-900 leading-tight">{cite.source}</p>
                                <p className="text-[11px] text-gray-400 font-bold mt-0.5">{cite.clause}</p>
                                <p className="text-gray-600 mt-1.5 leading-snug font-medium">{cite.summaryContent}</p>
                                <div className="mt-2 text-[11px] bg-purple-50 text-indigo-750 p-1.5 rounded font-bold border border-purple-50">
                                  Cụm dẫn chiếu: "{cite.citationPhrase}"
                                </div>
                              </div>
                            ))}
                          </div>

                          {/* Grounding sources links */}
                          {citationResponse.searchSources && citationResponse.searchSources.length > 0 && (
                            <div className="border-t border-gray-100 pt-2.5 mt-2">
                              <span className="text-[10px] text-gray-400 font-bold block mb-1 uppercase tracking-wider">Nguồn kiểm chứng trực tiếp:</span>
                              <div className="flex flex-wrap gap-2">
                                {citationResponse.searchSources.map((link, idx) => (
                                  <a
                                    key={idx}
                                    href={link.uri}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-[10px] font-bold text-indigo-600 hover:text-indigo-800 bg-white border border-gray-100 px-2 py-1 rounded-lg flex items-center gap-1 shadow-sm shrink-0"
                                  >
                                    {link.title} <ExternalLink className="w-2.5 h-2.5" />
                                  </a>
                                ))}
                              </div>
                            </div>
                          )}

                        </div>
                      )}
                    </div>

                  </div>
                </motion.div>
              )}

              {activeTool === "boc-bang" && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }} 
                  animate={{ opacity: 1, height: "auto" }} 
                  className="bg-white border border-gray-100 rounded-3xl p-6 shadow-md mb-10 overflow-hidden"
                >
                  <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-[#cc1c18]/10 text-[#cc1c18] rounded-xl flex items-center justify-center">
                        <Volume2 className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-lg font-extrabold text-gray-900">Trợ lý Bóc băng &amp; Biên bản kết luận họp</h3>
                        <p className="text-xs text-gray-500">Số hóa ghi chép thô hội nghị để dự thảo thông cáo quyết định chính xác theo Nghị định 30</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => { setActiveTool(null); setBocBangResponse(null); }}
                      className="text-gray-400 hover:text-gray-600 text-xs font-bold px-3 py-1.5 bg-gray-50 hover:bg-gray-100 rounded-lg"
                    >
                      Đóng công cụ
                    </button>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    
                    {/* Input Area */}
                    <div className="lg:col-span-5 flex flex-col">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs font-bold text-gray-600 uppercase">Dán file ghi âm thô / Chép lời họp</span>
                        <div className="flex items-center gap-1">
                          <span className="text-[10px] text-gray-400 font-bold">Dự án họp mẫu:</span>
                          {TRANSCRIPT_SAMPLES.map((s, idx) => (
                            <button
                              key={s.id}
                              onClick={() => { setTranscriptInput(s.transcript); runBocBang(s.transcript); }}
                              className="text-[10px] font-bold px-2 py-1 bg-red-50 text-red-700 border border-red-100 rounded hover:bg-red-100 whitespace-nowrap"
                            >
                              Dự thảo {idx + 1}
                            </button>
                          ))}
                        </div>
                      </div>

                      <textarea
                        value={transcriptInput}
                        onChange={(e) => setTranscriptInput(e.target.value)}
                        placeholder="Dán toàn bộ chi tiết buổi họp thảo luận thô, ghi nhận mốc thời gian phát biểu của các đồng chí lãnh đạo..."
                        className="w-full h-80 px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#cc1c18]/50 focus:bg-white leading-relaxed resize-none"
                      />

                      <div className="flex items-center justify-between mt-3">
                        <button
                          onClick={() => setTranscriptInput("")}
                          className="text-xs font-bold text-gray-400 hover:text-gray-600 flex items-center gap-1.5"
                        >
                          <RotateCcw className="w-3.5 h-3.5" /> Làm trống
                        </button>
                        <button
                          onClick={() => runBocBang()}
                          disabled={transcriptLoading}
                          className="px-5 py-2.5 bg-[#cc1c18] hover:bg-[#b01815] text-white text-xs font-bold rounded-xl flex items-center gap-2 transform active:scale-95 transition"
                        >
                          {transcriptLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                          Tổng hợp Kết luận cuộc họp
                        </button>
                      </div>
                    </div>

                    {/* Synthesized Output Area */}
                    <div className="lg:col-span-7 border border-gray-100 rounded-2xl p-5 bg-[#fafaf9]/50 min-h-[360px] flex flex-col justify-between">
                      {transcriptLoading && (
                        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                          <Loader2 className="w-10 h-10 text-[#cc1c18] animate-spin mb-3" />
                          <p className="text-sm font-bold text-gray-800">Đang thực hiện phân tích tổng hợp tiếng nói hành chính hội nghị...</p>
                          <p className="text-xs text-gray-400 mt-1">Hệ thống đang trích xuất quyết định, cấu thức phân người chỉ đạo và lập biên bản kết luận chuẩn</p>
                        </div>
                      )}

                      {!transcriptLoading && !transcriptResponse && (
                        <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
                          <Volume2 className="w-12 h-12 text-gray-300 stroke-1 mb-2" />
                          <p className="text-sm font-bold text-gray-500">Chưa bắt đầu kết luận</p>
                          <p className="text-xs text-gray-400 mt-1 max-w-xs">Chọn các mẫu thảo luận cuộc họp thô ở bên trái để theo dõi Trợ lý số bóc băng hoàn chỉnh Biên bản họp.</p>
                        </div>
                      )}

                      {!transcriptLoading && transcriptResponse && (
                        <div className="flex-1 flex flex-col h-full justify-between">
                          <div className="space-y-4 overflow-y-auto max-h-[220px] pb-3 pr-1">
                            
                            <div>
                              <p className="text-[10px] font-bold text-gray-450 uppercase tracking-widest leading-none">VĂN THƯ KẾT LUẬN</p>
                              <h4 className="text-sm font-black text-gray-900 mt-1 leading-snug">{transcriptResponse.meetingTitle}</h4>
                            </div>

                            {/* Key decisions bullet items */}
                            <div className="bg-white border border-gray-100 rounded-xl p-3 shadow-none">
                              <h5 className="text-[11px] font-bold text-red-700 uppercase mb-2">Quyết định / Kết luận cốt lõi</h5>
                              <ul className="list-disc pl-4 text-xs space-y-1 text-gray-705 font-medium">
                                {transcriptResponse.keyDecisions.map((dec, i) => (
                                  <li key={i}>{dec}</li>
                                ))}
                              </ul>
                            </div>

                            {/* Task Delegation list table */}
                            <div>
                              <h5 className="text-[11px] font-bold text-gray-500 uppercase px-1 mb-2">Bảng giao vận đầu việc phân công</h5>
                              <div className="overflow-x-auto">
                                <table className="w-full text-left bg-white text-xs border border-gray-100 rounded-lg overflow-hidden">
                                  <thead>
                                    <tr className="bg-gray-50 font-bold border-b text-gray-600">
                                      <th className="p-2">Chi tiết việc</th>
                                      <th className="p-2">Chủ trì</th>
                                      <th className="p-2">Thời hạn</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {transcriptResponse.assignedTasks.map((t, idx) => (
                                      <tr key={idx} className="border-b border-gray-50 text-[11px]">
                                        <td className="p-2 font-medium">{t.taskName}</td>
                                        <td className="p-2 font-mono text-indigo-700 font-bold">{t.assignee}</td>
                                        <td className="p-2 font-semibold text-red-600">{t.deadline}</td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            </div>

                            {/* Document draft block */}
                            <div className="bg-white border border-gray-100 rounded-xl p-3">
                              <div className="flex items-center justify-between mb-2 pb-1.5 border-b border-gray-50">
                                <h5 className="text-[11px] font-bold text-indigo-900 uppercase">Dự thảo văn bản Thông báo kết luận chuẩn (NĐ 30)</h5>
                                <button
                                  onClick={() => handleCopyToClipboard(transcriptResponse.documentDraft, "minutes")}
                                  className="text-[10px] font-bold text-indigo-700 flex items-center gap-1"
                                >
                                  <Copy className="w-3.5 h-3.5" /> 
                                  {copiedStates["minutes"] ? "Đã copy văn bản!" : "Copy"}
                                </button>
                              </div>
                              <p className="text-[11px] font-mono text-gray-750 leading-relaxed max-h-[140px] overflow-y-auto whitespace-pre-line select-all">{transcriptResponse.documentDraft}</p>
                            </div>

                          </div>
                          
                          <div className="mt-3 pt-2.5 border-t border-gray-105 flex items-center justify-between">
                            <span className="text-[10px] text-gray-400 font-bold uppercase">Biên soạn bởi Công chức Số trợ lý</span>
                            <button
                              onClick={() => handleCopyToClipboard(transcriptResponse.documentDraft, "draft_main")}
                              className="px-4 py-2 bg-indigo-650 hover:bg-indigo-750 text-white text-xs font-bold rounded-xl flex items-center gap-2 transition"
                            >
                              <Download className="w-3.5 h-3.5" /> Sao chép toàn bộ dự thảo
                            </button>
                          </div>

                        </div>
                      )}
                    </div>

                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* MAIN 6 UTILITIES GRID SECTION */}
            <h3 id="outstanding_tools" className="text-2xl font-black text-gray-900 mb-2 mt-2">
              Công cụ Nổi bật
            </h3>
            <p className="text-sm font-medium text-gray-500 mb-6">Lựa chọn các trợ lý số nghiệp vụ chuyên sâu hoạt động trên nền tảng AI an toàn mạng nội bộ:</p>
            
            <div id="tools_grid" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
              
              {/* Card 1 */}
              <div 
                id="card_the_thuc"
                className={`bg-white rounded-2xl p-6 border transition-all flex flex-col justify-between shadow-sm relative overflow-hidden group hover:shadow-md ${
                  activeTool === "the-thuc" ? "border-[#cc1c18] ring-1 ring-[#cc1c18]" : "border-gray-200/80 hover:border-gray-300"
                }`}
              >
                <div className="absolute right-0 top-0 w-24 h-24 bg-[#cc1c18]/5 rounded-bl-full group-hover:bg-[#cc1c18]/10 transition-colors"></div>
                <div>
                  <div className="w-12 h-12 bg-red-50 text-[#cc1c18] rounded-xl flex items-center justify-center mb-4 border border-red-100/60 shadow-sm">
                    <CheckSquare className="w-6 h-6" />
                  </div>
                  <h4 className="text-lg font-bold text-gray-900 group-hover:text-[#cc1c18] transition-colors">Check Thể thức Văn bản</h4>
                  <p className="text-xs font-medium text-gray-500 mt-2 leading-relaxed">
                    Tự động đối chiếu, rà soát tỷ lệ lề, đặt vị trí các phụ lục, tiêu đề, chữ ký theo nguyên mẫu Nghị định 30/2020/NĐ-CP của Chính phủ Việt Nam.
                  </p>
                </div>
                <button
                  id="btn_active_the_thuc"
                  onClick={() => setActiveTool("the-thuc")}
                  className="w-full mt-6 py-2.5 bg-[#cc1c18] hover:bg-[#b01815] text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-sm transform active:scale-95 transition cursor-pointer"
                >
                  Bắt đầu ngay
                </button>
              </div>

              {/* Card 2 */}
              <div 
                id="card_chinh_ta"
                className={`bg-white rounded-2xl p-6 border transition-all flex flex-col justify-between shadow-sm relative overflow-hidden group hover:shadow-md ${
                  activeTool === "chinh-ta" ? "border-[#cc1c18] ring-1 ring-[#cc1c18]" : "border-gray-200/80 hover:border-gray-300"
                }`}
              >
                <div className="absolute right-0 top-0 w-24 h-24 bg-[#cc1c18]/5 rounded-bl-full group-hover:bg-[#cc1c18]/10 transition-colors"></div>
                <div>
                  <div className="w-12 h-12 bg-red-50 text-[#cc1c18] rounded-xl flex items-center justify-center mb-4 border border-red-100/60 shadow-sm">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <h4 className="text-lg font-bold text-gray-900 group-hover:text-[#cc1c18] transition-colors">Check Lỗi Chính tả &amp; Văn phong</h4>
                  <p className="text-xs font-medium text-gray-500 mt-2 leading-relaxed">
                    Phát hiện lỗi ngữ pháp chính tả tiếng Việt hành chính và lỗi văn phong suồng sã, cải thiện tính trang trọng cho tờ trình, quyết định.
                  </p>
                </div>
                <button
                  id="btn_active_chinh_ta"
                  onClick={() => setActiveTool("chinh-ta")}
                  className="w-full mt-6 py-2.5 bg-[#cc1c18] hover:bg-[#b01815] text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-sm transform active:scale-95 transition cursor-pointer"
                >
                  Bắt đầu ngay
                </button>
              </div>

              {/* Card 3 */}
              <div 
                id="card_pdf"
                className={`bg-white rounded-2xl p-6 border transition-all flex flex-col justify-between shadow-sm relative overflow-hidden group hover:shadow-md ${
                  activeTool === "pdf-to-word" ? "border-[#cc1c18] ring-1 ring-[#cc1c18]" : "border-gray-200/80 hover:border-gray-300"
                }`}
              >
                <div className="absolute right-0 top-0 w-24 h-24 bg-[#cc1c18]/5 rounded-bl-full group-hover:bg-[#cc1c18]/10 transition-colors"></div>
                <div>
                  <div className="w-12 h-12 bg-red-50 text-[#cc1c18] rounded-xl flex items-center justify-center mb-4 border border-red-100/60 shadow-sm">
                    <FileText className="w-6 h-6" />
                  </div>
                  <h4 className="text-lg font-bold text-gray-900 group-hover:text-[#cc1c18] transition-colors">Chuyển đổi PDF sang Word/Excel</h4>
                  <p className="text-xs font-medium text-gray-500 mt-2 leading-relaxed">
                    Trích lập tài liệu scan thô sang định dạng tệp .docx chuẩn kỹ thuật và khôi phục mảng số liệu tài chính cực nhanh sang bảng tính .xlsx sạch sẽ.
                  </p>
                </div>
                <button
                  id="btn_active_pdf"
                  onClick={() => setActiveTool("pdf-to-word")}
                  className="w-full mt-6 py-2.5 bg-[#cc1c18] hover:bg-[#b01815] text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-sm transform active:scale-95 transition cursor-pointer"
                >
                  Bắt đầu ngay
                </button>
              </div>

              {/* Card 4 */}
              <div 
                id="card_ocr"
                className={`bg-white rounded-2xl p-6 border transition-all flex flex-col justify-between shadow-sm relative overflow-hidden group hover:shadow-md ${
                  activeTool === "ocr-pro" ? "border-[#cc1c18] ring-1 ring-[#cc1c18]" : "border-gray-200/80 hover:border-gray-300"
                }`}
              >
                <div className="absolute right-0 top-0 w-24 h-24 bg-[#cc1c18]/5 rounded-bl-full group-hover:bg-[#cc1c18]/10 transition-colors"></div>
                <div>
                  <div className="w-12 h-12 bg-red-50 text-[#cc1c18] rounded-xl flex items-center justify-center mb-4 border border-red-100/60 shadow-sm">
                    <Terminal className="w-6 h-6" />
                  </div>
                  <h4 className="text-lg font-bold text-gray-900 group-hover:text-[#cc1c18] transition-colors">Bóc tách Văn bản (OCR Pro)</h4>
                  <p className="text-xs font-medium text-gray-500 mt-2 leading-relaxed">
                    Nhận dạng ký tự quang học văn bản tiếng Việt từ ảnh chụp tài liệu cong, mờ, độ phân giải thấp và xuất dưới dạng Markdown dễ sao chép chỉnh sửa.
                  </p>
                </div>
                <button
                  id="btn_active_ocr"
                  onClick={() => setActiveTool("ocr-pro")}
                  className="w-full mt-6 py-2.5 bg-[#cc1c18] hover:bg-[#b01815] text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-sm transform active:scale-95 transition cursor-pointer"
                >
                  Bắt đầu ngay
                </button>
              </div>

              {/* Card 5 */}
              <div 
                id="card_cite"
                className={`bg-white rounded-2xl p-6 border transition-all flex flex-col justify-between shadow-sm relative overflow-hidden group hover:shadow-md ${
                  activeTool === "smart-citation" ? "border-[#cc1c18] ring-1 ring-[#cc1c18]" : "border-gray-200/80 hover:border-gray-300"
                }`}
              >
                <div className="absolute right-0 top-0 w-24 h-24 bg-[#cc1c18]/5 rounded-bl-full group-hover:bg-[#cc1c18]/10 transition-colors"></div>
                <div>
                  <div className="w-12 h-12 bg-red-50 text-[#cc1c18] rounded-xl flex items-center justify-center mb-4 border border-red-100/60 shadow-sm">
                    <BookOpen className="w-6 h-6" />
                  </div>
                  <h4 className="text-lg font-bold text-gray-900 group-hover:text-[#cc1c18] transition-colors">Smart Citation (Trích dẫn Luật)</h4>
                  <p className="text-xs font-medium text-gray-500 mt-2 leading-relaxed">
                    Khai thác Google Search kết nối thư viện luật Việt Nam, lập tức soạn câu dẫn chiếu, ghi căn cứ và liên kết văn bản chính xác nhất.
                  </p>
                </div>
                <button
                  id="btn_active_cite"
                  onClick={() => setActiveTool("smart-citation")}
                  className="w-full mt-6 py-2.5 bg-[#cc1c18] hover:bg-[#b01815] text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-sm transform active:scale-95 transition cursor-pointer"
                >
                  Bắt đầu ngay
                </button>
              </div>

              {/* Card 6 */}
              <div 
                id="card_boc_bang"
                className={`bg-white rounded-2xl p-6 border transition-all flex flex-col justify-between shadow-sm relative overflow-hidden group hover:shadow-md ${
                  activeTool === "boc-bang" ? "border-[#cc1c18] ring-1 ring-[#cc1c18]" : "border-gray-200/80 hover:border-gray-300"
                }`}
              >
                <div className="absolute right-0 top-0 w-24 h-24 bg-[#cc1c18]/5 rounded-bl-full group-hover:bg-[#cc1c18]/10 transition-colors"></div>
                <div>
                  <div className="w-12 h-12 bg-red-50 text-[#cc1c18] rounded-xl flex items-center justify-center mb-4 border border-red-100/60 shadow-sm">
                    <Volume2 className="w-6 h-6" />
                  </div>
                  <h4 className="text-lg font-bold text-gray-900 group-hover:text-[#cc1c18] transition-colors">Trợ lý Bóc băng &amp; Tổng hợp Kết luận</h4>
                  <p className="text-xs font-medium text-gray-500 mt-2 leading-relaxed">
                    Dịch đoạn tốc ký, chép ghi âm cuộc họp thành văn bản thông báo kết luận chỉ đạo quy chuẩn và bảng tổng hợp đầu việc rõ ràng mốc hoàn thành.
                  </p>
                </div>
                <button
                  id="btn_active_boc_bang"
                  onClick={() => setActiveTool("boc-bang")}
                  className="w-full mt-6 py-2.5 bg-[#cc1c18] hover:bg-[#b01815] text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-sm transform active:scale-95 transition cursor-pointer"
                >
                  Bắt đầu ngay
                </button>
              </div>

            </div>

          </div>
        )}

        {/* TAB 3: TÀI NGUYÊN CHÍNH QUY (TEMPLATE DOWNLOADS) */}
        {activeTab === "tai-nguyen" && (
          <motion.div 
            initial={{ opacity: 0, y: 15 }} 
            animate={{ opacity: 1, y: 0 }}
            className="bg-white border rounded-3xl p-8 shadow-sm"
          >
            <div className="flex items-center gap-3 border-b pb-4 mb-6">
              <div className="w-10 h-10 bg-[#cc1c18]/10 text-[#cc1c18] rounded-xl flex items-center justify-center">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xl font-extrabold text-gray-900">Thư viện Biểu mẫu &amp; Văn bản quy phạm tiêu chuẩn</h3>
                <p className="text-xs text-gray-550">Tải về trực tiếp tệp văn bản mẫu phục định hình sườn cấu trúc ban hành đúng chuẩn</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              
              <div className="bg-gray-50/50 p-5 rounded-2xl border border-gray-150/80 flex flex-col justify-between">
                <div>
                  <div className="w-8 h-8 bg-blue-55/10 text-blue-600 rounded-lg flex items-center justify-center text-xs font-extrabold">DOC</div>
                  <h4 className="text-sm font-bold text-gray-800 mt-3">Mẫu Công văn hành chính chuẩn thông thường</h4>
                  <p className="text-[11px] text-gray-400 mt-1">Cấu hình căn lề, nơi nhận, đề đơn, chữ ký kính gửi ban điều hành tỉnh.</p>
                </div>
                <button
                  onClick={() => handleCopyToClipboard("MẪU CÔNG VĂN HÀNH CHÍNH THEO NĐ 30/2020/NĐ-CP...", "cv_doc")}
                  className="mt-4 w-full py-1.5 bg-white border hover:bg-gray-50 border-gray-200 text-gray-700 text-xs font-bold rounded-lg transition"
                >
                  {copiedStates["cv_doc"] ? "Đã copy mẫu sườn!" : "Tải mẫu / Sao chép sườn"}
                </button>
              </div>

              <div className="bg-gray-50/50 p-5 rounded-2xl border border-gray-150/80 flex flex-col justify-between">
                <div>
                  <div className="w-8 h-8 bg-blue-55/10 text-blue-600 rounded-lg flex items-center justify-center text-xs font-extrabold">DOC</div>
                  <h4 className="text-sm font-bold text-gray-800 mt-3">Mẫu Tờ trình phê chuẩn Đề án quy chế</h4>
                  <p className="text-[11px] text-gray-400 mt-1">Khuôn mẫu viết báo cáo dự án, xin cấp phê duyệt đầu tư ngân sách công lập.</p>
                </div>
                <button
                  onClick={() => handleCopyToClipboard("MẪU TỜ TRÌNH PHÊ DUYỆT ĐỀ ÁN THEO NĐ 30/2020...", "trin_doc")}
                  className="mt-4 w-full py-1.5 bg-white border hover:bg-gray-50 border-gray-200 text-gray-700 text-xs font-bold rounded-lg transition"
                >
                  {copiedStates["trin_doc"] ? "Đã copy mẫu sườn!" : "Tải mẫu / Sao chép sườn"}
                </button>
              </div>

              <div className="bg-gray-50/50 p-5 rounded-2xl border border-gray-150/80 flex flex-col justify-between">
                <div>
                  <div className="w-8 h-8 bg-emerald-55/10 text-emerald-600 rounded-lg flex items-center justify-center text-xs font-extrabold">XLS</div>
                  <h4 className="text-sm font-bold text-gray-800 mt-3">Mẫu tóm toán biểu mẫu cấp tài chính đầu tư</h4>
                  <p className="text-[11px] text-gray-400 mt-1">Bảng tính Excel phục đính kèm thông tri quyết định duyệt kinh phí cơ sở.</p>
                </div>
                <button
                  onClick={() => handleCopyToClipboard("MẪU BẢNG BIỂU DỰ TOÁN KINH PHÍ...", "xls_doc")}
                  className="mt-4 w-full py-1.5 bg-white border hover:bg-gray-50 border-gray-200 text-gray-700 text-xs font-bold rounded-lg transition"
                >
                  {copiedStates["xls_doc"] ? "Đã copy cấu trúc!" : "Tải mẫu / Sao chép cấu trúc"}
                </button>
              </div>

            </div>
          </motion.div>
        )}

        {/* TAB 4: CẨM NANG & TRỢ GIÚP */}
        {activeTab === "cam-nang-tro-giup" && (
          <motion.div 
            initial={{ opacity: 0, y: 15 }} 
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {HANDBOOKS.map((handbook, hIdx) => (
              <div key={hIdx} className="bg-white border rounded-3xl p-6 shadow-sm">
                <div 
                  className="flex items-center justify-between cursor-pointer"
                  onClick={() => setExpandedHandbookIdx(expandedHandbookIdx === hIdx ? null : hIdx)}
                >
                  <div className="flex items-center gap-3">
                    <BookOpen className="w-5 h-5 text-[#cc1c18]" />
                    <div>
                      <h4 className="text-base font-extrabold text-gray-900 leading-snug">{handbook.title}</h4>
                      <p className="text-xs text-gray-400 mt-0.5">Ngày ban hành: {handbook.date}</p>
                    </div>
                  </div>
                  {expandedHandbookIdx === hIdx ? (
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  ) : (
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  )}
                </div>

                {expandedHandbookIdx === hIdx && (
                  <div className="mt-6 border-t border-gray-50 pt-5 space-y-4">
                    {handbook.sections.map((sec, sIdx) => (
                      <div key={sIdx} className="bg-gray-50/50 p-4 rounded-xl border border-gray-150">
                        <h5 className="text-xs font-bold text-gray-800 uppercase tracking-wide">{sec.header}</h5>
                        <p className="text-xs text-gray-650 mt-1.5 leading-relaxed font-medium">{sec.text}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </motion.div>
        )}
      </div>

        {/* THREE LOWER SECTIONS (NEWS, MANUALS INDEX, FEEDBACK FORM) FOR BALANCED LOOK */}
        <div id="lower_three_sections" className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-12 pt-12 border-t border-gray-200/60">
          
          {/* SECTION 1: TIN TỨC & CẬP NHẬT MỚI */}
          <div className="bg-white rounded-2xl p-6 border border-gray-200/60 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-50">
                <h3 className="text-base font-black text-gray-900 flex items-center gap-2">
                  <span className="w-1.5 h-4 bg-[#cc1c18] rounded-full"></span>
                  Tin tức &amp; Cập nhật mới
                </h3>
                <span className="text-[10px] text-gray-400 font-bold uppercase">Cơ sở dữ liệu</span>
              </div>

              <div className="space-y-4">
                {UTILITY_NEWS.map((news, idx) => (
                  <div key={idx} className="flex gap-3 group cursor-pointer" onClick={() => { setActiveTab("chinh-quyen"); }}>
                    <img 
                      src={news.image} 
                      alt="" 
                      className="w-16 h-16 rounded-lg object-cover bg-gray-100 border shrink-0 group-hover:opacity-90 transition"
                    />
                    <div>
                      <h4 className="text-xs font-extrabold text-gray-900 leading-snug group-hover:text-[#cc1c18] transition-colors">{news.title}</h4>
                      <p className="text-[10px] text-gray-400 mt-1 flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {news.date}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <button 
              onClick={() => { setActiveTab("chinh-quyen"); setActiveTool(null); }}
              className="mt-6 text-xs font-bold text-gray-500 hover:text-[#cc1c18] flex items-center gap-1.5 transition ml-1"
            >
              Xem tất cả bản tin <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* SECTION 2: CẨM NANG THỂ THỨC VĂN BẢN (FAST LINKS) */}
          <div className="bg-white rounded-2xl p-6 border border-gray-200/60 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-50">
                <h3 className="text-base font-black text-gray-900 flex items-center gap-2">
                  <span className="w-1.5 h-4 bg-[#cc1c18] rounded-full"></span>
                  Cẩm nang Thể thức
                </h3>
                <span className="text-gray-400 hover:text-red-650 cursor-pointer" onClick={() => setActiveTab("cam-nang-tro-giup")}><ArrowRight className="w-4 h-4" /></span>
              </div>

              <div className="space-y-3.5">
                <div 
                  className="p-3 bg-red-50/30 rounded-xl hover:bg-red-50/60 border border-red-100/50 cursor-pointer transition-colors"
                  onClick={() => { setActiveTab("cam-nang-tro-giup"); setExpandedHandbookIdx(0); }}
                >
                  <p className="text-xs font-extrabold text-gray-800">Quy định 1: Khổ giấy, định lề trang</p>
                  <p className="text-[10px] text-gray-500 mt-1">Dán tiêu chuẩn kích lề trên-dưới-trái-phải đúng TCVN đứng.</p>
                </div>

                <div 
                  className="p-3 bg-red-50/30 rounded-xl hover:bg-red-50/60 border border-red-100/50 cursor-pointer transition-colors"
                  onClick={() => { setActiveTab("cam-nang-tro-giup"); setExpandedHandbookIdx(0); }}
                >
                  <p className="text-xs font-extrabold text-gray-800">Quy định 2: Chữ viết tắt ký hiệu</p>
                  <p className="text-[10px] text-gray-500 mt-1">Cách lập danh số công văn, quyết định hành chính địa phương.</p>
                </div>

                <div 
                  className="p-3 bg-red-50/30 rounded-xl hover:bg-red-50/60 border border-red-100/50 cursor-pointer transition-colors"
                  onClick={() => { setActiveTab("cam-nang-tro-giup"); setExpandedHandbookIdx(1); }}
                >
                  <p className="text-xs font-extrabold text-gray-800">Quy định 3: Quy tắc viết hoa chức danh</p>
                  <p className="text-[10px] text-gray-500 mt-1">Dẫn chiếu viết hoa chính xác chức vụ đặc thù Đảng, đoàn thể.</p>
                </div>
              </div>
            </div>

            <button 
              onClick={() => { setActiveTab("cam-nang-tro-giup"); setExpandedHandbookIdx(0); }}
              className="mt-6 text-xs font-bold text-gray-500 hover:text-[#cc1c18] flex items-center gap-1.5 transition ml-1"
            >
              Xem hướng dẫn chi tiết <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* SECTION 3: HỖ TRỢ / FEEDBACK FORM WITH PROMPT STATUS */}
          <div className="bg-white rounded-2xl p-6 border border-gray-200/60 shadow-sm">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-50">
              <h3 className="text-base font-black text-gray-900 flex items-center gap-2">
                <span className="w-1.5 h-4 bg-[#cc1c18] rounded-full"></span>
                Ý kiến đóng góp &amp; Hỗ trợ
              </h3>
              <span className="text-[11px] font-mono text-gray-400">hotro@congchucso</span>
            </div>

            <form onSubmit={handleSubmitFeedback} className="space-y-3">
              <div>
                <input 
                  type="text"
                  required
                  value={feedbackName}
                  onChange={(e) => setFeedbackName(e.target.value)}
                  placeholder="Họ tên / Đơn vị công tác"
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#cc1c18]/40 focus:bg-white font-medium"
                />
              </div>

              <div>
                <input 
                  type="email"
                  value={feedbackEmail}
                  onChange={(e) => setFeedbackEmail(e.target.value)}
                  placeholder="Địa chỉ Email chính thức (Không bắt buộc)"
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#cc1c18]/40 focus:bg-white font-medium"
                />
              </div>

              <div>
                <textarea 
                  required
                  value={feedbackContent}
                  onChange={(e) => setFeedbackContent(e.target.value)}
                  placeholder="Ý kiến phản hồi cải tiến hệ thống..."
                  className="w-full h-16 max-h-24 px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#cc1c18]/40 focus:bg-white resize-none font-medium"
                />
              </div>

              <button 
                type="submit"
                disabled={feedbackLoading}
                className="w-full py-2.5 bg-[#cc1c18] hover:bg-[#b01815] text-white text-xs font-black rounded-xl tracking-wider uppercase shadow-sm flex items-center justify-center gap-2 transform active:scale-95 transition cursor-pointer"
              >
                {feedbackLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                Gửi ý kiến hỗ trợ
              </button>
            </form>

            <AnimatePresence>
              {feedbackSuccess && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="mt-3 p-3 bg-green-50 text-green-700 rounded-xl border border-green-100 text-[11px] font-bold text-center leading-snug"
                >
                  Cảm ơn đồng ý kiến đóng góp của đồng chí! Ý kiến đã được ghi nhận bảo mật vào hệ thống hỗ trợ Công chức Số.
                </motion.div>
              )}
            </AnimatePresence>
          </div>

        </div>

      </div>

      {/* COMPLIANT FOOTER SECTION */}
      <footer id="gov_footer" className="bg-white border-t border-gray-100 py-8 px-4 md:px-8 mt-20 text-xs text-gray-500 font-medium">
        <div id="footer_container" className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div id="footer_left" className="text-center md:text-left">
            <p className="font-bold">Bản quyền © 2026 Công chức Số</p>
            <p className="text-[10px] text-gray-400 mt-1">Giải pháp Cổng nghiệp vụ rà soát &amp; Hỗ trợ pháp lý Công chức Quốc gia</p>
          </div>
          <div id="footer_right" className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
            <a href="#privacy" className="hover:text-[#cc1c18] transition-colors">Chính sách bảo mật</a>
            <a href="#terms" className="hover:text-[#cc1c18] transition-colors">Điều khoản nghiệp vụ</a>
            <a href="#technical" className="hover:text-[#cc1c18] transition-colors">Thông tin kỹ thuật</a>
            <span className="text-gray-300">|</span>
            <span className="flex items-center gap-1 text-[#cc1c18] font-bold font-mono">
              Hotline: 09291 755 790
            </span>
          </div>
        </div>
      </footer>

    </div>
  );
}
