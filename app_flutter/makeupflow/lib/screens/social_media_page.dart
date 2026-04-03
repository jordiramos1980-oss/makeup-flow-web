import 'package:flutter/material.dart';
import 'package:makeupflow/constants/app_colors.dart';
import 'package:url_launcher/url_launcher.dart'; // Para abrir enlaces externos

class SocialMediaPage extends StatelessWidget {
  const SocialMediaPage({super.key});

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
      body: Center(
        child: Padding(
          padding: const EdgeInsets.all(20.0),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Text(
                '¡Síguenos en nuestras redes sociales!',
                textAlign: TextAlign.center,
                style: TextStyle(
                  fontSize: 24,
                  fontWeight: FontWeight.bold,
                  color: AppColors.accentFuchsia,
                ),
              ),
              const SizedBox(height: 40),
              _buildSocialMediaButton(
                context,
                'Instagram',
                Icons.camera_alt, // Icono de Instagram
                'https://www.instagram.com/makeupflow25', // URL actualizada
                AppColors.textPink,
              ),
              const SizedBox(height: 20),
              _buildSocialMediaButton(
                context,
                'TikTok',
                Icons.tiktok, // Icono de TikTok
                'https://www.tiktok.com/@make_up_flow', // URL actualizada
                AppColors.textLilac,
              ),
              const SizedBox(height: 20),
              Text(
                '¡Pronto más redes!',
                style: TextStyle(fontSize: 18, color: AppColors.accentFuchsia.withOpacity(0.7)),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildSocialMediaButton(
      BuildContext context, String name, IconData icon, String url, Color color) {
    return SizedBox(
      width: 250,
      height: 60,
      child: ElevatedButton.icon(
        icon: Icon(icon, color: Colors.white, size: 30),
        label: Text(name, style: const TextStyle(fontSize: 20, color: Colors.white)),
        onPressed: () async {
          final Uri uri = Uri.parse(url);
          try {
            await launchUrl(
              uri,
              webOnlyWindowName: '_blank', // Abre en una nueva pestaña
            );
          } catch (e) {
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(content: Text('No se pudo abrir el enlace: $e'), backgroundColor: Colors.red),
            );
          }
        },
        style: ElevatedButton.styleFrom(
          backgroundColor: color,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
        ),
      ),
    );
  }
}
