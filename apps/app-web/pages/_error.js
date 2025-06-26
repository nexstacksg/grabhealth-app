import React from 'react';

function Error({ statusCode }) {
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
        {statusCode ? `Error ${statusCode}` : 'An error occurred'}
      </h2>
      <p style={{ color: '#666' }}>
        {statusCode
          ? `A server-side error occurred (${statusCode})`
          : 'A client-side error occurred'}
      </p>
      <a href="/" style={{ textDecoration: 'underline' }}>
        Return Home
      </a>
    </div>
  );
}

Error.getInitialProps = ({ res, err }) => {
  const statusCode = res ? res.statusCode : err ? err.statusCode : 404;
  return { statusCode };
};

export default Error;
