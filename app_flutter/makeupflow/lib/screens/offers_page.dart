import 'package:flutter/material.dart';
import 'package:makeupflow/constants/app_colors.dart';

class OffersPage extends StatelessWidget {
  const OffersPage({super.key});

  // Lista de imágenes de ofertas que el usuario debe poner en la carpeta assets/offers
  final List<String> _offerImagePaths = const [
    'assets/offers/offer1.jpg',
    'assets/offers/offer2.jpg',
    'assets/offers/offer3.jpg',
  ];

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
      body: _offerImagePaths.isEmpty
          ? Center(
              child: Text(
                'Añade tus imágenes de ofertas en la carpeta:\nassets/offers/',
                textAlign: TextAlign.center,
                style: TextStyle(fontSize: 18, color: AppColors.accentFuchsia),
              ),
            )
          : ListView.builder(
              padding: const EdgeInsets.all(16.0),
              itemCount: _offerImagePaths.length,
              itemBuilder: (context, index) {
                return Padding(
                  padding: const EdgeInsets.only(bottom: 16.0),
                  child: ClipRRect(
                    borderRadius: BorderRadius.circular(10.0),
                    child: Image.asset(
                      _offerImagePaths[index],
                      fit: BoxFit.cover,
                      errorBuilder: (context, error, stackTrace) {
                        return Container(
                          height: 200, // Altura de marcador de posición
                          color: AppColors.primaryPink,
                          child: Center(
                            child: Text(
                              'No se pudo cargar la oferta:\n${_offerImagePaths[index]}',
                              textAlign: TextAlign.center,
                              style: const TextStyle(color: AppColors.accentFuchsia),
                            ),
                          ),
                        );
                      },
                    ),
                  ),
                );
              },
            ),
    );
  }
}
