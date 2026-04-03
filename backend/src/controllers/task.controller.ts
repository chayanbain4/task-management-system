import type { NextFunction, Request, Response } from 'express';
import { createTask, deleteTask, getTaskById, getTasks, toggleTaskStatus, updateTask } from '../services/task.service.js';
import { sendSuccess } from '../utils/http.js';

export const createTaskHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const task = await createTask(req.user!.userId, req.body);
    return sendSuccess(res, 201, 'Task created successfully', task);
  } catch (error) {
    next(error);
  }
};

export const getTasksHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await getTasks(req.user!.userId, {
      page: Number(req.query.page ?? 1),
      limit: Number(req.query.limit ?? 10),
      status: req.query.status as any,
      search: (req.query.search as string) || undefined
    });

    return sendSuccess(res, 200, 'Tasks fetched successfully', data);
  } catch (error) {
    next(error);
  }
};

export const getTaskByIdHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const task = await getTaskById(req.user!.userId, req.params.id);
    return sendSuccess(res, 200, 'Task fetched successfully', task);
  } catch (error) {
    next(error);
  }
};

export const updateTaskHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const task = await updateTask(req.user!.userId, req.params.id, req.body);
    return sendSuccess(res, 200, 'Task updated successfully', task);
  } catch (error) {
    next(error);
  }
};

export const deleteTaskHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await deleteTask(req.user!.userId, req.params.id);
    return sendSuccess(res, 200, 'Task deleted successfully');
  } catch (error) {
    next(error);
  }
};

export const toggleTaskStatusHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const task = await toggleTaskStatus(req.user!.userId, req.params.id);
    return sendSuccess(res, 200, 'Task status updated successfully', task);
  } catch (error) {
    next(error);
  }
};
