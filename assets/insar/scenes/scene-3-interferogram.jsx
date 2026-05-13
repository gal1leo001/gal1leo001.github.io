// Scene 3: Interferometry — 9.8 to 15.6s
// Two SAR amplitude images slide in (Master / Slave), merge into a wrapped-phase
// interferogram with rainbow fringes that animate.

function Scene3Interferogram() {
  return (
    <Sprite start={9.8} end={15.6}>
      {({ localTime }) => {
        const fadeIn = animate({ from: 0, to: 1, start: 0, end: 0.6 })(localTime);
        const fadeOut = animate({ from: 1, to: 0, start: 5.0, end: 5.6 })(localTime);
        const opacity = Math.min(fadeIn, fadeOut);

        // Master tile: from off-screen-left to merge position
        const masterX = animate({ from: -500, to: 500, start: 0.2, end: 1.4, ease: Easing.easeOutCubic })(localTime);
        const slaveX  = animate({ from: 1920 + 100, to: 1020, start: 0.2, end: 1.4, ease: Easing.easeOutCubic })(localTime);

        // Both tiles slide toward center & merge ~ at 2.2s
        const mergeT = animate({ from: 0, to: 1, start: 2.0, end: 2.9, ease: Easing.easeInOutCubic })(localTime);
        // After merge, only the interferogram remains (centered)

        // Interferogram appears at mergeT > 0
        const ifgScale = 1 + 0.04 * Math.sin(localTime * 2.2); // subtle breathing

        // Sar tile dims as merge happens
        const sarOpacity = 1 - mergeT;

        return (
          <div style={{ position: 'absolute', inset: 0, background: PALETTE.void, opacity }}>
            <Starfield opacity={0.3} />
            <CoordGrid opacity={0.5} spacing={120} />
            <HUDFrame opacity={fadeIn} label="DIFFERENTIAL INTERFEROMETRY · D-InSAR" />

            {/* Title */}
            <div style={{
              position: 'absolute', left: 120, top: 100,
              fontFamily: MONO, fontSize: 14, color: PALETTE.inkDim,
              letterSpacing: '0.24em',
              opacity: fadeIn,
            }}>
              STEP 02 · PHASE INTERFEROMETRY
            </div>
            <div style={{
              position: 'absolute', left: 120, top: 130,
              fontFamily: SANS, fontSize: 56, fontWeight: 300, color: PALETTE.ink,
              letterSpacing: '-0.01em',
              opacity: fadeIn,
            }}>
              Δφ = φ<sub style={{ fontSize: 30 }}>master</sub> − φ<sub style={{ fontSize: 30 }}>slave</sub>
            </div>

            {/* Master SAR tile */}
            <SARTile
              x={masterX} y={400}
              label="MASTER"
              date="2025-04-12"
              seed={11}
              opacity={sarOpacity}
            />
            {/* Slave SAR tile */}
            <SARTile
              x={slaveX} y={400}
              label="SLAVE"
              date="2026-04-18"
              seed={37}
              opacity={sarOpacity}
            />

            {/* Minus sign between them */}
            <div style={{
              position: 'absolute', left: 940, top: 540,
              fontFamily: SANS, fontSize: 80, color: PALETTE.cold,
              fontWeight: 200,
              opacity: sarOpacity,
            }}>
              −
            </div>

            {/* Interferogram appears as merge completes */}
            <div style={{
              position: 'absolute', left: 760, top: 400,
              transform: `scale(${ifgScale * mergeT}) translateY(${(1 - mergeT) * 30}px)`,
              transformOrigin: 'center',
              opacity: mergeT,
            }}>
              <Interferogram time={localTime} />
            </div>

            {/* Equation result label */}
            <div style={{
              position: 'absolute', right: 120, top: 460,
              fontFamily: MONO, fontSize: 14, color: PALETTE.inkDim,
              letterSpacing: '0.18em', textAlign: 'right', lineHeight: 1.8,
              opacity: animate({ from: 0, to: 1, start: 1.6, end: 2.2 })(localTime),
            }}>
              <div style={{ color: PALETTE.fringe3 }}>WRAPPED PHASE</div>
              <div style={{ color: PALETTE.ink, fontSize: 32, fontFamily: SANS, fontWeight: 300 }}>
                [−π, +π]
              </div>
              <div style={{ marginTop: 18, color: PALETTE.inkDim }}>EACH FRINGE =</div>
              <div style={{ color: PALETTE.ink, fontSize: 22, fontFamily: SANS }}>
                28 mm LOS
              </div>
              <div style={{ marginTop: 18, color: PALETTE.inkDim }}>COHERENCE</div>
              <div style={{ color: PALETTE.signal, fontSize: 22, fontFamily: SANS, fontVariantNumeric: 'tabular-nums' }}>
                <CountUp from={0.62} to={0.91} start={1.8} end={3.0} decimals={2} />
              </div>
            </div>

            {/* Bottom strip — color legend */}
            <ColorLegend localTime={localTime} />
          </div>
        );
      }}
    </Sprite>
  );
}

// SAR amplitude tile — speckled grayscale with overlay text
function SARTile({ x, y, label, date, seed, opacity }) {
  const w = 360, h = 280;
  return (
    <div style={{
      position: 'absolute', left: x, top: y,
      width: w, height: h, opacity,
      border: `1px solid ${PALETTE.gridStrong}`,
      background: PALETTE.void,
    }}>
      <SARSpeckle width={w} height={h} seed={seed}/>
      <div style={{
        position: 'absolute', top: 8, left: 10,
        fontFamily: MONO, fontSize: 12, color: PALETTE.cold,
        letterSpacing: '0.2em',
      }}>
        {label}
      </div>
      <div style={{
        position: 'absolute', top: 8, right: 10,
        fontFamily: MONO, fontSize: 11, color: PALETTE.inkDim,
        letterSpacing: '0.16em',
      }}>
        {date}
      </div>
      <div style={{
        position: 'absolute', bottom: 8, left: 10,
        fontFamily: MONO, fontSize: 10, color: PALETTE.inkDim,
        letterSpacing: '0.18em',
      }}>
        SAR · VV · σ⁰
      </div>
      {/* Tile crosshair */}
      <div style={{
        position: 'absolute', left: w/2 - 10, top: h/2 - 1, width: 20, height: 2,
        background: PALETTE.warm, opacity: 0.7,
      }}/>
      <div style={{
        position: 'absolute', left: w/2 - 1, top: h/2 - 10, width: 2, height: 20,
        background: PALETTE.warm, opacity: 0.7,
      }}/>
    </div>
  );
}

// Speckled grayscale "SAR" pattern, drawn as SVG dots seeded for repeatability
function SARSpeckle({ width, height, seed }) {
  let s = seed;
  const rnd = () => { s = (s * 9301 + 49297) % 233280; return s / 233280; };
  const dots = [];
  const count = 1800;
  for (let i = 0; i < count; i++) {
    dots.push({
      x: rnd() * width,
      y: rnd() * height,
      r: 0.4 + rnd() * 1.2,
      o: 0.15 + rnd() * 0.7,
    });
  }
  // Add some bright "scatterers"
  const bright = [];
  for (let i = 0; i < 70; i++) {
    bright.push({ x: rnd() * width, y: rnd() * height, r: 1 + rnd() * 2 });
  }
  return (
    <svg width={width} height={height} style={{ position: 'absolute', inset: 0 }}>
      <rect width={width} height={height} fill="#0a1020"/>
      {dots.map((d, i) => (
        <circle key={i} cx={d.x} cy={d.y} r={d.r} fill="#cfe1ff" opacity={d.o * 0.5}/>
      ))}
      {bright.map((d, i) => (
        <circle key={`b${i}`} cx={d.x} cy={d.y} r={d.r} fill="#ffffff" opacity={0.85}/>
      ))}
    </svg>
  );
}

// The interferogram: concentric warped fringes in rainbow palette
function Interferogram({ time }) {
  const w = 400, h = 280;
  // Use SVG with a defs of conic-gradient-like pattern via repeating rings
  // Centered "deformation bowl" — phase wraps every 2π
  const cx = 220, cy = 140;
  const ringCount = 7;
  const rings = [];
  // Rings warp slightly with time to suggest active phase
  const breathe = Math.sin(time * 1.5) * 4;
  for (let i = ringCount; i >= 1; i--) {
    const radius = 30 + i * 22 + breathe;
    rings.push({ r: radius, idx: i });
  }
  const fringeColors = [
    PALETTE.fringe1, PALETTE.fringe2, PALETTE.fringe3,
    PALETTE.fringe4, PALETTE.fringe5, PALETTE.fringe1, PALETTE.fringe2,
  ];

  return (
    <div style={{
      width: w, height: h,
      border: `2px solid ${PALETTE.ink}`,
      background: '#0a1020',
      position: 'relative',
      boxShadow: '0 0 80px rgba(58,166,255,0.2)',
    }}>
      <svg width={w} height={h} style={{ position: 'absolute', inset: 0 }}>
        <defs>
          <clipPath id="ifgClip">
            <rect width={w} height={h}/>
          </clipPath>
        </defs>
        <g clipPath="url(#ifgClip)">
          {/* Background slight noise */}
          <rect width={w} height={h} fill="#0a1020"/>
          {/* Concentric fringes — drawn back-to-front */}
          {rings.map((ring, i) => (
            <ellipse
              key={i}
              cx={cx} cy={cy}
              rx={ring.r * 1.2}
              ry={ring.r * 0.85}
              fill={fringeColors[ring.idx % fringeColors.length]}
              opacity="0.85"
              transform={`rotate(${-12 + Math.sin(time + i) * 2} ${cx} ${cy})`}
            />
          ))}
          {/* Slight horizontal stripe modulation overlay */}
          <rect width={w} height={h} fill="url(#stripe)" opacity="0.18"/>
          {/* Outline of "active deformation zone" */}
          <ellipse cx={cx} cy={cy} rx={50} ry={36} fill="none" stroke="#fff" strokeWidth="1.2" strokeDasharray="3 3" opacity="0.7"/>
          {/* Crosshair */}
          <line x1={cx-12} y1={cy} x2={cx+12} y2={cy} stroke="#fff" strokeWidth="1"/>
          <line x1={cx} y1={cy-12} x2={cx} y2={cy+12} stroke="#fff" strokeWidth="1"/>
        </g>
      </svg>
      {/* Label */}
      <div style={{
        position: 'absolute', top: 10, left: 12,
        fontFamily: MONO, fontSize: 12, color: '#fff',
        letterSpacing: '0.2em',
        background: 'rgba(0,0,0,0.55)', padding: '3px 8px',
      }}>
        INTERFEROGRAM · WRAPPED Δφ
      </div>
      <div style={{
        position: 'absolute', bottom: 10, right: 12,
        fontFamily: MONO, fontSize: 11, color: PALETTE.cold,
        letterSpacing: '0.18em',
        background: 'rgba(0,0,0,0.55)', padding: '3px 8px',
      }}>
        BPERP 24 m · ΔT 372 d
      </div>
    </div>
  );
}

// Bottom color legend strip
function ColorLegend({ localTime }) {
  const opacity = animate({ from: 0, to: 1, start: 1.8, end: 2.4 })(localTime);
  const colors = [PALETTE.fringe1, PALETTE.fringe2, PALETTE.fringe3, PALETTE.fringe4, PALETTE.fringe5];
  return (
    <div style={{
      position: 'absolute', left: 760, top: 720, width: 400,
      opacity,
    }}>
      <div style={{
        display: 'flex', height: 16,
        border: `1px solid ${PALETTE.gridStrong}`,
      }}>
        {colors.map((c, i) => (
          <div key={i} style={{ flex: 1, background: c }}/>
        ))}
      </div>
      <div style={{
        display: 'flex', justifyContent: 'space-between',
        fontFamily: MONO, fontSize: 11, color: PALETTE.inkDim,
        letterSpacing: '0.16em', marginTop: 6,
      }}>
        <span>−π</span>
        <span>0</span>
        <span>+π</span>
      </div>
    </div>
  );
}

Object.assign(window, { Scene3Interferogram });
