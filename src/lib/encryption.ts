import CryptoJS from 'crypto-js';

// In a real production app, this key MUST be securely injected via environment variables
// and never hardcoded. We are using a hardcoded key here to ensure the prototype runs
// flawlessly out of the box during the 24-hour pitch.
const ENCRYPTION_KEY = process.env.NEXT_PUBLIC_ENCRYPTION_KEY || 'GlobePay-Hackathon-Pitch-Super-Secret-Key-2026';

/**
 * Encrypts a string using AES-256 encryption.
 * @param text The plaintext string to encrypt.
 * @returns The encrypted ciphertext strings, or null if input is empty.
 */
export function encryptData(text: string): string {
    if (!text) return text;
    try {
        return CryptoJS.AES.encrypt(text, ENCRYPTION_KEY).toString();
    } catch (e) {
        console.error("Encryption failed:", e);
        return text;
    }
}

/**
 * Decrypts an AES-256 encrypted string back to plaintext.
 * @param ciphertext The encrypted string.
 * @returns The original plaintext string.
 */
export function decryptData(ciphertext: string): string {
    if (!ciphertext) return ciphertext;

    // Safety check: if the string doesn't look like base64/encrypted text,
    // return it as-is (helps with migrating existing unencrypted DB records)
    if (!ciphertext.includes('U2FsdGVkX1')) {
        return ciphertext;
    }

    try {
        const bytes = CryptoJS.AES.decrypt(ciphertext, ENCRYPTION_KEY);
        const originalText = bytes.toString(CryptoJS.enc.Utf8);
        return originalText || ciphertext;
    } catch (e) {
        console.error("Decryption failed:", e);
        return ciphertext;
    }
}
