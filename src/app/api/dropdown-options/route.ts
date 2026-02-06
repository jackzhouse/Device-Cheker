import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import DropdownOption from '@/models/DropdownOption';

// GET /api/dropdown-options - Get dropdown options by field
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const searchParams = request.nextUrl.searchParams;
    const fieldName = searchParams.get('fieldName');
    const category = searchParams.get('category') || '';
    const limit = parseInt(searchParams.get('limit') || '50');

    // Validate fieldName
    if (!fieldName) {
      return NextResponse.json(
        { success: false, error: 'Field name is required' },
        { status: 400 }
      );
    }

    // Build query
    const query: any = { fieldName };

    if (category) {
      query.category = category;
    }

    // Execute query
    const options = await DropdownOption.find(query)
      .sort({ usageCount: -1, value: 1 })
      .limit(limit)
      .select('value usageCount category')
      .lean();

    return NextResponse.json({
      success: true,
      data: options,
    });
  } catch (error: any) {
    console.error('Error fetching dropdown options:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch dropdown options' },
      { status: 500 }
    );
  }
}

// POST /api/dropdown-options/save - Save new dropdown option
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const { fieldName, value, category } = body;

    // Validation
    if (!fieldName || !value) {
      return NextResponse.json(
        { success: false, error: 'Field name and value are required' },
        { status: 400 }
      );
    }

    // Convert value to uppercase for easier searching
    const normalizedValue = value.trim().toUpperCase();
    const normalizedCategory = category ? category.trim().toUpperCase() : undefined;

    // Find or create option (case-insensitive)
    const option = await DropdownOption.findOneAndUpdate(
      { fieldName, value: normalizedValue },
      {
        $inc: { usageCount: 1 },
        $set: { 
          lastUsedAt: new Date(),
          ...(normalizedCategory && { category: normalizedCategory })
        },
      },
      { upsert: true, new: true }
    ).lean();

    return NextResponse.json(
      {
        success: true,
        data: option,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error saving dropdown option:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to save dropdown option' },
      { status: 500 }
    );
  }
}