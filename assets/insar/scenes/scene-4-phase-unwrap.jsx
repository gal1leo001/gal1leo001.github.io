// Scene 4.5: Phase Unwrapping → 3D displacement vectors — 15.4 to 21.6s
// The wrapped interferogram unwraps; an isometric 3D surface emerges with
// displacement arrows; LOS decomposition into vertical/horizontal components.

function ScenePhaseUnwrap() {
  return (
    <Sprite start={15.4} end={21.6}>
      {({ localTime }) => {
        const fadeIn  = animate({ from: 0, to: 1, start: 0,   end: 0.6 })(localTime);
        const fadeOut = animate({ from: 1, to: 0, start: 5.6, end: 6.2 })(localTime);
        const opacity = Math.min(fadeIn, fadeOut);

        // Wrapped → unwrapped morph at 0.5–1.6s
        const unwrapT = animate({ from: 0, to: 1, start: 0.4, end: 1.6, ease: Easing.easeInOutCubic })(localTime);

        // Surface tilts into 3D after unwrap
        const tiltT   = animate({ from: 0, to: 1, start: 1.6, end: 2.6, ease: Easing.easeInOutCubic })(localTime);

        // Vector arrows fly in
        const vecT    = animate({ from: 0, to: 1, start: 2.7, end: 3.6, ease: Easing.easeOutCubic })(localTime);

        // Decomposition labels
        const decompT = animate({ from: 0, to: 1, start: 3.8, end: 4.6 })(localTime);

        return (
          <div style={{ position: 'absolute', inset: 0, background: PALETTE.void, opacity }}>
            <CoordGrid opacity={0.35} spacing={120} />
            <HUDFrame opacity={fadeIn} label="STEP 03 · PHASE UNWRAPPING · 3-D RECONSTRUCTION" />

            {/* Title */}
            <div style={{
              position: 'absolute', left: 120, top: 100,
              fontFamily: MONO, fontSize: 14, color: PALETTE.inkDim,
              letterSpacing: '0.24em', opacity: fadeIn,
            }}>
              STEP 03 · UNWRAP & RECONSTRUCT
            </div>
            <div style={{
              position: 'absolute', left: 120, top: 130,
              fontFamily: SANS, fontSize: 56, fontWeight: 300, color: PALETTE.ink,
              letterSpacing: '-0.01em', opacity: fadeIn,
            }}>
              Sarmal{'\u0131'} faz{' '}
              <span style={{ color: PALETTE.warm }}>→</span>{' '}
              ger{'\u00e7'}ek yer de{'\u011f'}i{'\u015f'}tirme
            </div>

            {/* Center stage: 3D-ish surface */}
            <div style={{
              position: 'absolute', left: 540, top: 260, width: 840, height: 600,
            }}>
              <DisplacementSurface unwrapT={unwrapT} tiltT={tiltT} vecT={vecT} time={localTime}/>
            </div>

            {/* Left side: equation + before/after thumbs */}
            <div style={{
              position: 'absolute', left: 120, top: 290, width: 380,
              opacity: fadeIn,
            }}>
              <div style={{ fontFamily: MONO, fontSize: 12, color: PALETTE.inkDim, letterSpacing: '0.22em' }}>
                LOS DISPLACEMENT
              </div>
              <div style={{
                fontFamily: SANS, fontSize: 40, fontWeight: 300, color: PALETTE.ink,
                marginTop: 10, lineHeight: 1.3, letterSpacing: '-0.01em',
              }}>
                d<sub style={{ fontSize: 22 }}>LOS</sub> = (λ / 4π) · Δφ<sub style={{ fontSize: 22 }}>unw</sub>
              </div>
              <div style={{
                fontFamily: MONO, fontSize: 13, color: PALETTE.inkDim,
                marginTop: 16, letterSpacing: '0.16em', lineHeight: 1.7,
              }}>
                λ = 5.547 cm  ·  C-band<br/>
                1 fringe ≈ 28 mm<br/>
                σ ≈ 1.2 mm  ·  long-stack PSI
              </div>

              {/* Mini wrapped vs unwrapped strips */}
              <div style={{ marginTop: 26, display: 'flex', gap: 14 }}>
                <MiniStrip label="WRAPPED"   wrapped time={localTime}/>
                <MiniStrip label="UNWRAPPED" wrapped={false} unwrapT={unwrapT} time={localTime}/>
              </div>
            </div>

            {/* Right side: vector decomposition (V / E-W / N-S) */}
            <div style={{
              position: 'absolute', right: 90, top: 280, width: 400,
              opacity: decompT,
              fontFamily: MONO, color: PALETTE.ink,
            }}>
              <div style={{ fontSize: 12, color: PALETTE.inkDim, letterSpacing: '0.22em' }}>
                VEKTÖR AYRIŞTIRMA
              </div>
              <DecompBar label="VERTICAL"   value={-24.6} max={40} color={PALETTE.hot}    delay={3.9} localTime={localTime}/>
              <DecompBar label="EAST-WEST"  value={+8.2}  max={40} color={PALETTE.cool}   delay={4.05} localTime={localTime}/>
              <DecompBar label="NORTH-SOUTH" value={-3.1} max={40} color={PALETTE.fringe2} delay={4.2} localTime={localTime}/>

              <div style={{ marginTop: 32, fontSize: 13, color: PALETTE.inkDim, letterSpacing: '0.16em', lineHeight: 1.7 }}>
                ► ASCENDING + DESCENDING<br/>
                ► 3-COMPONENT INVERSION<br/>
                ► <span style={{ color: PALETTE.signal }}>SUB-CM ACCURACY</span>
              </div>
            </div>
          </div>
        );
      }}
    </Sprite>
  );
}

// 3D-ish displacement surface — orthographic skewed grid with vertical bumps
function DisplacementSurface({ unwrapT, tiltT, vecT, time }) {
  const W = 840, H = 600;
  // Grid resolution
  const cols = 24, rows = 18;

  // Tilt parameters
  const skewX = 0.55 * tiltT;       // horizontal compression as we tilt
  const skewY = 0.35 * tiltT;       // vertical squish
  const offsetY = 60 * tiltT;
  const liftAmp = 90 * tiltT;        // amount of vertical lift in displacement bumps

  // Center of "deformation bowl"
  const cx = cols * 0.42;
  const cy = rows * 0.55;

  // Compute height field (negative for subsidence well, positive for uplift bump)
  const heightAt = (gx, gy) => {
    const dx1 = gx - cx, dy1 = gy - cy;
    const r1 = Math.sqrt(dx1*dx1 + dy1*dy1);
    const subsidence = -Math.exp(-r1 * r1 / 20) * 1.0; // big well
    const upliftCx = cols * 0.78, upliftCy = rows * 0.35;
    const dx2 = gx - upliftCx, dy2 = gy - upliftCy;
    const r2 = Math.sqrt(dx2*dx2 + dy2*dy2);
    const uplift = Math.exp(-r2 * r2 / 12) * 0.55;
    return subsidence + uplift;
  };

  // Project a grid point (gx, gy) to screen
  const project = (gx, gy) => {
    // Base 2D position
    const baseX = (gx / (cols - 1)) * W;
    const baseY = (gy / (rows - 1)) * H * 0.85;
    // Tilt: as tiltT grows, push perspective. Y compresses, X shears.
    const h = heightAt(gx, gy) * liftAmp;
    const x = baseX + (baseY * skewX * 0.0);
    const y = baseY * (1 - skewY * 0.5) + offsetY - h;
    return { x, y, h: heightAt(gx, gy) };
  };

  // Color from height — warm for subsidence (down), cool for uplift
  const colorFromH = (h) => {
    // h roughly -1 .. +0.55
    const t = (h + 1) / 1.55; // 0..1
    // mix red(hot) → yellow → green → cyan → blue
    if (t < 0.25)    return PALETTE.hot;
    if (t < 0.5)     return PALETTE.warm;
    if (t < 0.7)     return PALETTE.fringe3;
    if (t < 0.85)    return PALETTE.cool;
    return PALETTE.cold;
  };

  // Build polygon faces
  const faces = [];
  for (let j = 0; j < rows - 1; j++) {
    for (let i = 0; i < cols - 1; i++) {
      const p00 = project(i,     j);
      const p10 = project(i + 1, j);
      const p11 = project(i + 1, j + 1);
      const p01 = project(i,     j + 1);
      const hAvg = (p00.h + p10.h + p11.h + p01.h) / 4;
      faces.push({
        d: `M${p00.x},${p00.y} L${p10.x},${p10.y} L${p11.x},${p11.y} L${p01.x},${p01.y} Z`,
        fill: colorFromH(hAvg),
        opacity: 0.55 + 0.35 * unwrapT,
        stroke: 'rgba(255,255,255,0.06)',
      });
    }
  }

  // Displacement arrows at peaks of the bowl
  const arrowPts = [
    { gx: cx,            gy: cy,            mag: -38, color: PALETTE.hot,  label: '-38 mm' },
    { gx: cols * 0.78,   gy: rows * 0.35,   mag: +12, color: PALETTE.cool, label: '+12 mm' },
    { gx: cols * 0.20,   gy: rows * 0.20,   mag: -8,  color: PALETTE.warm, label: '-8 mm'  },
    { gx: cols * 0.55,   gy: rows * 0.85,   mag: +4,  color: PALETTE.cold, label: '+4 mm'  },
  ];

  return (
    <svg width={W} height={H} style={{ overflow: 'visible' }}>
      {/* Frame */}
      <rect x="0" y="0" width={W} height={H} fill="none" stroke={PALETTE.gridStrong} strokeWidth="1"/>

      {/* Pre-tilt: wrapped fringe pattern morphs to surface */}
      {tiltT < 0.4 && (
        <g opacity={1 - tiltT * 2.5}>
          {[...Array(7)].map((_, i) => {
            const r = 50 + i * 50;
            const colors = [PALETTE.fringe1, PALETTE.fringe2, PALETTE.fringe3, PALETTE.fringe4, PALETTE.fringe5, PALETTE.fringe1, PALETTE.fringe2];
            return (
              <ellipse key={i}
                cx={W * 0.42} cy={H * 0.5}
                rx={r * 1.6} ry={r}
                fill="none"
                stroke={colors[i % colors.length]}
                strokeWidth="14"
                opacity={0.7}
              />
            );
          })}
        </g>
      )}

      {/* Surface faces */}
      <g opacity={tiltT}>
        {faces.map((f, i) => (
          <path key={i} d={f.d} fill={f.fill} fillOpacity={f.opacity} stroke={f.stroke} strokeWidth="0.5"/>
        ))}
      </g>

      {/* Wireframe contour lines on top */}
      <g opacity={tiltT * 0.7} stroke="rgba(255,255,255,0.25)" strokeWidth="0.8" fill="none">
        {[...Array(rows)].map((_, j) => {
          const pts = [...Array(cols)].map((_, i) => project(i, j));
          const d = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ');
          return <path key={`r${j}`} d={d}/>;
        })}
      </g>

      {/* Displacement arrows */}
      {vecT > 0 && arrowPts.map((a, i) => {
        const p = project(a.gx, a.gy);
        const len = Math.abs(a.mag) * 2.5 * vecT;
        const dir = a.mag < 0 ? 1 : -1; // negative (subsidence) points down
        const x2 = p.x;
        const y2 = p.y + dir * len;
        return (
          <g key={i}>
            <line x1={p.x} y1={p.y} x2={x2} y2={y2}
              stroke={a.color} strokeWidth="3" strokeLinecap="round"
              markerEnd={`url(#arrow-${i})`}
            />
            <defs>
              <marker id={`arrow-${i}`} viewBox="0 0 10 10" refX="6" refY="5"
                markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M0,0 L10,5 L0,10 z" fill={a.color}/>
              </marker>
            </defs>
            <circle cx={p.x} cy={p.y} r="5" fill={a.color}/>
            {vecT > 0.5 && (
              <text x={x2 + 8} y={y2 + 5}
                fill={a.color} fontFamily={MONO} fontSize="14"
                fontWeight="600" letterSpacing="0.12em">
                {a.label}
              </text>
            )}
          </g>
        );
      })}

      {/* Compass */}
      <g transform={`translate(${W - 80}, ${H - 60})`} opacity={tiltT}>
        <circle cx="0" cy="0" r="26" fill="rgba(0,0,0,0.4)" stroke={PALETTE.inkDim} strokeWidth="1"/>
        <text x="0" y="-30" fill={PALETTE.ink} fontFamily={MONO} fontSize="12" textAnchor="middle">N</text>
        <line x1="0" y1="-20" x2="0" y2="20" stroke={PALETTE.ink} strokeWidth="1"/>
        <line x1="-20" y1="0" x2="20" y2="0" stroke={PALETTE.inkDim} strokeWidth="1"/>
        <polygon points="0,-22 -4,-12 4,-12" fill={PALETTE.cool}/>
      </g>
    </svg>
  );
}

function MiniStrip({ label, wrapped, unwrapT = 0, time = 0 }) {
  const colors = [PALETTE.fringe1, PALETTE.fringe2, PALETTE.fringe3, PALETTE.fringe4, PALETTE.fringe5];
  return (
    <div style={{ width: 170 }}>
      <div style={{
        fontFamily: MONO, fontSize: 11, color: PALETTE.inkDim,
        letterSpacing: '0.2em', marginBottom: 6,
      }}>{label}</div>
      <div style={{
        height: 90,
        border: `1px solid ${PALETTE.gridStrong}`,
        background: '#0a1020',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {wrapped ? (
          // Wrapped: rainbow concentric ellipses
          <svg width="100%" height="100%" viewBox="0 0 170 90" preserveAspectRatio="none">
            {[...Array(6)].map((_, i) => (
              <ellipse key={i} cx="80" cy="45" rx={12 + i * 14} ry={8 + i * 9}
                fill="none" stroke={colors[i % colors.length]} strokeWidth="6" opacity="0.85"/>
            ))}
          </svg>
        ) : (
          // Unwrapped: smooth gradient bowl
          <div style={{
            position: 'absolute', inset: 0,
            background: `radial-gradient(ellipse at 47% 50%, ${PALETTE.hot} 0%, ${PALETTE.warm} 30%, ${PALETTE.fringe3} 60%, ${PALETTE.cool} 100%)`,
            opacity: 0.6 + 0.4 * unwrapT,
          }}/>
        )}
      </div>
    </div>
  );
}

function DecompBar({ label, value, max, color, delay, localTime }) {
  const sign = value >= 0 ? '+' : '−';
  const abs = Math.abs(value);
  const t = animate({ from: 0, to: 1, start: delay, end: delay + 0.6, ease: Easing.easeOutCubic })(localTime);
  const pct = (abs / max) * t;
  return (
    <div style={{ marginTop: 22 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <span style={{ fontSize: 12, color: PALETTE.inkDim, letterSpacing: '0.18em' }}>{label}</span>
        <span style={{ fontSize: 22, color, fontVariantNumeric: 'tabular-nums', fontFamily: MONO }}>
          {sign}<CountUp from={0} to={abs} start={15.4 + delay} end={15.4 + delay + 0.7} decimals={1}/> mm/yr
        </span>
      </div>
      <div style={{ marginTop: 8, height: 4, background: 'rgba(255,255,255,0.08)', position: 'relative' }}>
        <div style={{
          position: 'absolute', left: value < 0 ? 'auto' : '50%', right: value < 0 ? '50%' : 'auto',
          top: 0, bottom: 0,
          width: `${pct * 50}%`,
          background: color,
        }}/>
        <div style={{ position: 'absolute', left: '50%', top: -3, bottom: -3, width: 1, background: PALETTE.inkDim }}/>
      </div>
    </div>
  );
}

Object.assign(window, { ScenePhaseUnwrap });
