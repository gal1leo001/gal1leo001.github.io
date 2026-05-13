// Scene 3: Data beams transforming into layered maps + spectral overlays.
// Stacked isometric "tiles" representing data layers, with gridlines, contours,
// and chromatic spectral bands.

function DataLayers({ progress = 0, cx = 960, cy = 560 }) {
  // Layers stack vertically with parallax. progress 0..1 reveals each in turn.
  const layers = [
    { label: 'TOPOGRAPHY',     fill: 'rgba(20, 40, 80, 0.85)',  accent: '#7aa6ff', kind: 'topo' },
    { label: 'SPECTRAL · SWIR', fill: 'rgba(40, 25, 70, 0.85)', accent: '#c884ff', kind: 'spectral' },
    { label: 'GEOSPATIAL',     fill: 'rgba(15, 50, 70, 0.85)',  accent: '#7ee0ff', kind: 'geo' },
    { label: 'TARGET MODEL',   fill: 'rgba(60, 30, 25, 0.85)',  accent: '#ff9a6b', kind: 'target' },
  ];

  const layerW = 520;
  const layerH = 320;
  const skewX = -22;   // degrees (visual, via transform)
  const skewY = 12;
  const stepY = 70;

  return (
    <div style={{
      position: 'absolute', inset: 0,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      pointerEvents: 'none',
    }}>
      <div style={{
        position: 'relative',
        width: layerW, height: layerH + stepY * (layers.length - 1),
        transform: 'perspective(1400px) rotateX(54deg) rotateZ(-32deg)',
        transformStyle: 'preserve-3d',
      }}>
        {layers.map((L, i) => {
          // each layer reveals at i*0.18 .. i*0.18 + 0.4
          const start = i * 0.16;
          const end = start + 0.45;
          const t = clamp((progress - start) / (end - start), 0, 1);
          const eased = Easing.easeOutCubic(t);
          const z = i * 90;
          const opacity = eased;
          const ty = (1 - eased) * -120;

          return (
            <div key={i} style={{
              position: 'absolute',
              left: 0, top: 0,
              width: layerW, height: layerH,
              transform: `translateZ(${z}px) translateY(${ty}px)`,
              opacity,
            }}>
              <DataLayerCard width={layerW} height={layerH} kind={L.kind} accent={L.accent} fill={L.fill} label={L.label} progress={t}/>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function DataLayerCard({ width, height, kind, accent, fill, label, progress }) {
  return (
    <div style={{
      width, height,
      background: fill,
      border: `1px solid ${accent}`,
      boxShadow: `0 0 60px ${accent}33, inset 0 0 80px rgba(255,255,255,0.04)`,
      position: 'relative',
      overflow: 'hidden',
    }}>
      <svg width={width} height={height} style={{ position: 'absolute', inset: 0 }}>
        {kind === 'topo' && <TopoLayerSVG w={width} h={height} accent={accent} progress={progress}/>}
        {kind === 'spectral' && <SpectralLayerSVG w={width} h={height} accent={accent} progress={progress}/>}
        {kind === 'geo' && <GeoLayerSVG w={width} h={height} accent={accent} progress={progress}/>}
        {kind === 'target' && <TargetLayerSVG w={width} h={height} accent={accent} progress={progress}/>}
      </svg>

      {/* Label badge — counter-rotate so it's readable */}
      <div style={{
        position: 'absolute',
        left: 14, top: 12,
        fontFamily: 'ui-monospace, "JetBrains Mono", monospace',
        fontSize: 11,
        letterSpacing: '0.22em',
        color: accent,
        textTransform: 'uppercase',
        opacity: 0.95,
        textShadow: `0 0 10px ${accent}`,
      }}>
        {label}
      </div>
    </div>
  );
}

function TopoLayerSVG({ w, h, accent, progress }) {
  return (
    <g stroke={accent} fill="none" strokeWidth="0.7" opacity={0.85}>
      {Array.from({ length: 14 }).map((_, i) => {
        const baseY = 30 + i * (h - 60) / 13;
        const points = Array.from({ length: 30 }).map((_, j) => {
          const x = j * (w / 29);
          const y = baseY + Math.sin(j * 0.4 + i * 0.7) * 12 + Math.cos(j * 0.18 + i * 1.3) * 8;
          return `${j === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
        }).join(' ');
        return <path key={i} d={points} opacity={0.4 + (i % 3) * 0.2}/>;
      })}
    </g>
  );
}

function SpectralLayerSVG({ w, h, accent, progress }) {
  // Horizontal spectral bands with gradient hues
  const bands = [
    { hue: 'rgba(255, 100, 80, 0.5)', y: 30 },
    { hue: 'rgba(255, 200, 100, 0.5)', y: 80 },
    { hue: 'rgba(160, 255, 140, 0.5)', y: 130 },
    { hue: 'rgba(120, 220, 255, 0.5)', y: 180 },
    { hue: 'rgba(180, 130, 255, 0.55)', y: 230 },
    { hue: 'rgba(255, 120, 200, 0.5)', y: 280 },
  ];
  return (
    <g>
      {bands.map((b, i) => (
        <g key={i}>
          <rect x={0} y={b.y} width={w * progress} height={28} fill={b.hue}/>
          {/* Spectral signature spikes */}
          {Array.from({ length: 50 }).map((_, j) => {
            const x = j * (w / 49);
            const sp = Math.sin(j * 0.4 + i * 1.7) * 10 + Math.cos(j * 1.1 + i * 0.3) * 5;
            return <line key={j} x1={x} y1={b.y + 14} x2={x} y2={b.y + 14 - sp}
                         stroke={accent} strokeWidth="0.5" opacity="0.6"/>;
          })}
        </g>
      ))}
    </g>
  );
}

function GeoLayerSVG({ w, h, accent, progress }) {
  // Map-like polygons + grid
  return (
    <g>
      <defs>
        <pattern id="geo-grid" width="32" height="32" patternUnits="userSpaceOnUse">
          <path d="M 32 0 L 0 0 0 32" fill="none" stroke={accent} strokeWidth="0.4" opacity="0.5"/>
        </pattern>
      </defs>
      <rect width={w} height={h} fill="url(#geo-grid)" opacity="0.6"/>
      {/* Region polygons */}
      <path d="M 60 60 L 180 50 L 240 90 L 220 150 L 140 170 L 70 130 Z"
            fill={accent} fillOpacity="0.18" stroke={accent} strokeWidth="1"/>
      <path d="M 260 80 L 380 70 L 440 130 L 400 200 L 300 210 L 250 150 Z"
            fill={accent} fillOpacity="0.12" stroke={accent} strokeWidth="1"/>
      <path d="M 80 200 L 200 220 L 230 280 L 150 290 L 70 260 Z"
            fill={accent} fillOpacity="0.22" stroke={accent} strokeWidth="1"/>
      <path d="M 320 240 L 440 240 L 470 290 L 360 300 Z"
            fill={accent} fillOpacity="0.15" stroke={accent} strokeWidth="1"/>
      {/* Sample points */}
      {[[120,100],[300,110],[180,240],[400,170],[150,260],[380,260]].map(([x,y],i) => (
        <g key={i}>
          <circle cx={x} cy={y} r="3" fill={accent}/>
          <circle cx={x} cy={y} r="8" fill="none" stroke={accent} strokeWidth="0.5" opacity="0.5"/>
        </g>
      ))}
    </g>
  );
}

function TargetLayerSVG({ w, h, accent, progress }) {
  // Heatmap-like blob clusters indicating ore probability
  return (
    <g>
      <defs>
        <radialGradient id="target-blob" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={accent} stopOpacity="0.7"/>
          <stop offset="60%" stopColor={accent} stopOpacity="0.2"/>
          <stop offset="100%" stopColor={accent} stopOpacity="0"/>
        </radialGradient>
      </defs>
      {[
        [140, 110, 80], [380, 90, 60], [200, 230, 90],
        [400, 220, 70], [280, 160, 50],
      ].map(([x, y, r], i) => (
        <circle key={i} cx={x} cy={y} r={r * progress} fill="url(#target-blob)"/>
      ))}
      {/* Crosshair targets */}
      {[[140, 110], [380, 90], [200, 230]].map(([x, y], i) => (
        <g key={i} opacity={progress}>
          <circle cx={x} cy={y} r="14" fill="none" stroke={accent} strokeWidth="1"/>
          <line x1={x-20} y1={y} x2={x-8} y2={y} stroke={accent} strokeWidth="1"/>
          <line x1={x+8} y1={y} x2={x+20} y2={y} stroke={accent} strokeWidth="1"/>
          <line x1={x} y1={y-20} x2={x} y2={y-8} stroke={accent} strokeWidth="1"/>
          <line x1={x} y1={y+8} x2={x} y2={y+20} stroke={accent} strokeWidth="1"/>
          <circle cx={x} cy={y} r="2" fill={accent}/>
        </g>
      ))}
    </g>
  );
}

Object.assign(window, { DataLayers });
