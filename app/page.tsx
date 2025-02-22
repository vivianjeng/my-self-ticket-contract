'use client';

import React from 'react';
import OpenPassportQRcodeWrapper, { SelfAppBuilder } from '@selfxyz/qrcode';
import { v4 as uuidv4 } from 'uuid';
import { logo } from './content/playgroundAppLogo';

// Dynamically import the component with no SSR
// const OpenPassportQRcodeWrapper = dynamic(
//   () => import('@selfxyz/qrcode').then((mod) => mod.default),
//   { ssr: false }
// );

export default function Playground() {
  const userId = uuidv4();

  const selfApp = new SelfAppBuilder({
    appName: "Self Playground",
    scope: "self-playground",
    endpoint: "https://playground.self.xyz/api/verify",
    logoBase64: logo,
    userId,
    disclosures: {
      name: true,
      nationality: true,
      date_of_birth: true,
      passport_number: true,
      minimumAge: 20,
      excludedCountries: ["IRN", "IRQ", "PRK", "RUS", "SYR", "VEN"],
      ofac: true,
    }
  }).build();

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-8 row-start-2 items-center mt-[-100px]">
        <h1 className="text-3xl md:text-4xl font-bold text-white text-center mb-8">Self playground</h1>
          <OpenPassportQRcodeWrapper
            selfApp={selfApp}
            onSuccess={() => {
                console.log('success');
            }}
          />
      </main>
      <footer className="row-start-3 flex gap-6 flex-wrap items-center justify-center">
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://self.xyz"
          target="_blank"
          rel="noopener noreferrer"
        >
          Go to self.xyz →
        </a>
      </footer>
    </div>
  );
}