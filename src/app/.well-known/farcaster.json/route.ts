import { NextResponse } from "next/server";
import { PROJECT_TITLE } from "~/lib/constants"; // Assuming constants are in src/lib

const appUrl = process.env.NEXT_PUBLIC_URL;
const name = PROJECT_TITLE; // Use project title for the frame name

export async function GET() {
  // The specific account association data provided
  const accountAssociation = {
    header:
      "eyJmaWQiOjg2OTk5OSwidHlwZSI6ImN1c3RvZHkiLCJrZXkiOiIweDc2ZDUwQjBFMTQ3OWE5QmEyYkQ5MzVGMUU5YTI3QzBjNjQ5QzhDMTIifQ",
    payload: "eyJkb21haW4iOiJoZWxsbm9ldGgta2V5ZmxpY2sudmVyY2VsLmFwcCJ9",
    signature:
      "MHhhNGM4MDNiOTkzNzJmYjQwNDE4MjZhMjMzYjk2ZDg4YWE3NWIwOTQ1MTM4OWQ3YjJiM2NhNzVhZDRlYzg2MmU5NzEzZWMyMThmMGJiMGI3MjkwNzE2YzYzMDllZDMxYjEwZDgyMzk1YTBhODQ3MDczZDNiNDlkZTBiOWMyM2M0YTFj",
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
