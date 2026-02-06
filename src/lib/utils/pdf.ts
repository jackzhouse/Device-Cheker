import jsPDF from 'jspdf';
import { DeviceCheck } from '@/lib/services/device-checks.service';
import { getTKILogoDataUrl } from './logo';

// Color constants (as readonly tuples for type safety)
const COLORS = {
  primaryDark: [44, 62, 80] as const,
  secondaryBlue: [52, 152, 219] as const,
  accentGreen: [39, 174, 96] as const,
  lightGray: [236, 240, 241] as const,
  darkGray: [127, 140, 141] as const,
  white: [255, 255, 255] as const,
  black: [0, 0, 0] as const,
  red: [231, 76, 60] as const,
};

/**
 * Get TKI Logo as base64 data URL
 * Loads the PNG file from public directory and converts to base64
 */
async function getTKILogo(): Promise<string> {
  return await getTKILogoDataUrl();
}

/**
 * Helper function to draw a section header
 */
function drawSectionHeader(doc: jsPDF, title: string, yPos: number, leftMargin: number, pageWidth: number) {
  const headerHeight = 8;
  doc.setFillColor(COLORS.secondaryBlue[0], COLORS.secondaryBlue[1], COLORS.secondaryBlue[2]);
  doc.rect(leftMargin, yPos, pageWidth - (leftMargin * 2), headerHeight, 'F');
  doc.setTextColor(COLORS.white[0], COLORS.white[1], COLORS.white[2]);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text(title.toUpperCase(), leftMargin + 5, yPos + 5.5);
  return yPos + headerHeight;
}

/**
 * Helper function to draw a colored status circle
 */
function drawStatusCircle(doc: jsPDF, x: number, y: number, isGood: boolean) {
  const radius = 2;
  const color = isGood ? COLORS.accentGreen : COLORS.red;
  doc.setFillColor(color[0], color[1], color[2]);
  doc.circle(x, y, radius, 'F');
}

/**
 * Helper function to draw a label-value pair
 */
function drawLabelValue(doc: jsPDF, label: string, value: string, x: number, y: number, valueColor?: readonly number[]) {
  doc.setTextColor(COLORS.black[0], COLORS.black[1], COLORS.black[2]);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text(label + ':', x, y);
  
  const valColor = valueColor || COLORS.darkGray;
  doc.setTextColor(valColor[0], valColor[1], valColor[2]);
  doc.setFont('helvetica', 'normal');
  doc.text(value, x + 45, y);
}

/**
 * Generate a PDF for a single device check with professional design
 */
export async function generateDeviceCheckPDF(check: DeviceCheck) {
  const doc = new jsPDF();
  const pageWidth = 210; // A4 width in mm
  const pageHeight = 297; // A4 height in mm
  const leftMargin = 20;
  const rightMargin = 20;
  const topMargin = 15;
  const bottomMargin = 20;
  const contentWidth = pageWidth - leftMargin - rightMargin;

  // ============ HEADER SECTION (70mm height) ============
  const headerHeight = 70;
  
  // Dark background
  doc.setFillColor(...COLORS.primaryDark);
  doc.rect(0, 0, pageWidth, headerHeight, 'F');

  // TKI Logo (84x40 PNG)
  const logoUrl = await getTKILogo();
  doc.addImage(logoUrl, 'PNG', leftMargin, 15, 25, 12);

  // Company Name (after logo)
  doc.setTextColor(...COLORS.white);
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text('Teknologi Kartu Indonesia', leftMargin + 30, 25);
  
  // Subtitle
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text('Device Checking System', leftMargin + 30, 32);

  // Report Title
  doc.setFontSize(28);
  doc.setFont('helvetica', 'bold');
  doc.text('DEVICE CHECK REPORT', leftMargin + 30, 48);

  // IT Department subtitle
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text('IT Department', leftMargin + 30, 56);

  // Version and Date (under IT Department, same line)
  const versionText = `Version: v${check.version || 1}`;
  const dateText = new Date(check.checkDate).toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
  
  doc.setTextColor(...COLORS.white);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text(`${versionText} • ${dateText}`, leftMargin + 30, 64);

  // ============ CONTENT SECTIONS ============
  let yPos = topMargin + headerHeight + 10;

  // 1. Employee Information
  yPos = drawSectionHeader(doc, 'Employee Information', yPos, leftMargin, pageWidth);
  yPos += 7;
  
  drawLabelValue(doc, 'Name', check.employeeSnapshot.fullName, leftMargin, yPos);
  yPos += 7;
  
  drawLabelValue(doc, 'Position', check.employeeSnapshot.position, leftMargin, yPos);
  yPos += 7;
  
  if (check.employeeSnapshot.department) {
    drawLabelValue(doc, 'Department', check.employeeSnapshot.department, leftMargin, yPos);
    yPos += 7;
  }
  
  yPos += 8; // Section spacing

  // 2. Device Information
  yPos = drawSectionHeader(doc, 'Device Information', yPos, leftMargin, pageWidth);
  yPos += 7;
  
  drawLabelValue(doc, 'Device Type', check.deviceDetail.deviceType, leftMargin, yPos);
  yPos += 7;
  
  drawLabelValue(doc, 'Brand', check.deviceDetail.deviceBrand, leftMargin, yPos);
  yPos += 7;
  
  drawLabelValue(doc, 'Model', check.deviceDetail.deviceModel, leftMargin, yPos);
  yPos += 7;
  
  drawLabelValue(doc, 'Serial Number', check.deviceDetail.serialNumber, leftMargin, yPos);
  yPos += 7;

  // Ownership (text with color)
  doc.setTextColor(...COLORS.black);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('Ownership:', leftMargin, yPos);
  
  const ownershipColor = check.deviceDetail.ownership === 'Company' ? COLORS.accentGreen : COLORS.darkGray;
  doc.setTextColor(ownershipColor[0], ownershipColor[1], ownershipColor[2]);
  doc.setFont('helvetica', 'normal');
  doc.text(check.deviceDetail.ownership, leftMargin + 45, yPos);
  
  yPos += 10;

  // 3. Operating System
  yPos = drawSectionHeader(doc, 'Operating System', yPos, leftMargin, pageWidth);
  yPos += 7;
  
  drawLabelValue(doc, 'OS Type', check.operatingSystem.osType, leftMargin, yPos);
  yPos += 7;
  
  drawLabelValue(doc, 'Version', check.operatingSystem.osVersion, leftMargin, yPos);
  yPos += 7;
  
  drawLabelValue(doc, 'License', check.operatingSystem.osLicense, leftMargin, yPos);
  yPos += 7;

  // Updates Status (text with color)
  doc.setTextColor(...COLORS.black);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('Regular Updates:', leftMargin, yPos);
  
  const updatesColor = check.operatingSystem.osRegularUpdate ? COLORS.accentGreen : COLORS.red;
  const updatesText = check.operatingSystem.osRegularUpdate ? 'Yes' : 'No';
  doc.setTextColor(updatesColor[0], updatesColor[1], updatesColor[2]);
  doc.setFont('helvetica', 'normal');
  doc.text(updatesText, leftMargin + 45, yPos);
  
  yPos += 10;

  // 4. Specifications & Device Condition (Side by Side)
  const columnWidth = (contentWidth - 10) / 2;
  const leftColumnX = leftMargin;
  const rightColumnX = leftMargin + columnWidth + 10;

  // Specifications (Left Column)
  yPos = drawSectionHeader(doc, 'Specifications', yPos, leftMargin, pageWidth);
  yPos += 7;

  if (check.specification) {
    if (check.specification.ramCapacity) {
      drawLabelValue(doc, 'RAM', check.specification.ramCapacity, leftColumnX, yPos);
      yPos += 7;
    }
    if (check.specification.memoryType) {
      drawLabelValue(doc, 'Memory Type', check.specification.memoryType, leftColumnX, yPos);
      yPos += 7;
    }
    if (check.specification.memoryCapacity) {
      drawLabelValue(doc, 'Storage', check.specification.memoryCapacity, leftColumnX, yPos);
      yPos += 7;
    }
    if (check.specification.processor) {
      drawLabelValue(doc, 'Processor', check.specification.processor, leftColumnX, yPos);
      yPos += 7;
    }
  }

  // Overall Status (Right Column - Top)
  doc.setTextColor(...COLORS.black);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('Overall Status:', rightColumnX, yPos - 21);

  const statusColor: readonly number[] = check.deviceCondition.deviceSuitability === 'Suitable' 
    ? COLORS.accentGreen 
    : check.deviceCondition.deviceSuitability === 'Unsuitable' 
    ? COLORS.red 
    : COLORS.secondaryBlue;
  
  doc.setTextColor(statusColor[0], statusColor[1], statusColor[2]);
  doc.setFont('helvetica', 'normal');
  doc.text(check.deviceCondition.deviceSuitability, rightColumnX + 40, yPos - 21);

  // Device Condition (Right Column)
  doc.setTextColor(...COLORS.black);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('Device Condition:', rightColumnX, yPos);

  yPos += 7;
  const conditions = [
    { label: 'Battery', value: check.deviceCondition.batterySuitability },
    { label: 'Keyboard', value: check.deviceCondition.keyboardCondition },
    { label: 'Touchpad', value: check.deviceCondition.touchpadCondition },
    { label: 'Monitor', value: check.deviceCondition.monitorCondition },
    { label: 'Wi-Fi', value: check.deviceCondition.wifiCondition },
  ];

  conditions.forEach((condition) => {
    const isGood = condition.value.toLowerCase().includes('good') || condition.value.toLowerCase().includes('suitable');
    drawStatusCircle(doc, rightColumnX, yPos + 1, isGood);
    
    doc.setTextColor(...COLORS.darkGray);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`${condition.label}: ${condition.value}`, rightColumnX + 5, yPos + 3);
    yPos += 7;
  });

  yPos += 8;

  // 5. Work Applications
  if (check.workApplications && check.workApplications.length > 0) {
    yPos = drawSectionHeader(doc, 'Work Applications', yPos, leftMargin, pageWidth);
    yPos += 7;

    check.workApplications.forEach((app) => {
      const licenseColor = app.license === 'Original' ? COLORS.accentGreen : 
                          app.license === 'Pirated' ? COLORS.red : COLORS.darkGray;
      
      doc.setTextColor(...COLORS.black);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text(`• ${app.applicationName}`, leftMargin, yPos);
      
      // License text (colored)
      doc.setTextColor(licenseColor[0], licenseColor[1], licenseColor[2]);
      doc.setFont('helvetica', 'normal');
      doc.text(`License: ${app.license}`, leftMargin + 10, yPos + 5);
      yPos += 10;
      
      if (app.notes) {
        doc.setTextColor(...COLORS.darkGray);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.text(`  Note: ${app.notes}`, leftMargin, yPos);
        yPos += 5;
      }
    });
    yPos += 8;
  }

  // 6. Non-Work Applications
  if (check.nonWorkApplications && check.nonWorkApplications.length > 0) {
    yPos = drawSectionHeader(doc, 'Non-Work Applications', yPos, leftMargin, pageWidth);
    yPos += 7;

    check.nonWorkApplications.forEach((app) => {
      const licenseColor = app.license === 'Original' ? COLORS.accentGreen : 
                          app.license === 'Pirated' ? COLORS.red : COLORS.darkGray;
      
      doc.setTextColor(...COLORS.black);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text(`• ${app.applicationName}`, leftMargin, yPos);
      
      // License text (colored)
      doc.setTextColor(licenseColor[0], licenseColor[1], licenseColor[2]);
      doc.setFont('helvetica', 'normal');
      doc.text(`License: ${app.license}`, leftMargin + 10, yPos + 5);
      yPos += 10;
      
      if (app.notes) {
        doc.setTextColor(...COLORS.darkGray);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.text(`  Note: ${app.notes}`, leftMargin, yPos);
        yPos += 5;
      }
    });
    yPos += 8;
  }

  // 7. Security
  yPos = drawSectionHeader(doc, 'Security', yPos, leftMargin, pageWidth);
  yPos += 7;

  // Antivirus
  const avStatusColor = check.security.antivirus.status === 'Active' ? COLORS.accentGreen : COLORS.red;
  doc.setTextColor(...COLORS.black);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('Antivirus Status:', leftMargin, yPos);
  
  doc.setTextColor(avStatusColor[0], avStatusColor[1], avStatusColor[2]);
  doc.setFont('helvetica', 'normal');
  doc.text(check.security.antivirus.status, leftMargin + 45, yPos);
  yPos += 10;

  if (check.security.antivirus.list && check.security.antivirus.list.length > 0) {
    check.security.antivirus.list.forEach((antivirus) => {
      doc.setTextColor(...COLORS.darkGray);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.text(`  • ${antivirus.applicationName} (${antivirus.license})`, leftMargin, yPos);
      yPos += 5;
    });
  }
  yPos += 3;

  // VPN
  const vpnStatusColor = check.security.vpn.status === 'Available' ? COLORS.accentGreen : COLORS.red;
  doc.setTextColor(...COLORS.black);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('VPN Status:', leftMargin, yPos);
  
  doc.setTextColor(vpnStatusColor[0], vpnStatusColor[1], vpnStatusColor[2]);
  doc.setFont('helvetica', 'normal');
  doc.text(check.security.vpn.status, leftMargin + 45, yPos);
  yPos += 10;

  if (check.security.vpn.list && check.security.vpn.list.length > 0) {
    check.security.vpn.list.forEach((vpn) => {
      doc.setTextColor(...COLORS.darkGray);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.text(`  • ${vpn.vpnName} (${vpn.license})`, leftMargin, yPos);
      yPos += 5;
    });
  }
  yPos += 8;

  // 8. Additional Information
  yPos = drawSectionHeader(doc, 'Additional Information', yPos, leftMargin, pageWidth);
  yPos += 7;

  drawLabelValue(doc, 'Password Usage', check.additionalInfo.passwordUsage, leftMargin, yPos);
  yPos += 7;

  if (check.additionalInfo.otherNotes) {
    doc.setTextColor(...COLORS.black);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text('Notes:', leftMargin, yPos);
    yPos += 5;
    
    doc.setTextColor(...COLORS.darkGray);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    const splitText = doc.splitTextToSize(check.additionalInfo.otherNotes, contentWidth - 10);
    doc.text(splitText, leftMargin + 10, yPos);
    yPos += splitText.length * 4 + 5;
  }

  if (check.additionalInfo.inspectorPICName) {
    drawLabelValue(doc, 'Inspector', check.additionalInfo.inspectorPICName, leftMargin, yPos);
    yPos += 7;
  }

  // ============ FOOTER SECTION (20mm height) ============
  const footerY = pageHeight - 15;
  doc.setFillColor(...COLORS.lightGray);
  doc.rect(0, pageHeight - 20, pageWidth, 20, 'F');

  doc.setTextColor(...COLORS.darkGray);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  
  const generatedTime = `Generated: ${new Date().toLocaleDateString('id-ID')} ${new Date().toLocaleTimeString('id-ID')}`;
  doc.text(generatedTime, leftMargin, footerY);
  
  doc.text('Teknologi Kartu Indonesia - Device Checking System', pageWidth / 2, footerY, { align: 'center' });
  doc.text('Page 1', pageWidth - rightMargin, footerY, { align: 'right' });

  // Save the PDF
  const fileName = `${check.employeeSnapshot.fullName.replace(/\s+/g, '_')}_v${check.version || 1}_device_check.pdf`;
  doc.save(fileName);
}

/**
 * Generate a PDF for all device checks of an employee
 */
export async function generateEmployeeHistoryPDF(
  employeeData: any,
  checks: Array<DeviceCheck>
) {
  const doc = new jsPDF();
  const pageWidth = 210; // A4 width in mm
  const pageHeight = 297; // A4 height in mm
  const leftMargin = 20;
  const rightMargin = 20;
  const contentWidth = pageWidth - leftMargin - rightMargin;

  let yPos = 20;
  const lineHeight = 8;

  // ============ HEADER SECTION ============
  const headerHeight = 60;
  doc.setFillColor(...COLORS.primaryDark);
  doc.rect(0, 0, pageWidth, headerHeight, 'F');

  // TKI Logo (84x40 PNG)
  const logoUrl2 = await getTKILogo();
  doc.addImage(logoUrl2, 'PNG', leftMargin, 15, 25, 12);

  // Company Name (after logo)
  doc.setTextColor(...COLORS.white);
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('Teknologi Kartu Indonesia', leftMargin + 30, 22);

  // Report Title
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('Employee Device Check History', leftMargin + 30, 40);

  yPos = headerHeight + 10;

  // Employee Information
  yPos = drawSectionHeader(doc, 'Employee Information', yPos, leftMargin, pageWidth);
  yPos += 7;

  drawLabelValue(doc, 'Name', employeeData.fullName, leftMargin, yPos);
  yPos += lineHeight;
  
  drawLabelValue(doc, 'Position', employeeData.position, leftMargin, yPos);
  yPos += lineHeight;
  
  if (employeeData.department) {
    drawLabelValue(doc, 'Department', employeeData.department, leftMargin, yPos);
    yPos += lineHeight;
  }
  
  drawLabelValue(doc, 'Status', employeeData.status, leftMargin, yPos);
  yPos += lineHeight;
  
  drawLabelValue(doc, 'Total Checks', checks.length.toString(), leftMargin, yPos);
  yPos += lineHeight * 2;

  // Summary Statistics
  yPos = drawSectionHeader(doc, 'Summary', yPos, leftMargin, pageWidth);
  yPos += 7;

  const pcCount = checks.filter((c) => c.deviceDetail.deviceType === 'PC').length;
  const laptopCount = checks.filter((c) => c.deviceDetail.deviceType === 'Laptop').length;
  const companyCount = checks.filter((c) => c.deviceDetail.ownership === 'Company').length;
  const personalCount = checks.filter((c) => c.deviceDetail.ownership === 'Personal').length;

  drawLabelValue(doc, 'PC Devices', pcCount.toString(), leftMargin, yPos);
  yPos += lineHeight;
  
  drawLabelValue(doc, 'Laptops', laptopCount.toString(), leftMargin, yPos);
  yPos += lineHeight;
  
  drawLabelValue(doc, 'Company Owned', companyCount.toString(), leftMargin, yPos);
  yPos += lineHeight;
  
  drawLabelValue(doc, 'Personal', personalCount.toString(), leftMargin, yPos);
  yPos += lineHeight * 2;

  // Check History List
  yPos = drawSectionHeader(doc, 'Check History', yPos, leftMargin, pageWidth);
  yPos += lineHeight * 2;

  checks.forEach((check, index) => {
    // Check if we need a new page
    if (yPos > pageHeight - 50) {
      doc.addPage();
      yPos = 20;
    }

    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...COLORS.black);
    doc.text(`Check v${check.version || index + 1} - ${new Date(check.checkDate).toLocaleDateString('id-ID')}`, leftMargin, yPos);
    yPos += lineHeight;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...COLORS.darkGray);
    doc.text(`Device: ${check.deviceDetail.deviceBrand} ${check.deviceDetail.deviceModel} (${check.deviceDetail.deviceType})`, leftMargin, yPos);
    yPos += lineHeight;
    
    doc.text(`Ownership: ${check.deviceDetail.ownership}`, leftMargin, yPos);
    yPos += lineHeight;
    
    doc.text(`Serial Number: ${check.deviceDetail.serialNumber}`, leftMargin, yPos);
    yPos += lineHeight;

    // OS Info
    doc.text(`OS: ${check.operatingSystem.osType} ${check.operatingSystem.osVersion}`, leftMargin, yPos);
    yPos += lineHeight;

    // Overall Status with icon
    const statusColor: readonly number[] = check.deviceCondition.deviceSuitability === 'Suitable' 
      ? COLORS.accentGreen 
      : check.deviceCondition.deviceSuitability === 'Unsuitable' 
      ? COLORS.red 
      : COLORS.secondaryBlue;
    
    const statusIcon = check.deviceCondition.deviceSuitability === 'Suitable' 
      ? '✓' 
      : check.deviceCondition.deviceSuitability === 'Unsuitable' 
      ? '✗' 
      : '⚠';
    
    doc.setTextColor(statusColor[0], statusColor[1], statusColor[2]);
    doc.text(`Overall: ${statusIcon} ${check.deviceCondition.deviceSuitability}`, leftMargin, yPos);
    yPos += lineHeight * 2;

    // Add a separator line
    doc.setDrawColor(200);
    doc.line(leftMargin, yPos, pageWidth - rightMargin, yPos);
    yPos += lineHeight * 2;
  });

  // ============ FOOTER SECTION ============
  const footerY = pageHeight - 15;
  doc.setFillColor(...COLORS.lightGray);
  doc.rect(0, pageHeight - 20, pageWidth, 20, 'F');

  doc.setTextColor(...COLORS.darkGray);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  
  const generatedTime = `Generated: ${new Date().toLocaleDateString('id-ID')} ${new Date().toLocaleTimeString('id-ID')}`;
  doc.text(generatedTime, leftMargin, footerY);
  
  doc.text('Teknologi Kartu Indonesia - Device Checking System', pageWidth / 2, footerY, { align: 'center' });
  doc.text('Page 1', pageWidth - rightMargin, footerY, { align: 'right' });

  // Save the PDF
  const fileName = `${employeeData.fullName.replace(/\s+/g, '_')}_history.pdf`;
  doc.save(fileName);
}