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
  
  const gapClass = presentation?.stanzaSpacing === 'generous' 
    ? 'gap-12 md:gap-16 xl:gap-20' 
    : presentation?.stanzaSpacing === 'large' 
    ? 'gap-10 md:gap-14 xl:gap-16' 
    : presentation?.stanzaSpacing === 'small' 
    ? 'gap-4 md:gap-6 xl:gap-8' 
    : 'gap-8 md:gap-10 xl:gap-14';
    
  return (
    <div className={`flex flex-col ${gapClass} ${alignClass} font-serif 
      max-w-xl md:max-w-2xl lg:max-w-3xl xl:max-w-4xl 2xl:max-w-5xl mx-auto w-full 
      text-lg sm:text-xl md:text-2xl lg:text-[1.65rem] xl:text-[1.85rem] 2xl:text-3xl 
      leading-relaxed md:leading-[1.9] xl:leading-[2.1] tracking-normal`}
    >
      {stanzas.map((stanza, sIdx) => {
        const lines = stanza.split('\n');
        return (
          <div key={sIdx} className="poetry-stanza">
            {lines.map((line, lIdx) => {
              // Preserve leading spaces for intentional indentation
              const leadingSpacesMatch = line.match(/^(\s+)/);
              const indentLevel = leadingSpacesMatch ? leadingSpacesMatch[1].length : 0;
              const text = line.trim();
              
              if (!text) return <div key={lIdx} className="h-6 md:h-8" aria-hidden="true" />; // intentional blank line in stanza

              return (
                <div 
                  key={lIdx} 
                  className="poetry-line break-words pl-[--indent] -indent-[--indent]" 
                  style={{ '--indent': `${indentLevel * 0.65}rem` } as React.CSSProperties}
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
  const measureClass = presentation?.measure === 'wide' 
    ? 'max-w-3xl lg:max-w-4xl xl:max-w-5xl 2xl:max-w-6xl' 
    : 'max-w-2xl lg:max-w-3xl xl:max-w-4xl 2xl:max-w-5xl';
    
  const dropCapClass = presentation?.dropCap 
    ? '[&>p:first-of-type]:first-letter:text-5xl lg:[&>p:first-of-type]:first-letter:text-6xl xl:[&>p:first-of-type]:first-letter:text-7xl [&>p:first-of-type]:first-letter:font-bold [&>p:first-of-type]:first-letter:float-left [&>p:first-of-type]:first-letter:mr-3 lg:[&>p:first-of-type]:first-letter:mr-4 [&>p:first-of-type]:first-letter:mt-1' 
    : '';

  return (
    <div className={`flex flex-col gap-6 md:gap-8 xl:gap-10 font-serif ${measureClass} mx-auto 
      text-lg sm:text-xl md:text-2xl xl:text-[1.5rem] 2xl:text-[1.65rem] 
      leading-relaxed md:leading-[1.85] xl:leading-[2] w-full ${dropCapClass}`}
    >
      <ReactMarkdown
        components={{
          p: ({node, ...props}) => {
            if (props.children === '• • •') {
              return <div className="text-center text-[var(--color-ink-faint)] my-8 md:my-12 xl:my-16 tracking-widest text-lg md:text-2xl">{props.children}</div>;
            }
            return <p className="prose-paragraph" {...props} />;
          },
          a: ({node, ...props}) => <a className="underline hover:text-black transition-colors" target="_blank" rel="noopener noreferrer" {...props} />,
          h1: ({node, ...props}) => <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mt-10 mb-6 leading-tight" {...props} />,
          h2: ({node, ...props}) => <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mt-8 mb-5 leading-tight" {...props} />,
          h3: ({node, ...props}) => <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold mt-6 mb-4 leading-tight" {...props} />,
          ul: ({node, ...props}) => <ul className="list-disc pl-8 xl:pl-12 mb-6 space-y-2" {...props} />,
          ol: ({node, ...props}) => <ol className="list-decimal pl-8 xl:pl-12 mb-6 space-y-2" {...props} />,
          li: ({node, ...props}) => <li className="mb-2" {...props} />,
          blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-[var(--color-border)] pl-6 xl:pl-8 italic my-8 text-[var(--color-ink-muted)] text-xl sm:text-2xl xl:text-3xl leading-relaxed" {...props} />,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

const FragmentRenderer = ({ content }: { content: string }) => {
  return (
    <div className="font-serif max-w-xl md:max-w-2xl lg:max-w-3xl xl:max-w-4xl 2xl:max-w-5xl mx-auto text-center 
      text-xl sm:text-2xl md:text-3xl xl:text-4xl 2xl:text-5xl italic text-[var(--color-ink-muted)] 
      px-4 py-16 sm:py-24 lg:py-32 xl:py-48 w-full leading-relaxed xl:leading-loose">
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
