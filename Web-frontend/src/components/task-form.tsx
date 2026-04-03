'use client';

import { useEffect, useState } from 'react';
import type { Task, TaskStatus } from '@/types';

interface TaskFormProps {
  initialTask?: Task | null;
  onSubmit: (payload: { title: string; description?: string; status?: TaskStatus }) => Promise<void>;
  onCancelEdit?: () => void;
  isSubmitting: boolean;
}

export const TaskForm = ({ initialTask, onSubmit, onCancelEdit, isSubmitting }: TaskFormProps) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<TaskStatus>('PENDING');

  useEffect(() => {
    setTitle(initialTask?.title ?? '');
    setDescription(initialTask?.description ?? '');
    setStatus(initialTask?.status ?? 'PENDING');
  }, [initialTask]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    await onSubmit({ title, description: description || undefined, status });
    if (!initialTask) {
      setTitle('');
      setDescription('');
      setStatus('PENDING');
    }
  };

  const isEditing = Boolean(initialTask);

  return (
    <div className="glass-card" style={{ padding: '1.5rem', position: 'sticky', top: '2rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: 8,
                background: isEditing
                  ? 'linear-gradient(135deg, #fef3c7, #fde68a)'
                  : 'linear-gradient(135deg, #eef2ff, #e0e7ff)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.9rem'
              }}
            >
              {isEditing ? '✏️' : '✨'}
            </div>
            <h2
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '1.05rem',
                fontWeight: 700,
                color: '#0f172a',
                letterSpacing: '-0.02em'
              }}
            >
              {isEditing ? 'Edit Task' : 'New Task'}
            </h2>
          </div>
          <p style={{ fontSize: '0.78rem', color: 'var(--gray-400)' }}>
            {isEditing ? 'Update the task details below.' : 'Fill in the details to create a task.'}
          </p>
        </div>
        {isEditing && onCancelEdit && (
          <button
            type="button"
            onClick={onCancelEdit}
            className="btn-secondary"
            style={{ padding: '0.4rem 0.875rem', fontSize: '0.78rem' }}
          >
            Cancel
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.125rem' }}>
        <div>
          <label className="form-label">Title</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="input-field"
            placeholder="e.g. Write project proposal"
            required
            maxLength={120}
          />
        </div>

        <div>
          <label className="form-label">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="input-field"
            placeholder="Optional — add more context…"
            maxLength={500}
            style={{ minHeight: 100, resize: 'vertical' }}
          />
        </div>

        <div>
          <label className="form-label">Status</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as TaskStatus)}
            className="input-field"
            style={{ cursor: 'pointer' }}
          >
            <option value="PENDING">⏳ Pending</option>
            <option value="COMPLETED">✅ Completed</option>
          </select>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="btn-primary"
          style={{ width: '100%', marginTop: '0.25rem', padding: '0.85rem' }}
        >
          {isSubmitting
            ? (
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                <span style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.4)', borderTopColor: 'white', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.7s linear infinite' }} />
                Saving…
              </span>
            )
            : isEditing ? 'Update Task' : 'Create Task'}
        </button>
      </form>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};