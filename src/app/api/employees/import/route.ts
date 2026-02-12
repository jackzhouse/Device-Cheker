import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Employee from '@/models/Employee';
import DropdownOption from '@/models/DropdownOption';
import * as xlsx from 'xlsx';

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided' },
        { status: 400 }
      );
    }

    // Read file as buffer
    const buffer = Buffer.from(await file.arrayBuffer());
    
    // Parse Excel
    const workbook = xlsx.read(buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const jsonData = xlsx.utils.sheet_to_json(worksheet, { raw: false });

    if (!jsonData || jsonData.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No data found in Excel file' },
        { status: 400 }
      );
    }

    // Process rows
    const results = {
      success: [] as any[],
      failed: [] as any[],
      warnings: [] as any[],
    };

    const positionSet = new Set<string>();
    const departmentSet = new Set<string>();

    for (let i = 0; i < jsonData.length; i++) {
      const row = jsonData[i] as any;
      const rowNum = i + 2; // Excel row number (header is row 1)

      try {
        // Map Indonesian headers to fields
        const namaLengkap = row['Nama Lengkap'];
        const bagian = row['Bagian'];
        const departemen = row['Departemen/Divisi'];
        const nomorIndukKaryawan = row['Nomor Induk Karyawan (NIK Karyawan)'];

        // Validation
        if (!namaLengkap || namaLengkap.trim() === '') {
          results.failed.push({
            row: rowNum,
            error: 'Nama Lengkap is required',
            data: row,
          });
          continue;
        }

        if (!bagian || bagian.trim() === '') {
          results.failed.push({
            row: rowNum,
            error: 'Bagian is required',
            data: row,
          });
          continue;
        }

        // Parse full name
        const nameParts = namaLengkap.trim().split(/\s+/);
        let firstName: string;
        let lastName: string = '';

        if (nameParts.length === 1) {
          // Single word name
          firstName = nameParts[0];
          lastName = '';
        } else {
          // First word = firstName, rest = lastName
          firstName = nameParts[0];
          lastName = nameParts.slice(1).join(' ');
        }

        // Auto-generate employee ID if not provided
        let employeeId: string;
        if (nomorIndukKaryawan && nomorIndukKaryawan.trim()) {
          employeeId = nomorIndukKaryawan.trim().toUpperCase();
          
          // Check if employee ID already exists
          const existingEmployee = await Employee.findOne({ employeeId });
          if (existingEmployee) {
            results.failed.push({
              row: rowNum,
              error: `Employee ID "${employeeId}" already exists`,
              data: row,
            });
            continue;
          }
        } else {
          // Auto-generate: EMP + timestamp + random
          const timestamp = Date.now().toString().slice(-6);
          const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
          employeeId = `EMP${timestamp}${random}`;
        }

        // Create employee
        const employee = await Employee.create({
          employeeId,
          firstName,
          lastName,
          position: bagian.trim(),
          department: departemen ? departemen.trim() : undefined,
          status: 'Active',
        });

        results.success.push({
          row: rowNum,
          employeeId: employee.employeeId,
          name: employee.fullName,
        });

        // Collect positions and departments for dropdown options
        positionSet.add(bagian.trim());
        if (departemen && departemen.trim()) {
          departmentSet.add(departemen.trim());
        }

      } catch (error: any) {
        results.failed.push({
          row: rowNum,
          error: error.message || 'Failed to process row',
          data: row,
        });
      }
    }

    // Save new dropdown options in background
    const saveDropdownOptions = async () => {
      for (const position of positionSet) {
        try {
          const existing = await DropdownOption.findOne({ fieldName: 'position', value: position });
          if (!existing) {
            await DropdownOption.create({ fieldName: 'position', value: position });
          }
        } catch (err) {
          console.error('Error saving position option:', err);
        }
      }

      for (const department of departmentSet) {
        try {
          const existing = await DropdownOption.findOne({ fieldName: 'department', value: department });
          if (!existing) {
            await DropdownOption.create({ fieldName: 'department', value: department });
          }
        } catch (err) {
          console.error('Error saving department option:', err);
        }
      }
    };

    saveDropdownOptions();

    return NextResponse.json({
      success: true,
      results: {
        total: jsonData.length,
        imported: results.success.length,
        failed: results.failed.length,
        successData: results.success,
        failedData: results.failed,
      },
    });

  } catch (error: any) {
    console.error('Import error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to import employees' },
      { status: 500 }
    );
  }
}