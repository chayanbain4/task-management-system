enum TaskStatus { pending, completed }

enum TaskFilter { all, pending, completed }

extension TaskStatusX on TaskStatus {
  String get apiValue => this == TaskStatus.completed ? 'COMPLETED' : 'PENDING';

  String get label => this == TaskStatus.completed ? 'Completed' : 'Pending';

  static TaskStatus fromApi(String value) {
    return value.toUpperCase() == 'COMPLETED' ? TaskStatus.completed : TaskStatus.pending;
  }
}

extension TaskFilterX on TaskFilter {
  String get label => switch (this) {
        TaskFilter.all => 'All',
        TaskFilter.pending => 'Pending',
        TaskFilter.completed => 'Completed',
      };

  String? get apiValue => switch (this) {
        TaskFilter.all => null,
        TaskFilter.pending => 'PENDING',
        TaskFilter.completed => 'COMPLETED',
      };
}
