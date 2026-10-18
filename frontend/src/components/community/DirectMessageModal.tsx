'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Send, 
  Loader2, 
  MessageSquare, 
  CheckCheck, 
  Check, 
  Sparkles,
  GraduationCap,
  Briefcase
} from 'lucide-react';

export interface DMTargetUser {
  id: string;
  name: string;
  email: string;
  role: string;
  institution?: string;
  headline?: string;
  avatarUrl?: string;
}

interface MessageItem {
  id: string;
  content: string;
  senderId: string;
  receiverId: string;
  isSender: boolean;
  read: boolean;
  createdAt: string;
}

interface DirectMessageModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetUser: DMTargetUser | null;
  currentUserEmail: string;
  currentUserName: string;
}

export default function DirectMessageModal({
  isOpen,
  onClose,
  targetUser,
  currentUserEmail,
  currentUserName,
}: DirectMessageModalProps) {
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  };

  // Fetch messages between current user and target user
  const fetchMessages = async () => {
    if (!targetUser || !currentUserEmail) return;
    try {
      const res = await fetch(
        `/api/direct-messages?currentUserEmail=${encodeURIComponent(currentUserEmail)}&otherUserId=${encodeURIComponent(targetUser.id)}`
      );
      const data = await res.json();
      if (data.success && Array.isArray(data.messages)) {
        setMessages(data.messages);
      }
    } catch (err) {
      console.warn('[Fetch DMs Warning]', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && targetUser) {
      setIsLoading(true);
      fetchMessages();

      // Poll for incoming replies every 3.5 seconds
      const interval = setInterval(fetchMessages, 3500);
      return () => clearInterval(interval);
    }
  }, [isOpen, targetUser, currentUserEmail]);

  useEffect(() => {
    if (!isLoading) {
      scrollToBottom();
    }
  }, [messages, isLoading]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() || isSending || !targetUser) return;

    const messageContent = inputText.trim();
    setInputText('');
    setIsSending(true);

    // Optimistic message
    const tempId = `temp_${Date.now()}`;
    const optimisticMsg: MessageItem = {
      id: tempId,
      content: messageContent,
      senderId: 'self',
      receiverId: targetUser.id,
      isSender: true,
      read: false,
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, optimisticMsg]);

    try {
      const res = await fetch('/api/direct-messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          senderEmail: currentUserEmail,
          receiverId: targetUser.id,
          content: messageContent,
        }),
      });

      const data = await res.json();
      if (data.success && data.message) {
        setMessages((prev) =>
          prev.map((m) => (m.id === tempId ? data.message : m))
        );
      }
    } catch (err) {
      console.error('[Send DM Error]', err);
    } finally {
      setIsSending(false);
    }
  };

  if (!isOpen || !targetUser) return null;

  const isStudent = targetUser.role === 'student';

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-stone-900/40 backdrop-blur-sm"
        />

        {/* Modal Card - Warm light theme */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 12 }}
          transition={{ type: 'spring', damping: 26, stiffness: 320 }}
          className="relative w-full max-w-lg h-[580px] flex flex-col rounded-3xl bg-white border border-stone-200/80 shadow-2xl z-10 overflow-hidden text-stone-900"
        >
          {/* Header */}
          <div className="p-4 px-5 bg-stone-50/80 border-b border-stone-200/70 flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0">
              <div className="relative">
                <img
                  src={targetUser.avatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(targetUser.name)}&backgroundColor=e25c38,1e293b&textColor=ffffff`}
                  alt={targetUser.name}
                  className="w-10 h-10 rounded-2xl object-cover border border-stone-200 shadow-2xs"
                />
                <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white" />
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <h3 className="text-sm font-bold text-stone-900 truncate">
                    {targetUser.name}
                  </h3>
                  <span
                    className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider flex items-center gap-0.5 ${
                      isStudent
                        ? 'bg-orange-100 text-[#E25C38]'
                        : 'bg-stone-900 text-white'
                    }`}
                  >
                    {isStudent ? <GraduationCap size={10} /> : <Briefcase size={10} />}
                    {isStudent ? 'Student' : 'Alumni'}
                  </span>
                </div>
                <p className="text-[11px] text-stone-500 truncate">
                  {targetUser.headline || targetUser.institution || 'Verified KIN Member'}
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 text-stone-400 hover:text-stone-700 rounded-full hover:bg-stone-200/60 transition"
            >
              <X size={18} />
            </button>
          </div>

          {/* Messages Stream */}
          <div ref={messagesContainerRef} className="flex-1 p-4 overflow-y-auto space-y-3 bg-stone-50/30">
            {isLoading ? (
              <div className="h-full flex items-center justify-center text-xs text-stone-400 gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-[#E25C38]" />
                <span>Loading direct messages...</span>
              </div>
            ) : messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-2">
                <div className="w-12 h-12 rounded-2xl bg-orange-50 border border-orange-100 flex items-center justify-center text-[#E25C38] mb-1">
                  <MessageSquare size={22} />
                </div>
                <h4 className="text-xs font-bold text-stone-800">
                  Direct Messaging with {targetUser.name}
                </h4>
                <p className="text-[11px] text-stone-500 max-w-xs">
                  Send a direct message to introduce yourself, discuss engineering projects, or explore mentorship opportunities.
                </p>
              </div>
            ) : (
              messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${
                    msg.isSender ? 'items-end' : 'items-start'
                  }`}
                >
                  <div
                    className={`max-w-[78%] px-4 py-2.5 rounded-2xl text-xs leading-relaxed ${
                      msg.isSender
                        ? 'bg-[#E25C38] text-white rounded-br-xs shadow-xs'
                        : 'bg-white text-stone-800 border border-stone-200/80 rounded-bl-xs shadow-2xs'
                    }`}
                  >
                    {msg.content}
                  </div>
                  <div className="flex items-center gap-1 mt-1 px-1">
                    <span className="text-[9px] text-stone-400 font-mono">
                      {new Date(msg.createdAt).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                    {msg.isSender && (
                      <span className="text-[9px] text-stone-400">
                        {msg.read ? (
                          <CheckCheck size={11} className="text-emerald-500 inline" />
                        ) : (
                          <Check size={11} className="inline" />
                        )}
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Input Footer */}
          <form
            onSubmit={handleSendMessage}
            className="p-3 px-4 bg-white border-t border-stone-200/80 flex items-center gap-2"
          >
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={`Message ${targetUser.name.split(' ')[0]}...`}
              className="flex-1 py-2 px-3.5 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-900 placeholder-stone-400 focus:outline-none focus:bg-white focus:border-[#E25C38] focus:ring-2 focus:ring-[#E25C38]/10 transition"
            />
            <button
              type="submit"
              disabled={!inputText.trim() || isSending}
              className="p-2.5 rounded-xl bg-[#E25C38] hover:bg-[#cf4b27] text-white transition shadow-sm active:scale-95 disabled:opacity-40 cursor-pointer"
            >
              {isSending ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Send size={16} />
              )}
            </button>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
