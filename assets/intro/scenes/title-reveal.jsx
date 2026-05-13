// Scene 6: Title reveal — "ANZURA YÖRÜNGEDEN CEVHERE"
// Letter-by-letter reveal with kinetic underline + subtitle.

function TitleReveal({ progress = 0 }) {
  const time = useTime();

  // progress 0..1 across the scene
  // Letters appear as a stagger from 0..0.5
  // Underline draws 0.5..0.75
  // Subtitle fades 0.6..0.85
  // Tagline fades 0.8..1

  const title = 'ANZURA';
  const subtitle1 = 'YÖRÜNGEDEN';
  const subtitle2 = 'CEVHERE';

  return (
    <div style={{
      position: 'absolute', inset: 0,
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      pointerEvents: 'none',
      fontFamily: 'Inter, system-ui, sans-serif',
      color: '#ffffff',
    }}>
      {/* Hairline above */}
      <div style={{
        height: 1,
        background: 'linear-gradient(90deg, transparent, rgba(126,224,255,0.6), transparent)',
        width: clamp(progress * 2, 0, 1) * 720,
        marginBottom: 28,
        transition: 'none',
      }}/>

      {/* Eyebrow label */}
      <div style={{
        fontFamily: 'ui-monospace, "JetBrains Mono", monospace',
        fontSize: 13,
        letterSpacing: '0.42em',
        color: 'rgba(126, 224, 255, 0.85)',
        marginBottom: 32,
        opacity: clamp((progress - 0.05) * 5, 0, 1),
        textTransform: 'uppercase',
      }}>
        ANZURA · SYSTEM 01
      </div>

      {/* ANZURA — main wordmark */}
      <KineticTitle text={title} progress={progress}
                    size={180} weight={700} letterSpacing="0.16em" mainWord/>

      {/* YÖRÜNGEDEN CEVHERE */}
      <div style={{
        display: 'flex', gap: 36,
        marginTop: 18,
        opacity: clamp((progress - 0.35) * 3, 0, 1),
      }}>
        <KineticTitle text={subtitle1} progress={Math.max(0, progress - 0.3)}
                      size={48} weight={300} letterSpacing="0.42em"
                      color="rgba(220, 235, 255, 0.92)"/>
        <div style={{
          alignSelf: 'center',
          width: 8, height: 8,
          background: '#7ee0ff',
          transform: 'rotate(45deg)',
          opacity: clamp((progress - 0.42) * 4, 0, 1),
        }}/>
        <KineticTitle text={subtitle2} progress={Math.max(0, progress - 0.42)}
                      size={48} weight={300} letterSpacing="0.42em"
                      color="rgba(220, 235, 255, 0.92)"/>
      </div>

      {/* Underline */}
      <div style={{ marginTop: 60, width: 640, height: 1, position: 'relative' }}>
        <div style={{
          position: 'absolute',
          left: '50%', transform: 'translateX(-50%)',
          width: clamp((progress - 0.45) * 3, 0, 1) * 640,
          height: 1,
          background: 'linear-gradient(90deg, transparent, rgba(126,224,255,0.85), transparent)',
        }}/>
      </div>

      {/* Tagline */}
      <div style={{
        marginTop: 32,
        fontFamily: 'Inter, system-ui, sans-serif',
        fontSize: 19,
        fontWeight: 300,
        letterSpacing: '0.14em',
        color: 'rgba(200, 220, 250, 0.9)',
        opacity: clamp((progress - 0.55) * 3, 0, 1),
      }}>
        Satellite-Based Digital Decision Support System
      </div>

      {/* Footer marks */}
      <div style={{
        position: 'absolute',
        bottom: 100,
        display: 'flex', gap: 56,
        fontFamily: 'ui-monospace, "JetBrains Mono", monospace',
        fontSize: 10,
        letterSpacing: '0.32em',
        color: 'rgba(160, 195, 245, 0.55)',
        opacity: clamp((progress - 0.7) * 4, 0, 1),
      }}>
        <span>FROM ORBIT</span>
        <span style={{ color: 'rgba(126, 224, 255, 0.7)' }}>—</span>
        <span>TO ORE</span>
      </div>

      {/* KOSGEB attribution */}
      <div style={{
        position: 'absolute',
        bottom: 56,
        fontFamily: 'ui-monospace, "JetBrains Mono", monospace',
        fontSize: 10,
        letterSpacing: '0.32em',
        color: 'rgba(160, 195, 245, 0.4)',
        opacity: clamp((progress - 0.75) * 4, 0, 1),
      }}>
        DEVELOPED WITH KOSGEB · DEEP-TECH MINING INTELLIGENCE
      </div>
    </div>
  );
}

function KineticTitle({ text, progress, size, weight, letterSpacing, color = '#ffffff', mainWord = false }) {
  const letters = text.split('');
  return (
    <div style={{
      display: 'flex',
      fontSize: size,
      fontWeight: weight,
      letterSpacing,
      color,
      lineHeight: 1,
      whiteSpace: 'pre',
    }}>
      {letters.map((ch, i) => {
        const start = i * 0.04;
        const end = start + 0.18;
        const t = clamp((progress - start) / (end - start), 0, 1);
        const eased = Easing.easeOutCubic(t);
        const op = eased;
        const blur = (1 - eased) * (mainWord ? 18 : 8);
        const ty = (1 - eased) * (mainWord ? 28 : 14);

        return (
          <span key={i} style={{
            display: 'inline-block',
            opacity: op,
            transform: `translateY(${ty}px)`,
            filter: `blur(${blur}px)`,
            textShadow: mainWord && eased > 0.6
              ? '0 0 30px rgba(126, 224, 255, 0.35)'
              : 'none',
            willChange: 'transform, opacity, filter',
          }}>
            {ch}
          </span>
        );
      })}
    </div>
  );
}

Object.assign(window, { TitleReveal, KineticTitle });
