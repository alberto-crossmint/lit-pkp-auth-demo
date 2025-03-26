import { useCallback, useEffect, useState } from 'react';
import {
  isSignInRedirect,
  getProviderFromUrl,
} from '@lit-protocol/lit-auth-client';
import type { AuthMethod } from '@lit-protocol/types';
import { authenticateWithGoogle, authenticateWithWebAuthn } from '../utils/lit';
import { useConnect } from 'wagmi';

export default function useAuthenticate(redirectUri?: string) {
  const [authMethod, setAuthMethod] = useState<AuthMethod>();
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error>();

  // wagmi hook
  const { connectAsync } = useConnect({
    onError: (err: unknown) => {
      setError(err as Error);
    },
  });

  /**
   * Handle redirect from Google OAuth
   */
  const authWithGoogle = useCallback(async (): Promise<void> => {
    setLoading(true);
    setError(undefined);
    setAuthMethod(undefined);

    try {
      const result: AuthMethod = (await authenticateWithGoogle(
        redirectUri as any
      )) as any;
      setAuthMethod(result);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [redirectUri]);

  /**
   * Authenticate with WebAuthn credential
   */
  const authWithWebAuthn = useCallback(
    async (username?: string): Promise<void> => {
      setLoading(true);
      setError(undefined);
      setAuthMethod(undefined);

      try {
        const result: AuthMethod = await authenticateWithWebAuthn();
        setAuthMethod(result);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    // Check if user is redirected from social login
    if (redirectUri && isSignInRedirect(redirectUri)) {
      // If redirected, authenticate with social provider
      const providerName = getProviderFromUrl();
      if (providerName === 'google') {
        authWithGoogle();
      }
    }
  }, [redirectUri, authWithGoogle]);

  return {
    authWithWebAuthn,
    authMethod,
    loading,
    error,
  };
}
