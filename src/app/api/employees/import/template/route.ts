import { NextResponse } from 'next/server';
import * as xlsx from 'xlsx';

export async function GET() {
  try {
    // Create template data with Indonesian headers
    const templateData = [
      {
        'Nama Lengkap': 'John Doe',
        'Bagian': 'Software Engineer',
        'Departemen/Divisi': 'IT',
        'Nomor Induk Karyawan': '19-0010',
      },
      {
        'Nama Lengkap': 'Maria Carmen Rodriguez',
        'Bagian': 'Marketing Manager',
        'Departemen/Divisi': 'Marketing',
        'Nomor Induk Karyawan': '19-0011',
      },
      {
        'Nama Lengkap': 'Budi Santoso',
        'Bagian': 'Staff',
        'Departemen/Divisi': 'Operations',
        'Nomor Induk Karyawan': '',
      },
      {
        'Nama Lengkap': 'Cher',
        'Bagian': 'Artist',
        'Departemen/Divisi': 'Creative',
        'Nomor Induk Karyawan': '',
      },
    ];

    // Create workbook and worksheet
    const worksheet = xlsx.utils.json_to_sheet(templateData);

    // Set column widths
    const colWidths = [
      { wch: 30 }, // Nama Lengkap
      { wch: 25 }, // Bagian
      { wch: 25 }, // Departemen/Divisi
      { wch: 20 }, // Nomor Induk Karyawan
    ];
    worksheet['!cols'] = colWidths;

    // Style header row (make bold)
    const headerRange = xlsx.utils.decode_range(worksheet['!ref'] || 'A1:D1');
    for (let col = headerRange.s.c; col <= headerRange.e.c; col++) {
      const cellAddress = xlsx.utils.encode_cell({ r: 0, c: col });
      if (worksheet[cellAddress]) {
        worksheet[cellAddress].s = {
          font: { bold: true },
          fill: { fgColor: { rgb: 'E0E0E0' } },
          alignment: { horizontal: 'center', vertical: 'center' },
        };
      }
    }

    const workbook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(workbook, worksheet, 'Template');

    // Generate Excel buffer
    const buffer = xlsx.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    // Return file response
    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': 'attachment; filename="template_import_karyawan.xlsx"',
      },
    });
  } catch (error: any) {
    console.error('Template generation error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to generate template' },
      { status: 500 }
    );
  }
}