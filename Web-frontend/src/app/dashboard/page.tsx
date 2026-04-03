'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import { useAuth } from '@/contexts/auth-context';
import { taskApi } from '@/lib/tasks';
import { Pagination } from '@/components/pagination';
import { TaskFilters } from '@/components/task-filters';
import { TaskForm } from '@/components/task-form';
import { TaskList } from '@/components/task-list';
import type { Pagination as PaginationType, Task, TaskStatus } from '@/types';

const defaultPagination: PaginationType = {
  page: 1,
  limit: 5,
  total: 0,
  totalPages: 1
};

export default function DashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [pagination, setPagination] = useState<PaginationType>(defaultPagination);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<TaskStatus | 'ALL'>('ALL');
  const [loadingTasks, setLoadingTasks] = useState(true);
  const [submittingForm, setSubmittingForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  useEffect(() => {
    if (isAuthenticated) {
      void fetchTasks();
    }
  }, [isAuthenticated, page, status]);

  useEffect(() => {
    if (!isAuthenticated) return;
    const timer = setTimeout(() => {
      setPage(1);
      void fetchTasks(1, search, status);
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  const dashboardTitle = useMemo(() => `Hello, ${user?.name ?? 'User'} 👋`, [user?.name]);

  const fetchTasks = async (overridePage?: number, overrideSearch?: string, overrideStatus?: TaskStatus | 'ALL') => {
    try {
      setLoadingTasks(true);
      const response = await taskApi.getTasks({
        page: overridePage ?? page,
        limit: pagination.limit,
        search: overrideSearch ?? search,
        status: overrideStatus ?? status
      });
      setTasks(response.data.data.items);
      setPagination(response.data.data.pagination);
    } catch (error) {
      handleApiError(error, 'Failed to load tasks');
    } finally {
      setLoadingTasks(false);
    }
  };

  const handleCreateOrUpdate = async (payload: { title: string; description?: string; status?: TaskStatus }) => {
    try {
      setSubmittingForm(true);
      if (editingTask) {
        await taskApi.updateTask(editingTask.id, {
          title: payload.title,
          description: payload.description ?? null,
          status: payload.status
        });
        toast.success('Task updated successfully');
        setEditingTask(null);
      } else {
        await taskApi.createTask(payload);
        toast.success('Task created successfully');
      }
      await fetchTasks(editingTask ? page : 1, search, status);
      if (!editingTask) setPage(1);
    } catch (error) {
      handleApiError(error, 'Task action failed');
    } finally {
      setSubmittingForm(false);
    }
  };

  const handleDelete = async (taskId: string) => {
    try {
      await taskApi.deleteTask(taskId);
      toast.success('Task deleted');
      await fetchTasks(page, search, status);
    } catch (error) {
      handleApiError(error, 'Delete failed');
    }
  };

  const handleToggle = async (taskId: string) => {
    try {
      await taskApi.toggleTask(taskId);
      toast.success('Task status updated');
      await fetchTasks(page, search, status);
    } catch (error) {
      handleApiError(error, 'Status toggle failed');
    }
  };

  const handleApiError = (error: unknown, fallbackMessage: string) => {
    if (axios.isAxiosError(error)) {
      const statusCode = error.response?.status;
      const message = error.response?.data?.message || fallbackMessage;
      if (statusCode === 401) {
        toast.error('Session expired. Please log in again.');
        void logout();
        return;
      }
      if (statusCode === 500) {
        toast.error('Server error. Please try again later.');
        return;
      }
      toast.error(message);
      return;
    }
    toast.error(fallbackMessage);
  };

  if (isLoading || !isAuthenticated) {
    return (
      <div className="relative flex min-h-screen items-center justify-center">
        <div className="bg-mesh" />
        <div className="flex flex-col items-center gap-3">
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: '50%',
              border: '3px solid #e2e8f0',
              borderTopColor: '#6366f1',
              animation: 'spin 0.8s linear infinite'
            }}
          />
          <p style={{ fontFamily: 'var(--font-display)', color: 'var(--gray-500)', fontSize: '0.9rem' }}>
            Loading your workspace…
          </p>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  const completedCount = tasks.filter(t => t.status === 'COMPLETED').length;
  const pendingCount = tasks.filter(t => t.status === 'PENDING').length;

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Ambient background */}
      <div className="bg-mesh" />
      <div className="bg-mesh-orb bg-mesh-orb-1" />
      <div className="bg-mesh-orb bg-mesh-orb-2" />

      {/* ── Sidebar ── */}
      <aside className="sidebar">
        {/* Brand */}
        <div style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                background: 'rgba(255,255,255,0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <span
              style={{
                fontFamily: 'var(--font-display)',
                fontWeight: 800,
                fontSize: '1.2rem',
                color: 'white',
                letterSpacing: '-0.02em'
              }}
            >
              TaskFlow
            </span>
          </div>
          <div
            style={{
              height: 1,
              background: 'rgba(255,255,255,0.1)',
              margin: '1.25rem 0'
            }}
          />
        </div>

        {/* Nav label */}
        <p
          style={{
            fontSize: '0.65rem',
            fontWeight: 700,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: 'rgba(255,255,255,0.4)',
            marginBottom: '0.5rem',
            paddingLeft: '0.75rem',
            fontFamily: 'var(--font-display)'
          }}
        >
          Workspace
        </p>

        {/* Active nav item */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            padding: '0.65rem 0.75rem',
            borderRadius: 12,
            background: 'rgba(255,255,255,0.12)',
            marginBottom: '0.25rem',
            cursor: 'pointer'
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <rect x="3" y="3" width="7" height="7" rx="1.5" stroke="white" strokeWidth="2" />
            <rect x="14" y="3" width="7" height="7" rx="1.5" stroke="white" strokeWidth="2" />
            <rect x="3" y="14" width="7" height="7" rx="1.5" stroke="white" strokeWidth="2" />
            <rect x="14" y="14" width="7" height="7" rx="1.5" stroke="white" strokeWidth="2" />
          </svg>
          <span style={{ color: 'white', fontWeight: 600, fontSize: '0.875rem' }}>Dashboard</span>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            padding: '0.65rem 0.75rem',
            borderRadius: 12,
            cursor: 'pointer',
            opacity: 0.6
          }}
        >
        
        </div>

        {/* Stats */}
        <div style={{ marginTop: 'auto' }}>
          <div
            style={{
              height: 1,
              background: 'rgba(255,255,255,0.1)',
              margin: '1rem 0'
            }}
          />

          {/* Mini stats */}
          <div
            style={{
              background: 'rgba(255,255,255,0.08)',
              borderRadius: 12,
              padding: '0.875rem',
              marginBottom: '1rem'
            }}
          >
            <p style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.5)', marginBottom: '0.5rem', fontFamily: 'var(--font-display)', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
              This page
            </p>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <div>
                <p style={{ fontSize: '1.25rem', fontWeight: 700, color: 'white', fontFamily: 'var(--font-display)' }}>{completedCount}</p>
                <p style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.5)' }}>Done</p>
              </div>
              <div>
                <p style={{ fontSize: '1.25rem', fontWeight: 700, color: '#fde68a', fontFamily: 'var(--font-display)' }}>{pendingCount}</p>
                <p style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.5)' }}>Pending</p>
              </div>
              <div>
                <p style={{ fontSize: '1.25rem', fontWeight: 700, color: '#a5b4fc', fontFamily: 'var(--font-display)' }}>{pagination.total}</p>
                <p style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.5)' }}>Total</p>
              </div>
            </div>
          </div>

          {/* User */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #a5b4fc, #c4b5fd)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                fontFamily: 'var(--font-display)',
                fontWeight: 700,
                fontSize: '0.875rem',
                color: '#312e81'
              }}
            >
              {(user?.name ?? 'U').charAt(0).toUpperCase()}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: '0.8rem', fontWeight: 600, color: 'white', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.name}</p>
              <p style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.45)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.email}</p>
            </div>
            <button
              onClick={() => void logout()}
              title="Logout"
              style={{
                background: 'rgba(255,255,255,0.1)',
                border: 'none',
                borderRadius: 8,
                padding: '0.35rem',
                cursor: 'pointer',
                color: 'rgba(255,255,255,0.7)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'background 0.2s'
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        </div>
      </aside>

      {/* ── Main content ── */}
      <main className="main-content" style={{ flex: 1 }}>
        {/* Top bar */}
        <div className="animate-fade-up" style={{ marginBottom: '1.75rem' }}>
          <h1
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '1.75rem',
              fontWeight: 800,
              letterSpacing: '-0.03em',
              color: '#0f172a'
            }}
          >
            {dashboardTitle}
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--gray-500)', marginTop: '0.25rem' }}>
            Manage your tasks — create, filter, and track your progress.
          </p>
        </div>

        {/* Stats row */}
        <div
          className="animate-fade-up animate-fade-up-1"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '1rem',
            marginBottom: '1.75rem'
          }}
        >
          {[
            {
              label: 'Total Tasks',
              value: pagination.total,
              icon: '📋',
              color: '#6366f1',
              bg: 'linear-gradient(135deg, #eef2ff, #e0e7ff)'
            },
            {
              label: 'Completed',
              value: completedCount,
              icon: '✅',
              color: '#059669',
              bg: 'linear-gradient(135deg, #ecfdf5, #d1fae5)'
            },
            {
              label: 'Pending',
              value: pendingCount,
              icon: '⏳',
              color: '#d97706',
              bg: 'linear-gradient(135deg, #fffbeb, #fef3c7)'
            }
          ].map(({ label, value, icon, color, bg }) => (
            <div
              key={label}
              className="glass-card"
              style={{ padding: '1.125rem 1.25rem', display: 'flex', alignItems: 'center', gap: '0.875rem' }}
            >
              <div
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: 12,
                  background: bg,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.2rem',
                  flexShrink: 0
                }}
              >
                {icon}
              </div>
              <div>
                <p
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '1.5rem',
                    fontWeight: 800,
                    color,
                    lineHeight: 1,
                    letterSpacing: '-0.02em'
                  }}
                >
                  {value}
                </p>
                <p style={{ fontSize: '0.78rem', color: 'var(--gray-500)', marginTop: '0.2rem' }}>
                  {label}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Main grid */}
        <div
          className="animate-fade-up animate-fade-up-2"
          style={{
            display: 'grid',
            gap: '1.5rem',
            gridTemplateColumns: '360px 1fr',
            alignItems: 'start'
          }}
        >
          {/* Left: task form */}
          <div>
            <TaskForm
              initialTask={editingTask}
              onSubmit={handleCreateOrUpdate}
              onCancelEdit={() => setEditingTask(null)}
              isSubmitting={submittingForm}
            />
          </div>

          {/* Right: filters + list + pagination */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <TaskFilters
              search={search}
              status={status}
              onSearchChange={(value) => setSearch(value)}
              onStatusChange={(value) => {
                setStatus(value);
                setPage(1);
                void fetchTasks(1, search, value);
              }}
            />

            <TaskList
              tasks={tasks}
              loading={loadingTasks}
              onEdit={setEditingTask}
              onDelete={handleDelete}
              onToggle={handleToggle}
            />

            <Pagination
              pagination={pagination}
              onPageChange={(nextPage) => {
                setPage(nextPage);
                void fetchTasks(nextPage, search, status);
              }}
            />
          </div>
        </div>
      </main>

      <style>{`
        @media (max-width: 768px) {
          [style*="gridTemplateColumns: 360px 1fr"] {
            grid-template-columns: 1fr !important;
          }
          [style*="gridTemplateColumns: repeat(3, 1fr)"] {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}