// Shared visual primitives for the InSAR intro scenes.
// All components assume a 1920×1080 stage with the InSAR palette.

const PALETTE = {
  void:      '#05070d',
  voidEdge:  '#0b0f1a',
  ink:       '#e8eef7',
  inkDim:    '#7a8597',
  grid:      'rgba(120,180,255,0.10)',
  gridStrong:'rgba(120,180,255,0.22)',
  hot:       '#ff3b3b',
  warm:      '#ffb454',
  cool:      '#3aa6ff',
  cold:      '#5dffd2',
  signal:    '#9dff5d',
  fringe1:   '#ff3366',
  fringe2:   '#ffb800',
  fringe3:   '#3affb8',
  fringe4:   '#3aa6ff',
  fringe5:   '#a060ff',
};

const MONO = 'JetBrains Mono, ui-monospace, SFMono-Regular, Menlo, monospace';
const SANS = 'Inter, system-ui, sans-serif';

// ── Starfield ────────────────────────────────────────────────────────────────
// Static random stars — seeded so they don't reshuffle every render.
const STAR_SEED = (() => {
  // simple LCG for deterministic pseudo-random stars
  let s = 1337;
  const rnd = () => { s = (s * 9301 + 49297) % 233280; return s / 233280; };
  const stars = [];
  for (let i = 0; i < 220; i++) {
    stars.push({
      x: rnd() * 1920,
      y: rnd() * 1080,
      r: 0.4 + rnd() * 1.6,
      o: 0.2 + rnd() * 0.8,
      tw: rnd() * Math.PI * 2, // twinkle phase
    });
  }
  return stars;
})();

function Starfield({ opacity = 1 }) {
  const t = useTime();
  return (
    <svg
      width="1920" height="1080"
      style={{ position: 'absolute', inset: 0, opacity, pointerEvents: 'none' }}
    >
      {STAR_SEED.map((s, i) => {
        const tw = 0.6 + 0.4 * Math.sin(t * 1.5 + s.tw);
        return (
          <circle
            key={i}
            cx={s.x} cy={s.y} r={s.r}
            fill="#cfe1ff"
            opacity={s.o * tw}
          />
        );
      })}
    </svg>
  );
}

// ── Coordinate grid (subtle) ─────────────────────────────────────────────────
function CoordGrid({ opacity = 1, spacing = 80 }) {
  const lines = [];
  for (let x = 0; x <= 1920; x += spacing) lines.push(['v', x]);
  for (let y = 0; y <= 1080; y += spacing) lines.push(['h', y]);
  return (
    <svg width="1920" height="1080" style={{ position: 'absolute', inset: 0, opacity, pointerEvents: 'none' }}>
      {lines.map(([kind, p], i) => kind === 'v'
        ? <line key={i} x1={p} y1={0} x2={p} y2={1080} stroke={PALETTE.grid} strokeWidth="1" />
        : <line key={i} x1={0} y1={p} x2={1920} y2={p} stroke={PALETTE.grid} strokeWidth="1" />
      )}
    </svg>
  );
}

// ── Corner brackets / HUD chrome ─────────────────────────────────────────────
function HUDFrame({ opacity = 1, label = '' }) {
  const stroke = PALETTE.gridStrong;
  const arm = 60;
  const inset = 40;
  const Bracket = ({ x, y, dx, dy }) => (
    <g stroke={stroke} strokeWidth="1.5" fill="none">
      <line x1={x} y1={y} x2={x + dx * arm} y2={y} />
      <line x1={x} y1={y} x2={x} y2={y + dy * arm} />
    </g>
  );
  return (
    <svg width="1920" height="1080" style={{ position: 'absolute', inset: 0, opacity, pointerEvents: 'none' }}>
      <Bracket x={inset}        y={inset}        dx={1}  dy={1}  />
      <Bracket x={1920 - inset} y={inset}        dx={-1} dy={1}  />
      <Bracket x={inset}        y={1080 - inset} dx={1}  dy={-1} />
      <Bracket x={1920 - inset} y={1080 - inset} dx={-1} dy={-1} />
      {label && (
        <text x={inset + 8} y={inset - 12} fill={PALETTE.inkDim} fontFamily={MONO} fontSize="13" letterSpacing="0.18em">
          {label}
        </text>
      )}
    </svg>
  );
}

// ── Scanline / film grain overlay ────────────────────────────────────────────
function Scanlines({ opacity = 0.06 }) {
  return (
    <div style={{
      position: 'absolute', inset: 0,
      backgroundImage: 'repeating-linear-gradient(0deg, rgba(255,255,255,0.06) 0 1px, transparent 1px 3px)',
      mixBlendMode: 'overlay',
      opacity,
      pointerEvents: 'none',
    }}/>
  );
}

// ── Mono terminal-style readout line with typewriter reveal ──────────────────
function ReadoutLine({ text, x, y, size = 16, color = PALETTE.signal, charDelay = 0.025, startDelay = 0, blinkAfter = true }) {
  const { localTime } = useSprite();
  const t = Math.max(0, localTime - startDelay);
  const charsShown = Math.floor(t / charDelay);
  const visible = text.slice(0, charsShown);
  const showCursor = blinkAfter && Math.floor(t * 2) % 2 === 0;
  return (
    <div style={{
      position: 'absolute', left: x, top: y,
      fontFamily: MONO, fontSize: size, color,
      letterSpacing: '0.04em', whiteSpace: 'pre',
    }}>
      {visible}
      <span style={{ opacity: showCursor ? 1 : 0 }}>▌</span>
    </div>
  );
}

// ── Animated value counter (ticks toward target) ─────────────────────────────
function CountUp({ from = 0, to = 100, start = 0, end = 1, decimals = 0, prefix = '', suffix = '', ease = Easing.easeOutCubic, style }) {
  const t = useTime();
  const fn = animate({ from, to, start, end, ease });
  const v = fn(t);
  return (
    <span style={style}>
      {prefix}{v.toFixed(decimals)}{suffix}
    </span>
  );
}

Object.assign(window, {
  PALETTE, MONO, SANS,
  Starfield, CoordGrid, HUDFrame, Scanlines,
  ReadoutLine, CountUp,
});
