import { TaskStatus } from '@prisma/client';
import { z } from 'zod';

const taskStatusEnum = z.nativeEnum(TaskStatus);

export const createTaskSchema = z.object({
  body: z.object({
    title: z.string().trim().min(1, 'Title is required').max(120, 'Title is too long'),
    description: z.string().trim().max(500, 'Description is too long').optional(),
    status: taskStatusEnum.optional()
  }),
  params: z.object({}).optional(),
  query: z.object({}).optional()
});

export const updateTaskSchema = z.object({
  body: z
    .object({
      title: z.string().trim().min(1).max(120).optional(),
      description: z.string().trim().max(500).nullable().optional(),
      status: taskStatusEnum.optional()
    })
    .refine((value) => Object.keys(value).length > 0, {
      message: 'At least one field is required for update'
    }),
  params: z.object({
    id: z.string().min(1)
  }),
  query: z.object({}).optional()
});

export const taskIdParamSchema = z.object({
  body: z.object({}).optional(),
  params: z.object({
    id: z.string().min(1)
  }),
  query: z.object({}).optional()
});

export const taskListQuerySchema = z.object({
  body: z.object({}).optional(),
  params: z.object({}).optional(),
  query: z.object({
    page: z.coerce.number().int().min(1).optional(),
    limit: z.coerce.number().int().min(1).max(100).optional(),
    status: taskStatusEnum.optional(),
    search: z.string().trim().optional()
  })
});
