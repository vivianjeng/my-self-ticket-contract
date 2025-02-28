'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import SelfQRcodeWrapper, { SelfApp, SelfAppBuilder } from '@selfxyz/qrcode';
import { logo } from './content/playgroundAppLogo';

function Birthday() {
    const [address, setAddress] = useState('0xE6E4b6a802F2e0aeE5676f6010e0AF5C9CDd0a50');
    const [verificationResult, setVerificationResult] = useState<{
        isBirthday?: boolean;
        message?: string;
    } | null>(null);

    const selfApp = new SelfAppBuilder({
        appName: "Self Birthday",
        scope: "self-birthday",
        endpoint: "https://happy-birthday-rho-nine.vercel.app/api/verify",
        // endpoint: "https://6883-37-168-31-204.ngrok-free.app/api/verify",
        logoBase64: logo,
        userId: address,
        userIdType: "hex",
        disclosures: {
            date_of_birth: true,
        },
        devMode: false,
    } as Partial<SelfApp>).build();

    const handleSuccess = async () => {
        console.log('Verification successful');
    };

    return (
        <div className="min-h-screen bg-white text-black">
            <nav className="w-full bg-white border-b border-gray-200 py-3 px-6 flex items-center justify-between">
                <div className="flex items-center">
                    <div className="mr-8">
                        <Image 
                            src="/self.svg" 
                            alt="Self Logo" 
                            width={32}
                            height={32}
                            className="h-8"
                        />
                    </div>
                </div>
                <div className="flex items-center space-x-4">
                    <a 
                        href="https://github.com/zk-passport/openpassport" 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="bg-gray-900 text-white px-4 py-2 rounded-md flex items-center hover:bg-gray-800 transition-colors"
                    >
                        <span className="mr-2">Star on Github</span>
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path>
                        </svg>
                    </a>
                    <a
                        className="flex items-center justify-center gap-2 hover:underline hover:underline-offset-4"
                        href="https://self.xyz"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        Go to self.xyz →
                    </a>
                </div>
            </nav>

            <div className="container mx-auto max-w-2xl px-4 py-8">
                <div className="bg-white rounded-lg shadow-md p-6 border border-gray-300">
                    <h2 className="text-2xl font-semibold mb-6 text-center">
                        🎉 It&apos;s your birthday? Claim 100 USDC 🎂 🎁
                    </h2>

                    <div className="mb-6">
                        <label className="block text-sm font-medium mb-2">
                            Enter your wallet address:
                        </label>
                        <input
                            type="text"
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                            placeholder="0x..."
                            className="w-full p-2 border border-gray-300 rounded"
                        />
                    </div>

                    {address && (
                        <div className="flex justify-center mb-6">
                            <SelfQRcodeWrapper
                                selfApp={selfApp}
                                onSuccess={handleSuccess}
                                darkMode={false}
                            />
                        </div>
                    )}

                    {verificationResult && (
                        <div className={`p-4 rounded-lg text-center ${
                            verificationResult.isBirthday 
                                ? 'bg-green-100 text-green-700' 
                                : 'bg-yellow-100 text-yellow-700'
                        }`}>
                            {verificationResult.message}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Birthday;
