import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, CheckCircle2, Award, FileSearch, ShieldCheck } from 'lucide-react';

interface Interactive3DLensProps {
  onExploreDemo?: () => void;
}

export const Interactive3DLens: React.FC<Interactive3DLensProps> = ({ onExploreDemo }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isMobile) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    // Normalized tilt angles
    setTilt({
      x: -(y / (rect.height / 2)) * 14,
      y: (x / (rect.width / 2)) * 14,
    });
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setTilt({ x: 0, y: 0 });
  };

  return (
    <div
      ref={containerRef}
      className="lens-viewport"
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
    >
      <div
        className="lens-assembly"
        style={{
          transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
          transition: isHovered ? 'transform 0.08s ease-out' : 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        {/* Orbiting Aperture Rings */}
        <div className="lens-ring lens-ring-outer" />
        <div className="lens-ring lens-ring-mid" />
        <div className="lens-ring lens-ring-inner" />

        {/* Core Dimensional Aperture */}
        <div className="lens-aperture-core">
          <div
            style={{
              width: '50px',
              height: '50px',
              borderRadius: '14px',
              background: 'linear-gradient(135deg, #087EA4 0%, #8B5CF6 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFFFFF',
              boxShadow: '0 4px 16px rgba(139, 92, 246, 0.35)',
              marginBottom: '10px',
            }}
          >
            <Sparkles size={24} color="#A5F3FC" />
          </div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-bright)' }}>
            TalentLens Aperture
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '2px', maxWidth: '170px' }}>
            Skill vector alignment & verification
          </div>
          <div
            style={{
              marginTop: '10px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '0.7rem',
              fontWeight: 700,
              color: '#7C3AED',
              backgroundColor: '#F5F3FF',
              border: '1px solid #DDD6FE',
              padding: '2px 8px',
              borderRadius: '999px',
            }}
          >
            <Sparkles size={12} /> Intelligent Candidate Matching
          </div>
        </div>

        {/* Floating Skill Nodes around Aperture with Multi-Color accents */}
        <div
          className="floating-skill-node"
          style={{
            top: '-15px',
            left: '20px',
            transform: `translateZ(${isHovered ? 40 : 20}px)`,
          }}
        >
          <span style={{ color: '#7C3AED' }}>✦</span> Strategic Leadership
        </div>

        <div
          className="floating-skill-node"
          style={{
            top: '40px',
            right: '-30px',
            transform: `translateZ(${isHovered ? 50 : 25}px)`,
          }}
        >
          <span style={{ color: '#0891B2' }}>●</span> Data Analytics
        </div>

        <div
          className="floating-skill-node"
          style={{
            bottom: '20px',
            right: '-20px',
            transform: `translateZ(${isHovered ? 45 : 20}px)`,
          }}
        >
          <span style={{ color: '#059669' }}>✦</span> Talent Assessment
        </div>

        <div
          className="floating-skill-node"
          style={{
            bottom: '-15px',
            left: '30px',
            transform: `translateZ(${isHovered ? 35 : 15}px)`,
          }}
        >
          <span style={{ color: '#087EA4' }}>●</span> Project Delivery
        </div>

        <div
          className="floating-skill-node"
          style={{
            top: '140px',
            left: '-45px',
            transform: `translateZ(${isHovered ? 30 : 10}px)`,
          }}
        >
          <span style={{ color: '#DB2777' }}>✦</span> Skill Alignment
        </div>

        {/* Depth Candidate Profile Card #1: Teal Accent */}
        <div
          className="candidate-depth-card"
          style={{
            top: '-35px',
            right: '30px',
            transform: `translateZ(${isHovered ? 60 : 30}px) scale(0.92)`,
            borderColor: '#A7F3D0',
            background: 'linear-gradient(135deg, #FFFFFF 0%, #DDF7EA 100%)',
          }}
        >
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #059669 0%, #087EA4 100%)',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: '0.85rem',
            }}
          >
            AV
          </div>
          <div>
            <div className="candidate-name" style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-bright)' }}>Aria Vance</div>
            <div style={{ fontSize: '0.7rem', color: '#059669', fontWeight: 600 }}>8/8 Skills Matched</div>
          </div>
        </div>

        {/* Depth Candidate Profile Card #2: Purple Accent */}
        <div
          className="candidate-depth-card"
          style={{
            bottom: '-30px',
            right: '40px',
            transform: `translateZ(${isHovered ? 50 : 25}px) scale(0.88)`,
            borderColor: '#DDD6FE',
            background: 'linear-gradient(135deg, #FFFFFF 0%, #EEE7FF 100%)',
          }}
        >
          <div
            style={{
              width: '30px',
              height: '30px',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #8B5CF6 0%, #087EA4 100%)',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: '0.8rem',
            }}
          >
            LC
          </div>
          <div>
            <div className="candidate-name" style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-bright)' }}>Liam Chen</div>
            <div className="job-title" style={{ fontSize: '0.68rem', color: '#6D28D9', fontWeight: 500 }}>Operations Director</div>
          </div>
        </div>
      </div>
    </div>
  );
};
