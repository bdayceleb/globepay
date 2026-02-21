import { Connection, PublicKey, Transaction, SystemProgram, Keypair } from '@solana/web3.js';
import { createTransferInstruction, getAssociatedTokenAddress, getAccount, createAssociatedTokenAccountInstruction } from '@solana/spl-token';

// For prototype purposes, assuming 1 USD = 1 USDC
export const EXCHANGE_RATE = 1.0;

// Mock function for Fiat to Crypto (On-Ramp)
export const convertFiatToMockUSDC = async (amountInFiat: number): Promise<number> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1500));
  return amountInFiat * EXCHANGE_RATE;
};

// Mock function for Crypto to Fiat (Off-Ramp)
export const convertMockUSDCToFiat = async (amountInUSDC: number): Promise<number> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1500));
  return amountInUSDC / EXCHANGE_RATE;
};

// Helper to create a USDC transfer transaction
export const buildTransferTransaction = async (
  connection: Connection,
  publicKey: PublicKey,
  recipientAddress: string,
  amount: number,
  usdcMintAddress: string
): Promise<Transaction | null> => {
  try {
    const recipientPubKey = new PublicKey(recipientAddress);
    const usdcMint = new PublicKey(usdcMintAddress);
    
    // Get sender's ATA
    const senderATA = await getAssociatedTokenAddress(usdcMint, publicKey);
    
    // Get recipient's ATA
    const recipientATA = await getAssociatedTokenAddress(usdcMint, recipientPubKey);
    
    const transaction = new Transaction();

    // Check if recipient ATA exists, if not, create it
    try {
      await getAccount(connection, recipientATA);
    } catch (e: any) {
      if (e.name === 'TokenAccountNotFoundError') {
        transaction.add(
          createAssociatedTokenAccountInstruction(
            publicKey, // payer
            recipientATA, // ata
            recipientPubKey, // owner
            usdcMint // mint
          )
        );
      } else {
        throw e;
      }
    }

    // Amount should be in smaller units based on decimals. Assuming 6 decimals for USDC.
    const amountInSmallestUnit = amount * Math.pow(10, 6);

    transaction.add(
      createTransferInstruction(
        senderATA, // source
        recipientATA, // destination
        publicKey, // owner (sender)
        amountInSmallestUnit // amount
      )
    );

    const { blockhash } = await connection.getLatestBlockhash();
    transaction.recentBlockhash = blockhash;
    transaction.feePayer = publicKey;

    return transaction;
  } catch (error) {
    console.error("Error building transaction:", error);
    return null;
  }
};
