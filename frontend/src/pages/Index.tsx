import { useEffect, useState } from "react";
import { ChatInterface } from "@/components/ChatInterface";
import { PDFViewer } from "@/components/PDFViewer";

interface IndexProps {
  chat: any;
  updateChatMessages: (messages: any[]) => void;
  updateChatFileName: (fileName: string) => void;
  createNewSession: (fileName: string) => void;
}

const Index = ({
  chat,
  updateChatMessages,
  updateChatFileName,
  createNewSession,
}: IndexProps) => {
  const [targetPage, setTargetPage] = useState<number>(1);

  const handleFileUploaded = (file: File) => {
    if (chat?.fileName) {
      createNewSession(file.name);
    } else {
      updateChatFileName(file.name);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-mesh flex">
      {/* Dynamic layout: full width if no file, 50% if file exists */}
      <div className={`h-screen transition-all duration-300 ${chat?.fileName ? "w-1/2 border-r border-border shadow-2xl z-10" : "w-full"}`}>
        <ChatInterface
          fileName={chat?.fileName || null}
          onFileUploaded={handleFileUploaded}
          messages={chat?.messages || []}
          onMessagesChange={updateChatMessages}
          onCitationClick={setTargetPage}
        />
      </div>

      {/* PDF Viewer takes up exactly the right 50% */}
      {chat?.fileName && (
        <div className="w-1/2 h-full bg-muted/30">
          <PDFViewer fileName={chat.fileName} targetPage={targetPage} />
        </div>
      )}
    </div>
  );
};

export default Index;
