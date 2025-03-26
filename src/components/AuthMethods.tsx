import Image from 'next/image';

interface AuthMethodsProps {
  handleGoogleLogin: () => Promise<void>;
  setView: React.Dispatch<React.SetStateAction<string>>;
}

const AuthMethods = ({ handleGoogleLogin }: AuthMethodsProps) => {
  return (
    <div className="buttons-container">
      <div className="social-container">
        <button
          type="button"
          className="btn btn--outline btn--google"
          onClick={handleGoogleLogin}
        >
          <div className="btn__icon">
            <Image
              src="/google.png"
              alt="Google logo"
              width={18}
              height={18}
              style={{ objectFit: 'contain' }}
            />
          </div>
          <span className="btn__label">Continue with Google</span>
        </button>
      </div>
    </div>
  );
};

export default AuthMethods;
