// Main composition: orchestrates all scenes on a single timeline.

const SCENE_TIMES = {
  // Total duration: 22s
  s1_topo:    [0.0, 4.0],   // topographic background + signal pulses
  s2_satellite: [3.0, 9.0],  // satellite scanning earth (overlap with s1)
  s3_layers:  [8.0, 13.5],  // data beams transform into map layers
  s4_core:    [12.5, 17.5], // streams converge into AI core
  s5_outputs: [16.5, 20.5], // outputs expand: target / risk / feasibility
  s6_title:   [19.5, 22.0], // title reveal
};

// Animate a value through life of [start, end, fadeIn, fadeOut]
function lifeProgress(time, [start, end], fadeIn = 0.6, fadeOut = 0.6) {
  if (time < start || time > end) return { active: false, opacity: 0, progress: 0 };
  const local = time - start;
  const total = end - start;
  let opacity = 1;
  if (local < fadeIn) opacity = local / fadeIn;
  else if (local > total - fadeOut) opacity = (total - local) / fadeOut;
  return {
    active: true,
    opacity: clamp(opacity, 0, 1),
    progress: clamp(local / total, 0, 1),
  };
}

function ANZURAIntro() {
  const time = useTime();

  // ── Scene 1: topo + pulses ──────────────────────────────────────────────
  const s1 = lifeProgress(time, SCENE_TIMES.s1_topo, 0.5, 1.0);

  // ── Scene 2: satellite ──────────────────────────────────────────────────
  const s2 = lifeProgress(time, SCENE_TIMES.s2_satellite, 0.8, 0.8);
  // Satellite orbit angle
  const satOrbitT = (time - SCENE_TIMES.s2_satellite[0]);
  const satAngle = -Math.PI * 0.85 + satOrbitT * 0.55;
  // Earth zoom in s1->s2 (small to medium) and lifts toward center
  const earthScale = interpolate(
    [0, SCENE_TIMES.s1_topo[1] - 1, SCENE_TIMES.s2_satellite[1], SCENE_TIMES.s3_layers[0] + 0.5],
    [0.2, 0.9, 1.0, 1.4],
    Easing.easeInOutCubic
  )(time);
  const earthRotation = (time - SCENE_TIMES.s1_topo[0]) * 0.18;
  const earthOpacity = clamp(
    interpolate([0, 1.5, SCENE_TIMES.s3_layers[0], SCENE_TIMES.s3_layers[0] + 1.5],
                [0, 1, 1, 0],
                Easing.easeInOutCubic)(time), 0, 1);
  // Beam fades in mid-scene-2
  const beam = clamp((time - (SCENE_TIMES.s2_satellite[0] + 1.0)) / 1.0, 0, 1)
              * (1 - clamp((time - (SCENE_TIMES.s3_layers[0] - 0.3)) / 0.8, 0, 1));
  // Scan line during scene 2
  const scanProgress = (() => {
    const start = SCENE_TIMES.s2_satellite[0] + 1.5;
    const end = SCENE_TIMES.s2_satellite[1] - 0.4;
    if (time < start || time > end) return null;
    return (time - start) / (end - start);
  })();

  // ── Scene 3: data layers ────────────────────────────────────────────────
  const s3 = lifeProgress(time, SCENE_TIMES.s3_layers, 0.7, 1.0);

  // ── Scene 4: AI core ────────────────────────────────────────────────────
  const s4 = lifeProgress(time, SCENE_TIMES.s4_core, 0.7, 0.8);

  // ── Scene 5: outputs ────────────────────────────────────────────────────
  const s5 = lifeProgress(time, SCENE_TIMES.s5_outputs, 0.6, 0.8);

  // ── Scene 6: title ──────────────────────────────────────────────────────
  const s6 = lifeProgress(time, SCENE_TIMES.s6_title, 0.4, 0.0);

  // Frame UI fades during title
  const frameUIOpacity = clamp(
    interpolate([0, 0.8, SCENE_TIMES.s6_title[0] - 0.5, SCENE_TIMES.s6_title[0] + 0.6],
                [0, 1, 1, 0])(time), 0, 1);

  return (
    <>
      {/* Always-on topographic background */}
      <TopoBackground/>

      {/* Scene 1: signal pulses on topo */}
      {s1.active && (
        <div style={{ opacity: s1.opacity }}>
          <SignalPulse x={420} y={680} delay={0} period={3.2} max={240}/>
          <SignalPulse x={1480} y={420} delay={0.7} period={3.0} max={220}/>
          <SignalPulse x={1100} y={840} delay={1.4} period={3.4} max={260}/>
          <SignalPulse x={300} y={300} delay={2.1} period={2.8} max={200}/>
        </div>
      )}

      {/* Scene 2: Earth + Satellite (continues into s3 as a fading background) */}
      {earthOpacity > 0.01 && (
        <EarthScene
          scale={earthScale}
          rotation={earthRotation}
          satAngle={s2.active ? satAngle : undefined}
          beam={beam}
          scanProgress={scanProgress}
          opacity={earthOpacity}
        />
      )}

      {/* Scene 3: data layers */}
      {s3.active && (
        <div style={{ opacity: s3.opacity }}>
          <DataLayers progress={s3.progress}/>
        </div>
      )}

      {/* Scene 4: AI core */}
      {s4.active && (
        <div style={{ opacity: s4.opacity }}>
          <AICore progress={s4.progress}/>
        </div>
      )}

      {/* Scene 5: outputs */}
      {s5.active && (
        <div style={{ opacity: s5.opacity }}>
          <OutputPanels progress={s5.progress}/>
        </div>
      )}

      {/* Scene 6: title reveal — full bleed cover */}
      {s6.active && (
        <div style={{
          position: 'absolute', inset: 0,
          background: `radial-gradient(ellipse at 50% 50%, rgba(5,12,28,${s6.opacity * 0.7}) 0%, rgba(2,5,15,${s6.opacity * 0.95}) 100%)`,
          opacity: 1,
        }}>
          <TitleReveal progress={s6.progress}/>
        </div>
      )}

      {/* Letterbox bars (rendered first, FrameUI sits above) */}
      <div style={{
        position: 'absolute', left: 0, right: 0, top: 0,
        height: 60, background: '#000', pointerEvents: 'none', zIndex: 5,
      }}/>
      <div style={{
        position: 'absolute', left: 0, right: 0, bottom: 0,
        height: 60, background: '#000', pointerEvents: 'none', zIndex: 5,
      }}/>

      {/* Persistent frame UI — above letterbox */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 6, pointerEvents: 'none' }}>
        <FrameUI opacity={frameUIOpacity}/>
      </div>

      {/* Scene captions */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 6, pointerEvents: 'none' }}>
        <PhaseCaption time={time}/>
      </div>
    </>
  );
}

function PhaseCaption({ time }) {
  const captions = [
    { range: [0.5, 3.5], text: 'PHASE 01 · SIGNAL ACQUISITION' },
    { range: [3.8, 8.0], text: 'PHASE 02 · ORBITAL OBSERVATION' },
    { range: [8.5, 12.5], text: 'PHASE 03 · GEOSPATIAL × SPECTRAL FUSION' },
    { range: [13.0, 16.5], text: 'PHASE 04 · AI MODELING CORE' },
    { range: [17.0, 19.5], text: 'PHASE 05 · DECISION OUTPUTS' },
  ];
  const active = captions.find(c => time >= c.range[0] && time <= c.range[1]);
  if (!active) return null;
  const local = time - active.range[0];
  const total = active.range[1] - active.range[0];
  const op = local < 0.5 ? local / 0.5 : local > total - 0.5 ? (total - local) / 0.5 : 1;

  return (
    <div style={{
      position: 'absolute',
      bottom: 88, left: '50%',
      transform: 'translateX(-50%)',
      fontFamily: 'ui-monospace, "JetBrains Mono", monospace',
      fontSize: 12,
      letterSpacing: '0.5em',
      color: 'rgba(126, 224, 255, 0.85)',
      opacity: clamp(op, 0, 1),
      whiteSpace: 'nowrap',
    }}>
      {active.text}
    </div>
  );
}

Object.assign(window, { ANZURAIntro });
