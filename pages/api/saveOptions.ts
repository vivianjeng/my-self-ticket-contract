// pages/api/saveOptions.ts

import { NextApiRequest, NextApiResponse } from 'next';
import verificationOptionsStore from '../../lib/verificationOptionsStore';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        const { userId, options } = req.body;

        if (!userId) {
            return res.status(400).json({ message: 'User ID is required' });
        }

        if (!options) {
            return res.status(400).json({ message: 'Options are required' });
        }

        // Store the options using userId as the key
        verificationOptionsStore.setOptions(userId, options);

        return res.status(200).json({ message: 'Options saved successfully' });
    } catch (error) {
        console.error('Error saving options:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}