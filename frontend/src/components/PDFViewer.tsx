import { useState, useEffect } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/TextLayer.css';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import { Loader2 } from 'lucide-react';

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface PDFViewerProps {
    fileName: string | null;
    targetPage: number;
}

export const PDFViewer = ({ fileName, targetPage }: PDFViewerProps) => {
    const [numPages, setNumPages] = useState<number>();

    function onDocumentLoadSuccess({ numPages }: { numPages: number }): void {
        setNumPages(numPages);
    }

    if (!fileName) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground bg-slate-50">
                <p>Upload a document to view it here.</p>
            </div>
        );
    }

    const pdfUrl = `http://localhost:5000/pdf/${fileName}`;

    return (
        <div className="flex flex-col h-full bg-slate-100 overflow-hidden relative">
            <div className="absolute top-0 left-0 right-0 bg-white/80 backdrop-blur-sm border-b p-2 z-10 flex justify-between items-center shadow-sm">
                <span className="text-sm font-medium truncate max-w-[200px]" title={fileName}>{fileName}</span>
                {numPages && (
                    <span className="text-xs text-muted-foreground bg-slate-100 px-2 py-1 rounded-md font-medium">
                        Page {targetPage} of {numPages}
                    </span>
                )}
            </div>

            <div className="flex-1 overflow-auto p-4 pt-14 pb-20 justify-center flex drop-shadow-md">
                <Document
                    file={pdfUrl}
                    onLoadSuccess={onDocumentLoadSuccess}
                    loading={
                        <div className="flex items-center justify-center h-full w-full">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                    }
                    className="flex justify-center w-full"
                >
                    <Page
                        pageNumber={targetPage}
                        renderTextLayer={true}
                        renderAnnotationLayer={true}
                        className="shadow-lg rounded-sm overflow-hidden border border-slate-200"
                        width={calculateWidth()}
                    />
                </Document>
            </div>
        </div>
    );
};

// Simple responsive width helper
const calculateWidth = () => {
    const viewportWidth = window.innerWidth;
    // Account for sidebar (256px) and half horizontal screen assumption
    const availableWidth = (viewportWidth - 256) / 2;
    // Give some padding and max out at a reasonable bounds
    return Math.min(Math.max(availableWidth - 80, 400), 800);
}
