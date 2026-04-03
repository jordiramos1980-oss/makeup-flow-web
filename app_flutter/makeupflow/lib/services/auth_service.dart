import 'package:firebase_auth/firebase_auth.dart';

class AuthService {
  final FirebaseAuth _firebaseAuth = FirebaseAuth.instance;

  // Stream para escuchar cambios en el estado de autenticación (usuario logueado/deslogueado)
  Stream<User?> get user {
    return _firebaseAuth.authStateChanges();
  }

  // Método para registrar un usuario con email y contraseña
  Future<User?> signUpWithEmailAndPassword(String email, String password) async {
    try {
      UserCredential result = await _firebaseAuth.createUserWithEmailAndPassword(
        email: email,
        password: password,
      );
      return result.user;
    } on FirebaseAuthException catch (e) {
      // Manejo de errores específicos de Firebase Auth
      print('Error al registrar usuario: ${e.message}');
      return null;
    } catch (e) {
      print('Error desconocido al registrar usuario: $e');
      return null;
    }
  }

  // Método para iniciar sesión con email y contraseña
  Future<User?> signInWithEmailAndPassword(String email, String password) async {
    try {
      UserCredential result = await _firebaseAuth.signInWithEmailAndPassword(
        email: email,
        password: password,
      );
      return result.user;
    } on FirebaseAuthException catch (e) {
      // Manejo de errores específicos de Firebase Auth
      print('Error al iniciar sesión: ${e.message}');
      return null;
    } catch (e) {
      print('Error desconocido al iniciar sesión: $e');
      return null;
    }
  }

  // Método para cerrar sesión
  Future<void> signOut() async {
    try {
      return await _firebaseAuth.signOut();
    } catch (e) {
      print('Error al cerrar sesión: $e');
      return null;
    }
  }
}
