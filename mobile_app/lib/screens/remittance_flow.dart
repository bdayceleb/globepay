import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../services/solana_service.dart';

// --- Screen 1: Amount ---
class RemittanceAmountScreen extends ConsumerStatefulWidget {
  const RemittanceAmountScreen({super.key});

  @override
  ConsumerState<RemittanceAmountScreen> createState() => _RemittanceAmountScreenState();
}

class _RemittanceAmountScreenState extends ConsumerState<RemittanceAmountScreen> {
  final _amountCtrl = TextEditingController(text: '100');
  static const double _exchangeRate = 83.5; // Mock USD to INR rate

  @override
  Widget build(BuildContext context) {
    final amount = double.tryParse(_amountCtrl.text) ?? 0.0;
    final inrAmount = amount * _exchangeRate;

    return Scaffold(
      appBar: AppBar(title: const Text('Send Money'), centerTitle: true),
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(24.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              const Text('You send', style: TextStyle(fontSize: 16, color: Colors.black54)),
              const SizedBox(height: 8),
              TextField(
                controller: _amountCtrl,
                keyboardType: const TextInputType.numberWithOptions(decimal: true),
                style: const TextStyle(fontSize: 48, fontWeight: FontWeight.bold),
                decoration: const InputDecoration(
                  prefixText: '\$ ',
                  border: InputBorder.none,
                ),
                onChanged: (val) => setState(() {}),
              ),
              const Divider(height: 32),
              
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                   const Text('Exchange Rate:', style: TextStyle(color: Colors.black54)),
                   Text('1 USD = $_exchangeRate INR', style: const TextStyle(fontWeight: FontWeight.w600)),
                ],
              ),
              const SizedBox(height: 8),
              const Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                   Text('Solana Network Fee:', style: TextStyle(color: Colors.black54)),
                   Text('\$0.0003', style: TextStyle(color: Colors.green, fontWeight: FontWeight.bold)),
                ],
              ),
              
              const Divider(height: 32),
              const Text('Recipient gets', style: TextStyle(fontSize: 16, color: Colors.black54)),
              const SizedBox(height: 8),
              Text(
                '₹ ${inrAmount.toStringAsFixed(2)}',
                style: const TextStyle(fontSize: 40, fontWeight: FontWeight.bold, color: Color(0xFF1E3A8A)),
              ),
              
              const Spacer(),
              ElevatedButton(
                onPressed: amount > 0 ? () => context.go('/dashboard/remittance/recipient?amount=$amount') : null,
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF1E3A8A),
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(vertical: 18),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                ),
                child: const Text('Continue', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w600)),
              )
            ],
          ),
        ),
      ),
    );
  }
}

// --- Screen 2: Recipient Details ---
class RemittanceRecipientScreen extends StatefulWidget {
  final double amount;
  const RemittanceRecipientScreen({super.key, required this.amount});

  @override
  State<RemittanceRecipientScreen> createState() => _RemittanceRecipientScreenState();
}

class _RemittanceRecipientScreenState extends State<RemittanceRecipientScreen> {
  final _recipientCtrl = TextEditingController();

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Recipient Details')),
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(24.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              const Text('Enter local Indian Bank UPI ID or Solana Address:', style: TextStyle(fontSize: 16)),
              const SizedBox(height: 16),
              TextField(
                controller: _recipientCtrl,
                decoration: InputDecoration(
                  labelText: 'Recipient Address / UPI',
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                ),
                onChanged: (_) => setState(() {}),
              ),
              const Spacer(),
              ElevatedButton(
                onPressed: _recipientCtrl.text.isNotEmpty 
                  ? () => context.go('/dashboard/remittance/review?amount=${widget.amount}&recipient=${_recipientCtrl.text}')
                  : null,
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF1E3A8A),
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(vertical: 18),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                ),
                child: const Text('Review Transfer', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w600)),
              )
            ],
          ),
        ),
      ),
    );
  }
}

// --- Screen 3: Review & Confirm ---
class RemittanceReviewScreen extends ConsumerStatefulWidget {
  final double amount;
  final String recipient;
  const RemittanceReviewScreen({super.key, required this.amount, required this.recipient});

  @override
  ConsumerState<RemittanceReviewScreen> createState() => _RemittanceReviewScreenState();
}

class _RemittanceReviewScreenState extends ConsumerState<RemittanceReviewScreen> {
  bool _isProcessing = false;

  Future<void> _confirm() async {
    setState(() => _isProcessing = true);
    try {
      final sig = await ref.read(solanaProvider).transferMockUSDC(widget.recipient, widget.amount);
      if (mounted) context.go('/dashboard/remittance/success?sig=$sig');
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Error: $e')));
      }
    } finally {
      if (mounted) setState(() => _isProcessing = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Review Transfer')),
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(24.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
               _summaryRow('Sending', '\$${widget.amount.toStringAsFixed(2)}'),
               const SizedBox(height: 12),
               _summaryRow('Network Fee', '\$0.0003'),
               const SizedBox(height: 12),
               _summaryRow('Recipient Gets', '₹${(widget.amount * 83.5).toStringAsFixed(2)}'),
               const SizedBox(height: 24),
               const Divider(),
               const SizedBox(height: 24),
               const Text('To:', style: TextStyle(color: Colors.black54)),
               const SizedBox(height: 8),
               Text(widget.recipient, style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 16)),
               const Spacer(),
               ElevatedButton(
                onPressed: _isProcessing ? null : _confirm,
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF1E3A8A),
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(vertical: 18),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                ),
                child: _isProcessing 
                  ? const SizedBox(width: 24, height: 24, child: CircularProgressIndicator(color: Colors.white))
                  : const Text('Confirm & Send', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w600)),
              )
            ],
          ),
        ),
      ),
    );
  }

  Widget _summaryRow(String label, String value) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(label, style: const TextStyle(color: Colors.black54, fontSize: 16)),
        Text(value, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 18)),
      ],
    );
  }
}

// --- Screen 4: Success Receipt ---
class RemittanceSuccessScreen extends StatelessWidget {
  final String signature;
  const RemittanceSuccessScreen({super.key, required this.signature});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF1E3A8A),
      body: SafeArea(
        child: Center(
          child: Padding(
             padding: const EdgeInsets.all(32.0),
             child: Column(
               mainAxisAlignment: MainAxisAlignment.center,
               children: [
                 const Icon(Icons.check_circle_outline, color: Colors.greenAccent, size: 100),
                 const SizedBox(height: 24),
                 const Text(
                   'Transfer Successful!', 
                   style: TextStyle(color: Colors.white, fontSize: 28, fontWeight: FontWeight.bold)
                 ),
                 const SizedBox(height: 16),
                 const Text(
                   'Your funds are securely on the way to India via Solana.',
                   textAlign: TextAlign.center,
                   style: TextStyle(color: Colors.white70, fontSize: 16),
                 ),
                 const SizedBox(height: 32),
                 Container(
                   padding: const EdgeInsets.all(16),
                   decoration: BoxDecoration(
                     color: Colors.white.withOpacity(0.1),
                     borderRadius: BorderRadius.circular(12),
                   ),
                   child: Column(
                     children: [
                       const Text('Transaction Signature', style: TextStyle(color: Colors.white54, fontSize: 12)),
                       const SizedBox(height: 8),
                       Text(signature, style: const TextStyle(color: Colors.white, fontFamily: 'monospace', fontSize: 12), textAlign: TextAlign.center),
                     ],
                   ),
                 ),
                 const Spacer(),
                 ElevatedButton(
                  onPressed: () => context.go('/dashboard'),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.white,
                    foregroundColor: const Color(0xFF1E3A8A),
                    padding: const EdgeInsets.symmetric(vertical: 18, horizontal: 48),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                  ),
                  child: const Text('Back to Home', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                )
               ],
             )
          )
        )
      )
    );
  }
}
