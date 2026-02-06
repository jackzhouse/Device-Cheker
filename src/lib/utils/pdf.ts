import jsPDF from 'jspdf';
import { DeviceCheck } from '@/lib/services/device-checks.service';

/**
 * Generate a PDF for a single device check
 */
export async function generateDeviceCheckPDF(check: DeviceCheck) {
  const doc = new jsPDF();
  let yPos = 20;
  const lineHeight = 8;
  const leftMargin = 20;
  const pageWidth = doc.internal.pageSize.getWidth();

  // Title
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('Device Check Report', leftMargin, yPos);
  yPos += lineHeight * 2;

  // Employee Information
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Employee Information', leftMargin, yPos);
  yPos += lineHeight;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Name: ${check.employeeSnapshot.fullName}`, leftMargin, yPos);
  yPos += lineHeight;
  doc.text(`Position: ${check.employeeSnapshot.position}`, leftMargin, yPos);
  yPos += lineHeight;
  if (check.employeeSnapshot.department) {
    doc.text(`Department: ${check.employeeSnapshot.department}`, leftMargin, yPos);
    yPos += lineHeight;
  }
  doc.text(`Check Date: ${new Date(check.checkDate).toLocaleDateString()}`, leftMargin, yPos);
  yPos += lineHeight;
  doc.text(`Version: v${check.version}`, leftMargin, yPos);
  yPos += lineHeight * 2;

  // Device Information
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Device Information', leftMargin, yPos);
  yPos += lineHeight;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Device Type: ${check.deviceDetail.deviceType}`, leftMargin, yPos);
  yPos += lineHeight;
  doc.text(`Device Brand: ${check.deviceDetail.deviceBrand}`, leftMargin, yPos);
  yPos += lineHeight;
  doc.text(`Device Model: ${check.deviceDetail.deviceModel}`, leftMargin, yPos);
  yPos += lineHeight;
  doc.text(`Serial Number: ${check.deviceDetail.serialNumber}`, leftMargin, yPos);
  yPos += lineHeight;
  doc.text(`Ownership: ${check.deviceDetail.ownership}`, leftMargin, yPos);
  yPos += lineHeight * 2;

  // Operating System
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Operating System', leftMargin, yPos);
  yPos += lineHeight;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`OS Type: ${check.operatingSystem.osType}`, leftMargin, yPos);
  yPos += lineHeight;
  doc.text(`OS Version: ${check.operatingSystem.osVersion}`, leftMargin, yPos);
  yPos += lineHeight;
  doc.text(`OS License: ${check.operatingSystem.osLicense}`, leftMargin, yPos);
  yPos += lineHeight;
  doc.text(`Regular Updates: ${check.operatingSystem.osRegularUpdate ? 'Yes' : 'No'}`, leftMargin, yPos);
  yPos += lineHeight * 2;

  // Specifications (if available)
  if (check.specification) {
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Specifications', leftMargin, yPos);
    yPos += lineHeight;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    if (check.specification.ramCapacity) {
      doc.text(`RAM: ${check.specification.ramCapacity}`, leftMargin, yPos);
      yPos += lineHeight;
    }
    if (check.specification.memoryType) {
      doc.text(`Memory Type: ${check.specification.memoryType}`, leftMargin, yPos);
      yPos += lineHeight;
    }
    if (check.specification.memoryCapacity) {
      doc.text(`Storage: ${check.specification.memoryCapacity}`, leftMargin, yPos);
      yPos += lineHeight;
    }
    if (check.specification.processor) {
      doc.text(`Processor: ${check.specification.processor}`, leftMargin, yPos);
      yPos += lineHeight;
    }
    yPos += lineHeight * 2;
  }

  // Device Condition
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Device Condition', leftMargin, yPos);
  yPos += lineHeight;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Overall Suitability: ${check.deviceCondition.deviceSuitability}`, leftMargin, yPos);
  yPos += lineHeight;
  doc.text(`Battery: ${check.deviceCondition.batterySuitability}`, leftMargin, yPos);
  yPos += lineHeight;
  doc.text(`Keyboard: ${check.deviceCondition.keyboardCondition}`, leftMargin, yPos);
  yPos += lineHeight;
  doc.text(`Touchpad: ${check.deviceCondition.touchpadCondition}`, leftMargin, yPos);
  yPos += lineHeight;
  doc.text(`Monitor: ${check.deviceCondition.monitorCondition}`, leftMargin, yPos);
  yPos += lineHeight;
  doc.text(`Wi-Fi: ${check.deviceCondition.wifiCondition}`, leftMargin, yPos);
  yPos += lineHeight * 2;

  // Work Applications
  if (check.workApplications && check.workApplications.length > 0) {
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Work Applications', leftMargin, yPos);
    yPos += lineHeight;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    check.workApplications.forEach((app) => {
      doc.text(`• ${app.applicationName} (${app.license})`, leftMargin, yPos);
      if (app.notes) {
        doc.text(`  Note: ${app.notes}`, leftMargin + 10, yPos + lineHeight);
        yPos += lineHeight;
      }
      yPos += lineHeight;
    });
    yPos += lineHeight;
  }

  // Non-Work Applications
  if (check.nonWorkApplications && check.nonWorkApplications.length > 0) {
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Non-Work Applications', leftMargin, yPos);
    yPos += lineHeight;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    check.nonWorkApplications.forEach((app) => {
      doc.text(`• ${app.applicationName} (${app.license})`, leftMargin, yPos);
      if (app.notes) {
        doc.text(`  Note: ${app.notes}`, leftMargin + 10, yPos + lineHeight);
        yPos += lineHeight;
      }
      yPos += lineHeight;
    });
    yPos += lineHeight;
  }

  // Security
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Security', leftMargin, yPos);
  yPos += lineHeight;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Antivirus Status: ${check.security.antivirus.status}`, leftMargin, yPos);
  yPos += lineHeight;
  if (check.security.antivirus.list && check.security.antivirus.list.length > 0) {
    check.security.antivirus.list.forEach((antivirus) => {
      doc.text(`  • ${antivirus.applicationName} (${antivirus.license})`, leftMargin, yPos);
      yPos += lineHeight;
    });
  }
  yPos += lineHeight;
  doc.text(`VPN Status: ${check.security.vpn.status}`, leftMargin, yPos);
  yPos += lineHeight;
  if (check.security.vpn.list && check.security.vpn.list.length > 0) {
    check.security.vpn.list.forEach((vpn) => {
      doc.text(`  • ${vpn.vpnName} (${vpn.license})`, leftMargin, yPos);
      yPos += lineHeight;
    });
  }
  yPos += lineHeight * 2;

  // Additional Information
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Additional Information', leftMargin, yPos);
  yPos += lineHeight;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Password Usage: ${check.additionalInfo.passwordUsage}`, leftMargin, yPos);
  yPos += lineHeight;
  if (check.additionalInfo.otherNotes) {
    doc.text(`Notes: ${check.additionalInfo.otherNotes}`, leftMargin, yPos);
    yPos += lineHeight;
  }
  if (check.additionalInfo.inspectorPICName) {
    doc.text(`Inspector: ${check.additionalInfo.inspectorPICName}`, leftMargin, yPos);
    yPos += lineHeight;
  }

  // Footer
  yPos = doc.internal.pageSize.getHeight() - 30;
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text(
    `Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}`,
    leftMargin,
    yPos
  );
  doc.text(
    'Device Checking System',
    pageWidth / 2,
    yPos,
    { align: 'center' }
  );

  // Save the PDF
  const fileName = `${check.employeeSnapshot.fullName.replace(/\s+/g, '_')}_v${check.version}_device_check.pdf`;
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
  let yPos = 20;
  const lineHeight = 8;
  const leftMargin = 20;
  const pageWidth = doc.internal.pageSize.getWidth();

  // Title
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('Employee Device Check History', leftMargin, yPos);
  yPos += lineHeight * 2;

  // Employee Information
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Employee Information', leftMargin, yPos);
  yPos += lineHeight;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Name: ${employeeData.fullName}`, leftMargin, yPos);
  yPos += lineHeight;
  doc.text(`Position: ${employeeData.position}`, leftMargin, yPos);
  yPos += lineHeight;
  if (employeeData.department) {
    doc.text(`Department: ${employeeData.department}`, leftMargin, yPos);
    yPos += lineHeight;
  }
  doc.text(`Status: ${employeeData.status}`, leftMargin, yPos);
  yPos += lineHeight;
  doc.text(`Total Checks: ${checks.length}`, leftMargin, yPos);
  yPos += lineHeight * 2;

  // Generate summary table
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Summary', leftMargin, yPos);
  yPos += lineHeight;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  const pcCount = checks.filter((c) => c.deviceDetail.deviceType === 'PC').length;
  const laptopCount = checks.filter((c) => c.deviceDetail.deviceType === 'Laptop').length;
  const companyCount = checks.filter((c) => c.deviceDetail.ownership === 'Company').length;
  const personalCount = checks.filter((c) => c.deviceDetail.ownership === 'Personal').length;

  doc.text(`PC Devices: ${pcCount}`, leftMargin, yPos);
  yPos += lineHeight;
  doc.text(`Laptops: ${laptopCount}`, leftMargin, yPos);
  yPos += lineHeight;
  doc.text(`Company Owned: ${companyCount}`, leftMargin, yPos);
  yPos += lineHeight;
  doc.text(`Personal: ${personalCount}`, leftMargin, yPos);
  yPos += lineHeight * 2;

  // List all checks
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Check History', leftMargin, yPos);
  yPos += lineHeight * 2;

  checks.forEach((check, index) => {
    // Check if we need a new page
    if (yPos > doc.internal.pageSize.getHeight() - 50) {
      doc.addPage();
      yPos = 20;
    }

    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(`Check v${check.version} - ${new Date(check.checkDate).toLocaleDateString()}`, leftMargin, yPos);
    yPos += lineHeight;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Device: ${check.deviceDetail.deviceBrand} ${check.deviceDetail.deviceModel} (${check.deviceDetail.deviceType})`, leftMargin, yPos);
    yPos += lineHeight;
    doc.text(`Ownership: ${check.deviceDetail.ownership}`, leftMargin, yPos);
    yPos += lineHeight;
    doc.text(`Serial Number: ${check.deviceDetail.serialNumber}`, leftMargin, yPos);
    yPos += lineHeight;
    doc.text(`Condition: ${check.deviceCondition.deviceSuitability}`, leftMargin, yPos);
    yPos += lineHeight;

    // OS
    doc.text(`OS: ${check.operatingSystem.osType} ${check.operatingSystem.osVersion}`, leftMargin, yPos);
    yPos += lineHeight;

    // Suitability
    const suitabilityVariants: any = {
      'Suitable': '✓',
      'Limited Suitability': '⚠',
      'Needs Repair': '⚠',
      'Unsuitable': '✗',
    };
    const icon = suitabilityVariants[check.deviceCondition.deviceSuitability] || '-';
    doc.text(`Overall: ${icon} ${check.deviceCondition.deviceSuitability}`, leftMargin, yPos);
    yPos += lineHeight * 2;

    // Add a separator line
    doc.setDrawColor(200);
    doc.line(leftMargin, yPos, pageWidth - leftMargin, yPos);
    yPos += lineHeight * 2;
  });

  // Footer
  yPos = doc.internal.pageSize.getHeight() - 30;
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text(
    `Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}`,
    leftMargin,
    yPos
  );
  doc.text(
    'Device Checking System',
    pageWidth / 2,
    yPos,
    { align: 'center' }
  );

  // Save the PDF
  const fileName = `${employeeData.fullName.replace(/\s+/g, '_')}_history.pdf`;
  doc.save(fileName);
}