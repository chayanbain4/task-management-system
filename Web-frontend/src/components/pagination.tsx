'use client';

import type { Pagination as PaginationType } from '@/types';

export const Pagination = ({
  pagination,
  onPageChange
}: {
  pagination: PaginationType;
  onPageChange: (page: number) => void;
}) => {
  const { page, totalPages, total } = pagination;

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
  const visiblePages = pages.filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 1);

  return (
    <div
      className="glass-card"
      style={{
        padding: '0.875rem 1.25rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '1rem',
        flexWrap: 'wrap'
      }}
    >
      <p style={{ fontSize: '0.8rem', color: 'var(--gray-500)' }}>
        <span style={{ fontWeight: 600, color: 'var(--gray-700)' }}>{total}</span> task{total !== 1 ? 's' : ''} ·{' '}
        page <span style={{ fontWeight: 600, color: 'var(--gray-700)' }}>{page}</span> of{' '}
        <span style={{ fontWeight: 600, color: 'var(--gray-700)' }}>{totalPages}</span>
      </p>

      <div style={{ display: 'flex', gap: '0.375rem', alignItems: 'center' }}>
        {/* Prev */}
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className="btn-secondary"
          style={{
            padding: '0.45rem 0.875rem',
            fontSize: '0.8rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.3rem'
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Prev
        </button>

        {/* Page numbers */}
        {totalPages <= 7
          ? pages.map((p) => (
            <button
              key={p}
              onClick={() => onPageChange(p)}
              style={{
                width: 34,
                height: 34,
                borderRadius: 10,
                border: p === page ? 'none' : '1px solid var(--gray-200)',
                background: p === page
                  ? 'linear-gradient(135deg, #6366f1, #8b5cf6)'
                  : 'white',
                color: p === page ? 'white' : 'var(--gray-700)',
                fontWeight: p === page ? 700 : 500,
                fontSize: '0.82rem',
                cursor: 'pointer',
                fontFamily: 'var(--font-display)',
                transition: 'all 0.15s',
                boxShadow: p === page ? '0 2px 8px rgba(99,102,241,0.3)' : 'none'
              }}
            >
              {p}
            </button>
          ))
          : visiblePages.map((p, i, arr) => (
            <>
              {i > 0 && arr[i - 1] !== p - 1 && (
                <span key={`ellipsis-${p}`} style={{ color: 'var(--gray-400)', fontSize: '0.8rem', padding: '0 2px' }}>…</span>
              )}
              <button
                key={p}
                onClick={() => onPageChange(p)}
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 10,
                  border: p === page ? 'none' : '1px solid var(--gray-200)',
                  background: p === page
                    ? 'linear-gradient(135deg, #6366f1, #8b5cf6)'
                    : 'white',
                  color: p === page ? 'white' : 'var(--gray-700)',
                  fontWeight: p === page ? 700 : 500,
                  fontSize: '0.82rem',
                  cursor: 'pointer',
                  fontFamily: 'var(--font-display)',
                  transition: 'all 0.15s',
                  boxShadow: p === page ? '0 2px 8px rgba(99,102,241,0.3)' : 'none'
                }}
              >
                {p}
              </button>
            </>
          ))
        }

        {/* Next */}
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          className="btn-secondary"
          style={{
            padding: '0.45rem 0.875rem',
            fontSize: '0.8rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.3rem'
          }}
        >
          Next
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>
    </div>
  );
};