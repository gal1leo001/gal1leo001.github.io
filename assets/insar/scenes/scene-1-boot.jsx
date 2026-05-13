// Scene 1: System boot — 0 to 4.5s
// Stars fade in, terminal-style readout, INSAR GROUND DISPLACEMENT name reveal.

function Scene1Boot() {
  return (
    <Sprite start={0} end={4.6}>
      {({ localTime }) => {
        // Fade-in for the whole scene
        const fadeIn = 1;
        // Hard cut-out just before scene 2 starts
        const fadeOut = animate({ from: 1, to: 0.4, start: 4.0, end: 4.6 })(localTime);
        const opacity = Math.min(fadeIn, fadeOut);

        return (
          <div style={{ position: 'absolute', inset: 0, background: PALETTE.void, opacity }}>
            <Starfield opacity={1} />

            {/* Subtle radial glow from horizon */}
            <div style={{
              position: 'absolute', left: 0, right: 0, bottom: -200, height: 600,
              background: 'radial-gradient(ellipse at center, rgba(58,166,255,0.12), transparent 70%)',
              pointerEvents: 'none',
            }}/>

            {/* Boot terminal — bottom-left */}
            <div style={{ position: 'absolute', left: 120, bottom: 140, width: 920 }}>
              <ReadoutLine text="$ anzura.init --module insar-ground-displacement" x={0} y={0}    size={18} color={PALETTE.signal} startDelay={0.15} blinkAfter={false}/>
              <ReadoutLine text="› linking sar.constellation ............... OK" x={0} y={32}   size={18} color={PALETTE.inkDim} startDelay={0.7}  blinkAfter={false}/>
              <ReadoutLine text="› binding orbit.ephemeris ................... OK" x={0} y={64}  size={18} color={PALETTE.inkDim} startDelay={1.15} blinkAfter={false}/>
              <ReadoutLine text="› loading scene archive · 1 248 images ...... OK" x={0} y={96}  size={18} color={PALETTE.inkDim} startDelay={1.6}  blinkAfter={false}/>
              <ReadoutLine text="› calibrating phase unwrap kernel ........... OK" x={0} y={128} size={18} color={PALETTE.inkDim} startDelay={2.05} blinkAfter={false}/>
              <ReadoutLine text="› deformation engine ........................ ONLINE" x={0} y={160} size={18} color={PALETTE.cold} startDelay={2.5}  blinkAfter={true}/>
            </div>

            {/* Immediate first-frame lockup so the modal never opens as an empty black frame. */}
            <div style={{
              position: 'absolute', left: 120, top: 96,
              fontFamily: SANS, color: PALETTE.ink,
              opacity: animate({ from: 1, to: 0, start: 0.35, end: 1.2 })(localTime),
              pointerEvents: 'none',
            }}>
              <div style={{ fontSize: 18, letterSpacing: '0.42em', color: PALETTE.cold, marginBottom: 18 }}>
                ANZURA EARTH OBSERVATION
              </div>
              <div style={{ fontSize: 74, fontWeight: 300, letterSpacing: '-0.03em', lineHeight: 1 }}>
                InSAR Ground Displacement
              </div>
            </div>

            {/* Top-right system tag */}
            <div style={{
              position: 'absolute', right: 120, top: 80,
              fontFamily: MONO, fontSize: 13, color: PALETTE.inkDim,
              letterSpacing: '0.24em', textAlign: 'right', lineHeight: 1.6,
              opacity: animate({ from: 0, to: 1, start: 0.3, end: 0.9 })(localTime),
            }}>
              <div>SYS-ID · ANZ-INSAR-04</div>
              <div>UTC 02 MAY 2026 · 07:14:22Z</div>
              <div style={{ color: PALETTE.signal }}>● LINK ESTABLISHED</div>
            </div>

            {/* Pre-title eyebrow */}
            <div style={{
              position: 'absolute', left: 120, top: 240,
              fontFamily: SANS, fontSize: 22, fontWeight: 500,
              color: PALETTE.inkDim, letterSpacing: '0.5em',
              opacity: animate({ from: 0, to: 1, start: 0.4, end: 1.0 })(localTime),
            }}>
              ANZURA · EARTH OBSERVATION
            </div>

            <BigWordmark localTime={localTime} />

            {/* Subtitle below wordmark */}
            <div style={{
              position: 'absolute', left: 120, top: 540,
              fontFamily: MONO, fontSize: 24, color: PALETTE.cold,
              letterSpacing: '0.32em',
              opacity: animate({ from: 0, to: 1, start: 2.6, end: 3.4 })(localTime),
            }}>
              UYDU TABANLI YER DEĞİŞTİRME ANALİZİ · mm / yıl
            </div>
          </div>
        );
      }}
    </Sprite>
  );
}

// Wordmark with letter-by-letter rise.
function BigWordmark({ localTime }) {
  // Two-line title: "InSAR" then "GROUND DISPLACEMENT"
  const line1 = 'InSAR'.split('');
  const line2 = 'GROUND DISPLACEMENT'.split('');
  return (
    <>
      {/* Line 1 — InSAR (huge, mixed weight) */}
      <div style={{
        position: 'absolute', left: 120, top: 290,
        fontFamily: SANS, fontWeight: 200, fontSize: 200,
        color: PALETTE.ink, letterSpacing: '-0.02em',
        lineHeight: 1, display: 'flex',
      }}>
        {line1.map((ch, i) => {
          const start = 0.7 + i * 0.06;
          const t = animate({ from: 0, to: 1, start, end: start + 0.45, ease: Easing.easeOutCubic })(localTime);
          return (
            <span key={i} style={{
              display: 'inline-block',
              opacity: t,
              transform: `translateY(${(1 - t) * 30}px)`,
              fontWeight: ch === 'S' || ch === 'A' || ch === 'R' ? 600 : 200,
              color: ch === 'S' || ch === 'A' || ch === 'R' ? PALETTE.cold : PALETTE.ink,
            }}>{ch}</span>
          );
        })}
      </div>
      {/* Line 2 — GROUND DISPLACEMENT */}
      <div style={{
        position: 'absolute', left: 124, top: 460,
        fontFamily: SANS, fontWeight: 300, fontSize: 76,
        color: PALETTE.ink, letterSpacing: '0.06em',
        lineHeight: 1, display: 'flex',
      }}>
        {line2.map((ch, i) => {
          const start = 1.4 + i * 0.035;
          const t = animate({ from: 0, to: 1, start, end: start + 0.4, ease: Easing.easeOutCubic })(localTime);
          return (
            <span key={i} style={{
              display: 'inline-block',
              opacity: t,
              transform: `translateY(${(1 - t) * 18}px)`,
              minWidth: ch === ' ' ? '0.4em' : 'auto',
            }}>{ch === ' ' ? '\u00A0' : ch}</span>
          );
        })}
      </div>
      {/* Cyan accent line */}
      <div style={{
        position: 'absolute', left: 120, top: 270, height: 3,
        width: animate({ from: 0, to: 1100, start: 1.8, end: 2.6, ease: Easing.easeInOutCubic })(localTime),
        background: `linear-gradient(90deg, ${PALETTE.cold} 0%, transparent 100%)`,
      }}/>
    </>
  );
}

Object.assign(window, { Scene1Boot });
