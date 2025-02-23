import { NextApiRequest, NextApiResponse } from 'next';
import { getUserIdentifier, SelfBackendVerifier } from '@selfxyz/core';
import { kv } from '@vercel/kv';
import { countryNames } from '@selfxyz/core/dist/common/src/constants/constants';
import { SelfApp } from '@selfxyz/qrcode';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'POST') {
        try {
            const { proof, publicSignals } = req.body;

            if (!proof || !publicSignals) {
                return res.status(400).json({ message: 'Proof and publicSignals are required' });
            }

            const userId = await getUserIdentifier(publicSignals);
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
                issuing_state: true,
                name: true,
                nationality: true,
                date_of_birth: true,
                passport_number: true,
                gender: true,
                expiry_date: true
            };
            
            // Try to retrieve options from store using userId
            if (userId) {
                const savedOptions = await kv.get(userId) as SelfApp["disclosures"];
                console.log("Retrieved saved options for userId:", userId, savedOptions);
                if (savedOptions) {
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
                            (code: string) => codeToName[code] || code
                        );
                    }
                    
                    enableOfac = savedOptions.ofac !== undefined ? savedOptions.ofac : enableOfac;
                    
                    // Apply all disclosure settings
                    enabledDisclosures = {
                        issuing_state: savedOptions.issuing_state !== undefined ? savedOptions.issuing_state : enabledDisclosures.issuing_state,
                        name: savedOptions.name !== undefined ? savedOptions.name : enabledDisclosures.name,
                        nationality: savedOptions.nationality !== undefined ? savedOptions.nationality : enabledDisclosures.nationality,
                        date_of_birth: savedOptions.date_of_birth !== undefined ? savedOptions.date_of_birth : enabledDisclosures.date_of_birth,
                        passport_number: savedOptions.passport_number !== undefined ? savedOptions.passport_number : enabledDisclosures.passport_number,
                        gender: savedOptions.gender !== undefined ? savedOptions.gender : enabledDisclosures.gender,
                        expiry_date: savedOptions.expiry_date !== undefined ? savedOptions.expiry_date : enabledDisclosures.expiry_date
                    };
                    
                    // Delete the options after use
                    await kv.del(userId);
                } else {
                    console.log("No saved options found for userId:", userId);
                }
            } else {
                console.log("No userId found in verification result, using default options");
            }
            
            const configuredVerifier = new SelfBackendVerifier(
                'https://forno.celo.org',
                "self-playground",
            );
            
            configuredVerifier.setMinimumAge(minimumAge);
            
            if (excludedCountryList.length > 0) {
                configuredVerifier.excludeCountries(
                    ...excludedCountryList as (typeof countryNames)[number][]
                );
            }
            
            if (enableOfac) {
                configuredVerifier.enableNameAndDobOfacCheck();
            }

            const result = await configuredVerifier.verify(proof, publicSignals);
            console.log("Verification result:", result);

            if (result.isValid) {
                const filteredSubject = { ...result.credentialSubject };
                
                if (!enabledDisclosures.issuing_state && filteredSubject) {
                    filteredSubject.issuing_state = "Not disclosed";
                }
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
                if (!enabledDisclosures.gender && filteredSubject) {
                    filteredSubject.gender = "Not disclosed";
                }
                if (!enabledDisclosures.expiry_date && filteredSubject) {
                    filteredSubject.expiry_date = "Not disclosed";
                }
                
                res.status(200).json({
                    status: 'success',
                    result: result.isValid,
                    credentialSubject: filteredSubject,
                    verificationOptions: {
                        minimumAge,
                        ofac: enableOfac,
                        excludedCountries: excludedCountryList.map(country => {
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