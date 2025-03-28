"use client"; // Required for useState and event handlers

import React, { useState, useCallback } from "react";
import { ethers } from "ethers";
import { Keypair } from "@solana/web3.js";
import * as bitcoin from "bitcoinjs-lib";
import ECPairFactory from "ecpair";
import * as ecc from "tiny-secp256k1";
import { Buffer } from "buffer"; // Import Buffer

interface KeyInfo {
  privateKey: string;
  publicKey?: string; // Made optional as we won't always display/use it
  address: string;
}

type ChainType = "evm" | "solana" | "bitcoin";
try {
  const ECPair = ECPairFactory(ecc);
} catch (error) {
  console.error("Error initializing ECPair:", error);
}

const Frame: React.FC = () => {
  const [evmKeys, setEvmKeys] = useState<KeyInfo | null>(null);
  const [solanaKeys, setSolanaKeys] = useState<KeyInfo | null>(null);
  const [bitcoinKeys, setBitcoinKeys] = useState<KeyInfo | null>(null); // Added state for Bitcoin
  const [selectedChain, setSelectedChain] = useState<ChainType>("evm"); // State for toggling

  const generateEvmKeys = useCallback(() => {
    const wallet = ethers.Wallet.createRandom();
    setEvmKeys({
      privateKey: wallet.privateKey,
      publicKey: wallet.publicKey, // Still generated, just not displayed
      address: wallet.address,
    });
  }, []);

  const generateSolanaKeys = useCallback(() => {
    const keypair = Keypair.generate();
    const privateKeyString = `[${keypair.secretKey.toString()}]`; // Representing the byte array
    setSolanaKeys({
      privateKey: privateKeyString,
      publicKey: keypair.publicKey.toBase58(), // Still generated, just not displayed
      address: keypair.publicKey.toBase58(), // In Solana, the public key is the address
    });
  }, []);

  // Added function to generate Bitcoin keys
  const generateBitcoinKeys = useCallback(() => {
    const keyPair = ECPair.makeRandom();
    // Convert publicKey from Uint8Array to Buffer for bitcoinjs-lib
    const { address } = bitcoin.payments.p2pkh({
      pubkey: Buffer.from(keyPair.publicKey),
    });
    const privateKeyWIF = keyPair.toWIF(); // Wallet Import Format

    if (!address) {
      // Handle the unlikely case where address generation fails
      console.error("Failed to generate Bitcoin address.");
      setBitcoinKeys(null);
      return;
    }

    setBitcoinKeys({
      privateKey: privateKeyWIF,
      // publicKey: keyPair.publicKey.toString('hex'), // We could store it, but won't display
      address: address,
    });
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
            >
              Generate Solana Keys
            </button>
          </div>
          <KeyDisplay title="Solana" keys={solanaKeys} chainType="solana" />
        </div>
      )}

      {/* Added Bitcoin Section */}
      {selectedChain === "bitcoin" && (
        <div>
          <div className="flex justify-center mb-4">
            <button
              onClick={generateBitcoinKeys}
              className="px-6 py-2 bg-yellow-500 text-black font-semibold rounded hover:bg-yellow-600 transition-colors"
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
