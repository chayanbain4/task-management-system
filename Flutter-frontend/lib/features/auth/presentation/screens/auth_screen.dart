import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_svg/flutter_svg.dart';

import '../../../../core/utils/snackbar_utils.dart';
import '../../../../core/widgets/animated_gradient_background.dart';
import '../../../../core/widgets/app_text_field.dart';
import '../../../../core/widgets/glass_card.dart';
import '../../../../core/widgets/primary_button.dart';
import '../controllers/auth_controller.dart';

class AuthScreen extends ConsumerStatefulWidget {
  const AuthScreen({super.key});

  @override
  ConsumerState<AuthScreen> createState() => _AuthScreenState();
}

class _AuthScreenState extends ConsumerState<AuthScreen> {
  bool _showLogin = true;
  bool _hidePassword = true;
  bool _hideConfirmPassword = true;

  final _nameController = TextEditingController();
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  final _confirmPasswordController = TextEditingController();

  @override
  void dispose() {
    _nameController.dispose();
    _emailController.dispose();
    _passwordController.dispose();
    _confirmPasswordController.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    final auth = ref.read(authControllerProvider.notifier);

    if (_showLogin) {
      if (_emailController.text.trim().isEmpty || _passwordController.text.isEmpty) {
        showAppSnackBar(context, 'Please enter email and password', isError: true);
        return;
      }

      try {
        await auth.login(
          email: _emailController.text.trim(),
          password: _passwordController.text,
        );
        if (mounted) {
          showAppSnackBar(context, 'Welcome back');
        }
      } catch (e) {
        if (mounted) {
          showAppSnackBar(context, e.toString(), isError: true);
        }
      }
      return;
    }

    if (_nameController.text.trim().length < 2) {
      showAppSnackBar(context, 'Name must be at least 2 characters', isError: true);
      return;
    }

    if (_emailController.text.trim().isEmpty || !_emailController.text.contains('@')) {
      showAppSnackBar(context, 'Please enter a valid email', isError: true);
      return;
    }

    if (_passwordController.text.length < 6) {
      showAppSnackBar(context, 'Password must be at least 6 characters', isError: true);
      return;
    }

    if (_passwordController.text != _confirmPasswordController.text) {
      showAppSnackBar(context, 'Passwords do not match', isError: true);
      return;
    }

    try {
      await auth.register(
        name: _nameController.text.trim(),
        email: _emailController.text.trim(),
        password: _passwordController.text,
      );
      if (mounted) {
        showAppSnackBar(context, 'Account created successfully');
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
    final bottomInset = MediaQuery.of(context).viewInsets.bottom;

    return Scaffold(
      backgroundColor: Colors.transparent,
      body: AnimatedGradientBackground(
        child: SafeArea(
          child: AnimatedPadding(
            duration: const Duration(milliseconds: 250),
            padding: EdgeInsets.only(bottom: bottomInset),
            child: Center(
              child: SingleChildScrollView(
                padding: const EdgeInsets.fromLTRB(22, 10, 22, 32),
                child: ConstrainedBox(
                  constraints: const BoxConstraints(maxWidth: 480),
                  child: Column(
                    children: [
                      const SizedBox(height: 10),
                      TweenAnimationBuilder<double>(
                        tween: Tween(begin: 0.94, end: 1),
                        duration: const Duration(milliseconds: 600),
                        curve: Curves.easeOutBack,
                        builder: (context, value, child) {
                          return Transform.scale(scale: value, child: child);
                        },
                        child: SvgPicture.asset(
                          'assets/svg/auth_hero.svg',
                          height: 220,
                        ),
                      ),
                      const SizedBox(height: 20),
                      GlassCard(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            _SegmentSwitch(
                              showLogin: _showLogin,
                              onChanged: (value) => setState(() => _showLogin = value),
                            ),
                            const SizedBox(height: 24),
                            AnimatedSwitcher(
                              duration: const Duration(milliseconds: 280),
                              child: _showLogin
                                  ? const _AuthFormTitle(
                                      key: ValueKey('login-title'),
                                      title: 'Welcome back',
                                      subtitle: 'Login to manage tasks beautifully and faster.',
                                    )
                                  : const _AuthFormTitle(
                                      key: ValueKey('register-title'),
                                      title: 'Create your account',
                                      subtitle:
                                          'Register once and manage your personal tasks securely.',
                                    ),
                            ),
                            const SizedBox(height: 24),
                            AnimatedSwitcher(
                              duration: const Duration(milliseconds: 240),
                              switchInCurve: Curves.easeOut,
                              switchOutCurve: Curves.easeIn,
                              child: _showLogin
                                  ? _LoginFields(
                                      key: const ValueKey('login-fields'),
                                      emailController: _emailController,
                                      passwordController: _passwordController,
                                      hidePassword: _hidePassword,
                                      onTogglePassword: () => setState(
                                        () => _hidePassword = !_hidePassword,
                                      ),
                                    )
                                  : _RegisterFields(
                                      key: const ValueKey('register-fields'),
                                      nameController: _nameController,
                                      emailController: _emailController,
                                      passwordController: _passwordController,
                                      confirmPasswordController: _confirmPasswordController,
                                      hidePassword: _hidePassword,
                                      hideConfirmPassword: _hideConfirmPassword,
                                      onTogglePassword: () => setState(
                                        () => _hidePassword = !_hidePassword,
                                      ),
                                      onToggleConfirmPassword: () => setState(
                                        () => _hideConfirmPassword = !_hideConfirmPassword,
                                      ),
                                    ),
                            ),
                            const SizedBox(height: 22),
                            PrimaryButton(
                              label: _showLogin ? 'Login' : 'Create account',
                              icon: _showLogin
                                  ? Icons.login_rounded
                                  : Icons.person_add_alt_1_rounded,
                              isLoading: authState.isSubmitting,
                              onPressed: _submit,
                            ),
                            const SizedBox(height: 18),
                            Center(
                              child: TextButton(
                                onPressed: () => setState(() => _showLogin = !_showLogin),
                                child: Text(
                                  _showLogin
                                      ? "Don't have an account? Register"
                                      : 'Already have an account? Login',
                                  style: const TextStyle(color: Colors.white),
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }
}

class _SegmentSwitch extends StatelessWidget {
  const _SegmentSwitch({
    required this.showLogin,
    required this.onChanged,
  });

  final bool showLogin;
  final ValueChanged<bool> onChanged;

  @override
  Widget build(BuildContext context) {
    return Material(
      color: Colors.transparent,
      child: Container(
        padding: const EdgeInsets.all(4),
        decoration: BoxDecoration(
          color: Colors.white.withOpacity(0.12),
          borderRadius: BorderRadius.circular(18),
        ),
        child: Row(
          children: [
            Expanded(
              child: _SegmentButton(
                label: 'Login',
                active: showLogin,
                onTap: () => onChanged(true),
              ),
            ),
            Expanded(
              child: _SegmentButton(
                label: 'Register',
                active: !showLogin,
                onTap: () => onChanged(false),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _SegmentButton extends StatelessWidget {
  const _SegmentButton({
    required this.label,
    required this.active,
    required this.onTap,
  });

  final String label;
  final bool active;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return AnimatedContainer(
      duration: const Duration(milliseconds: 220),
      decoration: BoxDecoration(
        color: active ? Colors.white : Colors.transparent,
        borderRadius: BorderRadius.circular(14),
      ),
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          onTap: onTap,
          borderRadius: BorderRadius.circular(14),
          child: Padding(
            padding: const EdgeInsets.symmetric(vertical: 13),
            child: Text(
              label,
              textAlign: TextAlign.center,
              style: TextStyle(
                color: active ? const Color(0xFF0F172A) : Colors.white,
                fontWeight: FontWeight.w700,
              ),
            ),
          ),
        ),
      ),
    );
  }
}

class _AuthFormTitle extends StatelessWidget {
  const _AuthFormTitle({
    super.key,
    required this.title,
    required this.subtitle,
  });

  final String title;
  final String subtitle;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          title,
          style: const TextStyle(
            color: Colors.white,
            fontSize: 28,
            fontWeight: FontWeight.w800,
          ),
        ),
        const SizedBox(height: 8),
        Text(
          subtitle,
          style: TextStyle(
            color: Colors.white.withOpacity(0.78),
            height: 1.45,
          ),
        ),
      ],
    );
  }
}

class _LoginFields extends StatelessWidget {
  const _LoginFields({
    super.key,
    required this.emailController,
    required this.passwordController,
    required this.hidePassword,
    required this.onTogglePassword,
  });

  final TextEditingController emailController;
  final TextEditingController passwordController;
  final bool hidePassword;
  final VoidCallback onTogglePassword;

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        AppTextField(
          controller: emailController,
          label: 'Email',
          keyboardType: TextInputType.emailAddress,
          prefixIcon: const Icon(Icons.alternate_email_rounded),
        ),
        const SizedBox(height: 16),
        AppTextField(
          controller: passwordController,
          label: 'Password',
          obscureText: hidePassword,
          prefixIcon: const Icon(Icons.lock_outline_rounded),
          suffixIcon: IconButton(
            onPressed: onTogglePassword,
            icon: Icon(
              hidePassword ? Icons.visibility_rounded : Icons.visibility_off_rounded,
            ),
          ),
        ),
      ],
    );
  }
}

class _RegisterFields extends StatelessWidget {
  const _RegisterFields({
    super.key,
    required this.nameController,
    required this.emailController,
    required this.passwordController,
    required this.confirmPasswordController,
    required this.hidePassword,
    required this.hideConfirmPassword,
    required this.onTogglePassword,
    required this.onToggleConfirmPassword,
  });

  final TextEditingController nameController;
  final TextEditingController emailController;
  final TextEditingController passwordController;
  final TextEditingController confirmPasswordController;
  final bool hidePassword;
  final bool hideConfirmPassword;
  final VoidCallback onTogglePassword;
  final VoidCallback onToggleConfirmPassword;

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        AppTextField(
          controller: nameController,
          label: 'Full name',
          prefixIcon: const Icon(Icons.person_outline_rounded),
        ),
        const SizedBox(height: 16),
        AppTextField(
          controller: emailController,
          label: 'Email',
          keyboardType: TextInputType.emailAddress,
          prefixIcon: const Icon(Icons.alternate_email_rounded),
        ),
        const SizedBox(height: 16),
        AppTextField(
          controller: passwordController,
          label: 'Password',
          obscureText: hidePassword,
          prefixIcon: const Icon(Icons.lock_outline_rounded),
          suffixIcon: IconButton(
            onPressed: onTogglePassword,
            icon: Icon(
              hidePassword ? Icons.visibility_rounded : Icons.visibility_off_rounded,
            ),
          ),
        ),
        const SizedBox(height: 16),
        AppTextField(
          controller: confirmPasswordController,
          label: 'Confirm password',
          obscureText: hideConfirmPassword,
          prefixIcon: const Icon(Icons.verified_user_outlined),
          suffixIcon: IconButton(
            onPressed: onToggleConfirmPassword,
            icon: Icon(
              hideConfirmPassword ? Icons.visibility_rounded : Icons.visibility_off_rounded,
            ),
          ),
        ),
      ],
    );
  }
}