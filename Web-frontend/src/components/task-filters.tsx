'use client';

import type { TaskStatus } from '@/types';

interface TaskFiltersProps {
  search: string;
  status: TaskStatus | 'ALL';
  onSearchChange: (value: string) => void;
  onStatusChange: (value: TaskStatus | 'ALL') => void;
}

export const TaskFilters = ({ search, status, onSearchChange, onStatusChange }: TaskFiltersProps) => {
  return (
    <div className="glass-card" style={{ padding: '1.125rem 1.25rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{ color: '#6366f1', flexShrink: 0 }}>
          <path d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <h3
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: '0.875rem',
            fontWeight: 700,
            color: '#0f172a',
            letterSpacing: '-0.01em'
          }}
        >
          Filter & Search
        </h3>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 200px', gap: '0.875rem' }}>
        <div>
          <label className="form-label">Search tasks</label>
          <div style={{ position: 'relative' }}>
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              style={{
                position: 'absolute',
                left: '0.875rem',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--gray-400)',
                pointerEvents: 'none'
              }}
            >
              <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2" />
              <path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
            <input
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              className="input-field"
              placeholder="Search by title…"
              style={{ paddingLeft: '2.5rem' }}
            />
          </div>
        </div>

        <div>
          <label className="form-label">Status</label>
          <select
            value={status}
            onChange={(e) => onStatusChange(e.target.value as TaskStatus | 'ALL')}
            className="input-field"
            style={{ cursor: 'pointer' }}
          >
            <option value="ALL">All Tasks</option>
            <option value="PENDING">⏳ Pending</option>
            <option value="COMPLETED">✅ Completed</option>
          </select>
        </div>
      </div>
    </div>
  );
};