import { Router } from 'express';
import {
  createTaskHandler,
  deleteTaskHandler,
  getTaskByIdHandler,
  getTasksHandler,
  toggleTaskStatusHandler,
  updateTaskHandler
} from '../controllers/task.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.js';
import {
  createTaskSchema,
  taskIdParamSchema,
  taskListQuerySchema,
  updateTaskSchema
} from '../validations/task.validation.js';

const taskRouter = Router();

taskRouter.use(authenticate);

taskRouter.get('/', validate(taskListQuerySchema), getTasksHandler);
taskRouter.post('/', validate(createTaskSchema), createTaskHandler);
taskRouter.get('/:id', validate(taskIdParamSchema), getTaskByIdHandler);
taskRouter.patch('/:id', validate(updateTaskSchema), updateTaskHandler);
taskRouter.delete('/:id', validate(taskIdParamSchema), deleteTaskHandler);
taskRouter.patch('/:id/toggle', validate(taskIdParamSchema), toggleTaskStatusHandler);

export { taskRouter };
