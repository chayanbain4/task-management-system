import 'package:flutter/material.dart';

class AppColors {
  static const Color primary = Color(0xFF6C63FF);
  static const Color secondary = Color(0xFF8F6BFF);
  static const Color accent = Color(0xFF3ED7C4);
  static const Color dark = Color(0xFF111827);
  static const Color slate = Color(0xFF475569);
  static const Color light = Color(0xFFF8FAFC);
  static const Color success = Color(0xFF10B981);
  static const Color warning = Color(0xFFF59E0B);
  static const Color danger = Color(0xFFEF4444);
  static const Color border = Color(0xFFE5E7EB);

  static const LinearGradient authGradient = LinearGradient(
    colors: [
      Color(0xFF0F172A),
      Color(0xFF312E81),
      Color(0xFF6C63FF),
    ],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );

  static const LinearGradient primaryGradient = LinearGradient(
    colors: [
      Color(0xFF6C63FF),
      Color(0xFF8F6BFF),
      Color(0xFF3ED7C4),
    ],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );
}
