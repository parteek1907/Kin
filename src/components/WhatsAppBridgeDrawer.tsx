'use client';

import React, { useState } from 'react';
import { useNetwork } from '@/context/NetworkContext';
import { 
  Smartphone, 
  X, 
  Send, 
  Mic, 
  CheckCheck, 
  ShieldCheck, 
  Radio, 
  Sparkles, 
  Check, 
  Volume2, 
  Play, 
  UserCheck, 
  Users, 
  PhoneCall, 
  MoreVertical,
  Paperclip,
  Smile,
  Flame
} from 'lucide-react';

export default function WhatsAppBridgeDrawer() {
  const {
    isWhatsAppOpen,
    toggleWhatsApp,
    whatsAppTab,
    whatsAppMessages,
    confirmVouch,
    declineVouch,
    vouchStatus,
    sendWhatsAppVoiceNote,
    sendWhatsAppTextMessage,
    requestWarmVouch
  } = useNetwork();

  const [activeTab, setActiveTab] = useState<'intent-drop' | 'vouch-handshake'>(whatsAppTab || 'vouch-handshake');
  const [inputText, setInputText] = useState('');
  const [isPlayingVoice, setIsPlayingVoice] = useState(false);
  const [isRecording, setIsRecording] = useState(false);

  // Sync with context tab if passed
  React.useEffect(() => {
    if (whatsAppTab) {
      setActiveTab(whatsAppTab);
    }
  }, [whatsAppTab]);

  if (!isWhatsAppOpen) return null;

  const handleSendText = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    sendWhatsAppTextMessage(inputText);
    setInputText('');
  };

  const triggerVoiceNote = () => {
    setIsRecording(true);
    setTimeout(() => {
      setIsRecording(false);
      sendWhatsAppVoiceNote('0:09');
    }, 900);
  };

  return (
    <div className="fixed inset-y-0 right-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
      {/* Smartphone Chassis Container */}
      <div className="relative w-full max-w-[390px] h-[92vh] max-h-[820px] bg-[#111B21] rounded-[48px] border-[10px] border-[#222E35] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9)] flex flex-col overflow-hidden text-slate-100 ring-1 ring-white/10">
        
        {/* Dynamic Island / Speaker Notch */}
        <div className="absolute top-2 left-1/2 -translate-x-1/2 w-28 h-5 bg-black rounded-full z-50 flex items-center justify-center space-x-2">
          <div className="w-2.5 h-2.5 rounded-full bg-[#111] ring-1 ring-white/10"></div>
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
        </div>

        {/* WhatsApp Mobile Top Bar */}
        <div className="pt-8 pb-2.5 px-4 bg-[#202C33] border-b border-[#2A3942] flex items-center justify-between z-40">
          <div className="flex items-center space-x-2.5">
            <div className="relative w-10 h-10 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-500 p-0.5">
              <div className="w-full h-full rounded-full bg-[#111B21] flex items-center justify-center">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
              </div>
              <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-400 border-2 border-[#202C33]"></span>
            </div>
            <div>
              <div className="flex items-center space-x-1">
                <span className="font-bold text-xs text-white">
                  {vouchStatus === 'vouched' ? 'Conduit Intro (3)' : 'Conduit AI Bridge'}
                </span>
                <span className="text-[10px] text-emerald-400 font-extrabold">✓</span>
              </div>
              <p className="text-[10px] text-emerald-300 font-mono">
                {vouchStatus === 'vouched' ? 'Rohan + Dr. Sharma + Parteek' : 'IIT/IIIT Campus Verified'}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => toggleWhatsApp(false)}
              className="p-1.5 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Switcher Tabs inside WhatsApp */}
        <div className="grid grid-cols-2 bg-[#1A252D] border-b border-[#2A3942] text-[11px] font-mono text-center">
          <button
            onClick={() => setActiveTab('intent-drop')}
            className={`py-2 px-3 border-b-2 font-bold transition-all ${
              activeTab === 'intent-drop'
                ? 'border-emerald-400 text-emerald-400 bg-white/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Tab 1: Voice Intent Drop
          </button>
          <button
            onClick={() => setActiveTab('vouch-handshake')}
            className={`py-2 px-3 border-b-2 font-bold transition-all ${
              activeTab === 'vouch-handshake'
                ? 'border-emerald-400 text-emerald-400 bg-white/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Tab 2: Warm Vouch Handshake
          </button>
        </div>

        {/* WhatsApp Chat Conversation Bubble Stream */}
        <div
          className="flex-1 overflow-y-auto p-3 space-y-3"
          style={{
            backgroundImage: `radial-gradient(rgba(255,255,255,0.03) 1px, transparent 0)`,
            backgroundSize: '20px 20px'
          }}
        >
          {/* Simulation Header Banner */}
          <div className="p-2 rounded-lg bg-[#182229] border border-[#2A3942] text-center text-[10px] font-mono text-slate-400">
            🔒 End-to-end encrypted zero-login campus bridge. Actions directly mutate the web force graph.
          </div>

          {activeTab === 'intent-drop' && (
            <div className="p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-xs text-emerald-300 space-y-2">
              <div className="flex items-center space-x-1.5 font-bold text-[11px]">
                <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                <span>Alumnus / Founder Intent Drop Mode</span>
              </div>
              <p className="text-[11px] text-slate-300 leading-snug">
                Drop natural language voice notes without opening the website. Conduit matches verified GitHub code commits and responds instantly.
              </p>
              
              {/* Voice Note Simulation Trigger Button */}
              <button
                onClick={triggerVoiceNote}
                disabled={isRecording}
                className="w-full py-2 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-[#07090E] font-extrabold text-xs flex items-center justify-center space-x-2 transition-all shadow-glow-green"
              >
                <Mic className="w-3.5 h-3.5 text-[#07090E] animate-bounce" />
                <span>{isRecording ? 'Broadcasting Voice Stream...' : '🎙️ Send Simulated Voice Note (0:09)'}</span>
              </button>
            </div>
          )}

          {/* Render Messages */}
          {whatsAppMessages.map(msg => {
            const isUser = msg.sender === 'user';
            const isBridge = msg.sender === 'bridge';
            const isAI = msg.sender === 'ai';

            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} space-y-1`}
              >
                <div
                  className={`max-w-[88%] p-3 rounded-2xl text-xs shadow-md space-y-2 ${
                    isUser
                      ? 'bg-[#005C4B] text-white rounded-tr-none'
                      : isBridge
                      ? 'bg-[#202C33] text-amber-200 border border-amber-500/40 rounded-tl-none'
                      : 'bg-[#202C33] text-slate-200 rounded-tl-none border border-white/5'
                  }`}
                >
                  <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 pb-1 border-b border-white/10">
                    <span className="font-bold text-emerald-300">{msg.senderName}</span>
                    <span>{msg.timestamp}</span>
                  </div>

                  {/* Voice waveform simulation if voice message */}
                  {msg.isVoice ? (
                    <div className="flex items-center space-x-2 py-1">
                      <div className="w-7 h-7 rounded-full bg-emerald-700 flex items-center justify-center text-white">
                        <Play className="w-3.5 h-3.5 fill-white" />
                      </div>
                      <div className="flex-1 flex items-center space-x-1">
                        <div className="h-3 w-1 bg-emerald-400 rounded-full animate-pulse"></div>
                        <div className="h-5 w-1 bg-emerald-300 rounded-full animate-pulse"></div>
                        <div className="h-2 w-1 bg-emerald-400 rounded-full"></div>
                        <div className="h-6 w-1 bg-emerald-200 rounded-full animate-pulse"></div>
                        <div className="h-4 w-1 bg-emerald-400 rounded-full"></div>
                        <div className="h-5 w-1 bg-emerald-300 rounded-full"></div>
                        <div className="h-2 w-1 bg-emerald-400 rounded-full"></div>
                        <div className="h-4 w-1 bg-emerald-300 rounded-full"></div>
                      </div>
                      <span className="text-[10px] font-mono text-emerald-300">{msg.audioDuration}</span>
                    </div>
                  ) : (
                    <p className="text-[12px] leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                  )}

                  {/* Match cards inside WhatsApp */}
                  {msg.cards && msg.cards.length > 0 && (
                    <div className="space-y-1.5 pt-1">
                      {msg.cards.map((card, i) => (
                        <div
                          key={i}
                          className="p-2 rounded-lg bg-[#111B21] border border-emerald-500/30 text-[11px] space-y-1"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-white">{card.name}</span>
                            <span className="text-[10px] font-mono font-bold text-emerald-400">
                              {card.score}% FIT
                            </span>
                          </div>
                          <div className="text-[10px] font-mono text-slate-400">{card.role}</div>
                          <div className="text-[10px] font-mono text-cyan-300 bg-black/40 p-1 rounded truncate">
                            Repo: {card.topRepo}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Interactive Quick-Reply Buttons */}
                  {msg.interactiveButtons && (
                    <div className="pt-2 space-y-1.5">
                      {msg.interactiveButtons.map(btn => (
                        <button
                          key={btn.id}
                          onClick={() => {
                            if (btn.action === 'vouch') {
                              confirmVouch();
                            } else if (btn.action === 'decline') {
                              declineVouch();
                            } else if (btn.action === 'request-warm-parteek') {
                              requestWarmVouch('node-parteek');
                            }
                          }}
                          className={`w-full py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center space-x-1.5 ${
                            btn.variant === 'primary'
                              ? 'bg-emerald-500 hover:bg-emerald-400 text-[#07090E] shadow-glow-green'
                              : 'bg-rose-950/80 hover:bg-rose-900 border border-rose-500/40 text-rose-300'
                          }`}
                        >
                          <span>{btn.label}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* WhatsApp Mobile Input Bar */}
        <div className="p-2.5 bg-[#202C33] border-t border-[#2A3942] flex items-center space-x-2">
          <button className="text-slate-400 hover:text-white p-1">
            <Smile className="w-5 h-5" />
          </button>
          <form onSubmit={handleSendText} className="flex-1 flex items-center">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Message Conduit Bridge..."
              className="w-full px-3 py-2 rounded-full bg-[#2A3942] text-xs text-white placeholder-slate-400 focus:outline-none"
            />
          </form>
          {inputText.trim() ? (
            <button
              onClick={handleSendText}
              className="w-9 h-9 rounded-full bg-emerald-500 flex items-center justify-center text-[#07090E] font-bold"
            >
              <Send className="w-4 h-4 fill-current" />
            </button>
          ) : (
            <button
              onClick={triggerVoiceNote}
              className="w-9 h-9 rounded-full bg-emerald-600 hover:bg-emerald-500 flex items-center justify-center text-[#07090E]"
              title="Record Voice Note"
            >
              <Mic className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
