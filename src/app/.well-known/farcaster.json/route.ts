import { NextResponse } from 'next/server';

// Route handler for Farcaster domain verification
// See: https://docs.farcaster.xyz/reference/app-ui-api/domain-verification

export async function GET() {
  // Return the domain association data required by Farcaster
  return NextResponse.json({
    // You might include other metadata here if needed by other services,
    // but for Farcaster domain verification, only 'accountAssociation' is strictly required.
    // Example other fields (optional):
    // name: "KeyFlick Domain Verification",
    // description: "Farcaster verification endpoint for KeyFlick",

    // The required field for Farcaster domain verification
    accountAssociation: {
      header: "eyJmaWQiOiA4Njk5OTksICJ0eXBlIjogImN1c3RvZHkiLCAia2V5IjogIjB4N0Q0MDBGRDFGNTkyYkI0RkNkNmEzNjNCZkQyMDBBNDNEMTY3MDRlNyJ9",
      payload: "eyJkb21haW4iOiAiaGVsbG5vZXRoLWtleWZsaWNrLnZlcmNlbC5hcHAifQ",
      signature: "9pXe9pq72FdyfmV82IRMa_mrx3551rBoklHYJS7Z2PMn2CXLGrKzuEPeW2T9JyyotpGB6LgVBAH9Itm1IJr6QBs"
    }
  });
}

// Optional: Handle other HTTP methods if necessary, though typically only GET is needed.
// export async function POST(request: Request) { ... }
// export async function PUT(request: Request) { ... }
// export async function DELETE(request: Request) { ... }

