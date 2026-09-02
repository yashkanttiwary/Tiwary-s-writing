"use client";

import { useState } from 'react';
import { LiteraryRenderer } from '@/components/literary/LiteraryRenderer';
import { Writing } from '@/lib/content';
import { ArrowLeft, Edit3, Eye, Layout } from 'lucide-react';
import Link from 'next/link';

export default function AdminEditor() {
  const [content, setContent] = useState('I waited for you\n\nnot because\nyou were coming\n\nbut because\nwaiting had become\nanother name for evening.');
  const [title, setTitle] = useState('Something About Silence');
  const [type, setType] = useState<Writing['metadata']['type']>('poetry');
  const [language, setLanguage] = useState('en');
  const [mode, setMode] = useState<'split' | 'edit' | 'preview'>('split');
  
  // Create a mock writing object for the preview
  const mockWriting: Writing = {
    metadata: {
      id: 'draft-1',
      title,
      slug: 'draft',
      publishedAt: new Date().toISOString(),
      type,
      language,
      tags: [],
      themes: [],
      collections: [],
      featured: false,
      draft: true,
      presentation: {
        profile: type === 'poetry' ? 'poetry' : 'prose',
        alignment: 'left',
        measure: type === 'poetry' ? 'narrow' : 'book',
      }
    },
    content,
    year: new Date().getFullYear().toString(),
    month: (new Date().getMonth() + 1).toString().padStart(2, '0')
  };

  return (
    <div className="min-h-screen flex flex-col bg-[var(--color-canvas)] text-[var(--color-ink)]">
      <header className="border-b border-[var(--color-border)] p-4 flex items-center justify-between bg-white z-10 sticky top-0">
        <div className="flex items-center gap-6">
          <Link href="/" className="text-[var(--color-ink-muted)] hover:text-[var(--color-ink)]">
            <ArrowLeft size={18} />
          </Link>
          <div className="font-sans text-sm font-medium tracking-wide">Write</div>
        </div>
        
        <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-lg">
           <button onClick={() => setMode('edit')} className={`p-2 rounded ${mode === 'edit' ? 'bg-white shadow-sm' : 'text-gray-500 hover:text-black'}`} title="Edit Mode">
             <Edit3 size={16} />
           </button>
           <button onClick={() => setMode('split')} className={`p-2 rounded ${mode === 'split' ? 'bg-white shadow-sm' : 'text-gray-500 hover:text-black'}`} title="Split Mode">
             <Layout size={16} />
           </button>
           <button onClick={() => setMode('preview')} className={`p-2 rounded ${mode === 'preview' ? 'bg-white shadow-sm' : 'text-gray-500 hover:text-black'}`} title="Preview Mode">
             <Eye size={16} />
           </button>
        </div>
        
        <div className="flex items-center gap-4">
           <button className="text-sm font-sans text-[var(--color-ink-muted)]">Save Draft</button>
           <button className="text-sm font-sans bg-[var(--color-ink)] text-white px-4 py-2 rounded-full hover:bg-black transition-colors" onClick={() => alert('Publishing will commit to GitHub in production.')}>Publish</button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        
        {/* Editor Sidebar / Settings */}
        <div className={`w-64 border-r border-[var(--color-border)] p-6 flex-col gap-6 overflow-y-auto hidden sm:flex bg-gray-50/50`}>
           <div>
             <label className="block text-xs font-sans uppercase tracking-widest text-gray-500 mb-2">Title</label>
             <input type="text" value={title} onChange={e => setTitle(e.target.value)} className="w-full border border-gray-200 rounded p-2 text-sm font-serif focus:outline-none focus:border-gray-400" />
           </div>
           
           <div>
             <label className="block text-xs font-sans uppercase tracking-widest text-gray-500 mb-2">Type</label>
             <select value={type} onChange={e => setType(e.target.value as any)} className="w-full border border-gray-200 rounded p-2 text-sm font-sans focus:outline-none focus:border-gray-400">
               <option value="poetry">Poetry</option>
               <option value="prose">Prose</option>
               <option value="story">Story</option>
               <option value="essay">Essay</option>
               <option value="letter">Letter</option>
               <option value="fragment">Fragment</option>
             </select>
           </div>
           
           <div>
             <label className="block text-xs font-sans uppercase tracking-widest text-gray-500 mb-2">Language</label>
             <select value={language} onChange={e => setLanguage(e.target.value)} className="w-full border border-gray-200 rounded p-2 text-sm font-sans focus:outline-none focus:border-gray-400">
               <option value="en">English</option>
               <option value="hi">Hindi (Devanagari)</option>
               <option value="hi-en">Hinglish</option>
             </select>
           </div>
        </div>
        
        {/* Editor Area */}
        {(mode === 'edit' || mode === 'split') && (
          <div className={`flex-1 border-r border-[var(--color-border)] p-6 bg-white overflow-y-auto`}>
            <textarea
              value={content}
              onChange={e => setContent(e.target.value)}
              className={`w-full h-full resize-none focus:outline-none font-serif text-lg leading-relaxed ${language === 'hi' ? 'font-devanagari' : ''}`}
              placeholder="Write here..."
              spellCheck="false"
            />
          </div>
        )}

        {/* Preview Area */}
        {(mode === 'preview' || mode === 'split') && (
          <div className="flex-1 overflow-y-auto bg-[var(--color-canvas)] p-12">
            <div className="max-w-[var(--spacing-reading-prose)] mx-auto w-full text-center mb-16">
              <h1 className={`text-4xl font-serif text-[var(--color-ink)] leading-tight ${language === 'hi' ? 'font-devanagari' : ''}`}>
                {title || 'Untitled'}
              </h1>
            </div>
            <LiteraryRenderer writing={mockWriting} />
          </div>
        )}
      </div>
    </div>
  );
}
