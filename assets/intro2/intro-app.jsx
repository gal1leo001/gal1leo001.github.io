// intro-app.jsx — mounts the intro into the page

const { useState, useEffect, useRef } = React;

function App() {
  const params = new URLSearchParams(window.location.search);
  const heroMode = params.get('hero') === '1' || params.get('mode') === 'hero' || window.location.href.includes('hero=1');
  const portraitHero = heroMode && (window.innerWidth <= 768 || window.innerHeight > window.innerWidth);

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
      fit={heroMode && !portraitHero ? 'cover' : 'contain'}
      frameY={heroMode ? 'start' : 'center'}
      initialTime={heroMode ? 0.8 : 0}
      shadow={!heroMode}
      persistKey={heroMode ? 'anzura-intro-hero-20260514' : 'anzura-intro-modal'}
    >
      <Intro />
    </Stage>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
