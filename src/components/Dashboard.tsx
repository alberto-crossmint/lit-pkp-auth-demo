import { useState, useEffect } from 'react';
import useAuthenticate from '../hooks/useAuthenticate';
import useAccounts from '../hooks/useAccounts';
import AccountSelection from './AccountSelection';
import CreateAccount from './CreateAccount';
import WalletView from './WalletView';
import type { IRelayPKP } from '@lit-protocol/types';
import type { SessionSigs } from '@lit-protocol/types';
import type { VersionedTransaction } from '@solana/web3.js';
import NonCustodialWalletCard from './NonCustodialWalletCard';

interface WrappedKey {
  pkpAddress: string;
  generatedPublicKey: string;
}

interface AdminSigner {
  type: 'solana-keypair';
  signer: {
    signTransaction: (
      tx: VersionedTransaction
    ) => Promise<VersionedTransaction>;
    signMessage: (message: Uint8Array) => Promise<Uint8Array>;
  };
  address: string;
}

interface DashboardProps {
  currentAccount: IRelayPKP;
  sessionSigs: SessionSigs;
  wrappedKey: WrappedKey;
  adminSigner: AdminSigner | null;
}

export default function Dashboard({
  currentAccount,
  sessionSigs,
  wrappedKey,
  adminSigner,
}: DashboardProps) {
  const { authMethod } = useAuthenticate();
  const { accounts, createAccount } = useAccounts();
  const [showWalletView, setShowWalletView] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  console.log('🔍 Dashboard adminSigner prop:', adminSigner);

  const handleCreateWallet = async () => {
    setIsLoading(true);
    try {
      setShowWalletView(true);
    } catch (error) {
      console.error('Error creating wallet:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!adminSigner) {
    return (
      <div className="container">
        <div className="wrapper">
          <Spinner size="large" text="Initializing your admin signer..." />
        </div>
      </div>
    );
  }

  if (showWalletView) {
    return (
      <div className="container">
        <div className="wrapper">
          <NonCustodialWalletCard
            adminSigner={adminSigner}
            pkpPublicKey={wrappedKey.generatedPublicKey}
          />
        </div>
        <button
          type="button"
          className="btn btn--corner"
          onClick={() => window.location.reload()}
        >
          Sign out
        </button>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="wrapper">
        <div className="dashboard-header">
          <h1>Your Solana Signer</h1>
          <p className="dashboard-subtitle">
            A secure, programmable key for your Solana wallet
          </p>
        </div>

        <div className="account-card">
          <div className="account-card__content">
            <div className="account-card__address">
              <p className="balance-label">Admin Signer Address</p>
              <div className="balance-value">
                <code>
                  {wrappedKey.generatedPublicKey.slice(0, 6)}
                  <span className="text-text-secondary">•••</span>
                  {wrappedKey.generatedPublicKey.slice(-4)}
                </code>
              </div>
            </div>
          </div>
        </div>

        <div className="smart-wallet-section">
          <div className="account-card">
            <div
              className="account-card__content"
              style={{
                display: 'flex',
                flexDirection: 'column',
                minHeight: '180px',
              }}
            >
              <div
                className="dashboard-header"
                style={{ marginBottom: '0.2rem', textAlign: 'left' }}
              >
                <h2>Create your smart wallet</h2>
                <p className="dashboard-subtitle">
                  Create a secure Solana wallet powered by your generated key
                </p>
              </div>

              <button
                type="button"
                className="btn btn--primary"
                onClick={handleCreateWallet}
                disabled={isLoading}
                style={{ marginTop: '1rem' }}
              >
                {isLoading ? 'Creating wallet...' : 'Create wallet'}
              </button>
            </div>
          </div>
        </div>
      </div>
      <button
        type="button"
        className="btn btn--corner"
        onClick={() => window.location.reload()}
      >
        Sign out
      </button>
    </div>
  );
}

function Spinner({
  size = 'medium',
  text,
}: {
  size?: 'small' | 'medium' | 'large';
  text?: string;
}) {
  const sizeMap = {
    small: 24,
    medium: 40,
    large: 64,
  };

  const pixelSize = sizeMap[size];

  return (
    <div className="spinner-container">
      <div
        className="spinner"
        style={{
          width: `${pixelSize}px`,
          height: `${pixelSize}px`,
        }}
      >
        <div className="spinner__inner">
          <div className="spinner__circle" />
          <div className="spinner__circle-mask" />
        </div>
      </div>
      {text && <p className="spinner__text">{text}</p>}
    </div>
  );
}
