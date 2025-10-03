/**
 * Google Apps Script for OnchainERP Department Import
 * This script provides a web app interface for importing department data from Google Sheets
 */

// Web app entry point
function doGet(e) {
  return HtmlService.createHtmlOutputFromFile('Index');
}

// Web app entry point for POST requests
function doPost(e) {
  try {
    const { action, spreadsheetId, sheetName, collegeId } = JSON.parse(e.postData.contents);
    
    if (action === 'getSheetData') {
      const data = getSheetData(spreadsheetId, sheetName);
      return ContentService
        .createTextOutput(JSON.stringify({ success: true, data: data }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    return ContentService
      .createTextOutput(JSON.stringify({ success: false, error: 'Invalid action' }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({ success: false, error: error.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// Get data from specified spreadsheet and sheet
function getSheetData(spreadsheetId, sheetName = 'Departments') {
  const spreadsheet = SpreadsheetApp.openById(spreadsheetId);
  const sheet = spreadsheet.getSheetByName(sheetName) || spreadsheet.getSheets()[0];
  
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const rows = data.slice(1);
  
  // Convert to array of objects
  const result = rows.map(row => {
    const obj = {};
    headers.forEach((header, index) => {
      obj[header.toLowerCase().replace(/\s+/g, '')] = row[index] || '';
    });
    return obj;
  });
  
  return result;
}

// Create a template spreadsheet with proper headers
function createTemplate() {
  const spreadsheet = SpreadsheetApp.create('Department Import Template');
  const sheet = spreadsheet.getActiveSheet();
  
  // Set headers
  const headers = [
    'Name',
    'Short Name', 
    'Code',
    'Description',
    'Students Per Section',
    'Total Sections',
    'Total Intake',
    'Current Strength',
    'Programs'
  ];
  
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  
  // Format headers
  sheet.getRange(1, 1, 1, headers.length)
    .setBackground('#4285f4')
    .setFontColor('white')
    .setFontWeight('bold');
  
  // Set example data
  const exampleData = [
    ['Computer Science', 'CS', 'CSE', 'Department of Computer Science', 60, 4, 240, 0, 'B.Tech, M.Tech, PhD'],
    ['Electrical Engineering', 'EE', 'EEE', 'Department of Electrical Engineering', 60, 3, 180, 0, 'B.Tech, M.Tech']
  ];
  
  sheet.getRange(2, 1, exampleData.length, headers.length).setValues(exampleData);
  
  return spreadsheet.getUrl();
}

// Generate template download link
function getTemplateUrl() {
  const templateUrl = createTemplate();
  return templateUrl;
}
