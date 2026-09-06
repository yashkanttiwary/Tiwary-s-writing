'use client';

import { useState, useRef, useEffect } from 'react';
import { Download, Image as ImageIcon, FileText, Loader2 } from 'lucide-react';
import { createPortal } from 'react-dom';
import type { Writing } from '@/lib/content';
import { LiteraryRenderer } from './LiteraryRenderer';

export default function DownloadButton({ title, writing }: { title: string, writing?: Writing }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
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

  const captureElement = async () => {
    // Look for the optimized capture area instead of the on-screen one
    const element = document.getElementById('optimized-capture-area');
    if (!element) throw new Error('Capture area not found');
    
    // Tiny delay to ensure styles and layouts are settled
    await new Promise(resolve => setTimeout(resolve, 100));

    const { toPng } = await import('html-to-image');

    // Fix for html-to-image blank images (especially on Safari / with web fonts)
    // Run once to cache/prime
    try {
      const scale = 3;
      const primeOptions = {
        cacheBust: true,
        width: element.offsetWidth * scale,
        height: element.offsetHeight * scale,
        style: {
          transform: `scale(${scale})`,
          transformOrigin: 'top left',
          width: `${element.offsetWidth}px`,
          height: `${element.offsetHeight}px`,
        }
      };
      await toPng(element, primeOptions);
      await toPng(element, primeOptions);
    } catch(e) {}
    
    // Multiply the physical size of the element for rendering to bypass Safari <foreignObject> rasterization bugs
    const scale = 3;
    const dataUrl = await toPng(element, {
      backgroundColor: '#fdfcf9', // Matches var(--color-canvas) exactly
      pixelRatio: 1, // Keep pixel ratio 1 because we're scaling the element itself
      width: element.offsetWidth * scale,
      height: element.offsetHeight * scale,
      cacheBust: true,
      skipAutoScale: true,
      style: {
        transform: `scale(${scale})`,
        transformOrigin: 'top left',
        width: `${element.offsetWidth}px`,
        height: `${element.offsetHeight}px`,
      },
    });
    
    return dataUrl;
  };

  const downloadImage = async () => {
    try {
      setIsProcessing(true);
      const dataUrl = await captureElement();
      const link = document.createElement('a');
      link.href = dataUrl;
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

      // Ensure all web fonts (especially Noto Serif Devanagari and Crimson Pro) are fully ready
      if (typeof document !== 'undefined' && document.fonts && document.fonts.ready) {
        await document.fonts.ready;
      }
      
      // Capture the pristine publication layout
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

      // Optional font embedding for invisible selectable text layer
      let fontLoaded = false;
      const isDevanagariPiece = writing?.metadata?.language === 'hi' || writing?.metadata?.language === 'mr' || writing?.metadata?.language === 'ne';
      try {
        if (isDevanagariPiece) {
          const notoRes = await fetch('/fonts/NotoSerifDevanagari.ttf');
          if (notoRes.ok) {
            const notoBuf = await notoRes.arrayBuffer();
            const notoBase64 = arrayBufferToBase64(notoBuf);
            pdf.addFileToVFS('NotoSerifDevanagari.ttf', notoBase64);
            pdf.addFont('NotoSerifDevanagari.ttf', 'NotoSerifDevanagari', 'normal');
            pdf.setFont('NotoSerifDevanagari', 'normal');
            fontLoaded = true;
          }
        } else {
          const playfairRes = await fetch('/fonts/PlayfairDisplay.ttf');
          if (playfairRes.ok) {
            const playfairBuf = await playfairRes.arrayBuffer();
            const playfairBase64 = arrayBufferToBase64(playfairBuf);
            pdf.addFileToVFS('PlayfairDisplay.ttf', playfairBase64);
            pdf.addFont('PlayfairDisplay.ttf', 'PlayfairDisplay', 'normal');
            pdf.setFont('PlayfairDisplay', 'normal');
            fontLoaded = true;
          }
        }
      } catch (err) {
        console.warn('Optional font embed for text layer skipped:', err);
      }

      if (totalRenderedHeight <= printableHeight) {
        // Fits comfortably on a single A4 page
        pdf.setFillColor(253, 252, 249); // #fdfcf9 paper tone
        pdf.rect(0, 0, pdfPageWidth, pdfPageHeight, 'F');

        // Center vertically if there is plenty of room, otherwise start from top margin
        const yOffset = totalRenderedHeight < printableHeight * 0.75 
          ? Math.max(margin, (pdfPageHeight - totalRenderedHeight) / 2)
          : margin;

        pdf.addImage(dataUrl, 'PNG', margin, yOffset, printableWidth, totalRenderedHeight, undefined, 'FAST');

        // Add invisible selectable text layer if font is available
        if (fontLoaded && writing?.content) {
          try {
            pdf.setFontSize(10);
            pdf.text(title || 'Untitled', pdfPageWidth / 2, yOffset + 20, { align: 'center', renderingMode: 'invisible' });
            let textY = yOffset + 60;
            const contentLines = writing.content.split('\n');
            for (const line of contentLines) {
              if (textY > pdfPageHeight - margin) break;
              if (line.trim()) {
                pdf.text(line.trim(), margin + 20, textY, { renderingMode: 'invisible' });
              }
              textY += 16;
            }
          } catch (e) {
            // Text layer is purely additive
          }
        }
      } else {
        // Multi-page document: slice the canvas cleanly across pages
        const sliceCanvas = document.createElement('canvas');
        sliceCanvas.width = imgWidth;
        const ctx = sliceCanvas.getContext('2d');
        if (!ctx) throw new Error('Could not create canvas context');

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
          sliceCanvas.height = currentSliceHeight;

          // Background fill on canvas
          ctx.fillStyle = '#fdfcf9';
          ctx.fillRect(0, 0, sliceCanvas.width, sliceCanvas.height);
          ctx.drawImage(img, 0, sourceY, imgWidth, currentSliceHeight, 0, 0, imgWidth, currentSliceHeight);

          const pageDataUrl = sliceCanvas.toDataURL('image/png');
          const renderedSliceHeight = currentSliceHeight * scale;

          pdf.addImage(pageDataUrl, 'PNG', margin, margin, printableWidth, renderedSliceHeight, undefined, 'FAST');

          // Subtle page number on multi-page pieces
          pdf.setFont('helvetica', 'normal');
          pdf.setFontSize(8);
          pdf.setTextColor(170, 170, 170);
          pdf.text(`${pageIndex} of ${totalPages}`, pdfPageWidth / 2, pdfPageHeight - 16, { align: 'center' });

          sourceY += sourcePageHeight;
          pageIndex++;
        }
      }
      
      pdf.save(`${safeTitle} by Yash Kant Tiwary.pdf`);
    } catch (error) {
      console.error('Failed to generate PDF', error);
    } finally {
      setIsProcessing(false);
      setIsOpen(false);
    }
  };

  const isDevanagari = writing?.metadata?.language === 'hi' || writing?.metadata?.language === 'mr' || writing?.metadata?.language === 'ne';

  const optimizedCaptureContainer = mounted && writing ? (
    <div style={{ position: 'absolute', opacity: 0.0001, top: 0, left: 0, pointerEvents: 'none', zIndex: -100 }}>
    <div 
      id="optimized-capture-area" 
      className={`bg-[#fdfcf9] w-[900px] p-[80px] ${isDevanagari ? 'font-devanagari' : ''}`}
      style={{
        color: '#1a1a1a',
        fontFamily: isDevanagari ? 'var(--font-noto-serif-devanagari), var(--font-serif)' : 'var(--font-serif)',
      }}
    >
      <div className="flex flex-col items-center">
        <h1 className={`text-5xl mb-6 text-center font-serif leading-tight text-[#1a1a1a] ${isDevanagari ? 'font-devanagari' : ''}`}>
          {title || 'Untitled'}
        </h1>
        <div className="flex flex-col items-center justify-center gap-2 text-base tracking-wide mb-14 font-sans text-[#666666]">
          {writing.metadata.publishedAt && <time>{new Date(writing.metadata.publishedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</time>}
          {writing.metadata.type && <span className="capitalize">{writing.metadata.type}</span>}
        </div>
        
        <div className={`w-full text-xl leading-relaxed font-serif text-[#1a1a1a] ${isDevanagari ? 'font-devanagari' : ''}`}>
          <LiteraryRenderer writing={writing} />
        </div>
        
        <div className="mt-20 pt-10 border-t border-[#e5e5e5] w-full text-center font-sans text-base text-[#666666]">
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
      {mounted && typeof document !== 'undefined' && createPortal(optimizedCaptureContainer, document.body)}
    </>
  );
}
