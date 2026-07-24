import { NextResponse } from 'next/server';
import { getExternalBrowserAuthConfig } from '@/lib/auth/config';

export async function GET() {
  try {
    const config = await getExternalBrowserAuthConfig();
    return NextResponse.json({ success: true, data: config });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Konfigurasi auth external tidak tersedia' },
      { status: 500 }
    );
  }
}
