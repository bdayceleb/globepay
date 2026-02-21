import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:firebase_auth/firebase_auth.dart';

class AuthState {
  final bool isAuthenticated;
  final bool isKycComplete;
  final String? email;

  AuthState({
    this.isAuthenticated = false,
    this.isKycComplete = false,
    this.email,
  });

  AuthState copyWith({
    bool? isAuthenticated,
    bool? isKycComplete,
    String? email,
  }) {
    return AuthState(
      isAuthenticated: isAuthenticated ?? this.isAuthenticated,
      isKycComplete: isKycComplete ?? this.isKycComplete,
      email: email ?? this.email,
    );
  }
}

class AuthNotifier extends StateNotifier<AuthState> {
  AuthNotifier() : super(AuthState());

  // Real Firebase Login
  Future<void> login(String email, String password) async {
    try {
      final cred = await FirebaseAuth.instance.signInWithEmailAndPassword(
        email: email, 
        password: password
      );
      state = state.copyWith(
        isAuthenticated: cred.user != null, 
        email: email, 
        isKycComplete: false
      );
    } on FirebaseAuthException catch (e) {
      throw Exception(e.message ?? 'Authentication Failed');
    }
  }

  // Real Firebase Registration
  Future<void> register(String email, String password) async {
    try {
      final cred = await FirebaseAuth.instance.createUserWithEmailAndPassword(
        email: email, 
        password: password
      );
      state = state.copyWith(
        isAuthenticated: cred.user != null, 
        email: email, 
        isKycComplete: false
      );
    } on FirebaseAuthException catch (e) {
      throw Exception(e.message ?? 'Registration Failed');
    }
  }

  // Mock Google Login (Requires extensive native configuring for OAuth which isn't viable here)
  Future<void> loginWithGoogle() async {
    throw Exception('Google OAuth requires configuring SHA-1 keys in the Firebase console. Please use Email/Password registration for this build.');
  }

  // Complete KYC (Keeping this mock as Onfido/Stripe identity require live API keys & webhooks)
  Future<void> completeKyc() async {
    await Future.delayed(const Duration(seconds: 2));
    state = state.copyWith(isKycComplete: true);
  }

  Future<void> logout() async {
    await FirebaseAuth.instance.signOut();
    state = AuthState(); // Reset
  }
}

final authStateProvider = StateNotifierProvider<AuthNotifier, AuthState>((ref) {
  return AuthNotifier();
});
