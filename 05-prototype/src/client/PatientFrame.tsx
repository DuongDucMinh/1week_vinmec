import { useLayoutEffect, useState, type CSSProperties, type ReactNode } from 'react';

const screenWidth = 393;
const screenHeight = 852;
const previewScale = () => Math.min(1, Math.max(1, window.innerWidth - 48) / screenWidth, Math.max(1, window.innerHeight - 48) / screenHeight);

export function PatientFrame({ children }: { children: ReactNode }) {
  const [scale, setScale] = useState(previewScale);
  useLayoutEffect(() => {
    const resize = () => setScale(previewScale());
    window.addEventListener('resize', resize);
    resize();
    return () => window.removeEventListener('resize', resize);
  }, []);
  return <div className="patient-preview" style={{ '--phone-scale': scale } as CSSProperties}>{children}</div>;
}
