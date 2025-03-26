import type { IRelayPKP } from '@lit-protocol/types';
import type { Dispatch, SetStateAction } from 'react';

interface AccountSelectionProps {
  accounts: IRelayPKP[];
  setCurrentAccount: Dispatch<SetStateAction<IRelayPKP>>;
  error?: Error;
}

export default function AccountSelection({
  accounts,
  setCurrentAccount,
  error,
}: AccountSelectionProps) {
  return (
    <div className="container">
      <div className="wrapper">
        {error && (
          <div className="alert alert--error">
            <p>{error.message}</p>
          </div>
        )}
        <h1>Select an account</h1>
        <p>Choose which account you'd like to use.</p>
        <div className="account-selection">
          <div className="account-list">
            {accounts.map(account => (
              <button
                key={account.ethAddress}
                className="account-card"
                onClick={() => setCurrentAccount(account)}
                onKeyDown={e => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    setCurrentAccount(account);
                  }
                }}
                type="button"
              >
                <div className="account-card__content">
                  <div className="account-card__address">
                    {account.ethAddress.slice(0, 6)}...
                    {account.ethAddress.slice(-4)}
                  </div>
                  <div className="account-card__balance">
                    <span className="balance-label">Balance</span>
                    <span className="balance-value">0 SOL</span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
