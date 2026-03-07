import { Button } from "@/components/ui/button";
import { Upload, MessageSquare, BookOpen } from "lucide-react";

interface HeroProps {
  onGetStarted: () => void;
}

export const Hero = ({ onGetStarted }: HeroProps) => {
  return (
    <div className="min-h-screen bg-gradient-mesh flex flex-col items-center justify-center px-4 py-20">
      <div className="max-w-5xl mx-auto text-center space-y-8 animate-in fade-in duration-1000">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-secondary rounded-full text-sm font-medium text-secondary-foreground border border-border shadow-soft">
          <BookOpen className="w-4 h-4" />
          <span>AI-Powered Study Assistant</span>
        </div>
        
        <h1 className="text-5xl md:text-7xl font-bold bg-gradient-primary bg-clip-text text-transparent leading-tight">
          Your Smart Study Buddy
        </h1>
        
        <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto">
          Upload your PDFs, textbooks, and notes. Ask questions in natural language and get instant answers with precise source references.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
          <Button 
            size="lg" 
            onClick={onGetStarted}
            className="bg-gradient-primary hover:shadow-glow transition-all duration-300 text-lg px-8"
          >
            <Upload className="w-5 h-5 mr-2" />
            Get Started
          </Button>
          <Button 
            size="lg" 
            variant="outline"
            className="text-lg px-8 border-2 hover:bg-secondary"
          >
            <MessageSquare className="w-5 h-5 mr-2" />
            See How It Works
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-16 max-w-4xl mx-auto">
          <div className="bg-card rounded-2xl p-6 shadow-soft border border-border hover:shadow-glow transition-all duration-300">
            <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center mb-4">
              <Upload className="w-6 h-6 text-primary-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Upload Documents</h3>
            <p className="text-muted-foreground text-sm">
              Drag and drop PDFs, textbooks, or notes. We'll process them instantly.
            </p>
          </div>

          <div className="bg-card rounded-2xl p-6 shadow-soft border border-border hover:shadow-glow transition-all duration-300">
            <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center mb-4">
              <MessageSquare className="w-6 h-6 text-primary-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Ask Questions</h3>
            <p className="text-muted-foreground text-sm">
              Chat naturally with your documents. Get clear, contextual answers.
            </p>
          </div>

          <div className="bg-card rounded-2xl p-6 shadow-soft border border-border hover:shadow-glow transition-all duration-300">
            <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center mb-4">
              <BookOpen className="w-6 h-6 text-primary-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Source References</h3>
            <p className="text-muted-foreground text-sm">
              Every answer includes page numbers and exact excerpts from your materials.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
