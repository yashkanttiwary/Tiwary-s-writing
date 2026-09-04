'use client';

import { useState, useRef, useEffect } from 'react';
import { Download, Image as ImageIcon, FileText, Loader2 } from 'lucide-react';
import type { Writing } from '@/lib/content';

export default function DownloadButton({ title, writing }: { title: string, writing?: Writing }) {
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

    const html2canvas = (await import('html2canvas')).default;

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
      const safeTitle = title.replace(/[<>:"/\\|?*]/g, '').trim() || 'writing';
      link.download = `${safeTitle} by Yash Kant Tiwary.png`;
      link.click();
    } catch (error) {
      console.error('Failed to generate image', error);
    } finally {
      setIsProcessing(false);
      setIsOpen(false);
    }
  };

  function arrayBufferToBase64(buffer: ArrayBuffer) {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
  }

  const downloadPDF = async () => {
    try {
      setIsProcessing(true);
      
      const { jsPDF } = await import('jspdf');
      
      const pdf = new jsPDF({
        orientation: 'p',
        unit: 'px',
        format: 'a4'
      });
      
      // Load fonts
      const notoRes = await fetch('/fonts/NotoSerifDevanagari.ttf');
      const notoBuf = await notoRes.arrayBuffer();
      const notoBase64 = arrayBufferToBase64(notoBuf);
      pdf.addFileToVFS('NotoSerifDevanagari.ttf', notoBase64);
      pdf.addFont('NotoSerifDevanagari.ttf', 'NotoSerifDevanagari', 'normal');

      const playfairRes = await fetch('/fonts/PlayfairDisplay.ttf');
      const playfairBuf = await playfairRes.arrayBuffer();
      const playfairBase64 = arrayBufferToBase64(playfairBuf);
      pdf.addFileToVFS('PlayfairDisplay.ttf', playfairBase64);
      pdf.addFont('PlayfairDisplay.ttf', 'PlayfairDisplay', 'normal');

      const isHindi = writing?.metadata?.language === 'hi';
      const mainFont = isHindi ? 'NotoSerifDevanagari' : 'PlayfairDisplay';
      
      // Add custom background color for the PDF to match the warm tone
      pdf.setFillColor(253, 252, 249); // #fdfcf9
      pdf.rect(0, 0, pdf.internal.pageSize.getWidth(), pdf.internal.pageSize.getHeight(), 'F');
      
      // Margins
      const margin = 40;
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      let y = 60;
      
      // Title
      pdf.setFont(mainFont, 'normal');
      pdf.setFontSize(24);
      pdf.setTextColor(20, 20, 20); // #141414
      const safeTitle = title.replace(/[<>:"/\\|?*]/g, '').trim() || 'writing';
      pdf.text(title || 'Untitled', pageWidth / 2, y, { align: 'center' });
      y += 20;
      
      // Date and Type
      pdf.setFont('PlayfairDisplay', 'normal');
      pdf.setFontSize(10);
      pdf.setTextColor(150, 150, 150);
      let metaText = '';
      if (writing?.metadata?.publishedAt) {
        metaText += new Date(writing.metadata.publishedAt).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
      }
      if (writing?.metadata?.type) {
        metaText += metaText ? `  ·  ${writing.metadata.type}` : writing.metadata.type;
      }
      pdf.text(metaText.toUpperCase(), pageWidth / 2, y, { align: 'center' });
      y += 40;
      
      // Content
      pdf.setFont(mainFont, 'normal');
      pdf.setFontSize(14);
      pdf.setTextColor(40, 40, 40);
      
      // Strip some basic markdown for PDF 
      let content = writing?.content || '';
      content = content.replace(/^#+\s/gm, '').replace(/\*\*/g, '').replace(/_/g, '').replace(/> /g, '');
      
      // We process the content line by line to maintain exact paragraph/stanza structures
      const originalLines = content.split('\n');
      
      for (const line of originalLines) {
        if (line.trim() === '') {
          y += 18; // Empty line for stanzas
          continue;
        }
        
        const wrappedLines = pdf.splitTextToSize(line, pageWidth - margin * 2);
        for (const wrappedLine of wrappedLines) {
          if (y > pageHeight - margin - 40) {
            pdf.addPage();
            pdf.setFillColor(253, 252, 249);
            pdf.rect(0, 0, pdf.internal.pageSize.getWidth(), pdf.internal.pageSize.getHeight(), 'F');
            y = margin;
          }
          pdf.text(wrappedLine, margin, y);
          y += 22; // Line height
        }
      }
      
      y += 20;
      
      // Author Signature
      if (y > pageHeight - margin - 40) {
        pdf.addPage();
        pdf.setFillColor(253, 252, 249);
        pdf.rect(0, 0, pdf.internal.pageSize.getWidth(), pdf.internal.pageSize.getHeight(), 'F');
        y = margin;
      }
      pdf.setFont('PlayfairDisplay', 'normal');
      pdf.setFontSize(12);
      pdf.setTextColor(150, 150, 150);
      pdf.text('Yash Kant Tiwary', pageWidth / 2, y, { align: 'center' });
      
      pdf.save(`${safeTitle} by Yash Kant Tiwary.pdf`);
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
        className="inline-flex items-center gap-2 text-sm font-sans text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] transition-colors p-2"
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
            <span>Save as PDF (Selectable)</span>
          </button>
        </div>
      )}
    </div>
  );
}
