import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:solana/solana.dart';

class SolanaService {
  final rpcClient = RpcClient('https://api.devnet.solana.com');
  Ed25519HDKeyPair? _keyPair;

  String get publicKey => _keyPair?.address ?? 'Not Generated';

  // Mock initial balance
  double usdcBalance = 1500.00;

  Future<void> generateWallet() async {
    _keyPair = await Ed25519HDKeyPair.random();
  }

  /// Mock transferring Devnet USDC to India (Simulating an Offramp endpoint logic)
  Future<String> transferMockUSDC(String recipient, double amount) async {
    await Future.delayed(const Duration(seconds: 2)); // simulate heavy crypto op
    
    // In actual implementation: 
    // 1. Build SplToken transfer instruction
    // 2. Sign transaction with _keyPair
    // 3. Send to network

    if (amount > usdcBalance) {
      throw Exception('Insufficient funds');
    }

    usdcBalance -= amount;
    
    // Return a mock transaction signature
    return '5HnB${DateTime.now().millisecondsSinceEpoch}solanaMockSigXyZ';
  }
}

final solanaProvider = Provider<SolanaService>((ref) {
  final service = SolanaService();
  // Auto-generate wallet for prototype simulation
  service.generateWallet();
  return service;
});
