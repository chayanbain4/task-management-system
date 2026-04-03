'use client';

import { useState } from 'react';
import type { Task } from '@/types';

interface TaskListProps {
  tasks: Task[];
  loading: boolean;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => Promise<void>;
  onToggle: (taskId: string) => Promise<void>;
}

export const TaskList = ({ tasks, loading, onEdit, onDelete, onToggle }: TaskListProps) => {
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const handleDeleteClick = (taskId: string) => setConfirmDeleteId(taskId);

  const handleConfirmDelete = async (taskId: string) => {
    try {
      setDeleting(true);
      await onDelete(taskId);
    } finally {
      setDeleting(false);
      setConfirmDeleteId(null);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {[1, 2, 3].map((i) => (
          <div key={i} className="glass-card" style={{ padding: '1.25rem' }}>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <div className="skeleton" style={{ width: 40, height: 40, borderRadius: '50%' }} />
              <div style={{ flex: 1 }}>
                <div className="skeleton" style={{ height: 14, width: '60%', marginBottom: 8 }} />
                <div className="skeleton" style={{ height: 11, width: '40%' }} />
              </div>
              <div className="skeleton" style={{ height: 28, width: 80 }} />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!tasks.length) {
    return (
      <div
        className="glass-card"
        style={{
          padding: '3rem 1.5rem',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '0.75rem'
        }}
      >
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: 16,
            background: 'linear-gradient(135deg, #eef2ff, #e0e7ff)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.5rem'
          }}
        >
          📭
        </div>
        <p
          style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 700,
            fontSize: '1rem',
            color: '#0f172a'
          }}
        >
          No tasks found
        </p>
        <p style={{ fontSize: '0.82rem', color: 'var(--gray-400)' }}>
          Create your first task using the form on the left.
        </p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      {tasks.map((task, idx) => (
        <div
          key={task.id}
          className="glass-card animate-fade-up"
          style={{
            padding: '1.25rem',
            animationDelay: `${idx * 0.05}s`
          }}
        >
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
            {/* Status dot / toggle */}
            <button
              onClick={() => void onToggle(task.id)}
              title="Toggle status"
              style={{
                width: 22,
                height: 22,
                borderRadius: '50%',
                border: task.status === 'COMPLETED' ? 'none' : '2px solid #cbd5e1',
                background: task.status === 'COMPLETED'
                  ? 'linear-gradient(135deg, #10b981, #059669)'
                  : 'transparent',
                flexShrink: 0,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginTop: '2px',
                transition: 'all 0.2s'
              }}
            >
              {task.status === 'COMPLETED' && (
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </button>

            {/* Content */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                <h3
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '0.95rem',
                    fontWeight: 700,
                    color: '#0f172a',
                    letterSpacing: '-0.01em',
                    textDecoration: task.status === 'COMPLETED' ? 'line-through' : 'none',
                    opacity: task.status === 'COMPLETED' ? 0.6 : 1
                  }}
                >
                  {task.title}
                </h3>
                <span className={task.status === 'COMPLETED' ? 'badge-completed' : 'badge-pending'}>
                  {task.status === 'COMPLETED' ? '✓ Done' : '⏳ Pending'}
                </span>
              </div>

              {task.description && (
                <p
                  style={{
                    fontSize: '0.82rem',
                    color: 'var(--gray-500)',
                    marginBottom: '0.5rem',
                    whiteSpace: 'pre-wrap',
                    lineHeight: 1.55
                  }}
                >
                  {task.description}
                </p>
              )}

              <p style={{ fontSize: '0.72rem', color: 'var(--gray-400)' }}>
                Updated {new Date(task.updatedAt).toLocaleString()}
              </p>
            </div>

            {/* Actions */}
            <div style={{ flexShrink: 0 }}>
              {confirmDeleteId === task.id ? (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.5rem 0.75rem',
                    borderRadius: 12,
                    background: '#fff1f2',
                    border: '1px solid #fecdd3'
                  }}
                >
                  <span style={{ fontSize: '0.78rem', color: '#e11d48', fontWeight: 500, whiteSpace: 'nowrap' }}>
                    Delete?
                  </span>
                  <button
                    onClick={() => void handleConfirmDelete(task.id)}
                    disabled={deleting}
                    style={{
                      background: '#e11d48',
                      color: 'white',
                      border: 'none',
                      borderRadius: 8,
                      padding: '0.3rem 0.6rem',
                      fontSize: '0.72rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      opacity: deleting ? 0.6 : 1
                    }}
                  >
                    {deleting ? '…' : 'Yes'}
                  </button>
                  <button
                    onClick={() => setConfirmDeleteId(null)}
                    disabled={deleting}
                    className="btn-secondary"
                    style={{ padding: '0.3rem 0.6rem', fontSize: '0.72rem' }}
                  >
                    No
                  </button>
                </div>
              ) : (
                <div style={{ display: 'flex', gap: '0.375rem' }}>
                  <button
                    onClick={() => onEdit(task)}
                    title="Edit task"
                    className="btn-secondary"
                    style={{ padding: '0.45rem 0.75rem', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                      <path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteClick(task.id)}
                    title="Delete task"
                    className="btn-danger"
                    style={{ padding: '0.45rem 0.75rem', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                      <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    Delete
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};