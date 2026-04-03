import 'package:flutter/material.dart';
import 'package:intl/intl.dart'; // Para formatear la fecha
import 'package:makeupflow/constants/app_colors.dart';
import 'package:makeupflow/services/firestore_service.dart'; // Importamos el servicio de Firestore
import 'package:cloud_firestore/cloud_firestore.dart';

class BookingsPage extends StatefulWidget {
  const BookingsPage({super.key});

  @override
  State<BookingsPage> createState() => _BookingsPageState();
}

class _BookingsPageState extends State<BookingsPage> {
  final _nameController = TextEditingController();
  final _lastNameController = TextEditingController();
  final _phoneController = TextEditingController();
  final _emailController = TextEditingController();

  DateTime? _selectedDate;
  String? _selectedTime;
  String? _selectedTreatment;

  final List<String> _treatments = ['Maquillaje', 'Manicura', 'Masaje'];
  final List<String> _timeSlots = [];
  final FirestoreService _firestoreService = FirestoreService(); // Instancia del servicio de Firestore

  @override
  void initState() {
    super.initState();
    _generateTimeSlots();
  }

  void _generateTimeSlots() {
    _timeSlots.clear();
    // Franjas de 9h a 14h
    for (int i = 9; i < 14; i++) {
      _timeSlots.add('${i.toString().padLeft(2, '0')}:00 - ${(i + 1).toString().padLeft(2, '0')}:00');
    }
    // Franjas de 17h a 20h
    for (int i = 17; i < 20; i++) {
      _timeSlots.add('${i.toString().padLeft(2, '0')}:00 - ${(i + 1).toString().padLeft(2, '0')}:00');
    }
  }

  Future<void> _selectDate(BuildContext context) async {
    final DateTime? picked = await showDatePicker(
      context: context,
      initialDate: _selectedDate ?? DateTime.now(),
      firstDate: DateTime.now(),
      lastDate: DateTime.now().add(const Duration(days: 365)), // Un año en el futuro
      selectableDayPredicate: (DateTime day) {
        // Solo permite Lunes (1) a Sábado (6)
        return day.weekday != DateTime.sunday;
      },
      builder: (context, child) {
        return Theme(
          data: Theme.of(context).copyWith(
            colorScheme: ColorScheme.light(
              primary: AppColors.accentFuchsia, // Color principal del calendario
              onPrimary: Colors.white,
              onSurface: AppColors.accentFuchsia, // Color del texto de los días
            ),
            textButtonTheme: TextButtonThemeData(
              style: TextButton.styleFrom(foregroundColor: AppColors.accentFuchsia), // Color de los botones "CANCELAR", "OK"
            ),
          ),
          child: child!,
        );
      },
    );
    if (picked != null && picked != _selectedDate) {
      setState(() {
        _selectedDate = picked;
      });
    }
  }

  void _confirmBooking() async { // Hacemos el método async
    // Validaciones
    if (_nameController.text.isEmpty ||
        _lastNameController.text.isEmpty ||
        _phoneController.text.isEmpty ||
        _emailController.text.isEmpty ||
        _selectedDate == null ||
        _selectedTime == null ||
        _selectedTreatment == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Por favor, rellena todos los campos.'), backgroundColor: Colors.red),
      );
      return;
    }

    final String dateFormatted = DateFormat('EEEE, d MMMM y', 'es').format(_selectedDate!);

    // Datos de la reserva para Firestore
    Map<String, dynamic> bookingData = {
      'name': _nameController.text,
      'lastName': _lastNameController.text,
      'phone': _phoneController.text,
      'email': _emailController.text,
      'date': _selectedDate!.toIso8601String(), // Guardamos la fecha en formato ISO
      'time': _selectedTime,
      'treatment': _selectedTreatment,
      'timestamp': FieldValue.serverTimestamp(), // Marca de tiempo del servidor
    };

    try {
      await _firestoreService.saveBooking(bookingData);

      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(
              'Reserva confirmada con éxito y guardada:\n'
              'Nombre: ${_nameController.text} ${_lastNameController.text}\n'
              'Fecha: $dateFormatted\n'
              'Hora: $_selectedTime\n'
              'Tratamiento: $_selectedTreatment'
          ),
          backgroundColor: AppColors.accentFuchsia,
          duration: const Duration(seconds: 5),
        ),
      );

      // Limpiar campos después de la confirmación
      _nameController.clear();
      _lastNameController.clear();
      _phoneController.clear();
      _emailController.clear();
      setState(() {
        _selectedDate = null;
        _selectedTime = null;
        _selectedTreatment = null;
      });
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Error al guardar la reserva: $e'), backgroundColor: Colors.red),
      );
    }
  }

  @override
  void dispose() {
    _nameController.dispose();
    _lastNameController.dispose();
    _phoneController.dispose();
    _emailController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: RichText(
          text: const TextSpan(
            style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold),
            children: [
              TextSpan(text: 'Makeup', style: TextStyle(color: AppColors.textPink)),
              TextSpan(text: 'f', style: TextStyle(color: AppColors.textFuchsia)),
              TextSpan(text: 'low', style: TextStyle(color: AppColors.textLilac)),
            ],
          ),
        ),
        centerTitle: true,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Realiza tu Reserva',
              style: TextStyle(
                fontSize: 28,
                fontWeight: FontWeight.bold,
                color: AppColors.accentFuchsia,
              ),
            ),
            const SizedBox(height: 20),
            _buildTextField(_nameController, 'Nombre'),
            _buildTextField(_lastNameController, 'Apellido'),
            _buildTextField(_phoneController, 'Número de Teléfono', TextInputType.phone),
            _buildTextField(_emailController, 'Correo Electrónico', TextInputType.emailAddress),
            
            const SizedBox(height: 20),
            // Selector de Fecha
            _buildBookingItem(
              'Fecha:',
              _selectedDate == null
                  ? 'Selecciona una fecha (L-S)'
                  : DateFormat('EEEE, d MMMM y', 'es').format(_selectedDate!),
              () => _selectDate(context),
            ),
            const SizedBox(height: 20),

            // Selector de Horario
            DropdownButtonFormField<String>(
              decoration: _inputDecoration('Horario'),
              value: _selectedTime,
              hint: const Text('Selecciona un horario', style: TextStyle(color: Colors.grey)),
              onChanged: (String? newValue) {
                setState(() {
                  _selectedTime = newValue;
                });
              },
              items: _timeSlots.map<DropdownMenuItem<String>>((String value) {
                return DropdownMenuItem<String>(
                  value: value,
                  child: Text(value),
                );
              }).toList(),
              dropdownColor: AppColors.primaryPink,
              style: TextStyle(color: AppColors.accentFuchsia, fontSize: 16),
            ),
            const SizedBox(height: 20),

            // Selector de Tratamiento
            DropdownButtonFormField<String>(
              decoration: _inputDecoration('Tratamiento'),
              value: _selectedTreatment,
              hint: const Text('Selecciona un tratamiento', style: TextStyle(color: Colors.grey)),
              onChanged: (String? newValue) {
                setState(() {
                  _selectedTreatment = newValue;
                });
              },
              items: _treatments.map<DropdownMenuItem<String>>((String value) {
                return DropdownMenuItem<String>(
                  value: value,
                  child: Text(value),
                );
              }).toList(),
              dropdownColor: AppColors.primaryPink,
              style: TextStyle(color: AppColors.accentFuchsia, fontSize: 16),
            ),
            const SizedBox(height: 30),

            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: _confirmBooking,
                style: ElevatedButton.styleFrom(
                  padding: const EdgeInsets.symmetric(vertical: 15),
                  backgroundColor: AppColors.accentFuchsia,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(10),
                  ),
                ),
                child: const Text(
                  'Confirmar Reserva',
                  style: TextStyle(fontSize: 18, color: Colors.white),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildTextField(TextEditingController controller, String label, [TextInputType keyboardType = TextInputType.text]) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 15.0),
      child: TextField(
        controller: controller,
        keyboardType: keyboardType,
        decoration: _inputDecoration(label),
        style: TextStyle(color: AppColors.accentFuchsia),
      ),
    );
  }

  Widget _buildBookingItem(String label, String value, VoidCallback onTap) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label,
          style: TextStyle(
            fontSize: 16,
            fontWeight: FontWeight.bold,
            color: AppColors.accentFuchsia,
          ),
        ),
        const SizedBox(height: 8),
        GestureDetector(
          onTap: onTap,
          child: Container(
            padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 10),
            decoration: BoxDecoration(
              color: Colors.white.withOpacity(0.8),
              borderRadius: BorderRadius.circular(10),
              border: Border.all(color: AppColors.accentFuchsia.withOpacity(0.5)),
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(value, style: TextStyle(fontSize: 16, color: AppColors.accentFuchsia)),
                Icon(Icons.calendar_today, color: AppColors.accentFuchsia),
              ],
            ),
          ),
        ),
      ],
    );
  }

  InputDecoration _inputDecoration(String label) {
    return InputDecoration(
      labelText: label,
      labelStyle: TextStyle(color: AppColors.accentFuchsia),
      hintStyle: const TextStyle(color: Colors.grey),
      border: OutlineInputBorder(
        borderRadius: BorderRadius.circular(10),
        borderSide: BorderSide(color: AppColors.accentFuchsia.withOpacity(0.5)),
      ),
      focusedBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(10),
        borderSide: BorderSide(color: AppColors.accentFuchsia, width: 2),
      ),
      enabledBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(10),
        borderSide: BorderSide(color: AppColors.accentFuchsia.withOpacity(0.5)),
      ),
      filled: true,
      fillColor: Colors.white.withOpacity(0.8),
      contentPadding: const EdgeInsets.symmetric(vertical: 12, horizontal: 10),
    );
  }
}
