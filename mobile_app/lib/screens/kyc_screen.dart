import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../services/auth_service.dart';

class KycScreen extends ConsumerStatefulWidget {
  const KycScreen({super.key});

  @override
  ConsumerState<KycScreen> createState() => _KycScreenState();
}

class _KycScreenState extends ConsumerState<KycScreen> {
  int _currentStep = 0;
  bool _isProcessing = false;

  final _nameCtrl = TextEditingController();
  final _countryCtrl = TextEditingController();

  void _nextStep() {
    if (_currentStep == 0 && _nameCtrl.text.isEmpty) return;
    if (_currentStep == 1 && _countryCtrl.text.isEmpty) return;

    if (_currentStep < 2) {
      setState(() => _currentStep += 1);
    } else {
      _finishKyc();
    }
  }

  Future<void> _finishKyc() async {
    setState(() => _isProcessing = true);
    try {
      await ref.read(authStateProvider.notifier).completeKyc();
    } finally {
      if (mounted) setState(() => _isProcessing = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Verification Required'),
        centerTitle: true,
        backgroundColor: Colors.white,
        elevation: 0,
        actions: [
          IconButton(
            icon: const Icon(Icons.logout, color: Colors.blueGrey),
            onPressed: () => ref.read(authStateProvider.notifier).logout(),
          )
        ],
      ),
      body: Stepper(
        currentStep: _currentStep,
        onStepContinue: _isProcessing ? null : _nextStep,
        onStepCancel: () {
          if (_currentStep > 0) setState(() => _currentStep -= 1);
        },
        controlsBuilder: (context, details) {
          return Padding(
            padding: const EdgeInsets.only(top: 24),
            child: Row(
              children: [
                Expanded(
                  child: ElevatedButton(
                    onPressed: details.onStepContinue,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFF1E3A8A),
                      foregroundColor: Colors.white,
                      padding: const EdgeInsets.symmetric(vertical: 14),
                    ),
                    child: _isProcessing 
                        ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(color: Colors.white))
                        : Text(_currentStep == 2 ? 'Upload & Approve' : 'Continue'),
                  ),
                ),
                if (_currentStep > 0) ...[
                  const SizedBox(width: 16),
                  TextButton(
                    onPressed: details.onStepCancel,
                    child: const Text('Back'),
                  )
                ]
              ],
            ),
          );
        },
        steps: [
          Step(
            title: const Text('Legal Name'),
            isActive: _currentStep >= 0,
            content: TextFormField(
              controller: _nameCtrl,
              decoration: const InputDecoration(labelText: 'As it appears on your passport'),
            ),
          ),
          Step(
            title: const Text('NRI Status / Country'),
            isActive: _currentStep >= 1,
            content: TextFormField(
              controller: _countryCtrl,
              decoration: const InputDecoration(labelText: 'Current Country of Residence (e.g., USA, UAE)'),
            ),
          ),
          Step(
            title: const Text('Identity Scan'),
            isActive: _currentStep >= 2,
            content: Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Colors.blue.shade50,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: Colors.blue.shade200, width: 2),
              ),
              child: const Column(
                children: [
                  Icon(Icons.camera_alt_outlined, size: 48, color: Colors.blue),
                  SizedBox(height: 12),
                  Text("Tap 'Upload & Approve' below to mock a successful Onfido / Stripe Identity OCR scan.", textAlign: TextAlign.center),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}
