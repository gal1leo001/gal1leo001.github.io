// intro-scenes.jsx — ANZURA 30s intro scenes
// Loaded after animations.jsx, so Stage/Sprite/useTime/useSprite/Easing/interpolate/animate/clamp are global.

// ─── Theme ──────────────────────────────────────────────────────────────────
const T = {
  paper: '#f1ede4',
  paper2: '#e8e3d6',
  ink: '#14110d',
  ink2: '#2a251e',
  rule: '#28231b',
  muted: '#6b6458',
  accent: '#b8551f',
  accent2: '#d6a44a',
  serif: "'Newsreader', Georgia, serif",
  sans: "'Inter Tight', system-ui, sans-serif",
  mono: "'JetBrains Mono', ui-monospace, monospace",
};

// ─── Discipline data ────────────────────────────────────────────────────────
const DISCIPLINES = [
  {
    n: '01',
    tr: ['3D Haritalama &', 'Topografik Model'],
    en: '3D Mapping · Photogrammetry',
    tag: 'İHA · LiDAR · DEM',
    stats: [
      {k: 'GSD', v: '2.4 cm/px'},
      {k: 'Yüzey', v: '128 ha'},
      {k: 'Veri', v: '4.7 GB'},
    ],
    Icon: IconTopo,
  },
  {
    n: '02',
    tr: ['Sondaj &', 'Jeokimyasal Analiz'],
    en: 'Drilling · Geochemistry',
    tag: 'QA/QC · Lab Zinciri',
    stats: [
      {k: 'Sondaj', v: '12 442 m'},
      {k: 'Numune', v: '8 360'},
      {k: 'QA/QC', v: 'ISO 17025'},
    ],
    Icon: IconDrill,
  },
  {
    n: '03',
    tr: ['3D Cevher Modeli &', 'Kaynak Raporu'],
    en: 'Resource Modelling',
    tag: 'JORC · NI 43-101',
    stats: [
      {k: 'Blok', v: '5 × 5 × 5 m'},
      {k: 'Kestirim', v: 'OK · Kriging'},
      {k: 'Sınıf', v: 'M+I+I'},
    ],
    Icon: IconBlock,
  },
  {
    n: '04',
    tr: ['Maden Geliştirme &', 'CAPEX Modeli'],
    en: 'Process & Feasibility',
    tag: 'NPV · IRR · Akış',
    stats: [
      {k: 'NPV @ 8%', v: '$ 412 M'},
      {k: 'IRR', v: '24.7 %'},
      {k: 'LOM', v: '14 yıl'},
    ],
    Icon: IconPit,
  },
  {
    n: '05',
    tr: ['Şev, Tahkimat &', 'Yeraltı Suyu'],
    en: 'Geotechnics · Hydrogeology',
    tag: 'Stabilite · Akım Modeli',
    stats: [
      {k: 'FoS · Statik', v: '1.34'},
      {k: 'FoS · Dinamik', v: '1.08'},
      {k: 'k', v: '3·10⁻⁶ m/s'},
    ],
    Icon: IconSlope,
  },
  {
    n: '06',
    tr: ['Çevresel İzleme &', 'Uyum'],
    en: 'Environmental Compliance',
    tag: 'ÇED · Su · Hava',
    stats: [
      {k: 'İzleme', v: '148 nokta'},
      {k: 'ÇED', v: 'Onaylı · 2026 Q1'},
      {k: 'Frekans', v: '7/24'},
    ],
    Icon: IconEnv,
  },
];

// ─── Scene timing (seconds) ─────────────────────────────────────────────────
const TL = {
  cold:    { start: 0,    end: 3.0  },
  setup:   { start: 2.6,  end: 5.4  },
  // 6 disciplines, 2.4s each, slight overlap
  d:       Array.from({length:6}, (_,i) => ({ start: 5.2 + i*2.45, end: 5.2 + i*2.45 + 2.55 })),
  chain:   { start: 19.9, end: 24.4 },
  logo:    { start: 23.9, end: 30.0 },
};

// ═══════════════════════════════════════════════════════════════════════════
// PAPER BACKGROUND — animated subtle texture, registration marks, top bar
// ═══════════════════════════════════════════════════════════════════════════
function PaperBackground() {
  const t = useTime();
  // gentle paper tone shift through the intro
  return (
    <div style={{
      position: 'absolute', inset: 0,
      background: T.paper,
      overflow: 'hidden',
    }}>
      {/* fine grid */}
      <svg width="100%" height="100%" style={{position:'absolute',inset:0,opacity:0.18}}>
        <defs>
          <pattern id="grid" width="48" height="48" patternUnits="userSpaceOnUse">
            <path d="M 48 0 L 0 0 0 48" fill="none" stroke={T.ink} strokeWidth="0.4"/>
          </pattern>
          <pattern id="grid-major" width="240" height="240" patternUnits="userSpaceOnUse">
            <path d="M 240 0 L 0 0 0 240" fill="none" stroke={T.ink} strokeWidth="0.8"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
        <rect width="100%" height="100%" fill="url(#grid-major)" />
      </svg>
      {/* paper grain */}
      <div style={{
        position:'absolute', inset:0,
        backgroundImage: `radial-gradient(rgba(20,17,13,0.06) 1px, transparent 1px)`,
        backgroundSize: '3px 3px',
        mixBlendMode: 'multiply',
      }}/>
      {/* vignette */}
      <div style={{
        position:'absolute', inset:0,
        background: 'radial-gradient(ellipse at center, transparent 50%, rgba(20,17,13,0.14) 100%)',
        pointerEvents:'none',
      }}/>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// PERSISTENT CHROME — top + bottom bars w/ ref no, coords, ticker
// ═══════════════════════════════════════════════════════════════════════════
function Chrome() {
  const t = useTime();
  // appears at ~0.3s, persists, fades out at end during logo
  const opacity = interpolate(
    [0, 0.3, 0.9, TL.logo.start, TL.logo.start + 0.6],
    [0, 0, 1, 1, 0],
    Easing.easeInOutCubic
  )(t);

  // animated frame counter (fake telemetry)
  const frame = Math.floor(t * 24);
  const tc = `${String(Math.floor(t/60)).padStart(2,'0')}:${(t%60).toFixed(2).padStart(5,'0')}`;

  return (
    <div style={{position:'absolute', inset:0, opacity, pointerEvents:'none'}}>
      {/* top bar */}
      <div style={{
        position:'absolute', top: 28, left: 56, right: 56,
        display:'flex', justifyContent:'space-between', alignItems:'center',
        fontFamily: T.mono, fontSize: 12, letterSpacing:'0.14em',
        textTransform:'uppercase', color: T.ink,
      }}>
        <span style={{display:'flex',gap:18,alignItems:'center'}}>
          <span style={{display:'inline-block', width:7, height:7, background:T.accent, borderRadius:'50%'}}/>
          <span>REF / ANZ-26-TR</span>
          <span style={{opacity:0.4}}>·</span>
          <span>39.7477° N · 37.0179° E</span>
        </span>
        <span style={{display:'flex',gap:18,alignItems:'center'}}>
          <span style={{opacity:0.55}}>SIVAS · CUMHURIYET TEKNOKENT</span>
          <span style={{opacity:0.4}}>·</span>
          <span style={{minWidth:78, textAlign:'right'}}>{tc}</span>
        </span>
      </div>
      {/* hairline */}
      <div style={{position:'absolute', top:60, left:56, right:56, height:1, background:T.ink, opacity:0.25}}/>

      {/* bottom bar */}
      <div style={{
        position:'absolute', bottom: 28, left: 56, right: 56,
        display:'flex', justifyContent:'space-between', alignItems:'center',
        fontFamily: T.mono, fontSize: 12, letterSpacing:'0.14em',
        textTransform:'uppercase', color: T.ink,
      }}>
        <span style={{opacity:0.55}}>ANZURA · MADENCİLİK VE MÜHENDİSLİK A.Ş.</span>
        <span style={{display:'flex',gap:24,opacity:0.55}}>
          <span>JORC 2012</span>
          <span>NI 43-101</span>
          <span>ISO 9001</span>
          <span>ÇED</span>
        </span>
        <span style={{opacity:0.55}}>EST. 2024</span>
      </div>
      <div style={{position:'absolute', bottom:60, left:56, right:56, height:1, background:T.ink, opacity:0.25}}/>

      {/* corner brackets */}
      <CornerBrackets />
    </div>
  );
}

function CornerBrackets() {
  const sz = 16;
  const off = 56;
  const c = T.ink;
  const w = 1.2;
  const corner = (top, left, rx, ry) => (
    <div style={{
      position:'absolute', top, left,
      width: sz, height: sz,
      borderTop: `${w}px solid ${c}`,
      borderLeft: `${w}px solid ${c}`,
      transform: `rotate(${ry}deg)`,
      transformOrigin: 'center',
      opacity: 0.6,
    }}/>
  );
  // Use four divs each rotated to make brackets
  const Bracket = ({top, bottom, left, right, rot}) => (
    <div style={{
      position:'absolute',
      ...(top !== undefined ? {top} : {}),
      ...(bottom !== undefined ? {bottom} : {}),
      ...(left !== undefined ? {left} : {}),
      ...(right !== undefined ? {right} : {}),
      width: sz, height: sz,
      transform: `rotate(${rot}deg)`,
      borderTop: `${w}px solid ${c}`,
      borderLeft: `${w}px solid ${c}`,
      opacity: 0.5,
    }}/>
  );
  return (
    <>
      <Bracket top={88} left={56} rot={0} />
      <Bracket top={88} right={56} rot={90} />
      <Bracket bottom={88} left={56} rot={270} />
      <Bracket bottom={88} right={56} rot={180} />
    </>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// SCENE 1 — COLD OPEN  (0–3s)
// "REF / ANZ-26-TR ▸ INTRODUCTION SEQUENCE"
// then the question
// ═══════════════════════════════════════════════════════════════════════════
function ColdOpen() {
  return (
    <Sprite start={TL.cold.start} end={TL.cold.end + 0.4}>
      {({ localTime }) => {
        const t = localTime;
        // line draws horizontally
        const lineW = interpolate([0.2, 1.4], [0, 1], Easing.easeInOutCubic)(t);
        const labelOp = interpolate([0.5, 1.0, 2.6, 2.9], [0, 1, 1, 0], Easing.easeOutCubic)(t);
        const numOp = interpolate([0.8, 1.4, 2.6, 2.9], [0, 1, 1, 0], Easing.easeOutCubic)(t);

        return (
          <div style={{
            position:'absolute', inset:0,
            display:'flex', flexDirection:'column',
            alignItems:'center', justifyContent:'center',
          }}>
            {/* Top hairline reveal */}
            <div style={{
              width: 720, height: 1, background: T.ink,
              transform: `scaleX(${lineW})`, transformOrigin:'left center',
              opacity: 0.7,
              marginBottom: 44,
            }}/>

            <div style={{
              fontFamily: T.mono, fontSize: 13, letterSpacing:'0.32em',
              color: T.ink, opacity: labelOp, marginBottom: 28,
              textTransform:'uppercase',
            }}>
              <span style={{color: T.accent}}>§</span>&nbsp;&nbsp;Tanıtım sekansı  ·  Introduction sequence
            </div>

            {/* Big monogram number */}
            <div style={{
              fontFamily: T.serif, fontStyle:'italic', fontWeight: 300,
              fontSize: 220, lineHeight: 0.9, color: T.ink,
              opacity: numOp, letterSpacing:'-0.04em',
              marginTop: 12, marginBottom: 12,
            }}>
              00<span style={{color: T.accent}}>.</span>
            </div>

            <div style={{
              fontFamily: T.mono, fontSize: 12, letterSpacing:'0.32em',
              color: T.muted, opacity: labelOp, textTransform:'uppercase',
            }}>
              30 sn  ·  6 disiplin  ·  1 zincir
            </div>

            <div style={{
              width: 720, height: 1, background: T.ink,
              transform: `scaleX(${lineW})`, transformOrigin:'right center',
              opacity: 0.7, marginTop: 44,
            }}/>
          </div>
        );
      }}
    </Sprite>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// SCENE 2 — SETUP LINE  (~2.6–5.4s)
// "Yer altı kaynakları, yüzeyden görünmez."
// ═══════════════════════════════════════════════════════════════════════════
function SetupLine() {
  return (
    <Sprite start={TL.setup.start} end={TL.setup.end}>
      {({ localTime, duration }) => {
        const t = localTime;
        const exit = duration - 0.4;
        // staggered word reveal
        const words = ['Yer', 'altı', 'kaynakları', 'yüzeyden', 'görünmez.'];
        const opOut = t > exit ? 1 - clamp((t - exit) / 0.4, 0, 1) : 1;

        const enOp = interpolate([1.0, 1.6, exit, exit+0.4], [0, 1, 1, 0])(t);

        return (
          <div style={{
            position:'absolute', inset:0,
            display:'flex', flexDirection:'column',
            alignItems:'center', justifyContent:'center',
            opacity: opOut,
          }}>
            <div style={{
              fontFamily: T.serif, fontStyle:'italic', fontWeight: 300,
              fontSize: 92, lineHeight: 1.15, color: T.ink,
              letterSpacing:'-0.02em',
              maxWidth: 1400, textAlign:'center',
            }}>
              {words.map((w, i) => {
                const wt = interpolate(
                  [0.2 + i*0.12, 0.7 + i*0.12],
                  [0, 1],
                  Easing.easeOutCubic
                )(t);
                return (
                  <span key={i} style={{
                    display:'inline-block',
                    opacity: wt,
                    transform: `translateY(${(1-wt)*16}px)`,
                    marginRight: 18,
                    color: w === 'görünmez.' ? T.accent : T.ink,
                  }}>{w}</span>
                );
              })}
            </div>
            <div style={{
              marginTop: 40,
              fontFamily: T.mono, fontSize: 13, letterSpacing:'0.28em',
              color: T.muted, textTransform:'uppercase',
              opacity: enOp,
            }}>
              Subsurface resources are invisible from the surface.
            </div>
          </div>
        );
      }}
    </Sprite>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// SCENE 3 — DISCIPLINE CARD (×6, 5.2–19.9s)
// Each card: big number, schematic SVG icon, TR title, EN sub
// ═══════════════════════════════════════════════════════════════════════════
function DisciplineCard({ idx }) {
  const d = DISCIPLINES[idx];
  const tl = TL.d[idx];
  return (
    <Sprite start={tl.start} end={tl.end}>
      {({ localTime, duration }) => {
        const t = localTime;
        const exit = duration - 0.5;

        const sceneT = interpolate([0, 0.4], [0, 1], Easing.easeOutCubic)(t);
        const numT  = interpolate([0.05, 0.55], [0, 1], Easing.easeOutCubic)(t);
        const titleT = interpolate([0.35, 1.05], [0, 1], Easing.easeOutCubic)(t);
        const enT  = interpolate([0.55, 1.2], [0, 1], Easing.easeOutCubic)(t);
        const tagT = interpolate([0.8, 1.4], [0, 1], Easing.easeOutCubic)(t);
        const iconT = interpolate([0.25, 1.6], [0, 1], Easing.easeOutCubic)(t);

        const opOut = t > exit ? 1 - clamp((t - exit) / 0.5, 0, 1) : 1;
        const stepProg = clamp(t / (duration - 0.5), 0, 1);
        const Icon = d.Icon;

        // hold progress used by icons for slow drift / data updates while card is on screen
        const holdT = clamp((t - 1.4) / Math.max(0.001, duration - 1.4 - 0.5), 0, 1);

        return (
          <div style={{position:'absolute', inset:0, opacity: opOut}}>

            {/* === FULL-BLEED SCHEMATIC LAYER === */}
            <div style={{position:'absolute', inset:0}}>
              <Icon progress={iconT} holdT={holdT} />
            </div>

            {/* === DARKENING GRADIENT for legibility on right side === */}
            <div style={{
              position:'absolute', inset:0,
              background: `linear-gradient(90deg, ${T.paper} 0%, ${T.paper}f0 28%, ${T.paper}80 48%, transparent 70%)`,
              pointerEvents:'none',
            }}/>

            {/* === STEP INDICATOR === */}
            <div style={{
              position:'absolute', top: 100, left: 56, right: 56,
              display:'flex', alignItems:'center', gap: 10,
              opacity: sceneT,
            }}>
              {DISCIPLINES.map((_, i) => {
                const active = i === idx;
                const past = i < idx;
                const fill = active ? stepProg : (past ? 1 : 0);
                return (
                  <div key={i} style={{flex:1, height:2, background: T.ink, opacity: 0.15, position:'relative'}}>
                    <div style={{
                      position:'absolute', inset:0,
                      background: active ? T.accent : T.ink,
                      transform: `scaleX(${fill})`,
                      transformOrigin: 'left',
                    }}/>
                  </div>
                );
              })}
            </div>

            {/* === TEXT BLOCK on left, anchored against schematic === */}
            <div style={{
              position:'absolute', left: 96, top: '50%',
              transform: 'translateY(-50%)',
              maxWidth: 720,
            }}>
              {/* Eyebrow with section + total */}
              <div style={{
                display:'flex', alignItems:'center', gap: 14,
                fontFamily: T.mono, fontSize: 12, letterSpacing:'0.32em',
                color: T.ink, textTransform:'uppercase',
                opacity: numT,
                marginBottom: 20,
              }}>
                <span style={{
                  display:'inline-block', width:6, height:6, background: T.accent,
                }}/>
                <span>§ {d.n} / 06</span>
                <span style={{opacity:0.4}}>·</span>
                <span style={{opacity:0.7}}>Disiplin</span>
                <span style={{opacity:0.4}}>·</span>
                <span style={{opacity:0.7}}>{d.tag}</span>
              </div>

              {/* Display number — large, italic serif, but compact */}
              <div style={{
                fontFamily: T.serif, fontStyle:'italic', fontWeight: 300,
                fontSize: 160, lineHeight: 0.85, color: T.ink,
                letterSpacing:'-0.04em',
                opacity: numT,
                transform: `translateY(${(1-numT)*20}px)`,
                marginBottom: 12,
                position: 'relative',
              }}>
                {d.n}
                <span style={{
                  position:'absolute', left: 'calc(100% + 8px)', bottom: 24,
                  fontFamily: T.mono, fontStyle:'normal', fontSize: 11,
                  letterSpacing:'0.24em', color: T.muted, fontWeight:400,
                }}>
                  / VI
                </span>
              </div>

              {/* hairline */}
              <div style={{
                width: 200, height: 1, background: T.ink, opacity: 0.3,
                transform: `scaleX(${titleT})`, transformOrigin:'left',
                marginBottom: 28,
              }}/>

              {/* Title TR */}
              <h2 style={{
                margin: 0,
                fontFamily: T.sans, fontWeight: 500,
                fontSize: 64, lineHeight: 1.0, color: T.ink,
                letterSpacing:'-0.022em',
                opacity: titleT,
                transform: `translateY(${(1-titleT)*14}px)`,
                marginBottom: 18,
              }}>
                {d.tr.map((line, i) => (
                  <span key={i} style={{display:'block'}}>
                    {line.split('&').map((part, j, arr) => (
                      <React.Fragment key={j}>
                        {part}
                        {j < arr.length - 1 && (
                          <em style={{
                            fontFamily: T.serif, fontStyle:'italic',
                            fontWeight: 300, color: T.accent,
                          }}> & </em>
                        )}
                      </React.Fragment>
                    ))}
                  </span>
                ))}
              </h2>

              {/* Subtitle EN */}
              <div style={{
                fontFamily: T.serif, fontStyle:'italic', fontWeight: 300,
                fontSize: 28, color: T.muted, opacity: enT,
                transform: `translateY(${(1-enT)*8}px)`,
                marginBottom: 28,
                letterSpacing:'-0.005em',
              }}>
                {d.en}
              </div>

              {/* Status footer — fake telemetry */}
              <div style={{
                display:'flex', gap: 28, alignItems:'flex-start',
                opacity: tagT,
                transform: `translateY(${(1-tagT)*6}px)`,
              }}>
                {(d.stats || [
                  {k: 'Status', v: 'Active'},
                  {k: 'Standard', v: d.tag.split(' · ')[0] || '—'},
                ]).map((s, i) => (
                  <div key={i}>
                    <div style={{
                      fontFamily: T.mono, fontSize: 10, letterSpacing:'0.28em',
                      color: T.muted, textTransform:'uppercase', marginBottom: 6,
                    }}>{s.k}</div>
                    <div style={{
                      fontFamily: T.serif, fontStyle:'italic', fontWeight: 300,
                      fontSize: 22, color: T.ink, letterSpacing:'-0.01em',
                    }}>{s.v}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* === RIGHT-EDGE TICKER label, vertical === */}
            <div style={{
              position:'absolute', right: 80, top: '50%',
              transform: 'translateY(-50%) rotate(90deg)',
              transformOrigin: 'right center',
              fontFamily: T.mono, fontSize: 11, letterSpacing:'0.4em',
              color: T.ink, opacity: tagT * 0.45,
              textTransform:'uppercase', whiteSpace:'nowrap',
            }}>
              FIG. {d.n} · {d.en}
            </div>
          </div>
        );
      }}
    </Sprite>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// SCHEMATIC ICONS — full-bleed 1920×1080. Anchored to right side; left ~720px
// is reserved for the text block (handled by gradient fade in DisciplineCard).
// Each takes `progress` (entry 0..1) and `holdT` (slow drift while card is on screen).
// ═══════════════════════════════════════════════════════════════════════════

function IconShell({ children, progress }) {
  return (
    <div style={{
      position:'absolute', inset:0,
      opacity: progress,
    }}>
      <svg viewBox="0 0 1920 1080" width="100%" height="100%"
        preserveAspectRatio="xMidYMid slice"
        style={{display:'block'}}>
        {children}
      </svg>
    </div>
  );
}

// Helper: tiny crosshair marker
function Crosshair({ cx, cy, r=8, c=T.accent, op=1 }) {
  return (
    <g opacity={op}>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke={c} strokeWidth="1.4"/>
      <line x1={cx-r-4} y1={cy} x2={cx-r+2} y2={cy} stroke={c} strokeWidth="1.4"/>
      <line x1={cx+r-2} y1={cy} x2={cx+r+4} y2={cy} stroke={c} strokeWidth="1.4"/>
      <line x1={cx} y1={cy-r-4} x2={cx} y2={cy-r+2} stroke={c} strokeWidth="1.4"/>
      <line x1={cx} y1={cy+r-2} x2={cx} y2={cy+r+4} stroke={c} strokeWidth="1.4"/>
    </g>
  );
}

// 01 — Topographic contour map (full-bleed, anchored right)
function IconTopo({ progress, holdT }) {
  const reveal = clamp(progress, 0, 1);
  const dash = 6000;
  // Origin shifted right; map fills 760..1820 horizontally
  const cx = 1290, cy = 540;
  // Generate 14 concentric warped contours
  const rings = [];
  for (let i = 0; i < 14; i++) {
    const r = 80 + i * 38;
    const pts = [];
    const seg = 56;
    for (let j = 0; j <= seg; j++) {
      const a = (j / seg) * Math.PI * 2;
      const noise = Math.sin(a * 3 + i * 0.7) * (12 + i * 1.2)
                  + Math.cos(a * 5 + i * 0.4) * (8 + i * 0.8);
      const rr = r + noise;
      pts.push([cx + Math.cos(a) * rr * 1.15, cy + Math.sin(a) * rr * 0.78]);
    }
    rings.push(pts.map((p,k) => (k===0?'M':'L') + p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join(' ') + ' Z');
  }
  return (
    <IconShell progress={progress}>
      {/* sweep grid */}
      <g opacity={reveal * 0.18}>
        {Array.from({length: 24}).map((_,i) => (
          <line key={'h'+i} x1="760" y1={i*48} x2="1920" y2={i*48} stroke={T.ink} strokeWidth="0.4"/>
        ))}
        {Array.from({length: 24}).map((_,i) => (
          <line key={'v'+i} x1={760+i*48} y1="0" x2={760+i*48} y2="1080" stroke={T.ink} strokeWidth="0.4"/>
        ))}
      </g>
      {/* contour rings */}
      {rings.map((d, i) => (
        <path key={i} d={d}
          fill="none"
          stroke={i >= 11 ? T.accent : (i >= 8 ? '#8a6238' : T.ink)}
          strokeWidth={i >= 11 ? 1.6 : (i % 3 === 0 ? 1.1 : 0.7)}
          strokeDasharray={dash}
          strokeDashoffset={dash * (1 - clamp(reveal * 1.4 - i*0.04, 0, 1))}
          opacity={i >= 11 ? 0.95 : (i >= 8 ? 0.7 : 0.42)}
        />
      ))}

      {/* drone flight path — serpentine */}
      <path d="M 820 180 L 1780 180 L 1780 240 L 820 240 L 820 300 L 1780 300 L 1780 360 L 820 360 L 820 420 L 1780 420"
        fill="none" stroke={T.accent} strokeWidth="1.2" strokeDasharray="6 6"
        strokeDashoffset={dash * (1 - clamp((reveal - 0.4) * 2, 0, 1))}
        strokeDasharray="6 6"
        opacity={clamp((reveal - 0.4) * 2, 0, 1) * 0.55}/>

      {/* drone icon traveling */}
      {(() => {
        const tProg = clamp((reveal - 0.5) * 1.6 + holdT * 0.6, 0, 1);
        const dx = 820 + tProg * 960;
        const dy = 180 + Math.floor(tProg * 4) * 60;
        return (
          <g opacity={clamp((reveal - 0.5) * 3, 0, 1)} transform={`translate(${dx}, ${dy})`}>
            <circle r="9" fill={T.paper} stroke={T.accent} strokeWidth="1.6"/>
            <circle r="3" fill={T.accent}/>
            <line x1="-22" y1="0" x2="-12" y2="0" stroke={T.accent} strokeWidth="1.4"/>
            <line x1="12" y1="0" x2="22" y2="0" stroke={T.accent} strokeWidth="1.4"/>
          </g>
        );
      })()}

      {/* Peak marker + label */}
      <g opacity={clamp((reveal - 0.7) * 3, 0, 1)}>
        <Crosshair cx={cx} cy={cy} r={14}/>
        <line x1={cx + 18} y1={cy - 18} x2={cx + 120} y2={cy - 80} stroke={T.accent} strokeWidth="1"/>
        <line x1={cx + 120} y1={cy - 80} x2={cx + 280} y2={cy - 80} stroke={T.accent} strokeWidth="1"/>
        <text x={cx + 130} y={cy - 90} fontFamily={T.mono} fontSize="14" letterSpacing="3" fill={T.muted}>SUMMIT · 39.748°N</text>
        <text x={cx + 130} y={cy - 56} fontFamily={T.serif} fontStyle="italic" fontSize="36" fontWeight="300" fill={T.ink}>2 184 m</text>
      </g>

      {/* Bottom scale & legend */}
      <g opacity={clamp((reveal - 0.5) * 2, 0, 1)} transform="translate(820, 980)">
        <line x1="0" y1="0" x2="280" y2="0" stroke={T.ink} strokeWidth="1.4"/>
        {Array.from({length:6}).map((_,i)=>(
          <line key={i} x1={i*56} y1="-4" x2={i*56} y2="4" stroke={T.ink} strokeWidth="1.2"/>
        ))}
        <text x="0" y="22" fontFamily={T.mono} fontSize="12" letterSpacing="2" fill={T.muted}>0</text>
        <text x="280" y="22" fontFamily={T.mono} fontSize="12" letterSpacing="2" fill={T.muted}>500 m</text>
      </g>

      {/* Top-right meta plate */}
      <g opacity={clamp((reveal - 0.6) * 3, 0, 1)} transform="translate(1620, 110)">
        <line x1="0" y1="0" x2="220" y2="0" stroke={T.ink} strokeWidth="1"/>
        <text x="0" y="22" fontFamily={T.mono} fontSize="11" letterSpacing="2.5" fill={T.muted}>UAV / LIDAR</text>
        <text x="0" y="46" fontFamily={T.mono} fontSize="11" letterSpacing="2.5" fill={T.muted}>EPSG: 5254</text>
        <text x="0" y="70" fontFamily={T.mono} fontSize="11" letterSpacing="2.5" fill={T.muted}>GSD 2.4 cm/px</text>
      </g>
    </IconShell>
  );
}

// 02 — Drill core columns (full-bleed, anchored right)
function IconDrill({ progress, holdT }) {
  const reveal = clamp(progress, 0, 1);
  const columns = [
    { x: 920, dh: 'BH-247', segs: [
      { y: 120, h: 90, fill: '#c4ad84', label: 'OVERBURDEN' },
      { y: 210, h: 110, fill: '#8a7253', label: 'BRECCIA' },
      { y: 320, h: 90, fill: '#5a4a35', label: 'ALTERED' },
      { y: 410, h: 130, fill: '#b8551f', label: 'SULFIDE · Cu' },
      { y: 540, h: 100, fill: '#3d342a', label: 'MASSIVE SX' },
      { y: 640, h: 140, fill: '#7a6a52', label: 'GRANITE' },
      { y: 780, h: 90, fill: '#544738', label: 'BASE' },
    ]},
    { x: 1140, dh: 'BH-249', segs: [
      { y: 120, h: 70, fill: '#c4ad84' },
      { y: 190, h: 130, fill: '#8a7253' },
      { y: 320, h: 110, fill: '#b8551f' },
      { y: 430, h: 80, fill: '#3d342a' },
      { y: 510, h: 160, fill: '#7a6a52' },
      { y: 670, h: 200, fill: '#544738' },
    ]},
    { x: 1300, dh: 'BH-251', segs: [
      { y: 120, h: 100, fill: '#c4ad84' },
      { y: 220, h: 90, fill: '#8a7253' },
      { y: 310, h: 70, fill: '#5a4a35' },
      { y: 380, h: 100, fill: '#b8551f' },
      { y: 480, h: 130, fill: '#3d342a' },
      { y: 610, h: 130, fill: '#7a6a52' },
      { y: 740, h: 130, fill: '#544738' },
    ]},
  ];
  return (
    <IconShell progress={progress}>
      {/* depth axis */}
      <g opacity={reveal * 0.7}>
        <line x1="860" y1="120" x2="860" y2="870" stroke={T.ink} strokeWidth="1"/>
        {[0, 30, 60, 90, 120, 150, 180].map((d, i) => {
          const y = 120 + (i / 6) * 750;
          const r = clamp(reveal - i * 0.04, 0, 1);
          return (
            <g key={i} opacity={r}>
              <line x1="855" y1={y} x2="860" y2={y} stroke={T.ink} strokeWidth="1"/>
              <text x="848" y={y+5} textAnchor="end" fontFamily={T.mono} fontSize="13" fill={T.muted}>{d.toString().padStart(3,'0')}</text>
            </g>
          );
        })}
        <text x="800" y="100" fontFamily={T.mono} fontSize="11" letterSpacing="3" fill={T.muted}>DEPTH (m)</text>
      </g>
      {columns.map((col, ci) => (
        <g key={ci}>
          <rect x={col.x} y="120" width="60" height="750" fill="none" stroke={T.ink} strokeWidth="1"
            opacity={clamp(reveal*1.5 - ci*0.15, 0, 1) * 0.6}/>
          <text x={col.x + 30} y="100" textAnchor="middle"
            fontFamily={T.mono} fontSize="12" letterSpacing="2" fill={T.ink}
            opacity={clamp(reveal - ci*0.1, 0, 1)}>{col.dh}</text>
          {col.segs.map((s, i) => {
            const segR = clamp((reveal * 7 - ci*1.5 - i*0.6), 0, 1);
            return (
              <g key={i}>
                <rect x={col.x+1} y={s.y} width="58" height={s.h * segR} fill={s.fill}/>
                {ci === 0 && s.label && (
                  <g opacity={segR}>
                    <line x1={col.x+60} y1={s.y + s.h/2} x2={col.x+90} y2={s.y + s.h/2} stroke={T.ink} strokeWidth="0.7"/>
                    <text x={col.x-70} y={s.y + s.h/2 + 4} textAnchor="end"
                      fontFamily={T.mono} fontSize="11" letterSpacing="1.5" fill={T.ink}>{s.label}</text>
                  </g>
                )}
              </g>
            );
          })}
        </g>
      ))}
      {/* Cu histogram */}
      <g opacity={clamp((reveal - 0.55) * 2.5, 0, 1)} transform="translate(1430, 120)">
        <line x1="0" y1="0" x2="0" y2="750" stroke={T.ink} strokeWidth="1" opacity="0.4"/>
        <text x="0" y="-12" fontFamily={T.mono} fontSize="11" letterSpacing="2" fill={T.muted}>Cu (g/t)</text>
        {[40,65,50,90,140,220,280,200,150,80,60,90,50,30,25].map((w, i) => {
          const r = clamp((reveal*1.5 - 0.5 - i*0.04), 0, 1);
          const isPeak = w >= 200;
          return (
            <rect key={i} x="0" y={30 + i*48} width={w * r} height="14"
              fill={isPeak ? T.accent : T.ink} opacity={isPeak ? 1 : 0.5}/>
          );
        })}
        <line x1="200" y1="0" x2="200" y2="750" stroke={T.accent} strokeWidth="1" strokeDasharray="4 4" opacity={clamp((reveal-0.7)*3,0,1)*0.6}/>
        <text x="208" y="14" fontFamily={T.mono} fontSize="10" letterSpacing="1.5" fill={T.accent}
          opacity={clamp((reveal-0.7)*3,0,1)}>CUT-OFF · 0.40 g/t</text>
      </g>
      {/* QA/QC plate */}
      <g opacity={clamp((reveal - 0.7) * 3, 0, 1)} transform="translate(820, 920)">
        <text x="0" y="0" fontFamily={T.mono} fontSize="11" letterSpacing="2.5" fill={T.muted}>QA / QC · ISO 17025</text>
        <text x="0" y="36" fontFamily={T.serif} fontStyle="italic" fontSize="44" fontWeight="300" fill={T.ink}>8 360 numune</text>
        <text x="0" y="60" fontFamily={T.mono} fontSize="11" letterSpacing="2" fill={T.accent}>BLANK ✓ · DUPLICATE ✓ · STANDARD ✓</text>
      </g>
    </IconShell>
  );
}

// 03 — 3D block model isometric (full-bleed, anchored right)
function IconBlock({ progress, holdT }) {
  const reveal = clamp(progress, 0, 1);
  const cx = 1340, cy = 540;
  const dx = 64, dy = 32, dz = 60;
  const cells = [];
  const N = 6;
  for (let z = 0; z < N; z++) {
    for (let x = 0; x < N; x++) {
      for (let y = 0; y < N; y++) {
        const dCx = Math.abs(x - N/2 + 0.5);
        const dCy = Math.abs(y - N/2 + 0.5);
        const dCz = Math.abs(z - N/2 + 0.5);
        const dist = Math.sqrt(dCx*dCx + dCy*dCy + dCz*dCz);
        const grade = clamp(1 - dist / (N*0.55), 0, 1);
        cells.push({ x, y, z, grade });
      }
    }
  }
  cells.sort((a,b) => (a.x + a.y - a.z) - (b.x + b.y - b.z));

  const isoX = (x, y) => cx + (x - y) * dx;
  const isoY = (x, y, z) => cy + (x + y) * dy - z * dz * 0.7;

  return (
    <IconShell progress={progress}>
      {/* axis cage */}
      <g opacity={reveal * 0.5}>
        <line x1={isoX(0,N)} y1={isoY(0,N,0)} x2={isoX(0,0)} y2={isoY(0,0,0)} stroke={T.ink} strokeWidth="1"/>
        <line x1={isoX(0,N)} y1={isoY(0,N,0)} x2={isoX(N,N)} y2={isoY(N,N,0)} stroke={T.ink} strokeWidth="1"/>
        <line x1={isoX(0,0)} y1={isoY(0,0,0)} x2={isoX(0,0)} y2={isoY(0,0,N)} stroke={T.ink} strokeWidth="1" strokeDasharray="3 3"/>
        <line x1={isoX(N,N)} y1={isoY(N,N,0)} x2={isoX(N,N)} y2={isoY(N,N,N)} stroke={T.ink} strokeWidth="1" strokeDasharray="3 3"/>
        <line x1={isoX(0,N)} y1={isoY(0,N,0)} x2={isoX(0,N)} y2={isoY(0,N,N)} stroke={T.ink} strokeWidth="1" strokeDasharray="3 3"/>
        {/* ghost ground plane */}
        <line x1={isoX(0,0)} y1={isoY(0,0,0)+8} x2={isoX(N,0)} y2={isoY(N,0,0)+8} stroke={T.ink} strokeWidth="0.6" opacity="0.3"/>
        <line x1={isoX(N,0)} y1={isoY(N,0,0)+8} x2={isoX(N,N)} y2={isoY(N,N,0)+8} stroke={T.ink} strokeWidth="0.6" opacity="0.3"/>
      </g>

      {cells.map((c, i) => {
        const rev = clamp(reveal * cells.length * 1.2 - i, 0, 1);
        if (rev <= 0) return null;
        const isShell = c.x === 0 || c.x === N-1 || c.y === 0 || c.y === N-1 || c.z === 0 || c.z === N-1;
        if (!isShell && c.grade < 0.55) return null;
        const g = c.grade;
        const color = g > 0.7 ? T.accent : (g > 0.45 ? '#a76b35' : (g > 0.25 ? '#5a4a35' : '#3d342a'));
        const op = g > 0.7 ? 1 : (g > 0.45 ? 0.85 : (g > 0.25 ? 0.55 : 0.32));

        const x0 = isoX(c.x, c.y);
        const y0 = isoY(c.x, c.y, c.z);
        const top = `${x0},${y0} ${x0+dx},${y0+dy} ${x0},${y0+2*dy} ${x0-dx},${y0+dy}`;
        const front = `${x0-dx},${y0+dy} ${x0},${y0+2*dy} ${x0},${y0+2*dy+dz} ${x0-dx},${y0+dy+dz}`;
        const right = `${x0},${y0+2*dy} ${x0+dx},${y0+dy} ${x0+dx},${y0+dy+dz} ${x0},${y0+2*dy+dz}`;

        return (
          <g key={i} opacity={rev * op}>
            <polygon points={top} fill={color} stroke={T.ink} strokeWidth="0.4" style={{filter:'brightness(1.2)'}}/>
            <polygon points={right} fill={color} stroke={T.ink} strokeWidth="0.4" style={{filter:'brightness(0.85)'}}/>
            <polygon points={front} fill={color} stroke={T.ink} strokeWidth="0.4"/>
          </g>
        );
      })}

      {/* slicing plane indicator */}
      <g opacity={clamp((reveal - 0.55) * 3, 0, 1) * 0.6}>
        <line x1={isoX(0,N) - 40} y1={isoY(0,N,3)} x2={isoX(N,0) + 40} y2={isoY(N,0,3)}
          stroke={T.accent} strokeWidth="1" strokeDasharray="6 6"/>
        <text x={isoX(N,0)+50} y={isoY(N,0,3)+5}
          fontFamily={T.mono} fontSize="11" letterSpacing="2" fill={T.accent}>BENCH +1450 m</text>
      </g>

      {/* legend */}
      <g opacity={clamp((reveal - 0.6) * 3, 0, 1)} transform="translate(880, 940)">
        <text x="0" y="0" fontFamily={T.mono} fontSize="11" letterSpacing="3" fill={T.muted}>GRADE · Au g/t · MEASURED + INDICATED</text>
        <g transform="translate(0, 22)">
          <rect x="0" y="0" width="32" height="14" fill={T.accent}/>
          <text x="40" y="12" fontFamily={T.mono} fontSize="12" fill={T.ink}>≥ 1.50</text>
          <rect x="140" y="0" width="32" height="14" fill="#a76b35"/>
          <text x="180" y="12" fontFamily={T.mono} fontSize="12" fill={T.ink}>0.80–1.50</text>
          <rect x="320" y="0" width="32" height="14" fill="#5a4a35" opacity="0.85"/>
          <text x="360" y="12" fontFamily={T.mono} fontSize="12" fill={T.ink}>0.40–0.80</text>
          <rect x="500" y="0" width="32" height="14" fill="#3d342a" opacity="0.5"/>
          <text x="540" y="12" fontFamily={T.mono} fontSize="12" fill={T.ink}>&lt; 0.40</text>
        </g>
      </g>

      {/* tonnage callout */}
      <g opacity={clamp((reveal - 0.7) * 3, 0, 1)} transform="translate(880, 110)">
        <text x="0" y="0" fontFamily={T.mono} fontSize="11" letterSpacing="3" fill={T.muted}>JORC 2012 · MEASURED RESOURCE</text>
        <text x="0" y="58" fontFamily={T.serif} fontStyle="italic" fontSize="68" fontWeight="300" fill={T.ink}>14.7 Mt</text>
        <text x="0" y="86" fontFamily={T.mono} fontSize="12" letterSpacing="2" fill={T.accent}>@ 1.18 g/t Au · 0.42 % Cu</text>
      </g>
    </IconShell>
  );
}

// 04 — Open pit (3/4 perspective) + finance plate (full-bleed, anchored right)
function IconPit({ progress, holdT }) {
  const reveal = clamp(progress, 0, 1);
  // Pit center & bench geometry — axonometric 3/4 view, looking down the long axis
  const cx = 1380;
  const cy = 470;
  // Each bench: ellipse with rx, ry, vertical step
  const benches = [
    { rx: 480, ry: 150, step: 0 },
    { rx: 410, ry: 128, step: 32 },
    { rx: 348, ry: 108, step: 60 },
    { rx: 290, ry:  92, step: 86 },
    { rx: 236, ry:  76, step: 110 },
    { rx: 184, ry:  60, step: 132 },
    { rx: 134, ry:  46, step: 152 },
    { rx:  88, ry:  32, step: 170 },
    { rx:  46, ry:  18, step: 186 },
  ];
  // ground horizon (rim) y
  const rimY = cy;

  // Build a closed bench band (between consecutive ellipses) as a polygon path
  function benchBand(b1, b2) {
    // b1 = upper (wider), b2 = lower (narrower)
    const y1 = rimY + b1.step;
    const y2 = rimY + b2.step;
    return `
      M ${cx - b1.rx} ${y1}
      A ${b1.rx} ${b1.ry} 0 0 0 ${cx + b1.rx} ${y1}
      L ${cx + b2.rx} ${y2}
      A ${b2.rx} ${b2.ry} 0 0 1 ${cx - b2.rx} ${y2}
      Z
    `;
  }
  // Build a closed bench TOP (upper half ellipse — the flat road at top of bench)
  function benchTop(b1, b2) {
    const y1 = rimY + b1.step;
    const y2 = rimY + b2.step;
    return `
      M ${cx - b1.rx} ${y1}
      A ${b1.rx} ${b1.ry} 0 0 1 ${cx + b1.rx} ${y1}
      L ${cx + b2.rx} ${y2}
      A ${b2.rx} ${b2.ry} 0 0 0 ${cx - b2.rx} ${y2}
      Z
    `;
  }

  // Truck position helper — t in [0..1] along an angle on bench i
  function truckPos(i, ang) {
    const b = benches[i];
    const y = rimY + b.step;
    const x = cx + Math.cos(ang) * b.rx;
    const yy = y + Math.sin(ang) * b.ry;
    return { x, y: yy };
  }

  return (
    <IconShell progress={progress}>
      {/* sky / ground horizon hints */}
      <g opacity={reveal * 0.18}>
        <line x1="820" y1={rimY} x2="1880" y2={rimY} stroke={T.ink} strokeWidth="0.6" strokeDasharray="4 4"/>
      </g>

      {/* ===== WASTE ROCK DUMP (left of pit) ===== */}
      <g opacity={clamp((reveal - 0.15) * 2.5, 0, 1)}>
        <path d="M 880 470 L 940 410 L 1020 396 L 1080 430 L 1110 470 Z"
          fill={T.paper2} stroke={T.ink} strokeWidth="1"/>
        <path d="M 940 410 L 1020 396" stroke={T.ink} strokeWidth="0.8" opacity="0.7"/>
        <path d="M 905 440 L 1095 440" stroke={T.ink} strokeWidth="0.6" opacity="0.5" strokeDasharray="3 3"/>
        <text x="900" y="392" fontFamily={T.mono} fontSize="11" letterSpacing="2.5" fill={T.muted}>WASTE DUMP</text>
      </g>

      {/* ===== STOCKPILE (right of pit) ===== */}
      <g opacity={clamp((reveal - 0.2) * 2.5, 0, 1)}>
        <ellipse cx="1820" cy="475" rx="56" ry="14" fill={T.accent} opacity="0.35"/>
        <path d="M 1764 475 Q 1820 415 1876 475 Z" fill={T.accent} opacity="0.85"/>
        <path d="M 1764 475 Q 1820 415 1876 475" fill="none" stroke={T.ink} strokeWidth="0.9"/>
        <text x="1750" y="412" fontFamily={T.mono} fontSize="11" letterSpacing="2.5" fill={T.muted}>ORE STOCKPILE</text>
      </g>

      {/* ===== PIT BENCHES ===== */}
      {/* dirt fill / bench faces - back face (using band) */}
      {benches.slice(0, -1).map((b, i) => {
        const next = benches[i+1];
        const rev = clamp((reveal * 9 - i*0.6), 0, 1);
        // Bench face (the slope between this bench's edge and the next bench's outer edge)
        const y1 = rimY + b.step;
        const y2 = rimY + next.step;
        // shading by depth — deeper benches darker
        const shade = 0.94 - i * 0.05;
        const baseColor = i >= 6 ? T.accent : '#c4ad84';
        const op = i >= 6 ? 0.55 : (0.18 + i*0.03);
        return (
          <g key={i} opacity={rev}>
            {/* bench face fill (front half only — bottom half of band) */}
            <path d={`
              M ${cx - b.rx} ${y1}
              A ${b.rx} ${b.ry} 0 0 0 ${cx + b.rx} ${y1}
              L ${cx + next.rx} ${y2}
              A ${next.rx} ${next.ry} 0 0 1 ${cx - next.rx} ${y2}
              Z
            `}
              fill={baseColor}
              opacity={op}/>
            {/* outer rim (front half — visible bench edge) */}
            <path d={`M ${cx - b.rx} ${y1} A ${b.rx} ${b.ry} 0 0 0 ${cx + b.rx} ${y1}`}
              fill="none" stroke={T.ink} strokeWidth={i === 0 ? 1.6 : 1}
              opacity={i === 0 ? 1 : 0.75}/>
            {/* back rim — dashed (hidden line) */}
            <path d={`M ${cx - b.rx} ${y1} A ${b.rx} ${b.ry} 0 0 1 ${cx + b.rx} ${y1}`}
              fill="none" stroke={T.ink} strokeWidth="0.8" strokeDasharray="3 4"
              opacity={0.35}/>
          </g>
        );
      })}

      {/* deepest bench — pit bottom + ore highlight */}
      {(() => {
        const b = benches[benches.length - 1];
        const y = rimY + b.step;
        const rev = clamp((reveal - 0.45) * 3, 0, 1);
        return (
          <g opacity={rev}>
            <ellipse cx={cx} cy={y} rx={b.rx} ry={b.ry} fill={T.accent} opacity="0.85"/>
            <ellipse cx={cx} cy={y} rx={b.rx} ry={b.ry} fill="none" stroke={T.ink} strokeWidth="1.2"/>
            <Crosshair cx={cx} cy={y} r={10}/>
          </g>
        );
      })()}

      {/* ===== HAUL ROAD — segments cutting through bench faces on the right side ===== */}
      <g opacity={clamp((reveal - 0.4) * 2.5, 0, 1) * 0.95}>
        {benches.slice(0, -1).map((b, i) => {
          const next = benches[i+1];
          const y1 = rimY + b.step;
          const y2 = rimY + next.step;
          // Place a switchback ramp segment on alternating sides
          const side = i % 2 === 0 ? 1 : -1;
          // Two endpoints at the bench rim, one on the upper, one on the lower
          const ang1 = side > 0 ? 0.15 : Math.PI - 0.15;
          const ang2 = side > 0 ? 0.45 : Math.PI - 0.45;
          const x1 = cx + Math.cos(ang1) * b.rx;
          const yy1 = y1 + Math.sin(ang1) * b.ry;
          const x2 = cx + Math.cos(ang2) * next.rx;
          const yy2 = y2 + Math.sin(ang2) * next.ry;
          return (
            <path key={i}
              d={`M ${x1} ${yy1} L ${x2} ${yy2}`}
              stroke={T.accent} strokeWidth="2.4" strokeLinecap="round"
              fill="none"/>
          );
        })}
      </g>

      {/* ===== DUMP TRUCKS ===== */}
      {(() => {
        // place trucks on different benches at slow drift
        const trucks = [
          { i: 1, ang: 0.25 + holdT * 0.4 },
          { i: 3, ang: Math.PI - 0.35 - holdT * 0.3 },
          { i: 4, ang: 0.55 + holdT * 0.5 },
          { i: 6, ang: Math.PI - 0.2 + holdT * 0.2 },
        ];
        return trucks.map((tr, k) => {
          const r = clamp((reveal - 0.55) * 3 - k*0.08, 0, 1);
          const p = truckPos(tr.i, tr.ang);
          return (
            <g key={k} opacity={r} transform={`translate(${p.x}, ${p.y})`}>
              {/* shadow */}
              <ellipse cx="0" cy="6" rx="14" ry="3" fill={T.ink} opacity="0.25"/>
              {/* body */}
              <rect x="-12" y="-9" width="24" height="9" fill={T.ink}/>
              <rect x="-10" y="-13" width="14" height="5" fill={T.accent}/>
              {/* wheels */}
              <circle cx="-7" cy="2" r="2.4" fill={T.ink} stroke={T.paper} strokeWidth="0.6"/>
              <circle cx="7" cy="2" r="2.4" fill={T.ink} stroke={T.paper} strokeWidth="0.6"/>
            </g>
          );
        });
      })()}

      {/* ===== EXCAVATOR at pit bottom ===== */}
      {(() => {
        const b = benches[benches.length - 2];
        const y = rimY + b.step;
        const r = clamp((reveal - 0.6) * 3, 0, 1);
        return (
          <g opacity={r} transform={`translate(${cx + 30}, ${y - 4})`}>
            <ellipse cx="0" cy="6" rx="16" ry="3" fill={T.ink} opacity="0.3"/>
            <rect x="-14" y="-2" width="28" height="6" fill={T.ink}/>
            <rect x="-9" y="-9" width="14" height="7" fill={T.ink}/>
            <line x1="5" y1="-9" x2="22" y2="-22" stroke={T.ink} strokeWidth="2"/>
            <line x1="22" y1="-22" x2="26" y2="-12" stroke={T.ink} strokeWidth="2"/>
            <rect x="24" y="-15" width="6" height="8" fill={T.accent}/>
          </g>
        );
      })()}

      {/* ===== PIT METADATA labels with leaders ===== */}
      <g opacity={clamp((reveal - 0.55) * 3, 0, 1)}>
        {/* rim leader */}
        <line x1={cx + benches[0].rx + 4} y1={rimY} x2={cx + benches[0].rx + 60} y2={rimY - 30} stroke={T.ink} strokeWidth="0.8"/>
        <line x1={cx + benches[0].rx + 60} y1={rimY - 30} x2={cx + benches[0].rx + 130} y2={rimY - 30} stroke={T.ink} strokeWidth="0.8"/>
        <text x={cx + benches[0].rx + 70} y={rimY - 38} fontFamily={T.mono} fontSize="11" letterSpacing="2" fill={T.muted}>RIM · +1700 m</text>

        {/* ore body leader */}
        <line x1={cx + 8} y1={rimY + benches.at(-1).step} x2={cx + 200} y2={rimY + benches.at(-1).step + 20} stroke={T.accent} strokeWidth="0.9"/>
        <text x={cx + 210} y={rimY + benches.at(-1).step + 24} fontFamily={T.mono} fontSize="11" letterSpacing="2" fill={T.accent}>ORE BODY · −280 m</text>

        {/* haul road leader */}
        <line x1={cx + benches[2].rx*0.95} y1={rimY + benches[2].step + benches[2].ry*0.3}
              x2={cx + benches[2].rx + 80} y2={rimY + benches[2].step + 60} stroke={T.accent} strokeWidth="0.9"/>
        <text x={cx + benches[2].rx + 92} y={rimY + benches[2].step + 64} fontFamily={T.mono} fontSize="11" letterSpacing="2" fill={T.muted}>HAUL ROAD · 10% GRADE</text>
      </g>

      {/* depth annotation — vertical scale on right edge */}
      <g opacity={clamp((reveal - 0.5) * 3, 0, 1)} transform="translate(1830, 0)">
        <line x1="0" y1={rimY} x2="0" y2={rimY + benches.at(-1).step} stroke={T.ink} strokeWidth="1"/>
        <line x1="-6" y1={rimY} x2="6" y2={rimY} stroke={T.ink} strokeWidth="1"/>
        <line x1="-6" y1={rimY + benches.at(-1).step} x2="6" y2={rimY + benches.at(-1).step} stroke={T.ink} strokeWidth="1"/>
        <text x="14" y={rimY + 90} fontFamily={T.mono} fontSize="11" letterSpacing="2" fill={T.muted}>FINAL</text>
        <text x="14" y={rimY + 108} fontFamily={T.mono} fontSize="11" letterSpacing="2" fill={T.muted}>DEPTH</text>
        <text x="14" y={rimY + 134} fontFamily={T.serif} fontStyle="italic" fontSize="22" fontWeight="300" fill={T.ink}>308 m</text>
      </g>

      {/* finance dashboard at bottom */}
      <g opacity={clamp((reveal - 0.55) * 2.5, 0, 1)} transform="translate(820, 720)">
        <rect x="0" y="0" width="280" height="180" fill={T.paper2} stroke={T.ink} strokeWidth="0.8"/>
        <text x="20" y="32" fontFamily={T.mono} fontSize="11" letterSpacing="3" fill={T.muted}>NPV @ 8%</text>
        <text x="20" y="100" fontFamily={T.serif} fontSize="68" fontStyle="italic" fontWeight="300" fill={T.ink}>$ 412 M</text>
        <text x="20" y="140" fontFamily={T.mono} fontSize="12" letterSpacing="2" fill={T.accent}>▲ +18.4% · BASE CASE</text>
        <text x="20" y="160" fontFamily={T.mono} fontSize="11" letterSpacing="2" fill={T.muted}>POST-TAX · REAL 2026</text>

        <rect x="300" y="0" width="280" height="180" fill={T.paper2} stroke={T.ink} strokeWidth="0.8"/>
        <text x="320" y="32" fontFamily={T.mono} fontSize="11" letterSpacing="3" fill={T.muted}>IRR · LOM</text>
        <text x="320" y="100" fontFamily={T.serif} fontSize="68" fontStyle="italic" fontWeight="300" fill={T.ink}>24.7%</text>
        <text x="320" y="140" fontFamily={T.mono} fontSize="12" letterSpacing="2" fill={T.muted}>14 YR · PAYBACK 3.2 YR</text>
        <text x="320" y="160" fontFamily={T.mono} fontSize="11" letterSpacing="2" fill={T.muted}>STRIP RATIO 2.4 : 1</text>

        <rect x="600" y="0" width="120" height="180" fill={T.accent}/>
        <text x="620" y="32" fontFamily={T.mono} fontSize="11" letterSpacing="3" fill={T.paper}>CAPEX</text>
        <text x="620" y="98" fontFamily={T.serif} fontSize="44" fontStyle="italic" fontWeight="300" fill={T.paper}>$ 148M</text>
        <text x="620" y="140" fontFamily={T.mono} fontSize="11" letterSpacing="2" fill={T.paper2} opacity="0.85">SUSTAINING</text>
        <text x="620" y="160" fontFamily={T.mono} fontSize="11" letterSpacing="2" fill={T.paper2} opacity="0.85">$ 7.4 M / YR</text>
      </g>

      {/* pit metadata top-right */}
      <g opacity={clamp((reveal - 0.6) * 3, 0, 1)} transform="translate(1620, 110)">
        <line x1="0" y1="0" x2="220" y2="0" stroke={T.ink} strokeWidth="1"/>
        <text x="0" y="22" fontFamily={T.mono} fontSize="11" letterSpacing="2.5" fill={T.muted}>WHITTLE · LG SHELL</text>
        <text x="0" y="46" fontFamily={T.mono} fontSize="11" letterSpacing="2.5" fill={T.muted}>SLOPE 42° · BENCH 10 m</text>
        <text x="0" y="70" fontFamily={T.mono} fontSize="11" letterSpacing="2.5" fill={T.muted}>RAMP 10% · 32 m</text>
      </g>
    </IconShell>
  );
}

// 05 — Slope stability + groundwater (full-bleed, anchored right)
function IconSlope({ progress, holdT }) {
  const reveal = clamp(progress, 0, 1);
  const dash = 6000;
  // Terrain cross-section, occupies x: 820..1880
  const terrain = 'M 820 760 L 980 760 L 1080 660 L 1180 560 L 1280 460 L 1380 400 L 1500 360 L 1700 340 L 1880 330';
  const terrainFill = terrain + ' L 1880 940 L 820 940 Z';
  return (
    <IconShell progress={progress}>
      {/* sky-side faint grid */}
      <g opacity={reveal * 0.12}>
        {Array.from({length:14}).map((_,i)=>(
          <line key={i} x1="820" y1={120+i*60} x2="1880" y2={120+i*60} stroke={T.ink} strokeWidth="0.3"/>
        ))}
      </g>
      {/* fill */}
      <path d={terrainFill} fill={T.paper2}
        opacity={clamp((reveal - 0.3) * 2, 0, 1) * 0.6}/>
      {/* terrain */}
      <path d={terrain}
        fill="none" stroke={T.ink} strokeWidth="2.4"
        strokeDasharray={dash}
        strokeDashoffset={dash * (1 - reveal)}/>
      {/* rock layers */}
      {[820, 860, 900].map((yOff, li) => (
        <path key={li} d={`M 820 ${yOff} Q 1180 ${yOff-15}, 1380 ${yOff-30} T 1880 ${yOff-40}`}
          fill="none" stroke={T.muted} strokeWidth="0.8" strokeDasharray="6 4"
          opacity={clamp((reveal - 0.4 - li*0.05) * 2, 0, 1) * 0.55}/>
      ))}
      {/* potential failure plane */}
      <path d="M 1080 660 Q 1180 720, 1320 800 L 1560 800"
        fill="none" stroke={T.accent} strokeWidth="2"
        strokeDasharray="8 5"
        opacity={clamp((reveal - 0.5) * 2, 0, 1)}/>
      <text x="1340" y="790" fontFamily={T.mono} fontSize="11" letterSpacing="2" fill={T.accent}
        opacity={clamp((reveal - 0.6) * 3, 0, 1)}>POTENTIAL SLIP SURFACE</text>

      {/* groundwater table */}
      <path d="M 820 720 Q 1100 715, 1380 700 T 1880 690"
        fill="none" stroke="#3a6a8a" strokeWidth="2"
        opacity={clamp((reveal - 0.6) * 2.5, 0, 1)}/>
      {/* GWT tick marks */}
      {Array.from({length: 9}).map((_, i) => {
        const x = 850 + i*120;
        return (
          <g key={i} opacity={clamp((reveal - 0.65) * 3, 0, 1) * 0.6}>
            <line x1={x} y1={720 - i*4} x2={x-8} y2={720 - i*4 - 12} stroke="#3a6a8a" strokeWidth="0.8"/>
            <line x1={x+10} y1={720 - i*4} x2={x+18} y2={720 - i*4 - 12} stroke="#3a6a8a" strokeWidth="0.8"/>
          </g>
        );
      })}
      <text x="1740" y="678" fontFamily={T.mono} fontSize="13" letterSpacing="2.5" fill="#3a6a8a"
        opacity={clamp((reveal - 0.7) * 3, 0, 1)}>▽ GWT · 2026.04</text>

      {/* monitoring sensors with stems */}
      {[
        {x:1080, y:660, id:'SX-01'},
        {x:1180, y:560, id:'SX-02'},
        {x:1280, y:460, id:'SX-03'},
        {x:1500, y:360, id:'SX-04'},
      ].map((p,i)=>{
        const r = clamp((reveal - 0.6 - i*0.05) * 4, 0, 1);
        return (
          <g key={i} opacity={r}>
            <line x1={p.x} y1={p.y} x2={p.x} y2={p.y - 60} stroke={T.accent} strokeWidth="0.9"/>
            <circle cx={p.x} cy={p.y - 60} r="9" fill={T.paper} stroke={T.accent} strokeWidth="1.8"/>
            <circle cx={p.x} cy={p.y - 60} r="3" fill={T.accent}/>
            <Crosshair cx={p.x} cy={p.y} r={6}/>
            <text x={p.x + 14} y={p.y - 56} fontFamily={T.mono} fontSize="11" letterSpacing="2" fill={T.ink}>{p.id}</text>
          </g>
        );
      })}

      {/* Force vectors (gravity + cohesion) */}
      <g opacity={clamp((reveal - 0.55) * 2, 0, 1)} transform="translate(1280, 540)">
        <line x1="0" y1="0" x2="0" y2="60" stroke={T.ink} strokeWidth="1.4"/>
        <polygon points="0,68 -5,58 5,58" fill={T.ink}/>
        <text x="6" y="44" fontFamily={T.mono} fontSize="10" letterSpacing="1.5" fill={T.muted}>W</text>

        <line x1="0" y1="0" x2="48" y2="-32" stroke={T.accent} strokeWidth="1.4"/>
        <polygon points="56,-38 44,-30 48,-22" fill={T.accent}/>
        <text x="36" y="-44" fontFamily={T.mono} fontSize="10" letterSpacing="1.5" fill={T.accent}>τ</text>
      </g>

      {/* FoS plate */}
      <g opacity={clamp((reveal - 0.7) * 3, 0, 1)} transform="translate(840, 130)">
        <text x="0" y="0" fontFamily={T.mono} fontSize="11" letterSpacing="3" fill={T.muted}>FOS · LIMIT EQUILIBRIUM</text>
        <text x="0" y="80" fontFamily={T.serif} fontSize="120" fontStyle="italic" fontWeight="300" fill={T.ink} letterSpacing="-0.04em">1.34</text>
        <text x="0" y="110" fontFamily={T.mono} fontSize="11" letterSpacing="2.5" fill={T.accent}>STATIC ✓</text>
        <text x="120" y="110" fontFamily={T.mono} fontSize="11" letterSpacing="2.5" fill={T.muted}>DYNAMIC · 1.08 · REVIEW</text>
      </g>

      {/* permeability plate */}
      <g opacity={clamp((reveal - 0.78) * 3, 0, 1)} transform="translate(1620, 920)">
        <line x1="0" y1="-12" x2="240" y2="-12" stroke={T.ink} strokeWidth="1"/>
        <text x="0" y="8" fontFamily={T.mono} fontSize="11" letterSpacing="2.5" fill={T.muted}>HYD. CONDUCTIVITY · k</text>
        <text x="0" y="42" fontFamily={T.serif} fontStyle="italic" fontSize="32" fontWeight="300" fill={T.ink}>3·10⁻⁶ m/s</text>
      </g>
    </IconShell>
  );
}

// 06 — Environmental monitoring map (full-bleed, anchored right)
function IconEnv({ progress, holdT }) {
  const reveal = clamp(progress, 0, 1);
  const dash = 6000;
  return (
    <IconShell progress={progress}>
      {/* satellite-grid backdrop */}
      <g opacity={reveal * 0.14}>
        {Array.from({length:14}).map((_,i)=>(
          <line key={'h'+i} x1="820" y1={120+i*60} x2="1880" y2={120+i*60} stroke={T.ink} strokeWidth="0.3"/>
        ))}
        {Array.from({length:18}).map((_,i)=>(
          <line key={'v'+i} x1={820+i*60} y1="120" x2={820+i*60} y2="940" stroke={T.ink} strokeWidth="0.3"/>
        ))}
      </g>

      {/* mine site outline (irregular polygon) */}
      <path d="M 1100 380 L 1340 340 L 1520 420 L 1560 580 L 1420 700 L 1200 720 L 1080 600 L 1060 480 Z"
        fill="none" stroke={T.ink} strokeWidth="1.4"
        strokeDasharray={dash} strokeDashoffset={dash * (1 - reveal)}/>
      <path d="M 1100 380 L 1340 340 L 1520 420 L 1560 580 L 1420 700 L 1200 720 L 1080 600 L 1060 480 Z"
        fill={T.ink} opacity={clamp((reveal - 0.3) * 2, 0, 1) * 0.06}/>
      <text x="1280" y="540" textAnchor="middle"
        fontFamily={T.mono} fontSize="14" letterSpacing="3" fill={T.muted}
        opacity={clamp((reveal - 0.45) * 2.5, 0, 1)}>SITE BOUNDARY · 312 ha</text>

      {/* river meander */}
      <path d="M 880 200 Q 1000 320, 1020 480 Q 1040 640, 1180 760 Q 1340 860, 1480 920"
        fill="none" stroke="#3a6a8a" strokeWidth="5"
        strokeDasharray={dash} strokeDashoffset={dash * (1 - reveal)}/>
      <path d="M 890 195 Q 1010 315, 1030 475 Q 1050 635, 1190 755 Q 1350 855, 1490 915"
        fill="none" stroke="#3a6a8a" strokeWidth="1.2" opacity="0.4"
        strokeDasharray={dash} strokeDashoffset={dash * (1 - reveal)}/>
      <text x="900" y="180" fontFamily={T.mono} fontSize="12" letterSpacing="2.5" fill="#3a6a8a"
        opacity={clamp((reveal - 0.5) * 3, 0, 1)}>K. KIZILIRMAK</text>

      {/* sampling stations */}
      {[
        {x: 980, y: 280, label: 'AQ-01', kind:'air',   read:'PM₂.₅ · 18 µg'},
        {x: 1380, y: 380, label: 'AQ-02', kind:'air',   read:'PM₂.₅ · 22 µg'},
        {x: 1100, y: 520, label: 'WQ-03', kind:'water', read:'pH · 7.4'},
        {x: 1280, y: 720, label: 'WQ-04', kind:'water', read:'Cu · 0.02 mg/L'},
        {x: 1500, y: 580, label: 'NS-05', kind:'noise', read:'58 dB(A)'},
        {x: 1620, y: 320, label: 'AQ-06', kind:'air',   read:'PM₂.₅ · 15 µg'},
        {x: 1700, y: 700, label: 'NS-07', kind:'noise', read:'52 dB(A)'},
      ].map((s, i) => {
        const r = clamp((reveal * 7 - i*0.6 - 0.4), 0, 1);
        const pulse = 1 + Math.sin(holdT * 6 + i) * 0.08;
        const color = s.kind === 'water' ? '#3a6a8a' : T.accent;
        return (
          <g key={i} opacity={r}>
            <circle cx={s.x} cy={s.y} r={56 * pulse} fill="none"
              stroke={color} strokeWidth="0.8" strokeDasharray="3 4" opacity="0.5"/>
            <circle cx={s.x} cy={s.y} r="10" fill={T.paper} stroke={color} strokeWidth="2"/>
            <circle cx={s.x} cy={s.y} r="4" fill={color}/>
            <line x1={s.x+10} y1={s.y-10} x2={s.x+40} y2={s.y-30} stroke={color} strokeWidth="0.8"/>
            <text x={s.x + 44} y={s.y - 32} fontFamily={T.mono} fontSize="13" letterSpacing="1.5" fill={T.ink} fontWeight="500">{s.label}</text>
            <text x={s.x + 44} y={s.y - 14} fontFamily={T.mono} fontSize="10" letterSpacing="1.5" fill={T.muted}>{s.read}</text>
          </g>
        );
      })}

      {/* north arrow */}
      <g opacity={clamp((reveal - 0.6) * 3, 0, 1)} transform="translate(1820, 180)">
        <circle r="22" fill="none" stroke={T.ink} strokeWidth="1"/>
        <polygon points="0,-18 -6,8 0,2 6,8" fill={T.ink}/>
        <text x="0" y="-26" textAnchor="middle" fontFamily={T.mono} fontSize="11" letterSpacing="2" fill={T.ink}>N</text>
      </g>

      {/* ÇED compliance plate */}
      <g opacity={clamp((reveal - 0.7) * 3, 0, 1)} transform="translate(840, 130)">
        <rect width="280" height="68" fill={T.ink}/>
        <text x="16" y="26" fontFamily={T.mono} fontSize="11" letterSpacing="3" fill={T.paper2}>ÇED · ENVIRONMENTAL</text>
        <text x="16" y="56" fontFamily={T.serif} fontStyle="italic" fontSize="26" fontWeight="300" fill={T.paper}>Compliant · 2026 Q1</text>
      </g>

      {/* monitoring count */}
      <g opacity={clamp((reveal - 0.78) * 3, 0, 1)} transform="translate(1620, 880)">
        <line x1="0" y1="-12" x2="240" y2="-12" stroke={T.ink} strokeWidth="1"/>
        <text x="0" y="8" fontFamily={T.mono} fontSize="11" letterSpacing="2.5" fill={T.muted}>Σ MONITORING POINTS · 7/24</text>
        <text x="0" y="58" fontFamily={T.serif} fontStyle="italic" fontSize="64" fontWeight="300" fill={T.ink} letterSpacing="-0.04em">148</text>
      </g>
    </IconShell>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// SCENE 4 — CHAIN ASSEMBLY  (19.9–24.4s)
// All 6 disciplines collapse into one horizontal chain
// ═══════════════════════════════════════════════════════════════════════════
function ChainAssembly() {
  return (
    <Sprite start={TL.chain.start} end={TL.chain.end}>
      {({ localTime, duration }) => {
        const t = localTime;
        const exit = duration - 0.6;
        const opOut = t > exit ? 1 - clamp((t - exit) / 0.6, 0, 1) : 1;

        // each node enters in order
        const nodeT = (i) => interpolate(
          [0.1 + i*0.18, 0.55 + i*0.18],
          [0, 1],
          Easing.easeOutCubic
        )(t);

        const lineT = interpolate([1.4, 2.3], [0, 1], Easing.easeInOutCubic)(t);
        const labelT = interpolate([2.4, 3.0], [0, 1], Easing.easeOutCubic)(t);
        const enT = interpolate([2.7, 3.3], [0, 1], Easing.easeOutCubic)(t);

        const nodes = ['01','02','03','04','05','06'];
        const W = 1500;
        const NODE_R = 38;

        return (
          <div style={{
            position:'absolute', inset:0,
            display:'flex', flexDirection:'column',
            alignItems:'center', justifyContent:'center',
            opacity: opOut,
          }}>
            <div style={{
              fontFamily: T.mono, fontSize: 13, letterSpacing:'0.32em',
              color: T.muted, textTransform:'uppercase',
              opacity: clamp(t/0.4, 0, 1),
              marginBottom: 60,
            }}>
              <span style={{color: T.accent}}>§</span>&nbsp;&nbsp;Disiplinler · Tek mühendislik zinciri
            </div>

            {/* SVG chain */}
            <svg width={W} height={120} viewBox={`0 0 ${W} 120`} style={{display:'block'}}>
              {/* connecting line */}
              <line x1="80" y1="60" x2={W-80} y2="60"
                stroke={T.ink} strokeWidth="1.2"
                strokeDasharray={W}
                strokeDashoffset={W * (1 - lineT)}
                opacity="0.4"/>
              {/* arrowhead at end */}
              <g transform={`translate(${W-78}, 60)`} opacity={lineT}>
                <line x1="0" y1="0" x2="-12" y2="-7" stroke={T.ink} strokeWidth="1.2"/>
                <line x1="0" y1="0" x2="-12" y2="7" stroke={T.ink} strokeWidth="1.2"/>
              </g>

              {nodes.map((n, i) => {
                const x = 80 + (W - 160) * (i / (nodes.length - 1));
                const sc = nodeT(i);
                return (
                  <g key={i} transform={`translate(${x}, 60)`} style={{opacity: sc, transform: `translate(${x}px, 60px) scale(${0.4 + 0.6*sc})`, transformOrigin: `${x}px 60px`}}>
                    <circle r={NODE_R} fill={T.paper} stroke={T.ink} strokeWidth="1.2"/>
                    <circle r={NODE_R - 8} fill="none" stroke={T.accent} strokeWidth="1"
                      opacity={clamp((sc - 0.6) * 3, 0, 1)}/>
                    <text textAnchor="middle" y="6"
                      fontFamily={T.serif} fontStyle="italic" fontWeight="300"
                      fontSize="28" fill={T.ink}>{n}</text>
                  </g>
                );
              })}
            </svg>

            {/* discipline labels under each node */}
            <div style={{
              width: W, display:'flex',
              justifyContent:'space-between', alignItems:'flex-start',
              padding: '0 60px',
              marginTop: 18,
            }}>
              {DISCIPLINES.map((d, i) => {
                const op = clamp((nodeT(i) - 0.5) * 2.2, 0, 1);
                return (
                  <div key={i} style={{
                    flex: '0 0 auto', width: 180, textAlign:'center',
                    opacity: op,
                  }}>
                    <div style={{
                      fontFamily: T.sans, fontSize: 14, fontWeight:500,
                      color: T.ink, letterSpacing:'-0.005em',
                      lineHeight: 1.25,
                    }}>
                      {d.tr.join(' ').replace(' &',' ·')}
                    </div>
                    <div style={{
                      fontFamily: T.serif, fontStyle:'italic',
                      fontSize: 13, color: T.muted, marginTop: 4,
                    }}>
                      {d.en}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* big tagline below chain */}
            <div style={{marginTop: 80, textAlign:'center'}}>
              <div style={{
                fontFamily: T.serif, fontStyle:'italic', fontWeight: 300,
                fontSize: 88, lineHeight: 1.05, color: T.ink,
                letterSpacing:'-0.025em',
                opacity: labelT,
                transform: `translateY(${(1-labelT)*16}px)`,
              }}>
                Keşiften <span style={{color: T.accent}}>üretime</span>, tek zincir.
              </div>
              <div style={{
                marginTop: 22,
                fontFamily: T.mono, fontSize: 13, letterSpacing:'0.28em',
                color: T.muted, textTransform:'uppercase',
                opacity: enT,
              }}>
                From discovery to production · One integrated chain
              </div>
            </div>
          </div>
        );
      }}
    </Sprite>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// SCENE 5 — LOGO STING  (23.9–30.0s)
// ANZURA wordmark fades up, tagline appears, fine print
// ═══════════════════════════════════════════════════════════════════════════
function LogoSting() {
  return (
    <Sprite start={TL.logo.start} end={TL.logo.end}>
      {({ localTime, duration }) => {
        const t = localTime;

        // Curtain wipe in from chain — paper darkens to deep ink for the sting
        const wipeT = interpolate([0, 0.8], [0, 1], Easing.easeInOutCubic)(t);

        // Logo: letters reveal individually
        const letters = 'ANZURA'.split('');
        const letterT = (i) => interpolate(
          [0.7 + i*0.07, 1.2 + i*0.07],
          [0, 1],
          Easing.easeOutCubic
        )(t);

        // accent line
        const lineT = interpolate([1.6, 2.3], [0, 1], Easing.easeInOutCubic)(t);
        // tagline TR
        const trT = interpolate([2.0, 2.7], [0, 1], Easing.easeOutCubic)(t);
        // tagline EN
        const enT = interpolate([2.4, 3.0], [0, 1], Easing.easeOutCubic)(t);
        // bottom plate
        const plateT = interpolate([2.8, 3.5], [0, 1], Easing.easeOutCubic)(t);

        return (
          <div style={{position:'absolute', inset:0}}>
            {/* dark curtain */}
            <div style={{
              position:'absolute', inset:0,
              background: `linear-gradient(180deg, ${T.ink} 0%, #1c1812 100%)`,
              transform: `scaleY(${wipeT})`,
              transformOrigin: 'top',
            }}/>

            {/* fine background grid in dark */}
            <svg style={{position:'absolute',inset:0, opacity: wipeT * 0.08}}>
              <defs>
                <pattern id="darkgrid" width="48" height="48" patternUnits="userSpaceOnUse">
                  <path d="M 48 0 L 0 0 0 48" fill="none" stroke={T.paper} strokeWidth="0.5"/>
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#darkgrid)" />
            </svg>

            {/* corner ticks for sting */}
            <svg style={{position:'absolute',inset:0,opacity: wipeT}}>
              {[
                {x:56, y:56, p:'M 0 16 L 0 0 L 16 0'},
                {x:'calc(100% - 56px)', y:56, p:'M -16 0 L 0 0 L 0 16'},
                {x:56, y:'calc(100% - 56px)', p:'M 0 -16 L 0 0 L 16 0'},
                {x:'calc(100% - 56px)', y:'calc(100% - 56px)', p:'M -16 0 L 0 0 L 0 -16'},
              ].map((c,i)=>(
                <path key={i} d={c.p} stroke={T.accent} strokeWidth="1.5" fill="none"
                  transform={`translate(${typeof c.x === 'string' ? '0' : c.x}, ${typeof c.y === 'string' ? '0' : c.y})`}
                  style={{transform: `translate(${c.x}, ${c.y})`}}/>
              ))}
            </svg>

            {/* TOP META */}
            <div style={{
              position:'absolute', top: 80, left: 0, right: 0,
              textAlign:'center',
              fontFamily: T.mono, fontSize: 12, letterSpacing:'0.4em',
              color: T.accent2, opacity: wipeT * 0.85,
              textTransform:'uppercase',
            }}>
              <span style={{color: T.accent}}>§</span>&nbsp;&nbsp;Madencilik ve Mühendislik A.Ş.
            </div>

            {/* CENTER STAGE */}
            <div style={{
              position:'absolute', inset:0,
              display:'flex', flexDirection:'column',
              alignItems:'center', justifyContent:'center',
              gap: 28,
            }}>
              {/* WORDMARK — large, custom-letter reveal */}
              <div style={{
                display:'flex', alignItems:'baseline', gap: 0,
                fontFamily: T.serif, fontStyle:'normal', fontWeight: 300,
                fontSize: 220, lineHeight: 0.9,
                letterSpacing:'0.08em',
                color: T.paper,
              }}>
                {letters.map((L, i) => {
                  const lt = letterT(i);
                  return (
                    <span key={i} style={{
                      display:'inline-block',
                      opacity: lt,
                      transform: `translateY(${(1-lt)*18}px)`,
                      filter: `blur(${(1-lt)*4}px)`,
                    }}>{L}</span>
                  );
                })}
                <span style={{
                  display:'inline-block', marginLeft: 4,
                  fontSize: 220, color: T.accent,
                  opacity: clamp((letterT(5) - 0.6) * 4, 0, 1),
                }}>.</span>
              </div>

              {/* accent line */}
              <div style={{
                width: 220, height: 1, background: T.accent,
                transform: `scaleX(${lineT})`, transformOrigin: 'center',
                marginTop: 8, marginBottom: 4,
              }}/>

              {/* tagline TR */}
              <div style={{
                fontFamily: T.serif, fontStyle:'italic', fontWeight: 300,
                fontSize: 44, color: T.paper,
                letterSpacing:'-0.01em',
                opacity: trT,
                transform: `translateY(${(1-trT)*8}px)`,
                whiteSpace: 'nowrap',
              }}>
                Yer altı kaynakları için <em style={{color: T.accent2, fontStyle:'italic'}}>mühendislik</em>.
              </div>

              {/* tagline EN */}
              <div style={{
                fontFamily: T.mono, fontSize: 13, letterSpacing:'0.32em',
                color: T.paper, opacity: enT * 0.6,
                textTransform:'uppercase',
              }}>
                Engineering for subsurface resources
              </div>
            </div>

            {/* BOTTOM PLATE — standards + address */}
            <div style={{
              position:'absolute', bottom: 80, left: 0, right: 0,
              opacity: plateT,
              display:'flex', flexDirection:'column', alignItems:'center', gap: 16,
            }}>
              <div style={{
                width: 480, height: 1, background: T.paper, opacity: 0.2,
              }}/>
              <div style={{
                display:'flex', gap: 36,
                fontFamily: T.mono, fontSize: 12, letterSpacing:'0.32em',
                color: T.paper, opacity: 0.7, textTransform:'uppercase',
              }}>
                <span>JORC 2012</span>
                <span style={{opacity:0.4}}>·</span>
                <span>NI 43-101</span>
                <span style={{opacity:0.4}}>·</span>
                <span>ISO 9001</span>
                <span style={{opacity:0.4}}>·</span>
                <span>ÇED</span>
              </div>
              <div style={{
                fontFamily: T.mono, fontSize: 11, letterSpacing:'0.28em',
                color: T.paper, opacity: 0.45, textTransform:'uppercase',
                marginTop: 4,
              }}>
                Sivas Cumhuriyet Teknokent  ·  39.7477° N · 37.0179° E  ·  anzura.com.tr
              </div>
            </div>
          </div>
        );
      }}
    </Sprite>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN INTRO — composes all scenes
// ═══════════════════════════════════════════════════════════════════════════
function Intro() {
  return (
    <>
      <PaperBackground />
      <Chrome />
      <ColdOpen />
      <SetupLine />
      {DISCIPLINES.map((_, i) => <DisciplineCard key={i} idx={i} />)}
      <ChainAssembly />
      <LogoSting />
    </>
  );
}

Object.assign(window, { Intro, T });
