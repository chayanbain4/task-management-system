import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../core/utils/snackbar_utils.dart';
import '../../../../core/widgets/app_text_field.dart';
import '../../../../core/widgets/primary_button.dart';
import '../../models/task_model.dart';
import '../../models/task_status.dart';
import '../controllers/tasks_controller.dart';

class TaskFormScreen extends ConsumerStatefulWidget {
  const TaskFormScreen({
    super.key,
    this.task,
  });

  final TaskModel? task;

  bool get isEdit => task != null;

  @override
  ConsumerState<TaskFormScreen> createState() => _TaskFormScreenState();
}

class _TaskFormScreenState extends ConsumerState<TaskFormScreen> {
  late final TextEditingController _titleController;
  late final TextEditingController _descriptionController;
  late TaskStatus _status;
  bool _isSaving = false;

  @override
  void initState() {
    super.initState();
    _titleController = TextEditingController(text: widget.task?.title ?? '');
    _descriptionController = TextEditingController(text: widget.task?.description ?? '');
    _status = widget.task?.status ?? TaskStatus.pending;
  }

  @override
  void dispose() {
    _titleController.dispose();
    _descriptionController.dispose();
    super.dispose();
  }

  Future<void> _save() async {
    if (_titleController.text.trim().isEmpty) {
      showAppSnackBar(context, 'Title is required', isError: true);
      return;
    }

    setState(() => _isSaving = true);
    final controller = ref.read(tasksControllerProvider.notifier);

    try {
      if (widget.isEdit) {
        await controller.updateTask(
          id: widget.task!.id,
          title: _titleController.text.trim(),
          description: _descriptionController.text.trim(),
          status: _status,
        );
        if (mounted) {
          showAppSnackBar(context, 'Task updated successfully');
        }
      } else {
        await controller.createTask(
          title: _titleController.text.trim(),
          description: _descriptionController.text.trim(),
          status: _status,
        );
        if (mounted) {
          showAppSnackBar(context, 'Task created successfully');
        }
      }

      if (mounted) Navigator.of(context).pop(true);
    } catch (e) {
      if (mounted) {
        showAppSnackBar(context, e.toString(), isError: true);
      }
    } finally {
      if (mounted) setState(() => _isSaving = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final isEdit = widget.isEdit;

    return Scaffold(
      appBar: AppBar(
        title: Text(isEdit ? 'Edit task' : 'Create task'),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.fromLTRB(20, 10, 20, 28),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(
              padding: const EdgeInsets.all(22),
              decoration: BoxDecoration(
                gradient: const LinearGradient(
                  colors: [
                    Color(0xFF6C63FF),
                    Color(0xFF8F6BFF),
                  ],
                ),
                borderRadius: BorderRadius.circular(28),
              ),
              child: Row(
                children: [
                  Container(
                    width: 56,
                    height: 56,
                    decoration: BoxDecoration(
                      color: Colors.white.withOpacity(0.16),
                      borderRadius: BorderRadius.circular(18),
                    ),
                    child: const Icon(Icons.task_alt_rounded, color: Colors.white),
                  ),
                  const SizedBox(width: 16),
                  Expanded(
                    child: Text(
                      isEdit ? 'Update task details' : 'Create a new task quickly',
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 18,
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 22),
            AppTextField(
              controller: _titleController,
              label: 'Title',
              hint: 'Enter task title',
              textInputAction: TextInputAction.next,
              prefixIcon: const Icon(Icons.title_rounded),
            ),
            const SizedBox(height: 16),
            AppTextField(
              controller: _descriptionController,
              label: 'Description',
              hint: 'Optional details',
              maxLines: 5,
              prefixIcon: const Padding(
                padding: EdgeInsets.only(bottom: 74),
                child: Icon(Icons.notes_rounded),
              ),
            ),
            const SizedBox(height: 20),
            Text(
              'Status',
              style: Theme.of(context).textTheme.titleMedium?.copyWith(
                    fontWeight: FontWeight.w700,
                  ),
            ),
            const SizedBox(height: 10),
            Wrap(
              spacing: 10,
              children: TaskStatus.values.map((status) {
                final selected = _status == status;
                return ChoiceChip(
                  label: Text(status.label),
                  selected: selected,
                  onSelected: (_) => setState(() => _status = status),
                );
              }).toList(),
            ),
            const SizedBox(height: 28),
            PrimaryButton(
              label: isEdit ? 'Save changes' : 'Create task',
              icon: isEdit ? Icons.save_alt_rounded : Icons.add_task_rounded,
              isLoading: _isSaving,
              onPressed: _save,
            ),
          ],
        ),
      ),
    );
  }
}
