// Scene 5: Outputs — target identification, risk analysis, digital feasibility.
// Three side-by-side analytical panels emerging from the AI core.

function OutputPanels({ progress = 0 }) {
  const panels = [
    {
      title: 'TARGET DETECTION',
      kind: 'target',
      sub: 'Cu-Au-Mo · CONFIDENCE 0.94',
      x: 240,
    },
    {
      title: 'RISK ANALYSIS',
      kind: 'risk',
      sub: 'GEOLOGICAL · ENVIRONMENTAL',
      x: 760,
    },
    {
      title: 'DIGITAL FEASIBILITY',
      kind: 'feasibility',
      sub: 'NPV · IRR · CAPEX MODEL',
      x: 1280,
    },
  ];

  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
      {panels.map((p, i) => {
        const start = i * 0.12;
        const t = clamp((progress - start) / 0.55, 0, 1);
        const eased = Easing.easeOutCubic(t);
        return (
          <div key={i} style={{
            position: 'absolute',
            left: p.x, top: 290,
            width: 400, height: 500,
            opacity: eased,
            transform: `translateY(${(1 - eased) * 40}px)`,
          }}>
            <OutputCard {...p} progress={t}/>
          </div>
        );
      })}
    </div>
  );
}

function OutputCard({ title, sub, kind, progress }) {
  return (
    <div style={{
      width: '100%', height: '100%',
      background: 'linear-gradient(180deg, rgba(15,30,55,0.78) 0%, rgba(8,18,38,0.88) 100%)',
      border: '1px solid rgba(122, 166, 255, 0.28)',
      backdropFilter: 'blur(6px)',
      boxShadow: '0 0 40px rgba(40, 80, 160, 0.25), inset 0 0 60px rgba(80,140,255,0.04)',
      padding: 24,
      position: 'relative',
      overflow: 'hidden',
      fontFamily: 'ui-monospace, "JetBrains Mono", monospace',
      color: '#dceaff',
    }}>
      {/* Corner brackets */}
      <CornerBrackets/>

      {/* Header */}
      <div style={{
        fontSize: 11,
        letterSpacing: '0.28em',
        color: 'rgba(160, 195, 245, 0.7)',
        marginBottom: 6,
      }}>
        OUTPUT MODULE · 0{kind === 'target' ? '1' : kind === 'risk' ? '2' : '3'}
      </div>
      <div style={{
        fontSize: 22,
        fontFamily: 'Inter, system-ui, sans-serif',
        fontWeight: 600,
        letterSpacing: '0.04em',
        color: '#ffffff',
        marginBottom: 6,
      }}>
        {title}
      </div>
      <div style={{
        fontSize: 11,
        letterSpacing: '0.18em',
        color: 'rgba(126, 224, 255, 0.85)',
        marginBottom: 22,
      }}>
        {sub}
      </div>

      {/* Visualization */}
      <div style={{ position: 'relative', height: 240 }}>
        {kind === 'target' && <TargetViz progress={progress}/>}
        {kind === 'risk' && <RiskViz progress={progress}/>}
        {kind === 'feasibility' && <FeasibilityViz progress={progress}/>}
      </div>

      {/* Footer metrics */}
      <div style={{ marginTop: 22, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        {kind === 'target' && (
          <>
            <Metric label="ANOMALIES" value={Math.floor(7 * progress)}/>
            <Metric label="PRIORITY" value={progress > 0.6 ? 'HIGH' : '—'}/>
          </>
        )}
        {kind === 'risk' && (
          <>
            <Metric label="SCORE" value={(0.27 * progress).toFixed(2)}/>
            <Metric label="STATUS" value={progress > 0.5 ? 'LOW' : '—'}/>
          </>
        )}
        {kind === 'feasibility' && (
          <>
            <Metric label="NPV" value={progress > 0.6 ? '+$184M' : '—'}/>
            <Metric label="IRR" value={progress > 0.6 ? '21.4%' : '—'}/>
          </>
        )}
      </div>
    </div>
  );
}

function CornerBrackets() {
  const c = 'rgba(122, 166, 255, 0.6)';
  const sz = 12;
  const s = { position: 'absolute', width: sz, height: sz };
  return (
    <>
      <div style={{ ...s, left: 8, top: 8, borderLeft: `1px solid ${c}`, borderTop: `1px solid ${c}` }}/>
      <div style={{ ...s, right: 8, top: 8, borderRight: `1px solid ${c}`, borderTop: `1px solid ${c}` }}/>
      <div style={{ ...s, left: 8, bottom: 8, borderLeft: `1px solid ${c}`, borderBottom: `1px solid ${c}` }}/>
      <div style={{ ...s, right: 8, bottom: 8, borderRight: `1px solid ${c}`, borderBottom: `1px solid ${c}` }}/>
    </>
  );
}

function Metric({ label, value }) {
  return (
    <div>
      <div style={{ fontSize: 10, letterSpacing: '0.22em', color: 'rgba(160, 195, 245, 0.55)' }}>{label}</div>
      <div style={{
        fontSize: 18,
        fontFamily: 'Inter, system-ui, sans-serif',
        fontWeight: 500,
        color: '#ffffff',
        marginTop: 2,
      }}>{value}</div>
    </div>
  );
}

// — Target viz: heatmap blobs + crosshairs over a small map
function TargetViz({ progress }) {
  const t = useTime();
  return (
    <svg viewBox="0 0 360 240" style={{ width: '100%', height: '100%' }}>
      <defs>
        <pattern id="tv-grid" width="20" height="20" patternUnits="userSpaceOnUse">
          <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(122,166,255,0.18)" strokeWidth="0.4"/>
        </pattern>
        <radialGradient id="tv-blob" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#ff9a6b" stopOpacity="0.8"/>
          <stop offset="60%" stopColor="#ff9a6b" stopOpacity="0.18"/>
          <stop offset="100%" stopColor="#ff9a6b" stopOpacity="0"/>
        </radialGradient>
      </defs>
      <rect width="360" height="240" fill="rgba(10,22,40,0.4)"/>
      <rect width="360" height="240" fill="url(#tv-grid)"/>
      {/* Region polygon */}
      <path d="M 40 60 L 140 40 L 220 80 L 280 60 L 320 120 L 280 190 L 180 210 L 80 180 L 40 130 Z"
            fill="rgba(122,166,255,0.06)" stroke="rgba(122,166,255,0.5)" strokeWidth="0.8"/>
      {/* Heat blobs */}
      {[[110, 100, 50], [240, 130, 40], [180, 80, 30]].map(([x, y, r], i) => (
        <circle key={i} cx={x} cy={y} r={r * progress} fill="url(#tv-blob)"/>
      ))}
      {/* Crosshairs */}
      {[[110, 100], [240, 130], [180, 80]].map(([x, y], i) => (
        <g key={i} opacity={Math.max(0, progress - 0.35) / 0.65}>
          <circle cx={x} cy={y} r={10 + Math.sin(t * 2 + i) * 1.5}
                  fill="none" stroke="#ff9a6b" strokeWidth="1"/>
          <line x1={x-16} y1={y} x2={x-12} y2={y} stroke="#ff9a6b" strokeWidth="1"/>
          <line x1={x+12} y1={y} x2={x+16} y2={y} stroke="#ff9a6b" strokeWidth="1"/>
          <line x1={x} y1={y-16} x2={x} y2={y-12} stroke="#ff9a6b" strokeWidth="1"/>
          <line x1={x} y1={y+12} x2={x} y2={y+16} stroke="#ff9a6b" strokeWidth="1"/>
          <circle cx={x} cy={y} r="1.5" fill="#ff9a6b"/>
        </g>
      ))}
    </svg>
  );
}

// — Risk viz: radial chart with risk axes
function RiskViz({ progress }) {
  const axes = ['GEO', 'ENV', 'OPS', 'REG', 'INFRA', 'SOCIAL'];
  const values = [0.28, 0.22, 0.31, 0.18, 0.34, 0.21]; // low risk
  const cx = 180, cy = 120, R = 92;

  const points = axes.map((_, i) => {
    const a = (i / axes.length) * Math.PI * 2 - Math.PI / 2;
    const r = values[i] * R * progress + (R - values[i] * R) * 0; // value*R from center
    const px = cx + Math.cos(a) * r;
    const py = cy + Math.sin(a) * r;
    return `${px.toFixed(1)},${py.toFixed(1)}`;
  }).join(' ');

  return (
    <svg viewBox="0 0 360 240" style={{ width: '100%', height: '100%' }}>
      <rect width="360" height="240" fill="rgba(10,22,40,0.4)"/>
      {/* Concentric rings */}
      {[0.25, 0.5, 0.75, 1].map((s, i) => (
        <circle key={i} cx={cx} cy={cy} r={R * s}
                fill="none" stroke="rgba(122,166,255,0.18)" strokeWidth="0.5"/>
      ))}
      {/* Axes + labels */}
      {axes.map((ax, i) => {
        const a = (i / axes.length) * Math.PI * 2 - Math.PI / 2;
        const ex = cx + Math.cos(a) * R;
        const ey = cy + Math.sin(a) * R;
        const lx = cx + Math.cos(a) * (R + 16);
        const ly = cy + Math.sin(a) * (R + 16);
        return (
          <g key={i}>
            <line x1={cx} y1={cy} x2={ex} y2={ey} stroke="rgba(122,166,255,0.25)" strokeWidth="0.5"/>
            <text x={lx} y={ly + 3} textAnchor="middle"
                  fontSize="9" letterSpacing="2"
                  fill="rgba(160,195,245,0.7)"
                  fontFamily='ui-monospace, monospace'>{ax}</text>
          </g>
        );
      })}
      {/* Filled polygon */}
      <polygon points={points}
               fill="rgba(126, 224, 255, 0.22)"
               stroke="#7ee0ff"
               strokeWidth="1.2"/>
      {axes.map((_, i) => {
        const a = (i / axes.length) * Math.PI * 2 - Math.PI / 2;
        const r = values[i] * R * progress;
        return <circle key={i} cx={cx + Math.cos(a) * r} cy={cy + Math.sin(a) * r}
                       r="2.5" fill="#7ee0ff"/>;
      })}
    </svg>
  );
}

// — Feasibility viz: cashflow bars + IRR curve
function FeasibilityViz({ progress }) {
  const years = 8;
  const cashflows = [-65, -40, 18, 42, 58, 71, 64, 52]; // $M
  const maxV = 85;
  const w = 360, h = 240;
  const left = 30, right = 20, top = 24, bottom = 36;
  const plotW = w - left - right;
  const plotH = h - top - bottom;
  const zeroY = top + plotH * 0.5;

  return (
    <svg viewBox={`0 0 ${w} ${h}`} style={{ width: '100%', height: '100%' }}>
      <rect width={w} height={h} fill="rgba(10,22,40,0.4)"/>
      {/* Zero axis */}
      <line x1={left} y1={zeroY} x2={w - right} y2={zeroY}
            stroke="rgba(122,166,255,0.4)" strokeWidth="0.6"/>
      {/* Bars */}
      {cashflows.map((cf, i) => {
        const barT = clamp(progress * years - i, 0, 1);
        const barW = plotW / years - 8;
        const x = left + i * (plotW / years) + 4;
        const ratio = (cf / maxV) * (plotH * 0.5) * barT;
        const y = ratio < 0 ? zeroY : zeroY - ratio;
        const height = Math.abs(ratio);
        const positive = cf >= 0;
        return (
          <rect key={i} x={x} y={y} width={barW} height={height}
                fill={positive ? '#7ee0ff' : '#ff7a7a'}
                opacity={0.85}/>
        );
      })}
      {/* Cumulative line */}
      <CumulativeLine cashflows={cashflows} maxV={maxV} progress={progress}
                       left={left} top={top} plotW={plotW} plotH={plotH} zeroY={zeroY} years={years}/>
      {/* X labels */}
      {Array.from({ length: years }).map((_, i) => (
        <text key={i} x={left + i * (plotW / years) + (plotW / years) / 2}
              y={h - 14} textAnchor="middle"
              fontSize="9" fill="rgba(160,195,245,0.55)"
              fontFamily='ui-monospace, monospace'>Y{i + 1}</text>
      ))}
    </svg>
  );
}

function CumulativeLine({ cashflows, maxV, progress, left, top, plotW, plotH, zeroY, years }) {
  let cum = 0;
  const cumMax = 200;
  const points = cashflows.map((cf, i) => {
    cum += cf;
    const x = left + i * (plotW / years) + (plotW / years) / 2;
    const y = zeroY - (cum / cumMax) * (plotH * 0.5);
    return [x, y];
  });
  const visible = clamp(progress * 1.1, 0, 1);
  const visibleCount = Math.floor(visible * years);
  const path = points.slice(0, visibleCount + 1).map(([x, y], i) => `${i === 0 ? 'M' : 'L'} ${x} ${y}`).join(' ');
  return (
    <g>
      <path d={path} fill="none" stroke="#a8c5f0" strokeWidth="1.4"/>
      {points.slice(0, visibleCount + 1).map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="2" fill="#ffffff"/>
      ))}
    </g>
  );
}

Object.assign(window, { OutputPanels });
