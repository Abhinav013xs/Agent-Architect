import React from 'react';
import { ChatSession } from '../../types';
import { PlusIcon, ClockIcon, TrashIcon, CubeTransparentIcon } from '@heroicons/react/24/outline';

interface SidebarProps {
  sessions: ChatSession[];
  currentSessionId: string | null;
  onSelectSession: (id: string) => void;
  onNewSession: () => void;
  onDeleteSession: (id: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  sessions,
  currentSessionId,
  onSelectSession,
  onNewSession,
  onDeleteSession
}) => {
  return (
    <aside className="w-72 glass-panel rounded-3xl flex flex-col h-full text-slate-300 overflow-hidden ml-4 my-4 transition-all duration-300">
      <div className="p-6 border-b border-white/5 flex items-center gap-3">
        <div className="bg-gradient-to-br from-cyan-500 to-purple-600 p-2 rounded-lg shadow-lg shadow-cyan-500/20">
            <CubeTransparentIcon className="w-6 h-6 text-white" />
        </div>
        <div>
            <h1 className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400 tracking-wide font-mono">
            AGENT_ARC
            </h1>
            <p className="text-[10px] text-slate-400 uppercase tracking-widest">v2.0 Glass</p>
        </div>
      </div>
      
      <div className="p-6 pb-2">
        <button
          onClick={onNewSession}
          className="w-full flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-cyan-300 py-3 px-4 rounded-xl transition-all duration-300 btn-glow font-medium text-sm group"
        >
          <PlusIcon className="w-4 h-4 group-hover:rotate-90 transition-transform" />
          <span>New Analysis</span>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-2 custom-scrollbar">
        <h3 className="px-2 text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 mt-2">Projects</h3>
        <div className="space-y-2">
          {sessions.map((session) => (
            <div
              key={session.id}
              className={`group flex items-center justify-between p-3 rounded-xl cursor-pointer text-sm transition-all duration-200 border ${
                session.id === currentSessionId
                  ? 'bg-white/10 text-cyan-300 border-cyan-500/30 shadow-[0_0_15px_rgba(6,182,212,0.1)]'
                  : 'bg-transparent text-slate-400 border-transparent hover:bg-white/5 hover:text-slate-200'
              }`}
              onClick={() => onSelectSession(session.id)}
            >
              <div className="flex items-center gap-3 overflow-hidden">
                <ClockIcon className="w-4 h-4 flex-shrink-0 opacity-70" />
                <span className="truncate font-medium">{session.title}</span>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteSession(session.id);
                }}
                className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-red-500/20 hover:text-red-400 rounded-lg transition-all"
              >
                <TrashIcon className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
          
          {sessions.length === 0 && (
            <div className="p-8 text-center border border-dashed border-white/10 rounded-xl">
               <p className="text-xs text-slate-500">No active sessions.</p>
            </div>
          )}
        </div>
      </div>
      
      <div className="p-6 border-t border-white/5">
        <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono">
            <span>GEMINI 3 PRO</span>
            <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                ONLINE
            </span>
        </div>
      </div>
    </aside>
  );
};
