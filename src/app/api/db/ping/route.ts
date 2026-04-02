import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';

export async function GET() {
  try {
    const mongoose = await connectDB();
    const db = mongoose.connection.db;

    if (!db) {
      throw new Error('MongoDB database handle is not available');
    }

    const pingResult = await db.admin().ping();
    const collections = await db
      .listCollections({}, { nameOnly: true })
      .toArray();

    return NextResponse.json(
      {
        ok: true,
        dbName: db.databaseName,
        ping: pingResult,
        collections: collections.map((c) => c.name),
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('❌ DB ping failed:', error?.message || error);
    return NextResponse.json(
      {
        ok: false,
        error: error?.message || 'Unknown error',
      },
      { status: 500 }
    );
  }
}
