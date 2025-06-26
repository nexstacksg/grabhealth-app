import React from 'react';

export default function Custom404() {
  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '60vh',
      gap: '1rem',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
        404 - Page Not Found
      </h2>
      <p style={{ color: '#666' }}>
        Could not find requested resource
      </p>
      <a href="/" style={{ textDecoration: 'underline' }}>
        Return Home
      </a>
    </div>
  );
}
