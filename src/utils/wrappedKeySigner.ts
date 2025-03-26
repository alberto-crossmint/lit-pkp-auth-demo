import { api } from '@lit-protocol/wrapped-keys';
import type { VersionedTransaction } from '@solana/web3.js';
import { litNodeClient } from './lit';
import type { SessionSigs } from '@lit-protocol/types';
import bs58 from 'bs58';
const { signMessageWithEncryptedKey } = api;

/**
 * Helper function to convert hex string to Uint8Array
 */
function hexToUint8Array(hex: string): Uint8Array {
  return new Uint8Array(
    hex.match(/.{1,2}/g)?.map(byte => Number.parseInt(byte, 16)) || []
  );
}

/**
 * Create a Solana signer from a wrapped key
 */
export async function createWrappedKeySigner(
  pkpSessionSigs: SessionSigs,
  wrappedKeyId: string,
  wrappedKeyPublicKey: string
) {
  console.log(
    `🔐 Creating wrapped key signer for ID: ${wrappedKeyId.slice(
      0,
      6
    )}...${wrappedKeyId.slice(-4)}`
  );

  // Create a signer compatible with the Crossmint wallet SDK
  const signer = {
    type: 'solana-keypair',
    signer: {
      signTransaction: async (
        tx: VersionedTransaction
      ): Promise<VersionedTransaction> => {
        console.log('💬 Signing transaction with wrapped key...');
        console.log('Signer:', wrappedKeyPublicKey);
        console.log('Transaction:', tx);
        throw new Error('Not implemented');
      },

      signMessage: async (message: Uint8Array): Promise<Uint8Array> => {
        console.log('💬 Signing message with wrapped key...');
        console.log('Signer:', wrappedKeyPublicKey);
        console.log('Message:', message);
        // Convert message to hex string

        // Sign the message with the wrapped key
        const start = Date.now();
        const signatureHex = await signMessageWithEncryptedKey({
          pkpSessionSigs,
          litNodeClient,
          network: 'solana',
          id: wrappedKeyId,
          messageToSign: 'hellohello',
        });
        const end = Date.now();
        console.log(`Time taken: ${end - start}ms`);
        // Convert hex signature to Uint8Array
        console.log('Message signed:', signatureHex);
        const signatureBytes = bs58.decode(signatureHex);
        console.log('✅ Message signed successfully');
        return signatureBytes;
      },
    },
    address: wrappedKeyPublicKey, // Use the wrapped key ID as the address
  };

  console.log(`🔑 Wrapped key signer created successfully: ${signer.address}`);
  return signer;
}
