import { useEffect, useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";

const queryClient = new QueryClient();

interface Chat {
  id: string;
  title: string;
  messages: any[];
  fileName?: string;
}

const App = () => {
  const [chats, setChats] = useState<Chat[]>([]);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("chat_history");
    if (stored) {
      const parsed = JSON.parse(stored);
      setChats(parsed);
      setCurrentChatId(parsed[0]?.id || null);
    } else {
      createNewChat();
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("chat_history", JSON.stringify(chats));
  }, [chats]);



  const createNewChat = () => {
    const newChat: Chat = {
      id: Date.now().toString(),
      title: `New Chat`,
      messages: [
        {
          role: "assistant",
          content: "Hi! I'm StudyBuddy 👋\nI can help you understand your document.\n\nYou can:\n• Ask questions about the document\n• Generate quiz questions for studying\n• Summarize sections\n• Find key concepts\n\nTry asking something like:\n- 'What are the key ideas in this paper?'\n- 'Explain the methodology'\n- 'Generate quiz questions from this document'"
        }
      ],
    };
    setChats((prev) => [newChat, ...prev]);
    setCurrentChatId(newChat.id);
  };

  const updateChatFileName = (id: string, fileName: string) => {
    setChats((prev) =>
      prev.map((chat) => (chat.id === id ? { ...chat, fileName, title: fileName.split(".")[0] } : chat))
    );
  };

  const createNewSessionWithFile = (fileName: string) => {
    const newChat: Chat = {
      id: Date.now().toString(),
      title: fileName.split(".")[0],
      messages: [
        {
          role: "assistant",
          content: `Hi! I'm StudyBuddy 👋\nI'm ready to answer your questions about ${fileName}.`
        }
      ],
      fileName: fileName,
    };
    setChats((prev) => [newChat, ...prev]);
    setCurrentChatId(newChat.id);
  };

  const deleteChat = (id: string) => {
    const filtered = chats.filter((c) => c.id !== id);
    setChats(filtered);
    if (filtered.length) setCurrentChatId(filtered[0].id);
    else createNewChat();
  };

  const updateChatMessages = (id: string, messages: any[]) => {
    setChats((prev) =>
      prev.map((chat) =>
        chat.id === id ? { ...chat, messages: [...messages] } : chat
      )
    );
  };

  const renameChat = (id: string, title: string) => {
    setChats((prev) =>
      prev.map((chat) => (chat.id === id ? { ...chat, title } : chat))
    );
  };

  const currentChat = chats.find((chat) => chat.id === currentChatId);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <div className="flex h-screen bg-gray-50">
            {/* Sidebar */}
            <div className="w-64 bg-white border-r border-gray-200 flex flex-col shadow-sm">
              <div className="p-4 border-b flex justify-between items-center bg-gray-50">
                <div className="flex items-center gap-2">
                  <h2 className="font-semibold text-lg text-gray-800">History</h2>
                </div>
                <Button
                  size="icon"
                  variant="secondary"
                  className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:shadow-glow text-white rounded-xl p-2.5 transition-all duration-300 h-9 w-9"
                  onClick={createNewChat}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>

              <div className="flex-1 overflow-y-auto">
                {chats.length === 0 && (
                  <p className="text-center text-gray-400 mt-4">No chats yet</p>
                )}
                {chats.map((chat) => (
                  <div
                    key={chat.id}
                    onClick={() => setCurrentChatId(chat.id)}
                    className={`flex items-center justify-between px-3 py-2 cursor-pointer rounded-md transition-all duration-150 ${currentChatId === chat.id
                      ? "bg-blue-100 text-blue-700 font-semibold"
                      : "hover:bg-gray-100"
                      }`}
                  >
                    <span className="truncate flex-1">{chat.title}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteChat(chat.id);
                      }}
                    >
                      <Trash2 className="w-4 h-4 text-red-500 hover:text-red-700" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-hidden">
              <Routes>
                <Route
                  path="/"
                  element={
                    <Index
                      chat={currentChat}
                      updateChatMessages={(msgs) =>
                        updateChatMessages(currentChatId!, msgs)
                      }
                      updateChatFileName={(name) => updateChatFileName(currentChatId!, name)}
                      createNewSession={createNewSessionWithFile}
                    />
                  }
                />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </div>
          </div>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
