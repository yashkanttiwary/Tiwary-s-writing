'use client';

import { useState, useEffect } from 'react';
import { Share, Check, X, Copy, Facebook, Linkedin, Twitter, Mail } from 'lucide-react';
import { createPortal } from 'react-dom';

const WhatsAppIcon = () => (
  <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>
  </svg>
);

export default function ShareButton({ title, url }: { title: string, url: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.error('Failed to copy to clipboard', err);
    }
  };

  const shareLinks = {
    whatsapp: `https://api.whatsapp.com/send?text=${encodeURIComponent(`Read "${title}" by Yash Kant Tiwary.\n\n${url}`)}`,
    twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(`Read "${title}" by Yash Kant Tiwary.`)}&url=${encodeURIComponent(url)}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
    email: `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(`Read "${title}" by Yash Kant Tiwary:\n\n${url}`)}`,
  };

  const openWindow = (link: string) => {
    window.open(link, '_blank', 'noopener,noreferrer');
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: title,
          text: `Read "${title}" by Yash Kant Tiwary.`,
          url: url,
        });
        setIsOpen(false);
      } catch (err) {
        console.error('Share aborted or failed', err);
      }
    }
  };

  const modalContent = isOpen ? (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-[#1a1a1a]/40 backdrop-blur-[2px] transition-opacity" 
        onClick={() => setIsOpen(false)} 
      />
      
      {/* Modal */}
      <div className="relative bg-[#fdfcf9] rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-[var(--color-border)]">
          <h3 className="font-serif text-xl text-[var(--color-ink)]">Share this piece</h3>
          <button 
            onClick={() => setIsOpen(false)} 
            className="p-2 hover:bg-[var(--color-ink)]/5 rounded-full transition-colors text-[var(--color-ink-muted)] hover:text-[var(--color-ink)]"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-4 sm:p-6 flex flex-col gap-6">
          {/* Social Icons */}
          <div className="flex items-start gap-3 sm:gap-4 overflow-x-auto pb-4 -mx-2 px-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {typeof navigator !== 'undefined' && !!navigator.share && (
              <button onClick={handleNativeShare} className="flex flex-col items-center gap-2 flex-shrink-0 group w-16">
                <div className="w-14 h-14 rounded-full flex items-center justify-center transition-transform group-hover:scale-105 bg-gray-200 text-gray-700">
                  <Share size={24} />
                </div>
                <span className="text-xs font-sans text-[var(--color-ink-muted)]">More</span>
              </button>
            )}
            
            <button onClick={() => openWindow(shareLinks.whatsapp)} className="flex flex-col items-center gap-2 flex-shrink-0 group w-16">
              <div className="w-14 h-14 rounded-full flex items-center justify-center transition-transform group-hover:scale-105 bg-[#25D366] text-white">
                <WhatsAppIcon />
              </div>
              <span className="text-xs font-sans text-[var(--color-ink-muted)]">WhatsApp</span>
            </button>

            <button onClick={() => openWindow(shareLinks.twitter)} className="flex flex-col items-center gap-2 flex-shrink-0 group w-16">
              <div className="w-14 h-14 rounded-full flex items-center justify-center transition-transform group-hover:scale-105 bg-black text-white">
                <Twitter size={24} fill="currentColor" />
              </div>
              <span className="text-xs font-sans text-[var(--color-ink-muted)]">X</span>
            </button>

            <button onClick={() => openWindow(shareLinks.facebook)} className="flex flex-col items-center gap-2 flex-shrink-0 group w-16">
              <div className="w-14 h-14 rounded-full flex items-center justify-center transition-transform group-hover:scale-105 bg-[#1877F2] text-white">
                <Facebook size={24} fill="currentColor" />
              </div>
              <span className="text-xs font-sans text-[var(--color-ink-muted)]">Facebook</span>
            </button>

            <button onClick={() => openWindow(shareLinks.linkedin)} className="flex flex-col items-center gap-2 flex-shrink-0 group w-16">
              <div className="w-14 h-14 rounded-full flex items-center justify-center transition-transform group-hover:scale-105 bg-[#0A66C2] text-white">
                <Linkedin size={24} fill="currentColor" />
              </div>
              <span className="text-xs font-sans text-[var(--color-ink-muted)]">LinkedIn</span>
            </button>

            <button onClick={() => openWindow(shareLinks.email)} className="flex flex-col items-center gap-2 flex-shrink-0 group w-16">
              <div className="w-14 h-14 rounded-full flex items-center justify-center transition-transform group-hover:scale-105 bg-gray-600 text-white">
                <Mail size={24} />
              </div>
              <span className="text-xs font-sans text-[var(--color-ink-muted)]">Email</span>
            </button>
          </div>

          {/* Copy Link Section */}
          <div className="flex items-center gap-2 p-1.5 rounded-xl border border-[var(--color-border)] bg-white shadow-sm">
            <input 
              type="text" 
              readOnly 
              value={url}
              className="flex-1 bg-transparent px-3 text-sm font-sans text-[var(--color-ink-muted)] outline-none min-w-0"
              onClick={(e) => e.currentTarget.select()}
            />
            <button 
              onClick={handleCopy}
              className={`flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-lg text-sm font-medium transition-all min-w-[120px] ${
                copied 
                  ? 'bg-green-50 text-green-700 border-transparent shadow-none' 
                  : 'bg-[var(--color-ink)] text-[var(--color-canvas)] hover:bg-[var(--color-ink)]/90'
              }`}
            >
              {copied ? (
                <>
                  <Check size={16} strokeWidth={2.5} />
                  <span>Copied!</span>
                </>
              ) : (
                <span>Copy link</span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  ) : null;

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-2 text-sm font-sans text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] transition-colors p-2"
        title="Share"
        aria-label="Share this writing"
      >
        <Share size={16} />
        <span className="hidden sm:inline font-medium">Share</span>
      </button>

      {/* Render modal in portal to avoid overflow/z-index issues */}
      {mounted && typeof document !== 'undefined' && createPortal(
        modalContent,
        document.body
      )}
    </>
  );
}
