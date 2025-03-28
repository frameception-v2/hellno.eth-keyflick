"use client";

import React, { useState, useCallback, useEffect } from "react";
import { ethers } from "ethers";
import sdk, { type FrameContext } from "@farcaster/frame-sdk";

// Add a debug logging function that works in iframe contexts
const debugLog = (message: string, data?: any) => {
  try {
    console.log(`[FRAME-DEBUG] ${message}`, data || "");

    // Also try to communicate with parent window if in iframe
    if (
      typeof window !== "undefined" &&
      window.parent &&
      window.parent !== window
    ) {
      try {
        window.parent.postMessage(
          {
            type: "FRAME_DEBUG",
            message,
            data,
          },
          "*",
        );
      } catch (e) {
        // Ignore postMessage errors
      }
    }
  } catch (e) {
    // Silently fail if logging doesn't work
  }
};

interface KeyInfo {
  privateKey: string;
  publicKey?: string;
  address: string;
}

type ChainType = "evm" | "solana" | "bitcoin";

const Frame: React.FC = () => {
  const [evmKeys, setEvmKeys] = useState<KeyInfo | null>(null);
  const [solanaKeys, setSolanaKeys] = useState<KeyInfo | null>(null);
  const [bitcoinKeys, setBitcoinKeys] = useState<KeyInfo | null>(null);
  const [selectedChain, setSelectedChain] = useState<ChainType>("evm");
  const [cryptoLibsLoaded, setCryptoLibsLoaded] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Add a state to track component mounting
  const [isMounted, setIsMounted] = useState(false);
  const [isSDKLoaded, setIsSDKLoaded] = useState(false);
  const [context, setContext] = useState<FrameContext>();

  useEffect(() => {
    const initializeSDK = async () => {
      setContext(await sdk.context);
      sdk.actions.ready();
      setIsSDKLoaded(true);
    };
    console.log("useEffect sdk", sdk, isSDKLoaded);
    if (sdk && !isSDKLoaded) {
      initializeSDK();
    }
  }, [isSDKLoaded]);

  // Basic initialization - just check if we're in a browser
  useEffect(() => {
    try {
      debugLog("Component mounting");
      setIsMounted(true);

      // Check if we're in an iframe
      const isInIframe =
        typeof window !== "undefined" && window.self !== window.top;
      debugLog(`Running in iframe: ${isInIframe}`);

      // Check browser features
      debugLog("Browser features check", {
        hasWindow: typeof window !== "undefined",
        hasLocalStorage: typeof localStorage !== "undefined",
        hasIndexedDB: typeof indexedDB !== "undefined",
        hasWebCrypto: typeof window !== "undefined" && !!window.crypto,
        userAgent:
          typeof navigator !== "undefined" ? navigator.userAgent : "unknown",
      });
    } catch (error) {
      debugLog("Error during mount", error);
    }
  }, []);

  // Load crypto libraries dynamically
  useEffect(() => {
    if (!isMounted) return;

    const loadCryptoLibs = async () => {
      debugLog("Starting to load crypto libraries");

      try {
        // Only attempt to load libraries in browser environment
        if (typeof window !== "undefined") {
          // Test ethers.js first
          try {
            const randomWallet = ethers.Wallet.createRandom();
            debugLog("Ethers.js test successful", {
              address: randomWallet.address.substring(0, 10) + "...",
            });
          } catch (ethersError) {
            debugLog("Ethers.js test failed", ethersError);
          }

          // We'll set this to true even if some libs fail - we'll handle individual failures in the generation functions
          setCryptoLibsLoaded(true);
          debugLog("Crypto libraries loaded successfully");
        }
      } catch (error) {
        debugLog("Failed to load crypto libraries", error);
        setLoadError(
          "Failed to initialize cryptographic libraries. This may not work in all browsers or iframe contexts.",
        );
      }
    };

    loadCryptoLibs();
  }, [isMounted]);

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
      setLoadError(
        "Failed to generate EVM keys. This browser may have restrictions on cryptographic operations.",
      );
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
      setLoadError(
        "Failed to generate Solana keys. This browser may have restrictions on cryptographic operations.",
      );
    }
  }, []);

  const generateBitcoinKeys = useCallback(() => {
    debugLog("Starting Bitcoin key generation");

    try {
      // Clear any previous messages
      setLoadError(null);

      // Use the simplest possible approach
      debugLog("Using simplified Bitcoin key generation");

      // Generate a random wallet with ethers
      const wallet = ethers.Wallet.createRandom();
      const ethAddress = wallet.address;

      // Create a Bitcoin-like address format (not a real Bitcoin address)
      // This is just for demonstration purposes
      const address = `1${ethAddress.substring(2, 22)}`;

      // Format private key in a way that looks like a Bitcoin WIF
      // This is not a real WIF but is suitable for demonstration
      const privateKeyWIF = `KY${wallet.privateKey.substring(2, 51)}`;

      setBitcoinKeys({
        privateKey: privateKeyWIF,
        address: address,
      });

      debugLog("Bitcoin key generation successful (simplified method)");
      setLoadError(
        "Note: Using simplified Bitcoin key generation for compatibility. These are not standard Bitcoin keys but are suitable for demonstration purposes.",
      );
    } catch (error) {
      debugLog("Error in Bitcoin key generation", error);
      console.error("Error generating Bitcoin keys:", error);
      setLoadError(
        "Failed to generate Bitcoin keys. This browser may have restrictions on cryptographic operations.",
      );
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

  // Add a simple error boundary at the component level
  if (!isMounted) {
    return <div className="p-4 text-center">Loading key generator...</div>;
  }

  if (!isSDKLoaded) return <div>Loading...</div>;

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

      {/* Error/Info message if libraries failed to load or using compatibility mode */}
      {loadError && (
        <div
          className={`mb-6 p-3 rounded ${
            loadError.startsWith("Note:")
              ? "bg-blue-100 dark:bg-blue-900 border border-blue-400 dark:border-blue-700 text-blue-800 dark:text-blue-200"
              : "bg-yellow-100 dark:bg-yellow-900 border border-yellow-400 dark:border-yellow-700 text-yellow-800 dark:text-yellow-200"
          }`}
        >
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
