import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../core/config/app_config.dart';
import '../../../../core/errors/api_exception.dart';
import '../../../auth/presentation/controllers/auth_controller.dart';
import '../../data/task_repository.dart';
import '../../models/task_model.dart';
import '../../models/task_status.dart';

final tasksControllerProvider =
    StateNotifierProvider.autoDispose<TasksController, TasksState>((ref) {
  return TasksController(ref);
});

class TasksState {
  final List<TaskModel> items;
  final int page;
  final int totalPages;
  final int total;
  final TaskFilter filter;
  final String search;
  final bool isLoading;
  final bool isRefreshing;
  final bool isLoadingMore;
  final String? errorMessage;

  const TasksState({
    this.items = const [],
    this.page = 1,
    this.totalPages = 1,
    this.total = 0,
    this.filter = TaskFilter.all,
    this.search = '',
    this.isLoading = false,
    this.isRefreshing = false,
    this.isLoadingMore = false,
    this.errorMessage,
  });

  bool get hasMore => page < totalPages;

  TasksState copyWith({
    List<TaskModel>? items,
    int? page,
    int? totalPages,
    int? total,
    TaskFilter? filter,
    String? search,
    bool? isLoading,
    bool? isRefreshing,
    bool? isLoadingMore,
    String? errorMessage,
    bool clearError = false,
  }) {
    return TasksState(
      items: items ?? this.items,
      page: page ?? this.page,
      totalPages: totalPages ?? this.totalPages,
      total: total ?? this.total,
      filter: filter ?? this.filter,
      search: search ?? this.search,
      isLoading: isLoading ?? this.isLoading,
      isRefreshing: isRefreshing ?? this.isRefreshing,
      isLoadingMore: isLoadingMore ?? this.isLoadingMore,
      errorMessage: clearError ? null : (errorMessage ?? this.errorMessage),
    );
  }
}

class TasksController extends StateNotifier<TasksState> {
  TasksController(this.ref) : super(const TasksState(isLoading: true)) {
    loadInitial();
  }

  final Ref ref;

  TaskRepository get _repository => ref.read(taskRepositoryProvider);

  Future<void> loadInitial() async {
    state = state.copyWith(
      isLoading: true,
      page: 1,
      clearError: true,
    );

    try {
      final result = await _repository.fetchTasks(
        page: 1,
        limit: AppConfig.defaultPageSize,
        filter: state.filter,
        search: state.search,
      );

      state = state.copyWith(
        items: result.items,
        page: result.page,
        total: result.total,
        totalPages: result.totalPages,
        isLoading: false,
        isRefreshing: false,
        isLoadingMore: false,
        clearError: true,
      );
    } catch (e) {
      await _handleError(e);
      state = state.copyWith(
        isLoading: false,
        isRefreshing: false,
        isLoadingMore: false,
        errorMessage: e.toString(),
      );
    }
  }

  Future<void> refresh() async {
    state = state.copyWith(
      isRefreshing: true,
      clearError: true,
    );

    try {
      final result = await _repository.fetchTasks(
        page: 1,
        limit: AppConfig.defaultPageSize,
        filter: state.filter,
        search: state.search,
      );

      state = state.copyWith(
        items: result.items,
        page: result.page,
        total: result.total,
        totalPages: result.totalPages,
        isRefreshing: false,
        clearError: true,
      );
    } catch (e) {
      await _handleError(e);
      state = state.copyWith(
        isRefreshing: false,
        errorMessage: e.toString(),
      );
    }
  }

  Future<void> loadMore() async {
    if (state.isLoadingMore || state.isLoading || !state.hasMore) return;

    state = state.copyWith(isLoadingMore: true);

    try {
      final nextPage = state.page + 1;
      final result = await _repository.fetchTasks(
        page: nextPage,
        limit: AppConfig.defaultPageSize,
        filter: state.filter,
        search: state.search,
      );

      state = state.copyWith(
        items: [...state.items, ...result.items],
        page: result.page,
        total: result.total,
        totalPages: result.totalPages,
        isLoadingMore: false,
      );
    } catch (e) {
      await _handleError(e);
      state = state.copyWith(
        isLoadingMore: false,
        errorMessage: e.toString(),
      );
    }
  }

  Future<void> setFilter(TaskFilter filter) async {
    state = state.copyWith(filter: filter);
    await loadInitial();
  }

  Future<void> setSearch(String search) async {
    state = state.copyWith(search: search);
    await loadInitial();
  }

  Future<void> createTask({
    required String title,
    String? description,
    TaskStatus status = TaskStatus.pending,
  }) async {
    try {
      await _repository.createTask(
        title: title,
        description: description,
        status: status,
      );
      await refresh();
    } catch (e) {
      await _handleError(e);
      rethrow;
    }
  }

  Future<void> updateTask({
    required String id,
    required String title,
    String? description,
    required TaskStatus status,
  }) async {
    try {
      await _repository.updateTask(
        id: id,
        title: title,
        description: description,
        status: status,
      );
      await refresh();
    } catch (e) {
      await _handleError(e);
      rethrow;
    }
  }

  Future<void> deleteTask(String id) async {
    try {
      await _repository.deleteTask(id);
      state = state.copyWith(
        items: state.items.where((task) => task.id != id).toList(),
        total: state.total > 0 ? state.total - 1 : 0,
      );

      if (state.items.isEmpty) {
        await refresh();
      }
    } catch (e) {
      await _handleError(e);
      rethrow;
    }
  }

  Future<void> toggleTask(String id) async {
    try {
      await _repository.toggleTask(id);
      await refresh();
    } catch (e) {
      await _handleError(e);
      rethrow;
    }
  }

  Future<void> _handleError(Object error) async {
    if (error is ApiException && error.statusCode == 401) {
      await ref.read(authControllerProvider.notifier).forceLogout();
    }
  }
}