'use client';

import { useEffect, useState } from 'react';

export function AppSplash() {
  const [visible, setVisible] = useState(true);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    const leaveTimer = window.setTimeout(() => setLeaving(true), 520);
    const removeTimer = window.setTimeout(() => setVisible(false), 820);

    return () => {
      window.clearTimeout(leaveTimer);
      window.clearTimeout(removeTimer);
    };
  }, []);

  if (!visible) {
    return null;
  }

  return (
    <div
      className={`app-splash ${leaving ? 'app-splash--leaving' : ''}`}
      role="status"
      aria-label="Cargando Checkpoint"
    >
      <div className="app-splash__content">
        <div className="app-splash__mark" aria-hidden="true">
          <span />
          <span />
          <span />
        </div>
        <p className="app-splash__name">Checkpoint</p>
        <p className="app-splash__caption">Continúa donde lo dejaste</p>
      </div>
    </div>
  );
}
