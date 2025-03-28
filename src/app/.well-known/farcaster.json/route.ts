import { NextResponse } from 'next/server';
import { PROJECT_TITLE } from '~/lib/constants'; // Assuming constants are in src/lib

// Define the application URL based on the domain in accountAssociation or environment variable
// Using the domain from the provided payload as a fallback
const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://hellnoeth-keyflick.vercel.app';
const name = PROJECT_TITLE; // Use project title for the frame name

export async function GET() {
  // The specific account association data provided
  const accountAssociation = {
    header: 'eyJmaWQiOiA4Njk5OTksICJ0eXBlIjogImN1c3RvZHkiLCAia2V5IjogIjB4NzZkNTBCMEUxNDc5YTlCYTJiRDkzNUYxRTlhMjdDMGM2NDlDOEMxMiJ9',
    payload: 'eyJkb21haW4iOiAiaGVsbG5vZXRoLWtleWZsaWNrLnZlcmNlbC5hcHAifQ',
    signature: 'pKDeGOWamw3zHsvkE84XKnjFcjv5lQgs49-WvDC4AA1Bm5gEkZj3Oq9MfW4r3LsDUrQ5FzJcag0GNa_9j0DkEBw'
  };

  // The frame configuration details
  const frame = {
    // Required keys
    version: "1",
    name: name,
    iconUrl: `${appUrl}/icon.png`, // Assuming icon.png is in the public root
    homeUrl: appUrl,
    imageUrl: `${appUrl}/og.png`, // Assuming og.png is generated or in public root
    buttonTitle: "Open", // Default button title
    webhookUrl: `${appUrl}/api/webhook`, // Assuming a webhook handler exists at this path

    // Optional keys
    splashImageUrl: `${appUrl}/splash.png`, // Assuming splash.png is in the public root
    splashBackgroundColor: "#555555", // Default splash background color
  };

  // Return the combined JSON response
  return NextResponse.json({
    accountAssociation: accountAssociation,
    frame: frame,
  });
}
