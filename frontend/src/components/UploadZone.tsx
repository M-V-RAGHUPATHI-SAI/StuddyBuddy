import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";

interface UploadZoneProps {
  onFileUploaded: (file: File) => void;
}

export const UploadZone = ({ onFileUploaded }: UploadZoneProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onFileUploaded(file);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center border-2 border-dashed border-border rounded-2xl p-8 bg-card shadow-soft">
      <Upload className="w-8 h-8 text-primary mb-4" />
      <p className="mb-4 text-muted-foreground text-sm">Drag & drop or click below to upload a PDF</p>
      <input
        type="file"
        accept=".pdf"
        ref={fileInputRef}
        className="hidden"
        onChange={handleFileChange}
      />
      <Button onClick={() => fileInputRef.current?.click()} className="bg-gradient-primary text-white">
        Choose PDF
      </Button>
    </div>
  );
};
