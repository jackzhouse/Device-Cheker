# Last Checking Report — Feature Planning Document

> **Date:** 2026-03-04  
> **Author:** Engineering Team  
> **Status:** Planning

---

## 1. Overview

The **Last Checking Report** page provides a consolidated single-row-per-employee view of the **most recent device check** for every employee. It allows IT administrators and managers to quickly assess the current device health state across the organization without sifting through historical data.

### Key Goals
- Show **only the latest device check per employee** (one row per person)
- Sort results **by device suitability status (best → worst)** by default
- Provide **compact table view** optimized for fast scanning
- Include **filter controls** (search, status, ownership, department, date range)
- Surface **summary statistics** at a glance (totals by status)

---

## 2. Status Priority Definition

The status order used throughout this feature:

| Priority | Status Value | Display Label | Color |
|----------|-------------|---------------|-------|
| 1 (Best) | `Suitable` | ✅ Suitable | Green |
| 2 | `Limited Suitability` | ⚠️ Limited Suitability | Yellow |
| 3 | `Needs Repair` | 🔧 Needs Repair | Orange |
| 4 (Worst) | `Unsuitable` | ❌ Unsuitable | Red |

---

## 3. Page Specification

### Route
`/laporan-terakhir`

### Page Title
**Last Checking Report** (EN) / **Laporan Pengecekan Terakhir** (ID)

---

## 4. User Interface

### 4.1 Summary Stats Bar
Four compact stat cards above the table:

| Stat | Description |
|------|-------------|
| Total Employees | Count of unique employees with at least one check |
| Suitable | Employees whose latest check = Suitable |
| Issues Found | Employees with Limited Suitability or Needs Repair |
| Unsuitable | Employees whose latest check = Unsuitable |

### 4.2 Filter Bar
Positioned below the stat cards, in a single row (horizontal on desktop, stacked on mobile):

| Filter | Type | Options |
|--------|------|---------|
| Search | Text input | Employee name, ID, device brand/model |
| Status | Dropdown | All / Suitable / Limited Suitability / Needs Repair / Unsuitable |
| Ownership | Dropdown | All / Company / Personal |
| Department | Dropdown or text | Dynamically populated from data |
| Date From / To | Date picker | Filter by check date range |
| Clear Filters | Button | Reset all filters |

### 4.3 Compact Table View
Columns (in order):

| # | Column | Description |
|---|--------|-------------|
| 1 | **#** | Row number |
| 2 | **Employee** | Full name + Employee ID (small) |
| 3 | **Department** | Department name |
| 4 | **Device** | Brand + Model, Type badge (PC/Laptop) |
| 5 | **OS** | OS Type + Version |
| 6 | **Ownership** | Company / Personal badge |
| 7 | **Status** | Color-coded badge (suitability) |
| 8 | **Check Date** | Formatted date |
| 9 | **Version** | Check version badge (v1, v2…) |
| 10 | **Actions** | 👁 View detail, ⬇ Download PDF |

Table rows are **color-coded** by status:
- `Suitable` → subtle green left border
- `Limited Suitability` → subtle yellow left border
- `Needs Repair` → subtle orange left border
- `Unsuitable` → subtle red left border + light red background tint

### 4.4 Sorting
- **Default sort:** Status priority ASC (Suitable first, Unsuitable last), then `checkDate` DESC
- Column headers for Status and Check Date are clickable to toggle sort direction

### 4.5 Empty & Loading States
- Loading: skeleton rows
- Empty (no data): illustrated empty state with message
- Empty after filter: "No results match your filters" with clear button

---

## 5. Backend / API Design

### New API Endpoint
```
GET /api/device-checks/last-check-report
```

#### Query Parameters
| Parameter | Type | Description |
|-----------|------|-------------|
| `search` | string | Filter by employee name/ID, device brand/model |
| `suitability` | string | Filter by `deviceCondition.deviceSuitability` |
| `ownership` | string | Filter by `deviceDetail.ownership` |
| `department` | string | Filter by `employeeSnapshot.department` |
| `dateFrom` | string (ISO) | Filter by `checkDate >= dateFrom` |
| `dateTo` | string (ISO) | Filter by `checkDate <= dateTo` |

#### Logic
1. Aggregate `DeviceCheck` collection using MongoDB `$group` on `employeeId` to get the **latest** check per employee (`$sort: { checkDate: -1, version: -1 }` then `$first`)
2. Apply search / filter conditions through `$match` stages
3. Return a flat array of latest-check documents enriched with employee snapshot data

#### Response Shape
```json
{
  "success": true,
  "data": [
    {
      "_id": "...",
      "employeeId": "...",
      "employeeSnapshot": { "employeeId": "EMP001", "fullName": "...", "department": "..." },
      "deviceDetail": { ... },
      "operatingSystem": { ... },
      "deviceCondition": { "deviceSuitability": "Suitable", ... },
      "checkDate": "2026-01-15T00:00:00.000Z",
      "version": 2
    }
  ],
  "summary": {
    "total": 42,
    "suitable": 30,
    "limitedSuitability": 8,
    "needsRepair": 3,
    "unsuitable": 1
  }
}
```

---

## 6. Files to Create / Modify

| File | Action | Description |
|------|--------|-------------|
| `src/app/api/device-checks/last-check-report/route.ts` | **NEW** | API route for aggregated last-check data |
| `src/lib/services/device-checks.service.ts` | **MODIFY** | Add `getLastCheckReport()` function |
| `src/app/laporan-terakhir/page.tsx` | **NEW** | Page component (table + filters + stats) |
| `src/lib/translations.ts` | **MODIFY** | Add EN/ID translations for new page |
| `src/components/Header.tsx` | **MODIFY** | Add nav link for new page |

---

## 7. Data Flow

```
User visits /laporan-terakhir
        │
        ▼
page.tsx → getLastCheckReport(params)
        │
        ▼
GET /api/device-checks/last-check-report
        │
        ▼
MongoDB Aggregate:
  $match (optional pre-filter for indexed fields)
→ $sort { employeeId, checkDate: -1 }
→ $group _id:employeeId, latestCheck: $first($$ROOT)
→ $replaceRoot { newRoot: $latestCheck }
→ $match (post-filter: search, suitability, ownership, dept)
→ $project (only needed fields)
        │
        ▼
Return sorted by suitability priority + checkDate
```

---

## 8. Translation Keys (New)

```
lastCheckReport:
  title
  description
  filters:
    searchPlaceholder
    allStatuses
    dateFrom
    dateTo
  summary:
    totalEmployees
    suitable
    issues
    unsuitable
  table:
    employee
    department
    device
    os
    ownership
    status
    checkDate
    version
    actions
  empty
  noResults
```

---

## 9. Acceptance Criteria

- [x] Only the **most recent check per employee** appears in the table (no duplicates)
- [x] Default sort: Suitable → Limited → Needs Repair → Unsuitable, then newest date first
- [x] Filters (search, status, ownership, department, date range) work correctly
- [x] Summary stats update when filters are applied
- [x] Table rows are color-coded by status
- [x] Page is accessible via nav bar (both desktop and mobile)
- [x] Both EN and ID translations exist
- [x] Responsive on mobile (table scrolls horizontally)
- [x] Loading skeleton and empty states are implemented

---

## 10. Out of Scope (Future Enhancements)

- Export table to CSV/Excel
- Email report to manager
- Scheduled report generation
- Pagination (current scope: load all latest checks at once, client-side filter)
