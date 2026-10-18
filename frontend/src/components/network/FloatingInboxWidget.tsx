'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageSquare, 
  X, 
  Send, 
  Search, 
  ArrowLeft, 
  CheckCheck, 
  Check, 
  Loader2, 
  ExternalLink,
  ChevronDown,
  Sparkles,
  User,
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

export interface MessageItem {
  id: string;
  content: string;
  senderId: string;
  receiverId: string;
  isSender: boolean;
  read: boolean;
  createdAt: string;
}

export interface ConversationItem {
  partner: DMTargetUser;
  lastMessage: {
    id: string;
    content: string;
    createdAt: string;
    isSender: boolean;
    read: boolean;
  };
  unreadCount: number;
}

interface FloatingInboxWidgetProps {
  currentUserEmail: string;
  currentUserName: string;
  externalTargetUser?: DMTargetUser | null;
  onClearExternalTarget?: () => void;
}

export default function FloatingInboxWidget({
  currentUserEmail,
  currentUserName,
  externalTargetUser,
  onClearExternalTarget,
}: FloatingInboxWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activePartner, setActivePartner] = useState<DMTargetUser | null>(null);
  const [conversations, setConversations] = useState<ConversationItem[]>([]);
  const [totalUnreadCount, setTotalUnreadCount] = useState(0);
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [inputText, setInputText] = useState('');
  
  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<DMTargetUser[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [suggestedMembers, setSuggestedMembers] = useState<DMTargetUser[]>([]);

  // Loading states
  const [isLoadingConversations, setIsLoadingConversations] = useState(false);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Open inbox and switch to partner if externally triggered (e.g. clicking DM in directory)
  useEffect(() => {
    if (externalTargetUser) {
      setActivePartner(externalTargetUser);
      setIsOpen(true);
      if (onClearExternalTarget) onClearExternalTarget();
    }
  }, [externalTargetUser]);

  // Fetch all conversations for inbox
  const fetchInbox = async () => {
    if (!currentUserEmail) return;
    try {
      const res = await fetch(`/api/direct-messages?currentUserEmail=${encodeURIComponent(currentUserEmail)}`);
      const data = await res.json();
      if (data.success && Array.isArray(data.conversations)) {
        setConversations(data.conversations);
        setTotalUnreadCount(data.totalUnreadCount || 0);
      }
    } catch (err) {
      console.warn('[Fetch Inbox Warning]', err);
    }
  };

  // Fetch suggested members for zero state
  const fetchSuggestedMembers = async () => {
    try {
      const res = await fetch(`/api/members?role=all`);
      const data = await res.json();
      if (data.success && Array.isArray(data.members)) {
        const filtered = data.members
          .filter((m: any) => m.email?.toLowerCase() !== currentUserEmail?.toLowerCase())
          .slice(0, 6);
        setSuggestedMembers(filtered);
      }
    } catch {
      // Fallback
    }
  };

  // Fetch messages with active partner
  const fetchThreadMessages = async (silent = false) => {
    if (!activePartner || !currentUserEmail) return;
    if (!silent) setIsLoadingMessages(true);
    try {
      const res = await fetch(
        `/api/direct-messages?currentUserEmail=${encodeURIComponent(currentUserEmail)}&otherUserId=${encodeURIComponent(activePartner.id)}`
      );
      const data = await res.json();
      if (data.success && Array.isArray(data.messages)) {
        setMessages(data.messages);
        // Refresh inbox unread counts
        fetchInbox();
      }
    } catch (err) {
      console.warn('[Fetch Thread Warning]', err);
    } finally {
      if (!silent) setIsLoadingMessages(false);
    }
  };

  // Live polling for inbox list (every 4 seconds)
  useEffect(() => {
    fetchInbox();
    fetchSuggestedMembers();
    const inboxTimer = setInterval(fetchInbox, 4000);
    return () => clearInterval(inboxTimer);
  }, [currentUserEmail]);

  // Live polling for active chat thread (every 3 seconds)
  useEffect(() => {
    if (isOpen && activePartner) {
      fetchThreadMessages(false);
      const threadTimer = setInterval(() => fetchThreadMessages(true), 3000);
      return () => clearInterval(threadTimer);
    }
  }, [isOpen, activePartner, currentUserEmail]);

  // Scroll on message change
  useEffect(() => {
    if (activePartner && messages.length > 0) {
      scrollToBottom();
    }
  }, [messages, activePartner]);

  // Search members
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await fetch(`/api/members?search=${encodeURIComponent(searchQuery.trim())}`);
        const data = await res.json();
        if (data.success && Array.isArray(data.members)) {
          const filtered = data.members.filter(
            (m: any) => m.email?.toLowerCase() !== currentUserEmail?.toLowerCase()
          );
          setSearchResults(filtered);
        }
      } catch {
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 250);
    return () => clearTimeout(timer);
  }, [searchQuery, currentUserEmail]);

  // Send message
  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() || !activePartner || isSending) return;

    const messageContent = inputText.trim();
    setInputText('');
    setIsSending(true);

    // Optimistic UI append
    const tempId = `temp_${Date.now()}`;
    const optimisticMsg: MessageItem = {
      id: tempId,
      content: messageContent,
      senderId: 'current',
      receiverId: activePartner.id,
      isSender: true,
      read: false,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimisticMsg]);
    scrollToBottom();

    try {
      const res = await fetch('/api/direct-messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          senderEmail: currentUserEmail,
          senderName: currentUserName,
          receiverId: activePartner.id,
          receiverEmail: activePartner.email,
          content: messageContent,
        }),
      });
      const data = await res.json();
      if (data.success && data.message) {
        setMessages((prev) => prev.map((m) => (m.id === tempId ? data.message : m)));
        fetchInbox();
      }
    } catch (err) {
      console.error('[Send Message Error]', err);
    } finally {
      setIsSending(false);
    }
  };

  // WhatsApp helper
  const openWhatsApp = (partner?: DMTargetUser | null, prefillMsg?: string) => {
    const name = partner?.name || 'Peer';
    const text = prefillMsg || `Hi ${name}, connecting with you from Kin Network (${currentUserName || 'Student Builder'})! Looking forward to chatting.`;
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const formatTimestamp = (iso: string) => {
    try {
      const d = new Date(iso);
      const diffMinutes = Math.floor((Date.now() - d.getTime()) / 60000);
      if (diffMinutes < 1) return 'Just now';
      if (diffMinutes < 60) return `${diffMinutes}m`;
      const diffHours = Math.floor(diffMinutes / 60);
      if (diffHours < 24) return `${diffHours}h`;
      return `${Math.floor(diffHours / 24)}d`;
    } catch {
      return '';
    }
  };

  return (
    <>
      {/* ─── FLOATING INBOX PILL BUTTON (BOTTOM RIGHT) ─── */}
      <div className="fixed bottom-5 right-5 sm:bottom-6 sm:right-6 z-40">
        <motion.button
          onClick={() => setIsOpen(!isOpen)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={`relative flex items-center gap-2.5 px-4 py-3 sm:px-5 sm:py-3.5 rounded-full shadow-2xl backdrop-blur-xl transition-all cursor-pointer ${
            isOpen
              ? 'bg-slate-900 text-white ring-2 ring-[#E25C38]'
              : 'bg-white/95 text-slate-800 border border-slate-200/90 hover:bg-slate-900 hover:text-white shadow-[0_12px_36px_rgba(0,0,0,0.18)]'
          }`}
          aria-label="Open Kin Messages Inbox"
        >
          <div className="relative">
            <MessageSquare className="w-5 h-5 text-[#E25C38]" />
            {totalUnreadCount > 0 && (
              <span className="absolute -top-2 -right-2 w-5 h-5 bg-[#E25C38] text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse shadow-sm">
                {totalUnreadCount > 9 ? '9+' : totalUnreadCount}
              </span>
            )}
          </div>

          <span className="text-xs sm:text-sm font-bold tracking-tight">Inbox</span>

          {/* Quick WhatsApp integrated badge */}
          <div 
            onClick={(e) => {
              e.stopPropagation();
              openWhatsApp(null, `Hi, connecting to Kin WhatsApp network from ${currentUserName || 'Campus Builder'}!`);
            }}
            title="Launch WhatsApp direct"
            className="flex items-center gap-1 pl-1.5 pr-2 py-0.5 rounded-full bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold transition-all"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            <span>WA</span>
          </div>
        </motion.button>
      </div>

      {/* ─── FLOATING INBOX WINDOW / DRAWER ─── */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 25, scale: 0.96 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            className="fixed bottom-20 right-4 sm:bottom-22 sm:right-6 z-40 w-[94vw] sm:w-[410px] h-[580px] max-h-[82vh] rounded-3xl bg-white border border-slate-200 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.25)] flex flex-col overflow-hidden backdrop-blur-2xl"
          >
            {/* ─── INBOX HEADER ─── */}
            <div className="p-4 border-b border-slate-100 bg-slate-50/80 flex items-center justify-between">
              {activePartner ? (
                <div className="flex items-center gap-2.5 min-w-0">
                  <button
                    onClick={() => setActivePartner(null)}
                    className="p-1.5 rounded-lg hover:bg-slate-200/70 text-slate-600 transition-colors cursor-pointer"
                    title="Back to inbox list"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                  <img
                    src={activePartner.avatarUrl || '/images/aditya_sharma.jpg'}
                    alt={activePartner.name}
                    className="w-8 h-8 rounded-full object-cover border border-slate-200"
                  />
                  <div className="min-w-0">
                    <h3 className="text-xs font-bold text-slate-900 truncate flex items-center gap-1.5">
                      {activePartner.name}
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
                    </h3>
                    <p className="text-[10px] text-slate-500 truncate">
                      {activePartner.headline || activePartner.institution || 'Verified Member'}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-xl bg-[#E25C38]/10 text-[#E25C38] flex items-center justify-center">
                    <MessageSquare className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-slate-900">KIN Network Inbox</h3>
                    <p className="text-[10px] text-slate-500 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      Live Peer-to-Peer & WhatsApp
                    </p>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-1.5">
                {/* WHATSAPP ACTION BUTTON */}
                <button
                  onClick={() => openWhatsApp(activePartner)}
                  title="Open on WhatsApp"
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-[11px] font-bold shadow-xs transition-all cursor-pointer"
                >
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
                  </svg>
                  <span>WhatsApp</span>
                </button>

                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 rounded-lg hover:bg-slate-200/70 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
                  title="Close inbox"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* ─── INBOX BODY (SEARCH / CONVERSATIONS OR CHAT) ─── */}
            {activePartner ? (
              /* VIEW 2: ACTIVE CHAT THREAD */
              <div className="flex-1 flex flex-col min-h-0 bg-slate-50/50">
                {/* WhatsApp Direct Transition Banner */}
                <div 
                  onClick={() => openWhatsApp(activePartner)}
                  className="px-3 py-1.5 bg-emerald-50 border-b border-emerald-100 flex items-center justify-between text-[11px] text-emerald-800 cursor-pointer hover:bg-emerald-100/70 transition-colors"
                >
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span>Prefer WhatsApp? Chat with <strong>{activePartner.name}</strong></span>
                  </div>
                  <ExternalLink className="w-3 h-3 text-emerald-600" />
                </div>

                {/* Messages Container */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {isLoadingMessages ? (
                    <div className="flex flex-col items-center justify-center h-48 text-slate-400 gap-2">
                      <Loader2 className="w-5 h-5 animate-spin text-[#E25C38]" />
                      <span className="text-xs">Loading thread...</span>
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-52 text-center px-4">
                      <div className="w-12 h-12 rounded-2xl bg-[#E25C38]/10 text-[#E25C38] flex items-center justify-center mb-2">
                        <Sparkles className="w-6 h-6" />
                      </div>
                      <p className="text-xs font-bold text-slate-900">
                        Start conversation with {activePartner.name}
                      </p>
                      <p className="text-[11px] text-slate-500 mt-1 max-w-xs">
                        Messages are delivered instantly on Kin and can be continued on WhatsApp at any time.
                      </p>
                      <button
                        onClick={() => openWhatsApp(activePartner)}
                        className="mt-3 px-3 py-1.5 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white text-[11px] font-bold flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
                      >
                        <span>Say Hello on WhatsApp</span>
                        <ExternalLink className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    messages.map((m) => {
                      const isMe = m.isSender;
                      return (
                        <div
                          key={m.id}
                          className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                        >
                          <div
                            className={`max-w-[78%] px-3.5 py-2.5 rounded-2xl text-xs leading-relaxed shadow-xs ${
                              isMe
                                ? 'bg-slate-900 text-white rounded-br-xs'
                                : 'bg-white text-slate-800 border border-slate-200/80 rounded-bl-xs'
                            }`}
                          >
                            <p className="whitespace-pre-wrap break-words">{m.content}</p>
                            <div
                              className={`flex items-center justify-end gap-1 mt-1 text-[9px] ${
                                isMe ? 'text-slate-400' : 'text-slate-400'
                              }`}
                            >
                              <span>{formatTimestamp(m.createdAt)}</span>
                              {isMe && (
                                <span>
                                  {m.read ? (
                                    <CheckCheck className="w-3 h-3 text-sky-400 inline" />
                                  ) : (
                                    <Check className="w-3 h-3 inline text-slate-400" />
                                  )}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Composer */}
                <form
                  onSubmit={handleSendMessage}
                  className="p-3 border-t border-slate-200 bg-white flex items-center gap-2"
                >
                  <input
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder={`Message ${activePartner.name}...`}
                    className="flex-1 bg-slate-50 border border-slate-200 rounded-full px-3.5 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:border-[#E25C38] focus:bg-white transition-all"
                  />

                  {/* Send Button */}
                  <button
                    type="submit"
                    disabled={!inputText.trim() || isSending}
                    className="p-2 rounded-full bg-[#E25C38] hover:bg-[#d04e2c] disabled:opacity-40 text-white transition-all shadow-xs cursor-pointer disabled:cursor-not-allowed"
                    title="Send message"
                  >
                    {isSending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                  </button>
                </form>
              </div>
            ) : (
              /* VIEW 1: SEARCH & ACTIVE CONVERSATIONS LIST */
              <div className="flex-1 flex flex-col min-h-0 bg-white">
                {/* Search Bar */}
                <div className="p-3 border-b border-slate-100">
                  <div className="relative">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search members by name, institution..."
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-8 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:border-[#E25C38] focus:bg-white transition-all"
                    />
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery('')}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Content: Search Results OR Active Conversations */}
                <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
                  {searchQuery.trim() ? (
                    /* Search results */
                    <div>
                      <div className="px-3.5 py-2 bg-slate-50/70 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                        {isSearching ? 'Searching directory...' : `Search Results (${searchResults.length})`}
                      </div>

                      {searchResults.length === 0 && !isSearching ? (
                        <div className="p-6 text-center text-xs text-slate-400">
                          No members found matching &quot;{searchQuery}&quot;
                        </div>
                      ) : (
                        searchResults.map((user) => (
                          <div
                            key={user.id}
                            onClick={() => {
                              setActivePartner(user);
                              setSearchQuery('');
                            }}
                            className="p-3 hover:bg-slate-50 transition-colors flex items-center justify-between cursor-pointer group"
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <img
                                src={user.avatarUrl || '/images/aditya_sharma.jpg'}
                                alt={user.name}
                                className="w-9 h-9 rounded-full object-cover border border-slate-200"
                              />
                              <div className="min-w-0">
                                <h4 className="text-xs font-bold text-slate-900 truncate group-hover:text-[#E25C38] transition-colors">
                                  {user.name}
                                </h4>
                                <p className="text-[10px] text-slate-500 truncate">
                                  {user.headline || user.institution || 'Verified Member'}
                                </p>
                              </div>
                            </div>
                            <span className="text-[10px] font-bold text-[#E25C38] px-2 py-1 rounded-md bg-orange-50 group-hover:bg-[#E25C38] group-hover:text-white transition-all">
                              Message
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  ) : (
                    /* Active Conversations List */
                    <div>
                      {conversations.length > 0 ? (
                        <div>
                          <div className="px-3.5 py-2 bg-slate-50/70 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                            Active Conversations ({conversations.length})
                          </div>
                          {conversations.map((c) => (
                            <div
                              key={c.partner.id}
                              onClick={() => setActivePartner(c.partner)}
                              className="p-3 hover:bg-slate-50 transition-colors flex items-center justify-between cursor-pointer group"
                            >
                              <div className="flex items-center gap-3 min-w-0">
                                <div className="relative">
                                  <img
                                    src={c.partner.avatarUrl || '/images/aditya_sharma.jpg'}
                                    alt={c.partner.name}
                                    className="w-10 h-10 rounded-full object-cover border border-slate-200"
                                  />
                                  {c.unreadCount > 0 && (
                                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#E25C38] text-white text-[9px] font-bold rounded-full flex items-center justify-center border-2 border-white">
                                      {c.unreadCount}
                                    </span>
                                  )}
                                </div>
                                <div className="min-w-0">
                                  <div className="flex items-center justify-between gap-1">
                                    <h4 className="text-xs font-bold text-slate-900 truncate group-hover:text-[#E25C38] transition-colors">
                                      {c.partner.name}
                                    </h4>
                                    <span className="text-[9px] text-slate-400 shrink-0">
                                      {formatTimestamp(c.lastMessage.createdAt)}
                                    </span>
                                  </div>
                                  <p className="text-[11px] text-slate-500 truncate max-w-[210px]">
                                    {c.lastMessage.isSender && <span className="text-slate-400">You: </span>}
                                    {c.lastMessage.content}
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : null}

                      {/* Suggested Directory Members */}
                      <div className="p-3">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                            Verified Network Members
                          </h4>
                          <span className="text-[10px] text-slate-400">Tap to start chat</span>
                        </div>

                        <div className="space-y-1.5">
                          {suggestedMembers.map((m) => (
                            <div
                              key={m.id}
                              onClick={() => setActivePartner(m)}
                              className="p-2.5 rounded-xl hover:bg-slate-50 border border-slate-100 flex items-center justify-between cursor-pointer transition-colors"
                            >
                              <div className="flex items-center gap-2.5 min-w-0">
                                <img
                                  src={m.avatarUrl || '/images/aditya_sharma.jpg'}
                                  alt={m.name}
                                  className="w-8 h-8 rounded-full object-cover border border-slate-200"
                                />
                                <div className="min-w-0">
                                  <p className="text-xs font-bold text-slate-800 truncate">{m.name}</p>
                                  <p className="text-[10px] text-slate-500 truncate">
                                    {m.headline || m.institution}
                                  </p>
                                </div>
                              </div>
                              <span className="text-[10px] font-bold text-[#E25C38] px-2 py-0.5 rounded-md bg-orange-50">
                                Text
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer WhatsApp Banner */}
                <div 
                  onClick={() => openWhatsApp(null)}
                  className="p-3 bg-emerald-500/10 border-t border-emerald-500/20 flex items-center justify-between text-xs text-emerald-800 cursor-pointer hover:bg-emerald-500/15 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center">
                      <svg className="w-3 h-3 fill-current" viewBox="0 0 24 24">
                        <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-bold">Connect on WhatsApp</p>
                      <p className="text-[10px] text-emerald-700">Instant bridge to mobile chats</p>
                    </div>
                  </div>
                  <ExternalLink className="w-4 h-4 text-emerald-600" />
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
