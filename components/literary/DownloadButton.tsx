'use client';

import { useState, useRef, useEffect } from 'react';
import { Download, Image as ImageIcon, FileText, Loader2 } from 'lucide-react';
import { createPortal } from 'react-dom';
import type { Writing } from '@/lib/content';
import { LiteraryRenderer } from './LiteraryRenderer';

export default function DownloadButton({ title, writing }: { title: string, writing?: Writing }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processLabel, setProcessLabel] = useState<string>('');
  const [mounted, setMounted] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const captureElement = async (): Promise<string> => {
    const element = document.getElementById('optimized-capture-area');
    if (!element) throw new Error('Capture area not found in document');

    // Ensure all web fonts (Noto Serif Devanagari, Crimson Pro, Playfair) are fully ready
    if (typeof document !== 'undefined' && document.fonts && document.fonts.ready) {
      try {
        await document.fonts.ready;
      } catch (e) {
        console.warn('Font loading check skipped', e);
      }
    }

    // Brief delay to allow layout engine to settle
    await new Promise(resolve => setTimeout(resolve, 100));

    // Try primary high-fidelity html-to-image capture
    try {
      const { toPng } = await import('html-to-image');
      const dataUrl = await toPng(element, {
        backgroundColor: '#fdfcf9',
        pixelRatio: 2,
        cacheBust: false,
        skipFonts: false,
      });
      if (dataUrl && dataUrl.length > 1000) {
        return dataUrl;
      }
    } catch (err) {
      console.warn('html-to-image capture encountered an issue, trying html2canvas fallback:', err);
    }

    // High-fidelity fallback using html2canvas
    const html2canvas = (await import('html2canvas')).default;
    const canvas = await html2canvas(element, {
      scale: 2,
      backgroundColor: '#fdfcf9',
      useCORS: true,
      logging: false,
      allowTaint: true,
    });
    return canvas.toDataURL('image/png');
  };

  const downloadImage = async () => {
    try {
      setIsProcessing(true);
      setProcessLabel('Exporting Image...');
      const dataUrl = await captureElement();
      
      const safeTitle = title.replace(/[<>:"/\\|?*]/g, '').trim() || 'writing';
      const fileName = `${safeTitle} by Yash Kant Tiwary.png`;

      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      setTimeout(() => {
        if (document.body.contains(link)) {
          document.body.removeChild(link);
        }
      }, 1000);
    } catch (error) {
      console.error('Failed to generate image', error);
    } finally {
      setIsProcessing(false);
      setProcessLabel('');
      setIsOpen(false);
    }
  };

  const downloadPDF = async () => {
    try {
      setIsProcessing(true);
      setProcessLabel('Rendering PDF...');

      // Capture the pristine high-resolution publication layout
      const dataUrl = await captureElement();
      
      const { jsPDF } = await import('jspdf');

      const img = new Image();
      img.src = dataUrl;
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error('Failed to load rendered image'));
      });

      const imgWidth = img.naturalWidth || img.width;
      const imgHeight = img.naturalHeight || img.height;

      if (!imgWidth || !imgHeight) {
        throw new Error('Rendered image has zero dimensions');
      }

      // Standard A4 in points: 595.28 x 841.89 pt
      const pdf = new jsPDF({
        orientation: 'p',
        unit: 'pt',
        format: 'a4',
        compress: true,
      });

      const pdfPageWidth = pdf.internal.pageSize.getWidth();
      const pdfPageHeight = pdf.internal.pageSize.getHeight();
      
      // Standard book margins: 36 pt (~0.5 inch)
      const margin = 36;
      const printableWidth = pdfPageWidth - (margin * 2);
      const printableHeight = pdfPageHeight - (margin * 2);

      // Metadata embedding
      const safeTitle = title.replace(/[<>:"/\\|?*]/g, '').trim() || 'writing';
      pdf.setProperties({
        title: title || 'Untitled',
        subject: writing?.metadata?.excerpt || `A ${writing?.metadata?.type || 'piece'} by Yash Kant Tiwary`,
        author: 'Yash Kant Tiwary',
        keywords: writing?.metadata?.tags?.join(', ') || '',
        creator: 'Tiwary’s Writing Archive (tiwaryswriting.com)',
      });

      // Ratio of PDF printable width to source image width
      const scale = printableWidth / imgWidth;
      const totalRenderedHeight = imgHeight * scale;

      if (totalRenderedHeight <= printableHeight) {
        // Fits comfortably on a single A4 page
        pdf.setFillColor(253, 252, 249); // #fdfcf9 paper tone
        pdf.rect(0, 0, pdfPageWidth, pdfPageHeight, 'F');

        // Center vertically if there is plenty of room, otherwise start from top margin
        const yOffset = totalRenderedHeight < printableHeight * 0.75 
          ? Math.max(margin, (pdfPageHeight - totalRenderedHeight) / 2)
          : margin;

        pdf.addImage(dataUrl, 'PNG', margin, yOffset, printableWidth, totalRenderedHeight, undefined, 'FAST');
      } else {
        // Multi-page document: slice the canvas cleanly across pages
        const sourcePageHeight = printableHeight / scale;
        const totalPages = Math.ceil(imgHeight / sourcePageHeight);
        let sourceY = 0;
        let pageIndex = 1;

        while (sourceY < imgHeight) {
          if (pageIndex > 1) {
            pdf.addPage();
          }

          // Page background
          pdf.setFillColor(253, 252, 249);
          pdf.rect(0, 0, pdfPageWidth, pdfPageHeight, 'F');

          const currentSliceHeight = Math.min(sourcePageHeight, imgHeight - sourceY);
          if (currentSliceHeight <= 0) break;

          const sliceCanvas = document.createElement('canvas');
          sliceCanvas.width = imgWidth;
          sliceCanvas.height = currentSliceHeight;
          const ctx = sliceCanvas.getContext('2d');

          if (ctx) {
            // Background fill on canvas
            ctx.fillStyle = '#fdfcf9';
            ctx.fillRect(0, 0, sliceCanvas.width, sliceCanvas.height);
            ctx.drawImage(img, 0, sourceY, imgWidth, currentSliceHeight, 0, 0, imgWidth, currentSliceHeight);

            const pageDataUrl = sliceCanvas.toDataURL('image/png');
            const renderedSliceHeight = currentSliceHeight * scale;

            pdf.addImage(pageDataUrl, 'PNG', margin, margin, printableWidth, renderedSliceHeight, undefined, 'FAST');
          }

          // Subtle page number on multi-page pieces
          if (totalPages > 1) {
            pdf.setFont('helvetica', 'normal');
            pdf.setFontSize(8);
            pdf.setTextColor(170, 170, 170);
            pdf.text(`${pageIndex} of ${totalPages}`, pdfPageWidth / 2, pdfPageHeight - 16, { align: 'center' });
          }

          sourceY += sourcePageHeight;
          pageIndex++;
        }
      }
      
      const fileName = `${safeTitle} by Yash Kant Tiwary.pdf`;

      try {
        pdf.save(fileName);
      } catch (saveErr) {
        console.warn('pdf.save failed, downloading via blob anchor:', saveErr);
        const blob = pdf.output('blob');
        const blobUrl = URL.createObjectURL(blob);
        const downloadAnchor = document.createElement('a');
        downloadAnchor.href = blobUrl;
        downloadAnchor.download = fileName;
        document.body.appendChild(downloadAnchor);
        downloadAnchor.click();
        setTimeout(() => {
          if (document.body.contains(downloadAnchor)) {
            document.body.removeChild(downloadAnchor);
          }
          URL.revokeObjectURL(blobUrl);
        }, 2000);
      }
    } catch (error) {
      console.error('Failed to generate PDF', error);
    } finally {
      setIsProcessing(false);
      setProcessLabel('');
      setIsOpen(false);
    }
  };

  const isDevanagari = writing?.metadata?.language === 'hi' || writing?.metadata?.language === 'mr' || writing?.metadata?.language === 'ne';

  const optimizedCaptureContainer = mounted && writing ? (
    <div 
      aria-hidden="true"
      style={{ 
        position: 'fixed', 
        top: 0, 
        left: '-99999px', 
        width: '850px',
        opacity: 1, 
        visibility: 'visible', 
        pointerEvents: 'none', 
        zIndex: -9999 
      }}
    >
      <style>{`
        @font-face {
          font-family: 'Noto Serif Devanagari';
          src: url('/fonts/NotoSerifDevanagari.ttf') format('truetype');
          font-weight: 400 700;
          font-display: block;
        }
        @font-face {
          font-family: 'Playfair Display';
          src: url('/fonts/PlayfairDisplay.ttf') format('truetype');
          font-weight: 400 700;
          font-display: block;
        }
      `}</style>
      <div 
        id="optimized-capture-area" 
        className="bg-[#fdfcf9] w-[850px] p-[64px]"
        style={{
          backgroundColor: '#fdfcf9',
          color: '#1a1a1a',
          width: '850px',
          boxSizing: 'border-box',
          fontFamily: isDevanagari ? "'Noto Serif Devanagari', serif" : "'Playfair Display', 'Crimson Pro', Georgia, serif",
        }}
      >
        <div className="flex flex-col items-center">
          <h1 
            className="text-4xl sm:text-5xl mb-6 text-center leading-tight font-serif text-[#1a1a1a]"
            style={{
              fontFamily: isDevanagari ? "'Noto Serif Devanagari', serif" : "'Playfair Display', Georgia, serif",
              color: '#1a1a1a',
            }}
          >
            {title || 'Untitled'}
          </h1>
          <div className="flex flex-col items-center justify-center gap-1.5 text-sm tracking-wide mb-12 font-sans text-[#666666]">
            {writing.metadata.publishedAt && (
              <time>
                {new Date(writing.metadata.publishedAt).toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </time>
            )}
            {writing.metadata.type && (
              <span className="capitalize">{writing.metadata.type}</span>
            )}
          </div>
          
          <div 
            className="w-full text-xl leading-relaxed text-[#1a1a1a]"
            style={{
              fontFamily: isDevanagari ? "'Noto Serif Devanagari', serif" : "'Playfair Display', 'Crimson Pro', Georgia, serif",
              color: '#1a1a1a',
            }}
          >
            <LiteraryRenderer writing={writing} />
          </div>
          
          <div className="mt-16 pt-8 border-t border-[#e5e5e5] w-full text-center font-sans text-sm text-[#777777]">
            <span className="block font-medium mb-1 text-[#1a1a1a]">Yash Kant Tiwary</span>
            <span>tiwaryswriting.com</span>
          </div>
        </div>
      </div>
    </div>
  ) : null;

  return (
    <>
      <div className="relative" ref={menuRef}>
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="inline-flex items-center gap-2 text-sm font-sans text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] transition-colors p-2"
          title="Download"
          aria-label="Download options"
          disabled={isProcessing}
        >
          {isProcessing ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
          <span className="hidden sm:inline font-medium">
            {isProcessing ? (processLabel || 'Saving...') : 'Save'}
          </span>
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
      {mounted && typeof document !== 'undefined' && createPortal(optimizedCaptureContainer, document.body)}
    </>
  );
}
