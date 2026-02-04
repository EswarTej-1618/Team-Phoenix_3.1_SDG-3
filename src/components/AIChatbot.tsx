import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageCircle,
  X,
  Send,
  Bot,
  User,
  Activity,
  Heart,
  MessageSquare,
  History,
  ChevronRight,
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  analyzeVitalsWithGemini,
  chatWithGemini,
  type VitalsInput,
  type VitalsSymptoms,
} from "@/lib/gemini";
import type { MotherSignupProfile } from "@/data/motherProfiles";
import { appendVitalsHistory } from "@/data/motherProfiles";

const STORAGE_KEY = "safemom-chat-history";

interface Message {
  id: number;
  text: string;
  isBot: boolean;
  timestamp: Date;
}

interface ChatSession {
  id: string;
  mode: "vitals" | "chat";
  title: string;
  messages: Message[];
  vitalsResult?: string;
  createdAt: string;
}

type ChatMode = "select" | "vitals" | "chat";

type RiskLevel = "risky" | "high" | "moderate" | "normal";

const detectRiskLevel = (text: string): RiskLevel | null => {
  const match = text.match(
    /(?:classified as|risk is|overall risk)\s+(?:is\s+)?(?:classified\s+as\s+)?\*?\*?\s*(Risky|High|Moderate|Normal)\s*\*?\*?/i
  );
  if (match) return match[1].toLowerCase() as RiskLevel;
  if (/\brisky\b/i.test(text)) return "risky";
  if (/\bhigh\b.*risk|risk.*\bhigh\b/i.test(text)) return "high";
  if (/\bmoderate\b/i.test(text)) return "moderate";
  if (/\bnormal\b/i.test(text)) return "normal";
  return null;
};

const RISK_STYLES: Record<
  RiskLevel,
  { badge: string; card: string; icon: React.ElementType }
> = {
  risky: {
    badge:
      "bg-red-600/30 border-2 border-red-500 text-red-400 font-extrabold animate-pulse shadow-[0_0_25px_rgba(239,68,68,0.5)] ring-2 ring-red-500/30",
    card: "border-2 border-red-500/60 bg-gradient-to-b from-red-950/40 to-red-950/10 shadow-[0_0_40px_rgba(239,68,68,0.2)]",
    icon: AlertTriangle,
  },
  high: {
    badge:
      "bg-orange-500/25 border-2 border-orange-500 text-orange-400 font-bold shadow-[0_0_20px_rgba(249,115,22,0.4)]",
    card: "border-2 border-orange-500/50 bg-orange-950/20 shadow-[0_0_30px_rgba(249,115,22,0.15)]",
    icon: AlertCircle,
  },
  moderate: {
    badge:
      "bg-amber-500/25 border-2 border-amber-500 text-amber-400 font-bold shadow-[0_0_20px_rgba(245,158,11,0.4)]",
    card: "border-2 border-amber-500/50 bg-amber-950/20 shadow-[0_0_30px_rgba(245,158,11,0.15)]",
    icon: AlertCircle,
  },
  normal: {
    badge:
      "bg-emerald-500/25 border-2 border-emerald-500 text-emerald-400 font-bold shadow-[0_0_20px_rgba(16,185,129,0.4)]",
    card: "border-2 border-emerald-500/50 bg-emerald-950/20 shadow-[0_0_30px_rgba(16,185,129,0.15)]",
    icon: CheckCircle2,
  },
};

const getVitalsStatus = (
  value: number,
  goodMax: number,
  warningMax: number
): string => {
  if (value <= goodMax) return "Normal";
  if (value <= warningMax) return "Moderate";
  return "Risky";
};

type SymptomKey = keyof VitalsSymptoms;

const SYMPTOM_QUESTIONS: { key: SymptomKey; label: string }[] = [
  { key: "tired", label: "Are you feeling tired?" },
  { key: "headacheFever", label: "Do you have headache or fever feeling?" },
  { key: "abdominalPain", label: "Do you have any abdominal pain?" },
  { key: "swelling", label: "Any swelling (hands/feet)?" },
  { key: "blurredVisionDizziness", label: "Blurred vision or dizziness?" },
];

const RISK_ALERT_API = (import.meta.env.VITE_API_URL ?? "") + "/api/send-risk-alert";

async function sendRiskAlertEmail(riskLevel: string, summary: string, message: string) {
  try {
    const res = await fetch(RISK_ALERT_API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ riskLevel, summary, message }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      console.warn("Risk alert email failed:", data?.error ?? res.statusText);
    }
  } catch (e) {
    console.warn("Risk alert request failed:", e);
  }
}

const parseSymptomsForm = (form: Record<SymptomKey, string>): VitalsSymptoms => ({
  tired: form.tired?.toLowerCase() === "y",
  headacheFever: form.headacheFever?.toLowerCase() === "y",
  abdominalPain: form.abdominalPain?.toLowerCase() === "y",
  swelling: form.swelling?.toLowerCase() === "y",
  blurredVisionDizziness: form.blurredVisionDizziness?.toLowerCase() === "y",
});

const createVitalsFromForm = (form: {
  heartRate: string;
  stress: string;
  spo2: string;
  bloodPressure: string;
  glucose: string;
} & Record<SymptomKey, string>): VitalsInput => {
  const hr = Number(form.heartRate) || 80;
  const stress = Number(form.stress) || 40;
  const spo2 = Number(form.spo2) || 98;
  const bp = Number(form.bloodPressure) || 120;
  const glucose = Number(form.glucose) || 95;

  const vitals: VitalsInput = {
    heartRate: {
      value: hr,
      unit: "bpm",
      status: getVitalsStatus(hr, 100, 120),
      normalRange: "60-100 bpm",
    },
    stress: {
      value: stress,
      unit: "%",
      status: getVitalsStatus(stress, 50, 65),
      normalRange: "< 50%",
    },
    spo2: {
      value: spo2,
      unit: "%",
      status: spo2 >= 95 ? "Normal" : spo2 >= 90 ? "Moderate" : "Risky",
      normalRange: "95-100%",
    },
    bloodPressure: {
      value: bp,
      unit: "mmHg",
      status: getVitalsStatus(bp, 130, 140),
      normalRange: "< 130 mmHg",
    },
    glucose: {
      value: glucose,
      unit: "mg/dL",
      status: getVitalsStatus(glucose, 120, 140),
      normalRange: "70-120 mg/dL",
    },
  };
  const symptoms = parseSymptomsForm(form as Record<SymptomKey, string>);
  vitals.symptoms = symptoms;
  return vitals;
};

const loadHistory = (): ChatSession[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const saveToHistory = (session: ChatSession) => {
  const history = loadHistory();
  history.unshift(session);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(history.slice(0, 50)));
};

interface AIChatbotProps {
  vitals?: VitalsInput | null;
  /** When provided, AI uses profile for personalized output and saves vitals to history */
  motherProfile?: MotherSignupProfile | null;
}

const AIChatbot = ({ vitals, motherProfile }: AIChatbotProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<ChatMode>("select");
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory] = useState<ChatSession[]>([]);
  const [vitalsForm, setVitalsForm] = useState({
    heartRate: "",
    stress: "",
    spo2: "",
    bloodPressure: "",
    glucose: "",
    tired: "",
    headacheFever: "",
    abdominalPain: "",
    swelling: "",
    blurredVisionDizziness: "",
  });
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (vitals) {
      setVitalsForm((p) => ({
        ...p,
        heartRate: String(vitals.heartRate.value),
        stress: String(vitals.stress.value),
        spo2: String(vitals.spo2.value),
        bloodPressure: String(vitals.bloodPressure.value),
        glucose: String(vitals.glucose.value),
      }));
    }
  }, [vitals]);

  useEffect(() => {
    setHistory(loadHistory());
  }, [isOpen, showHistory]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const resetChat = () => {
    setMode("select");
    setMessages([]);
    setInputValue("");
    setError(null);
  };

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) resetChat();
  };

  const sendToGemini = async (userText: string, useVitals?: VitalsInput) => {
    const vitalsToUse = useVitals ?? vitals ?? null;
    if (!vitalsToUse) {
      return "Please enter your vitals above or open this chat from the Live Vitals page.";
    }
    try {
      setError(null);
      return await analyzeVitalsWithGemini(vitalsToUse, userText || undefined, motherProfile ?? undefined);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to get AI response.";
      setError(msg);
      return `Sorry, I couldn't analyze your vitals. ${msg}`;
    }
  };

  const handleAnalyzeVitals = async () => {
    let vitalsToUse: VitalsInput = vitals ?? createVitalsFromForm(vitalsForm);
    if (vitals) {
      vitalsToUse = { ...vitalsToUse, symptoms: parseSymptomsForm(vitalsForm) };
    }
    const userMsg: Message = {
      id: 1,
      text: "Analyze my vitals",
      isBot: false,
      timestamp: new Date(),
    };
    setMessages([userMsg]);
    setIsTyping(true);

    try {
      const response = await sendToGemini("", vitalsToUse);
      const botMsg: Message = {
        id: 2,
        text: response,
        isBot: true,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botMsg]);
      saveToHistory({
        id: crypto.randomUUID(),
        mode: "vitals",
        title: `Vitals Analysis • ${new Date().toLocaleString()}`,
        messages: [userMsg, botMsg],
        vitalsResult: response,
        createdAt: new Date().toISOString(),
      });
      if (motherProfile) {
        const riskLevel = detectRiskLevel(response) ?? undefined;
        const v = vitalsToUse;
        const summary = `HR ${v.heartRate.value}, BP ${v.bloodPressure.value}, SpO2 ${v.spo2.value}, Glucose ${v.glucose.value}`;
        appendVitalsHistory(motherProfile.id, {
          timestamp: new Date().toISOString(),
          vitalsSummary: summary,
          riskLevel,
        });
        if (riskLevel === "high" || riskLevel === "risky") {
          sendRiskAlertEmail(riskLevel, summary, response);
        }
      } else {
        const riskLevel = detectRiskLevel(response);
        if (riskLevel === "high" || riskLevel === "risky") {
          const v = vitalsToUse;
          const summary = `HR ${v.heartRate.value}, BP ${v.bloodPressure.value}, SpO2 ${v.spo2.value}, Glucose ${v.glucose.value}`;
          sendRiskAlertEmail(riskLevel, summary, response);
        }
      }
    } finally {
      setIsTyping(false);
    }
  };

  const handleChatSend = async () => {
    const text = inputValue.trim();
    if (!text || isTyping) return;

    const userMsg: Message = {
      id: messages.length + 1,
      text,
      isBot: false,
      timestamp: new Date(),
    };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInputValue("");
    setIsTyping(true);

    try {
      setError(null);
      const historyForApi = messages
        .filter((m) => m.text)
        .reduce<Array<{ role: "user" | "model"; text: string }>>((acc, m) => {
          acc.push({ role: m.isBot ? "model" : "user", text: m.text });
          return acc;
        }, []);
      const response = await chatWithGemini(text, historyForApi);
      const botMsg: Message = {
        id: newMessages.length + 1,
        text: response,
        isBot: true,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botMsg]);
      const chatRiskLevel = detectRiskLevel(response);
      if (chatRiskLevel === "high" || chatRiskLevel === "risky") {
        sendRiskAlertEmail(
          chatRiskLevel,
          "Chat assessment",
          response
        );
      }
      saveToHistory({
        id: crypto.randomUUID(),
        mode: "chat",
        title: text.slice(0, 30) + (text.length > 30 ? "..." : ""),
        messages: [...newMessages, botMsg],
        createdAt: new Date().toISOString(),
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to get response.";
      setError(msg);
      setMessages((prev) => [
        ...prev,
        {
          id: prev.length + 1,
          text: `Sorry, something went wrong. ${msg}`,
          isBot: true,
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (mode === "chat") handleChatSend();
    }
  };

  const renderMessageText = (text: string) => {
    return text.split(/(\*\*[^*]+\*\*)/g).map((part, i) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return <strong key={i}>{part.slice(2, -2)}</strong>;
      }
      return part;
    });
  };

  const formatSessionDate = (iso: string) => {
    const d = new Date(iso);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    if (diff < 60000) return "Just now";
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return d.toLocaleDateString();
  };

  return (
    <>
      <motion.button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-lg flex items-center justify-center hover:scale-110 transition-transform"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        initial={{ scale: 0 }}
        animate={{ scale: isOpen ? 0 : 1 }}
      >
        <MessageCircle className="w-6 h-6" />
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed bottom-4 right-4 z-50 w-[400px] max-w-[calc(100vw-2rem)] h-[600px] max-h-[calc(100dvh-2rem)] bg-card border border-border rounded-2xl shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="bg-primary px-4 py-3 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-full bg-primary-foreground/20 flex items-center justify-center">
                  <Bot className="w-5 h-5 text-primary-foreground" />
                </div>
                <div>
                  <h3 className="font-semibold text-primary-foreground text-sm">
                    SafeMOM AI
                  </h3>
                  <p className="text-[10px] text-primary-foreground/70">
                    {isTyping ? "Thinking..." : "Powered by Gemini"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Sheet open={showHistory} onOpenChange={setShowHistory}>
                  <SheetTrigger asChild>
                    <button
                      className="p-2 rounded-lg text-primary-foreground/70 hover:bg-primary-foreground/20 hover:text-primary-foreground"
                      title="Chat history"
                    >
                      <History className="w-4 h-4" />
                    </button>
                  </SheetTrigger>
                  <SheetContent side="right" className="w-[340px] p-0">
                    <SheetHeader className="p-4 border-b">
                      <SheetTitle className="text-base">Chat History</SheetTitle>
                    </SheetHeader>
                    <ScrollArea className="h-[calc(100vh-80px)]">
                      <div className="p-2 space-y-1">
                        {history.length === 0 ? (
                          <p className="text-sm text-muted-foreground p-4 text-center">
                            No past chats yet.
                          </p>
                        ) : (
                          history.map((s) => (
                            <div
                              key={s.id}
                              className="p-3 rounded-lg hover:bg-secondary cursor-pointer text-left"
                              onClick={() => {
                                setMode(s.mode);
                                setMessages(s.messages);
                                setShowHistory(false);
                              }}
                            >
                              <div className="flex items-center gap-2">
                                {s.mode === "vitals" ? (
                                  <Activity className="w-4 h-4 text-health-good" />
                                ) : (
                                  <MessageSquare className="w-4 h-4 text-primary" />
                                )}
                                <span className="text-sm font-medium truncate flex-1">
                                  {s.title}
                                </span>
                              </div>
                              <p className="text-[10px] text-muted-foreground mt-0.5">
                                {formatSessionDate(s.createdAt)}
                              </p>
                            </div>
                          ))
                        )}
                      </div>
                    </ScrollArea>
                  </SheetContent>
                </Sheet>
                <button
                  onClick={() => handleOpenChange(false)}
                  className="p-2 rounded-lg text-primary-foreground/70 hover:bg-primary-foreground/20 hover:text-primary-foreground"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Mode selector */}
            {mode === "select" && (
              <div className="p-4 space-y-3 shrink-0">
                <p className="text-sm text-muted-foreground text-center">
                  How would you like to use SafeMOM AI?
                </p>
                <div className="grid gap-2">
                  <button
                    onClick={() => setMode("vitals")}
                    className="flex items-center gap-3 p-4 rounded-xl border border-border hover:border-primary/50 hover:bg-primary/5 transition-colors text-left"
                  >
                    <div className="w-12 h-12 rounded-xl bg-health-good/10 flex items-center justify-center">
                      <Activity className="w-6 h-6 text-health-good" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">Vitals Q/A</p>
                      <p className="text-xs text-muted-foreground">
                        Enter vitals → Get risk (Risky / High / Moderate / Normal)
                      </p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-muted-foreground" />
                  </button>
                  <button
                    onClick={() => {
                      setMode("chat");
                      setMessages([
                        {
                          id: 1,
                          text: "Hello! I'm SafeMOM AI. Ask me anything about maternal health, pregnancy, or wellness. 💕",
                          isBot: true,
                          timestamp: new Date(),
                        },
                      ]);
                    }}
                    className="flex items-center gap-3 p-4 rounded-xl border border-border hover:border-primary/50 hover:bg-primary/5 transition-colors text-left"
                  >
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                      <MessageSquare className="w-6 h-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">Normal Chat</p>
                      <p className="text-xs text-muted-foreground">
                        General maternal health conversation
                      </p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-muted-foreground" />
                  </button>
                </div>
              </div>
            )}

            {/* Vitals mode */}
            {mode === "vitals" && (
              <>
                <div className="px-4 pt-2 flex items-center justify-between">
                  <button
                    onClick={resetChat}
                    className="text-xs text-muted-foreground hover:text-foreground"
                  >
                    ← Back
                  </button>
                </div>
                <ScrollArea className="flex-1 px-4">
                  <div className="space-y-3 pb-4">
                    <p className="text-sm text-muted-foreground">
                      {vitals
                        ? "Using live vitals from dashboard. Click Analyze to assess."
                        : "Enter your vitals below:"}
                    </p>
                    <div className="grid gap-2">
                      {[
                        { key: "heartRate", label: "Heart Rate (bpm)", placeholder: "60-100" },
                        { key: "stress", label: "Stress (%)", placeholder: "< 50" },
                        { key: "spo2", label: "SpO₂ (%)", placeholder: "95-100" },
                        { key: "bloodPressure", label: "Blood Pressure (mmHg)", placeholder: "< 130" },
                        { key: "glucose", label: "Glucose (mg/dL)", placeholder: "70-120" },
                      ].map(({ key, label, placeholder }) => (
                        <div key={key} className="grid gap-1">
                          <Label className="text-xs">{label}</Label>
                          <Input
                            type="number"
                            placeholder={placeholder}
                            value={(vitalsForm as Record<string, string>)[key]}
                            onChange={(e) =>
                              setVitalsForm((p) => ({
                                ...p,
                                [key]: e.target.value,
                              }))
                            }
                            disabled={!!vitals}
                            className="h-9"
                          />
                        </div>
                      ))}
                    </div>
                    <p className="text-xs font-medium text-foreground pt-2 border-t border-border/50">
                      Quick symptoms (more info = better result)
                    </p>
                    <div className="grid gap-2">
                      {SYMPTOM_QUESTIONS.map(({ key, label }) => (
                        <div key={key} className="flex items-center justify-between gap-2">
                          <Label className="text-xs flex-1 shrink min-w-0">{label}</Label>
                          <div className="flex gap-1 shrink-0">
                            {(["y", "n"] as const).map((val) => {
                              const current = (vitalsForm as Record<string, string>)[key]?.toLowerCase();
                              const active = current === val;
                              return (
                                <Button
                                  key={val}
                                  type="button"
                                  variant={active ? "default" : "outline"}
                                  size="sm"
                                  className="h-7 w-9 px-2 text-xs"
                                  onClick={() =>
                                    setVitalsForm((p) => ({ ...p, [key]: p[key as SymptomKey] === val ? "" : val }))
                                  }
                                >
                                  {val.toUpperCase()}
                                </Button>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                    <Button
                      className="w-full gap-2"
                      onClick={handleAnalyzeVitals}
                      disabled={isTyping}
                    >
                      <Heart className="w-4 h-4" />
                      Analyze & Get Result
                    </Button>
                    {messages.length > 0 && (
                      <div className="space-y-3 pt-2 border-t">
                        {messages.map((m) => {
                          const riskLevel = m.isBot ? detectRiskLevel(m.text) : null;
                          const styles = riskLevel ? RISK_STYLES[riskLevel] : null;
                          const RiskIcon = styles?.icon;

                          return (
                            <div
                              key={m.id}
                              className={`flex gap-2 ${m.isBot ? "" : "flex-row-reverse"}`}
                            >
                              <div
                                className={`rounded-xl px-3 py-2 text-sm max-w-[90%] min-w-0 ${
                                  m.isBot
                                    ? riskLevel && styles
                                      ? `border-2 ${styles.card}`
                                      : "bg-secondary"
                                    : "bg-primary text-primary-foreground"
                                }`}
                              >
                                {m.isBot && riskLevel && styles && (
                                  <div
                                    className={`flex items-center gap-2 px-3 py-2 -mx-1 -mt-1 mb-2 rounded-lg border-2 font-bold uppercase tracking-wider text-sm ${styles.badge}`}
                                  >
                                    {RiskIcon && <RiskIcon className="w-5 h-5 flex-shrink-0" />}
                                    <span>{riskLevel}</span>
                                  </div>
                                )}
                                <p className="whitespace-pre-wrap leading-relaxed">
                                  {renderMessageText(m.text)}
                                </p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </>
            )}

            {/* Chat mode */}
            {mode === "chat" && (
              <>
                <div className="px-4 pt-2">
                  <button
                    onClick={resetChat}
                    className="text-xs text-muted-foreground hover:text-foreground"
                  >
                    ← Back
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
                  {messages.map((m) => (
                    <motion.div
                      key={m.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex ${m.isBot ? "justify-start" : "justify-end"}`}
                    >
                      <div
                        className={`flex items-end gap-2 max-w-[85%] ${
                          m.isBot ? "flex-row" : "flex-row-reverse"
                        }`}
                      >
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                            m.isBot ? "bg-primary/10" : "bg-accent/10"
                          }`}
                        >
                          {m.isBot ? (
                            <Bot className="w-4 h-4 text-primary" />
                          ) : (
                            <User className="w-4 h-4 text-accent" />
                          )}
                        </div>
                        <div
                          className={`rounded-2xl px-4 py-3 ${
                            m.isBot
                              ? "bg-secondary text-foreground rounded-bl-sm"
                              : "bg-primary text-primary-foreground rounded-br-sm"
                          }`}
                        >
                          <p className="text-sm leading-relaxed whitespace-pre-wrap">
                            {renderMessageText(m.text)}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                  {isTyping && (
                    <div className="flex justify-start">
                      <div className="flex items-end gap-2">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <Bot className="w-4 h-4 text-primary" />
                        </div>
                        <div className="bg-secondary rounded-2xl rounded-bl-sm px-4 py-3">
                          <div className="flex gap-1">
                            <span className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: "0ms" }} />
                            <span className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: "150ms" }} />
                            <span className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: "300ms" }} />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  {error && (
                    <p className="text-xs text-destructive px-4">{error}</p>
                  )}
                  <div ref={messagesEndRef} />
                </div>
                <div className="p-4 border-t shrink-0">
                  <div className="flex gap-2">
                    <Input
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="Type your message..."
                      className="flex-1 bg-secondary/50"
                    />
                    <Button
                      onClick={handleChatSend}
                      disabled={!inputValue.trim() || isTyping}
                      size="icon"
                      className="rounded-lg"
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-2 text-center">
                    ⚠️ AI guidance only. Consult your doctor for medical advice.
                  </p>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default AIChatbot;
