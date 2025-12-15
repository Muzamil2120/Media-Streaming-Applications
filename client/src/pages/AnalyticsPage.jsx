import React from 'react';

// Lightweight placeholder AnalyticsPage (no external UI libs)
const AnalyticsPage = () => {
  return (
    <div style={{ padding: 24 }}>
      <h2>Analytics Dashboard</h2>
      <p>
        This demo project's analytics page originally used Material UI and Recharts.
        A lightweight placeholder is shown so the app can run without those
        heavy dependencies.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px,1fr))', gap: 12 }}>
        <div style={{ padding: 12, border: '1px solid #eee', borderRadius: 8 }}>
          <strong>Views</strong>
          <div>45,200</div>
        </div>
        <div style={{ padding: 12, border: '1px solid #eee', borderRadius: 8 }}>
          <strong>Watch Time</strong>
          <div>1.2K hours</div>
        </div>
        <div style={{ padding: 12, border: '1px solid #eee', borderRadius: 8 }}>
          <strong>Subscribers</strong>
          <div>1,256</div>
        </div>
        <div style={{ padding: 12, border: '1px solid #eee', borderRadius: 8 }}>
          <strong>Revenue</strong>
          <div>$1,256</div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;