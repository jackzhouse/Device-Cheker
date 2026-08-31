import jsPDF from 'jspdf';
import * as XLSX from 'xlsx';
import { DeviceCheck } from '@/lib/services/device-checks.service';
import { getTKILogoDataUrl } from './logo';

// ─── Color constants ───────────────────────────────────────────────────────────
const C = {
    primaryDark: [44, 62, 80] as [number, number, number],
    blue: [52, 152, 219] as [number, number, number],
    green: [39, 174, 96] as [number, number, number],
    orange: [230, 126, 34] as [number, number, number],
    yellow: [241, 196, 15] as [number, number, number],
    lightGray: [236, 240, 241] as [number, number, number],
    midGray: [189, 195, 199] as [number, number, number],
    darkGray: [127, 140, 141] as [number, number, number],
    white: [255, 255, 255] as [number, number, number],
    black: [0, 0, 0] as [number, number, number],
    red: [231, 76, 60] as [number, number, number],
};

// ─── jsPDF helper proxies that work with tuple types ─────────────────────────
function fill(doc: jsPDF, c: [number, number, number]) { doc.setFillColor(c[0], c[1], c[2]); }
function txt(doc: jsPDF, c: [number, number, number]) { doc.setTextColor(c[0], c[1], c[2]); }
function drw(doc: jsPDF, c: [number, number, number]) { doc.setDrawColor(c[0], c[1], c[2]); }

function statusColor(s: string): [number, number, number] {
    switch (s) {
        case 'Suitable': return C.green;
        case 'Limited Suitability': return C.yellow;
        case 'Needs Repair': return C.orange;
        case 'Unsuitable': return C.red;
        default: return C.darkGray;
    }
}

function fmtDate(d: string) {
    return new Date(d).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
}

function formatApplicationList(
    items: Array<{ applicationName: string; license: string; notes?: string }> = []
) {
    return items
        .map(item => [item.applicationName, item.license, item.notes].filter(Boolean).join(' — '))
        .join('\n');
}

function formatVpnList(
    items: Array<{ vpnName: string; license: string; notes?: string }> = []
) {
    return items
        .map(item => [item.vpnName, item.license, item.notes].filter(Boolean).join(' — '))
        .join('\n');
}

function formatMobileDevices(check: DeviceCheck) {
    return (check.mobileDevices || [])
        .map(device => [device.deviceName, device.macAddress].filter(Boolean).join(' — '))
        .join('\n');
}

// ─── EXCEL EXPORT ─────────────────────────────────────────────────────────────
export function exportReportToExcel(checks: DeviceCheck[]) {
    const rows = checks.map((c, i) => ({
        'No': i + 1,
        'Employee Name': c.employeeSnapshot.fullName,
        'Employee ID': c.employeeSnapshot.employeeId,
        'Position': c.employeeSnapshot.position,
        'Department': c.employeeSnapshot.department || '',
        'Device Type': c.deviceDetail.deviceType,
        'Ownership': c.deviceDetail.ownership,
        'Brand': c.deviceDetail.deviceBrand,
        'Model': c.deviceDetail.deviceModel,
        'Serial Number': c.deviceDetail.serialNumber,
        'OS': `${c.operatingSystem.osType} ${c.operatingSystem.osVersion}`,
        'OS License': c.operatingSystem.osLicense,
        'Regular Update': c.operatingSystem.osRegularUpdate ? 'Yes' : 'No',
        'RAM': c.specification?.ramCapacity || '',
        'Processor': c.specification?.processor || '',
        'Storage': (c.specification?.storage || []).map(s => `${s.type} ${s.size}`).join(', '),
        'Device Suitability': c.deviceCondition.deviceSuitability,
        'Battery': c.deviceCondition.batterySuitability,
        'Keyboard': c.deviceCondition.keyboardCondition,
        'Touchpad': c.deviceCondition.touchpadCondition,
        'Monitor': c.deviceCondition.monitorCondition,
        'WiFi': c.deviceCondition.wifiCondition,
        'Work Applications': formatApplicationList(c.workApplications),
        'Non-Work Applications': formatApplicationList(c.nonWorkApplications),
        'Antivirus': c.security.antivirus.status,
        'Antivirus Details': formatApplicationList(c.security.antivirus.list),
        'VPN': c.security.vpn.status,
        'VPN Details': formatVpnList(c.security.vpn.list),
        'Mobile Devices': formatMobileDevices(c),
        'Password': c.additionalInfo.passwordUsage,
        'Inspector': c.additionalInfo.inspectorPICName || '',
        'Notes': c.additionalInfo.otherNotes || '',
        'Check Date': fmtDate(c.checkDate),
        'Version': `v${c.version}`,
    }));

    const ws = XLSX.utils.json_to_sheet(rows);
    // Auto-size columns
    ws['!cols'] = Object.keys(rows[0] || {}).map(key => ({
        wch: Math.max(key.length, ...rows.map(r => String((r as any)[key]).length)) + 2
    }));

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Last Check Report');
    const now = new Date().toLocaleDateString('id-ID').replace(/\//g, '-');
    XLSX.writeFile(wb, `last-check-report_${now}.xlsx`);
}

// ─── PDF EXPORT ───────────────────────────────────────────────────────────────
export async function exportReportToPDF(checks: DeviceCheck[]) {
    const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
    const pageW = 297, pageH = 210, lm = 10, rm = 10, headerH = 28;

    // ── Draw header ────────────────────────────────────────────────────────────
    const drawHeader = (isFirstPage: boolean) => {
        fill(doc, C.primaryDark);
        doc.rect(0, 0, pageW, isFirstPage ? headerH : 10, 'F');
        txt(doc, C.white);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(isFirstPage ? 14 : 9);
        doc.text(
            isFirstPage ? 'LAST CHECKING REPORT' : 'LAST CHECKING REPORT (continued)',
            lm + (isFirstPage ? 24 : 4),
            isFirstPage ? 12 : 6.5
        );
        if (isFirstPage) {
            try {
                // logo is async loaded before calling – passed separately
            } catch (_) { }
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(8);
            doc.text('Teknologi Kartu Indonesia — Device Checking System', lm + 24, 18);
            const gen = `Generated: ${new Date().toLocaleDateString('id-ID')} ${new Date().toLocaleTimeString('id-ID')}`;
            doc.text(gen, pageW - rm, 18, { align: 'right' });
            doc.text(`Total Records: ${checks.length}`, pageW - rm, 12, { align: 'right' });
        }
    };

    // ── Column definitions ─────────────────────────────────────────────────────
    const cols = [
        { h: 'No', w: 8 },
        { h: 'Employee', w: 38 },
        { h: 'Dept', w: 24 },
        { h: 'Device', w: 40 },
        { h: 'OS', w: 26 },
        { h: 'Own', w: 16 },
        { h: 'Status', w: 28 },
        { h: 'Condition', w: 35 },
        { h: 'Notes', w: 25 },
        { h: 'Mobile Devices', w: 20 },
        { h: 'Check Date', w: 20 },
        { h: 'v', w: 7 },
    ];
    const rowH = 10, cellPad = 2;

    const drawColHeaders = (startY: number) => {
        let x = lm;
        fill(doc, C.blue);
        txt(doc, C.white);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(7);
        cols.forEach(col => {
            fill(doc, C.blue);
            doc.rect(x, startY, col.w, rowH, 'F');
            doc.text(col.h, x + cellPad, startY + 5.5);
            x += col.w;
        });
        return startY + rowH;
    };

    const drawFooter = (pageNum: number) => {
        fill(doc, C.lightGray);
        doc.rect(0, pageH - 10, pageW, 10, 'F');
        txt(doc, C.darkGray);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7);
        doc.text('Teknologi Kartu Indonesia — Device Checking System', lm, pageH - 4);
        doc.text(`Page ${pageNum}`, pageW / 2, pageH - 4, { align: 'center' });
    };

    // ── Load logo and draw first page header ───────────────────────────────────
    const logoUrl = await getTKILogoDataUrl();
    drawHeader(true);
    doc.addImage(logoUrl, 'PNG', lm, 6, 20, 10);

    let yRow = drawColHeaders(headerH + 4);
    let page = 1;

    // ── Data rows ─────────────────────────────────────────────────────────────
    checks.forEach((c, i) => {
        if (yRow + rowH > pageH - 12) {
            drawFooter(page);
            doc.addPage();
            page++;
            drawHeader(false);
            yRow = drawColHeaders(11);
        }

        // Alternating row bg
        fill(doc, i % 2 === 0 ? C.white : C.lightGray);
        let x = lm;
        cols.forEach(col => { doc.rect(x, yRow, col.w, rowH, 'F'); x += col.w; });

        // Grid
        drw(doc, C.midGray);
        x = lm;
        cols.forEach(col => { doc.rect(x, yRow, col.w, rowH, 'S'); x += col.w; });

        const sc = statusColor(c.deviceCondition.deviceSuitability);

        const conditionLine = [
            `Bat:${c.deviceCondition.batterySuitability}`,
            `KB:${c.deviceCondition.keyboardCondition}`,
            `TP:${c.deviceCondition.touchpadCondition}`,
            `Mon:${c.deviceCondition.monitorCondition}`,
            `WiFi:${c.deviceCondition.wifiCondition}`,
        ].join('  ');
        const notesLine = c.additionalInfo?.otherNotes || '';

        const cells: Array<{ v: string; sub?: string; twoLine: boolean; color?: [number, number, number] }> = [
            { v: String(i + 1), twoLine: false },
            { v: c.employeeSnapshot.fullName, sub: c.employeeSnapshot.employeeId, twoLine: true },
            { v: c.employeeSnapshot.department || '-', twoLine: false },
            {
                v: `${c.deviceDetail.deviceBrand} ${c.deviceDetail.deviceModel}`,
                sub: `${c.deviceDetail.deviceType} · ${c.deviceDetail.serialNumber}`, twoLine: true
            },
            { v: c.operatingSystem.osType, sub: c.operatingSystem.osVersion, twoLine: true },
            { v: c.deviceDetail.ownership, twoLine: false },
            { v: c.deviceCondition.deviceSuitability, color: sc, twoLine: false },
            { v: conditionLine, twoLine: false }, // Condition (special renderer will use c.deviceCondition)
            { v: notesLine, twoLine: false },     // Notes
            { v: formatMobileDevices(c), twoLine: false }, // Mobile device check
            { v: fmtDate(c.checkDate), twoLine: false },
            { v: `v${c.version}`, twoLine: false },
        ];

        x = lm;
        cells.forEach((cell, ci) => {
            const col = cols[ci];
            const maxW = col.w - cellPad * 2;

            // Special renderer for the Condition column (index 7)
            if (ci === 7) {
                const cond = c.deviceCondition;

                // 2 condition lines that fit within 10mm row height better
                const line1 = `Bat:${cond.batterySuitability}  KB:${cond.keyboardCondition}`;
                const line2 = `TP:${cond.touchpadCondition}  Mon:${cond.monitorCondition}`;
                const line3 = `WiFi:${cond.wifiCondition}`;

                doc.setFont('helvetica', 'normal');
                doc.setFontSize(5.5);
                txt(doc, C.black);
                doc.text(doc.splitTextToSize(line1, maxW)[0] || '', x + cellPad, yRow + 2.5);
                doc.text(doc.splitTextToSize(line2, maxW)[0] || '', x + cellPad, yRow + 5.0);
                doc.text(doc.splitTextToSize(line3, maxW)[0] || '', x + cellPad, yRow + 7.5);

                x += col.w;
                return;
            }

            // Special renderer for Notes and Mobile Devices columns
            if (ci === 8) {
                if (notesLine) {
                    doc.setFontSize(5.5);
                    txt(doc, C.darkGray);
                    doc.setFont('helvetica', 'italic');
                    const splitNotes = doc.splitTextToSize(notesLine, maxW);
                    // Show up to 3 lines of notes
                    splitNotes.slice(0, 3).forEach((line: string, index: number) => {
                        doc.text(line, x + cellPad, yRow + 3.0 + (index * 2.5));
                    });
                    doc.setFont('helvetica', 'normal');
                }
                x += col.w;
                return;
            }

            if (ci === 9) {
                const mobileLine = cell.v;
                if (mobileLine) {
                    doc.setFontSize(5.5);
                    txt(doc, C.darkGray);
                    doc.setFont('helvetica', 'normal');
                    doc.splitTextToSize(mobileLine, maxW).slice(0, 3).forEach((line: string, index: number) => {
                        doc.text(line, x + cellPad, yRow + 3.0 + (index * 2.5));
                    });
                }
                x += col.w;
                return;
            }

            if (cell.color) {
                txt(doc, cell.color);
                doc.setFont('helvetica', 'bold');
            } else {
                txt(doc, C.black);
                doc.setFont('helvetica', 'normal');
            }

            if (cell.twoLine && cell.sub !== undefined) {
                doc.setFontSize(6.5);
                const l1 = doc.splitTextToSize(cell.v, maxW)[0] || '';
                doc.text(l1, x + cellPad, yRow + 3.8);
                doc.setFontSize(5.5);
                txt(doc, C.darkGray);
                doc.setFont('helvetica', 'normal');
                const l2 = doc.splitTextToSize(cell.sub, maxW)[0] || '';
                doc.text(l2, x + cellPad, yRow + 7);
                doc.setFontSize(6.5);
            } else {
                doc.setFontSize(6.5);
                const line = doc.splitTextToSize(cell.v, maxW)[0] || '';
                doc.text(line, x + cellPad, yRow + 5.2);
            }

            x += col.w;
        });

        yRow += rowH;
    });

    drawFooter(page);
    const now = new Date().toLocaleDateString('id-ID').replace(/\//g, '-');
    doc.save(`last-check-report_${now}.pdf`);
}
