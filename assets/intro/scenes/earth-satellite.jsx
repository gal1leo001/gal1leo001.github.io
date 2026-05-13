// Earth + orbiting satellite scene

// Earth: rendered as a soft sphere with continent outlines drawn from
// abstracted polygons (no real geography needed, just suggestive shapes).
function Earth({ cx = 960, cy = 540, r = 280, rotation = 0, scanY = null, scanIntensity = 1 }) {
  // Continent silhouettes — abstract, not geographic
  const continents = [
    'M -120 -80 Q -60 -110 0 -90 Q 50 -70 80 -100 Q 110 -120 130 -90 Q 150 -50 110 -30 Q 80 -10 60 -40 Q 20 -20 -40 -30 Q -100 -40 -120 -80 Z',
    'M -180 20 Q -140 0 -100 30 Q -70 60 -90 100 Q -120 130 -160 110 Q -200 80 -180 20 Z',
    'M 60 40 Q 110 30 150 60 Q 180 100 160 140 Q 130 170 90 160 Q 50 140 60 40 Z',
    'M -40 80 Q 0 70 20 100 Q 30 130 0 140 Q -30 130 -40 80 Z',
  ];

  return (
    <g transform={`translate(${cx} ${cy})`}>
      {/* Glow halo */}
      <circle r={r + 60} fill="url(#earth-halo)" opacity="0.5"/>
      <circle r={r + 18} fill="none" stroke="rgba(122, 166, 255, 0.25)" strokeWidth="1"/>

      {/* Earth sphere */}
      <circle r={r} fill="url(#earth-sphere)"/>

      {/* Latitude/longitude grid clipped to sphere */}
      <clipPath id="earth-clip">
        <circle r={r}/>
      </clipPath>
      <g clipPath="url(#earth-clip)" stroke="rgba(122, 166, 255, 0.22)" fill="none" strokeWidth="0.7">
        {/* longitudes */}
        {Array.from({ length: 12 }).map((_, i) => {
          const phase = (i / 12) * Math.PI * 2 + rotation;
          const rx = Math.abs(Math.cos(phase)) * r;
          if (rx < 1) return null;
          return <ellipse key={`lng${i}`} cx={0} cy={0} rx={rx} ry={r}/>;
        })}
        {/* latitudes */}
        {Array.from({ length: 9 }).map((_, i) => {
          const lat = (i - 4) * (r / 5);
          const ry = Math.sqrt(Math.max(0, r * r - lat * lat)) * 0.18;
          return <ellipse key={`lat${i}`} cx={0} cy={lat} rx={Math.sqrt(Math.max(0, r * r - lat * lat))} ry={ry}/>;
        })}
      </g>

      {/* Continent silhouettes — rotate as a group */}
      <g clipPath="url(#earth-clip)" transform={`rotate(${rotation * 30})`}>
        {continents.map((d, i) => (
          <path key={i} d={d} fill="rgba(90, 143, 214, 0.32)" stroke="rgba(150, 195, 255, 0.5)" strokeWidth="0.6"
                transform={`scale(${r / 200}) translate(${i * 5}, ${i * -8})`}/>
        ))}
      </g>

      {/* Scan line sweeping across the visible disk */}
      {scanY !== null && (
        <g clipPath="url(#earth-clip)">
          <line x1={-r} y1={scanY} x2={r} y2={scanY}
                stroke="#7ee0ff" strokeWidth="2" opacity={0.9 * scanIntensity}/>
          <rect x={-r} y={scanY - 40} width={r * 2} height={40}
                fill="url(#scan-fade)" opacity={0.6 * scanIntensity}/>
        </g>
      )}

      {/* Atmosphere rim */}
      <circle r={r} fill="none" stroke="rgba(150, 200, 255, 0.4)" strokeWidth="2" opacity="0.6"/>
      <circle r={r + 4} fill="none" stroke="rgba(120, 170, 230, 0.2)" strokeWidth="6" opacity="0.5"/>
    </g>
  );
}

// Satellite: small geometric body with two solar panels.
// Drawn at given angle/orbit radius around (cx, cy).
function Satellite({ cx, cy, orbitR, angle, beam = 0 }) {
  const x = cx + Math.cos(angle) * orbitR;
  const y = cy + Math.sin(angle) * orbitR * 0.55; // ellipse for perspective
  const tilt = (angle * 180) / Math.PI;

  // Beam target on Earth surface (toward center)
  const dx = cx - x, dy = cy - y;
  const len = Math.sqrt(dx * dx + dy * dy);
  const ux = dx / len, uy = dy / len;
  const earthR = 280;
  const tx = cx - ux * earthR;
  const ty = cy - uy * earthR;

  return (
    <g>
      {/* Beam */}
      {beam > 0 && (
        <g opacity={beam}>
          <defs>
            <linearGradient id={`beam-grad-${Math.round(angle * 100)}`}
                            x1={x} y1={y} x2={tx} y2={ty} gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#7ee0ff" stopOpacity="0.95"/>
              <stop offset="100%" stopColor="#7ee0ff" stopOpacity="0"/>
            </linearGradient>
          </defs>
          <polygon points={`${x-2},${y} ${x+2},${y} ${tx+18},${ty} ${tx-18},${ty}`}
                   fill={`url(#beam-grad-${Math.round(angle * 100)})`}/>
          <line x1={x} y1={y} x2={tx} y2={ty} stroke="#7ee0ff" strokeWidth="0.8" opacity="0.6"/>
        </g>
      )}

      <g transform={`translate(${x} ${y}) rotate(${tilt + 90})`}>
        {/* Solar panels */}
        <rect x={-28} y={-3} width={20} height={6} fill="#1a2940" stroke="#5a8fd6" strokeWidth="0.5"/>
        <rect x={8} y={-3} width={20} height={6} fill="#1a2940" stroke="#5a8fd6" strokeWidth="0.5"/>
        <line x1={-28} y1={0} x2={-8} y2={0} stroke="#7aa6ff" strokeWidth="0.3" opacity="0.6"/>
        <line x1={8} y1={0} x2={28} y2={0} stroke="#7aa6ff" strokeWidth="0.3" opacity="0.6"/>
        {/* Body */}
        <rect x={-6} y={-5} width={12} height={10} fill="#243a5c" stroke="#a8c5f0" strokeWidth="0.6"/>
        <rect x={-3} y={-3} width={6} height={6} fill="#7ee0ff" opacity="0.7"/>
        {/* Antenna */}
        <line x1={0} y1={-5} x2={0} y2={-12} stroke="#a8c5f0" strokeWidth="0.5"/>
        <circle cx={0} cy={-13} r={1.2} fill="#7ee0ff"/>
      </g>

      {/* Tracking ring */}
      <circle cx={x} cy={y} r="14" fill="none" stroke="rgba(126, 224, 255, 0.4)" strokeWidth="0.6"/>
    </g>
  );
}

// Earth scene wrapper with all gradients defined
function EarthScene({ scale = 1, rotation = 0, satAngle, beam, scanProgress = null, opacity = 1, cx = 960, cy = 540 }) {
  const r = 280;
  const scanY = scanProgress !== null ? -r + scanProgress * r * 2 : null;
  const orbitR = r + 90;

  return (
    <svg
      width="1920" height="1080"
      style={{
        position: 'absolute', inset: 0,
        opacity,
        transformOrigin: `${cx}px ${cy}px`,
        transform: `scale(${scale})`,
      }}
    >
      <defs>
        <radialGradient id="earth-sphere" cx="35%" cy="35%" r="75%">
          <stop offset="0%" stopColor="#1e3a6b"/>
          <stop offset="40%" stopColor="#0f2447"/>
          <stop offset="80%" stopColor="#06122a"/>
          <stop offset="100%" stopColor="#020812"/>
        </radialGradient>
        <radialGradient id="earth-halo" cx="50%" cy="50%" r="50%">
          <stop offset="60%" stopColor="rgba(80, 130, 210, 0)"/>
          <stop offset="80%" stopColor="rgba(100, 150, 230, 0.18)"/>
          <stop offset="100%" stopColor="rgba(100, 150, 230, 0)"/>
        </radialGradient>
        <linearGradient id="scan-fade" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#7ee0ff" stopOpacity="0"/>
          <stop offset="100%" stopColor="#7ee0ff" stopOpacity="0.5"/>
        </linearGradient>
      </defs>

      {/* Orbit path */}
      <ellipse cx={cx} cy={cy} rx={orbitR} ry={orbitR * 0.55}
               fill="none" stroke="rgba(126, 224, 255, 0.18)" strokeWidth="0.8" strokeDasharray="3 4"/>

      <Earth cx={cx} cy={cy} r={r} rotation={rotation} scanY={scanY}/>

      {satAngle !== undefined && (
        <Satellite cx={cx} cy={cy} orbitR={orbitR} angle={satAngle} beam={beam}/>
      )}
    </svg>
  );
}

Object.assign(window, { Earth, Satellite, EarthScene });
