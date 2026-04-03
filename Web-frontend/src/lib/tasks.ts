import api from './api';
import type { ApiResponse, Task, TaskListResponse, TaskStatus } from '@/types';

export const taskApi = {
  getTasks: (params: { page: number; limit: number; status?: TaskStatus | 'ALL'; search?: string }) =>
    api.get<ApiResponse<TaskListResponse>>('/tasks', {
      params: {
        page: params.page,
        limit: params.limit,
        ...(params.status && params.status !== 'ALL' ? { status: params.status } : {}),
        ...(params.search ? { search: params.search } : {})
      }
    }),
  createTask: (payload: { title: string; description?: string; status?: TaskStatus }) =>
    api.post<ApiResponse<Task>>('/tasks', payload),
  updateTask: (id: string, payload: { title?: string; description?: string | null; status?: TaskStatus }) =>
    api.patch<ApiResponse<Task>>(`/tasks/${id}`, payload),
  deleteTask: (id: string) => api.delete<ApiResponse<null>>(`/tasks/${id}`),
  toggleTask: (id: string) => api.patch<ApiResponse<Task>>(`/tasks/${id}/toggle`, {})
};
