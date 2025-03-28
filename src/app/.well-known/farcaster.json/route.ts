import { NextResponse } from 'next/server';
import { PROJECT_TITLE } from '~/lib/constants'; // Assuming constants are accessible

// Derive appUrl from the domain in the accountAssociation payload or use an environment variable
// Using the domain from the payload for consistency in this example.
const appUrl = 'https://hellnoeth-keyflick.vercel.app';
const name = PROJECT_TITLE; // Use the project title from constants

export async function GET() {
  const accountAssociation = {
    header: 'eyJmaWQiOiA4Njk5OTksICJ0eXBlIjogImN1c3RvZHkiLCAia2V5IjogIjB4NzZkNTBCMEUxNDc5YTlCYTJiRDkzNUYxRTlhMjdDMGM2NDlDOEMxMiJ9',
    payload: 'eyJkb21haW4iOiAiaGVsbG5vZXRoLWtleWZsaWNrLnZlcmNlbC5hcHAifQ',
    signature: 'pKDeGOWamw3zHsvkE84XKnjFcjv5lQgs49-WvDC4AA1Bm5gEkZj3Oq9MfW4r3LsDUrQ5FzJcag0GNa_9j0DkEBw'
  };

  const frame = {
    // Required keys
    version: "1",
    name: name,
    iconUrl: `${appUrl}/icon.png`, // Assuming icon.png exists at the root of public
    homeUrl: appUrl,
    imageUrl: `${appUrl}/og.png`, // Use the existing OpenGraph image
    buttonTitle: "Open", // Default button title
    webhookUrl: `${appUrl}/api/webhook`, // Assuming a webhook API route exists

    // Optional keys
    splashImageUrl: `${appUrl}/splash.png`, // Assuming splash.png exists at the root of public
    splashBackgroundColor: "#555555", // Default splash background color
  };

  return NextResponse.json({
    accountAssociation: accountAssociation,
    frame: frame,
  });
}
