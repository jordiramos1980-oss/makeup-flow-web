import 'package:flutter/material.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:intl/date_symbol_data_local.dart'; // Importación para el formato de fecha
import 'firebase_options.dart';
import 'package:makeupflow/screens/auth_wrapper.dart';
import 'package:makeupflow/constants/app_colors.dart';


void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await Firebase.initializeApp(
    options: DefaultFirebaseOptions.currentPlatform,
  );
  await initializeDateFormatting('es', null); // Inicializa el formato de fecha para español
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Makeupflow',
      theme: ThemeData(
        primarySwatch: Colors.pink,
        scaffoldBackgroundColor: AppColors.primaryPink, // Usamos los colores centrales
        appBarTheme: const AppBarTheme(
          backgroundColor: Colors.white,
          elevation: 0, // Sin sombra para un look más limpio
          iconTheme: IconThemeData(color: AppColors.accentFuchsia), // Color del icono del menú
        ),
        drawerTheme: const DrawerThemeData(
          backgroundColor: AppColors.accentFuchsia, // Color de fondo fucsia para el menú
        ),
      ),
      home: const AuthWrapper(), // Usamos AuthWrapper para gestionar el flujo de autenticación
      debugShowCheckedModeBanner: false, // Quita la banda de "Debug"
    );
  }
}