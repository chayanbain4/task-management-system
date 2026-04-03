import { TaskStatus } from '@prisma/client';
import { prisma } from '../lib/prisma.js';
import { ApiError } from '../utils/api-error.js';

export const createTask = async (userId: string, input: { title: string; description?: string; status?: TaskStatus }) => {
  return prisma.task.create({
    data: {
      title: input.title,
      description: input.description,
      status: input.status ?? TaskStatus.PENDING,
      userId
    }
  });
};

export const getTasks = async (
  userId: string,
  query: { page: number; limit: number; status?: TaskStatus; search?: string }
) => {
  const where = {
    userId,
    ...(query.status ? { status: query.status } : {}),
    ...(query.search
      ? {
          title: {
            contains: query.search,
            mode: 'insensitive' as const
          }
        }
      : {})
  };

  const [items, total] = await Promise.all([
    prisma.task.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (query.page - 1) * query.limit,
      take: query.limit
    }),
    prisma.task.count({ where })
  ]);

  return {
    items,
    pagination: {
      page: query.page,
      limit: query.limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / query.limit))
    }
  };
};

export const getTaskById = async (userId: string, taskId: string) => {
  const task = await prisma.task.findFirst({
    where: { id: taskId, userId }
  });

  if (!task) {
    throw new ApiError(404, 'Task not found');
  }

  return task;
};

export const updateTask = async (
  userId: string,
  taskId: string,
  input: { title?: string; description?: string | null; status?: TaskStatus }
) => {
  await getTaskById(userId, taskId);

  return prisma.task.update({
    where: { id: taskId },
    data: input
  });
};

export const deleteTask = async (userId: string, taskId: string) => {
  await getTaskById(userId, taskId);
  await prisma.task.delete({ where: { id: taskId } });
};

export const toggleTaskStatus = async (userId: string, taskId: string) => {
  const task = await getTaskById(userId, taskId);

  return prisma.task.update({
    where: { id: taskId },
    data: {
      status: task.status === TaskStatus.COMPLETED ? TaskStatus.PENDING : TaskStatus.COMPLETED
    }
  });
};
