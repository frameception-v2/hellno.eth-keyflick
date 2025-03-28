import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    name: 'keyflick',
    description: 'Generate disposable crypto keys instantly for testing.',
    icon: 'key', // Consider updating this if you have a specific icon
    accountAssociation: {
      header: "eyJmaWQiOiA4Njk5OTksICJ0eXBlIjogImN1c3RvZHkiLCAia2V5IjogIjB4N0Q0MDBGRDFGNTkyYkI0RkNkNmEzNjNCZkQyMDBBNDNEMTY3MDRlNyJ9",
      payload: "eyJkb21haW4iOiAiaGVsbG5vZXRoLWtleWZsaWNrLnZlcmNlbC5hcHAifQ",
      signature: "9pXe9pq72FdyfmV82IRMa_mrx3551rBoklHYJS7Z2PMn2CXLGrKzuEPeW2T9JyyotpGB6LgVBAH9Itm1IJr6QBs"
    },
    // Optional: Add other relevant fields if needed
    // "action": {
    //   "type": "post",
    //   "url": "https://your-action-handler-url.com/api/action"
    // }
  });
}
