import 'task_model.dart';

class PaginatedTasks {
  final List<TaskModel> items;
  final int page;
  final int limit;
  final int total;
  final int totalPages;

  const PaginatedTasks({
    required this.items,
    required this.page,
    required this.limit,
    required this.total,
    required this.totalPages,
  });

  factory PaginatedTasks.fromJson(Map<String, dynamic> json) {
    final itemsJson = json['items'] as List<dynamic>? ?? const [];
    final pagination = json['pagination'] as Map<String, dynamic>? ?? const {};

    return PaginatedTasks(
      items: itemsJson
          .whereType<Map<String, dynamic>>()
          .map(TaskModel.fromJson)
          .toList(),
      page: pagination['page'] as int? ?? 1,
      limit: pagination['limit'] as int? ?? 10,
      total: pagination['total'] as int? ?? 0,
      totalPages: pagination['totalPages'] as int? ?? 1,
    );
  }
}
