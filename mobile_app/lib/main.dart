import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:firebase_core/firebase_core.dart';
import 'firebase_options.dart';

import 'screens/auth_screen.dart';
import 'screens/kyc_screen.dart';
import 'screens/dashboard_screen.dart';
import 'screens/remittance_flow.dart';
import 'services/auth_service.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await Firebase.initializeApp(
    options: DefaultFirebaseOptions.currentPlatform,
  );
  
  runApp(const ProviderScope(child: RemittanceApp()));
}

/// GoRouter configuration enforcing Auth -> KYC -> Dashboard flow
final routerProvider = Provider<GoRouter>((ref) {
  final authState = ref.watch(authStateProvider);

  return GoRouter(
    initialLocation: '/auth',
    redirect: (context, state) {
      final isAuthRoute = state.matchedLocation == '/auth';
      final isKycRoute = state.matchedLocation == '/kyc';

      if (!authState.isAuthenticated) {
        return isAuthRoute ? null : '/auth';
      }

      if (!authState.isKycComplete) {
        return isKycRoute ? null : '/kyc';
      }

      // If authenticated and KYC complete, redirect to dashboard from auth or kyc
      if (isAuthRoute || isKycRoute) {
        return '/dashboard';
      }

      return null;
    },
    routes: [
      GoRoute(
        path: '/auth',
        builder: (context, state) => const AuthScreen(),
      ),
      GoRoute(
        path: '/kyc',
        builder: (context, state) => const KycScreen(),
      ),
      GoRoute(
        path: '/dashboard',
        builder: (context, state) => const DashboardScreen(),
        routes: [
          GoRoute(
            path: 'remittance',
            builder: (context, state) => const RemittanceAmountScreen(),
          ),
          GoRoute(
            path: 'remittance/recipient',
            builder: (context, state) {
              final amountStr = state.uri.queryParameters['amount'] ?? '0';
              return RemittanceRecipientScreen(amount: double.parse(amountStr));
            },
          ),
          GoRoute(
            path: 'remittance/review',
            builder: (context, state) {
              final amount = state.uri.queryParameters['amount'] ?? '0';
              final recipient = state.uri.queryParameters['recipient'] ?? '';
              return RemittanceReviewScreen(
                amount: double.parse(amount),
                recipient: recipient,
              );
            },
          ),
          GoRoute(
            path: 'remittance/success',
            builder: (context, state) {
              final signature = state.uri.queryParameters['sig'] ?? '';
              return RemittanceSuccessScreen(signature: signature);
            },
          ),
        ],
      ),
    ],
  );
});

class RemittanceApp extends ConsumerWidget {
  const RemittanceApp({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final router = ref.watch(routerProvider);

    return MaterialApp.router(
      title: 'GlobePay NRI',
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(seedColor: const Color(0xFF1E3A8A)), // Blue palette
        textTheme: GoogleFonts.interTextTheme(Theme.of(context).textTheme),
        useMaterial3: true,
        scaffoldBackgroundColor: Colors.grey[50],
      ),
      routerConfig: router,
      debugShowCheckedModeBanner: false,
    );
  }
}
