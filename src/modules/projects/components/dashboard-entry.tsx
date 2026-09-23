'use client';

import { useEffect, useState } from 'react';

export function DashboardEntry() {
  const [visible, setVisible] = useState(false);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    if (window.sessionStorage.getItem('checkpoint:dashboard-entry') !== 'true') {
      return;
    }

    window.sessionStorage.removeItem('checkpoint:dashboard-entry');
    const showFrame = window.requestAnimationFrame(() => {
      setVisible(true);

      window.requestAnimationFrame(() => {
        setLeaving(true);
      });
    });
    const removeTimer = window.setTimeout(() => {
      setVisible(false);
    }, 520);

    return () => {
      window.cancelAnimationFrame(showFrame);
      window.clearTimeout(removeTimer);
    };
  }, []);

  if (!visible) {
    return null;
  }

  return (
    <div className={`dashboard-entry ${leaving ? 'dashboard-entry--leaving' : ''}`} aria-hidden="true">
      <div className="dashboard-entry__mark">
        <span />
        <span />
        <span />
      </div>
      <span className="dashboard-entry__label">Checkpoint</span>
    </div>
  );
}
