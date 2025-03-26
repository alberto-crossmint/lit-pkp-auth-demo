import WalletCard from "./WalletCard";
import NonCustodialWalletCard from "./NonCustodialWalletCard";

interface WalletViewProps {
    signerAddress: string;
}

export default function WalletView({ signerAddress }: WalletViewProps) {
    return (
        <>
            <div className="w-full max-w-2xl mb-8">
                <div className="bg-gray-800 p-6 rounded-xl shadow-lg">
                    <p className="text-sm text-gray-400 mb-2">
                        Your Non-Custodial Wallet Address:
                    </p>
                    <p className="font-mono break-all text-sm">
                        {signerAddress}
                    </p>
                </div>
            </div>
            <div className="w-full max-w-9xl flex flex-col md:flex-row gap-8 justify-center">
                <WalletCard title="Solana MPC Wallet" type="mpc" />
                {/* <WalletCard
                    title="Solana Smart Wallet"
                    type="smart"
                    subtitle="Custodial Signer"
                /> */}
                <NonCustodialWalletCard adminSigner={signerAddress} />
            </div>
        </>
    );
}
