import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus, dracula } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { MermaidRenderer } from './MermaidRenderer';

interface AIResponseProps {
  content: string;
  isTyping?: boolean;
}

export const AIResponse: React.FC<AIResponseProps> = ({ content, isTyping }) => {
  return (
    <div className="prose prose-invert prose-sm max-w-none text-slate-200 font-sans leading-relaxed">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          code({ node, inline, className, children, ...props }: any) {
            const match = /language-(\w+)/.exec(className || '');
            const language = match ? match[1] : '';
            
            if (!inline && language === 'mermaid') {
              return <MermaidRenderer chart={String(children).replace(/\n$/, '')} />;
            }

            return !inline && match ? (
              <div className="rounded-xl overflow-hidden my-4 border border-white/10 shadow-lg">
                  <div className="bg-black/40 px-4 py-1 text-xs text-slate-400 font-mono border-b border-white/5 flex justify-between">
                      <span>{language}</span>
                      <span>Read-only</span>
                  </div>
                  <SyntaxHighlighter
                    style={dracula}
                    language={language}
                    PreTag="div"
                    customStyle={{ margin: 0, background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(2px)' }}
                    {...props}
                  >
                    {String(children).replace(/\n$/, '')}
                  </SyntaxHighlighter>
              </div>
            ) : (
              <code className="bg-white/10 text-cyan-200 px-1.5 py-0.5 rounded-md font-mono text-sm border border-white/5" {...props}>
                {children}
              </code>
            );
          },
          h2: ({node, ...props}) => <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-purple-300 mt-8 mb-4 border-b border-white/10 pb-2 drop-shadow-sm" {...props} />,
          h3: ({node, ...props}) => <h3 className="text-lg font-semibold text-cyan-100 mt-6 mb-3 flex items-center gap-2" {...props} />,
          ul: ({node, ...props}) => <ul className="list-disc pl-6 space-y-2 text-slate-300 marker:text-cyan-500" {...props} />,
          p: ({node, ...props}) => <p className="mb-4 text-slate-300" {...props} />,
          blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-cyan-500/50 pl-4 italic text-slate-400 bg-white/5 py-3 rounded-r-lg my-4" {...props} />,
        }}
      >
        {content}
      </ReactMarkdown>
      
      {isTyping && (
        <div className="flex flex-col items-center justify-center p-8 space-y-4 animate-fadeIn">
          <div className="relative">
             <div className="absolute inset-0 bg-cyan-500 blur-xl opacity-20 rounded-full animate-pulse-slow"></div>
             <div className="relative flex items-center space-x-3 bg-black/20 backdrop-blur-md px-6 py-3 rounded-full border border-cyan-500/30 shadow-[0_0_15px_rgba(6,182,212,0.2)]">
                <div className="w-2.5 h-2.5 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}/>
                <div className="w-2.5 h-2.5 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}/>
                <div className="w-2.5 h-2.5 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}/>
                <span className="text-cyan-300 text-xs font-mono tracking-widest ml-2 uppercase">Architecting</span>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};
