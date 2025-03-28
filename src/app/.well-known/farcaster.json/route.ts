import { NextResponse } from 'next/server';
import { PROJECT_ID } from '~/lib/constants'; // Assuming you might use this or other constants

// Define the structure for the Farcaster frame metadata
// (Assuming a structure based on common Farcaster frame practices)
const frameMetadata = {
  name: 'KeyFlick: Disposable Crypto Keys',
  icon: 'key', // Example icon
  description: 'Generate temporary EVM, Solana, and Bitcoin keys for testing.',
  button1: 'Generate Keys',
  postUrl: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://your-app-url.vercel.app'}/api/frame`, // Replace with your actual frame API endpoint
  // Add other frame-specific fields as needed
};

// Define the new account association data
const accountAssociationData = {
  header: 'eyJmaWQiOiA4Njk5OTksICJ0eXBlIjogImN1c3RvZHkiLCAia2V5IjogIjB4NzZkNTBCMEUxNDc5YTlCYTJiRDkzNUYxRTlhMjdDMGM2NDlDOEMxMiJ9',
  payload: 'eyJkb21haW4iOiAiaGVsbG5vZXRoLWtleWZsaWNrLnZlcmNlbC5hcHAifQ',
  signature: 'pKDeGOWamw3zHsvkE84XKnjFcjv5lQgs49-WvDC4AA1Bm5gEkZj3Oq9MfW4r3LsDUrQ5FzJcag0GNa_9j0DkEBw'
};

export async function GET() {
  // Construct the response object with both keys
  const responseBody = {
    accountAssociation: accountAssociationData,
    frame: frameMetadata, // Keeping the existing frame data structure
  };

  return NextResponse.json(responseBody);
}

// Optional: Handle OPTIONS request for CORS if needed
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Allow': 'GET, OPTIONS',
    },
  });
}
