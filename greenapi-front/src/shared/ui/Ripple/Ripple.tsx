import { useState, type PointerEvent } from 'react';
import styles from './Ripple.module.scss';

const DURATION_MS = 700;

type Wave = { id: number; x: number; y: number; size: number };

let nextId = 0;

export function Ripple() {
  const [waves, setWaves] = useState<Wave[]>([]);

  function handlePointerDown(event: PointerEvent<HTMLSpanElement>) {
    if (event.button !== 0) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const wave = {
      id: nextId++,
      x: event.clientX - rect.left - size / 2,
      y: event.clientY - rect.top - size / 2,
      size,
    };
    setWaves((current) => [...current, wave]);
    setTimeout(() => {
      setWaves((current) => current.filter((item) => item.id !== wave.id));
    }, DURATION_MS);
  }

  return (
    <span className={styles.container} onPointerDown={handlePointerDown} aria-hidden>
      {waves.map((wave) => (
        <span
          key={wave.id}
          className={styles.wave}
          style={{ left: wave.x, top: wave.y, width: wave.size, height: wave.size }}
        />
      ))}
    </span>
  );
}
