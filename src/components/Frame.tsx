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

import { config } from "~/components/providers/WagmiProvider";
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
  const [evmKey, setEvmKey] = useState('');
  const [solKey, setSolKey] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('evm');

  const generateKeys = useCallback(async (chain: 'evm' | 'sol') => {
    setIsLoading(true);
    try {
      if (chain === 'evm') {
        // Generate EVM private key
        const wallet = ethers.Wallet.createRandom();
        setEvmKey(`Private Key: ${wallet.privateKey}\nAddress: ${wallet.address}`);
      } else {
        // Generate Solana keypair
        const keypair = Keypair.generate();
        setSolKey(`Private Key: ${bs58.encode(keypair.secretKey)}\nAddress: ${keypair.publicKey.toBase58()}`);
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
              <Button 
                onClick={() => generateKeys('evm')}
                disabled={isLoading}
              >
                {isLoading ? 'Generating...' : 'Generate EVM Key'}
              </Button>
              {evmKey && (
                <div className="relative">
                  <pre className="p-2 bg-gray-100 rounded-md text-xs break-words">
                    {evmKey}
                  </pre>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="absolute top-1 right-1"
                    onClick={() => navigator.clipboard.writeText(evmKey)}
                  >
                    📋
                  </Button>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="sol">
            <div className="space-y-4">
              <Button 
                onClick={() => generateKeys('sol')}
                disabled={isLoading}
              >
                {isLoading ? 'Generating...' : 'Generate SOL Key'}
              </Button>
              {solKey && (
                <div className="relative">
                  <pre className="p-2 bg-gray-100 rounded-md text-xs break-words">
                    {solKey}
                  </pre>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="absolute top-1 right-1"
                    onClick={() => navigator.clipboard.writeText(solKey)}
                  >
                    📋
                  </Button>
                </div>
              )}
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
