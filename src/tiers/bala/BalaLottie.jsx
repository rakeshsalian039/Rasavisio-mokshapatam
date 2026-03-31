// src/tiers/bala/BalaLottie.jsx
import { Player } from '@lottiefiles/react-lottie-player';

export function LottieOverlay({ src, opacity = 0.7 }) {
  return (
    <Player autoplay loop src={src}
      style={{
        position: 'absolute', inset: 0,
        width: '100%', height: '100%',
        pointerEvents: 'none',
        opacity,
        zIndex: 1,
      }}
    />
  );
}

export function LottieInline({ src, size = 60, loop = true, onComplete }) {
  return (
    <Player autoplay loop={loop} src={src}
      style={{ width: size, height: size, flexShrink: 0 }}
      onEvent={e => e === 'complete' && onComplete?.()}
    />
  );
}

export const CHAR_LOTTIES = {
  elephant: '/lottie/elephant.json',
  tiger:    '/lottie/tiger.json',
  monkey:   '/lottie/monkey.json',
  owl:      '/lottie/owl.json',
  peacock:  '/lottie/peacock.json',
  panda:    '/lottie/panda.json',
};
