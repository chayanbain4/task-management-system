import 'task_model.dart';
import 'task_status.dart';

class TaskFilterStats {
  final int total;
  final int pending;
  final int completed;

  const TaskFilterStats({
    required this.total,
    required this.pending,
    required this.completed,
  });

  factory TaskFilterStats.fromTasks(List<TaskModel> tasks) {
    int pending = 0;
    int completed = 0;

    for (final task in tasks) {
      if (task.status == TaskStatus.completed) {
        completed++;
      } else {
        pending++;
      }
    }

    return TaskFilterStats(
      total: tasks.length,
      pending: pending,
      completed: completed,
    );
  }
}
