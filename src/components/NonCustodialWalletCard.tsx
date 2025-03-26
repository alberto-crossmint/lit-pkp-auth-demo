import WalletCard from './WalletCard';
import type { VersionedTransaction } from '@solana/web3.js';

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

interface NonCustodialWalletCardProps {
  adminSigner: AdminSigner | null;
  pkpPublicKey: string;
}

export default function NonCustodialWalletCard({
  adminSigner,
  pkpPublicKey,
}: NonCustodialWalletCardProps) {
  return (
    <WalletCard
      title="Solana Smart Wallet"
      type="smart-non-custodial"
      subtitle="Non-Custodial Signer"
      adminSigner={adminSigner}
    />
  );
}
