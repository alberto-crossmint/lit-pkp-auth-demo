import AuthMethods from './AuthMethods';

interface LoginProps {
  handleGoogleLogin: () => Promise<void>;
  goToSignUp: () => void;
  error?: Error;
}

export default function LoginMethods({
  handleGoogleLogin,
  goToSignUp,
  error,
}: LoginProps) {
  return (
    <div className="container">
      <div className="wrapper">
        {error && (
          <div className="alert alert--error">
            <p>{error.message}</p>
          </div>
        )}
        <div className="dashboard-header">
          <h1>Login to Your Solana Signer</h1>
          <p className="dashboard-subtitle">
            Access your secure, programmable key for your Solana wallet
          </p>
        </div>
        <AuthMethods handleGoogleLogin={handleGoogleLogin} setView={() => {}} />
        <div className="buttons-container">
          <button type="button" className="btn btn--link" onClick={goToSignUp}>
            Don't have a signer? Sign up
          </button>
        </div>
      </div>
    </div>
  );
}
