const mongoose = require("mongoose");
require("dotenv").config({ path: ".env.local" });

// Import models
const Employee = require("../src/models/Employee");

async function connectDB() {
  try {
    const mongoUri =
      process.env.MONGODB_URI || "mongodb://localhost:27017/device-checker";
    await mongoose.connect(mongoUri);
    console.log("✓ MongoDB Connected");
  } catch (error) {
    console.error("✗ MongoDB Connection Error:", error.message);
    process.exit(1);
  }
}

function generateEmployeeId(firstName, lastName) {
  // Generate from first letters of first name + random 4-digit number
  const letters = (firstName.substring(0, 2) + lastName.substring(0, 1))
    .toUpperCase()
    .padEnd(2, "X");
  const number = Math.floor(1000 + Math.random() * 9000);
  return `${letters}-${number}`;
}

async function migrateEmployees() {
  try {
    await connectDB();

    // Find all employees without employeeId
    const employeesWithoutId = await Employee.find({
      employeeId: { $exists: false },
    });

    console.log(
      `Found ${employeesWithoutId.length} employees without employeeId`,
    );

    if (employeesWithoutId.length === 0) {
      console.log("✓ All employees already have employeeId");
      process.exit(0);
    }

    let updated = 0;
    let duplicates = 0;

    for (const employee of employeesWithoutId) {
      let newEmployeeId;
      let attempts = 0;
      let uniqueId = false;

      // Try to find a unique employee ID
      while (!uniqueId && attempts < 10) {
        newEmployeeId = generateEmployeeId(
          employee.firstName,
          employee.lastName,
        );
        const existing = await Employee.findOne({ employeeId: newEmployeeId });

        if (!existing) {
          uniqueId = true;
        } else {
          attempts++;
        }
      }

      if (!uniqueId) {
        console.log(`✗ Could not generate unique ID for ${employee.fullName}`);
        duplicates++;
        continue;
      }

      employee.employeeId = newEmployeeId;
      await employee.save();

      console.log(`✓ Updated ${employee.fullName}: ${newEmployeeId}`);
      updated++;
    }

    console.log(`\n=== Migration Summary ===`);
    console.log(`Total employees found: ${employeesWithoutId.length}`);
    console.log(`Successfully updated: ${updated}`);
    console.log(`Skipped (duplicates): ${duplicates}`);

    if (updated > 0) {
      console.log("\n✓ Migration completed successfully!");
    }

    process.exit(0);
  } catch (error) {
    console.error("✗ Migration Error:", error.message);
    process.exit(1);
  }
}

// Run migration
migrateEmployees();
