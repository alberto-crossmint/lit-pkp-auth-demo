import { useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import useAuthenticate from '../hooks/useAuthenticate';
import useSession from '../hooks/useSession';
import useAccounts from '../hooks/useAccounts';
import useWrappedKeys from '../hooks/useWrappedKeys';
import { ORIGIN, signInWithGoogle } from '../utils/lit';
import { AuthMethodType } from '@lit-protocol/constants';
import LoginMethods from '../components/LoginMethods';
import Dashboard from '../components/Dashboard';
import Loading from '../components/Loading';

export default function SignUpView() {
  const redirectUri = ORIGIN;
  const hasCreatedAccount = useRef(false);
  const componentId = useRef(Math.random().toString(36).substring(7));

  const {
    authMethod,
    loading: authLoading,
    error: authError,
  } = useAuthenticate(redirectUri);
  const {
    createAccount,
    setCurrentAccount,
    currentAccount,
    loading: accountsLoading,
    error: accountsError,
  } = useAccounts();
  const {
    initSession,
    sessionSigs,
    loading: sessionLoading,
    error: sessionError,
  } = useSession();
  const {
    generateKey,
    wrappedKey,
    adminSigner,
    loading: wrappedKeyLoading,
    error: wrappedKeyError,
  } = useWrappedKeys();
  const router = useRouter();

  const error = authError || accountsError || sessionError || wrappedKeyError;

  if (error) {
    console.error(`❌ [${componentId.current}] Error detected:`, {
      authError: authError?.message,
      accountsError: accountsError?.message,
      sessionError: sessionError?.message,
      wrappedKeyError: wrappedKeyError?.message,
    });
  }

  async function handleGoogleLogin() {
    console.log(`🔑 [${componentId.current}] Initiating Google login...`);
    try {
      await signInWithGoogle(redirectUri);
      console.log(
        `✅ [${componentId.current}] Google login completed successfully`
      );
    } catch (err) {
      console.error(`❌ [${componentId.current}] Google login failed:`, err);
    }
  }

  useEffect(() => {
    if (authMethod && !hasCreatedAccount.current) {
      console.log(
        `✨ [${componentId.current}] Starting account creation flow...`
      );
      router.replace(window.location.pathname, undefined, { shallow: true });
      createAccount(authMethod)
        .then(() => {
          console.log(
            `✅ [${componentId.current}] Account created successfully`
          );
        })
        .catch(err => {
          console.error(
            `❌ [${componentId.current}] Account creation failed:`,
            err
          );
        });
      hasCreatedAccount.current = true;
    }
  }, [authMethod, createAccount, router]);

  useEffect(() => {
    if (authMethod && currentAccount && !sessionSigs) {
      console.log(
        `🔐 [${componentId.current}] Starting session initialization...`
      );
      initSession(authMethod, currentAccount)
        .then(() => {
          console.log(
            `✅ [${componentId.current}] Session initialized successfully`
          );
        })
        .catch(err => {
          console.error(
            `❌ [${componentId.current}] Session initialization failed:`,
            err
          );
        });
    }
  }, [authMethod, currentAccount, initSession, sessionSigs]);

  useEffect(() => {
    if (sessionSigs && !wrappedKey) {
      console.log(
        `🔑 [${componentId.current}] Starting wrapped key generation...`
      );
      generateKey(sessionSigs)
        .then(() => {
          console.log(
            `✅ [${componentId.current}] Wrapped key generated successfully`
          );
        })
        .catch(err => {
          console.error(
            `❌ [${componentId.current}] Wrapped key generation failed:`,
            err
          );
        });
    }
  }, [sessionSigs, wrappedKey, generateKey]);

  console.log('🔍 Index.tsx adminSigner:', adminSigner);

  if (authLoading) {
    return (
      <Loading copy={'Authenticating your credentials...'} error={error} />
    );
  }

  if (accountsLoading) {
    return <Loading copy={'Creating your account...'} error={error} />;
  }

  if (sessionLoading) {
    return <Loading copy={'Securing your session...'} error={error} />;
  }

  if (wrappedKeyLoading) {
    return <Loading copy={'Generating wrapped key...'} error={error} />;
  }

  if (currentAccount && sessionSigs && wrappedKey) {
    return (
      <Dashboard
        currentAccount={currentAccount}
        sessionSigs={sessionSigs}
        wrappedKey={wrappedKey}
        adminSigner={adminSigner}
      />
    );
  }

  return (
    <LoginMethods
      handleGoogleLogin={handleGoogleLogin}
      goToSignUp={() => router.push('/signup')}
      error={error}
    />
  );
}
