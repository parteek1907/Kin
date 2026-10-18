'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, X, RotateCcw, Compass, Sparkles, User, Bot, ArrowRight } from 'lucide-react';
import KinMascot, { MascotPose } from './KinMascot';

interface KinChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

interface KinChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartTour: () => void;
  userProfile?: {
    name?: string;
    role?: string;
    institution?: string;
    skills?: string[];
    targetRole?: string;
    email?: string;
  };
  activeTab?: string;
}

export default function KinChatModal({
  isOpen,
  onClose,
  onStartTour,
  userProfile = {},
  activeTab = 'overview',
}: KinChatModalProps) {
  const [messages, setMessages] = useState<KinChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [mascotPose, setMascotPose] = useState<MascotPose>('welcome');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const userName = userProfile.name || 'Verified Builder';
  const userRole = userProfile.role || 'student';

  // Seed initial welcome message
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          id: 'msg-welcome',
          role: 'assistant',
          content: `Hey **${userName}**! 👋 I'm **Kin**, your AI Career Copilot & campus network guide.\n\nI can help you find matching alumni, analyze your verified skill gaps, prepare for interviews, or give you a complete walkthrough of the platform!`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    }
  }, [userName, messages.length]);

  // Auto scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen, isLoading]);

  const handleSendMessage = async (customText?: string) => {
    const textToSend = (customText || inputValue).trim();
    if (!textToSend || isLoading) return;

    // Check if user asked for a tour directly
    const lower = textToSend.toLowerCase();
    if (lower === 'take a tour' || lower === 'start tour' || lower === 'platform tour') {
      onStartTour();
      onClose();
      return;
    }

    const userMsg: KinChatMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInputValue('');
    setIsLoading(true);
    setMascotPose('time-machine');

    try {
      const response = await fetch('/api/kin-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
          userProfile,
          activeTab,
        }),
      });

      const data = await response.json();
      const assistantText = data?.message || "I'm here to help! Ask me anything about KIN.";

      setMessages((prev) => [
        ...prev,
        {
          id: `msg-${Date.now() + 1}`,
          role: 'assistant',
          content: assistantText,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
      setMascotPose('community');
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: `msg-${Date.now() + 1}`,
          role: 'assistant',
          content: "✨ I'm right here! Feel free to ask me about your CV match, alumni in your domain, or take the platform tour.",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
      setMascotPose('welcome');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: `msg-${Date.now()}`,
        role: 'assistant',
        content: `Chat cleared! What would you like to explore next, **${userName}**? ✨`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  const quickPrompts = [
    { label: '🗺️ Platform Tour', action: () => { onStartTour(); onClose(); } },
    { label: '🔍 Who matches my skills?', action: () => handleSendMessage('Which alumni match my verified skills and can I connect with?') },
    { label: '📈 Check my skill gaps', action: () => handleSendMessage('What are my biggest skill gaps and what should I learn next?') },
    { label: '🎯 How do I pitch to Aditya Sharma?', action: () => handleSendMessage('Give me a high-impact intro message to send to Aditya Sharma on KIN.') },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/30 backdrop-blur-xs">
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 20 }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            className="w-full max-w-lg sm:max-w-xl h-[620px] max-h-[90vh] flex flex-col rounded-3xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-2xl border border-white/60 dark:border-slate-800 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.3)] overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 dark:border-slate-800/80 bg-white/60 dark:bg-slate-900/60 backdrop-blur-md">
              <div className="flex items-center gap-3">
                <div className="relative w-10 h-10 flex items-center justify-center filter drop-shadow-sm">
                  <KinMascot pose={mascotPose} size={40} />
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-900 shadow-xs" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">Kin AI Copilot</h3>
                    <span className="text-[10px] font-semibold tracking-wide uppercase px-1.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/40">
                      Groq Fast LLM
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Always ready • Ask questions or explore Kin
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    onStartTour();
                    onClose();
                  }}
                  className="px-3 py-1.5 rounded-full bg-slate-900 hover:bg-black text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all hover:scale-105 active:scale-95 cursor-pointer"
                  title="Take a visual tour of the platform"
                >
                  <Compass className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Platform Tour</span>
                </button>

                <button
                  onClick={handleClearChat}
                  className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer"
                  title="Clear chat history"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>

                <button
                  onClick={onClose}
                  className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors cursor-pointer"
                  title="Close Kin Copilot"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Chat Body */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
              {messages.map((msg) => {
                const isUser = msg.role === 'user';
                return (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex items-start gap-2.5 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
                  >
                    {!isUser ? (
                      <div className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0 filter drop-shadow-xs overflow-hidden mt-0.5">
                        <KinMascot pose="welcome" size={26} />
                      </div>
                    ) : (
                      <div className="w-7 h-7 rounded-full bg-slate-900 text-white flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5 shadow-xs">
                        {userName.charAt(0).toUpperCase()}
                      </div>
                    )}

                    <div
                      className={`max-w-[85%] rounded-2xl px-4 py-3 text-xs leading-relaxed ${
                        isUser
                          ? 'bg-slate-900 text-white rounded-tr-xs shadow-md'
                          : 'bg-white/95 dark:bg-slate-800/90 text-slate-800 dark:text-slate-100 rounded-tl-xs border border-slate-100 dark:border-slate-700 shadow-sm'
                      }`}
                    >
                      <div className="whitespace-pre-wrap font-sans">
                        {msg.content}
                      </div>
                      <div
                        className={`text-[9px] mt-1.5 ${
                          isUser ? 'text-slate-400 text-right' : 'text-slate-400 text-left'
                        }`}
                      >
                        {msg.timestamp}
                      </div>
                    </div>
                  </motion.div>
                );
              })}

              {/* Typing indicator */}
              {isLoading && (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-2 text-slate-500 text-xs pl-2"
                >
                  <div className="w-6 h-6 rounded-full overflow-hidden shrink-0">
                    <KinMascot pose="time-machine" size={24} />
                  </div>
                  <div className="flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-white/90 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 shadow-xs">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-bounce" />
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-bounce [animation-delay:0.2s]" />
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-bounce [animation-delay:0.4s]" />
                    <span className="text-[11px] font-medium text-slate-500 ml-1">Kin is thinking...</span>
                  </div>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Quick Action Chips */}
            <div className="px-4 py-2 border-t border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/60 backdrop-blur-xs flex items-center gap-1.5 overflow-x-auto no-scrollbar">
              {quickPrompts.map((chip, idx) => (
                <button
                  key={idx}
                  onClick={chip.action}
                  className="whitespace-nowrap px-3 py-1 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-slate-300 text-slate-700 dark:text-slate-200 text-[11px] font-medium transition-all hover:bg-slate-50 dark:hover:bg-slate-750 active:scale-95 cursor-pointer flex items-center gap-1 shadow-2xs"
                >
                  <span>{chip.label}</span>
                </button>
              ))}
            </div>

            {/* Input Bar */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="p-3 bg-white/80 dark:bg-slate-900/80 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2"
            >
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Ask Kin about alumni, your CV match, skills, or anything..."
                disabled={isLoading}
                className="flex-1 px-4 py-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 text-xs focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-white transition-all disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={!inputValue.trim() || isLoading}
                className="p-2.5 rounded-2xl bg-slate-900 hover:bg-black text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm hover:scale-105 active:scale-95 cursor-pointer shrink-0"
                title="Send message"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
