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

const getMemberAvatar = (user: { name?: string; email?: string; avatarUrl?: string }) => {
  if (user.name?.toLowerCase().includes('aditya sharma')) {
    return '/images/aditya_sharma.jpg';
  }
  if (user.avatarUrl && !user.avatarUrl.includes('aditya_sharma.jpg')) {
    return user.avatarUrl;
  }
  return `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user.name || user.email || 'Member')}&backgroundColor=e25c38,1e293b&textColor=ffffff`;
};

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
      const res = await fetch(`/api/direct-messages?currentUserEmail=${encodeURIComponent(currentUserEmail.trim().toLowerCase())}`);
      const data = await res.json();
      if (data.success && Array.isArray(data.conversations)) {
        setConversations(data.conversations);
        setTotalUnreadCount(data.totalUnreadCount || 0);
      }
    } catch (err) {
      console.warn('[Fetch Inbox Warning]', err);
    }
  };

  // Fetch real registered members for directory listing
  const fetchSuggestedMembers = async () => {
    try {
      const emailParam = currentUserEmail ? `&currentUserEmail=${encodeURIComponent(currentUserEmail.trim().toLowerCase())}` : '';
      const res = await fetch(`/api/members?role=all${emailParam}`);
      const data = await res.json();
      if (data.success && Array.isArray(data.members)) {
        const myEmail = currentUserEmail?.trim().toLowerCase();
        const filtered = data.members
          .filter((m: any) => m.email?.trim().toLowerCase() !== myEmail)
          .slice(0, 10);
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
        `/api/direct-messages?currentUserEmail=${encodeURIComponent(currentUserEmail.trim().toLowerCase())}&otherUserId=${encodeURIComponent(activePartner.id)}`
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
          const myEmail = currentUserEmail?.trim().toLowerCase();
          const filtered = data.members.filter(
            (m: any) => m.email?.trim().toLowerCase() !== myEmail
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
    if (!inputText.trim() || !activePartner || isSending || !currentUserEmail) return;

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
          senderEmail: currentUserEmail.trim().toLowerCase(),
          senderName: currentUserName || currentUserEmail.split('@')[0],
          receiverId: activePartner.id,
          receiverEmail: activePartner.email?.trim().toLowerCase(),
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

          <span className="text-xs sm:text-sm font-bold tracking-tight">Messages</span>

          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" title="Direct Network Active" />
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
                    src={getMemberAvatar(activePartner)}
                    alt={activePartner.name}
                    className="w-8 h-8 rounded-full object-cover border border-slate-200"
                  />
                  <div className="min-w-0">
                    <h3 className="text-xs font-bold text-slate-900 truncate flex items-center gap-1.5">
                      {activePartner.name}
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
                    </h3>
                    <p className="text-[10px] text-slate-500 truncate">
                      {activePartner.headline || activePartner.institution || 'Registered Member'}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-xl bg-[#E25C38]/10 text-[#E25C38] flex items-center justify-center">
                    <MessageSquare className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-slate-900">KIN Network Messages</h3>
                    <p className="text-[10px] text-slate-500 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      Direct Peer-to-Peer Messaging
                    </p>
                  </div>
                </div>
              )}

              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg hover:bg-slate-200/70 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
                title="Close inbox"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* ─── INBOX BODY (SEARCH / CONVERSATIONS OR CHAT) ─── */}
            {activePartner ? (
              /* VIEW 2: ACTIVE CHAT THREAD */
              <div className="flex-1 flex flex-col min-h-0 bg-slate-50/50">
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
                        Direct, end-to-end messaging across the KIN network. Any message you send here will appear in their account when they log in.
                      </p>
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
                      placeholder="Search registered members by name, institution..."
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
                        {isSearching ? 'Searching registered members...' : `Search Results (${searchResults.length})`}
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
                                src={getMemberAvatar(user)}
                                alt={user.name}
                                className="w-9 h-9 rounded-full object-cover border border-slate-200"
                              />
                              <div className="min-w-0">
                                <h4 className="text-xs font-bold text-slate-900 truncate group-hover:text-[#E25C38] transition-colors">
                                  {user.name}
                                </h4>
                                <p className="text-[10px] text-slate-500 truncate">
                                  {user.headline || user.institution || 'Registered Member'}
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
                                    src={getMemberAvatar(c.partner)}
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

                      {/* Registered Platform Members */}
                      <div className="p-3">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                            Registered Members on KIN
                          </h4>
                          <span className="text-[10px] text-slate-400">Tap to message</span>
                        </div>

                        {suggestedMembers.length === 0 ? (
                          <div className="py-6 px-4 text-center rounded-2xl bg-slate-50 border border-slate-100">
                            <User className="w-7 h-7 text-slate-300 mx-auto mb-1.5" />
                            <p className="text-xs font-semibold text-slate-700">No other registered accounts yet</p>
                            <p className="text-[11px] text-slate-400 mt-0.5">
                              When other students or professionals sign up, they will automatically appear here.
                            </p>
                          </div>
                        ) : (
                          <div className="space-y-1.5">
                            {suggestedMembers.map((m) => (
                              <div
                                key={m.id}
                                onClick={() => setActivePartner(m)}
                                className="p-2.5 rounded-xl hover:bg-slate-50 border border-slate-100 flex items-center justify-between cursor-pointer transition-colors"
                              >
                                <div className="flex items-center gap-2.5 min-w-0">
                                  <img
                                    src={getMemberAvatar(m)}
                                    alt={m.name}
                                    className="w-8 h-8 rounded-full object-cover border border-slate-200"
                                  />
                                  <div className="min-w-0">
                                    <p className="text-xs font-bold text-slate-800 truncate">{m.name}</p>
                                    <p className="text-[10px] text-slate-500 truncate">
                                      {m.headline || m.institution || 'Registered Member'}
                                    </p>
                                  </div>
                                </div>
                                <span className="text-[10px] font-bold text-[#E25C38] px-2 py-0.5 rounded-md bg-orange-50 hover:bg-[#E25C38] hover:text-white transition-all">
                                  Text
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
