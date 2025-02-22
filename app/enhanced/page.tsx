'use client';

import React, { useState, useEffect } from 'react';
import OpenPassportQRcodeWrapper, { SelfApp, SelfAppBuilder } from '@selfxyz/qrcode';
import { v4 as uuidv4 } from 'uuid';
import { logo } from '../content/playgroundAppLogo';

function Showcase() {
    const [userId] = useState(uuidv4());
    
    const [savingOptions, setSavingOptions] = useState(false);
    
    // State for disclosures and verification options
    const [disclosures, setDisclosures] = useState({
        name: true,
        nationality: true,
        date_of_birth: true,
        passport_number: true,
        minimumAge: 20,
        excludedCountries: ["IRN", "IRQ", "PRK", "RUS", "SYR", "VEN"],
        ofac: true,
    });

    // For country selection modal
    const [showCountryModal, setShowCountryModal] = useState(false);
    const [selectedCountries, setSelectedCountries] = useState<string[]>([
        "Iran (Islamic Republic of)", 
        "Iraq", 
        "Korea (Democratic People's Republic of)", 
        "Russian Federation", 
        "Syrian Arab Republic", 
        "Venezuela (Bolivarian Republic of)"
    ]);
    
    // For minimum age slider
    const handleAgeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newAge = parseInt(e.target.value);
        setDisclosures(prev => ({ ...prev, minimumAge: newAge }));
        // Reset options saved flag when options change
        saveOptionsToServer();
    };

    // For country selection
    const handleCountryToggle = (country: string) => {
        setSelectedCountries(prev => 
            prev.includes(country) ? prev.filter(c => c !== country) : [...prev, country]
        );
    };

    const saveCountrySelection = () => {
        // Convert full country names to 3-letter codes
        const countryCodes = selectedCountries.map(country => {
            const codeMap: Record<string, string> = {
                "Iran (Islamic Republic of)": "IRN",
                "Iraq": "IRQ",
                "Korea (Democratic People's Republic of)": "PRK",
                "Russian Federation": "RUS",
                "Syrian Arab Republic": "SYR", 
                "Venezuela (Bolivarian Republic of)": "VEN"
            };
            return codeMap[country] || country.substring(0, 3).toUpperCase();
        });

        setDisclosures(prev => ({ ...prev, excludedCountries: countryCodes }));
        setShowCountryModal(false);
        // Reset options saved flag when options change
        saveOptionsToServer();
    };

    // Toggle checkboxes for disclosure options
    const handleCheckboxChange = (field: string) => {
        setDisclosures(prev => ({
            ...prev,
            [field]: !prev[field as keyof typeof prev]
        }));
        // Reset options saved flag when options change
        saveOptionsToServer();
    };

    // Save options to server before showing QR code
    const saveOptionsToServer = async () => {
        if (savingOptions) return; // Skip if already in progress
        
        setSavingOptions(true);
        try {
            // Send options to server
            const response = await fetch('/api/saveOptions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userId, // Use userId as the key for storing options
                    options: {
                        minimumAge: disclosures.minimumAge,
                        excludedCountries: disclosures.excludedCountries,
                        ofac: disclosures.ofac,
                        name: disclosures.name,
                        nationality: disclosures.nationality,
                        date_of_birth: disclosures.date_of_birth,
                        passport_number: disclosures.passport_number,
                    }
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to save options');
            }
        } catch (error) {
            console.error('Error saving options:', error);
            alert('Failed to save verification options. Please try again.');
        } finally {
            setSavingOptions(false);
        }
    };

    // Automatically save options when component mounts
    useEffect(() => {
        saveOptionsToServer();
    }, []);

    // Construct the SelfApp object
    // Use the same userId that we're using to store options
    const selfApp = new SelfAppBuilder({
        appName: "Self Playground",
        scope: "self-playground",
        endpoint: "https://playground.self.xyz/api/verify", 
        logoBase64: logo,
        userId,
        disclosures: disclosures
    } as Partial<SelfApp>).build();

    return (
        <div className="App flex flex-col items-center justify-center px-4 min-h-screen py-8 bg-black text-white" suppressHydrationWarning>
            <h1 className="text-3xl md:text-4xl font-bold text-white text-center mb-8">OpenPassport Playground v2</h1>
            
            <div className="w-full max-w-6xl flex gap-8">
                {/* QR Code Section - Left Side */}
                <div className="w-1/2 flex flex-col items-center justify-center">
                    <OpenPassportQRcodeWrapper
                        selfApp={selfApp}
                        onSuccess={() => {
                            console.log('Verification successful');
                        }}
                    />
                    <p className="mt-4 text-sm text-gray-300">
                        User ID: {userId.substring(0, 8)}...
                    </p>
                </div>

                {/* Options Section - Right Side */}
                <div className="w-1/2 bg-black rounded-lg shadow-md p-6 border border-gray-700">
                    <h2 className="text-2xl font-semibold mb-4">Verification Options</h2>

                    <div className="space-y-6">
                        <div className="border border-gray-700 rounded-md p-4">
                            <h3 className="text-lg font-medium mb-3">Personal Information</h3>
                            <div className="space-y-2">
                                <label className="flex items-center space-x-2">
                                    <input
                                        type="checkbox"
                                        checked={disclosures.name}
                                        onChange={() => handleCheckboxChange('name')}
                                        className="h-4 w-4"
                                    />
                                    <span>Disclose Name</span>
                                </label>
                                <label className="flex items-center space-x-2">
                                    <input
                                        type="checkbox"
                                        checked={disclosures.nationality}
                                        onChange={() => handleCheckboxChange('nationality')}
                                        className="h-4 w-4"
                                    />
                                    <span>Disclose Nationality</span>
                                </label>
                                <label className="flex items-center space-x-2">
                                    <input
                                        type="checkbox"
                                        checked={disclosures.date_of_birth}
                                        onChange={() => handleCheckboxChange('date_of_birth')}
                                        className="h-4 w-4"
                                    />
                                    <span>Disclose Date of Birth</span>
                                </label>
                                <label className="flex items-center space-x-2">
                                    <input
                                        type="checkbox"
                                        checked={disclosures.passport_number}
                                        onChange={() => handleCheckboxChange('passport_number')}
                                        className="h-4 w-4"
                                    />
                                    <span>Disclose Passport Number</span>
                                </label>
                            </div>
                        </div>
                        
                        <div className="border border-gray-700 rounded-md p-4">
                            <h3 className="text-lg font-medium mb-3">Verification Rules</h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="block mb-1">Minimum Age: {disclosures.minimumAge}</label>
                                    <input
                                        type="range"
                                        min="10"
                                        max="100"
                                        value={disclosures.minimumAge}
                                        onChange={handleAgeChange}
                                        className="w-full"
                                    />
                                </div>
                                
                                <div>
                                    <label className="flex items-center space-x-2">
                                        <input
                                            type="checkbox"
                                            checked={disclosures.ofac}
                                            onChange={() => handleCheckboxChange('ofac')}
                                            className="h-4 w-4"
                                        />
                                        <span>Enable OFAC Check</span>
                                    </label>
                                </div>
                                
                                <div>
                                    <button
                                        onClick={() => setShowCountryModal(true)}
                                        className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                                    >
                                        Configure Excluded Countries
                                    </button>
                                    <div className="mt-2 text-sm text-gray-300">
                                        {disclosures.excludedCountries.length > 0 
                                            ? `${disclosures.excludedCountries.length} countries excluded` 
                                            : "No countries excluded"}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            {/* Country Selection Modal */}
            {showCountryModal && (
                <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50">
                    <div className="bg-black rounded-lg shadow-xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto border border-gray-700">
                        <h3 className="text-xl font-semibold mb-4">Select Countries to Exclude</h3>
                        
                        <div className="mb-4">
                            <input
                                type="text"
                                placeholder="Search countries..."
                                className="w-full p-2 border border-gray-700 rounded bg-black text-white"
                            />
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 mb-6 max-h-96 overflow-y-auto">
                            {[
                                "Iran (Islamic Republic of)",
                                "Iraq",
                                "Korea (Democratic People's Republic of)",
                                "Russian Federation",
                                "Syrian Arab Republic", 
                                "Venezuela (Bolivarian Republic of)",
                                "United States of America",
                                "China",
                                "Germany",
                                "France",
                                "Japan"
                            ].map(country => (
                                <label key={country} className="flex items-center space-x-2 p-1 hover:bg-gray-900 rounded">
                                    <input
                                        type="checkbox"
                                        checked={selectedCountries.includes(country)}
                                        onChange={() => handleCountryToggle(country)}
                                        className="h-4 w-4"
                                    />
                                    <span className="text-sm">{country}</span>
                                </label>
                            ))}
                        </div>
                        
                        <div className="flex justify-end space-x-3">
                            <button
                                onClick={() => setShowCountryModal(false)}
                                className="px-4 py-2 border border-gray-700 rounded hover:bg-gray-900"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={saveCountrySelection}
                                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                            >
                                Apply
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Showcase;