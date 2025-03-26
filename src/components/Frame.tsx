'use client'; // Required for useState and event handlers

import React, { useState, useCallback } from 'react';
import { ethers } from 'ethers';
import { Keypair } from '@solana/web3.js';

interface KeyInfo {
  privateKey: string;
  publicKey: string;
  address: string;
}

const Frame: React.FC = () => {
  const [evmKeys, setEvmKeys] = useState<KeyInfo | null>(null);
  const [solanaKeys, setSolanaKeys] = useState<KeyInfo | null>(null);

  const generateEvmKeys = useCallback(() => {
    const wallet = ethers.Wallet.createRandom();
    setEvmKeys({
      privateKey: wallet.privateKey,
      publicKey: wallet.publicKey,
      address: wallet.address,
    });
  }, []);

  const generateSolanaKeys = useCallback(() => {
    const keypair = Keypair.generate();
    // Solana uses base58 encoding for private keys (secretKey is Uint8Array)
    // It's generally NOT recommended to display the raw secret key directly in UI
    // For educational purposes like keys.lol, it might be shown, but with strong warnings.
    // We will display it here as per the request's implied functionality.
    // Note: Standard Solana tooling often uses the Uint8Array directly or keypair files.
    const privateKeyString = `[${keypair.secretKey.toString()}]`; // Representing the byte array
    setSolanaKeys({
      privateKey: privateKeyString, // Displaying byte array representation
      publicKey: keypair.publicKey.toBase58(),
      address: keypair.publicKey.toBase58(), // In Solana, the public key is the address
    });
  }, []);

  const generateAllKeys = useCallback(() => {
    generateEvmKeys();
    generateSolanaKeys();
  }, [generateEvmKeys, generateSolanaKeys]);

  // Helper component to display key details
  const KeyDisplay: React.FC<{ title: string; keys: KeyInfo | null }> = ({ title, keys }) => (
    <div className="mb-4 p-4 border border-gray-300 dark:border-gray-700 rounded">
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      {keys ? (
        <div className="space-y-1 text-sm break-all">
          <p><strong>Address:</strong> {keys.address}</p>
          <p><strong>Public Key:</strong> {keys.publicKey}</p>
          <p className="text-red-600 dark:text-red-400"><strong>Private Key:</strong> {keys.privateKey}</p>
        </div>
      ) : (
        <p className="text-gray-500">Click &quot;Generate Keys&quot; to create {title} keys.</p>
      )}
    </div>
  );

  return (
    <div className="p-4 max-w-md mx-auto">
       <h1 className="text-2xl font-bold text-center mb-4">Disposable Key Generator</h1>

       {/* Warning Section */}
       <div className="mb-6 p-3 bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-700 rounded text-red-800 dark:text-red-200">
         <h2 className="font-bold text-lg mb-1">⚠️ Security Warning!</h2>
         <p className="text-sm">
           These keys are generated client-side and are **NOT** cryptographically secure for storing value.
           They are intended for **testing and educational purposes ONLY**.
           <br />
           **NEVER send significant funds to these addresses.**
         </p>
       </div>

       {/* Key Generation Button */}
       <div className="flex justify-center mb-6">
         <button
           onClick={generateAllKeys}
           className="px-6 py-2 bg-blue-600 text-white font-semibold rounded hover:bg-blue-700 transition-colors"
         >
           Generate New Keys
         </button>
       </div>

       {/* Key Displays */}
       <div className="space-y-4">
         <KeyDisplay title="EVM (Ethereum, Polygon, etc.)" keys={evmKeys} />
         <KeyDisplay title="Solana" keys={solanaKeys} />
       </div>

       {/* Footer Note */}
       <p className="text-xs text-center text-gray-500 dark:text-gray-400 mt-6">
         Keys are generated randomly in your browser each time you click the button. They are not stored anywhere.
       </p>
    </div>
  );
};

export default Frame;
