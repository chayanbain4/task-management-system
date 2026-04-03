import 'package:flutter/material.dart';

import '../../models/task_status.dart';

class TaskStatusBadge extends StatelessWidget {
  const TaskStatusBadge({
    super.key,
    required this.status,
  });

  final TaskStatus status;

  @override
  Widget build(BuildContext context) {
    final color = status == TaskStatus.completed
        ? const Color(0xFF10B981)
        : const Color(0xFFF59E0B);

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
      decoration: BoxDecoration(
        color: color.withOpacity(0.12),
        borderRadius: BorderRadius.circular(999),
      ),
      child: Text(
        status.label,
        style: TextStyle(
          color: color,
          fontSize: 12,
          fontWeight: FontWeight.w700,
        ),
      ),
    );
  }
}
