import * as XLSX from 'xlsx';
import ExcelJS from 'exceljs';
import path from 'path';
import fs from 'fs';
import { UserRole } from '../model/user.model';

// Directory for storing temporary Excel files
const excelTempDir = path.join(__dirname, '../uploads/Excel');

// Ensure the directory exists
if (!fs.existsSync(excelTempDir)) {
    fs.mkdirSync(excelTempDir, { recursive: true });
}

/**
 * Generate a sample Excel template for user bulk upload with dropdown lists
 * @returns Path to the generated Excel file
 */
export const generateUserUploadTemplate = async (): Promise<string> => {
    // Create a new workbook using ExcelJS
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Users');
    
    // Define columns with validation
    worksheet.columns = [
        { header: 'firstName', key: 'firstName', width: 15 },
        { header: 'lastName', key: 'lastName', width: 15 },
        { header: 'username', key: 'username', width: 15 },
        { header: 'email', key: 'email', width: 20 },
        { header: 'password', key: 'password', width: 15 },
        { header: 'age', key: 'age', width: 10 },
        { header: 'gender', key: 'gender', width: 10 },
        { header: 'mobileNumber', key: 'mobileNumber', width: 15 },
        { header: 'role', key: 'role', width: 10 },
        { header: 'class', key: 'class', width: 10 },
        { header: 'syllabus', key: 'syllabus', width: 15 }
    ];
    
    // Style the header row
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFD3D3D3' } // Light gray
    };
    
    // Add borders to header
    worksheet.getRow(1).eachCell((cell) => {
        cell.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' }
        };
    });
    
    // Add example row
    worksheet.addRow({
        firstName: 'John',
        lastName: 'Doe',
        username: 'johndoe',
        email: 'john.doe@example.com',
        password: 'password123',
        age: 30,
        gender: 'male',
        mobileNumber: '1234567890',
        role: 'student',
        class: '10',
        syllabus: 'CBSE'
    });
    
    // Add dropdown for gender (applies to column G, rows 2-1000)
    for (let row = 2; row <= 1000; row++) {
        worksheet.getCell(`G${row}`).dataValidation = {
            type: 'list',
            allowBlank: false,
            formulae: ['"male,female,other"']
        };
    }
    
    // Add dropdown for role (applies to column I, rows 2-1000)
    for (let row = 2; row <= 1000; row++) {
        worksheet.getCell(`I${row}`).dataValidation = {
            type: 'list',
            allowBlank: false,
            formulae: [`"${Object.values(UserRole).join(',')}"`]
        };
    }
    
    // Add dropdown for class (applies to column J, rows 2-1000)
    for (let row = 2; row <= 1000; row++) {
        worksheet.getCell(`J${row}`).dataValidation = {
            type: 'list',
            allowBlank: true,
            formulae: ['"1,2,3,4,5,6,7,8,9,10,11,12"']
        };
    }
    
    // Add dropdown for syllabus (applies to column K, rows 2-1000)
    for (let row = 2; row <= 1000; row++) {
        worksheet.getCell(`K${row}`).dataValidation = {
            type: 'list',
            allowBlank: true,
            formulae: ['"CBSE,ICSE,State Board,IB,IGCSE,Other"']
        };
    }
    
    // Generate a unique filename
    const timestamp = new Date().getTime();
    const filename = `user_upload_template_${timestamp}.xlsx`;
    const filePath = path.join(excelTempDir, filename);
    
    // Save the workbook
    await workbook.xlsx.writeFile(filePath);
    
    return filePath;
};

/**
 * Parse an Excel file for user bulk upload
 * @param filePath Path to the Excel file
 * @returns Array of user data objects
 */
export const parseUserUploadExcel = (filePath: string): any[] => {
    // Read the Excel file
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    
    // Convert to JSON
    const data = XLSX.utils.sheet_to_json(worksheet);
    
    // Validate and transform data
    return data.map((row: any) => {
        // Convert age to number if it's a string
        if (row.age && typeof row.age === 'string') {
            row.age = parseInt(row.age, 10);
        }
        
        return {
            firstName: row.firstName,
            lastName: row.lastName,
            username: row.username,
            email: row.email,
            password: row.password,
            age: row.age,
            gender: row.gender,
            mobileNumber: row.mobileNumber,
            role: row.role,
            class: row.class,
            syllabus: row.syllabus
        };
    });
};

/**
 * Generate a UID for a user
 * @returns Random UID string
 */
export const generateUID = (): string => {
    return Math.random().toString(36).substring(2, 12);
};