'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { useNetwork } from '@/context/NetworkContext';
import { CampusNode, TrustEdge, PersonaType } from '@/types';
import { ZoomIn, ZoomOut, RotateCcw, Crosshair, Sparkles, ShieldCheck } from 'lucide-react';

interface Particle {
  sourceId: string;
  targetId: string;
  progress: number; // 0 to 1
  speed: number;
  color: string;
  size: number;
}

const PERSONA_COLORS: Record<PersonaType, { fill: string; stroke: string; glow: string }> = {
  student: { fill: '#06B6D4', stroke: '#22D3EE', glow: 'rgba(6, 182, 212, 0.6)' },
  alumni: { fill: '#8B5CF6', stroke: '#A78BFA', glow: 'rgba(139, 92, 246, 0.6)' },
  founder: { fill: '#10B981', stroke: '#34D399', glow: 'rgba(16, 185, 129, 0.6)' },
  faculty: { fill: '#F59E0B', stroke: '#FBBF24', glow: 'rgba(245, 158, 11, 0.6)' },
  recruiter: { fill: '#F43F5E', stroke: '#FB7185', glow: 'rgba(244, 63, 94, 0.6)' },
  institution: { fill: '#6366F1', stroke: '#818CF8', glow: 'rgba(99, 102, 241, 0.6)' },
};

export default function LivingNetworkCanvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const {
    nodes,
    edges,
    activePersonaFilter,
    activeIntent,
    selectedNodeId,
    selectNode,
    highlightedPath,
    vouchStatus
  } = useNetwork();

  // Transform / Camera State
  const [transform, setTransform] = useState<{ x: number; y: number; k: number }>({ x: 0, y: 0, k: 0.95 });
  const [hoveredNode, setHoveredNode] = useState<CampusNode | null>(null);
  const [mousePos, setMousePos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Physics simulation state (mutable for 60fps performance)
  const simNodesRef = useRef<(CampusNode & { x: number; y: number; vx: number; vy: number; radius: number })[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const isDraggingRef = useRef<boolean>(false);
  const draggedNodeRef = useRef<any | null>(null);
  const dragStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const isPanningRef = useRef<boolean>(false);
  const panStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const animFrameRef = useRef<number | null>(null);

  // Initialize or update node positions
  useEffect(() => {
    const existingMap = new Map(simNodesRef.current.map(n => [n.id, n]));
    const width = containerRef.current?.clientWidth || 1200;
    const height = containerRef.current?.clientHeight || 800;

    const newSimNodes = nodes.map((node, i) => {
      const existing = existingMap.get(node.id);
      if (existing) {
        return {
          ...node,
          x: existing.x,
          y: existing.y,
          vx: existing.vx,
          vy: existing.vy,
          radius: Math.max(16, Math.min(34, (node.proofOfWork?.verifiedImpactScore || 85) / 3))
        };
      }

      // Arrange initially in circular campus clusters based on persona
      const angle = (i / nodes.length) * 2 * Math.PI;
      const personaOffsets: Record<PersonaType, number> = {
        student: 220,
        faculty: 120,
        founder: 280,
        alumni: 320,
        recruiter: 360,
        institution: 40
      };
      const dist = personaOffsets[node.persona] || 200;
      const jitter = (Math.random() - 0.5) * 40;

      return {
        ...node,
        x: width / 2 + Math.cos(angle) * (dist + jitter),
        y: height / 2 + Math.sin(angle) * (dist + jitter),
        vx: 0,
        vy: 0,
        radius: Math.max(16, Math.min(34, (node.proofOfWork?.verifiedImpactScore || 85) / 3))
      };
    });

    simNodesRef.current = newSimNodes;

    // Center camera initially
    setTransform(prev => ({ ...prev, x: width * 0.05, y: height * 0.05 }));
  }, [nodes]);

  // Seed travelling particles along edges
  useEffect(() => {
    const particles: Particle[] = [];
    edges.forEach((edge, idx) => {
      const sId = typeof edge.source === 'object' ? (edge.source as any).id : edge.source;
      const tId = typeof edge.target === 'object' ? (edge.target as any).id : edge.target;
      const isVouched = edge.status === 'vouched';
      const count = isVouched ? 3 : 1;

      for (let c = 0; c < count; c++) {
        particles.push({
          sourceId: sId,
          targetId: tId,
          progress: (c / count + Math.random() * 0.2) % 1,
          speed: isVouched ? 0.009 : 0.004,
          color: isVouched ? '#FACC15' : '#38BDF8',
          size: isVouched ? 3.5 : 2.2
        });
      }
    });
    particlesRef.current = particles;
  }, [edges]);

  // Handle focus camera on selected node or path
  useEffect(() => {
    if (!selectedNodeId || !containerRef.current) return;
    const target = simNodesRef.current.find(n => n.id === selectedNodeId);
    if (!target) return;

    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;

    // Smoothly shift transform towards node
    setTransform(prev => ({
      ...prev,
      x: width / 2 - target.x * prev.k,
      y: height / 2 - target.y * prev.k
    }));
  }, [selectedNodeId]);

  // Main Canvas Render & Physics Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let pulseTime = 0;

    const render = () => {
      pulseTime += 0.03;
      const width = canvas.width;
      const height = canvas.height;

      // 1. Run 1 step of lightweight force physics
      const simNodes = simNodesRef.current;
      const nodeMap = new Map<string, any>();
      simNodes.forEach(n => nodeMap.set(n.id, n));

      // Node-Node Repulsion
      for (let i = 0; i < simNodes.length; i++) {
        const a = simNodes[i];
        for (let j = i + 1; j < simNodes.length; j++) {
          const b = simNodes[j];
          const dx = b.x - a.x;
          const dy = b.y - a.y;
          const distSq = dx * dx + dy * dy || 1;
          const minDist = a.radius + b.radius + 35;

          if (distSq < minDist * minDist * 4) {
            const dist = Math.sqrt(distSq);
            const force = (minDist * minDist) / (distSq * 8);
            const fx = (dx / dist) * force;
            const fy = (dy / dist) * force;
            if (draggedNodeRef.current !== a) {
              a.vx -= fx * 0.15;
              a.vy -= fy * 0.15;
            }
            if (draggedNodeRef.current !== b) {
              b.vx += fx * 0.15;
              b.vy += fy * 0.15;
            }
          }
        }

        // Center gravity
        const cdx = width / 2 - a.x;
        const cdy = height / 2 - a.y;
        if (draggedNodeRef.current !== a) {
          a.vx += cdx * 0.0003;
          a.vy += cdy * 0.0003;
          // Velocity damping
          a.vx *= 0.88;
          a.vy *= 0.88;
          a.x += a.vx;
          a.y += a.vy;
        }
      }

      // Edge Spring Attraction
      edges.forEach(edge => {
        const sId = typeof edge.source === 'object' ? (edge.source as any).id : edge.source;
        const tId = typeof edge.target === 'object' ? (edge.target as any).id : edge.target;
        const a = nodeMap.get(sId);
        const b = nodeMap.get(tId);
        if (!a || !b) return;

        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        const desiredDist = edge.status === 'vouched' ? 140 : 180;
        const delta = dist - desiredDist;
        const springK = 0.0018 * (edge.weight || 0.8);

        const fx = (dx / dist) * delta * springK;
        const fy = (dy / dist) * delta * springK;

        if (draggedNodeRef.current !== a) {
          a.vx += fx;
          a.vy += fy;
        }
        if (draggedNodeRef.current !== b) {
          b.vx -= fx;
          b.vy -= fy;
        }
      });

      // 2. Clear canvas with warm studio tone
      ctx.fillStyle = '#EFECE5';
      ctx.fillRect(0, 0, width, height);

      // Draw subtle background grid
      ctx.save();
      ctx.translate(transform.x, transform.y);
      ctx.scale(transform.k, transform.k);

      ctx.strokeStyle = 'rgba(0, 0, 0, 0.04)';
      ctx.lineWidth = 1;
      const gridSize = 80;
      const startX = -transform.x / transform.k - 200;
      const endX = (width - transform.x) / transform.k + 200;
      const startY = -transform.y / transform.k - 200;
      const endY = (height - transform.y) / transform.k + 200;

      ctx.beginPath();
      for (let x = Math.floor(startX / gridSize) * gridSize; x <= endX; x += gridSize) {
        ctx.moveTo(x, startY);
        ctx.lineTo(x, endY);
      }
      for (let y = Math.floor(startY / gridSize) * gridSize; y <= endY; y += gridSize) {
        ctx.moveTo(startX, y);
        ctx.lineTo(endX, y);
      }
      ctx.stroke();

      // Check highlighted path edges
      const pathEdgeKeys = new Set<string>();
      if (highlightedPath && highlightedPath.hops.length > 0) {
        highlightedPath.hops.forEach(hop => {
          pathEdgeKeys.add(`${hop.fromNode.id}->${hop.toNode.id}`);
          pathEdgeKeys.add(`${hop.toNode.id}->${hop.fromNode.id}`);
        });
      }

      // Check matched nodes if an intent is active
      const matchedNodeIds = new Set(activeIntent ? activeIntent.topMatchIds : []);

      // 3. Draw Edges
      edges.forEach(edge => {
        const sId = typeof edge.source === 'object' ? (edge.source as any).id : edge.source;
        const tId = typeof edge.target === 'object' ? (edge.target as any).id : edge.target;
        const a = nodeMap.get(sId);
        const b = nodeMap.get(tId);
        if (!a || !b) return;

        const isPathEdge = pathEdgeKeys.has(`${sId}->${tId}`) || pathEdgeKeys.has(`${tId}->${sId}`);
        const isVouched = edge.status === 'vouched';

        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);

        if (isPathEdge) {
          // Highlighted Trust Path
          ctx.strokeStyle = isVouched ? '#FACC15' : '#F59E0B';
          ctx.lineWidth = 4;
          ctx.shadowColor = isVouched ? 'rgba(250, 204, 21, 0.8)' : 'rgba(245, 158, 11, 0.6)';
          ctx.shadowBlur = 15;
          ctx.stroke();
          ctx.shadowBlur = 0; // reset
        } else if (isVouched) {
          // Solid Glowing Gold Edge
          ctx.strokeStyle = 'rgba(250, 204, 21, 0.65)';
          ctx.lineWidth = 2.5;
          ctx.shadowColor = 'rgba(250, 204, 21, 0.5)';
          ctx.shadowBlur = 10;
          ctx.stroke();
          ctx.shadowBlur = 0;
        } else {
          // Default subtle edge
          let edgeAlpha = 0.15;
          if (activeIntent && (!matchedNodeIds.has(sId) || !matchedNodeIds.has(tId))) {
            edgeAlpha = 0.04;
          }
          ctx.strokeStyle = `rgba(0, 0, 0, ${edgeAlpha})`;
          ctx.lineWidth = 1.2;
          ctx.stroke();
        }
      });

      // 4. Draw Traveling Signal Particles along Edges
      particlesRef.current.forEach(p => {
        p.progress += p.speed;
        if (p.progress >= 1) p.progress = 0;

        const a = nodeMap.get(p.sourceId);
        const b = nodeMap.get(p.targetId);
        if (!a || !b) return;

        const px = a.x + (b.x - a.x) * p.progress;
        const py = a.y + (b.y - a.y) * p.progress;

        const isPathEdge = pathEdgeKeys.has(`${p.sourceId}->${p.targetId}`) || pathEdgeKeys.has(`${p.targetId}->${p.sourceId}`);

        ctx.beginPath();
        ctx.arc(px, py, isPathEdge ? p.size * 1.5 : p.size, 0, Math.PI * 2);
        ctx.fillStyle = isPathEdge ? '#FACC15' : p.color;
        ctx.shadowColor = isPathEdge ? 'rgba(250, 204, 21, 0.9)' : p.color;
        ctx.shadowBlur = isPathEdge ? 12 : 6;
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      // 5. Draw Nodes
      simNodes.forEach(node => {
        const isSelected = selectedNodeId === node.id;
        const isMatched = matchedNodeIds.has(node.id);
        const isDimmed = (activePersonaFilter !== 'all' && activePersonaFilter !== 'institution-radar' && node.persona !== activePersonaFilter) ||
                         (activeIntent && !isMatched && !isSelected);

        const colors = PERSONA_COLORS[node.persona] || PERSONA_COLORS.student;
        const baseRadius = node.radius;

        ctx.save();
        ctx.translate(node.x, node.y);

        // Opacity based on filter state
        if (isDimmed) {
          ctx.globalAlpha = 0.15;
        } else {
          ctx.globalAlpha = 1.0;
        }

        // Draw Pulsing Ring for Matched or Selected Nodes
        if (isMatched || isSelected) {
          const pulseRadius = baseRadius + 8 + Math.sin(pulseTime * 2) * 5;
          ctx.beginPath();
          ctx.arc(0, 0, pulseRadius, 0, Math.PI * 2);
          ctx.strokeStyle = isSelected ? '#FACC15' : colors.stroke;
          ctx.lineWidth = isSelected ? 2.5 : 2;
          ctx.shadowColor = isSelected ? 'rgba(250, 204, 21, 0.8)' : colors.glow;
          ctx.shadowBlur = 20;
          ctx.stroke();
          ctx.shadowBlur = 0;
        }

        // Outer Glow
        ctx.beginPath();
        ctx.arc(0, 0, baseRadius + 3, 0, Math.PI * 2);
        ctx.fillStyle = colors.glow;
        ctx.fill();

        // Node Body
        ctx.beginPath();
        ctx.arc(0, 0, baseRadius, 0, Math.PI * 2);
        ctx.fillStyle = '#FFFFFF';
        ctx.fill();
        ctx.lineWidth = isSelected ? 3 : 2;
        ctx.strokeStyle = isSelected ? '#E25C38' : colors.stroke;
        ctx.stroke();

        // Inner Avatar / Persona Ring
        ctx.beginPath();
        ctx.arc(0, 0, baseRadius - 4, 0, Math.PI * 2);
        ctx.fillStyle = colors.fill;
        ctx.globalAlpha = isDimmed ? 0.15 : 0.85;
        ctx.fill();

        // Node Initials or Text Label
        ctx.globalAlpha = isDimmed ? 0.2 : 1.0;
        ctx.fillStyle = '#141815';
        ctx.font = `700 ${Math.max(10, Math.floor(baseRadius * 0.65))}px Inter, sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        const initials = node.name.split(' ').map(n => n[0]).slice(0, 2).join('');
        ctx.fillText(initials, 0, 0);

        // Verification Badge Pip
        if (node.proofOfWork?.repos?.length > 0) {
          ctx.beginPath();
          ctx.arc(baseRadius * 0.7, -baseRadius * 0.7, 5, 0, Math.PI * 2);
          ctx.fillStyle = '#10B981';
          ctx.lineWidth = 1.5;
          ctx.strokeStyle = '#FFFFFF';
          ctx.fill();
          ctx.stroke();
        }

        // Label below node
        if (!isDimmed || isMatched || isSelected) {
          ctx.font = '600 11px Inter, sans-serif';
          ctx.fillStyle = isSelected ? '#E25C38' : '#141815';
          ctx.textAlign = 'center';
          ctx.fillText(node.name, 0, baseRadius + 14);

          // Sub-label (Role / Score)
          ctx.font = '400 9px "JetBrains Mono", monospace';
          ctx.fillStyle = colors.stroke;
          if (isMatched && activeIntent) {
            const match = activeIntent.evidenceList?.find(e => e.nodeId === node.id);
            ctx.fillText(`${match ? match.score : 96}% MATCH`, 0, baseRadius + 26);
          } else {
            ctx.fillText(`${node.proofOfWork?.verifiedImpactScore || 90} PTS`, 0, baseRadius + 26);
          }
        }

        ctx.restore();
      });

      ctx.restore();

      animFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [edges, transform, activePersonaFilter, activeIntent, selectedNodeId, highlightedPath]);

  // Window resize handler
  useEffect(() => {
    const handleResize = () => {
      if (!canvasRef.current || !containerRef.current) return;
      canvasRef.current.width = containerRef.current.clientWidth;
      canvasRef.current.height = containerRef.current.clientHeight;
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Mouse / Touch Interaction Handlers
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    // Convert screen coordinates to world coordinates
    const worldX = (mouseX - transform.x) / transform.k;
    const worldY = (mouseY - transform.y) / transform.k;

    // Find clicked node
    const clickedNode = simNodesRef.current.find(node => {
      const dx = node.x - worldX;
      const dy = node.y - worldY;
      return Math.sqrt(dx * dx + dy * dy) <= node.radius + 6;
    });

    if (clickedNode) {
      isDraggingRef.current = true;
      draggedNodeRef.current = clickedNode;
      dragStartRef.current = { x: worldX - clickedNode.x, y: worldY - clickedNode.y };
      selectNode(clickedNode.id);
    } else {
      isPanningRef.current = true;
      panStartRef.current = { x: mouseX - transform.x, y: mouseY - transform.y };
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    setMousePos({ x: e.clientX, y: e.clientY });

    const worldX = (mouseX - transform.x) / transform.k;
    const worldY = (mouseY - transform.y) / transform.k;

    if (isDraggingRef.current && draggedNodeRef.current) {
      draggedNodeRef.current.x = worldX - dragStartRef.current.x;
      draggedNodeRef.current.y = worldY - dragStartRef.current.y;
      draggedNodeRef.current.vx = 0;
      draggedNodeRef.current.vy = 0;
    } else if (isPanningRef.current) {
      setTransform(prev => ({
        ...prev,
        x: mouseX - panStartRef.current.x,
        y: mouseY - panStartRef.current.y
      }));
    } else {
      // Hover detection
      const hovered = simNodesRef.current.find(node => {
        const dx = node.x - worldX;
        const dy = node.y - worldY;
        return Math.sqrt(dx * dx + dy * dy) <= node.radius + 6;
      });
      setHoveredNode(hovered || null);
    }
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
    draggedNodeRef.current = null;
    isPanningRef.current = false;
  };

  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 1.08 : 0.92;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    setTransform(prev => {
      const newK = Math.max(0.35, Math.min(2.8, prev.k * zoomFactor));
      return {
        k: newK,
        x: mouseX - (mouseX - prev.x) * (newK / prev.k),
        y: mouseY - (mouseY - prev.y) * (newK / prev.k)
      };
    });
  };

  const resetCamera = () => {
    if (!containerRef.current) return;
    setTransform({
      x: containerRef.current.clientWidth * 0.05,
      y: containerRef.current.clientHeight * 0.05,
      k: 0.95
    });
  };

  return (
    <div ref={containerRef} className="relative w-full h-full overflow-hidden bg-[#EFECE5]">
      <canvas
        ref={canvasRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onWheel={handleWheel}
        className="w-full h-full cursor-grab active:cursor-grabbing block"
      />

      {/* Floating Canvas Controls (Bottom Left) */}
      <div className="absolute bottom-6 left-6 z-20 flex items-center space-x-1 p-1 rounded-full bg-white/90 backdrop-blur-md shadow-md border border-black/10">
        <button
          onClick={() => setTransform(t => ({ ...t, k: Math.min(2.8, t.k * 1.2) }))}
          className="p-2 rounded-full text-zinc-600 hover:text-black hover:bg-black/5 transition-colors"
          title="Zoom In"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          onClick={() => setTransform(t => ({ ...t, k: Math.max(0.35, t.k * 0.8) }))}
          className="p-2 rounded-full text-zinc-600 hover:text-black hover:bg-black/5 transition-colors"
          title="Zoom Out"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <div className="w-[1px] h-4 bg-black/10" />
        <button
          onClick={resetCamera}
          className="p-2 rounded-full text-zinc-600 hover:text-black hover:bg-black/5 transition-colors"
          title="Reset View"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* Live Graph Legend / Key (Top Left below nav) */}
      <div className="absolute top-20 left-6 z-20 p-3.5 rounded-2xl bg-white/90 backdrop-blur-md border border-black/10 shadow-sm pointer-events-none hidden md:block text-left">
        <div className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 mb-2 font-bold">
          Node Taxonomy & Verified Radii
        </div>
        <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-[11px] font-medium">
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#06B6D4] shadow-xs"></span>
            <span className="text-zinc-700">Student Builder</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#10B981] shadow-xs"></span>
            <span className="text-zinc-700">Founder / YC</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#8B5CF6] shadow-xs"></span>
            <span className="text-zinc-700">Alumni Engineer</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#F59E0B] shadow-xs"></span>
            <span className="text-zinc-700">Faculty Advisor</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#F43F5E] shadow-xs"></span>
            <span className="text-zinc-700">Tech Recruiter</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#6366F1] shadow-xs"></span>
            <span className="text-zinc-700">Campus Institution</span>
          </div>
        </div>
        <div className="mt-2.5 pt-2 border-t border-white/10 flex items-center space-x-2 text-[10px] font-mono text-amber-300">
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
          <span>Solid Gold Edge: Active Vouched Trust Bridge</span>
        </div>
      </div>

      {/* Hover Tooltip Card */}
      {hoveredNode && !isDraggingRef.current && (
        <div
          className="fixed z-50 pointer-events-none p-3 rounded-xl glass-panel border border-white/20 shadow-2xl text-xs max-w-xs transition-opacity duration-150"
          style={{
            left: Math.min(window.innerWidth - 300, mousePos.x + 18),
            top: Math.min(window.innerHeight - 150, mousePos.y - 30)
          }}
        >
          <div className="flex items-center space-x-2 mb-1.5">
            <span
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: PERSONA_COLORS[hoveredNode.persona]?.fill || '#06B6D4' }}
            />
            <span className="font-bold text-white text-sm">{hoveredNode.name}</span>
            <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-white/10 text-slate-300">
              {hoveredNode.persona.toUpperCase()}
            </span>
          </div>
          <div className="text-slate-300 text-[11px] mb-2">{hoveredNode.role}</div>
          <div className="grid grid-cols-2 gap-2 text-[10px] font-mono pt-2 border-t border-white/10 text-slate-400">
            <div>
              <span className="text-slate-500 block">IMPACT SCORE:</span>
              <span className="text-cyan-400 font-bold">{hoveredNode.proofOfWork?.verifiedImpactScore || 85} / 100</span>
            </div>
            <div>
              <span className="text-slate-500 block">TOTAL COMMITS:</span>
              <span className="text-emerald-400 font-bold">{hoveredNode.proofOfWork?.totalCommits || 0}</span>
            </div>
          </div>
          {hoveredNode.proofOfWork?.repos?.[0] && (
            <div className="mt-2 text-[10px] font-mono text-slate-400 truncate">
              <span className="text-slate-500">Top Repo:</span> {hoveredNode.proofOfWork.repos[0].name}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
