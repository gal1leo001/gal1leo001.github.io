// Topographic background — subtle contour lines + grid + noise
// Always-on layer that lives behind every scene.

function TopoBackground() {
  const time = useTime();

  // Slow drift
  const drift = time * 4;

  return (
    <div style={{
      position: 'absolute', inset: 0,
      background: 'radial-gradient(ellipse at 50% 50%, #0a1628 0%, #050a18 55%, #02050d 100%)',
      overflow: 'hidden',
    }}>
      {/* Topographic contour lines (SVG, slowly drifting) */}
      <svg
        width="1920" height="1080" viewBox="0 0 1920 1080"
        style={{ position: 'absolute', inset: 0, opacity: 0.18 }}
      >
        <defs>
          <radialGradient id="topo-fade" cx="50%" cy="50%" r="60%">
            <stop offset="0%" stopColor="#7aa6ff" stopOpacity="1"/>
            <stop offset="100%" stopColor="#7aa6ff" stopOpacity="0"/>
          </radialGradient>
          <mask id="topo-mask">
            <rect width="1920" height="1080" fill="url(#topo-fade)"/>
          </mask>
        </defs>
        <g mask="url(#topo-mask)" stroke="#5a8fd6" strokeWidth="0.8" fill="none" opacity="0.7">
          {Array.from({ length: 22 }).map((_, i) => {
            const seed = i * 137.5;
            const baseY = 60 + i * 48;
            const path = Array.from({ length: 60 }).map((_, j) => {
              const x = j * 32.2;
              const y = baseY
                + Math.sin((j * 0.18) + (seed * 0.01) + drift * 0.02) * (40 + i * 2)
                + Math.cos((j * 0.07) + (seed * 0.02)) * 20;
              return `${j === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
            }).join(' ');
            return <path key={i} d={path} opacity={0.25 + (i % 4) * 0.15}/>;
          })}
        </g>
      </svg>

      {/* Coordinate grid */}
      <svg
        width="1920" height="1080"
        style={{ position: 'absolute', inset: 0, opacity: 0.08 }}
      >
        <defs>
          <pattern id="grid-fine" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#6da3e8" strokeWidth="0.5"/>
          </pattern>
          <pattern id="grid-coarse" width="200" height="200" patternUnits="userSpaceOnUse">
            <path d="M 200 0 L 0 0 0 200" fill="none" stroke="#6da3e8" strokeWidth="1"/>
          </pattern>
        </defs>
        <rect width="1920" height="1080" fill="url(#grid-fine)"/>
        <rect width="1920" height="1080" fill="url(#grid-coarse)"/>
      </svg>

      {/* Vignette */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'radial-gradient(ellipse at 50% 50%, transparent 40%, rgba(0,0,0,0.6) 100%)',
        pointerEvents: 'none',
      }}/>

      {/* Subtle noise grain */}
      <div style={{
        position: 'absolute', inset: 0,
        opacity: 0.04,
        backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%270 0 200 200%27 xmlns=%27http://www.w3.org/2000/svg%27%3E%3Cfilter id=%27n%27%3E%3CfeTurbulence type=%27fractalNoise%27 baseFrequency=%270.9%27/%3E%3C/filter%3E%3Crect width=%27100%25%27 height=%27100%25%27 filter=%27url(%23n)%27/%3E%3C/svg%3E")',
        mixBlendMode: 'overlay',
      }}/>
    </div>
  );
}

// Pulse: concentric expanding rings from a point
function SignalPulse({ x, y, color = '#5a8fd6', delay = 0, period = 3, max = 280, count = 3 }) {
  const time = useTime();
  return (
    <svg style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }} width="1920" height="1080">
      {Array.from({ length: count }).map((_, i) => {
        const t = ((time - delay - i * (period / count)) % period) / period;
        if (t < 0 || t > 1) return null;
        const r = t * max;
        const op = (1 - t) * 0.5;
        return <circle key={i} cx={x} cy={y} r={r} fill="none" stroke={color} strokeWidth="1" opacity={op}/>;
      })}
      <circle cx={x} cy={y} r="3" fill={color} opacity="0.9"/>
    </svg>
  );
}

// Corner HUD bracket
function HUDBracket({ x, y, w = 60, h = 40, color = 'rgba(122, 166, 255, 0.45)' }) {
  return (
    <svg style={{ position: 'absolute', left: x, top: y, pointerEvents: 'none' }} width={w} height={h}>
      <path d={`M 0 ${h*0.4} L 0 0 L ${w*0.4} 0`} stroke={color} strokeWidth="1" fill="none"/>
      <path d={`M ${w} ${h*0.4} L ${w} 0 L ${w*0.6} 0`} stroke={color} strokeWidth="1" fill="none"/>
      <path d={`M 0 ${h*0.6} L 0 ${h} L ${w*0.4} ${h}`} stroke={color} strokeWidth="1" fill="none"/>
      <path d={`M ${w} ${h*0.6} L ${w} ${h} L ${w*0.6} ${h}`} stroke={color} strokeWidth="1" fill="none"/>
    </svg>
  );
}

// Persistent corner UI: timestamp, coordinate readouts, system labels
function FrameUI({ opacity = 1 }) {
  const time = useTime();
  const tick = Math.floor(time * 10);
  const lat = (39.9334 + Math.sin(time * 0.3) * 0.0004).toFixed(4);
  const lon = (32.8597 + Math.cos(time * 0.25) * 0.0004).toFixed(4);

  const mono = 'ui-monospace, "JetBrains Mono", "SF Mono", monospace';
  const labelStyle = {
    fontFamily: mono,
    fontSize: 11,
    letterSpacing: '0.18em',
    color: 'rgba(180, 210, 255, 0.55)',
    textTransform: 'uppercase',
    fontWeight: 500,
  };

  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', opacity }}>
      {/* Top-left: system identifier */}
      <div style={{ position: 'absolute', left: 48, top: 80, ...labelStyle }}>
        <div style={{ color: 'rgba(220, 235, 255, 0.85)', fontWeight: 600 }}>ANZURA / SYS-01</div>
        <div style={{ marginTop: 4 }}>ORBITAL DECISION SUPPORT</div>
      </div>

      {/* Top-right: timestamp */}
      <div style={{ position: 'absolute', right: 48, top: 80, textAlign: 'right', ...labelStyle }}>
        <div style={{ color: 'rgba(220, 235, 255, 0.85)' }}>T+{String(tick).padStart(5, '0')}</div>
        <div style={{ marginTop: 4 }}>UTC · STREAM ACTIVE</div>
      </div>

      {/* Bottom-left: coordinates */}
      <div style={{ position: 'absolute', left: 48, bottom: 80, ...labelStyle }}>
        <div>LAT {lat}°N</div>
        <div style={{ marginTop: 4 }}>LON {lon}°E</div>
      </div>

      {/* Bottom-right: status */}
      <div style={{ position: 'absolute', right: 48, bottom: 80, textAlign: 'right', ...labelStyle }}>
        <div>SCAN · NOMINAL</div>
        <div style={{ marginTop: 4 }}>SIGNAL · 0.98</div>
      </div>

      {/* Corner brackets — also inside the safe zone */}
      <HUDBracket x={24} y={68}/>
      <HUDBracket x={1920 - 84} y={68}/>
      <HUDBracket x={24} y={1080 - 108}/>
      <HUDBracket x={1920 - 84} y={1080 - 108}/>
    </div>
  );
}

Object.assign(window, { TopoBackground, SignalPulse, HUDBracket, FrameUI });
