import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import DeviceCheck from '@/models/DeviceCheck';

export async function GET(request: NextRequest) {
    try {
        await connectDB();

        const searchParams = request.nextUrl.searchParams;
        const search = searchParams.get('search') || '';
        const suitability = searchParams.get('suitability') || '';
        const ownership = searchParams.get('ownership') || '';
        const department = searchParams.get('department') || '';
        const dateFrom = searchParams.get('dateFrom') || '';
        const dateTo = searchParams.get('dateTo') || '';

        // Aggregation pipeline to get the latest check per employee
        const pipeline: any[] = [
            // Step 1: Sort by employee and date/version descending
            { $sort: { employeeId: 1, checkDate: -1, version: -1 } },

            // Step 2: Group by employeeId and take the first (latest) document
            {
                $group: {
                    _id: '$employeeId',
                    latestCheck: { $first: '$$ROOT' }
                }
            },

            // Step 3: Flatten the structure
            { $replaceRoot: { newRoot: '$latestCheck' } }
        ];

        // Step 4: Apply filters on the latest checks
        const match: any = {};

        if (search) {
            match.$or = [
                { 'employeeSnapshot.employeeId': { $regex: search, $options: 'i' } },
                { 'employeeSnapshot.fullName': { $regex: search, $options: 'i' } },
                { 'deviceDetail.deviceBrand': { $regex: search, $options: 'i' } },
                { 'deviceDetail.deviceModel': { $regex: search, $options: 'i' } },
                { 'deviceDetail.serialNumber': { $regex: search, $options: 'i' } },
            ];
        }

        if (suitability) {
            // Handle potential case sensitivity or mapping differences
            // The frontend uses 'suitable', 'limitedSuitability', etc.
            // The model uses 'Suitable', 'Limited Suitability', etc.
            const suitabilityMap: Record<string, string> = {
                'suitable': 'Suitable',
                'limitedSuitability': 'Limited Suitability',
                'needsRepair': 'Needs Repair',
                'unsuitable': 'Unsuitable'
            };
            match['deviceCondition.deviceSuitability'] = suitabilityMap[suitability] || suitability;
        }

        if (ownership) {
            const ownershipMap: Record<string, string> = {
                'company': 'Company',
                'personal': 'Personal'
            };
            match['deviceDetail.ownership'] = ownershipMap[ownership] || ownership;
        }

        if (department) {
            match['employeeSnapshot.department'] = { $regex: department, $options: 'i' };
        }

        if (dateFrom || dateTo) {
            match.checkDate = {};
            if (dateFrom) match.checkDate.$gte = new Date(dateFrom);
            if (dateTo) match.checkDate.$lte = new Date(dateTo);
        }

        if (Object.keys(match).length > 0) {
            pipeline.push({ $match: match });
        }

        // Step 5: Add priority field for status sorting
        // Suitable (0) -> Limited (1) -> Needs Repair (2) -> Unsuitable (3)
        pipeline.push({
            $addFields: {
                statusPriority: {
                    $switch: {
                        branches: [
                            { case: { $eq: ['$deviceCondition.deviceSuitability', 'Unsuitable'] }, then: 0 },
                            { case: { $eq: ['$deviceCondition.deviceSuitability', 'Needs Repair'] }, then: 1 },
                            { case: { $eq: ['$deviceCondition.deviceSuitability', 'Limited Suitability'] }, then: 2 },
                            { case: { $eq: ['$deviceCondition.deviceSuitability', 'Suitable'] }, then: 3 }
                        ],
                        default: 4
                    }
                }
            }
        });

        // Step 6: Final sort by status priority then date
        pipeline.push({ $sort: { statusPriority: 1, checkDate: -1 } });

        const checks = await DeviceCheck.aggregate(pipeline);

        // Calculate Summary Stats
        const summary = {
            total: checks.length,
            suitable: checks.filter(c => c.deviceCondition.deviceSuitability === 'Suitable').length,
            limitedSuitability: checks.filter(c => c.deviceCondition.deviceSuitability === 'Limited Suitability').length,
            needsRepair: checks.filter(c => c.deviceCondition.deviceSuitability === 'Needs Repair').length,
            unsuitable: checks.filter(c => c.deviceCondition.deviceSuitability === 'Unsuitable').length,
        };

        return NextResponse.json({
            success: true,
            data: {
                data: checks,
                summary
            }
        });
    } catch (error: any) {
        console.error('Error fetching last check report:', error);
        return NextResponse.json(
            { success: false, error: error.message || 'Failed to fetch last check report' },
            { status: 500 }
        );
    }
}
