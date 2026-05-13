// intro-app.jsx — mounts the intro into the page

const { useState, useEffect, useRef } = React;

function App() {
  const params = new URLSearchParams(window.location.search);
  const heroMode = params.get('hero') === '1' || params.get('mode') === 'hero' || window.location.href.includes('hero=1');

  // Use Stage with autoplay + loop. Stage exports a scrubber by default;
  // we want a clean autoplay loop with no chrome for the intro presentation.
  // Stage from animations.jsx supports props: width, height, duration, background, autoplay, loop, controls
  return (
    <Stage
      width={1920}
      height={1080}
      duration={30}
      background="#f1ede4"
      autoplay={true}
      loop={true}
      controls={!heroMode}
      fit="contain"
      shadow={!heroMode}
      persistKey={heroMode ? 'anzura-intro-hero' : 'anzura-intro-modal'}
    >
      <Intro />
    </Stage>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
