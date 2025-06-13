import React from 'react';
import { Table } from './table';

interface ResponsiveTableProps {
  children: React.ReactNode;
  className?: string;
}

export function ResponsiveTable({
  children,
  className = '',
}: ResponsiveTableProps) {
  return (
    <div
      style={{
        width: '100%',
        overflowX: 'scroll',
        WebkitOverflowScrolling: 'touch',
        position: 'relative',
        display: 'block',
        maxWidth: '100%',
        scrollbarWidth: 'thin',
        msOverflowStyle: '-ms-autohiding-scrollbar',
      }}
    >
      <style jsx global>{`
        @media (max-width: 768px) {
          .responsive-table-wrapper::-webkit-scrollbar {
            height: 8px !important;
            display: block !important;
          }

          .responsive-table-wrapper::-webkit-scrollbar-thumb {
            background-color: #0c99b4 !important;
            border-radius: 4px !important;
          }

          .responsive-table-wrapper::-webkit-scrollbar-track {
            background-color: #f1f1f1 !important;
          }
        }
      `}</style>
      <div
        className="responsive-table-wrapper"
        style={{
          overflowX: 'auto',
          width: '100%',
          display: 'block',
          paddingBottom: '10px',
        }}
      >
        <Table className={`${className}`} style={{ minWidth: '800px' }}>
          {children}
        </Table>
      </div>
    </div>
  );
}
