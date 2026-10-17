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
    <div className="fixed inset-y-0 right-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/40 backdrop-blur-md animate-in fade-in duration-200">
      {/* Smartphone Chassis Container (Ceramic Titanium Frame) */}
      <div className="relative w-full max-w-[390px] h-[92vh] max-h-[820px] bg-[#EFEAE2] rounded-[48px] border-[10px] border-[#D8D3CB] shadow-[0_25px_80px_rgba(20,24,21,0.25)] flex flex-col overflow-hidden text-[#111B21] ring-1 ring-black/10">
        
        {/* Dynamic Island / Speaker Notch */}
        <div className="absolute top-2 left-1/2 -translate-x-1/2 w-28 h-5 bg-[#141815] rounded-full z-50 flex items-center justify-center space-x-2">
          <div className="w-2.5 h-2.5 rounded-full bg-[#222]"></div>
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
        </div>

        {/* WhatsApp Mobile Top Bar (Signature Emerald Green) */}
        <div className="pt-8 pb-3 px-4 bg-[#008069] text-white flex items-center justify-between z-40 shadow-sm">
          <div className="flex items-center space-x-2.5">
            <div className="relative w-10 h-10 rounded-full bg-white/20 p-0.5">
              <div className="w-full h-full rounded-full bg-white flex items-center justify-center text-[#008069]">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-400 border-2 border-[#008069]"></span>
            </div>
            <div>
              <div className="flex items-center space-x-1">
                <span className="font-bold text-xs text-white">
                  {vouchStatus === 'vouched' ? 'Nexus Intro Group (3)' : 'Nexus AI Campus Bridge'}
                </span>
                <span className="text-[10px] text-emerald-200 font-extrabold">✓</span>
              </div>
              <p className="text-[10px] text-emerald-100 font-mono">
                {vouchStatus === 'vouched' ? 'Rohan + Dr. Sharma + Parteek' : 'IIITD Campus Verified'}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => toggleWhatsApp(false)}
              className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Switcher Tabs inside WhatsApp */}
        <div className="grid grid-cols-2 bg-[#00705B] text-white text-[11px] font-mono text-center">
          <button
            onClick={() => setActiveTab('intent-drop')}
            className={`py-2 px-3 border-b-2 font-bold transition-all ${
              activeTab === 'intent-drop'
                ? 'border-white text-white bg-white/10'
                : 'border-transparent text-emerald-100 hover:text-white'
            }`}
          >
            Tab 1: Voice Intent Drop
          </button>
          <button
            onClick={() => setActiveTab('vouch-handshake')}
            className={`py-2 px-3 border-b-2 font-bold transition-all ${
              activeTab === 'vouch-handshake'
                ? 'border-white text-white bg-white/10'
                : 'border-transparent text-emerald-100 hover:text-white'
            }`}
          >
            Tab 2: Vouch Handshake
          </button>
        </div>

        {/* WhatsApp Chat Conversation Bubble Stream */}
        <div
          className="flex-1 overflow-y-auto p-3 space-y-3 bg-[#EFEAE2]"
          style={{
            backgroundImage: `radial-gradient(rgba(0,0,0,0.04) 1px, transparent 0)`,
            backgroundSize: '16px 16px'
          }}
        >
          {/* Simulation Header Banner */}
          <div className="p-2 rounded-xl bg-white/80 border border-black/5 text-center text-[10px] font-mono text-zinc-500 shadow-xs">
            🔒 End-to-end encrypted zero-login campus bridge. Actions directly mutate the web force graph.
          </div>

          {activeTab === 'intent-drop' && (
            <div className="p-3 rounded-2xl bg-[#D9FDD3] border border-emerald-300 text-xs text-zinc-800 space-y-2 shadow-xs">
              <div className="flex items-center justify-between text-[11px] font-mono font-bold text-[#008069]">
                <span>1-Tap Voice Test:</span>
                <span className="text-[10px] bg-white/80 px-2 py-0.5 rounded-full">SIMULATION</span>
              </div>
              <p className="text-[11px] text-zinc-700">
                Tap the microphone below to simulate sending a natural language voice note directly to the campus router.
              </p>
              <button
                onClick={triggerVoiceNote}
                disabled={isRecording}
                className="w-full py-2 px-3 rounded-xl bg-[#008069] hover:bg-[#00705B] text-white font-bold text-xs flex items-center justify-center space-x-1.5 shadow-sm transition-all"
              >
                <Mic className="w-3.5 h-3.5" />
                <span>{isRecording ? 'Listening (0:09)...' : 'Simulate: "Find me Rust / ZK founders"'}</span>
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
                  className={`max-w-[88%] p-3 rounded-2xl text-xs shadow-xs space-y-2 ${
                    isUser
                      ? 'bg-[#D9FDD3] text-[#111B21] rounded-tr-none'
                      : isBridge
                      ? 'bg-white text-zinc-800 border border-amber-300 rounded-tl-none'
                      : 'bg-white text-zinc-800 rounded-tl-none border border-black/5'
                  }`}
                >
                  <div className="flex items-center justify-between text-[10px] font-mono text-zinc-400 pb-1 border-b border-black/5">
                    <span className="font-bold text-[#008069]">{msg.senderName}</span>
                    <span>{msg.timestamp}</span>
                  </div>

                  {/* Voice waveform simulation if voice message */}
                  {msg.isVoice ? (
                    <div className="flex items-center space-x-2 py-1">
                      <div className="w-7 h-7 rounded-full bg-[#008069] flex items-center justify-center text-white">
                        <Play className="w-3.5 h-3.5 fill-white" />
                      </div>
                      <div className="flex-1 flex items-center space-x-1">
                        <div className="h-3 w-1 bg-[#008069] rounded-full animate-pulse"></div>
                        <div className="h-5 w-1 bg-[#008069] rounded-full animate-pulse"></div>
                        <div className="h-2 w-1 bg-[#008069] rounded-full"></div>
                        <div className="h-6 w-1 bg-[#008069] rounded-full animate-pulse"></div>
                        <div className="h-4 w-1 bg-[#008069] rounded-full"></div>
                        <div className="h-5 w-1 bg-[#008069] rounded-full"></div>
                        <div className="h-2 w-1 bg-[#008069] rounded-full"></div>
                        <div className="h-4 w-1 bg-[#008069] rounded-full"></div>
                      </div>
                      <span className="text-[10px] font-mono text-[#008069] font-bold">{msg.audioDuration}</span>
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
                          className="p-2 rounded-xl bg-[#F7F5F0] border border-black/5 text-[11px] space-y-1"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-[#141815]">{card.name}</span>
                            <span className="text-[10px] font-mono font-bold text-emerald-700">
                              {card.score}% FIT
                            </span>
                          </div>
                          <div className="text-[10px] font-mono text-zinc-500">{card.role}</div>
                          <div className="text-[10px] font-mono text-zinc-700 bg-white p-1 rounded border border-black/5 truncate">
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
                          className={`w-full py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-1.5 ${
                            btn.variant === 'primary'
                              ? 'bg-[#008069] hover:bg-[#00705B] text-white shadow-xs'
                              : 'bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700'
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
        <div className="p-3 bg-[#F0F2F5] border-t border-black/5 flex items-center space-x-2">
          <button className="text-zinc-500 hover:text-zinc-800 p-1">
            <Smile className="w-5 h-5" />
          </button>
          <form onSubmit={handleSendText} className="flex-1 flex items-center">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Message Nexus Bridge..."
              className="w-full px-4 py-2 rounded-full bg-white text-xs text-[#141815] placeholder-zinc-400 focus:outline-none shadow-xs border border-black/5"
            />
          </form>
          {inputText.trim() ? (
            <button
              onClick={handleSendText}
              className="w-9 h-9 rounded-full bg-[#00A884] hover:bg-[#008069] flex items-center justify-center text-white font-bold shadow-xs transition-colors"
            >
              <Send className="w-4 h-4 fill-current" />
            </button>
          ) : (
            <button
              onClick={triggerVoiceNote}
              className="w-9 h-9 rounded-full bg-[#00A884] hover:bg-[#008069] flex items-center justify-center text-white shadow-xs transition-colors"
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
