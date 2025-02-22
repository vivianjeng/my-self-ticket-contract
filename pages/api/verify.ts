// pages/api/verify.ts

import { NextApiRequest, NextApiResponse } from 'next';
import { SelfBackendVerifier } from '@selfxyz/core';
import verificationOptionsStore from '../../lib/verificationOptionsStore';
import { countryNames } from '@selfxyz/core/dist/common/src/constants/constants';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'POST') {
        try {
            // Extract proof and publicSignals from the request
            const { proof, publicSignals } = req.body;

            if (!proof || !publicSignals) {
                return res.status(400).json({ message: 'Proof and publicSignals are required' });
            }

            // Create SelfBackendVerifier instance
            const selfBackendVerifier = new SelfBackendVerifier(
                'https://forno.celo.org',
                "self-playground"
            );

            // Extract the userId from the verification result
            // First, perform a basic verification to get the userId
            const prelimResult = await selfBackendVerifier.verify(proof, publicSignals);

            console.log("Preliminary verification result:", prelimResult);
            
            // The userId is available in the verification result
            const userId = prelimResult.userId;
            
            console.log("Extracted userId from verification result:", userId);
            
            // Default options
            let minimumAge = 18;
            let excludedCountryList: string[] = [
                "Iran (Islamic Republic of)", 
                "Iraq", 
                "Korea (Democratic People's Republic of)", 
                "Russian Federation", 
                "Syrian Arab Republic", 
                "Venezuela (Bolivarian Republic of)"
            ];
            let enableOfac = true;
            let enabledDisclosures = {
                name: true,
                nationality: true,
                date_of_birth: true,
                passport_number: true
            };
            
            // Try to retrieve options from store using userId
            if (userId) {
                const savedOptions = verificationOptionsStore.getOptions(userId);
                if (savedOptions) {
                    console.log("Retrieved saved options for userId:", userId);
                    console.log("Saved options:", savedOptions);
                    
                    // Apply saved options
                    minimumAge = savedOptions.minimumAge || minimumAge;
                    
                    if (savedOptions.excludedCountries && savedOptions.excludedCountries.length > 0) {
                        // Convert 3-letter codes to full country names if needed
                        const codeToName: Record<string, string> = {
                            "IRN": "Iran (Islamic Republic of)",
                            "IRQ": "Iraq",
                            "PRK": "Korea (Democratic People's Republic of)",
                            "RUS": "Russian Federation", 
                            "SYR": "Syrian Arab Republic",
                            "VEN": "Venezuela (Bolivarian Republic of)"
                        };
                        
                        excludedCountryList = savedOptions.excludedCountries.map(
                            code => codeToName[code] || code
                        );
                    }
                    
                    enableOfac = savedOptions.ofac !== undefined ? savedOptions.ofac : enableOfac;
                    
                    // Also apply disclosure settings
                    enabledDisclosures = {
                        name: savedOptions.name !== undefined ? savedOptions.name : enabledDisclosures.name,
                        nationality: savedOptions.nationality !== undefined ? savedOptions.nationality : enabledDisclosures.nationality,
                        date_of_birth: savedOptions.date_of_birth !== undefined ? savedOptions.date_of_birth : enabledDisclosures.date_of_birth,
                        passport_number: savedOptions.passport_number !== undefined ? savedOptions.passport_number : enabledDisclosures.passport_number
                    };
                    
                    // Clean up the options after use
                    verificationOptionsStore.deleteOptions(userId);
                } else {
                    console.log("No saved options found for userId:", userId);
                }
            } else {
                console.log("No userId found in verification result, using default options");
            }
            
            // Create a new verifier with the retrieved options
            const configuredVerifier = new SelfBackendVerifier(
                'https://forno.celo.org',
                "self-playground"
            );
            
            // Apply configuration based on options
            configuredVerifier.setMinimumAge(minimumAge);
            
            if (excludedCountryList.length > 0) {
                configuredVerifier.excludeCountries(
                    ...excludedCountryList as (typeof countryNames)[number][]
                );
            }
            
            if (enableOfac) {
                configuredVerifier.enableNameAndDobOfacCheck();
            }

            // Perform verification with the configured verifier
            const result = await configuredVerifier.verify(proof, publicSignals);

            console.log("Verification result:", result);

            if (result.isValid) {
                // Filter credential subject based on enabled disclosures
                const filteredSubject = { ...result.credentialSubject };
                
                // Only include fields that were explicitly enabled
                if (!enabledDisclosures.name && filteredSubject) {
                    filteredSubject.name = "Not disclosed";
                }
                if (!enabledDisclosures.nationality && filteredSubject) {
                    filteredSubject.nationality = "Not disclosed";
                }
                if (!enabledDisclosures.date_of_birth && filteredSubject) {
                    filteredSubject.date_of_birth = "Not disclosed";
                }
                if (!enabledDisclosures.passport_number && filteredSubject) {
                    filteredSubject.passport_number = "Not disclosed";
                }
                
                res.status(200).json({
                    status: 'success',
                    result: result.isValid,
                    credentialSubject: filteredSubject,
                    verificationOptions: {
                        minimumAge,
                        ofac: enableOfac,
                        excludedCountries: excludedCountryList.map(country => {
                            // Convert back to codes for the response
                            const nameToCode: Record<string, string> = {
                                "Iran (Islamic Republic of)": "IRN",
                                "Iraq": "IRQ",
                                "Korea (Democratic People's Republic of)": "PRK",
                                "Russian Federation": "RUS", 
                                "Syrian Arab Republic": "SYR",
                                "Venezuela (Bolivarian Republic of)": "VEN"
                            };
                            return nameToCode[country] || country;
                        })
                    }
                });
            } else {
                res.status(400).json({
                    status: 'error', 
                    result: result.isValid,
                    message: 'Verification failed',
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