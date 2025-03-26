interface CreateAccountProps {
  signUp: () => void;
}

export default function CreateAccount({ signUp }: CreateAccountProps) {
  return (
    <div className="container">
      <div className="wrapper">
        <h1>Create your Solana Smart Wallet</h1>
        <p>
          Get started with a secure, programmable wallet that works with your
          biometrics.
        </p>
        <div className="buttons-container">
          <button type="button" className="btn btn--primary" onClick={signUp}>
            Create wallet
          </button>
        </div>
      </div>
    </div>
  );
}
