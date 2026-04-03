import 'package:flutter/material.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:makeupflow/services/auth_service.dart';
import 'package:makeupflow/screens/auth/login_screen.dart';
import 'package:makeupflow/screens/auth/register_screen.dart';
import 'package:makeupflow/screens/home_page.dart'; // Importamos la HomePage

// Este widget gestiona si mostrar la pantalla de autenticación o la de inicio
class AuthWrapper extends StatefulWidget {
  const AuthWrapper({super.key});

  @override
  State<AuthWrapper> createState() => _AuthWrapperState();
}

class _AuthWrapperState extends State<AuthWrapper> {
  final AuthService _auth = AuthService();
  bool showLoginPage = true; // Para alternar entre login y registro

  void toggleScreens() {
    setState(() {
      showLoginPage = !showLoginPage;
    });
  }

  @override
  Widget build(BuildContext context) {
    // ---- INICIO DE SESIÓN FALSO ----
    // Devolvemos directamente la HomePage para saltarnos el registro/login
    return const HomePage();
    // ----------------------------

    /* CÓDIGO ORIGINAL (real)
    return StreamBuilder<User?>(
      stream: _auth.user,
      builder: (context, snapshot) {
        // Si el usuario está autenticado, muestra la HomePage
        if (snapshot.hasData && snapshot.data != null) {
          return const HomePage();
        } else {
          // Si no está autenticado, muestra la pantalla de Login o Registro
          if (showLoginPage) {
            return LoginScreen(showRegisterPage: toggleScreens);
          } else {
            return RegisterScreen(showLoginPage: toggleScreens);
          }
        }
      },
    );
    */
  }
}