import { sql } from "@/lib/neon";
import { NextResponse } from "next/server";

// GET - Calculate payroll for specific employee and period
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const employee_id = searchParams.get("employee_id");
    const month = searchParams.get("month"); // Format: YYYY-MM
    const year = searchParams.get("year");

    // If month provided, use it; otherwise use current month
    let targetMonth, targetYear;

    if (month) {
      [targetYear, targetMonth] = month.split("-");
    } else if (year) {
      targetYear = year;
      targetMonth = new Date().getMonth() + 1; // Current month
    } else {
      const now = new Date();
      targetYear = now.getFullYear();
      targetMonth = now.getMonth() + 1;
    }

    // Pad month with zero if needed
    const monthStr = targetMonth.toString().padStart(2, "0");
    const periodStart = `${targetYear}-${monthStr}-01`;
    const periodEnd = `${targetYear}-${monthStr}-31`;

    if (employee_id) {
      // Get payroll for specific employee
      const payrollData = await calculateEmployeePayroll(
        employee_id,
        periodStart,
        periodEnd
      );
      return NextResponse.json({ payroll: payrollData });
    } else {
      // Get payroll summary for all employees
      const employees = await sql.query(`
        SELECT id, employee_number, department, position, salary, commission_rate,
               u.full_name
        FROM employees e
        LEFT JOIN users u ON e.user_id = u.id  
        WHERE e.is_active = true
        ORDER BY e.employee_number
      `);

      const payrollSummary = [];
      for (const employee of employees) {
        const payrollData = await calculateEmployeePayroll(
          employee.id,
          periodStart,
          periodEnd
        );
        payrollSummary.push({
          employee_id: employee.id,
          employee_number: employee.employee_number,
          employee_name: employee.full_name,
          department: employee.department,
          position: employee.position,
          ...payrollData,
        });
      }

      return NextResponse.json({
        payroll_summary: payrollSummary,
        period: { month: monthStr, year: targetYear },
      });
    }
  } catch (error) {
    console.error("Error calculating payroll:", error);
    return NextResponse.json(
      { error: "Failed to calculate payroll" },
      { status: 500 }
    );
  }
}

// Helper function to calculate individual employee payroll
async function calculateEmployeePayroll(employeeId, periodStart, periodEnd) {
  try {
    // Get employee data
    const employee = await sql.query(
      `
      SELECT e.*, u.full_name, u.email
      FROM employees e
      LEFT JOIN users u ON e.user_id = u.id
      WHERE e.id = $1
    `,
      [employeeId]
    );

    if (employee.length === 0) {
      throw new Error("Employee not found");
    }

    const emp = employee[0];

    // Get attendance data for the period
    const attendance = await sql.query(
      `
      SELECT 
        COUNT(*) as total_days,
        COUNT(CASE WHEN status = 'present' THEN 1 END) as present_days,
        COUNT(CASE WHEN status = 'absent' THEN 1 END) as absent_days,
        COUNT(CASE WHEN status = 'late' THEN 1 END) as late_days,
        COUNT(CASE WHEN status = 'sick' THEN 1 END) as sick_days,
        COUNT(CASE WHEN status = 'leave' THEN 1 END) as leave_days,
        COALESCE(SUM(total_hours), 0) as total_work_hours,
        COALESCE(SUM(overtime_hours), 0) as total_overtime_hours
      FROM attendance
      WHERE employee_id = $1 
        AND attendance_date >= $2 
        AND attendance_date <= $3
    `,
      [employeeId, periodStart, periodEnd]
    );

    const attendanceData = attendance[0];

    // Calculate working days in the month (excluding weekends)
    const startDate = new Date(periodStart);
    const endDate = new Date(periodEnd);
    let workingDays = 0;

    for (
      let d = new Date(startDate);
      d <= endDate;
      d.setDate(d.getDate() + 1)
    ) {
      const dayOfWeek = d.getDay();
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        // Not Sunday or Saturday
        workingDays++;
      }
    }

    // Calculate basic salary components
    const baseSalary = parseFloat(emp.salary) || 0;
    const dailySalary = baseSalary / workingDays;

    // Calculate deductions for absent days
    const absentDays = parseInt(attendanceData.absent_days) || 0;
    const absentDeduction = dailySalary * absentDays;

    // Calculate overtime pay (1.5x hourly rate)
    const hourlyRate = baseSalary / (workingDays * 8); // Assuming 8 hours per day
    const overtimeHours = parseFloat(attendanceData.total_overtime_hours) || 0;
    const overtimePay = overtimeHours * hourlyRate * 1.5;

    // Calculate late penalty (optional - can be customized)
    const lateDays = parseInt(attendanceData.late_days) || 0;
    const latePenalty = lateDays * (dailySalary * 0.1); // 10% of daily salary per late day

    // Calculate gross salary
    const grossSalary =
      baseSalary + overtimePay - absentDeduction - latePenalty;

    // Calculate basic deductions (can be customized based on company policy)
    const taxRate = 0.05; // 5% tax
    const insurance = baseSalary * 0.02; // 2% for insurance
    const tax = grossSalary * taxRate;

    const totalDeductions = tax + insurance + absentDeduction + latePenalty;
    const netSalary = grossSalary - tax - insurance;

    return {
      employee_data: {
        id: emp.id,
        employee_number: emp.employee_number,
        full_name: emp.full_name,
        department: emp.department,
        position: emp.position,
        bank_account: emp.bank_account,
        bank_name: emp.bank_name,
      },
      period: {
        start_date: periodStart,
        end_date: periodEnd,
        working_days: workingDays,
      },
      attendance_summary: {
        total_days: parseInt(attendanceData.total_days) || 0,
        present_days: parseInt(attendanceData.present_days) || 0,
        absent_days: absentDays,
        late_days: lateDays,
        sick_days: parseInt(attendanceData.sick_days) || 0,
        leave_days: parseInt(attendanceData.leave_days) || 0,
        total_work_hours: parseFloat(attendanceData.total_work_hours) || 0,
        total_overtime_hours: overtimeHours,
      },
      salary_calculation: {
        base_salary: baseSalary,
        daily_salary: Math.round(dailySalary * 100) / 100,
        hourly_rate: Math.round(hourlyRate * 100) / 100,
        overtime_pay: Math.round(overtimePay * 100) / 100,
        gross_salary: Math.round(grossSalary * 100) / 100,
      },
      deductions: {
        absent_deduction: Math.round(absentDeduction * 100) / 100,
        late_penalty: Math.round(latePenalty * 100) / 100,
        tax: Math.round(tax * 100) / 100,
        insurance: Math.round(insurance * 100) / 100,
        total_deductions: Math.round(totalDeductions * 100) / 100,
      },
      net_salary: Math.round(netSalary * 100) / 100,
      generated_at: new Date().toISOString(),
    };
  } catch (error) {
    console.error("Error in calculateEmployeePayroll:", error);
    throw error;
  }
}

// POST - Generate and save payroll slip
export async function POST(request) {
  try {
    const body = await request.json();
    const { employee_id, month, notes, generated_by } = body;

    if (!employee_id || !month) {
      return NextResponse.json(
        { error: "Employee ID and month are required" },
        { status: 400 }
      );
    }

    const [year, monthNum] = month.split("-");
    const periodStart = `${year}-${monthNum}-01`;
    const periodEnd = `${year}-${monthNum}-31`;

    // Calculate payroll
    const payrollData = await calculateEmployeePayroll(
      employee_id,
      periodStart,
      periodEnd
    );

    // Here you could save the payroll slip to a payroll_slips table if needed
    // For now, we'll just return the calculated data

    return NextResponse.json(
      {
        message: "Payroll slip generated successfully",
        payroll_slip: {
          ...payrollData,
          notes: notes || "",
          generated_by,
          slip_number: `PAY-${payrollData.employee_data.employee_number}-${year}${monthNum}`,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error generating payroll slip:", error);
    return NextResponse.json(
      { error: "Failed to generate payroll slip" },
      { status: 500 }
    );
  }
}
