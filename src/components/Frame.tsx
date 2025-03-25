"use client";

import { useEffect, useCallback, useState } from "react";
import sdk, {
  AddFrame,
  SignIn as SignInCore,
  type Context,
} from "@farcaster/frame-sdk";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "~/components/ui/tabs";

import { truncateAddress } from "~/lib/truncateAddress";
import { base, optimism } from "wagmi/chains";
import { useSession } from "next-auth/react";
import { createStore } from "mipd";
import { Label } from "~/components/ui/label";
import { PROJECT_TITLE } from "~/lib/constants";

import { ethers } from "ethers";
import { Keypair } from "@solana/web3.js";
import bs58 from "bs58";

function KeyGenerator() {
  const [evmKeys, setEvmKeys] = useState<string[]>([]);
  const [solKeys, setSolKeys] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState('evm');
  const [pageNumber, setPageNumber] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(false);

  const generatePageKeys = useCallback(async (chain: 'evm' | 'sol', page: number) => {
    setIsLoading(true);
    try {
      const keys = [];
      const startIndex = page * 128;
      
      if (chain === 'evm') {
        for (let i = 0; i < 128; i++) {
          const wallet = new ethers.Wallet(ethers.id((startIndex + i).toString()));
          keys.push(`Private Key: ${wallet.privateKey}\nAddress: ${wallet.address}`);
        }
        setEvmKeys(keys);
      } else {
        for (let i = 0; i < 128; i++) {
          const seed = new Uint8Array(32);
          new Uint32Array(seed.buffer).set([startIndex + i]);
          const keypair = Keypair.fromSeed(seed);
          keys.push(`Private Key: ${bs58.encode(keypair.secretKey)}\nAddress: ${keypair.publicKey.toBase58()}`);
        }
        setSolKeys(keys);
      }
    } catch (error) {
      console.error('Key generation failed:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-red-500">⚠️ Temporary Key Generator</CardTitle>
        <CardDescription>
          Generated keys are for testing purposes only. Never store significant funds!
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="evm">EVM</TabsTrigger>
            <TabsTrigger value="sol">Solana</TabsTrigger>
          </TabsList>
          
          <TabsContent value="evm">
            <div className="space-y-4">
              <div className="flex gap-2 mb-4">
                <input
                  type="number"
                  value={pageNumber}
                  onChange={(e) => setPageNumber(Math.max(0, parseInt(e.target.value) || 0))}
                  className="border rounded px-2 w-32"
                  placeholder="Page number"
                />
                <Button 
                  onClick={() => generatePageKeys('evm', pageNumber)}
                  disabled={isLoading}
                >
                  {isLoading ? 'Loading...' : 'Load Page'}
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => {
                    const randomPage = Math.floor(Math.random() * Math.pow(2, 256 - 7));
                    setPageNumber(randomPage);
                    generatePageKeys('evm', randomPage);
                  }}
                >
                  Random Page
                </Button>
              </div>
              <div className="grid grid-cols-1 gap-2">
                {evmKeys.map((key, index) => (
                  <div key={index} className="relative p-2 bg-gray-100 rounded-md">
                    <pre className="text-xs break-words">{key}</pre>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="absolute top-1 right-1"
                      onClick={() => navigator.clipboard.writeText(key)}
                    >
                      📋
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="sol">
            <div className="space-y-4">
              <div className="flex gap-2 mb-4">
                <input
                  type="number"
                  value={pageNumber}
                  onChange={(e) => setPageNumber(Math.max(0, parseInt(e.target.value) || 0))}
                  className="border rounded px-2 w-32"
                  placeholder="Page number"
                />
                <Button 
                  onClick={() => generatePageKeys('sol', pageNumber)}
                  disabled={isLoading}
                >
                  {isLoading ? 'Loading...' : 'Load Page'}
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => {
                    const randomPage = Math.floor(Math.random() * Math.pow(2, 256 - 7));
                    setPageNumber(randomPage);
                    generatePageKeys('sol', randomPage);
                  }}
                >
                  Random Page
                </Button>
              </div>
              <div className="grid grid-cols-1 gap-2">
                {solKeys.map((key, index) => (
                  <div key={index} className="relative p-2 bg-gray-100 rounded-md">
                    <pre className="text-xs break-words">{key}</pre>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="absolute top-1 right-1"
                      onClick={() => navigator.clipboard.writeText(key)}
                    >
                      📋
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <div className="mt-4 text-xs text-red-500">
          🔒 Keys generated in-browser - not stored anywhere
          <br />
          📝 Code is open source: github.com/yourusername/keys-frame
        </div>
      </CardContent>
    </Card>
  );
}

export default function Frame() {
  const [isSDKLoaded, setIsSDKLoaded] = useState(false);
  const [context, setContext] = useState<Context.FrameContext>();

  const [added, setAdded] = useState(false);

  const [addFrameResult, setAddFrameResult] = useState("");

  const addFrame = useCallback(async () => {
    try {
      await sdk.actions.addFrame();
    } catch (error) {
      if (error instanceof AddFrame.RejectedByUser) {
        setAddFrameResult(`Not added: ${error.message}`);
      }

      if (error instanceof AddFrame.InvalidDomainManifest) {
        setAddFrameResult(`Not added: ${error.message}`);
      }

      setAddFrameResult(`Error: ${error}`);
    }
  }, []);

  useEffect(() => {
    const load = async () => {
      const context = await sdk.context;
      if (!context) {
        return;
      }

      setContext(context);
      setAdded(context.client.added);

      // If frame isn't already added, prompt user to add it
      if (!context.client.added) {
        addFrame();
      }

      sdk.on("frameAdded", ({ notificationDetails }) => {
        setAdded(true);
      });

      sdk.on("frameAddRejected", ({ reason }) => {
        console.log("frameAddRejected", reason);
      });

      sdk.on("frameRemoved", () => {
        console.log("frameRemoved");
        setAdded(false);
      });

      sdk.on("notificationsEnabled", ({ notificationDetails }) => {
        console.log("notificationsEnabled", notificationDetails);
      });
      sdk.on("notificationsDisabled", () => {
        console.log("notificationsDisabled");
      });

      sdk.on("primaryButtonClicked", () => {
        console.log("primaryButtonClicked");
      });

      console.log("Calling ready");
      sdk.actions.ready({});

      // Set up a MIPD Store, and request Providers.
      const store = createStore();

      // Subscribe to the MIPD Store.
      store.subscribe((providerDetails) => {
        console.log("PROVIDER DETAILS", providerDetails);
        // => [EIP6963ProviderDetail, EIP6963ProviderDetail, ...]
      });
    };
    if (sdk && !isSDKLoaded) {
      console.log("Calling load");
      setIsSDKLoaded(true);
      load();
      return () => {
        sdk.removeAllListeners();
      };
    }
  }, [isSDKLoaded, addFrame]);

  if (!isSDKLoaded) {
    return <div>Loading...</div>;
  }

  return (
    <div
      style={{
        paddingTop: context?.client.safeAreaInsets?.top ?? 0,
        paddingBottom: context?.client.safeAreaInsets?.bottom ?? 0,
        paddingLeft: context?.client.safeAreaInsets?.left ?? 0,
        paddingRight: context?.client.safeAreaInsets?.right ?? 0,
      }}
    >
      <div className="w-[300px] mx-auto py-2 px-2">
        <KeyGenerator />
      </div>
    </div>
  );
}
