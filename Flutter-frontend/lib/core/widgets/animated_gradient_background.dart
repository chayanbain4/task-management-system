import 'dart:math' as math;

import 'package:flutter/material.dart';

import '../theme/app_colors.dart';

class AnimatedGradientBackground extends StatefulWidget {
  const AnimatedGradientBackground({
    super.key,
    required this.child,
  });

  final Widget child;

  @override
  State<AnimatedGradientBackground> createState() => _AnimatedGradientBackgroundState();
}

class _AnimatedGradientBackgroundState extends State<AnimatedGradientBackground> {
  bool _toggled = false;

  @override
  void initState() {
    super.initState();
    Future.delayed(const Duration(milliseconds: 250), _animate);
  }

  void _animate() {
    if (!mounted) return;
    setState(() => _toggled = !_toggled);
    Future.delayed(const Duration(seconds: 4), _animate);
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: const BoxDecoration(gradient: AppColors.authGradient),
      child: Stack(
        children: [
          AnimatedAlign(
            duration: const Duration(seconds: 4),
            curve: Curves.easeInOut,
            alignment: _toggled ? Alignment.topRight : Alignment.topLeft,
            child: _GlowOrb(
              size: 240,
              color: AppColors.accent.withOpacity(0.20),
            ),
          ),
          AnimatedAlign(
            duration: const Duration(seconds: 4),
            curve: Curves.easeInOut,
            alignment: _toggled ? Alignment.bottomLeft : Alignment.bottomRight,
            child: _GlowOrb(
              size: 220,
              color: Colors.white.withOpacity(0.12),
            ),
          ),
          Positioned.fill(
            child: CustomPaint(
              painter: _GridPainter(opacity: 0.08),
            ),
          ),
          SafeArea(child: widget.child),
        ],
      ),
    );
  }
}

class _GlowOrb extends StatelessWidget {
  const _GlowOrb({
    required this.size,
    required this.color,
  });

  final double size;
  final Color color;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: size,
      height: size,
      margin: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        shape: BoxShape.circle,
        gradient: RadialGradient(
          colors: [
            color,
            color.withOpacity(0.02),
          ],
        ),
      ),
    );
  }
}

class _GridPainter extends CustomPainter {
  const _GridPainter({required this.opacity});

  final double opacity;

  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = Colors.white.withOpacity(opacity)
      ..strokeWidth = 1;

    const spacing = 28.0;
    for (double x = 0; x <= size.width; x += spacing) {
      canvas.drawLine(Offset(x, 0), Offset(x, size.height), paint);
    }
    for (double y = 0; y <= size.height; y += spacing) {
      canvas.drawLine(Offset(0, y), Offset(size.width, y), paint);
    }

    final dotPaint = Paint()..color = Colors.white.withOpacity(opacity + 0.04);
    for (double x = 0; x <= size.width; x += spacing * 2) {
      for (double y = 0; y <= size.height; y += spacing * 2) {
        canvas.drawCircle(Offset(x + 4 * math.sin(y), y), 1.2, dotPaint);
      }
    }
  }

  @override
  bool shouldRepaint(covariant _GridPainter oldDelegate) => oldDelegate.opacity != opacity;
}
