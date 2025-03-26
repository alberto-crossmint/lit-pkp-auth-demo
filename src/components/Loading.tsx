interface LoadingProps {
  copy: string;
  error?: Error;
}

export default function Loading({ copy, error }: LoadingProps) {
  return (
    <div className="container">
      <div className="wrapper">
        <div className="loading">
          <div className="loading__content">
            <div className="loading__spinner">
              <div className="loading__spinner-inner" />
            </div>
            <h2>Setting up your Solana signer</h2>
            <p>{copy}</p>
            <div className="loading__status">
              <div className="loading__status-dot" />
              <span>Processing your request...</span>
            </div>
          </div>
          {error && (
            <div className="alert alert--error">
              <p>{error.message}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
