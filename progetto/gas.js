var idColumn = "Record_ID";
var API_KEY;
var url;
var alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

function doGet(e) {
  var params = JSON.stringify(e);
  const json = JSON.parse(params);
  var file = SpreadsheetApp.openByUrl(json.parameter.GSheet);

  if (json.parameter.type == "getFields") {
    let recordRow = getRecordRow(file, json.parameter.key);
    let fields = getUpdatableCols(file);
    var colNames = [];
    for (let i = 0; i < fields.length; i++) {
      let fieldName = readCell(file, fields[i]+"1");
      colNames.push(fieldName);
      let fieldValue = readCell(file, fields[i]+""+(recordRow+1));
      colNames.push(fieldValue);
      if (fieldName == "" || fieldName == undefined) {
        return ContentService.createTextOutput("Error updating Google Sheet record. Column " + field[i] + " does not exists or is empty.").setMimeType(ContentService.MimeType.TEXT);
      }
    }
    return ContentService.createTextOutput(colNames).setMimeType(ContentService.MimeType.JAVASCRIPT);
  } else if (json.parameter.type == "saveElement") {
    API_KEY = getAirtableAPIKey(file);
    url = getAirtableAPIURL(file);
    let recordRow = getRecordRow(file, json.parameter.key);
    let sheet = file.getSheets()[0];
    let data = sheet.getDataRange().getValues();
    var airtableFields = {

    }
    for (var p in json.parameter) {
      if (p != "key" && p != "GSheet" && p != "type") {
        let col = numberToAddress(data[0].indexOf(p), "");
        writeToCell(file, col+""+(recordRow+1), json.parameter[p]);
        airtableFields = { ...airtableFields, [p]: String(json.parameter[p])};
      }
    }
    let airtableResponse = airtableUpdate(json.parameter.key, airtableFields);
    if (airtableResponse != 200) {
      return ContentService.createTextOutput("Error updating Airtable record").setMimeType(ContentService.MimeType.TEXT);
    }
  } else {
    API_KEY = getAirtableAPIKey(file);
    url = getAirtableAPIURL(file);
    let recordRow = getRecordRow(file, json.parameter.key);
    let airtableResponse = airtableDelete(json.parameter.key);
    if (airtableResponse == 200) {
      deleteRecord(file, (recordRow+1));
    } else {
      return ContentService.createTextOutput("Couldn't delete from Airtable, will NOT delete from Sheets either!").setMimeType(ContentService.MimeType.TEXT);
    }
  }
  return ContentService.createTextOutput();
}

function getAirtableAPIKey(file) {
  let sheet = file.getSheetByName("Template"); // Must be called this way!
  let data = sheet.getDataRange().getValues();
  let header = data.shift();
  let index = header.indexOf("APIKeyAirtable"); // Must be called this way!
  let apikey = data[0][index];
  return apikey;
}

function getAirtableAPIURL(file) {
  let sheet = file.getSheetByName("Template"); // Must be called this way!
  let data = sheet.getDataRange().getValues();
  let header = data.shift();
  let index = header.indexOf("TabellaAirtable"); // Must be called this way!
  let endpoint = data[0][index];
  return endpoint;
}

function numberToAddress(n, addr) {
  let q = Math.trunc(n / 26);
  let r = n % 26;
  if (q > 0) {
    addr += numberToAddress(q - 1, addr);
    addr += alphabet.charAt(r);
    return addr;
  } else {
    return alphabet.charAt(r);
  }
}

function logging(file, cell, msg) {
  let sheet = file.getSheetByName("log");
  let targetCell = sheet.getRange(cell);
  targetCell.setValue(msg);
  SpreadsheetApp.flush();
}

function getUpdatableCols(file) {
  let sheet = file.getSheetByName("Template"); // Must be called this way!
  let data = sheet.getDataRange().getValues();
  let header = data.shift();
  let updateFieldsCol = header.indexOf("UpdateFields"); // Must be called this way!
  let fieldsStr = data[0][updateFieldsCol];
  let fields = fieldsStr.replace(/\s+/g, '').split(",");
  return fields;
}

function readCell(file, cell) {
  let sheet = file.getSheets()[0];
  let data = sheet.getRange(cell).getValue();
  return data;
}

function getRecordRow(file, key) {
  let sheet = file.getSheets()[0];
  let data = sheet.getDataRange().getValues();
  let idColumnNumber = data[0].indexOf("Record_ID"); // Must be called this way!
  for (var i = 2; i < data.length; i++) {
    if (String(data[i][idColumnNumber]) == String(key)) {
      return i;
    }
  }
}

function writeToCell(file, cell, value) {
  let sheet = file.getSheets()[0];
  let targetCell = sheet.getRange(cell);
  targetCell.setValue(value);
  SpreadsheetApp.flush();
}

function deleteRecord(file, row) {
  let sheet = file.getSheets()[0];
  sheet.deleteRow(row);
  SpreadsheetApp.flush();
}

function airtableUpdate(recordID, fields){
  let postData = {
      "records": [
        {
          "id": recordID,
          "fields": fields
        }
      ],
    typecast: true
  };

  var params = {
    'method': 'patch',
    'muteHttpExceptions': true,
    'contentType': 'application/json',
    'headers': {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + API_KEY
    },
    'payload': JSON.stringify(postData)
  };

  var response = UrlFetchApp.fetch(url, params);
  return (response.getResponseCode());
}

function airtableDelete(recordID) {
  var params = {
    'method': 'delete',
    'muteHttpExceptions': true,
    'headers': {
      'Authorization': 'Bearer ' + API_KEY
    },
  };

  var response = UrlFetchApp.fetch(url + "/" + recordID, params);
  return (response.getResponseCode());
}
