'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  Send,
  Heart,
  MessageSquare,
  Search,
  ExternalLink,
  Github,
  Linkedin,
  Globe,
  Check,
  Clock,
  Sparkles,
  UserCheck,
  ShieldCheck,
  GraduationCap,
  Briefcase,
  Layers,
  Code2,
  ChevronDown,
  Loader2,
  Filter,
  FileText,
} from 'lucide-react';

interface LiveMember {
  id: string;
  email: string;
  name: string;
  role: 'student' | 'professional' | 'alumni';
  headline?: string;
  institution: string;
  verificationStatus: string;
  bio?: string;
  skills: string[];
  linkedinUrl?: string;
  githubUrl?: string;
  githubUsername?: string;
  portfolioUrl?: string;
  topProjectUrl?: string;
  topProjectDescription?: string;
  officeHours?: string;
  graduationYear?: string;
  avatarUrl?: string;
  connectionStatus: 'none' | 'pending' | 'connected' | 'self';
  connectionId?: string | null;
  createdAt: string;
}

interface SocialPostItem {
  id: string;
  author: {
    name: string;
    role: string;
    institution?: string;
    avatar?: string;
    verified: boolean;
  };
  content: string;
  timestamp: string;
  createdAt: string;
  tags: string[];
  likes: number;
  isLiked: boolean;
  commentsCount: number;
  comments: Array<{
    id: string;
    authorName: string;
    authorRole: string;
    content: string;
    createdAt: string;
    timeAgo: string;
  }>;
  isGhost: boolean;
  ghostPersona?: string;
}

interface LiveCommunityNetworkProps {
  currentUserEmail?: string;
  currentUserName?: string;
  currentUserRole?: string;
  currentUserInstitution?: string;
  isStudent?: boolean;
  onShowToast: (msg: string) => void;
  onSendCvToProfessional?: (member: {
    name: string;
    role: string;
    institution?: string;
    avatarUrl?: string;
    skills?: string[];
  }) => void;
}

export default function LiveCommunityNetwork({
  currentUserEmail = 'aditya@iiitd.ac.in',
  currentUserName = 'Aditya Sharma',
  currentUserRole = 'Full-Stack & AI Systems Builder',
  currentUserInstitution = 'IIIT Delhi',
  isStudent = true,
  onShowToast,
  onSendCvToProfessional,
}: LiveCommunityNetworkProps) {
  const [subTab, setSubTab] = useState<'feed' | 'ghost' | 'directory'>('feed');

  // Posts State
  const [posts, setPosts] = useState<SocialPostItem[]>([]);
  const [isLoadingPosts, setIsLoadingPosts] = useState(true);
  const [newPostText, setNewPostText] = useState('');
  const [newGhostText, setNewGhostText] = useState('');
  const [isSubmittingPost, setIsSubmittingPost] = useState(false);

  // Active Comment Box states: postId -> string
  const [activeCommentPostId, setActiveCommentPostId] = useState<string | null>(null);
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  // Members Directory State
  const [members, setMembers] = useState<LiveMember[]>([]);
  const [isLoadingMembers, setIsLoadingMembers] = useState(true);
  const [directoryRoleFilter, setDirectoryRoleFilter] = useState<'all' | 'student' | 'professional' | 'connected'>('all');
  const [directorySearchQuery, setDirectorySearchQuery] = useState('');
  const [connectingMemberId, setConnectingMemberId] = useState<string | null>(null);

  // Fetch Live Feed
  const fetchPosts = async () => {
    try {
      const res = await fetch(`/api/social/posts?userEmail=${encodeURIComponent(currentUserEmail)}`);
      const data = await res.json();
      if (data.success && Array.isArray(data.posts)) {
        setPosts(data.posts);
      }
    } catch (err) {
      console.warn('[Fetch Posts Error]', err);
    } finally {
      setIsLoadingPosts(false);
    }
  };

  // Fetch Live Members
  const fetchMembers = async () => {
    try {
      const res = await fetch(`/api/members?currentUserEmail=${encodeURIComponent(currentUserEmail)}`);
      const data = await res.json();
      if (data.success && Array.isArray(data.members)) {
        setMembers(data.members);
      }
    } catch (err) {
      console.warn('[Fetch Members Error]', err);
    } finally {
      setIsLoadingMembers(false);
    }
  };

  useEffect(() => {
    fetchPosts();
    fetchMembers();
  }, [currentUserEmail]);

  // Submit Public Post
  const handlePublishPost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostText.trim()) return;

    setIsSubmittingPost(true);
    try {
      const res = await fetch('/api/social/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: newPostText.trim(),
          authorName: currentUserName,
          authorRole: isStudent ? 'Student • IIIT Delhi' : 'Verified Alumni • Professional',
          authorInstitution: currentUserInstitution,
          userEmail: currentUserEmail,
          tags: isStudent ? ['#ProofOfWork', '#StudentBuilder'] : ['#TechLead', '#Mentorship'],
          isGhost: false,
        }),
      });
      const data = await res.json();
      if (data.success && data.post) {
        setPosts((prev) => [data.post, ...prev]);
        setNewPostText('');
        onShowToast('Post published to live network feed!');
      } else {
        onShowToast(data.error || 'Failed to post.');
      }
    } catch {
      onShowToast('Network error while posting.');
    } finally {
      setIsSubmittingPost(false);
    }
  };

  // Submit Ghost Post
  const handlePublishGhostPost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGhostText.trim()) return;

    setIsSubmittingPost(true);
    const persona = isStudent ? 'Ghost-Cadet-108' : 'Ghost-Architect-402';
    try {
      const res = await fetch('/api/social/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: newGhostText.trim(),
          isGhost: true,
          ghostPersona: persona,
          userEmail: currentUserEmail,
          tags: ['#GhostInsight', '#CandidAdvice'],
        }),
      });
      const data = await res.json();
      if (data.success && data.post) {
        setPosts((prev) => [data.post, ...prev]);
        setNewGhostText('');
        onShowToast('Candid anonymous insight published (Zero identity leaked)!');
      } else {
        onShowToast(data.error || 'Failed to post ghost insight.');
      }
    } catch {
      onShowToast('Network error while posting ghost insight.');
    } finally {
      setIsSubmittingPost(false);
    }
  };

  // Toggle Like on Post
  const handleToggleLike = async (postId: string) => {
    // Optimistic UI update
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id === postId) {
          const nextLiked = !p.isLiked;
          return {
            ...p,
            isLiked: nextLiked,
            likes: nextLiked ? p.likes + 1 : Math.max(0, p.likes - 1),
          };
        }
        return p;
      })
    );

    try {
      await fetch(`/api/social/posts/${postId}/like`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userEmail: currentUserEmail }),
      });
    } catch (err) {
      console.warn('[Like Error]', err);
    }
  };

  // Submit Comment on Post
  const handleSubmitComment = async (postId: string) => {
    const text = commentInputs[postId]?.trim();
    if (!text) return;

    setIsSubmittingComment(true);
    try {
      const res = await fetch(`/api/social/posts/${postId}/comment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: text,
          authorName: currentUserName,
          authorRole: isStudent ? 'Student Builder' : 'Verified Alumni',
          userEmail: currentUserEmail,
        }),
      });
      const data = await res.json();
      if (data.success && data.comment) {
        setPosts((prev) =>
          prev.map((p) => {
            if (p.id === postId) {
              return {
                ...p,
                commentsCount: p.commentsCount + 1,
                comments: [
                  ...p.comments,
                  {
                    ...data.comment,
                    timeAgo: 'Just now',
                  },
                ],
              };
            }
            return p;
          })
        );
        setCommentInputs((prev) => ({ ...prev, [postId]: '' }));
        onShowToast('Comment posted!');
      }
    } catch {
      onShowToast('Failed to post comment.');
    } finally {
      setIsSubmittingComment(false);
    }
  };

  // Send Connection Request
  const handleSendConnection = async (member: LiveMember) => {
    setConnectingMemberId(member.id);
    try {
      const res = await fetch('/api/connections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          senderEmail: currentUserEmail,
          senderName: currentUserName,
          senderRole: isStudent ? 'student' : 'professional',
          senderHeadline: currentUserRole,
          senderInstitution: currentUserInstitution,
          receiverId: member.id,
          note: `Hi ${member.name.split(' ')[0]}! Would love to connect and follow your engineering trajectory on KIN.`,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setMembers((prev) =>
          prev.map((m) => (m.id === member.id ? { ...m, connectionStatus: 'pending' } : m))
        );
        onShowToast(`Connection request sent to ${member.name}!`);
      } else {
        onShowToast(data.error || 'Failed to send request.');
      }
    } catch {
      onShowToast('Network error while requesting connection.');
    } finally {
      setConnectingMemberId(null);
    }
  };

  // Filtered members for directory
  const filteredMembers = members.filter((m) => {
    // Role filter
    if (directoryRoleFilter === 'student' && m.role !== 'student') return false;
    if (directoryRoleFilter === 'professional' && m.role === 'student') return false;
    if (directoryRoleFilter === 'connected' && m.connectionStatus !== 'connected') return false;

    // Search query
    if (directorySearchQuery.trim()) {
      const q = directorySearchQuery.toLowerCase();
      const matchName = m.name.toLowerCase().includes(q);
      const matchHeadline = (m.headline || '').toLowerCase().includes(q);
      const matchInst = (m.institution || '').toLowerCase().includes(q);
      const matchSkills = m.skills.some((s) => s.toLowerCase().includes(q));
      if (!matchName && !matchHeadline && !matchInst && !matchSkills) {
        return false;
      }
    }
    return true;
  });

  const publicPosts = posts.filter((p) => !p.isGhost);
  const ghostPosts = posts.filter((p) => p.isGhost);

  return (
    <div className="flex-1 flex flex-col gap-6 animate-in fade-in duration-200">
      {/* ─── Header & Sub-Tab Switcher ─── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-200/60">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase bg-[#E25C38]/10 text-[#E25C38] border border-[#E25C38]/20 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live Network Database
            </span>
            <span className="text-xs text-slate-400 font-mono">
              {members.length} Registered Members
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Campus & Industry Network
          </h2>
          <p className="text-xs text-slate-600 mt-0.5">
            Discover registered students & verified alumni, share engineering updates, or post candid insights.
          </p>
        </div>

        {/* 3-Way Sub-Tab Switcher */}
        <div className="flex items-center p-1 rounded-2xl bg-white/80 border border-slate-200 shadow-xs backdrop-blur-md self-start md:self-auto">
          <button
            id="tab-public-feed"
            onClick={() => setSubTab('feed')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              subTab === 'feed'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <span>🌐</span>
            <span>Public Feed</span>
          </button>

          <button
            id="tab-ghost-mode"
            onClick={() => setSubTab('ghost')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              subTab === 'ghost'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <span>👻</span>
            <span>Ghost Mode</span>
          </button>

          <button
            id="tab-member-directory"
            onClick={() => setSubTab('directory')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              subTab === 'directory'
                ? 'bg-[#E25C38] text-white shadow-sm ring-2 ring-[#E25C38]/20'
                : 'text-slate-600 hover:text-[#E25C38] hover:bg-orange-50/50'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Members Directory</span>
            <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-white/20">
              {members.length}
            </span>
          </button>
        </div>
      </div>

      {/* ═════════════════════════════════════════════════════════════════════
          SUB-TAB 1 & 2: PUBLIC FEED OR GHOST FEED (With Active Members Sidebar)
          ═════════════════════════════════════════════════════════════════════ */}
      {(subTab === 'feed' || subTab === 'ghost') && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main Feed Column (8 cols) */}
          <div className="lg:col-span-8 space-y-5">
            {subTab === 'feed' ? (
              <>
                {/* Public Composer */}
                <form
                  onSubmit={handlePublishPost}
                  className="p-5 rounded-3xl bg-white border border-slate-100 shadow-[0_4px_25px_rgba(0,0,0,0.03)]"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-7 h-7 rounded-full bg-slate-900 text-white text-xs font-bold flex items-center justify-center">
                      {currentUserName.charAt(0)}
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-900">{currentUserName}</span>
                      <span className="text-[10px] text-slate-500 ml-1.5">
                        ({isStudent ? 'Student' : 'Professional'} • {currentUserInstitution})
                      </span>
                    </div>
                  </div>

                  <textarea
                    id="social-composer-input"
                    value={newPostText}
                    onChange={(e) => setNewPostText(e.target.value)}
                    placeholder="Share an engineering milestone, project repo, or ask verified alumni a technical question..."
                    rows={3}
                    className="w-full text-xs text-slate-900 placeholder-slate-400 bg-slate-50/60 p-3 rounded-2xl border border-slate-100 resize-none focus:outline-none focus:border-[#E25C38] focus:bg-white transition-all leading-relaxed"
                  />

                  <div className="flex items-center justify-between pt-3 mt-1 border-t border-slate-100">
                    <span className="text-[11px] text-slate-500 font-medium">
                      Visible to all verified students & alumni
                    </span>
                    <button
                      id="social-composer-btn"
                      type="submit"
                      disabled={isSubmittingPost || !newPostText.trim()}
                      className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                    >
                      {isSubmittingPost ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Send className="w-3.5 h-3.5" />
                      )}
                      <span>Publish Post</span>
                    </button>
                  </div>
                </form>

                {/* Posts List */}
                {isLoadingPosts ? (
                  <div className="p-12 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-[#E25C38]" />
                    <span>Hydrating live posts from database...</span>
                  </div>
                ) : publicPosts.length === 0 ? (
                  <div className="p-8 rounded-3xl bg-white border border-slate-100 text-center text-xs text-slate-500">
                    No public posts yet. Be the first to share an update with the campus!
                  </div>
                ) : (
                  publicPosts.map((post) => (
                    <div
                      key={post.id}
                      className="p-5 sm:p-6 rounded-3xl bg-white border border-slate-100 shadow-[0_4px_25px_rgba(0,0,0,0.03)] space-y-3"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <img
                            src={post.author.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'}
                            alt={post.author.name}
                            className="w-10 h-10 rounded-full object-cover border border-slate-200"
                          />
                          <div>
                            <div className="flex items-center gap-1.5">
                              <h4 className="text-xs font-bold text-slate-900">{post.author.name}</h4>
                              <span className="w-3.5 h-3.5 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
                                <Check className="w-2.5 h-2.5" />
                              </span>
                            </div>
                            <p className="text-[10px] text-slate-500 line-clamp-1">{post.author.role}</p>
                            {post.author.institution && (
                              <p className="text-[10px] text-slate-400 font-mono">{post.author.institution}</p>
                            )}
                          </div>
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono">{post.timestamp}</span>
                      </div>

                      <p className="text-xs text-slate-800 leading-relaxed whitespace-pre-line">
                        {post.content}
                      </p>

                      {post.tags && post.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {post.tags.map((t) => (
                            <span
                              key={t}
                              className="px-2 py-0.5 rounded-md bg-slate-50 text-[10px] font-bold text-slate-600"
                            >
                              {t}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Post Actions: Like & Comment */}
                      <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-medium">
                        <div className="flex items-center gap-4">
                          <button
                            onClick={() => handleToggleLike(post.id)}
                            className={`flex items-center gap-1.5 transition-colors cursor-pointer ${
                              post.isLiked ? 'text-rose-600 font-bold' : 'hover:text-rose-600'
                            }`}
                          >
                            <Heart className={`w-3.5 h-3.5 ${post.isLiked ? 'fill-rose-600 text-rose-600' : ''}`} />
                            <span>{post.likes}</span>
                          </button>

                          <button
                            onClick={() =>
                              setActiveCommentPostId(activeCommentPostId === post.id ? null : post.id)
                            }
                            className="flex items-center gap-1.5 hover:text-slate-900 transition-colors cursor-pointer"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                            <span>{post.commentsCount} Comments</span>
                          </button>
                        </div>

                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                          Verified Post
                        </span>
                      </div>

                      {/* Comments Drawer / Inline comments */}
                      {activeCommentPostId === post.id && (
                        <div className="mt-3 pt-3 border-t border-slate-100 space-y-3 bg-slate-50/70 p-3.5 rounded-2xl animate-in fade-in duration-150">
                          {post.comments && post.comments.length > 0 && (
                            <div className="space-y-2">
                              {post.comments.map((c) => (
                                <div key={c.id} className="text-xs bg-white p-2.5 rounded-xl border border-slate-100">
                                  <div className="flex items-center justify-between mb-1">
                                    <span className="font-bold text-slate-900">{c.authorName}</span>
                                    <span className="text-[9px] text-slate-400">{c.timeAgo}</span>
                                  </div>
                                  <p className="text-slate-700 leading-relaxed text-[11px]">{c.content}</p>
                                </div>
                              ))}
                            </div>
                          )}

                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              value={commentInputs[post.id] || ''}
                              onChange={(e) =>
                                setCommentInputs({ ...commentInputs, [post.id]: e.target.value })
                              }
                              placeholder="Add a constructive insight..."
                              className="flex-1 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-[#E25C38]"
                            />
                            <button
                              onClick={() => handleSubmitComment(post.id)}
                              disabled={isSubmittingComment || !commentInputs[post.id]?.trim()}
                              className="px-3.5 py-1.5 rounded-xl bg-slate-900 text-white text-xs font-bold cursor-pointer disabled:opacity-50"
                            >
                              Reply
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </>
            ) : (
              <>
                {/* Ghost Composer */}
                <form
                  onSubmit={handlePublishGhostPost}
                  className="p-5 rounded-3xl bg-[#181A20] text-white border border-white/10 shadow-xl"
                >
                  <div className="flex items-center gap-2 mb-2 text-xs font-mono text-amber-400">
                    <span>👻</span>
                    <span>
                      Posting as: {isStudent ? 'Ghost-Cadet-108' : 'Ghost-Architect-402'} (Cryptographically
                      Pseudonymous)
                    </span>
                  </div>

                  <textarea
                    id="ghost-composer-input"
                    value={newGhostText}
                    onChange={(e) => setNewGhostText(e.target.value)}
                    placeholder="Share unfiltered truths about salary bands, real placement realities, lay-off warnings, or interview biases with absolute privacy..."
                    rows={3}
                    className="w-full text-xs text-white placeholder-slate-400 bg-white/5 p-3 rounded-2xl border border-white/10 resize-none focus:outline-none focus:border-amber-400 focus:bg-white/10 transition-all leading-relaxed font-mono"
                  />

                  <div className="flex items-center justify-between pt-3 mt-1 border-t border-white/10">
                    <span className="text-[10px] text-slate-400">
                      Zero employer or university trace • Cryptographic salt
                    </span>
                    <button
                      id="ghost-composer-btn"
                      type="submit"
                      disabled={isSubmittingPost || !newGhostText.trim()}
                      className="px-5 py-2 rounded-xl bg-[#E25C38] hover:bg-[#cf4b27] text-white text-xs font-bold transition-all shadow-md cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                    >
                      {isSubmittingPost ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Send className="w-3.5 h-3.5" />
                      )}
                      <span>Post Ghost Insight</span>
                    </button>
                  </div>
                </form>

                {/* Ghost Posts List */}
                {isLoadingPosts ? (
                  <div className="p-12 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-[#E25C38]" />
                    <span>Loading anonymous insights...</span>
                  </div>
                ) : ghostPosts.length === 0 ? (
                  <div className="p-8 rounded-3xl bg-white border border-slate-100 text-center text-xs text-slate-500">
                    No ghost insights posted yet.
                  </div>
                ) : (
                  ghostPosts.map((post) => (
                    <div
                      key={post.id}
                      className="p-5 sm:p-6 rounded-3xl bg-white border border-slate-100 shadow-[0_4px_25px_rgba(0,0,0,0.03)] space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <span className="w-8 h-8 rounded-full bg-slate-900 text-white text-xs flex items-center justify-center font-mono">
                            👻
                          </span>
                          <div>
                            <span className="text-xs font-mono font-bold text-slate-900">
                              {post.ghostPersona || post.author.name}
                            </span>
                            <span className="text-[10px] text-slate-500 block">
                              {post.author.role}
                            </span>
                          </div>
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono">{post.timestamp}</span>
                      </div>

                      <p className="text-xs text-slate-800 leading-relaxed">{post.content}</p>

                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                        <button
                          onClick={() => handleToggleLike(post.id)}
                          className={`flex items-center gap-1 cursor-pointer transition-colors ${
                            post.isLiked ? 'text-[#E25C38] font-bold' : 'hover:text-[#E25C38]'
                          }`}
                        >
                          <Heart className={`w-3.5 h-3.5 ${post.isLiked ? 'fill-[#E25C38] text-[#E25C38]' : ''}`} />
                          <span>{post.likes}</span>
                        </button>
                        <span className="text-[10px] text-emerald-600 font-mono font-bold">
                          ✓ Identity Zero-Knowledge Proof Verified
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </>
            )}
          </div>

          {/* Right Sidebar: Active Registered People Preview (4 cols) */}
          <div className="lg:col-span-4 space-y-4">
            <div className="p-6 rounded-3xl bg-white border border-slate-100 shadow-[0_4px_25px_rgba(0,0,0,0.03)] space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Registered People</h3>
                  <p className="text-[11px] text-slate-500">Students & Alumni from DB</p>
                </div>
                <button
                  onClick={() => setSubTab('directory')}
                  className="text-xs text-[#E25C38] font-bold hover:underline cursor-pointer flex items-center gap-0.5"
                >
                  <span>View All</span>
                  <ExternalLink className="w-2.5 h-2.5" />
                </button>
              </div>

              <div className="space-y-3">
                {isLoadingMembers ? (
                  <div className="p-4 text-center text-xs text-slate-400">Loading directory...</div>
                ) : (
                  members.slice(0, 5).map((m) => {
                    const isSelf = m.connectionStatus === 'self';
                    const isConnected = m.connectionStatus === 'connected';
                    const isPending = m.connectionStatus === 'pending';

                    return (
                      <div
                        key={m.id}
                        className="p-3 rounded-2xl bg-slate-50/80 border border-slate-100 flex items-center justify-between gap-2.5 transition-all hover:bg-slate-50"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <img
                            src={m.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'}
                            alt={m.name}
                            className="w-8 h-8 rounded-full object-cover shrink-0 border border-slate-200"
                          />
                          <div className="min-w-0">
                            <div className="flex items-center gap-1">
                              <h4 className="text-xs font-bold text-slate-900 truncate">{m.name}</h4>
                              <span
                                className={`text-[9px] px-1 rounded font-bold ${
                                  m.role === 'student'
                                    ? 'bg-orange-100 text-[#E25C38]'
                                    : 'bg-slate-900 text-white'
                                }`}
                              >
                                {m.role === 'student' ? 'Student' : 'Alumni'}
                              </span>
                            </div>
                            <span className="text-[10px] text-slate-500 block truncate">
                              {m.institution}
                            </span>
                          </div>
                        </div>

                        {/* Action */}
                        <div className="flex items-center gap-1.5">
                          {isStudent && m.role !== 'student' && !isSelf && (
                            <button
                              type="button"
                              onClick={() =>
                                onSendCvToProfessional?.({
                                  name: m.name,
                                  role: m.headline || 'Senior Engineering Leader',
                                  institution: m.institution,
                                  avatarUrl: m.avatarUrl,
                                  skills: m.skills,
                                })
                              }
                              className="px-2 py-1 rounded-xl bg-orange-50 hover:bg-orange-100 text-[#E25C38] border border-orange-200 text-[10px] font-bold transition-all shadow-2xs cursor-pointer flex items-center gap-1"
                              title="Submit CV for AI ATS Review"
                            >
                              <FileText className="w-2.5 h-2.5" />
                              <span>CV</span>
                            </button>
                          )}

                          {isSelf ? (
                            <span className="text-[10px] font-bold text-slate-400">You</span>
                          ) : isConnected ? (
                            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full flex items-center gap-0.5">
                              <Check className="w-2.5 h-2.5" /> Connected
                            </span>
                          ) : isPending ? (
                            <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full flex items-center gap-0.5">
                              <Clock className="w-2.5 h-2.5" /> Pending
                            </span>
                          ) : (
                            <button
                              onClick={() => handleSendConnection(m)}
                              disabled={connectingMemberId === m.id}
                              className="px-2.5 py-1 rounded-xl bg-white border border-slate-200 text-[11px] font-bold text-slate-800 hover:bg-slate-900 hover:text-white transition-all shadow-2xs cursor-pointer disabled:opacity-50"
                            >
                              {connectingMemberId === m.id ? (
                                <Loader2 className="w-3 h-3 animate-spin" />
                              ) : (
                                'Connect'
                              )}
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═════════════════════════════════════════════════════════════════════
          SUB-TAB 3: FULL-FLEDGED MEMBER DIRECTORY (Students & Professionals)
          ═════════════════════════════════════════════════════════════════════ */}
      {subTab === 'directory' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Controls Bar: Search & Role Filters */}
          <div className="p-4 sm:p-5 rounded-3xl bg-white border border-slate-100 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Search Input */}
            <div className="relative flex-1 max-w-lg">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                id="directory-search-input"
                type="text"
                value={directorySearchQuery}
                onChange={(e) => setDirectorySearchQuery(e.target.value)}
                placeholder="Search by builder name, skills (e.g. PyTorch, Go), company or university..."
                className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-[#E25C38] focus:bg-white transition-all"
              />
            </div>

            {/* Role Filter Chips */}
            <div className="flex flex-wrap items-center gap-1.5">
              {[
                { id: 'all', label: `All (${members.length})` },
                {
                  id: 'student',
                  label: `🎓 Students (${members.filter((m) => m.role === 'student').length})`,
                },
                {
                  id: 'professional',
                  label: `💼 Professionals (${members.filter((m) => m.role !== 'student').length})`,
                },
                {
                  id: 'connected',
                  label: `🤝 Connected (${members.filter((m) => m.connectionStatus === 'connected').length})`,
                },
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setDirectoryRoleFilter(f.id as any)}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                    directoryRoleFilter === f.id
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Directory Cards Grid */}
          {isLoadingMembers ? (
            <div className="p-16 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
              <Loader2 className="w-5 h-5 animate-spin text-[#E25C38]" />
              <span>Fetching verified members from live database...</span>
            </div>
          ) : filteredMembers.length === 0 ? (
            <div className="p-12 text-center rounded-3xl bg-white border border-slate-100 space-y-2">
              <Users className="w-8 h-8 text-slate-400 mx-auto" />
              <p className="text-sm font-bold text-slate-800">No members match your search criteria</p>
              <p className="text-xs text-slate-500">Try tweaking your keyword or filter chips above.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {filteredMembers.map((m) => {
                const isStudentRole = m.role === 'student';
                const isSelf = m.connectionStatus === 'self';
                const isConnected = m.connectionStatus === 'connected';
                const isPending = m.connectionStatus === 'pending';

                return (
                  <motion.div
                    key={m.id}
                    layout
                    className="p-5 sm:p-6 rounded-3xl bg-white border border-slate-100 shadow-[0_4px_25px_rgba(0,0,0,0.03)] hover:shadow-md transition-all flex flex-col justify-between space-y-4"
                  >
                    <div>
                      {/* Top Row: Avatar & Badges */}
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="relative">
                          <img
                            src={m.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80'}
                            alt={m.name}
                            className="w-13 h-13 rounded-2xl object-cover border-2 border-slate-100 shadow-xs"
                          />
                          <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center text-[8px] text-white">
                            ✓
                          </span>
                        </div>

                        <div className="flex flex-col items-end gap-1">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wide uppercase flex items-center gap-1 ${
                              isStudentRole
                                ? 'bg-orange-50 text-[#E25C38] border border-orange-200/60'
                                : 'bg-slate-900 text-white'
                            }`}
                          >
                            {isStudentRole ? (
                              <>
                                <GraduationCap className="w-3 h-3" />
                                <span>Student</span>
                              </>
                            ) : (
                              <>
                                <Briefcase className="w-3 h-3 text-amber-400" />
                                <span>Alumni / Pro</span>
                              </>
                            )}
                          </span>

                          {m.graduationYear && (
                            <span className="text-[10px] font-mono text-slate-400 font-bold">
                              Class of {m.graduationYear}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Name & Headline */}
                      <div className="space-y-1">
                        <h3 className="text-base font-bold text-slate-900 flex items-center gap-1.5">
                          <span>{m.name}</span>
                          {isSelf && (
                            <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-1.5 py-0.2 rounded">
                              You
                            </span>
                          )}
                        </h3>
                        <p className="text-xs text-slate-700 font-medium line-clamp-1">{m.headline}</p>
                        <p className="text-xs text-slate-500 font-mono flex items-center gap-1">
                          <span>{m.institution}</span>
                        </p>
                      </div>

                      {/* Bio */}
                      {m.bio && (
                        <p className="text-xs text-slate-600 line-clamp-2 mt-2 leading-relaxed">
                          {m.bio}
                        </p>
                      )}

                      {/* Tech Stack Chips */}
                      {m.skills && m.skills.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-3">
                          {m.skills.slice(0, 4).map((skill) => (
                            <span
                              key={skill}
                              className="px-2 py-0.5 rounded-lg bg-slate-50 border border-slate-100 text-[10px] font-bold text-slate-700"
                            >
                              {skill}
                            </span>
                          ))}
                          {m.skills.length > 4 && (
                            <span className="px-1.5 py-0.5 rounded-lg bg-slate-100 text-[10px] text-slate-500 font-bold">
                              +{m.skills.length - 4}
                            </span>
                          )}
                        </div>
                      )}

                      {!isStudentRole && (
                        <div className="mt-3 p-2.5 rounded-2xl bg-amber-50/80 border border-amber-200/60 flex items-center justify-between text-xs">
                          <div className="flex items-center gap-1.5">
                            <ShieldCheck className="w-4 h-4 text-[#E25C38]" />
                            <span className="font-bold text-slate-800 text-[11px]">Gatekeeper Firewall</span>
                          </div>
                          <span className="font-mono text-[10px] font-bold text-[#E25C38] bg-white px-2 py-0.5 rounded-lg border border-amber-200">
                            Auto-Accept: ≥ 75%
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Bottom: Verified Links & Connect Action */}
                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                      {/* Clickable Social Profiles (Target Blank) */}
                      <div className="flex items-center gap-2">
                        {m.githubUrl && (
                          <a
                            href={m.githubUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="w-7 h-7 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 hover:text-black flex items-center justify-center transition-colors cursor-pointer"
                            title={`GitHub: ${m.githubUsername || m.name}`}
                          >
                            <Github className="w-3.5 h-3.5" />
                          </a>
                        )}

                        {m.linkedinUrl && (
                          <a
                            href={m.linkedinUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="w-7 h-7 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-700 hover:text-sky-900 flex items-center justify-center transition-colors cursor-pointer"
                            title="LinkedIn Profile"
                          >
                            <Linkedin className="w-3.5 h-3.5" />
                          </a>
                        )}

                        {m.portfolioUrl && (
                          <a
                            href={m.portfolioUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="w-7 h-7 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 hover:text-emerald-900 flex items-center justify-center transition-colors cursor-pointer"
                            title="Personal Portfolio / Website"
                          >
                            <Globe className="w-3.5 h-3.5" />
                          </a>
                        )}

                        {m.topProjectUrl && (
                          <a
                            href={m.topProjectUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="w-7 h-7 rounded-xl bg-orange-50 hover:bg-orange-100 text-[#E25C38] flex items-center justify-center transition-colors cursor-pointer"
                            title={`Flagship Project: ${m.topProjectDescription || 'Repository'}`}
                          >
                            <Code2 className="w-3.5 h-3.5" />
                          </a>
                        )}
                      </div>

                      {/* Connection & Send CV Buttons */}
                      <div className="flex items-center gap-2">
                        {isStudent && !isStudentRole && !isSelf && (
                          <button
                            id={`send-cv-btn-${m.id}`}
                            onClick={() =>
                              onSendCvToProfessional?.({
                                name: m.name,
                                role: m.headline || 'Senior Engineering Leader',
                                institution: m.institution,
                                avatarUrl: m.avatarUrl,
                                skills: m.skills,
                              })
                            }
                            className="px-3 py-1.5 rounded-xl bg-orange-50 hover:bg-orange-100 text-[#E25C38] border border-orange-200 text-xs font-bold transition-all shadow-2xs cursor-pointer flex items-center gap-1.5"
                            title="Submit CV for AI ATS Gatekeeper Review"
                          >
                            <FileText className="w-3.5 h-3.5" />
                            <span>Send CV</span>
                          </button>
                        )}

                        {isSelf ? (
                          <span className="text-xs font-bold text-slate-400">Current User</span>
                        ) : isConnected ? (
                          <span className="px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold flex items-center gap-1">
                            <Check className="w-3 h-3" /> Connected
                          </span>
                        ) : isPending ? (
                          <span className="px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 text-xs font-bold flex items-center gap-1">
                            <Clock className="w-3 h-3" /> Pending
                          </span>
                        ) : (
                          <button
                            id={`connect-btn-${m.id}`}
                            onClick={() => handleSendConnection(m)}
                            disabled={connectingMemberId === m.id}
                            className="px-4 py-1.5 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                          >
                            {connectingMemberId === m.id ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : (
                              <Users className="w-3 h-3" />
                            )}
                            <span>Connect</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
