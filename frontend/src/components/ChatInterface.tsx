import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, BookOpen, Upload, Copy, Check, Volume2, Square, Menu, ExternalLink, LogOut } from "lucide-react";
import { UploadZone } from "@/components/UploadZone";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "../context/AuthContext";

interface Message {
  role: "user" | "assistant";
  content: string;
  sources?: number[];
}

interface ChatInterfaceProps {
  fileName: string | null;
  onFileUploaded: (file: File) => void;
  messages: Message[];
  onMessagesChange: (messages: Message[] | ((prev: Message[]) => Message[])) => void;
  onCitationClick: (page: number) => void;
  isSidebarOpen?: boolean;
  onToggleSidebar?: () => void;
}

export const ChatInterface = ({
  fileName,
  onFileUploaded,
  messages,
  onMessagesChange,
  onCitationClick,
  isSidebarOpen,
  onToggleSidebar,
}: ChatInterfaceProps) => {
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [speakingIndex, setSpeakingIndex] = useState<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const { user, logout } = useAuth();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleSpeak = (text: string, index: number) => {
    if (speakingIndex === index) {
      window.speechSynthesis.cancel();
      setSpeakingIndex(null);
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.onend = () => setSpeakingIndex(null);
    setSpeakingIndex(index);
    window.speechSynthesis.speak(utterance);
  };

  // ------------------- SEND MESSAGE -------------------
  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = { role: "user", content: input };

    // Initial user message and loading state
    onMessagesChange(prev => [
      ...prev,
      userMessage,
      { role: "assistant", content: "" }
    ]);

    setInput("");
    setIsLoading(true);

    try {
      const token = await user?.getIdToken();
      const response = await fetch("http://127.0.0.1:5000/ask", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ query: input }),
      });

      if (!response.body) throw new Error("No response body");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let done = false;
      let assistantText = "";

      setIsLoading(false); // Stop the "thinking" animation immediately once the stream starts

      while (!done) {
        const { value, done: readerDone } = await reader.read();
        done = readerDone;
        if (value) {
          assistantText += decoder.decode(value, { stream: true });

          // Check if citations suffix arrived
          let displayContent = assistantText;
          let sourcesArray: number[] = [];

          if (assistantText.includes("__CITATIONS__:['")) {
            // Legacy format fallback just in case
            const parts = assistantText.split("__CITATIONS__:['");
            displayContent = parts[0].trim();
          } else if (assistantText.includes("\n\n__CITATIONS__:[")) {
            const parts = assistantText.split("\n\n__CITATIONS__:[");
            displayContent = parts[0].trim();

            if (parts[1]) {
              const arrayString = parts[1].replace("]", "");
              sourcesArray = arrayString.split(",").map((s) => parseInt(s.trim())).filter((n) => !isNaN(n));
            }
          }

          // Update the last message progressively
          onMessagesChange(prev => {
            const updated = [...prev];
            updated[updated.length - 1] = {
              role: "assistant",
              content: displayContent,
              sources: sourcesArray.length > 0 ? sourcesArray : undefined
            };
            return updated;
          });
        }
      }
    } catch (error) {
      console.error("Error:", error);
      setIsLoading(false); // Clear loading state safely
      onMessagesChange(prev => {
        const updated = [...prev];
        updated[updated.length - 1] = {
          role: "assistant",
          content: "⚠️ Server error. Check Flask backend.",
        };
        return updated;
      });
    }
  };

  // ------------------- FILE UPLOAD -------------------
  const handleFileUpload = async (file: File) => {
    onFileUploaded(file);
    setShowUpload(false);

    const formData = new FormData();
    formData.append("pdf", file);

    try {
      const token = await user?.getIdToken();
      const response = await fetch("http://127.0.0.1:5000/upload", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`
        },
        body: formData,
      });

      if (response.ok) {
        toast({
          title: "✅ Upload successful!",
          description: `"${file.name}" is ready for questions.`,
          duration: 3000,
        });
      } else {
        toast({
          title: "⚠️ Upload failed",
          description: "Please check your backend or try again.",
          variant: "destructive",
        });
      }
    } catch (err) {
      console.error("Upload error:", err);
      toast({
        title: "❌ Server error",
        description: "Could not connect to Flask backend.",
        variant: "destructive",
      });
    }
  };

  // ------------------- UI -------------------
  return (
    <div className="flex flex-col h-full max-w-4xl mx-auto">
      {/* ---------- HEADER ---------- */}
      <div className="bg-card border-b border-border px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {onToggleSidebar && (
            <Button
              variant="outline"
              size="sm"
              className="mr-2 gap-2"
              onClick={onToggleSidebar}
              title="Toggle History Sidebar"
            >
              <Menu className="w-4 h-4 text-gray-700" />
              <span>History</span>
            </Button>
          )}
          <div className="w-10 h-10 bg-gradient-primary rounded-xl flex items-center justify-center hidden sm:flex">
            <BookOpen className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            {fileName ? (
              <>
                <h2 className="font-semibold">{fileName}</h2>
                <p className="text-sm text-muted-foreground">
                  Ask any question about your document
                </p>
              </>
            ) : (
              <>
                <h2 className="font-semibold">Smart Study Buddy</h2>
                <p className="text-sm text-muted-foreground">
                  Upload a document to get started
                </p>
              </>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {fileName && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setInput("");
                setShowUpload(!showUpload);
              }}
              className="gap-2"
            >
              <Upload className="w-4 h-4" />
              {showUpload ? "Cancel" : "Change Document"}
            </Button>
          )}
          <Button variant="ghost" size="sm" onClick={logout} className="gap-2 text-muted-foreground hover:text-red-600 transition-colors">
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Logout</span>
          </Button>
        </div>
      </div>

      {/* ---------- CHAT AREA ---------- */}
      <ScrollArea className="flex-1 p-6">
        {!showUpload && messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${message.role === "user" ? "justify-end mt-6" : "justify-start mt-6"
              } animate-in slide-in-from-bottom-2 fade-in duration-300`} // 🟣 Added animate-in directly here
          >
            <div
              className={`max-w-[80%] rounded-2xl p-5 ${message.role === "user"
                ? "bg-gradient-primary text-primary-foreground shadow-soft"
                : "bg-card border border-border shadow-soft group relative"
                }`}
            >
              <p className="whitespace-pre-wrap leading-relaxed">
                {message.content}
              </p>
              {message.role === "assistant" && (
                <div className="absolute -bottom-4 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1 bg-background border border-border rounded-md shadow-sm p-1">
                  <button onClick={() => handleCopy(message.content, index)} className="p-1 hover:bg-muted rounded" title="Copy text">
                    {copiedIndex === index ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4 text-muted-foreground" />}
                  </button>
                  <button onClick={() => handleSpeak(message.content, index)} className="p-1 hover:bg-muted rounded" title={speakingIndex === index ? "Stop speaking" : "Read aloud"}>
                    {speakingIndex === index ? <Square className="w-4 h-4 text-red-500" /> : <Volume2 className="w-4 h-4 text-muted-foreground" />}
                  </button>
                </div>
              )}

              {/* Citations Footer */}
              {message.sources && message.sources.length > 0 && (
                <div className="mt-4 pt-4 border-t border-border/50">
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 block">Sources</span>
                  <div className="flex flex-wrap gap-2">
                    {message.sources.map((page, i) => (
                      <Button
                        key={i}
                        variant="outline"
                        size="sm"
                        className="h-8 text-xs bg-blue-50/50 hover:bg-blue-100 hover:text-blue-700 text-blue-600 border-blue-200 transition-all rounded-full px-4 flex items-center gap-1.5 shadow-sm"
                        onClick={() => onCitationClick(page)}
                        title={`Open Page ${page} in new tab`}
                      >
                        [Page {page}]
                        <ExternalLink className="w-3 h-3 opacity-70" />
                      </Button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}

        {(!fileName || showUpload) && (
          <div className="text-center py-12 space-y-6">
            <UploadZone onFileUploaded={handleFileUpload} />
          </div>
        )}

        {!showUpload && isLoading && (
          <div className="flex justify-start mt-6 animate-in slide-in-from-bottom-2 fade-in duration-300">
            <div className="bg-card border border-border rounded-2xl p-5 shadow-soft">
              <div className="flex items-center gap-3">
                <span className="text-sm text-muted-foreground font-medium">StudyBuddy is thinking</span>
                <div className="flex gap-1.5">
                  <div className="w-1.5 h-1.5 bg-primary/60 rounded-full animate-bounce" />
                  <div className="w-1.5 h-1.5 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                  <div className="w-1.5 h-1.5 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </ScrollArea>

      {/* ---------- INPUT AREA ---------- */}
      <div className="border-t border-border p-6">
        <div className="flex gap-3">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSend();
            }}
            placeholder={
              fileName
                ? "Ask a question about your document..."
                : "Upload a document first..."
            }
            className="flex-1 h-12 rounded-xl border-2"
            disabled={isLoading || !fileName || showUpload}
          />
          <Button
            onClick={handleSend}
            disabled={isLoading || !input.trim() || !fileName || showUpload}
            size="lg"
            className="bg-gradient-primary hover:shadow-glow px-6"
          >
            <Send className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </div>
  );
};
