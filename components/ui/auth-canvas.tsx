"use client"

import React, { useEffect, useState } from "react"
import { motion, useAnimation } from "framer-motion"
import { usePathname } from "next/navigation"

// Number of nodes in the blockchain visual
const NUM_NODES = 40;

interface Node {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  pulseDelay: number;
}

export function AuthCanvas({ children }: { children: React.ReactNode }) {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const pathname = usePathname();

  const isSelectRolePage = pathname?.includes("/select-role");

  useEffect(() => {
    // Initialize nodes
    const initialNodes = Array.from({ length: NUM_NODES }).map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      vx: (Math.random() - 0.5) * 0.2,
      vy: (Math.random() - 0.5) * 0.2,
      size: Math.random() * 4 + 2,
      pulseDelay: Math.random() * 2,
    }));
    setNodes(initialNodes);

    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({
        x: (e.clientX / window.innerWidth - 0.5) * 20, // range -10 to 10
        y: (e.clientY / window.innerHeight - 0.5) * 20,
      });
    };
    window.addEventListener("mousemove", handleMouseMove);

    // Animation loop
    let animationFrameId: number;
    const animate = () => {
      setNodes((prevNodes) =>
        prevNodes.map((node) => {
          let newX = node.x + node.vx;
          let newY = node.y + node.vy;

          if (newX < 0 || newX > 100) node.vx *= -1;
          if (newY < 0 || newY > 100) node.vy *= -1;

          return { ...node, x: newX, y: newY };
        })
      );
      animationFrameId = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-background">
      {/* Deep 3D Space Background */}
      <div className="absolute inset-0 z-0 bg-[#020817]" />
      
      {/* Floating Gradient Orbs */}
      <motion.div
        animate={{
          x: mousePos.x * -2,
          y: mousePos.y * -2,
        }}
        transition={{ type: "spring", stiffness: 50, damping: 20 }}
        className="absolute inset-0 z-0 overflow-hidden pointer-events-none"
      >
        <div className="absolute top-[20%] left-[20%] h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-xl bg-primary/20 blur-[120px] mix-blend-screen" />
        <div className="absolute bottom-[20%] right-[10%] h-[600px] w-[600px] translate-x-1/4 translate-y-1/4 rounded-xl bg-blue-500/20 blur-[150px] mix-blend-screen" />
        <div className="absolute top-[60%] left-[50%] h-[400px] w-[400px] -translate-x-1/2 -translate-y-1/2 rounded-xl bg-purple-500/20 blur-[120px] mix-blend-screen" />
      </motion.div>

      {/* Grid pattern / 3D Floor */}
      <div 
        className="absolute inset-0 opacity-[0.15] z-0 pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(to right, hsl(var(--primary)) 1px, transparent 1px), linear-gradient(to bottom, hsl(var(--primary)) 1px, transparent 1px)`,
          backgroundSize: '4rem 4rem',
          transform: 'perspective(1000px) rotateX(60deg) translateY(100px) scale(2.5)',
          transformOrigin: 'bottom',
        }}
      />

      {/* Blockchain Nodes Connection Canvas */}
      <svg className="absolute inset-0 z-0 h-full w-full pointer-events-none">
        <defs>
          <linearGradient id="line-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.1" />
          </linearGradient>
        </defs>
        
        {/* Draw connections between close nodes */}
        {nodes.map((nodeA, i) =>
          nodes.slice(i + 1).map((nodeB, j) => {
            const dx = nodeA.x - nodeB.x;
            const dy = nodeA.y - nodeB.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            if (distance < 20) {
              const opacity = 1 - distance / 20;
              return (
                <line
                  key={`line-${i}-${j}`}
                  x1={`${nodeA.x}%`}
                  y1={`${nodeA.y}%`}
                  x2={`${nodeB.x}%`}
                  y2={`${nodeB.y}%`}
                  stroke="url(#line-gradient)"
                  strokeWidth="1"
                  strokeOpacity={opacity * 0.8}
                />
              );
            }
            return null;
          })
        )}

        {/* Draw Nodes */}
        {nodes.map((node) => (
          <g key={`node-${node.id}`}>
            {/* Glowing aura */}
            <rect
              x={`${node.x}%`}
              y={`${node.y}%`}
              width={node.size * 6}
              height={node.size * 6}
              rx={4}
              transform={`translate(${-node.size * 3}, ${-node.size * 3})`}
              fill="hsl(var(--primary))"
              fillOpacity="0.08"
            >
              <animate
                attributeName="opacity"
                values="0.04;0.12;0.04"
                dur={`${2 + node.pulseDelay}s`}
                repeatCount="indefinite"
              />
            </rect>
            {/* Core node */}
            <rect
              x={`${node.x}%`}
              y={`${node.y}%`}
              width={node.size * 2}
              height={node.size * 2}
              rx={2}
              transform={`translate(${-node.size}, ${-node.size})`}
              fill="currentColor"
              className="text-primary drop-shadow-[0_0_8px_rgba(139,92,246,0.8)]"
            />
          </g>
        ))}
      </svg>

      {/* 3D Container for forms */}
      <div className="relative z-10 flex min-h-screen items-center justify-center p-4">
        <motion.div
          animate={{
            rotateX: mousePos.y * 0, // removed waving effect
            rotateY: mousePos.x * 0,
          }}
          transition={{ type: "spring", stiffness: 75, damping: 25 }}
          className="w-full flex justify-center"
        >
          {/* Keep select-role at its original broad wrapper, but use compact wrapper for login/signup. */}
          <div 
            className={isSelectRolePage
              ? "w-full max-w-[90vw] md:max-w-fit rounded-3xl border border-white/10 bg-black/40 shadow-[0_0_50px_-12px_rgba(139,92,246,0.5)] px-2 py-4 md:px-6 md:py-6"
              : "w-full max-w-[88vw] md:max-w-xl px-0 py-2 md:py-3 lg:py-4"
            }
          >
            {children}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
