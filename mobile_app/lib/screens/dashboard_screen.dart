import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../services/solana_service.dart';
import '../services/auth_service.dart';

class DashboardScreen extends ConsumerStatefulWidget {
  const DashboardScreen({super.key});

  @override
  ConsumerState<DashboardScreen> createState() => _DashboardScreenState();
}

class _DashboardScreenState extends ConsumerState<DashboardScreen> {
  bool _showWallet = false;

  void _copyAddress(String addr) {
    Clipboard.setData(ClipboardData(text: addr));
    ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Address copied!')));
  }

  @override
  Widget build(BuildContext context) {
    final solanaSvc = ref.watch(solanaProvider);
    final walletStr = solanaSvc.publicKey;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Home', style: TextStyle(fontWeight: FontWeight.w600)),
        backgroundColor: Colors.white,
        elevation: 0,
        actions: [
          IconButton(
            icon: const Icon(Icons.logout, color: Colors.black87),
            onPressed: () => ref.read(authStateProvider.notifier).logout(),
          ),
        ],
      ),
      body: CustomScrollView(
        slivers: [
          SliverToBoxAdapter(
            child: Container(
              color: Colors.white,
              padding: const EdgeInsets.all(20),
              child: Column(
                children: [
                   // Balance Card
                   Container(
                     width: double.infinity,
                     padding: const EdgeInsets.all(24),
                     decoration: BoxDecoration(
                       gradient: const LinearGradient(
                         colors: [Color(0xFF1E3A8A), Color(0xFF3B82F6)],
                         begin: Alignment.topLeft,
                         end: Alignment.bottomRight,
                       ),
                       borderRadius: BorderRadius.circular(20),
                       boxShadow: [
                         BoxShadow(color: Colors.blue.withOpacity(0.3), blurRadius: 10, offset: const Offset(0, 5)),
                       ]
                     ),
                     child: Column(
                       crossAxisAlignment: CrossAxisAlignment.start,
                       children: [
                         const Text('Total Balance (USD)', style: TextStyle(color: Colors.white70, fontSize: 14)),
                         const SizedBox(height: 8),
                         Text(
                           '\$${solanaSvc.usdcBalance.toStringAsFixed(2)}', 
                           style: const TextStyle(color: Colors.white, fontSize: 36, fontWeight: FontWeight.bold)
                         ),
                         const SizedBox(height: 24),
                         
                         Row(
                           mainAxisAlignment: MainAxisAlignment.spaceBetween,
                           children: [
                             const Text('Solana Wallet', style: TextStyle(color: Colors.white70)),
                             GestureDetector(
                               onTap: () => setState(() => _showWallet = !_showWallet),
                               child: Icon(
                                 _showWallet ? Icons.visibility_off : Icons.visibility,
                                 color: Colors.white70,
                                 size: 20,
                               ),
                             )
                           ],
                         ),
                         const SizedBox(height: 4),
                         Row(
                           children: [
                             Expanded(
                               child: Text(
                                 _showWallet ? walletStr : '••••••••••••••••••••••••••••••••••••••••••',
                                 style: const TextStyle(color: Colors.white, fontFamily: 'monospace'),
                                 overflow: TextOverflow.ellipsis,
                               ),
                             ),
                             if (_showWallet)
                               IconButton(
                                 icon: const Icon(Icons.copy, color: Colors.white70, size: 18),
                                 padding: EdgeInsets.zero,
                                 constraints: const BoxConstraints(),
                                 onPressed: () => _copyAddress(walletStr),
                               )
                           ],
                         )
                       ],
                     ),
                   ),

                   const SizedBox(height: 32),
                   
                   // Quick Actions
                   Row(
                     children: [
                       Expanded(
                         child: ElevatedButton.icon(
                           onPressed: () => context.go('/dashboard/remittance'),
                           icon: const Icon(Icons.send),
                           label: const Text('Send to India'),
                           style: ElevatedButton.styleFrom(
                             backgroundColor: const Color(0xFF1E3A8A),
                             foregroundColor: Colors.white,
                             padding: const EdgeInsets.symmetric(vertical: 16),
                             shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                           ),
                         ),
                       ),
                     ],
                   ),
                ],
              ),
            ),
          ),
          
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.fromLTRB(20, 16, 20, 8),
              child: Text(
                'Recent Transactions',
                style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Colors.grey.shade800),
              ),
            ),
          ),
          
          SliverList(
            delegate: SliverChildListDelegate([
              _transactionTile('USD to INR', '- \$250.00', 'Success • 2 days ago', Icons.arrow_outward, Colors.green),
              _transactionTile('USD to INR', '- \$100.00', 'Success • 1 week ago', Icons.arrow_outward, Colors.green),
              _transactionTile('Fiat Deposit', '+ \$1,000.00', 'Success • 2 weeks ago', Icons.south_west, Colors.blue),
            ]),
          )
        ],
      ),
    );
  }

  Widget _transactionTile(String title, String amount, String subtitle, IconData icon, Color color) {
    return ListTile(
      contentPadding: const EdgeInsets.symmetric(horizontal: 20, vertical: 8),
      leading: Container(
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: color.withOpacity(0.1),
          shape: BoxShape.circle,
        ),
        child: Icon(icon, color: color),
      ),
      title: Text(title, style: const TextStyle(fontWeight: FontWeight.w600)),
      subtitle: Text(subtitle, style: const TextStyle(color: Colors.black54, fontSize: 12)),
      trailing: Text(amount, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
    );
  }
}
