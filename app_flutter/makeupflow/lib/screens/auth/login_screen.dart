import 'package:flutter/material.dart';
import 'package:makeupflow/services/auth_service.dart';
import 'package:makeupflow/constants/app_colors.dart';
import 'package:firebase_auth/firebase_auth.dart';

class LoginScreen extends StatefulWidget {
  final VoidCallback? showRegisterPage;

  const LoginScreen({super.key, this.showRegisterPage});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  final AuthService _auth = AuthService();
  String? _errorMessage;

  Future<void> _signIn() async {
    setState(() {
      _errorMessage = null; // Limpiar mensajes de error anteriores
    });
    User? user = await _auth.signInWithEmailAndPassword(
      _emailController.text.trim(),
      _passwordController.text.trim(),
    );
    if (user == null) {
      setState(() {
        _errorMessage = 'Credenciales incorrectas o usuario no encontrado.';
      });
    }
    // Si el usuario es nulo, el error se maneja en _auth y se muestra el mensaje aquí.
    // Si no es nulo, el AuthWrapper detectará el cambio y navegará a la HomePage.
  }

  @override
  void dispose() {
    _emailController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Iniciar Sesión', style: TextStyle(color: AppColors.accentFuchsia)),
        backgroundColor: AppColors.primaryPink,
      ),
      backgroundColor: AppColors.primaryPink,
      body: Center(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24.0),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              // Título de la app
              RichText(
                text: const TextSpan(
                  style: TextStyle(fontSize: 32, fontWeight: FontWeight.bold),
                  children: [
                    TextSpan(text: 'Makeup', style: TextStyle(color: AppColors.textPink)),
                    TextSpan(text: 'f', style: TextStyle(color: AppColors.textFuchsia)),
                    TextSpan(text: 'low', style: TextStyle(color: AppColors.textLilac)),
                  ],
                ),
              ),
              const SizedBox(height: 50),
              // Campo de Email
              TextField(
                controller: _emailController,
                keyboardType: TextInputType.emailAddress,
                decoration: InputDecoration(
                  labelText: 'Email',
                  hintText: 'ejemplo@correo.com',
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(10)),
                  filled: true,
                  fillColor: Colors.white.withOpacity(0.8),
                  labelStyle: TextStyle(color: AppColors.accentFuchsia),
                  focusedBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(10),
                    borderSide: BorderSide(color: AppColors.accentFuchsia, width: 2),
                  ),
                ),
              ),
              const SizedBox(height: 20),
              // Campo de Contraseña
              TextField(
                controller: _passwordController,
                obscureText: true,
                decoration: InputDecoration(
                  labelText: 'Contraseña',
                  hintText: '********',
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(10)),
                  filled: true,
                  fillColor: Colors.white.withOpacity(0.8),
                  labelStyle: TextStyle(color: AppColors.accentFuchsia),
                  focusedBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(10),
                    borderSide: BorderSide(color: AppColors.accentFuchsia, width: 2),
                  ),
                ),
              ),
              const SizedBox(height: 30),
              // Mensaje de error
              if (_errorMessage != null)
                Padding(
                  padding: const EdgeInsets.only(bottom: 20),
                  child: Text(
                    _errorMessage!,
                    style: const TextStyle(color: Colors.red, fontSize: 16),
                    textAlign: TextAlign.center,
                  ),
                ),
              // Botón de Iniciar Sesión
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: _signIn,
                  style: ElevatedButton.styleFrom(
                    padding: const EdgeInsets.symmetric(vertical: 15),
                    backgroundColor: AppColors.accentFuchsia, // Color fucsia para el botón
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(10),
                    ),
                  ),
                  child: const Text(
                    'Iniciar Sesión',
                    style: TextStyle(fontSize: 18, color: Colors.white),
                  ),
                ),
              ),
              const SizedBox(height: 20),
              // Opción para registrarse
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Text(
                    '¿No tienes cuenta?',
                    style: TextStyle(color: AppColors.textFuchsia),
                  ),
                  TextButton(
                    onPressed: widget.showRegisterPage,
                    child: const Text(
                      'Regístrate aquí',
                      style: TextStyle(
                        color: AppColors.textPink,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}
