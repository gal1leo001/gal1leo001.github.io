// Scene 4: Measurement / Displacement map — 21.4 to 27.6s
// A map view with deformation hot spots, animated pins counting up to mm/yr values.

function Scene4Measurement() {
  return (
    <Sprite start={21.4} end={27.6}>
      {({ localTime }) => {
        const fadeIn = animate({ from: 0, to: 1, start: 0, end: 0.6 })(localTime);
        const fadeOut = animate({ from: 1, to: 0, start: 5.4, end: 6.0 })(localTime);
        const opacity = Math.min(fadeIn, fadeOut);

        return (
          <div style={{ position: 'absolute', inset: 0, background: PALETTE.void, opacity }}>
            <CoordGrid opacity={0.35} spacing={60} />
            <HUDFrame opacity={fadeIn} label="STEP 03 · LINE-OF-SIGHT DISPLACEMENT" />

            {/* Title */}
            <div style={{
              position: 'absolute', left: 120, top: 100,
              fontFamily: MONO, fontSize: 14, color: PALETTE.inkDim,
              letterSpacing: '0.24em', opacity: fadeIn,
            }}>
              STEP 03 · MEASUREMENT
            </div>
            <div style={{
              position: 'absolute', left: 120, top: 130,
              fontFamily: SANS, fontSize: 56, fontWeight: 300, color: PALETTE.ink,
              letterSpacing: '-0.01em', opacity: fadeIn,
            }}>
              LOS displacement · <span style={{ color: PALETTE.warm }}>mm / yıl</span>
            </div>

            {/* Map area */}
            <DeformationMap localTime={localTime} />

            {/* Side panel — readouts */}
            <SidePanel localTime={localTime} />
          </div>
        );
      }}
    </Sprite>
  );
}

function DeformationMap({ localTime }) {
  // Map frame on the left
  const fx = 120, fy = 240, fw = 1100, fh = 720;

  // Hot spots — each (x,y) in map coords + a target value in mm/yr
  const spots = [
    { x: 280, y: 220, value: -38.4, color: PALETTE.hot,    label: 'A-01', delay: 1.0 },
    { x: 540, y: 380, value: +12.7, color: PALETTE.cool,   label: 'A-02', delay: 1.3 },
    { x: 760, y: 200, value: -21.1, color: PALETTE.warm,   label: 'A-03', delay: 1.6 },
    { x: 880, y: 540, value:  -6.3, color: PALETTE.fringe2,label: 'A-04', delay: 1.9 },
    { x: 380, y: 580, value: +3.2,  color: PALETTE.cold,   label: 'A-05', delay: 2.2 },
  ];

  return (
    <div style={{
      position: 'absolute', left: fx, top: fy, width: fw, height: fh,
      border: `1px solid ${PALETTE.gridStrong}`,
      background: 'linear-gradient(135deg, #0a1428 0%, #050912 100%)',
      overflow: 'hidden',
    }}>
      {/* Map underlay — pseudo-terrain via SVG */}
      <MapUnderlay width={fw} height={fh} />

      {/* Heatmap blobs over the spots */}
      <svg width={fw} height={fh} style={{ position: 'absolute', inset: 0 }}>
        <defs>
          {spots.map((s, i) => (
            <radialGradient key={i} id={`heat${i}`} cx="50%" cy="50%" r="50%">
              <stop offset="0%"  stopColor={s.color} stopOpacity="0.55"/>
              <stop offset="60%" stopColor={s.color} stopOpacity="0.18"/>
              <stop offset="100%" stopColor={s.color} stopOpacity="0"/>
            </radialGradient>
          ))}
        </defs>
        {spots.map((s, i) => {
          const t = animate({ from: 0, to: 1, start: s.delay, end: s.delay + 0.5, ease: Easing.easeOutCubic })(localTime);
          return (
            <ellipse
              key={i}
              cx={s.x} cy={s.y}
              rx={140 * t} ry={100 * t}
              fill={`url(#heat${i})`}
            />
          );
        })}
      </svg>

      {/* Pins with count-up labels */}
      {spots.map((s, i) => {
        const t = animate({ from: 0, to: 1, start: s.delay + 0.15, end: s.delay + 0.6, ease: Easing.easeOutBack })(localTime);
        return (
          <div key={i} style={{
            position: 'absolute', left: s.x, top: s.y,
            transform: `translate(-50%, -50%) scale(${t})`,
            opacity: t,
          }}>
            <Pin color={s.color} value={s.value} label={s.label} startTime={s.delay + 0.4} localTime={localTime}/>
          </div>
        );
      })}

      {/* Map label corners */}
      <div style={{ position: 'absolute', top: 12, left: 14, fontFamily: MONO, fontSize: 11, color: PALETTE.inkDim, letterSpacing: '0.18em' }}>
        AOI · 38.40°N 27.13°E · 12 × 8 km
      </div>
      <div style={{ position: 'absolute', top: 12, right: 14, fontFamily: MONO, fontSize: 11, color: PALETTE.signal, letterSpacing: '0.18em' }}>
        ● TIME-SERIES 2025-04 → 2026-04
      </div>
      <div style={{ position: 'absolute', bottom: 12, left: 14, fontFamily: MONO, fontSize: 11, color: PALETTE.inkDim, letterSpacing: '0.18em' }}>
        N PIXELS · 1 240 800 · UNW · MASKED
      </div>
      {/* Scale bar */}
      <div style={{ position: 'absolute', bottom: 12, right: 14, fontFamily: MONO, fontSize: 11, color: PALETTE.inkDim, letterSpacing: '0.18em', display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{ width: 80, height: 4, background: PALETTE.ink }}/>
        <span>2 km</span>
      </div>
    </div>
  );
}

// SVG terrain-ish underlay: contour lines + a few "buildings"
function MapUnderlay({ width, height }) {
  // Procedurally seeded contour lines
  let s = 91;
  const rnd = () => { s = (s * 9301 + 49297) % 233280; return s / 233280; };
  const contours = [];
  for (let i = 0; i < 8; i++) {
    const cy = 80 + i * 90;
    const path = [];
    for (let x = 0; x <= width; x += 30) {
      const y = cy + Math.sin(x * 0.011 + i) * 22 + Math.sin(x * 0.04 + i * 2) * 8;
      path.push(`${x === 0 ? 'M' : 'L'}${x},${y}`);
    }
    contours.push(path.join(' '));
  }
  // Faux infrastructure rectangles
  const blocks = [];
  for (let i = 0; i < 36; i++) {
    blocks.push({ x: rnd() * width, y: rnd() * height, w: 8 + rnd() * 24, h: 8 + rnd() * 18 });
  }
  return (
    <svg width={width} height={height} style={{ position: 'absolute', inset: 0 }}>
      {/* Contours */}
      {contours.map((d, i) => (
        <path key={i} d={d} fill="none" stroke="rgba(120,180,255,0.18)" strokeWidth="1"/>
      ))}
      {/* Blocks */}
      {blocks.map((b, i) => (
        <rect key={i} x={b.x} y={b.y} width={b.w} height={b.h} fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.10)" strokeWidth="0.5"/>
      ))}
      {/* River-like polyline */}
      <path
        d={`M 0,${height*0.6} Q ${width*0.25},${height*0.55} ${width*0.5},${height*0.7} T ${width},${height*0.6}`}
        fill="none" stroke="rgba(58,166,255,0.35)" strokeWidth="2"
      />
    </svg>
  );
}

function Pin({ color, value, label, startTime, localTime }) {
  const sign = value >= 0 ? '+' : '−';
  const abs = Math.abs(value);
  return (
    <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 10 }}>
      {/* dot + ring */}
      <div style={{ position: 'relative', width: 18, height: 18 }}>
        <div style={{
          position: 'absolute', inset: 0,
          background: color, borderRadius: '50%',
          boxShadow: `0 0 18px ${color}`,
        }}/>
        <div style={{
          position: 'absolute', inset: -8,
          border: `1px solid ${color}`, borderRadius: '50%', opacity: 0.55,
        }}/>
      </div>
      {/* readout */}
      <div style={{
        background: 'rgba(5,7,13,0.85)',
        border: `1px solid ${color}`,
        padding: '6px 10px',
        fontFamily: MONO, color: PALETTE.ink,
        whiteSpace: 'nowrap',
      }}>
        <div style={{ fontSize: 10, color: PALETTE.inkDim, letterSpacing: '0.2em' }}>{label}</div>
        <div style={{ fontSize: 18, fontVariantNumeric: 'tabular-nums', color }}>
          {sign}<CountUp from={0} to={abs} start={startTime} end={startTime + 0.9} decimals={1}/> mm/yr
        </div>
      </div>
    </div>
  );
}

function SidePanel({ localTime }) {
  const opacity = animate({ from: 0, to: 1, start: 1.6, end: 2.4 })(localTime);
  return (
    <div style={{
      position: 'absolute', right: 120, top: 240, width: 460,
      opacity,
      fontFamily: MONO, color: PALETTE.ink,
    }}>
      <div style={{ fontSize: 12, color: PALETTE.inkDim, letterSpacing: '0.22em' }}>
        ANALYSIS · STACK 64 IFG
      </div>

      <div style={{ marginTop: 24, padding: '20px 22px', border: `1px solid ${PALETTE.gridStrong}`, background: 'rgba(120,180,255,0.04)' }}>
        <Stat label="MAX SUBSIDENCE"  value={<><CountUp from={0} to={38.4} start={23.0} end={24.4} decimals={1}/> mm/yr</>} color={PALETTE.hot}/>
        <Stat label="MAX UPLIFT"      value={<><CountUp from={0} to={12.7} start={23.2} end={24.6} decimals={1}/> mm/yr</>} color={PALETTE.cool}/>
        <Stat label="POINT TARGETS"   value={<><CountUp from={0} to={48214} start={23.4} end={24.6} decimals={0}/></>} color={PALETTE.ink}/>
        <Stat label="STACK COHERENCE" value={<><CountUp from={0.62} to={0.91} start={23.6} end={24.8} decimals={2}/></>} color={PALETTE.signal}/>
        <Stat label="UNCERTAINTY"     value={<>± <CountUp from={0} to={1.2} start={23.8} end={25.0} decimals={1}/> mm</>} color={PALETTE.inkDim} last/>
      </div>

      <div style={{ marginTop: 22, fontSize: 13, color: PALETTE.inkDim, letterSpacing: '0.16em', lineHeight: 1.7 }}>
        ► PSI · SBAS HYBRID PIPELINE<br/>
        ► ATMOSPHERIC PHASE FILTERED<br/>
        ► REFERENCED TO STABLE BEDROCK
      </div>
    </div>
  );
}

function Stat({ label, value, color, last }) {
  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
      padding: '12px 0',
      borderBottom: last ? 'none' : `1px solid ${PALETTE.gridStrong}`,
    }}>
      <span style={{ fontSize: 11, color: PALETTE.inkDim, letterSpacing: '0.18em' }}>{label}</span>
      <span style={{ fontSize: 22, color, fontVariantNumeric: 'tabular-nums' }}>{value}</span>
    </div>
  );
}

Object.assign(window, { Scene4Measurement });
