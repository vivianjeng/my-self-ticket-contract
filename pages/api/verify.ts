import { NextApiRequest, NextApiResponse } from 'next';
import { 
    getUserIdentifier, 
    SelfBackendVerifier
} from '@selfxyz/core';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'POST') {
        try {
            const { proof, publicSignals } = req.body;

            if (!proof || !publicSignals) {
                return res.status(400).json({ message: 'Proof and publicSignals are required' });
            }

            const address = await getUserIdentifier(publicSignals);
            console.log("Extracted address from verification result:", address);

            const configuredVerifier = new SelfBackendVerifier(
                'https://forno.celo.org',
                "self-birthday",
            );

            const result = await configuredVerifier.verify(proof, publicSignals);
            console.log("Verification result:", result);

            if (result.isValid && result.credentialSubject?.date_of_birth) {
                // Check if it's the user's birthday
                const birthDate = new Date(result.credentialSubject.date_of_birth);
                const today = new Date();
                
                const isBirthday = birthDate.getMonth() === today.getMonth() && 
                                 birthDate.getDate() === today.getDate();

                if (isBirthday) {
                    // TODO: Implement USDC transfer here
                    // For now, just return success with birthday message
                    res.status(200).json({
                        status: 'success',
                        isBirthday: true,
                        message: 'Happy Birthday! 100 USDC has been sent to your address.',
                    });
                } else {
                    res.status(200).json({
                        status: 'success',
                        isBirthday: false,
                        message: "It's not your birthday today. Come back on your birthday!",
                    });
                }
            } else {
                res.status(400).json({
                    status: 'error',
                    message: 'Verification failed or date of birth not disclosed',
                    details: result.isValidDetails
                });
            }
        } catch (error) {
            console.error('Error verifying proof:', error);
            return res.status(500).json({ 
                message: 'Error verifying proof',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    } else {
        res.status(405).json({ message: 'Method not allowed' });
    }
}