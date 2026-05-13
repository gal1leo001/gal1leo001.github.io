// Scene 5: Final logo lockup — 27.4 to 32.0s
// Everything settles into a centered, confident logo with tagline.

function Scene5Logo() {
  return (
    <Sprite start={27.4} end={32.0}>
      {({ localTime }) => {
        const fadeIn = animate({ from: 0, to: 1, start: 0, end: 0.6 })(localTime);
        const opacity = fadeIn;

        // Mark scale-up
        const markScale = animate({ from: 0.6, to: 1, start: 0.1, end: 0.9, ease: Easing.easeOutBack })(localTime);
        const markOp    = animate({ from: 0, to: 1, start: 0.1, end: 0.7 })(localTime);

        // Wordmark letter reveal
        const letters = 'ANZURA'.split('');

        // Tagline reveal
        const taglineOp = animate({ from: 0, to: 1, start: 1.3, end: 1.9 })(localTime);
        const lineWidth = animate({ from: 0, to: 800, start: 1.0, end: 1.7, ease: Easing.easeInOutCubic })(localTime);

        // Bottom strip reveal
        const stripOp = animate({ from: 0, to: 1, start: 1.7, end: 2.2 })(localTime);

        return (
          <div style={{ position: 'absolute', inset: 0, background: PALETTE.void, opacity }}>
            <Starfield opacity={0.4} />

            {/* Faint orbital ring backdrop */}
            <svg width="1920" height="1080" style={{ position: 'absolute', inset: 0 }}>
              <ellipse cx="960" cy="540" rx="700" ry="200" fill="none" stroke={PALETTE.gridStrong} strokeWidth="1" strokeDasharray="2 6"
                transform="rotate(-12 960 540)"/>
              <ellipse cx="960" cy="540" rx="500" ry="140" fill="none" stroke={PALETTE.gridStrong} strokeWidth="1" strokeDasharray="2 6"
                transform="rotate(8 960 540)" opacity="0.6"/>
            </svg>

            {/* Mark — concentric arcs evoking SAR/orbit */}
            <div style={{
              position: 'absolute', left: 960, top: 280,
              transform: `translate(-50%, -50%) scale(${markScale})`,
              opacity: markOp,
            }}>
              <ANZURAMark localTime={localTime}/>
            </div>

            {/* Eyebrow: ANZURA */}
            <div style={{
              position: 'absolute', left: 0, right: 0, top: 410,
              textAlign: 'center',
              fontFamily: SANS, fontSize: 28, fontWeight: 500,
              color: PALETTE.inkDim, letterSpacing: '0.6em',
              opacity: animate({ from: 0, to: 1, start: 0.6, end: 1.2 })(localTime),
            }}>
              ANZURA
            </div>

            {/* Main lockup: 'InSAR' big light + 'Ground Displacement' below */}
            <div style={{
              position: 'absolute', left: 0, right: 0, top: 470,
              display: 'flex', justifyContent: 'center',
              fontFamily: SANS, fontWeight: 200, fontSize: 220,
              letterSpacing: '-0.02em',
            }}>
              {'InSAR'.split('').map((ch, i) => {
                const start = 0.85 + i * 0.07;
                const t = animate({ from: 0, to: 1, start, end: start + 0.5, ease: Easing.easeOutCubic })(localTime);
                const isUpper = ch === 'S' || ch === 'A' || ch === 'R';
                return (
                  <span key={i} style={{
                    display: 'inline-block',
                    opacity: t,
                    transform: `translateY(${(1 - t) * 32}px)`,
                    fontWeight: isUpper ? 600 : 200,
                    color: isUpper ? PALETTE.cold : PALETTE.ink,
                  }}>{ch}</span>
                );
              })}
            </div>
            <div style={{
              position: 'absolute', left: 0, right: 0, top: 700,
              display: 'flex', justifyContent: 'center',
              fontFamily: SANS, fontWeight: 300, fontSize: 76,
              color: PALETTE.ink, letterSpacing: '0.08em',
            }}>
              {'GROUND  DISPLACEMENT'.split('').map((ch, i) => {
                const start = 1.6 + i * 0.04;
                const t = animate({ from: 0, to: 1, start, end: start + 0.45, ease: Easing.easeOutCubic })(localTime);
                return (
                  <span key={i} style={{
                    display: 'inline-block',
                    opacity: t,
                    transform: `translateY(${(1 - t) * 18}px)`,
                    minWidth: ch === ' ' ? '0.35em' : 'auto',
                  }}>{ch === ' ' ? '\u00A0' : ch}</span>
                );
              })}
            </div>

            {/* Underline */}
            <div style={{
              position: 'absolute', left: '50%', top: 820,
              transform: 'translateX(-50%)',
              width: lineWidth, height: 2,
              background: PALETTE.cold,
            }}/>

            {/* Tagline */}
            <div style={{
              position: 'absolute', left: 0, right: 0, top: 850,
              textAlign: 'center',
              fontFamily: MONO, fontSize: 20, color: PALETTE.inkDim,
              letterSpacing: '0.5em',
              opacity: taglineOp,
            }}>
              UYDU · RADAR · mm SEVİYESİNDE TAKİP
            </div>

            {/* Bottom credentials strip */}
            <div style={{
              position: 'absolute', left: 0, right: 0, bottom: 80,
              display: 'flex', justifyContent: 'center', gap: 80,
              fontFamily: MONO, fontSize: 14, color: PALETTE.inkDim,
              letterSpacing: '0.22em',
              opacity: stripOp,
            }}>
              <div><span style={{ color: PALETTE.signal }}>●</span> mm SEVİYESİNDE HASSASİYET</div>
              <div><span style={{ color: PALETTE.signal }}>●</span> SÜREKLİ İZLEME</div>
              <div><span style={{ color: PALETTE.signal }}>●</span> KANIT NİTELİĞİNDE VERİ</div>
            </div>

            <HUDFrame opacity={fadeIn * 0.6} label="" />
          </div>
        );
      }}
    </Sprite>
  );
}

// The mark: 3 concentric arcs (representing orbits / SAR sweeps) + a center pulse
function ANZURAMark({ localTime }) {
  const size = 240;
  const cx = size / 2, cy = size / 2;
  // Arc reveal lengths drive stroke-dasharray
  const sweep = animate({ from: 0, to: 1, start: 0.2, end: 1.4, ease: Easing.easeInOutCubic })(localTime);
  const pulse = 0.7 + 0.3 * Math.sin(localTime * 3);
  // Three arcs at different radii / rotations
  const arcs = [
    { r: 100, rot: -30, len: 220, color: PALETTE.cold,    width: 2.5 },
    { r: 80,  rot:  60, len: 180, color: PALETTE.cool,    width: 2 },
    { r: 60,  rot: 140, len: 130, color: PALETTE.warm,    width: 2 },
  ];
  return (
    <svg width={size} height={size}>
      {arcs.map((a, i) => {
        const circ = 2 * Math.PI * a.r;
        const visible = a.len * sweep;
        return (
          <circle
            key={i}
            cx={cx} cy={cy} r={a.r}
            fill="none"
            stroke={a.color}
            strokeWidth={a.width}
            strokeDasharray={`${visible} ${circ}`}
            strokeLinecap="round"
            transform={`rotate(${a.rot} ${cx} ${cy})`}
            opacity={0.85}
          />
        );
      })}
      {/* Center dot — represents target / measurement point */}
      <circle cx={cx} cy={cy} r={6} fill={PALETTE.ink} opacity={pulse}/>
      <circle cx={cx} cy={cy} r={14} fill="none" stroke={PALETTE.ink} strokeWidth="1" opacity={pulse * 0.5}/>
      {/* Small target ticks */}
      {[0, 90, 180, 270].map((deg, i) => (
        <line key={i}
          x1={cx + Math.cos(deg * Math.PI / 180) * 24}
          y1={cy + Math.sin(deg * Math.PI / 180) * 24}
          x2={cx + Math.cos(deg * Math.PI / 180) * 32}
          y2={cy + Math.sin(deg * Math.PI / 180) * 32}
          stroke={PALETTE.ink} strokeWidth="1.5" opacity={0.7}
        />
      ))}
    </svg>
  );
}

Object.assign(window, { Scene5Logo });
