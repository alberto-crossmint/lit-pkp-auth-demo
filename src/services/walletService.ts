import { CrossmintWallets } from '@crossmint/wallets-sdk';
import type {
  SolanaMPCWallet,
  SolanaSmartWallet,
} from '@crossmint/wallets-sdk';
import {
  Connection,
  Keypair,
  PublicKey,
  TransactionInstruction,
  TransactionMessage,
  VersionedTransaction,
} from '@solana/web3.js';

// Get API keys from environment variables
const SMART_WALLET_API_KEY =
  process.env.NEXT_PUBLIC_SMART_WALLET_API_KEY ||
  process.env.SMART_WALLET_API_KEY ||
  '';
const MPC_WALLET_API_KEY =
  process.env.NEXT_PUBLIC_MPC_WALLET_API_KEY ||
  process.env.MPC_WALLET_API_KEY ||
  '';

export const connection = new Connection('https://api.devnet.solana.com');

export type WalletType = 'smart' | 'mpc' | 'smart-non-custodial';
export type WalletTypeToWalletSDKType = {
  mpc: 'solana-mpc-wallet';
  smart: 'solana-smart-wallet';
  'smart-non-custodial': 'solana-smart-wallet';
};
export const walletTypeToWalletSDKType: WalletTypeToWalletSDKType = {
  mpc: 'solana-mpc-wallet',
  smart: 'solana-smart-wallet',
  'smart-non-custodial': 'solana-smart-wallet',
};
export type WalletTypeToWallet = {
  'solana-mpc-wallet': SolanaMPCWallet;
  'solana-smart-wallet': SolanaSmartWallet;
};
export type WalletTypeToOptions = {
  mpc: { linkedUser: string };
  smart: Record<string, never>;
  'smart-non-custodial': { adminSigner: Keypair };
};

export async function createWallet<T extends WalletType>(
  type: T,
  adminSigner?: {
    type: 'solana-keypair';
    signer: {
      signTransaction: (
        tx: VersionedTransaction
      ) => Promise<VersionedTransaction>;
      signMessage: (message: Uint8Array) => Promise<Uint8Array>;
    };
    address: string;
  }
): Promise<SolanaMPCWallet | SolanaSmartWallet> {
  console.log(`🏗️ Starting ${type} wallet creation...`);

  const apiKey =
    type === 'smart' || type === 'smart-non-custodial'
      ? SMART_WALLET_API_KEY
      : MPC_WALLET_API_KEY;

  // Check if API key is available
  if (!apiKey) {
    throw new Error(
      `API key for ${type} wallet is not defined in environment variables`
    );
  }

  const walletType = walletTypeToWalletSDKType[type];

  const crossmintInstance = { apiKey };
  const walletInstance = CrossmintWallets.from(crossmintInstance);

  let options = {};
  if (type === 'mpc') {
    console.log('👤 Using MPC wallet with linked user');
    options = { linkedUser: 'email:alberto@paella.dev' };
  } else if (type === 'smart-non-custodial') {
    console.log('🔑 Using non-custodial smart wallet with admin signer');
    options = { adminSigner };
  }

  const solanaWallet = await walletInstance.getOrCreateWallet<
    WalletTypeToWalletSDKType[T]
    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  >(walletType, options as any);
  console.log(`✅ Solana ${type} wallet created successfully!`);
  return solanaWallet;
}

export async function sendTransaction(
  wallet: SolanaSmartWallet | SolanaMPCWallet,
  message: string,
  delegatedSigner?: {
    type: 'solana-keypair';
    signer: {
      signTransaction: (
        tx: VersionedTransaction
      ) => Promise<VersionedTransaction>;
      signMessage: (message: Uint8Array) => Promise<Uint8Array>;
    };
    address: string;
  }
): Promise<string> {
  const walletAddress = await wallet.getAddress();
  console.log(`💼 Wallet address: ${walletAddress}`);

  if (delegatedSigner) {
    console.log('👥 Using delegated signer for transaction');
  } else {
    console.log('👤 Using admin signer for transaction');
  }

  console.log(`📝 Creating transaction with message: "${message}"`);

  const memoInstruction = new TransactionInstruction({
    keys: [
      {
        pubkey: new PublicKey(walletAddress),
        isSigner: true,
        isWritable: true,
      },
    ],
    data: Buffer.from(message, 'utf-8'),
    programId: new PublicKey('MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr'),
  });

  const newMessage = new TransactionMessage({
    payerKey: new PublicKey(walletAddress),
    recentBlockhash: (await connection.getLatestBlockhash()).blockhash,
    instructions: [memoInstruction],
  });

  const transaction = new VersionedTransaction(newMessage.compileToV0Message());

  console.log('🚀 Sending transaction to blockchain...');
  const txId = await wallet.sendTransaction({ transaction, delegatedSigner });
  console.log(
    `✅ Transaction sent successfully! TxID: ${txId.slice(0, 10)}...`
  );

  return txId;
}

export async function addDelegatedSigner(wallet: SolanaSmartWallet) {
  console.log('➕ Adding new delegated signer to wallet...');
  const newSigner = Keypair.generate();
  const result = {
    response: await wallet.addDelegatedSigner(newSigner.publicKey.toBase58()),
    signer: {
      type: 'solana-keypair',
      signer: newSigner,
      address: newSigner.publicKey.toBase58(),
    },
  };
  console.log(
    `✅ Delegated signer added successfully! Address: ${newSigner.publicKey
      .toBase58()
      .slice(0, 10)}...`
  );
  return result;
}
