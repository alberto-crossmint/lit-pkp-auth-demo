"use client";

import { useState } from "react";
import { useLit } from "../contexts/LitContext";

interface RegisterViewProps {
    onRegister: (method: "webauthn" | "google") => Promise<void>;
    loading: boolean;
}

export default function RegisterView({
    onRegister,
    loading,
}: RegisterViewProps) {
    const [error, setError] = useState<string | null>(null);
    const { pkp, wrappedKeys } = useLit();

    const handleRegister = async (method: "webauthn" | "google") => {
        try {
            setError(null);
            await onRegister(method);
        } catch (err) {
            setError(
                err instanceof Error ? err.message : "Registration failed"
            );
        }
    };

    return (
        <div className="w-full space-y-6">
            {/* Status Information */}
            {pkp && (
                <div className="bg-gray-700/50 p-4 rounded-lg backdrop-blur-sm border border-gray-600">
                    <h3 className="text-sm font-medium mb-2 text-blue-300">
                        PKP Public Key:
                    </h3>
                    <p className="font-mono text-sm break-all">
                        {pkp.publicKey}
                    </p>
                </div>
            )}

            {wrappedKeys && (
                <div className="bg-gray-700/50 p-4 rounded-lg backdrop-blur-sm border border-gray-600">
                    <h3 className="text-sm font-medium mb-2 text-blue-300">
                        Wrapped Keys Generated:
                    </h3>
                    <p className="font-mono text-sm break-all">
                        PKP Address: {wrappedKeys.pkpAddress}
                    </p>
                    <p className="font-mono text-sm break-all mt-2">
                        Generated Public Key: {wrappedKeys.generatedPublicKey}
                    </p>
                </div>
            )}

            {/* Error Display */}
            {error && (
                <div className="p-4 bg-red-900/50 border border-red-500 rounded-lg">
                    <p className="text-red-300">{error}</p>
                </div>
            )}

            {/* Authentication Method Buttons */}
            <div className="flex flex-col gap-4">
                <button
                    onClick={() => handleRegister("webauthn")}
                    disabled={loading}
                    className={`w-full px-4 py-3 rounded-lg transition-all duration-300 
                        ${
                            loading
                                ? "bg-gray-600 cursor-not-allowed"
                                : "bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600"
                        }
                        transform hover:scale-[1.02] active:scale-[0.98]`}
                >
                    {loading ? (
                        <span className="flex items-center justify-center gap-2">
                            <svg
                                className="animate-spin h-5 w-5"
                                viewBox="0 0 24 24"
                            >
                                <circle
                                    className="opacity-25"
                                    cx="12"
                                    cy="12"
                                    r="10"
                                    stroke="currentColor"
                                    strokeWidth="4"
                                    fill="none"
                                />
                                <path
                                    className="opacity-75"
                                    fill="currentColor"
                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                />
                            </svg>
                            Processing...
                        </span>
                    ) : (
                        "Register with WebAuthn"
                    )}
                </button>

                <button
                    onClick={() => handleRegister("google")}
                    disabled={loading}
                    className={`w-full px-4 py-3 rounded-lg transition-all duration-300 
                        ${
                            loading
                                ? "bg-gray-600 cursor-not-allowed"
                                : "bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600"
                        }
                        transform hover:scale-[1.02] active:scale-[0.98]`}
                >
                    {loading ? (
                        <span className="flex items-center justify-center gap-2">
                            <svg
                                className="animate-spin h-5 w-5"
                                viewBox="0 0 24 24"
                            >
                                <circle
                                    className="opacity-25"
                                    cx="12"
                                    cy="12"
                                    r="10"
                                    stroke="currentColor"
                                    strokeWidth="4"
                                    fill="none"
                                />
                                <path
                                    className="opacity-75"
                                    fill="currentColor"
                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                />
                            </svg>
                            Processing...
                        </span>
                    ) : (
                        "Register with Google"
                    )}
                </button>
            </div>
        </div>
    );
}
