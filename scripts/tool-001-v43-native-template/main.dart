import 'package:flutter/material.dart';

void main() => runApp(const DiagApp());

class DiagApp extends StatelessWidget {
  const DiagApp({super.key});

  @override
  Widget build(BuildContext context) {
    return const MaterialApp(
      debugShowCheckedModeBanner: false,
      home: Scaffold(
        body: Center(
          child: Padding(
            padding: EdgeInsets.all(24),
            child: Text(
              'TOOL001 Android Provider Direct Read Diagnostic\n\nPhoto Picker opens automatically.\nThe harness selects PHOTO01 once and the native app reads the returned content URI once.',
              textAlign: TextAlign.center,
            ),
          ),
        ),
      ),
    );
  }
}
