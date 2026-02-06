import React, { useState } from 'react';
import { Sidebar } from './components/Layout/Sidebar';
import { AIResponse } from './components/Output/AIResponse';
import { analyzeCodeWithGemini } from './services/geminiService';
import { ChatSession, Message, ViewMode } from './types';
import { CodeBracketIcon, PhotoIcon, PaperAirplaneIcon, CpuChipIcon, SparklesIcon } from '@heroicons/react/24/outline';

const App: React.FC = () => {
  // --- State ---
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  
  // Input State
  const [inputCode, setInputCode] = useState('');
  const [inputPrompt, setInputPrompt] = useState('');
  const [inputImage, setInputImage] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>(ViewMode.CODE);
  
  // Processing State
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // --- Helpers ---
  const getCurrentSession = () => sessions.find(s => s.id === currentSessionId);
  
  const createNewSession = () => {
    const newSession: ChatSession = {
      id: Date.now().toString(),
      title: `Analysis #${sessions.length + 1}`,
      timestamp: Date.now(),
      messages: []
    };
    setSessions(prev => [newSession, ...prev]);
    setCurrentSessionId(newSession.id);
    setInputCode('');
    setInputPrompt('');
    setInputImage(null);
  };

  const deleteSession = (id: string) => {
    setSessions(prev => prev.filter(s => s.id !== id));
    if (currentSessionId === id) {
      setCurrentSessionId(null);
      setInputCode('');
      setInputPrompt('');
      setInputImage(null);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setInputImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyze = async () => {
    if ((!inputCode && !inputImage && !inputPrompt) || isAnalyzing) return;

    if (!currentSessionId) {
      createNewSession();
    }
    
    let activeId = currentSessionId;
    let newSessionsList = [...sessions];
    
    if (!activeId) {
      const newSession: ChatSession = {
        id: Date.now().toString(),
        title: `Analysis - ${new Date().toLocaleTimeString()}`,
        timestamp: Date.now(),
        messages: []
      };
      newSessionsList = [newSession, ...newSessionsList];
      activeId = newSession.id;
      setSessions(newSessionsList);
      setCurrentSessionId(activeId);
    }

    setIsAnalyzing(true);

    const userMsg: Message = {
      role: 'user',
      content: inputPrompt || (inputCode ? "Analyze this code." : "Analyze this image."),
      images: inputImage ? [inputImage] : undefined
    };

    setSessions(prev => prev.map(s => {
      if (s.id === activeId) {
        return { ...s, messages: [...s.messages, userMsg] };
      }
      return s;
    }));

    try {
      const analysisResult = await analyzeCodeWithGemini(inputPrompt, inputCode, inputImage || undefined);
      
      const aiMsg: Message = {
        role: 'model',
        content: analysisResult
      };

      setSessions(prev => prev.map(s => {
        if (s.id === activeId) {
          const updatedTitle = s.messages.length === 0 ? (inputPrompt.slice(0, 30) || "Code Analysis") : s.title;
          return { ...s, title: updatedTitle, messages: [...s.messages, userMsg, aiMsg] };
        }
        return s;
      }));

    } catch (error) {
       const errorMsg: Message = {
        role: 'model',
        content: "I encountered an error analyzing your request. Please check your API key and try again."
      };
      setSessions(prev => prev.map(s => {
        if (s.id === activeId) {
          return { ...s, messages: [...s.messages, userMsg, errorMsg] };
        }
        return s;
      }));
    } finally {
      setIsAnalyzing(false);
    }
  };

  const currentSession = getCurrentSession();

  return (
    <div className="flex h-screen w-full font-sans text-slate-200">
      <Sidebar 
        sessions={sessions}
        currentSessionId={currentSessionId}
        onSelectSession={setCurrentSessionId}
        onNewSession={createNewSession}
        onDeleteSession={deleteSession}
      />
      
      <main className="flex-1 flex flex-col min-w-0 p-4 gap-4 h-full">
        {/* Main Split View Area */}
        <div className="flex-1 flex gap-4 h-full overflow-hidden">
          
          {/* Left Panel: Input */}
          <div className="w-1/2 flex flex-col glass-panel rounded-3xl overflow-hidden transition-all duration-300">
            {/* Tab Header */}
            <div className="flex border-b border-white/5 bg-white/5">
              <button
                onClick={() => setViewMode(ViewMode.CODE)}
                className={`flex-1 py-4 text-sm font-semibold flex items-center justify-center gap-2 transition-all duration-200 ${
                    viewMode === ViewMode.CODE 
                    ? 'text-cyan-300 bg-white/5 shadow-inner' 
                    : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'
                }`}
              >
                <CodeBracketIcon className="w-4 h-4" /> Source
              </button>
              <button
                onClick={() => setViewMode(ViewMode.IMAGE)}
                className={`flex-1 py-4 text-sm font-semibold flex items-center justify-center gap-2 transition-all duration-200 ${
                    viewMode === ViewMode.IMAGE 
                    ? 'text-cyan-300 bg-white/5 shadow-inner' 
                    : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'
                }`}
              >
                <PhotoIcon className="w-4 h-4" /> Visuals
              </button>
            </div>

            {/* Content Area */}
            <div className="flex-1 p-0 relative group">
              {viewMode === ViewMode.CODE ? (
                <div className="w-full h-full relative">
                   {/* Editor Decoration */}
                   <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-500 to-purple-500 opacity-50"></div>
                   <textarea
                    className="w-full h-full glass-input text-slate-300 p-6 focus:outline-none font-mono text-sm resize-none custom-scrollbar"
                    placeholder="// Paste problematic code or architecture specs here..."
                    spellCheck={false}
                    value={inputCode}
                    onChange={(e) => setInputCode(e.target.value)}
                  />
                </div>
              ) : (
                <div className="h-full w-full p-6">
                    <div className="h-full flex flex-col items-center justify-center border-2 border-dashed border-white/10 rounded-2xl bg-black/20 hover:bg-black/30 transition-colors relative overflow-hidden">
                    <input 
                        type="file" 
                        id="file-upload" 
                        className="hidden" 
                        accept="image/*"
                        onChange={handleImageUpload}
                    />
                    {inputImage ? (
                        <div className="relative w-full h-full flex items-center justify-center p-4">
                        <img src={inputImage} alt="Preview" className="max-h-full max-w-full object-contain rounded-lg shadow-2xl" />
                        <button 
                            onClick={() => setInputImage(null)}
                            className="absolute top-4 right-4 bg-black/60 text-white p-2 rounded-full hover:bg-red-500/80 backdrop-blur-sm transition-colors"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                        </button>
                        </div>
                    ) : (
                        <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center group/upload">
                        <div className="p-4 rounded-full bg-white/5 group-hover/upload:bg-cyan-500/20 transition-colors mb-4">
                            <PhotoIcon className="w-10 h-10 text-slate-500 group-hover/upload:text-cyan-400" />
                        </div>
                        <span className="text-slate-400 font-medium group-hover/upload:text-cyan-200 transition-colors">Upload Architecture Diagram</span>
                        <span className="text-slate-600 text-xs mt-2">PNG, JPG supported</span>
                        </label>
                    )}
                    </div>
                </div>
              )}
            </div>

            {/* Action Bar */}
            <div className="p-5 border-t border-white/5 bg-black/20 backdrop-blur-sm">
              <div className="flex gap-3">
                <div className="flex-1 relative">
                    <input
                    type="text"
                    className="w-full bg-white/5 text-slate-200 rounded-xl border border-white/10 px-4 py-3 text-sm focus:outline-none focus:border-cyan-500/50 focus:bg-white/10 transition-all placeholder:text-slate-600"
                    placeholder="Specific instructions (e.g., 'Check for race conditions')"
                    value={inputPrompt}
                    onChange={(e) => setInputPrompt(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAnalyze()}
                    />
                </div>
                <button
                  onClick={handleAnalyze}
                  disabled={isAnalyzing}
                  className={`px-6 py-3 rounded-xl font-bold text-sm flex items-center gap-2 transition-all shadow-lg ${
                    isAnalyzing 
                      ? 'bg-slate-800/50 text-slate-500 cursor-not-allowed' 
                      : 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white btn-glow transform hover:-translate-y-0.5'
                  }`}
                >
                  {isAnalyzing ? (
                    'Processing...'
                  ) : (
                    <>
                      <SparklesIcon className="w-4 h-4" />
                      Run Architect
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Right Panel: Output */}
          <div className="w-1/2 flex flex-col glass-panel rounded-3xl overflow-hidden relative">
             <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-pink-500 opacity-50"></div>
             
             <div className="px-6 py-4 border-b border-white/5 flex justify-between items-center bg-white/5">
                <span className="text-xs font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-300 to-pink-300 uppercase tracking-widest flex items-center gap-2">
                    <CpuChipIcon className="w-4 h-4 text-purple-400" />
                    Analysis Results
                </span>
                {isAnalyzing && <span className="text-[10px] text-cyan-400 font-mono animate-pulse">● LIVE PROCESSING</span>}
             </div>
             
             <div className="flex-1 p-8 overflow-y-auto custom-scrollbar relative">
                {currentSession && currentSession.messages.length > 0 ? (
                    <div className="space-y-10">
                       {currentSession.messages.map((msg, idx) => (
                         msg.role === 'model' && (
                           <div key={idx} className="animate-fadeIn">
                              <AIResponse content={msg.content} />
                           </div>
                         )
                       ))}
                       {isAnalyzing && <AIResponse content="" isTyping={true} />}
                    </div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-slate-500/50">
                    <div className="w-24 h-24 rounded-full bg-white/5 flex items-center justify-center mb-6 animate-pulse-slow">
                        <SparklesIcon className="w-10 h-10" />
                    </div>
                    <p className="text-xl font-light text-slate-400">Awaiting Input</p>
                    <p className="text-sm mt-2 font-mono text-slate-600">Provide code or schemas to initiate.</p>
                  </div>
                )}
             </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
