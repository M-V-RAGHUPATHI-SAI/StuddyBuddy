import { useEffect } from "react";
import { ChatInterface } from "@/components/ChatInterface";

interface IndexProps {
  chat: any;
  updateChatMessages: (messages: any[]) => void;
  updateChatFileName: (fileName: string) => void;
  createNewSession: (fileName: string) => void;
  resetSessionForNewDocument: (fileName: string) => void;
  isSidebarOpen: boolean;
  setIsSidebarOpen: (isOpen: boolean) => void;
}

const Index = ({
  chat,
  updateChatMessages,
  updateChatFileName,
  createNewSession,
  resetSessionForNewDocument,
  isSidebarOpen,
  setIsSidebarOpen
}: IndexProps) => {

  const handleFileUploaded = (file: File) => {
    if (chat?.fileName) {
      resetSessionForNewDocument(file.name);
    } else {
      updateChatFileName(file.name);
    }
  };

  const handleCitationClick = (page: number) => {
    if (chat?.fileName) {
      const API = import.meta.env.VITE_API_URL || "http://127.0.0.1:5000";
      const encoded = encodeURIComponent(chat.fileName);
      window.open(`${API}/pdf/${encoded}#page=${page}`, "_blank");
    }
  };

  return (
    <div className="h-screen bg-gradient-mesh flex flex-col relative overflow-hidden">
      <div className="flex flex-1 h-screen overflow-hidden">
        {/* Chat spans full width */}
        <div className="h-full w-full transition-all duration-300 relative">
          <ChatInterface
            fileName={chat?.fileName || null}
            onFileUploaded={handleFileUploaded}
            messages={chat?.messages || []}
            onMessagesChange={updateChatMessages}
            onCitationClick={handleCitationClick}
            isSidebarOpen={isSidebarOpen}
            onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          />
        </div>
      </div>
    </div>
  );
};

export default Index;
