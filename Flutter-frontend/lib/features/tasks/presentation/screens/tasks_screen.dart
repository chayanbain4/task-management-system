import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../core/utils/snackbar_utils.dart';
import '../../../../core/widgets/empty_state.dart';
import '../../../auth/presentation/controllers/auth_controller.dart';
import '../../models/task_filter_stats.dart';
import '../../models/task_model.dart';
import '../../models/task_status.dart';
import '../controllers/tasks_controller.dart';
import '../widgets/task_card.dart';
import 'task_form_screen.dart';

class TasksScreen extends ConsumerStatefulWidget {
  const TasksScreen({super.key});

  @override
  ConsumerState<TasksScreen> createState() => _TasksScreenState();
}

class _TasksScreenState extends ConsumerState<TasksScreen> {
  final _searchController = TextEditingController();
  final _scrollController = ScrollController();
  Timer? _searchDebounce;

  @override
  void initState() {
    super.initState();
    _scrollController.addListener(_onScroll);
  }

  void _onScroll() {
    if (_scrollController.position.pixels >= _scrollController.position.maxScrollExtent - 180) {
      ref.read(tasksControllerProvider.notifier).loadMore();
    }
  }

  @override
  void dispose() {
    _searchDebounce?.cancel();
    _searchController.dispose();
    _scrollController.dispose();
    super.dispose();
  }

  Future<void> _openTaskForm([TaskModel? task]) async {
    await Navigator.of(context).push(
      MaterialPageRoute(
        builder: (_) => TaskFormScreen(task: task),
      ),
    );
  }

  Future<void> _confirmDelete(String id) async {
    final confirmed = await showDialog<bool>(
          context: context,
          builder: (context) {
            return AlertDialog(
              title: const Text('Delete task'),
              content: const Text('Are you sure you want to delete this task?'),
              actions: [
                TextButton(
                  onPressed: () => Navigator.of(context).pop(false),
                  child: const Text('Cancel'),
                ),
                FilledButton(
                  onPressed: () => Navigator.of(context).pop(true),
                  child: const Text('Delete'),
                ),
              ],
            );
          },
        ) ??
        false;

    if (!confirmed) return;

    try {
      await ref.read(tasksControllerProvider.notifier).deleteTask(id);
      if (mounted) {
        showAppSnackBar(context, 'Task deleted successfully');
      }
    } catch (e) {
      if (mounted) {
        showAppSnackBar(context, e.toString(), isError: true);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final authState = ref.watch(authControllerProvider);
    final taskState = ref.watch(tasksControllerProvider);
    final stats = TaskFilterStats.fromTasks(taskState.items);

    return Scaffold(
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () => _openTaskForm(),
        label: const Text('Add task'),
        icon: const Icon(Icons.add_rounded),
      ),
      body: RefreshIndicator(
        onRefresh: () => ref.read(tasksControllerProvider.notifier).refresh(),
        child: CustomScrollView(
          controller: _scrollController,
          physics: const AlwaysScrollableScrollPhysics(),
          slivers: [
            SliverToBoxAdapter(
              child: _HeaderSection(
                name: authState.user?.name ?? 'User',
                stats: stats,
                onLogout: () {
                  ref.read(authControllerProvider.notifier).logout();
                },
              ),
            ),
            SliverToBoxAdapter(
              child: Padding(
                padding: const EdgeInsets.fromLTRB(18, 18, 18, 12),
                child: Column(
                  children: [
                    TextField(
                      controller: _searchController,
                      onChanged: (value) {
                        setState(() {});
                        _searchDebounce?.cancel();
                        _searchDebounce = Timer(const Duration(milliseconds: 450), () {
                          ref.read(tasksControllerProvider.notifier).setSearch(value);
                        });
                      },
                      decoration: InputDecoration(
                        hintText: 'Search by title...',
                        prefixIcon: const Icon(Icons.search_rounded),
                        suffixIcon: _searchController.text.isEmpty
                            ? null
                            : IconButton(
                                onPressed: () {
                                  _searchController.clear();
                                  ref.read(tasksControllerProvider.notifier).setSearch('');
                                  setState(() {});
                                },
                                icon: const Icon(Icons.close_rounded),
                              ),
                      ),
                    ),
                    const SizedBox(height: 14),
                    SizedBox(
                      height: 42,
                      child: ListView.separated(
                        scrollDirection: Axis.horizontal,
                        itemBuilder: (context, index) {
                          final filter = TaskFilter.values[index];
                          final selected = taskState.filter == filter;
                          return ChoiceChip(
                            label: Text(filter.label),
                            selected: selected,
                            onSelected: (_) => ref.read(tasksControllerProvider.notifier).setFilter(filter),
                          );
                        },
                        separatorBuilder: (_, __) => const SizedBox(width: 10),
                        itemCount: TaskFilter.values.length,
                      ),
                    ),
                  ],
                ),
              ),
            ),
            if (taskState.isLoading)
              const SliverFillRemaining(
                hasScrollBody: false,
                child: Center(child: CircularProgressIndicator()),
              )
            else if (taskState.items.isEmpty)
              const SliverFillRemaining(
                hasScrollBody: false,
                child: EmptyState(
                  title: 'No tasks yet',
                  subtitle: 'Create your first task to start tracking your work beautifully.',
                ),
              )
            else
              SliverPadding(
                padding: const EdgeInsets.fromLTRB(18, 6, 18, 120),
                sliver: SliverList(
                  delegate: SliverChildBuilderDelegate(
                    (context, index) {
                    if (index >= taskState.items.length) {
                      return const Padding(
                        padding: EdgeInsets.symmetric(vertical: 18),
                        child: Center(child: CircularProgressIndicator()),
                      );
                    }

                    final task = taskState.items[index];
                    return TaskCard(
                      task: task,
                      onToggle: () async {
                        try {
                          await ref.read(tasksControllerProvider.notifier).toggleTask(task.id);
                        } catch (e) {
                          if (mounted) {
                            showAppSnackBar(context, e.toString(), isError: true);
                          }
                        }
                      },
                      onEdit: () => _openTaskForm(task),
                      onDelete: () => _confirmDelete(task.id),
                    );
                    },
                    childCount: taskState.items.length + (taskState.isLoadingMore ? 1 : 0),
                  ),
                ),
              ),
          ],
        ),
      ),
    );
  }
}

class _HeaderSection extends StatelessWidget {
  const _HeaderSection({
    required this.name,
    required this.stats,
    required this.onLogout,
  });

  final String name;
  final TaskFilterStats stats;
  final VoidCallback onLogout;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.fromLTRB(18, 64, 18, 22),
      decoration: const BoxDecoration(
        gradient: LinearGradient(
          colors: [
            Color(0xFF0F172A),
            Color(0xFF312E81),
            Color(0xFF6C63FF),
          ],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.vertical(
          bottom: Radius.circular(34),
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              const Expanded(
                child: _BrandBlock(),
              ),
              IconButton(
                onPressed: onLogout,
                icon: const Icon(Icons.logout_rounded, color: Colors.white),
              ),
            ],
          ),
          const SizedBox(height: 18),
          Text(
            'Hello, $name',
            style: const TextStyle(
              color: Colors.white,
              fontSize: 28,
              fontWeight: FontWeight.w800,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            'Stay organized, focused, and in control of your tasks.',
            style: TextStyle(
              color: Colors.white.withOpacity(0.84),
              height: 1.5,
            ),
          ),
          const SizedBox(height: 20),
          Row(
            children: [
              Expanded(child: _StatCard(label: 'Total', value: stats.total.toString())),
              const SizedBox(width: 12),
              Expanded(child: _StatCard(label: 'Pending', value: stats.pending.toString())),
              const SizedBox(width: 12),
              Expanded(child: _StatCard(label: 'Done', value: stats.completed.toString())),
            ],
          ),
        ],
      ),
    );
  }
}

class _BrandBlock extends StatelessWidget {
  const _BrandBlock();

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Container(
          width: 52,
          height: 52,
          decoration: BoxDecoration(
            color: Colors.white.withOpacity(0.16),
            borderRadius: BorderRadius.circular(18),
          ),
          child: const Icon(Icons.task_alt_rounded, color: Colors.white),
        ),
        const SizedBox(width: 14),
        const Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'TaskFlow',
              style: TextStyle(
                color: Colors.white,
                fontSize: 18,
                fontWeight: FontWeight.w800,
              ),
            ),
            SizedBox(height: 4),
            Text(
              'Your modern task workspace',
              style: TextStyle(
                color: Colors.white70,
                fontSize: 12.5,
              ),
            ),
          ],
        ),
      ],
    );
  }
}

class _StatCard extends StatelessWidget {
  const _StatCard({
    required this.label,
    required this.value,
  });

  final String label;
  final String value;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 16),
      decoration: BoxDecoration(
        color: Colors.white.withOpacity(0.12),
        borderRadius: BorderRadius.circular(22),
      ),
      child: Column(
        children: [
          Text(
            value,
            style: const TextStyle(
              color: Colors.white,
              fontSize: 22,
              fontWeight: FontWeight.w800,
            ),
          ),
          const SizedBox(height: 6),
          Text(
            label,
            style: TextStyle(
              color: Colors.white.withOpacity(0.82),
              fontSize: 12.5,
            ),
          ),
        ],
      ),
    );
  }
}
