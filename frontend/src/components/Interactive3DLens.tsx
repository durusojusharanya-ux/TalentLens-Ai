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
              width: '48px',
              height: '48px',
              borderRadius: '14px',
              backgroundColor: 'var(--primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFFFFF',
              boxShadow: '0 4px 14px var(--primary-glow)',
              marginBottom: '10px',
            }}
          >
            <Sparkles size={24} />
          </div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-bright)' }}>
            TalentLens Aperture
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '2px', maxWidth: '170px' }}>
            TF-IDF vector alignment & skill verification
          </div>
          <div
            style={{
              marginTop: '10px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '0.7rem',
              fontWeight: 700,
              color: 'var(--primary)',
              backgroundColor: 'var(--badge-strong-bg)',
              padding: '2px 8px',
              borderRadius: '999px',
            }}
          >
            <ShieldCheck size={12} /> Local Machine Learning
          </div>
        </div>

        {/* Floating Skill Nodes around Aperture */}
        <div
          className="floating-skill-node"
          style={{
            top: '-15px',
            left: '20px',
            transform: `translateZ(${isHovered ? 40 : 20}px)`,
          }}
        >
          <span style={{ color: 'var(--primary)' }}>✦</span> Python 3.11
        </div>

        <div
          className="floating-skill-node"
          style={{
            top: '40px',
            right: '-30px',
            transform: `translateZ(${isHovered ? 50 : 25}px)`,
          }}
        >
          <span style={{ color: 'var(--accent-secondary)' }}>●</span> scikit-learn
        </div>

        <div
          className="floating-skill-node"
          style={{
            bottom: '20px',
            right: '-20px',
            transform: `translateZ(${isHovered ? 45 : 20}px)`,
          }}
        >
          <span style={{ color: 'var(--primary)' }}>✦</span> PyTorch
        </div>

        <div
          className="floating-skill-node"
          style={{
            bottom: '-15px',
            left: '30px',
            transform: `translateZ(${isHovered ? 35 : 15}px)`,
          }}
        >
          <span style={{ color: 'var(--accent-secondary)' }}>●</span> FastAPI
        </div>

        <div
          className="floating-skill-node"
          style={{
            top: '140px',
            left: '-45px',
            transform: `translateZ(${isHovered ? 30 : 10}px)`,
          }}
        >
          <span style={{ color: 'var(--primary)' }}>✦</span> Cosine Sim
        </div>

        {/* Depth Candidate Profile Card #1 */}
        <div
          className="candidate-depth-card"
          style={{
            top: '-35px',
            right: '30px',
            transform: `translateZ(${isHovered ? 60 : 30}px) scale(0.92)`,
            borderColor: 'var(--primary)',
          }}
        >
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              backgroundColor: 'var(--badge-strong-bg)',
              color: 'var(--primary)',
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
            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-bright)' }}>Aria Vance</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--primary)', fontWeight: 600 }}>8/8 Skills Matched</div>
          </div>
        </div>

        {/* Depth Candidate Profile Card #2 */}
        <div
          className="candidate-depth-card"
          style={{
            bottom: '-30px',
            right: '40px',
            transform: `translateZ(${isHovered ? 50 : 25}px) scale(0.88)`,
          }}
        >
          <div
            style={{
              width: '30px',
              height: '30px',
              borderRadius: '8px',
              backgroundColor: 'var(--badge-mod-bg)',
              color: 'var(--badge-mod-text)',
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
            <div style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-bright)' }}>Liam Chen</div>
            <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Full-Stack Engineer</div>
          </div>
        </div>
      </div>
    </div>
  );
};
