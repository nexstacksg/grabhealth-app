import React from 'react';

interface ResponsiveTableWrapperProps {
  children: React.ReactNode;
}

export function ResponsiveTableWrapper({
  children,
}: ResponsiveTableWrapperProps) {
  return (
    <div
      style={{
        width: '100%',
        overflowX: 'scroll',
        display: 'block',
        position: 'relative',
        border: '1px solid #e5e7eb',
        borderRadius: '0.5rem',
      }}
    >
      <style jsx>{`
        div {
          -webkit-overflow-scrolling: touch;
          scrollbar-width: thin;
          -ms-overflow-style: -ms-autohiding-scrollbar;
        }

        div::-webkit-scrollbar {
          height: 8px;
          display: block;
        }

        div::-webkit-scrollbar-thumb {
          background-color: #0c99b4;
          border-radius: 4px;
        }

        div::-webkit-scrollbar-track {
          background-color: #f1f1f1;
        }

        @media (max-width: 768px) {
          div {
            margin-left: -1rem;
            margin-right: -1rem;
            width: calc(100% + 2rem);
            border-radius: 0;
          }

          div::after {
            content: '→';
            position: absolute;
            right: 10px;
            top: 50%;
            transform: translateY(-50%);
            background-color: rgba(12, 153, 180, 0.8);
            color: white;
            padding: 5px 10px;
            border-radius: 50%;
            animation: pulse 1.5s infinite;
            pointer-events: none;
          }

          @keyframes pulse {
            0% {
              opacity: 0.6;
            }
            50% {
              opacity: 1;
            }
            100% {
              opacity: 0.6;
            }
          }
        }
      `}</style>
      <div style={{ minWidth: '1000px' }}>{children}</div>
    </div>
  );
}
