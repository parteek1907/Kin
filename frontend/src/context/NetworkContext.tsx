'use client';

import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { 
  CampusNode, 
  TrustEdge, 
  IntentCapsule, 
  PersonaType, 
  ShortestTrustPath, 
  WhatsAppMessage 
} from '@/types';
import { SEED_NODES, SEED_EDGES, SEED_INTENTS } from '@/data/seedGraph';
import { findShortestTrustPath, matchIntentAgainstNodes } from '@/utils/graphAlgorithms';

interface NetworkContextType {
  nodes: CampusNode[];
  edges: TrustEdge[];
  intents: IntentCapsule[];
  activePersonaFilter: PersonaType | 'all' | 'institution-radar';
  activeIntentId: string | null;
  activeIntent: IntentCapsule | null;
  selectedNodeId: string | null;
  selectedNode: CampusNode | null;
  highlightedPath: ShortestTrustPath | null;
  targetVouchNodeId: string | null;
  
  // Drawers and Modals
  isWhatsAppOpen: boolean;
  whatsAppTab: 'intent-drop' | 'vouch-handshake';
  isIngestModalOpen: boolean;
  isRadarModalOpen: boolean;
  isMicroAuditModalOpen: boolean;
  
  // WhatsApp Bridge State
  whatsAppMessages: WhatsAppMessage[];
  vouchStatus: 'idle' | 'requested' | 'vouched' | 'declined';
  lastToast: { title: string; message: string; type?: 'gold' | 'cyan' | 'green' } | null;

  // Actions
  setPersonaFilter: (filter: PersonaType | 'all' | 'institution-radar') => void;
  selectNode: (nodeId: string | null) => void;
  selectIntent: (intentId: string | null) => void;
  broadcastIntent: (query: string, category: any, role: string, compensation?: string) => Promise<IntentCapsule>;
  ingestNewNode: (newNode: CampusNode, trustEdgeTargetId?: string) => void;
  requestWarmVouch: (targetNodeId: string) => void;
  confirmVouch: () => void;
  declineVouch: () => void;
  toggleWhatsApp: (open?: boolean, tab?: 'intent-drop' | 'vouch-handshake') => void;
  sendWhatsAppVoiceNote: (duration: string) => void;
  sendWhatsAppTextMessage: (text: string) => void;
  setIsIngestModalOpen: (open: boolean) => void;
  setIsRadarModalOpen: (open: boolean) => void;
  setIsMicroAuditModalOpen: (open: boolean) => void;
  clearToast: () => void;
  resetIntentFilter: () => void;
  searchIntentsByText: (query: string) => void;
}

const NetworkContext = createContext<NetworkContextType | undefined>(undefined);

export function NetworkProvider({ children }: { children: React.ReactNode }) {
  const [nodes, setNodes] = useState<CampusNode[]>(SEED_NODES);
  const [edges, setEdges] = useState<TrustEdge[]>(SEED_EDGES);
  const [intents, setIntents] = useState<IntentCapsule[]>(SEED_INTENTS);
  
  const [activePersonaFilter, setActivePersonaFilter] = useState<PersonaType | 'all' | 'institution-radar'>('all');
  const [activeIntentId, setActiveIntentId] = useState<string | null>(null);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [targetVouchNodeId, setTargetVouchNodeId] = useState<string | null>(null);

  // Modals & Panels
  const [isWhatsAppOpen, setIsWhatsAppOpen] = useState(false);
  const [whatsAppTab, setWhatsAppTab] = useState<'intent-drop' | 'vouch-handshake'>('vouch-handshake');
  const [isIngestModalOpen, setIsIngestModalOpen] = useState(false);
  const [isRadarModalOpen, setIsRadarModalOpen] = useState(false);
  const [isMicroAuditModalOpen, setIsMicroAuditModalOpen] = useState(false);
  const [vouchStatus, setVouchStatus] = useState<'idle' | 'requested' | 'vouched' | 'declined'>('idle');
  const [lastToast, setLastToast] = useState<{ title: string; message: string; type?: 'gold' | 'cyan' | 'green' } | null>(null);

  // Initial WhatsApp messages
  const [whatsAppMessages, setWhatsAppMessages] = useState<WhatsAppMessage[]>([
    {
      id: 'msg-init-1',
      sender: 'ai',
      senderName: 'Conduit Campus AI Bridge',
      text: '⚡ Conduit Zero-Login WhatsApp Gateway active. Send voice notes or text prompts here to broadcast campus intent capsules or vouch for students.',
      timestamp: '14:40',
      isSystemNotice: true
    }
  ]);

  // Derived active intent
  const activeIntent = useMemo(() => {
    return intents.find(i => i.id === activeIntentId) || null;
  }, [intents, activeIntentId]);

  // Derived selected node
  const selectedNode = useMemo(() => {
    return nodes.find(n => n.id === selectedNodeId) || null;
  }, [nodes, selectedNodeId]);

  // Compute shortest trust path from requester to selected node
  const highlightedPath = useMemo(() => {
    if (!selectedNodeId) return null;
    
    // Default source is Rohan Mehta (Alumnus Founder) or active intent author
    const sourceId = activeIntent ? activeIntent.authorId : 'node-rohan';
    if (sourceId === selectedNodeId) return null;

    return findShortestTrustPath(nodes, edges, sourceId, selectedNodeId);
  }, [nodes, edges, selectedNodeId, activeIntent]);

  const selectNode = (nodeId: string | null) => {
    setSelectedNodeId(nodeId);
    if (nodeId) {
      setTargetVouchNodeId(nodeId);
    }
  };

  const selectIntent = (intentId: string | null) => {
    setActiveIntentId(intentId);
    if (intentId) {
      const intent = intents.find(i => i.id === intentId);
      if (intent && intent.topMatchIds.length > 0) {
        setSelectedNodeId(intent.topMatchIds[0]);
      }
    }
  };

  const resetIntentFilter = () => {
    setActiveIntentId(null);
  };

  const searchIntentsByText = (query: string) => {
    const q = query.toLowerCase();
    const found = intents.find(i => 
      i.query.toLowerCase().includes(q) || 
      i.category.toLowerCase().includes(q) ||
      i.authorName.toLowerCase().includes(q) ||
      i.authorRole.toLowerCase().includes(q)
    );
    if (found) {
      setActiveIntentId(found.id);
    }
  };

  const setPersonaFilter = (filter: PersonaType | 'all' | 'institution-radar') => {
    setActivePersonaFilter(filter);
    if (filter === 'institution-radar') {
      setIsRadarModalOpen(true);
    }
  };

  const toggleWhatsApp = (open?: boolean, tab?: 'intent-drop' | 'vouch-handshake') => {
    if (open !== undefined) {
      setIsWhatsAppOpen(open);
    } else {
      setIsWhatsAppOpen(prev => !prev);
    }
    if (tab) {
      setWhatsAppTab(tab);
    }
  };

  const clearToast = () => setLastToast(null);

  // Request 1-Tap Warm Vouch via WhatsApp
  const requestWarmVouch = (targetId: string) => {
    setTargetVouchNodeId(targetId);
    setVouchStatus('requested');
    const target = nodes.find(n => n.id === targetId);
    const requester = nodes.find(n => n.id === (activeIntent?.authorId || 'node-rohan'));
    const bridge = highlightedPath?.bridgeNode || nodes.find(n => n.id === 'node-dr-sharma');

    // Add message to WhatsApp Bridge simulator
    const newMsg: WhatsAppMessage = {
      id: `vouch-req-${Date.now()}`,
      sender: 'ai',
      senderName: 'Conduit Trust Bridge',
      text: `🔔 *Conduit Warm Trust Bridge Request*\n\nAlumnus Founder *${requester?.name || 'Rohan Mehta'}* wants to connect with your student *${target?.name || 'Parteek Garg'}* (${target?.proofOfWork.verifiedImpactScore}% Impact Score: \`${target?.proofOfWork.repos[0]?.name || 'repo'}\`) for an urgent Fintech sprint.\n\n*Do you vouch for ${target?.name}'s engineering proof-of-work?*`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      interactiveButtons: [
        {
          id: 'btn-vouch',
          label: '✅ [1] Vouch & Auto-Create Intro Group',
          action: 'vouch',
          variant: 'primary'
        },
        {
          id: 'btn-decline',
          label: '❌ [2] Decline',
          action: 'decline',
          variant: 'danger'
        }
      ]
    };

    setWhatsAppMessages(prev => [...prev, newMsg]);
    setWhatsAppTab('vouch-handshake');
    setIsWhatsAppOpen(true);

    setLastToast({
      title: 'Warm Vouch Dispatched',
      message: `WhatsApp handshake notification sent to bridge advisor ${bridge?.name || 'Dr. Sanjeev Sharma'}.`,
      type: 'cyan'
    });
  };

  // Confirm warm vouch from bridge advisor
  const confirmVouch = () => {
    setVouchStatus('vouched');
    const target = nodes.find(n => n.id === targetVouchNodeId) || nodes.find(n => n.id === 'node-parteek')!;
    const requester = nodes.find(n => n.id === (activeIntent?.authorId || 'node-rohan'))!;
    const bridge = highlightedPath?.bridgeNode || nodes.find(n => n.id === 'node-dr-sharma')!;

    // Mutate edge to Solid Glowing Gold
    setEdges(prevEdges => {
      // Find edge between bridge and target or requester and target
      return prevEdges.map(edge => {
        const s = typeof edge.source === 'object' ? (edge.source as any).id : edge.source;
        const t = typeof edge.target === 'object' ? (edge.target as any).id : edge.target;
        
        if (
          (s === bridge.id && t === target.id) ||
          (t === bridge.id && s === target.id) ||
          (s === requester.id && t === bridge.id) ||
          (t === requester.id && s === bridge.id)
        ) {
          return {
            ...edge,
            status: 'vouched',
            weight: 0.99,
            vouchedAt: new Date().toISOString()
          };
        }
        return edge;
      });
    });

    // Also inject direct vouched edge if not already present
    const edgeExists = edges.some(e => {
      const s = typeof e.source === 'object' ? (e.source as any).id : e.source;
      const t = typeof e.target === 'object' ? (e.target as any).id : e.target;
      return (s === requester.id && t === target.id) || (t === requester.id && s === target.id);
    });

    if (!edgeExists) {
      setEdges(prev => [
        ...prev,
        {
          id: `edge-direct-vouched-${Date.now()}`,
          source: requester.id,
          target: target.id,
          relationship: `1-Tap Vouched by ${bridge.name}`,
          weight: 0.98,
          status: 'vouched',
          vouchedAt: new Date().toISOString()
        }
      ]);
    }

    // Add confirmation & group creation message in WhatsApp
    const introMsg: WhatsAppMessage = {
      id: `vouch-conf-${Date.now()}`,
      sender: 'bridge',
      senderName: `${bridge.name} (Faculty Bridge)`,
      text: `✅ *I VOUCH for ${target.name}.* Parteek has written exceptional production-ready deterministic consensus code in my lab. Setting up the 3-person collaboration channel right now.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const groupMsg: WhatsAppMessage = {
      id: `group-created-${Date.now()}`,
      sender: 'ai',
      senderName: 'Conduit Campus AI Bridge',
      text: `🎉 *3-Person WhatsApp Group Created!*\n*Participants:* ${requester.name} + ${bridge.name} + ${target.name}\n\n📋 *Automated Context Brief:*\n• *Target Opportunity:* ${activeIntent?.query || 'Fintech Offline-First Core Protocol Sprint'}\n• *Verified Proof:* \`${target.proofOfWork.repos[0]?.name}\` (Commit: \`${target.proofOfWork.repos[0]?.recentCommitHash}\`)\n• *Bridge Verified:* ${bridge.name} confirmed laboratory and codebase competency.\n\nYou may now converse freely!`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isSystemNotice: true
    };

    setWhatsAppMessages(prev => [...prev, introMsg, groupMsg]);

    // Trigger celebration toast
    setLastToast({
      title: 'Warm Bridge Verified & Solid Gold!',
      message: `3-Person WhatsApp Intro Group Created (${requester.name} + ${bridge.name} + ${target.name}) with Technical Context Brief.`,
      type: 'gold'
    });
  };

  const declineVouch = () => {
    setVouchStatus('declined');
    const declineMsg: WhatsAppMessage = {
      id: `vouch-dec-${Date.now()}`,
      sender: 'bridge',
      senderName: 'Dr. Sanjeev Sharma (Faculty Bridge)',
      text: `❌ Warm vouch declined for this specific engagement.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setWhatsAppMessages(prev => [...prev, declineMsg]);
  };

  // Broadcast a new natural language intent capsule
  const broadcastIntent = async (query: string, category: any, role: string, compensation?: string): Promise<IntentCapsule> => {
    // Run matching algorithm
    const matchResults = matchIntentAgainstNodes(query, nodes);
    const topMatchIds = matchResults.slice(0, 3).map(m => m.nodeId);
    const evidenceList = matchResults.slice(0, 3).map(m => m.evidence);

    const newCapsule: IntentCapsule = {
      id: `intent-${Date.now()}`,
      authorId: 'node-rohan',
      authorName: 'Rohan Mehta',
      authorRole: role || 'Founder @ NexaPay (YC W22)',
      authorPersona: 'founder',
      authorAvatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
      category: category || 'Fintech',
      query,
      compensation: compensation || 'Competitive Stipend + Equity',
      duration: '4-6 Weeks',
      createdAt: new Date().toISOString(),
      expiresIn: '48h remaining',
      status: 'active',
      topMatchIds: topMatchIds.length > 0 ? topMatchIds : ['node-parteek', 'node-nipun'],
      evidenceList
    };

    setIntents(prev => [newCapsule, ...prev]);
    setActiveIntentId(newCapsule.id);
    if (newCapsule.topMatchIds.length > 0) {
      setSelectedNodeId(newCapsule.topMatchIds[0]);
    }

    setLastToast({
      title: 'Intent Capsule Broadcasted',
      message: `Matched ${matchResults.length} campus nodes with verified code citations.`,
      type: 'green'
    });

    return newCapsule;
  };

  // Ingest a newly verified node
  const ingestNewNode = (newNode: CampusNode, trustEdgeTargetId?: string) => {
    setNodes(prev => [newNode, ...prev]);
    
    // Connect edge if target provided
    if (trustEdgeTargetId) {
      const newEdge: TrustEdge = {
        id: `edge-ingest-${Date.now()}`,
        source: newNode.id,
        target: trustEdgeTargetId,
        relationship: 'Verified Academic & Codebase Link',
        weight: 0.92,
        status: 'verified',
        vouchedAt: new Date().toISOString()
      };
      setEdges(prev => [...prev, newEdge]);
    }

    setSelectedNodeId(newNode.id);
    setLastToast({
      title: 'Node Ingested & Verified!',
      message: `${newNode.name} added to force-directed graph with ${newNode.proofOfWork.totalCommits} verified commits.`,
      type: 'cyan'
    });
  };

  // Send voice note in WhatsApp simulator
  const sendWhatsAppVoiceNote = (duration: string) => {
    const userVoiceMsg: WhatsAppMessage = {
      id: `voice-${Date.now()}`,
      sender: 'user',
      senderName: 'Rohan Mehta (YC Alum)',
      text: `🎤 Voice note recorded (${duration}): "Hey Conduit, I'm an alumnus founder. Need a student who has actually built a RAG pipeline with vector search for an urgent sprint."`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isVoice: true,
      audioDuration: duration
    };

    setWhatsAppMessages(prev => [...prev, userVoiceMsg]);

    // Fast AI response after 1.2 seconds
    setTimeout(() => {
      // Find top matches
      const query = 'Need a student who has actually built a RAG pipeline with vector search for an urgent sprint';
      const matches = matchIntentAgainstNodes(query, nodes);
      const top2 = matches.slice(0, 2);

      const topStudents = top2.map(m => {
        const student = nodes.find(n => n.id === m.nodeId)!;
        return {
          nodeId: student.id,
          name: student.name,
          role: student.role,
          score: m.score,
          topRepo: m.evidence.repo,
          citation: m.evidence.quote
        };
      });

      const aiReply: WhatsAppMessage = {
        id: `ai-reply-${Date.now()}`,
        sender: 'ai',
        senderName: 'Conduit Campus AI Bridge',
        text: `⚡ *Voice Intent Processed & Matched!* Broadcasted live capsule to campus graph.\n\nFound 2 student nodes with verified production commits matching your voice prompt:`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        cards: topStudents,
        interactiveButtons: [
          {
            id: 'btn-request-intro',
            label: '🔗 Request Warm Intro to #1 Match (Parteek)',
            action: 'request-warm-parteek',
            variant: 'primary'
          }
        ]
      };

      setWhatsAppMessages(prev => [...prev, aiReply]);
      
      // Also broadcast intent capsule to the web graph
      broadcastIntent(query, 'AI / RAG', 'Founder @ NexaPay (YC W22)', '₹1,20,000 / month');
    }, 1200);
  };

  const sendWhatsAppTextMessage = (text: string) => {
    if (!text.trim()) return;

    const userMsg: WhatsAppMessage = {
      id: `user-msg-${Date.now()}`,
      sender: 'user',
      senderName: 'Rohan Mehta (YC Alum)',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setWhatsAppMessages(prev => [...prev, userMsg]);

    setTimeout(() => {
      const matches = matchIntentAgainstNodes(text, nodes);
      const topMatches = matches.slice(0, 2).map(m => {
        const student = nodes.find(n => n.id === m.nodeId)!;
        return {
          nodeId: student.id,
          name: student.name,
          role: student.role,
          score: m.score,
          topRepo: m.evidence.repo,
          citation: m.evidence.quote
        };
      });

      const reply: WhatsAppMessage = {
        id: `reply-${Date.now()}`,
        sender: 'ai',
        senderName: 'Conduit Campus AI Bridge',
        text: `⚡ Ingested intent: "${text}". Found ${matches.length} verified nodes with code evidence:`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        cards: topMatches
      };

      setWhatsAppMessages(prev => [...prev, reply]);
      broadcastIntent(text, 'Fintech', 'Alumnus Founder', 'Competitive Pay');
    }, 1000);
  };

  return (
    <NetworkContext.Provider
      value={{
        nodes,
        edges,
        intents,
        activePersonaFilter,
        activeIntentId,
        activeIntent,
        selectedNodeId,
        selectedNode,
        highlightedPath,
        targetVouchNodeId,
        isWhatsAppOpen,
        whatsAppTab,
        isIngestModalOpen,
        isRadarModalOpen,
        isMicroAuditModalOpen,
        whatsAppMessages,
        vouchStatus,
        lastToast,
        setPersonaFilter,
        selectNode,
        selectIntent,
        broadcastIntent,
        ingestNewNode,
        requestWarmVouch,
        confirmVouch,
        declineVouch,
        toggleWhatsApp,
        sendWhatsAppVoiceNote,
        sendWhatsAppTextMessage,
        setIsIngestModalOpen,
        setIsRadarModalOpen,
        setIsMicroAuditModalOpen,
        clearToast,
        resetIntentFilter,
        searchIntentsByText
      }}
    >
      {children}
    </NetworkContext.Provider>
  );
}

export function useNetwork() {
  const context = useContext(NetworkContext);
  if (!context) {
    throw new Error('useNetwork must be used within a NetworkProvider');
  }
  return context;
}
