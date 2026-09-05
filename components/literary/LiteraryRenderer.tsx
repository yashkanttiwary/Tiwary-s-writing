import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Writing } from '@/lib/content';

// Replacing naive regex parser with robust react-markdown for AST-based rendering
// while preserving inline nature
const parseInline = (text: string) => {
  return (
    <ReactMarkdown 
      components={{
        p: ({node, ...props}) => <span {...props} />,
        a: ({node, ...props}) => <a className="underline hover:text-black" target="_blank" rel="noopener noreferrer" {...props} />
      }}
    >
      {text}
    </ReactMarkdown>
  );
};

const PoetryRenderer = ({ content, presentation }: { content: string, presentation?: Writing['metadata']['presentation'] }) => {
  const stanzas = content.split(/\n{2,}/).map(s => s.trim()).filter(Boolean);
  
  const alignment = presentation?.alignment || 'left';
  const alignClass = alignment === 'center' ? 'text-center' : alignment === 'right' ? 'text-right' : 'text-left';
  
  const gapClass = presentation?.stanzaSpacing === 'generous' ? 'gap-12' 
    : presentation?.stanzaSpacing === 'large' ? 'gap-10' 
    : presentation?.stanzaSpacing === 'small' ? 'gap-4' 
    : 'gap-8';
    
  return (
    <div className={`flex flex-col ${gapClass} ${alignClass} font-serif max-w-[var(--spacing-reading-poetry)] mx-auto w-full text-lg leading-relaxed`}>
      {stanzas.map((stanza, sIdx) => {
        const lines = stanza.split('\n');
        return (
          <div key={sIdx} className="poetry-stanza">
            {lines.map((line, lIdx) => {
              // Preserve leading spaces for intentional indentation
              const leadingSpacesMatch = line.match(/^(\s+)/);
              const indentLevel = leadingSpacesMatch ? leadingSpacesMatch[1].length : 0;
              const text = line.trim();
              
              if (!text) return <div key={lIdx} className="h-6" aria-hidden="true" />; // intentional blank line in stanza

              return (
                <div 
                  key={lIdx} 
                  className="poetry-line break-words pl-[--indent] -indent-[--indent]" 
                  style={{ '--indent': `${indentLevel * 0.5}rem` } as React.CSSProperties}
                >
                  {parseInline(text)}
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
};

const ProseRenderer = ({ content, presentation }: { content: string, presentation?: Writing['metadata']['presentation'] }) => {
  const measureClass = presentation?.measure === 'book' ? 'max-w-[var(--spacing-reading-prose)]' 
    : presentation?.measure === 'wide' ? 'max-w-[var(--spacing-reading-wide)]' 
    : 'max-w-[var(--spacing-reading-prose)]';
    
  const dropCapClass = presentation?.dropCap 
    ? '[&>p:first-of-type]:first-letter:text-5xl [&>p:first-of-type]:first-letter:font-bold [&>p:first-of-type]:first-letter:float-left [&>p:first-of-type]:first-letter:mr-3 [&>p:first-of-type]:first-letter:mt-1' 
    : '';

  return (
    <div className={`flex flex-col gap-6 font-serif ${measureClass} mx-auto text-lg leading-relaxed w-full ${dropCapClass}`}>
      <ReactMarkdown
        components={{
          p: ({node, ...props}) => {
            if (props.children === '• • •') {
              return <div className="text-center text-var(--color-ink-faint) my-8 tracking-widest">{props.children}</div>;
            }
            return <p className="prose-paragraph" {...props} />;
          },
          a: ({node, ...props}) => <a className="underline hover:text-black" target="_blank" rel="noopener noreferrer" {...props} />,
          h1: ({node, ...props}) => <h1 className="text-3xl font-bold mt-8 mb-4" {...props} />,
          h2: ({node, ...props}) => <h2 className="text-2xl font-bold mt-8 mb-4" {...props} />,
          h3: ({node, ...props}) => <h3 className="text-xl font-bold mt-6 mb-3" {...props} />,
          ul: ({node, ...props}) => <ul className="list-disc pl-8 mb-4" {...props} />,
          ol: ({node, ...props}) => <ol className="list-decimal pl-8 mb-4" {...props} />,
          li: ({node, ...props}) => <li className="mb-2" {...props} />,
          blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-gray-300 pl-4 italic my-6 text-gray-700" {...props} />,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

const FragmentRenderer = ({ content }: { content: string }) => {
  return (
    <div className="font-serif max-w-[var(--spacing-reading-poetry)] mx-auto text-center text-xl italic text-[var(--color-ink-muted)] px-4 py-20 w-full">
      {parseInline(content.trim())}
    </div>
  );
};

export const LiteraryRenderer = ({ writing }: { writing: Writing }) => {
  const { type, presentation, language } = writing.metadata;
  const content = writing.content;
  
  const isDevanagari = language === 'hi' || language === 'mr' || language === 'ne';
  const langClass = isDevanagari ? 'font-devanagari' : '';

  let Renderer = ProseRenderer;
  if (type === 'poetry') Renderer = PoetryRenderer;
  if (type === 'fragment') Renderer = FragmentRenderer;
  // Other types can fallback to Prose or map to specific ones

  return (
    <div className={`literary-content ${langClass}`}>
      <Renderer content={content} presentation={presentation} />
    </div>
  );
};
