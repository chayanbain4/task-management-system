import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/network/api_client.dart';
import '../models/paginated_tasks.dart';
import '../models/task_model.dart';
import '../models/task_status.dart';

final taskRepositoryProvider = Provider<TaskRepository>((ref) {
  return TaskRepository(apiClient: ref.read(apiClientProvider));
});

class TaskRepository {
  TaskRepository({required ApiClient apiClient}) : _apiClient = apiClient;

  final ApiClient _apiClient;

  Future<PaginatedTasks> fetchTasks({
    required int page,
    required int limit,
    TaskFilter filter = TaskFilter.all,
    String search = '',
  }) async {
    final response = await _apiClient.get(
      '/tasks',
      queryParameters: {
        'page': page,
        'limit': limit,
        if (filter.apiValue != null) 'status': filter.apiValue,
        if (search.trim().isNotEmpty) 'search': search.trim(),
      },
    );

    final body = response.data as Map<String, dynamic>;
    final data = body['data'] as Map<String, dynamic>;
    return PaginatedTasks.fromJson(data);
  }

  Future<TaskModel> createTask({
    required String title,
    String? description,
    TaskStatus status = TaskStatus.pending,
  }) async {
    final response = await _apiClient.post(
      '/tasks',
      data: {
        'title': title.trim(),
        if (description != null && description.trim().isNotEmpty) 'description': description.trim(),
        'status': status.apiValue,
      },
    );

    final body = response.data as Map<String, dynamic>;
    return TaskModel.fromJson(body['data'] as Map<String, dynamic>);
  }

  Future<TaskModel> updateTask({
    required String id,
    String? title,
    String? description,
    TaskStatus? status,
  }) async {
    final response = await _apiClient.patch(
      '/tasks/$id',
      data: {
        if (title != null) 'title': title.trim(),
        'description': description?.trim().isEmpty ?? true ? null : description?.trim(),
        if (status != null) 'status': status.apiValue,
      },
    );

    final body = response.data as Map<String, dynamic>;
    return TaskModel.fromJson(body['data'] as Map<String, dynamic>);
  }

  Future<void> deleteTask(String id) async {
    await _apiClient.delete('/tasks/$id');
  }

  Future<TaskModel> toggleTask(String id) async {
    final response = await _apiClient.patch('/tasks/$id/toggle');
    final body = response.data as Map<String, dynamic>;
    return TaskModel.fromJson(body['data'] as Map<String, dynamic>);
  }
}
