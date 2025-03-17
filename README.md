It's your birthday? Prove it and get $100!

# Happy birthday

Happy birthday provides a simple example usage of Self with onchain verification.

## Getting Started

- Fork this repo.
- Deploy a smart contract with your custom logic on Celo. In our case, the smart contract checks that the user's birth date is revealed, and is in a +/- 7 day window from the current date. Make sure your contract inherits from `SelfVerificationRoot` so you can manage scope and nullifiers.

Linking to the contracts here: https://github.com/selfxyz/self/compare/main...feat/denver-usdc-distribution
TODO: Add them to this repo.

- Edit the QR code SDK arguments in `app/page.tsx` to change the proof request, then edit the API endpoint `pages/api/verify.ts` so it sends the right transaction to your contract.
- Run the development server:
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```
- Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

When developing locally, you can route the requests from the mobile app to your local machine by opening an ngrok endpoint using `ngrok http 3000` and replace `endpoint: "https://playground.self.xyz/api/verify"` in `app/page.tsx` with the newly generated url, that should look something like `endpoint: "https://198c-166-144-250-126.ngrok-free.app/api/verify"`.

When deploying to Vercel, update it to match the URL of your Vercel deployment.
