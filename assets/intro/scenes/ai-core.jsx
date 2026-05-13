// Scene 4: AI Core — central node with data streams flowing in from labeled
// satellites of analysis (geospatial / spectral / topographic / risk).

function AICore({ progress = 0, cx = 960, cy = 540 }) {
  // 6 input nodes orbit around a central core
  const inputs = [
    { label: 'GEOSPATIAL',   angle: -Math.PI/2, dist: 320 },
    { label: 'SPECTRAL',     angle: -Math.PI/6, dist: 320 },
    { label: 'TOPOGRAPHY',   angle: Math.PI/6,  dist: 320 },
    { label: 'AI MODEL',     angle: Math.PI/2,  dist: 320 },
    { label: 'RISK ANALYSIS', angle: 5*Math.PI/6, dist: 320 },
    { label: 'FEASIBILITY',  angle: 7*Math.PI/6, dist: 320 },
  ];

  const time = useTime();
  const corePulse = 1 + Math.sin(time * 2.5) * 0.03;

  return (
    <svg width="1920" height="1080" style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
      <defs>
        <radialGradient id="core-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#7ee0ff" stopOpacity="1"/>
          <stop offset="40%" stopColor="#5a8fd6" stopOpacity="0.6"/>
          <stop offset="100%" stopColor="#5a8fd6" stopOpacity="0"/>
        </radialGradient>
        <radialGradient id="core-inner" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="1"/>
          <stop offset="30%" stopColor="#7ee0ff" stopOpacity="0.95"/>
          <stop offset="100%" stopColor="#1d4a90" stopOpacity="0.9"/>
        </radialGradient>
        <linearGradient id="stream-grad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="rgba(126,224,255,0)"/>
          <stop offset="50%" stopColor="rgba(126,224,255,0.6)"/>
          <stop offset="100%" stopColor="rgba(126,224,255,1)"/>
        </linearGradient>
      </defs>

      {/* Outer rings (ambient) */}
      {[180, 240, 320, 410].map((r, i) => (
        <circle key={r} cx={cx} cy={cy} r={r * progress}
                fill="none"
                stroke="rgba(122, 166, 255, 0.18)"
                strokeWidth="0.7"
                strokeDasharray={i % 2 ? '2 6' : '4 8'}/>
      ))}

      {/* Rotating ring around core */}
      <g transform={`translate(${cx} ${cy}) rotate(${time * 25})`}>
        <circle r="100" fill="none" stroke="rgba(126, 224, 255, 0.35)" strokeWidth="1" strokeDasharray="2 14"/>
      </g>
      <g transform={`translate(${cx} ${cy}) rotate(${-time * 18})`}>
        <circle r="125" fill="none" stroke="rgba(122, 166, 255, 0.22)" strokeWidth="1" strokeDasharray="6 22"/>
      </g>

      {/* Streams flowing inward */}
      {inputs.map((node, i) => {
        const localStart = 0.1 + i * 0.06;
        const t = clamp((progress - localStart) / 0.5, 0, 1);
        if (t <= 0) return null;
        const x = cx + Math.cos(node.angle) * node.dist;
        const y = cy + Math.sin(node.angle) * node.dist;

        // Particle along the line
        const pulse = ((time + i * 0.3) % 1.5) / 1.5;
        const px = x + (cx - x) * pulse;
        const py = y + (cy - y) * pulse;

        return (
          <g key={node.label} opacity={t}>
            {/* Line */}
            <line x1={x} y1={y} x2={cx} y2={cy}
                  stroke="rgba(126, 224, 255, 0.35)" strokeWidth="0.8"/>
            {/* Glowing line segment */}
            <line x1={x + (cx - x) * 0.0} y1={y + (cy - y) * 0.0}
                  x2={x + (cx - x) * pulse} y2={y + (cy - y) * pulse}
                  stroke="#7ee0ff" strokeWidth="1.6" opacity="0.7"/>
            {/* Particle */}
            <circle cx={px} cy={py} r="3" fill="#7ee0ff" opacity="0.95"/>
            <circle cx={px} cy={py} r="6" fill="#7ee0ff" opacity="0.25"/>

            {/* Outer node */}
            <circle cx={x} cy={y} r="5" fill="#0a1628" stroke="#7aa6ff" strokeWidth="1"/>
            <circle cx={x} cy={y} r="14" fill="none" stroke="rgba(122, 166, 255, 0.4)" strokeWidth="0.6"/>

            {/* Label */}
            <NodeLabel x={x} y={y} angle={node.angle} label={node.label}/>
          </g>
        );
      })}

      {/* Core */}
      <g transform={`translate(${cx} ${cy})`}>
        <circle r={120 * corePulse} fill="url(#core-glow)" opacity={progress}/>
        <circle r={50 * corePulse * progress} fill="url(#core-inner)"/>

        {/* Hexagonal core ring */}
        <g opacity={progress}>
          <polygon
            points={hexPoints(0, 0, 32 * corePulse).join(' ')}
            fill="none" stroke="#ffffff" strokeWidth="1.4" opacity="0.85"
            transform={`rotate(${time * 40})`}/>
          <polygon
            points={hexPoints(0, 0, 22 * corePulse).join(' ')}
            fill="none" stroke="#ffffff" strokeWidth="1" opacity="0.7"
            transform={`rotate(${-time * 60})`}/>
          <circle r="6" fill="#ffffff"/>
        </g>
      </g>
    </svg>
  );
}

function NodeLabel({ x, y, angle, label }) {
  // Position label outside the node, away from center
  const offset = 26;
  const lx = x + Math.cos(angle) * offset;
  const ly = y + Math.sin(angle) * offset;
  // Anchor based on which side
  const anchor = Math.cos(angle) > 0.3 ? 'start'
                : Math.cos(angle) < -0.3 ? 'end' : 'middle';
  return (
    <text x={lx} y={ly + 4}
          textAnchor={anchor}
          fontFamily='ui-monospace, "JetBrains Mono", monospace'
          fontSize="11"
          letterSpacing="3"
          fill="rgba(200, 220, 255, 0.85)">
      {label}
    </text>
  );
}

function hexPoints(cx, cy, r) {
  return Array.from({ length: 6 }).map((_, i) => {
    const a = (i / 6) * Math.PI * 2 - Math.PI / 2;
    return `${(cx + Math.cos(a) * r).toFixed(1)},${(cy + Math.sin(a) * r).toFixed(1)}`;
  });
}

Object.assign(window, { AICore, hexPoints });
