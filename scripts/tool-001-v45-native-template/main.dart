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
              'TOOL001 Android URI Direct Read Diagnostic\n\n'
              'The harness opens one picker, selects PHOTO01 once, and the native app reads the returned URI bytes once.\n'
              'No retry / no recovery / no product code.',
              textAlign: TextAlign.center,
            ),
          ),
        ),
      ),
    );
  }
}
