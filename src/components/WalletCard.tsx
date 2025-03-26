import { useState, useEffect } from 'react';
import type {
  SolanaMPCWallet,
  SolanaSmartWallet,
} from '@crossmint/wallets-sdk';
import {
  addDelegatedSigner,
  createWallet,
  sendTransaction,
  type WalletType,
} from '../services/walletService';
import type { VersionedTransaction } from '@solana/web3.js';

interface WalletCardProps {
  title: string;
  subtitle?: string;
  type: 'smart' | 'mpc' | 'smart-non-custodial';
  adminSigner?: {
    type: 'solana-keypair';
    signer: {
      signTransaction: (
        tx: VersionedTransaction
      ) => Promise<VersionedTransaction>;
      signMessage: (message: Uint8Array) => Promise<Uint8Array>;
    };
    address: string;
  };
}

export default function WalletCard({
  title,
  subtitle,
  type,
  adminSigner,
}: WalletCardProps) {
  const [wallet, setWallet] = useState<
    SolanaSmartWallet | SolanaMPCWallet | null
  >(null);
  const [delegatedSigners, setDelegatedSigners] = useState<
    Array<{
      signer: any;
      address: string;
    }>
  >([]);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [adminSignerAddress, setAdminSignerAddress] = useState<string | null>(
    adminSigner?.address ?? null
  );
  const [transactions, setTransactions] = useState<
    Array<{
      txId: string;
      title: string;
      signer?: 'admin' | string | null;
      timestamp: number;
    }>
  >([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingAddDelegatedSigner, setIsLoadingAddDelegatedSigner] =
    useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Create wallet on component mount
  useEffect(() => {
    const initializeWallet = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const newWallet = await createWallet(type, adminSigner);
        setWallet(newWallet);
        if (type === 'smart-non-custodial') {
          const address = (newWallet as SolanaSmartWallet).adminSigner.address;
          if (address != null) {
            setAdminSignerAddress(address);
          }
        }

        const address = await newWallet.getAddress();
        setWalletAddress(address);
      } catch (err) {
        console.error(`Error creating ${type} wallet:`, err);
        setError(err instanceof Error ? err.message : String(err));
      } finally {
        setIsLoading(false);
      }
    };

    initializeWallet();
  }, [type, adminSigner]);

  const handleSendTransaction = async (signerType: 'admin' | string) => {
    if (!wallet) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const message = `Hello from Crossmint SDK ${
        type === 'smart' ? 'Smart' : 'MPC'
      } Wallet!`;

      console.log('selectedSigner', signerType);

      // Find the selected delegated signer if not admin
      const selectedSigner =
        signerType === 'admin'
          ? null
          : delegatedSigners.find(ds => ds.address === signerType)?.signer;

      console.log('delegatedSignerSelected', selectedSigner);

      const transactionId = await sendTransaction(
        wallet,
        message,
        selectedSigner
      );

      setTransactions(prev => [
        ...prev,
        {
          txId: transactionId,
          title: 'Transaction Success!',
          signer: signerType,
          timestamp: Date.now(),
        },
      ]);
    } catch (err) {
      console.error(`Error sending ${type} wallet transaction:`, err);
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsLoading(false);
      setIsModalOpen(false);
    }
  };

  const handleAddDelegatedSigner = async () => {
    if (!wallet) {
      return;
    }

    setIsLoadingAddDelegatedSigner(true);
    setError(null);

    try {
      const { signer, response } = (await addDelegatedSigner(
        wallet as SolanaSmartWallet
      )) as any;
      console.log('signer returned', signer);

      // Add the new delegated signer to our array
      setDelegatedSigners(prev => [
        ...prev,
        {
          signer: signer,
          address: response.address,
        },
      ]);

      setTransactions(prev => [
        ...prev,
        {
          txId: response.transaction.onChain.txId,
          title: 'Delegated Signer Added!',
          timestamp: Date.now(),
        },
      ]);
    } catch (err) {
      console.error(`Error adding delegated signer:`, err);
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsLoadingAddDelegatedSigner(false);
    }
  };

  const openTransactionModal = () => {
    if (delegatedSigners.length > 0) {
      setIsModalOpen(true);
    } else {
      handleSendTransaction('admin');
    }
  };

  const handleSignerSelection = (signer: 'admin' | string) => {
    handleSendTransaction(signer);
  };

  return (
    <>
      <div className="dashboard-header">
        <h1>{title}</h1>
        {subtitle && <p className="dashboard-subtitle">{subtitle}</p>}
      </div>

      {error && (
        <div className="alert alert--error">
          <p>{error}</p>
        </div>
      )}

      {isLoading ? (
        <div className="wallet-loading">
          <LoadingSpinner text="Creating Wallet..." />
        </div>
      ) : (
        wallet && (
          <div className="wallet-content">
            <div className="account-card__address">
              <div className="address-container">
                <p className="balance-label">
                  Wallet Address:
                  <code className="address-value">
                    {walletAddress?.slice(0, 6)}
                    <span className="text-text-secondary">•••</span>
                    {walletAddress?.slice(-4)}
                  </code>
                </p>
              </div>
              <div className="address-container">
                <p className="balance-label">
                  Admin Signer Address:
                  <code className="address-value">
                    {adminSignerAddress?.slice(0, 6)}
                    <span className="text-text-secondary">•••</span>
                    {adminSignerAddress?.slice(-4)}
                  </code>
                </p>
              </div>
            </div>

            <div className="transaction-section">
              <button
                type="button"
                className="btn btn--primary"
                onClick={openTransactionModal}
                disabled={isLoading}
              >
                {isLoading ? (
                  <LoadingSpinner text="Sending Transaction..." />
                ) : (
                  'Send Transaction'
                )}
              </button>
            </div>

            {/* Transactions list */}
            {transactions.length > 0 && (
              <div className="transactions-list">
                <h3 className="dashboard-header">Transaction History</h3>
                <div className="transaction-items">
                  {transactions.map((tx, index) => (
                    <div
                      key={`tx-${tx.timestamp}-${index}`}
                      className="transaction-item"
                    >
                      <div className="transaction-header">
                        <div className="transaction-icon">
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="var(--success-color)"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            aria-hidden="true"
                          >
                            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                            <polyline points="22 4 12 14.01 9 11.01" />
                          </svg>
                        </div>
                        <div className="transaction-title">{tx.title}</div>
                        <div className="transaction-time">
                          {new Date(tx.timestamp).toLocaleTimeString()}
                        </div>
                      </div>
                      <div className="transaction-details">
                        <div className="transaction-id">
                          <span className="balance-label">tx id</span>
                          <code className="tx-hash">
                            {tx.txId.slice(0, 10)}...{tx.txId.slice(-8)}
                          </code>
                        </div>
                        {tx.signer && (
                          <div className="transaction-signer">
                            <span className="balance-label">signed by</span>
                            <span className="signer-name">
                              {tx.signer === 'admin'
                                ? 'Admin Signer'
                                : 'Delegated Signer'}
                            </span>
                          </div>
                        )}
                        <a
                          href={`https://explorer.solana.com/tx/${tx.txId}?cluster=devnet`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="tx-link"
                        >
                          View on Solana Explorer
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )
      )}
    </>
  );
}

function LoadingSpinner({ text }: { text: string }) {
  return (
    <span className="loading__status">
      <div className="loading__status-dot" />
      <span>{text}</span>
    </span>
  );
}

function TransactionSuccess({
  txId,
  title,
  signer,
  walletType,
  delegatedSigners,
}: {
  txId: string;
  title: string;
  signer?: 'admin' | string | null;
  walletType: WalletType;
  delegatedSigners: Array<{ signer: any; address: string }>;
}) {
  return (
    <div className="account-card">
      <div className="account-card__content">
        <div className="flex items-center mb-3">
          <svg
            className="w-5 h-5 text-success-color mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M5 13l4 4L19 7"
            ></path>
          </svg>
          <p className="font-bold text-success-color">{title}</p>
        </div>
        <div className="account-card__address">
          <p className="balance-label">Transaction ID</p>
          <div className="balance-value">
            <code>{txId}</code>
          </div>
        </div>
        {signer &&
          walletType !== 'mpc' &&
          title !== 'Delegated Signer Added!' && (
            <div className="mt-3">
              <p className="balance-label">Signed by</p>
              <div className="balance-value">
                {signer === 'admin'
                  ? 'Admin Signer'
                  : 'Delegated Signer' +
                    (delegatedSigners.length > 1
                      ? ` #${
                          delegatedSigners.findIndex(
                            ds => ds.address === signer
                          ) + 1
                        }`
                      : '')}
              </div>
            </div>
          )}
        {title === 'Delegated Signer Added!' && (
          <div className="mt-3">
            <p className="balance-label">Signed by</p>
            <div className="balance-value">Admin Signer</div>
          </div>
        )}
        <a
          href={`https://explorer.solana.com/tx/${txId}?cluster=devnet`}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn--secondary mt-4"
        >
          View on Solana Explorer
        </a>
      </div>
    </div>
  );
}

function SignerSelectionModal({
  onClose,
  onSelectSigner,
  adminSignerAddress,
  delegatedSigners,
}: {
  onClose: () => void;
  onSelectSigner: (signer: 'admin' | string) => void;
  adminSignerAddress: string | null;
  delegatedSigners: Array<{ signer: any; address: string }>;
}) {
  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div className="wrapper">
        <h3 className="text-xl font-bold text-text-color mb-4">
          Choose Signer
        </h3>
        <p className="text-text-secondary mb-6">
          Select which signer to use for this transaction:
        </p>
        <div className="space-y-4">
          <button
            onClick={() => onSelectSigner('admin')}
            className="btn btn--primary w-full"
          >
            Admin Signer
          </button>
          {delegatedSigners.map((ds, index) => (
            <button
              key={index}
              onClick={() => onSelectSigner(ds.address)}
              className="btn btn--secondary w-full"
            >
              Delegated Signer #{index + 1}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
