// Scene 2: Satellite acquisition — 4.4 to 10.0s
// Earth limb at the bottom, Sentinel-1-style satellite traverses overhead,
// radar beam sweeps the surface, ground swath highlights.

function Scene2Satellite() {
  return (
    <Sprite start={4.4} end={10.0}>
      {({ localTime }) => {
        const fadeIn = animate({ from: 0, to: 1, start: 0, end: 0.6 })(localTime);
        const fadeOut = animate({ from: 1, to: 0, start: 5.0, end: 5.6 })(localTime);
        const opacity = Math.min(fadeIn, fadeOut);

        // Satellite glides left-to-right across the upper portion
        const satX = animate({ from: 200, to: 1620, start: 0.3, end: 4.8, ease: Easing.easeInOutCubic })(localTime);
        const satY = 280;

        // Radar beam intensity pulses
        const beamOn = localTime > 1.0 && localTime < 4.7;
        const beamPulse = 0.55 + 0.45 * Math.sin(localTime * 8);

        return (
          <div style={{
            position: 'absolute', inset: 0,
            background: `radial-gradient(ellipse at 50% 120%, #0e1a30 0%, ${PALETTE.void} 65%)`,
            opacity,
          }}>
            <Starfield opacity={0.85} />

            {/* Earth limb — large arc at the bottom */}
            <EarthLimb localTime={localTime} />

            {/* HUD frame */}
            <HUDFrame opacity={fadeIn} label="ACQUISITION · SAR C-BAND · 5.405 GHZ" />

            {/* Satellite */}
            <Satellite x={satX} y={satY} localTime={localTime} />

            {/* Radar beam from sat to ground */}
            {beamOn && <RadarBeam x={satX} y={satY} pulse={beamPulse} />}

            {/* Telemetry block — bottom-left */}
            <Telemetry localTime={localTime} satX={satX} />

            {/* Acquisition label — top-right */}
            <div style={{
              position: 'absolute', right: 120, top: 120,
              fontFamily: MONO, fontSize: 14, color: PALETTE.signal,
              textAlign: 'right', letterSpacing: '0.2em', lineHeight: 1.7,
              opacity: animate({ from: 0, to: 1, start: 0.3, end: 0.9 })(localTime),
            }}>
              <div style={{ color: PALETTE.inkDim }}>MISSION</div>
              <div style={{ color: PALETTE.ink, fontSize: 22 }}>SAR-CONSTELLATION</div>
              <div style={{ color: PALETTE.inkDim, marginTop: 12 }}>MODE</div>
              <div style={{ color: PALETTE.ink, fontSize: 22 }}>INTERFEROMETRIC WIDE</div>
              <div style={{ color: PALETTE.inkDim, marginTop: 12 }}>RESOLUTION</div>
              <div style={{ color: PALETTE.ink, fontSize: 22 }}>5 m × 20 m</div>
            </div>
          </div>
        );
      }}
    </Sprite>
  );
}

// Earth limb — gentle arc with atmospheric glow
function EarthLimb({ localTime }) {
  const cx = 960, cy = 1900, r = 1400;
  return (
    <svg width="1920" height="1080" style={{ position: 'absolute', inset: 0 }}>
      <defs>
        <radialGradient id="earthGrad" cx="50%" cy="100%" r="50%">
          <stop offset="0%"  stopColor="#1a3a6e"/>
          <stop offset="60%" stopColor="#0a1a30"/>
          <stop offset="100%" stopColor="#05070d"/>
        </radialGradient>
        <radialGradient id="atmoGrad" cx="50%" cy="100%" r="56%">
          <stop offset="92%" stopColor="rgba(58,166,255,0)"/>
          <stop offset="97%" stopColor="rgba(58,166,255,0.4)"/>
          <stop offset="100%" stopColor="rgba(58,166,255,0)"/>
        </radialGradient>
      </defs>
      {/* Atmosphere halo */}
      <circle cx={cx} cy={cy} r={r + 30} fill="url(#atmoGrad)"/>
      {/* Earth body */}
      <circle cx={cx} cy={cy} r={r} fill="url(#earthGrad)"/>
      {/* Lat/long graticule */}
      <g stroke="rgba(120,180,255,0.18)" strokeWidth="1" fill="none">
        {[0.85, 0.92, 0.99].map((rr, i) => (
          <ellipse key={i} cx={cx} cy={cy} rx={r * rr} ry={r * rr * 0.9} />
        ))}
        {[-0.6, -0.3, 0, 0.3, 0.6].map((a, i) => {
          const x1 = cx + r * Math.sin(a);
          const y1 = cy - r * Math.cos(a);
          return <line key={i} x1={cx} y1={cy} x2={x1} y2={y1} />;
        })}
      </g>
    </svg>
  );
}

// Satellite + solar panels (simplified Sentinel-1 silhouette)
function Satellite({ x, y, localTime }) {
  return (
    <g style={{ transform: `translate(${x}px, ${y}px)`, position: 'absolute' }}>
      <svg width="240" height="120" style={{ position: 'absolute', left: -120, top: -60, overflow: 'visible' }}>
        {/* Solar panels */}
        <rect x={-80} y={-12} width={70} height={24} fill="#0e1a30" stroke={PALETTE.cool} strokeWidth="1.2"/>
        <rect x={130} y={-12} width={70} height={24} fill="#0e1a30" stroke={PALETTE.cool} strokeWidth="1.2"/>
        {/* panel cells */}
        {[0,1,2,3,4].map(i => (
          <line key={`l${i}`} x1={-80 + i*14} y1={-12} x2={-80 + i*14} y2={12} stroke={PALETTE.cool} strokeOpacity="0.4"/>
        ))}
        {[0,1,2,3,4].map(i => (
          <line key={`r${i}`} x1={130 + i*14} y1={-12} x2={130 + i*14} y2={12} stroke={PALETTE.cool} strokeOpacity="0.4"/>
        ))}
        {/* Body */}
        <rect x={-12} y={-22} width={24} height={44} fill="#1a2540" stroke={PALETTE.ink} strokeWidth="1.5"/>
        {/* SAR antenna */}
        <rect x={50} y={-4} width={70} height={8} fill={PALETTE.cool} opacity="0.4" stroke={PALETTE.cool} strokeWidth="1"/>
        <rect x={-120} y={-4} width={70} height={8} fill={PALETTE.cool} opacity="0.4" stroke={PALETTE.cool} strokeWidth="1"/>
        {/* Status LED */}
        <circle cx={0} cy={-26} r={3} fill={PALETTE.signal}>
          <animate attributeName="opacity" values="0.3;1;0.3" dur="1.2s" repeatCount="indefinite"/>
        </circle>
        {/* Designator */}
        <text x={20} y={-30} fill={PALETTE.inkDim} fontFamily={MONO} fontSize="11" letterSpacing="0.18em">SAR-1A</text>
      </svg>
      {/* Trail */}
      <svg width="1920" height="80" style={{ position: 'absolute', left: -1900, top: -2, overflow: 'visible' }}>
        <line x1={0} y1={2} x2={1900} y2={2} stroke={PALETTE.cool} strokeWidth="1" strokeDasharray="4 6" opacity="0.4"/>
      </svg>
    </g>
  );
}

// Radar beam — dashed cone from sat to ground swath
function RadarBeam({ x, y, pulse }) {
  // Side-looking incidence ~33° to the right
  const groundY = 760;
  const offset = (groundY - y) * Math.tan((33 * Math.PI) / 180);
  const swathHalf = 110;
  const gx = x + offset;
  return (
    <svg width="1920" height="1080" style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
      <defs>
        <linearGradient id="beamGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgba(255,180,84,0.0)"/>
          <stop offset="40%" stopColor={`rgba(255,180,84,${0.18 * pulse})`}/>
          <stop offset="100%" stopColor={`rgba(255,59,59,${0.35 * pulse})`}/>
        </linearGradient>
      </defs>
      <polygon
        points={`${x},${y + 8} ${gx - swathHalf},${groundY} ${gx + swathHalf},${groundY}`}
        fill="url(#beamGrad)"
        stroke={PALETTE.warm}
        strokeWidth="1"
        opacity={pulse}
      />
      {/* beam edge dashes */}
      <line x1={x} y1={y + 8} x2={gx - swathHalf} y2={groundY} stroke={PALETTE.warm} strokeWidth="1" strokeDasharray="2 6" opacity={0.6}/>
      <line x1={x} y1={y + 8} x2={gx + swathHalf} y2={groundY} stroke={PALETTE.warm} strokeWidth="1" strokeDasharray="2 6" opacity={0.6}/>
      {/* swath footprint */}
      <ellipse cx={gx} cy={groundY} rx={swathHalf} ry={14} fill="none" stroke={PALETTE.hot} strokeWidth="1.5" opacity={pulse}/>
      <ellipse cx={gx} cy={groundY} rx={swathHalf * 0.6} ry={9}  fill={PALETTE.hot} opacity={0.15 * pulse}/>
      {/* footprint label */}
      <text x={gx + swathHalf + 14} y={groundY + 5} fill={PALETTE.hot} fontFamily={MONO} fontSize="13" letterSpacing="0.16em">
        FOOTPRINT · 250 km SWATH
      </text>
    </svg>
  );
}

function Telemetry({ localTime, satX }) {
  const opacity = animate({ from: 0, to: 1, start: 0.5, end: 1.1 })(localTime);
  // Live pseudo-coords
  const lat = 38.41 + Math.sin(localTime * 0.7) * 0.02;
  const lon = 27.13 + (satX - 200) / 1420 * 0.4;
  return (
    <div style={{
      position: 'absolute', left: 120, bottom: 120,
      fontFamily: MONO, fontSize: 14, color: PALETTE.ink,
      letterSpacing: '0.14em', lineHeight: 1.8,
      opacity,
    }}>
      <div style={{ color: PALETTE.inkDim, fontSize: 12, marginBottom: 8 }}>TELEMETRY · NADIR TRACK</div>
      <Row label="LAT" value={lat.toFixed(4) + '°N'} />
      <Row label="LON" value={lon.toFixed(4) + '°E'} />
      <Row label="ALT" value="693.0 km"/>
      <Row label="V"   value="7.45 km/s"/>
      <Row label="LOOK" value="33.1°"/>
      <div style={{ marginTop: 14, color: PALETTE.signal, fontSize: 13 }}>
        ► ACQUIRING SAR · {Math.floor(animate({from:0,to:847,start:0.8,end:2.8})(localTime))} MB
      </div>
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div style={{ display: 'flex', gap: 18 }}>
      <span style={{ color: PALETTE.inkDim, width: 60 }}>{label}</span>
      <span style={{ color: PALETTE.ink, fontVariantNumeric: 'tabular-nums' }}>{value}</span>
    </div>
  );
}

Object.assign(window, { Scene2Satellite });
