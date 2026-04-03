import 'dart:async';
import 'package:flutter/material.dart';
import 'package:makeupflow/constants/app_colors.dart';
import 'package:makeupflow/screens/bookings_page.dart'; // Importamos la página de reservas
import 'package:makeupflow/screens/offers_page.dart'; // Importamos la página de ofertas
import 'package:makeupflow/screens/social_media_page.dart'; // Importamos la página de redes sociales

class HomePage extends StatefulWidget {
  const HomePage({super.key});

  @override
  State<HomePage> createState() => _HomePageState();
}

class _HomePageState extends State<HomePage> {
  // ... (código existente) ...

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: RichText(
          text: TextSpan(
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
      drawer: const AppDrawer(),
      body: Stack(
        // ... (código existente) ...
      ),
    );
  }
}

// El AppDrawer no necesita cambios, lo dejamos como está.
class AppDrawer extends StatelessWidget {
  const AppDrawer({super.key});

  @override
  Widget build(BuildContext context) {
    return Drawer(
      child: ListView(
        padding: EdgeInsets.zero,
        children: [
          DrawerHeader(
            decoration: const BoxDecoration(
              color: Colors.white,
            ),
            child: Center(
              child: RichText(
                text: TextSpan(
                  style: TextStyle(fontSize: 28, fontWeight: FontWeight.bold),
                  children: [
                    TextSpan(text: 'Makeup', style: TextStyle(color: AppColors.textPink)),
                    TextSpan(text: 'f', style: TextStyle(color: AppColors.textFuchsia)),
                    TextSpan(text: 'low', style: TextStyle(color: AppColors.textLilac)),
                  ],
                ),
              ),
            ),
          ),
          const SizedBox(height: 20),
          _buildDrawerItem(
            icon: Icons.book_online,
            text: 'Reservas',
            onTap: () {
              Navigator.pop(context); // Cierra el drawer
              Navigator.push(context, MaterialPageRoute(builder: (context) => const BookingsPage()));
            },
          ),
          _buildDrawerItem(
            icon: Icons.local_offer,
            text: 'Ofertas y promociones',
            onTap: () {
              Navigator.pop(context); // Cierra el drawer
              Navigator.push(context, MaterialPageRoute(builder: (context) => const OffersPage()));
            },
          ),
          _buildDrawerItem(
            icon: Icons.people,
            text: 'Redes sociales',
            onTap: () {
              Navigator.pop(context); // Cierra el drawer
              Navigator.push(context, MaterialPageRoute(builder: (context) => const SocialMediaPage()));
            },
          ),
        ],
      ),
    );
  }

  Widget _buildDrawerItem({required IconData icon, required String text, required VoidCallback onTap}) {
    return ListTile(
      leading: Icon(icon, color: Colors.white),
      title: Text(text, style: const TextStyle(color: Colors.white, fontSize: 16)),
      onTap: onTap,
    );
  }
}