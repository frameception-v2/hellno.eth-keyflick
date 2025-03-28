"use client";

import React, { useState, useCallback, useEffect } from "react";
import { ethers } from "ethers";

interface KeyInfo {
  privateKey: string;
  publicKey?: string;
  address: string;
}

type ChainType = "evm" | "solana" | "bitcoin";

// Add Buffer polyfill for browser environment
if (typeof window !== 'undefined') {
  window.Buffer = window.Buffer || require('buffer/').Buffer;
}

const Frame: React.FC = () => {
  const [evmKeys, setEvmKeys] = useState<KeyInfo | null>(null);
  const [solanaKeys, setSolanaKeys] = useState<KeyInfo | null>(null);
  const [bitcoinKeys, setBitcoinKeys] = useState<KeyInfo | null>(null);
  const [selectedChain, setSelectedChain] = useState<ChainType>("evm");
  const [cryptoLibsLoaded, setCryptoLibsLoaded] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Load crypto libraries dynamically
  useEffect(() => {
    const loadCryptoLibs = async () => {
      try {
        // Only attempt to load libraries in browser environment
        if (typeof window !== 'undefined') {
          // We'll set this to true even if some libs fail - we'll handle individual failures in the generation functions
          setCryptoLibsLoaded(true);
        }
      } catch (error) {
        console.error("Failed to load crypto libraries:", error);
        setLoadError("Failed to initialize cryptographic libraries. This may not work in all browsers or iframe contexts.");
      }
    };

    loadCryptoLibs();
  }, []);

  const generateEvmKeys = useCallback(() => {
    try {
      const wallet = ethers.Wallet.createRandom();
      setEvmKeys({
        privateKey: wallet.privateKey,
        publicKey: wallet.publicKey,
        address: wallet.address,
      });
    } catch (error) {
      console.error("Error generating EVM keys:", error);
      setLoadError("Failed to generate EVM keys. This browser may have restrictions on cryptographic operations.");
    }
  }, []);

  const generateSolanaKeys = useCallback(async () => {
    try {
      // Dynamically import Solana only when needed
      const { Keypair } = await import("@solana/web3.js");
      const keypair = Keypair.generate();
      const privateKeyString = `[${keypair.secretKey.toString()}]`;
      setSolanaKeys({
        privateKey: privateKeyString,
        publicKey: keypair.publicKey.toBase58(),
        address: keypair.publicKey.toBase58(),
      });
    } catch (error) {
      console.error("Error generating Solana keys:", error);
      setLoadError("Failed to generate Solana keys. This browser may have restrictions on cryptographic operations.");
    }
  }, []);

  const generateBitcoinKeys = useCallback(async () => {
    try {
      // Dynamically import Bitcoin libraries only when needed
      const bitcoin = await import("bitcoinjs-lib");
      const ecc = await import("tiny-secp256k1");
      const ECPairFactory = (await import("ecpair")).default;
      
      // Create a window.Buffer polyfill if needed
      if (typeof window !== 'undefined' && !window.Buffer) {
        const { Buffer } = await import("buffer/");
        window.Buffer = Buffer;
      }
      
      const ECPair = ECPairFactory(ecc);
      const keyPair = ECPair.makeRandom();
      
      // Use Buffer safely
      const pubkeyBuffer = Buffer.from(keyPair.publicKey);
      
      const { address } = bitcoin.payments.p2pkh({
        pubkey: pubkeyBuffer,
      });
      
      const privateKeyWIF = keyPair.toWIF();

      if (!address) {
        throw new Error("Failed to generate Bitcoin address");
      }

      setBitcoinKeys({
        privateKey: privateKeyWIF,
        address: address,
      });
    } catch (error) {
      console.error("Error generating Bitcoin keys:", error);
      setLoadError("Failed to generate Bitcoin keys. This browser may have restrictions on cryptographic operations.");
    }
  }, []);

  // Helper component to display key details - Removed Public Key display
  const KeyDisplay: React.FC<{
    title: string;
    keys: KeyInfo | null;
    chainType: ChainType;
  }> = ({ title, keys, chainType }) => (
    <div className="mt-4 p-4 border border-gray-300 dark:border-gray-700 rounded">
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      {keys ? (
        <div className="space-y-1 text-sm break-all">
          <p>
            <strong>Address:</strong> {keys.address}
          </p>
          {/* <p><strong>Public Key:</strong> {keys.publicKey}</p> */}{" "}
          {/* Removed Public Key */}
          <p className="text-red-600 dark:text-red-400">
            <strong>Private Key:</strong> {keys.privateKey}
          </p>
        </div>
      ) : (
        <p className="text-gray-500">
          Click the button above to generate{" "}
          {chainType === "evm"
            ? "EVM"
            : chainType === "solana"
              ? "Solana"
              : "Bitcoin"}{" "}
          keys.
        </p>
      )}
    </div>
  );

  return (
    <div className="p-4 max-w-md mx-auto">
      <h1 className="text-2xl font-bold text-center mb-4">
        Disposable Key Generator
      </h1>

      {/* Warning Section */}
      <div className="mb-6 p-3 bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-700 rounded text-red-800 dark:text-red-200">
        <h2 className="font-bold text-lg mb-1">⚠️ Security Warning!</h2>
        <p className="text-sm">
          These keys are generated client-side and are **NOT** cryptographically
          secure for storing value. They are intended for **testing and
          educational purposes ONLY**.
          <br />
          **NEVER send significant funds to these addresses.**
        </p>
      </div>

      {/* Error message if libraries failed to load */}
      {loadError && (
        <div className="mb-6 p-3 bg-yellow-100 dark:bg-yellow-900 border border-yellow-400 dark:border-yellow-700 rounded text-yellow-800 dark:text-yellow-200">
          <p className="text-sm">{loadError}</p>
        </div>
      )}

      {/* Chain Toggle Buttons - Added Bitcoin */}
      <div className="flex justify-center space-x-2 md:space-x-4 mb-6">
        <button
          onClick={() => setSelectedChain("evm")}
          className={`px-3 py-2 md:px-4 text-sm md:text-base font-semibold rounded transition-colors ${
            selectedChain === "evm"
              ? "bg-blue-600 text-white"
              : "bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600"
          }`}
        >
          EVM
        </button>
        <button
          onClick={() => setSelectedChain("solana")}
          className={`px-3 py-2 md:px-4 text-sm md:text-base font-semibold rounded transition-colors ${
            selectedChain === "solana"
              ? "bg-purple-600 text-white"
              : "bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600"
          }`}
        >
          Solana
        </button>
        <button
          onClick={() => setSelectedChain("bitcoin")}
          className={`px-3 py-2 md:px-4 text-sm md:text-base font-semibold rounded transition-colors ${
            selectedChain === "bitcoin"
              ? "bg-yellow-500 text-black" // Bitcoin orange/yellow
              : "bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600"
          }`}
        >
          Bitcoin
        </button>
      </div>

      {/* Conditional Key Generation Button and Display */}
      {selectedChain === "evm" && (
        <div>
          <div className="flex justify-center mb-4">
            <button
              onClick={generateEvmKeys}
              className="px-6 py-2 bg-blue-600 text-white font-semibold rounded hover:bg-blue-700 transition-colors"
              disabled={!cryptoLibsLoaded}
            >
              Generate EVM Keys
            </button>
          </div>
          <KeyDisplay
            title="EVM (Ethereum, Polygon, etc.)"
            keys={evmKeys}
            chainType="evm"
          />
        </div>
      )}

      {selectedChain === "solana" && (
        <div>
          <div className="flex justify-center mb-4">
            <button
              onClick={generateSolanaKeys}
              className="px-6 py-2 bg-purple-600 text-white font-semibold rounded hover:bg-purple-700 transition-colors"
              disabled={!cryptoLibsLoaded}
            >
              Generate Solana Keys
            </button>
          </div>
          <KeyDisplay title="Solana" keys={solanaKeys} chainType="solana" />
        </div>
      )}

      {/* Bitcoin Section */}
      {selectedChain === "bitcoin" && (
        <div>
          <div className="flex justify-center mb-4">
            <button
              onClick={generateBitcoinKeys}
              className="px-6 py-2 bg-yellow-500 text-black font-semibold rounded hover:bg-yellow-600 transition-colors"
              disabled={!cryptoLibsLoaded}
            >
              Generate Bitcoin Keys
            </button>
          </div>
          <KeyDisplay
            title="Bitcoin (BTC)"
            keys={bitcoinKeys}
            chainType="bitcoin"
          />
        </div>
      )}

      {/* Footer Note */}
      <p className="text-xs text-center text-gray-500 dark:text-gray-400 mt-6">
        Keys are generated randomly in your browser each time you click the
        button. They are not stored anywhere.
      </p>
    </div>
  );
};

export default Frame;
