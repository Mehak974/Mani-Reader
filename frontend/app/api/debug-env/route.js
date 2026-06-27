import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    BACKEND_URL: process.env.BACKEND_URL || null,
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || null,
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL || null,
  });
}
