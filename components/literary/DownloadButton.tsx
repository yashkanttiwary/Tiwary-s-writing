'use client';

import { useState, useRef, useEffect } from 'react';
import { Download, Image as ImageIcon, FileText, Loader2 } from 'lucide-react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

export default function DownloadButton({ title }: { title: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const captureElement = async () => {
    const element = document.getElementById('writing-capture-area');
    if (!element) throw new Error('Capture area not found');
    
    // Tiny delay to ensure styles and layouts are settled
    await new Promise(resolve => setTimeout(resolve, 100));

    const canvas = await html2canvas(element, {
      scale: 2, 
      backgroundColor: '#fdfcf9', // Matches var(--color-canvas) exactly
      logging: false,
      useCORS: true,
      windowWidth: element.scrollWidth,
      windowHeight: element.scrollHeight
    });
    
    return canvas;
  };

  const downloadImage = async () => {
    try {
      setIsProcessing(true);
      const canvas = await captureElement();
      const image = canvas.toDataURL('image/png', 1.0);
      const link = document.createElement('a');
      link.href = image;
      link.download = `${title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.png`;
      link.click();
    } catch (error) {
      console.error('Failed to generate image', error);
    } finally {
      setIsProcessing(false);
      setIsOpen(false);
    }
  };

  const downloadPDF = async () => {
    try {
      setIsProcessing(true);
      const canvas = await captureElement();
      const imgData = canvas.toDataURL('image/png', 1.0);
      
      const pdf = new jsPDF({
        orientation: canvas.width > canvas.height ? 'l' : 'p',
        unit: 'px',
        format: [canvas.width, canvas.height]
      });
      
      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
      pdf.save(`${title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.pdf`);
    } catch (error) {
      console.error('Failed to generate PDF', error);
    } finally {
      setIsProcessing(false);
      setIsOpen(false);
    }
  };

  return (
    <div className="relative" ref={menuRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center gap-2 text-sm font-sans text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] transition-colors p-2 -mr-2"
        title="Download"
        aria-label="Download options"
      >
        {isProcessing ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
        <span className="hidden sm:inline font-medium">Save</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-48 bg-[#fdfcf9] border border-[var(--color-border)] rounded shadow-sm py-1 z-50 flex flex-col font-sans text-sm">
          <button 
            onClick={downloadImage}
            disabled={isProcessing}
            className="flex items-center gap-3 px-4 py-3 hover:bg-[var(--color-ink)]/5 text-[var(--color-ink)] transition-colors text-left disabled:opacity-50"
          >
            <ImageIcon size={15} className="text-[var(--color-ink-muted)]" />
            <span>Save as Image</span>
          </button>
          <button 
            onClick={downloadPDF}
            disabled={isProcessing}
            className="flex items-center gap-3 px-4 py-3 hover:bg-[var(--color-ink)]/5 text-[var(--color-ink)] transition-colors text-left disabled:opacity-50"
          >
            <FileText size={15} className="text-[var(--color-ink-muted)]" />
            <span>Save as PDF</span>
          </button>
        </div>
      )}
    </div>
  );
}
