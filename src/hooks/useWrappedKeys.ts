import { useState, useCallback, useEffect } from 'react';
import { api } from '@lit-protocol/wrapped-keys';
import type { IRelayPKP, SessionSigs } from '@lit-protocol/types';
import { litNodeClient } from '../utils/lit';
import { createWrappedKeySigner } from '../utils/wrappedKeySigner';

const { generatePrivateKey } = api;

interface WrappedKey {
  pkpAddress: string;
  generatedPublicKey: string;
  id: string;
}

interface DashboardProps {
  currentAccount: IRelayPKP;
  sessionSigs: SessionSigs;
  wrappedKey: WrappedKey;
  adminSigner: any;
}

export default function useWrappedKeys() {
  const [wrappedKey, setWrappedKey] = useState<WrappedKey>();
  const [adminSigner, setAdminSigner] = useState(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error>();

  const generateKey = useCallback(
    async (pkpSessionSigs: SessionSigs) => {
      console.log('🔎 Current adminSigner state:', adminSigner);
      console.log('🔑 Starting wrapped key generation...');
      setLoading(true);
      setError(undefined);

      try {
        const start = Date.now();
        const result = await generatePrivateKey({
          pkpSessionSigs,
          network: 'solana',
          memo: 'Generated wrapped key for Solana wallet',
          litNodeClient,
        });
        const end = Date.now();
        console.log(`Time taken: ${end - start}ms`);
        console.log('✅ Wrapped key generated successfully:', {
          pkpAddress: result.pkpAddress,
          publicKey: result.generatedPublicKey,
          id: result.id,
        });

        const newWrappedKey = {
          pkpAddress: result.pkpAddress,
          generatedPublicKey: result.generatedPublicKey,
          id: result.id,
        };

        setWrappedKey(newWrappedKey);

        // Create the admin signer
        try {
          const signer = await createWrappedKeySigner(
            pkpSessionSigs,
            result.id,
            result.generatedPublicKey
          );
          console.log('🔑 Admin signer created:', signer);
          setAdminSigner(signer);
          console.log('✅ Admin signer created successfully: ', signer.address);
        } catch (signerError) {
          console.error('❌ Admin signer creation failed:', signerError);
          // Don't fail the whole operation if signer creation fails
        }

        return result;
      } catch (err) {
        console.error('❌ Wrapped key generation failed:', err);
        setError(err instanceof Error ? err : new Error(String(err)));
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [adminSigner]
  );

  return {
    generateKey,
    wrappedKey,
    adminSigner,
    loading,
    error,
  };
}
