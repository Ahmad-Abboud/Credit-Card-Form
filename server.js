const express = require('express');
const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = 3000;
const EXCEL_FILE = 'card_data.xlsx';

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

// Initialize Excel file if it doesn't exist
function initializeExcelFile() {
  if (!fs.existsSync(EXCEL_FILE)) {
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet([]);
    XLSX.utils.book_append_sheet(wb, ws, 'Card Data');
    XLSX.writeFile(wb, EXCEL_FILE);
    console.log('Excel file created:', EXCEL_FILE);
  }
}

// Read data from Excel file
function readExcelData() {
  try {
    const workbook = XLSX.readFile(EXCEL_FILE);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet);
    return data;
  } catch (error) {
    console.error('Error reading Excel file:', error);
    return [];
  }
}

// Write data to Excel file
function writeExcelData(data) {
  try {
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(data);
    XLSX.utils.book_append_sheet(wb, ws, 'Card Data');
    XLSX.writeFile(wb, EXCEL_FILE);
    return true;
  } catch (error) {
    console.error('Error writing to Excel file:', error);
    return false;
  }
}

// API endpoint to add new card data
app.post('/api/save-card-data', (req, res) => {
  try {
    const newData = req.body;
    
    // Validate required fields
    if (!newData.Email) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email is required' 
      });
    }

    // Add timestamp
    newData.Timestamp = new Date().toLocaleString();

    // Read existing data
    const existingData = readExcelData();

    // Add new entry
    existingData.push(newData);

    // Write back to Excel
    const success = writeExcelData(existingData);

    if (success) {
      res.json({ 
        success: true, 
        message: 'Data saved successfully',
        totalEntries: existingData.length
      });
    } else {
      res.status(500).json({ 
        success: false, 
        message: 'Failed to save data' 
      });
    }
  } catch (error) {
    console.error('Error in save-card-data:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error: ' + error.message 
    });
  }
});

// API endpoint to get all data (optional - for viewing)
app.get('/api/get-card-data', (req, res) => {
  try {
    const data = readExcelData();
    res.json({ 
      success: true, 
      data: data,
      totalEntries: data.length
    });
  } catch (error) {
    console.error('Error in get-card-data:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error: ' + error.message 
    });
  }
});

// API endpoint to download the Excel file
app.get('/api/download-excel', (req, res) => {
  try {
    const filePath = path.join(__dirname, EXCEL_FILE);
    if (fs.existsSync(filePath)) {
      res.download(filePath, EXCEL_FILE);
    } else {
      res.status(404).json({ 
        success: false, 
        message: 'Excel file not found' 
      });
    }
  } catch (error) {
    console.error('Error in download-excel:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error: ' + error.message 
    });
  }
});

// Initialize Excel file on server start
initializeExcelFile();

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Excel file location: ${path.join(__dirname, EXCEL_FILE)}`);
});

