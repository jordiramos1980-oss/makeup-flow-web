import 'package:cloud_firestore/cloud_firestore.dart';

class FirestoreService {
  final FirebaseFirestore _db = FirebaseFirestore.instance;

  // Método para guardar una reserva en Firestore
  Future<void> saveBooking(Map<String, dynamic> bookingData) async {
    try {
      // Usar 'collection' para referenciar la colección de reservas
      // y 'add' para añadir un nuevo documento con un ID automático
      await _db.collection('bookings').add(bookingData);
      print('Reserva guardada con éxito en Firestore.');
    } catch (e) {
      print('Error al guardar la reserva en Firestore: $e');
      rethrow; // Relanza el error para que pueda ser manejado por la UI
    }
  }

  // Método para obtener reservas (opcional, para futuras funcionalidades)
  Stream<List<Map<String, dynamic>>> getBookings() {
    return _db.collection('bookings').snapshots().map((snapshot) =>
        snapshot.docs.map((doc) => doc.data()).toList());
  }

  // Método para verificar la disponibilidad de una franja horaria (avanzado)
  Future<bool> checkTimeSlotAvailability(DateTime date, String timeSlot) async {
    // Implementación más compleja: buscar reservas existentes para esa fecha y franja
    // Por ahora, siempre devolverá true (disponible)
    // Cuando la funcionalidad esté completa, esta parte se desarrollará
    return true;
  }
}
