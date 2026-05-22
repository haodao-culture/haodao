const SPREADSHEET_ID = '請貼上你的 Google Sheet ID';

const SHEETS = {
  checkins: {
    name: '打卡',
    headers: ['id', 'name', 'minutes', 'stateNote', 'date', 'createdAt'],
  },
  reflections: {
    name: '心得',
    headers: ['id', 'name', 'reflection', 'documentQuote', 'date', 'createdAt'],
  },
  periods: {
    name: '期數',
    headers: ['id', 'number', 'startDate', 'endDate', 'createdAt', 'updatedAt'],
  },
  members: {
    name: '名單',
    headers: ['id', 'periodId', 'name', 'note', 'createdAt', 'updatedAt'],
  },
};

function doGet(e) {
  const params = e && e.parameter ? e.parameter : {};
  const action = params.action || 'list';
  const callback = params.callback || 'callback';
  const data = action === 'list' ? listAll() : { ok: false, message: 'Unknown action' };

  return ContentService
    .createTextOutput(`${callback}(${JSON.stringify(data)})`)
    .setMimeType(ContentService.MimeType.JAVASCRIPT);
}

function doPost(e) {
  const body = JSON.parse(e && e.postData ? e.postData.contents || '{}' : '{}');
  const action = body.action;
  const payload = body.payload || {};

  setupSheets();

  if (action === 'saveCheckin') upsertRow('checkins', payload);
  if (action === 'saveReflection') upsertRow('reflections', payload);
  if (action === 'savePeriod') upsertRow('periods', payload);
  if (action === 'saveMember') upsertRow('members', payload);
  if (action === 'deleteCheckin') deleteRowById('checkins', payload.id);
  if (action === 'deleteReflection') deleteRowById('reflections', payload.id);
  if (action === 'deletePeriod') {
    deleteRowById('periods', payload.id);
    deleteRowsByField('members', 'periodId', payload.id);
  }
  if (action === 'deleteMember') deleteRowById('members', payload.id);

  return ContentService
    .createTextOutput(JSON.stringify({ ok: true }))
    .setMimeType(ContentService.MimeType.JSON);
}

function listAll() {
  setupSheets();
  return {
    checkins: readRows('checkins'),
    reflections: readRows('reflections'),
    periods: readRows('periods'),
    members: readRows('members'),
  };
}

function setupSheets() {
  Object.keys(SHEETS).forEach((key) => {
    const config = SHEETS[key];
    const sheet = getOrCreateSheet(config.name);
    const firstRow = sheet.getRange(1, 1, 1, config.headers.length).getValues()[0];
    const needsHeader = config.headers.some((header, index) => firstRow[index] !== header);

    if (needsHeader) {
      sheet.getRange(1, 1, 1, config.headers.length).setValues([config.headers]);
      sheet.setFrozenRows(1);
    }
  });
}

function getOrCreateSheet(name) {
  const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
  return spreadsheet.getSheetByName(name) || spreadsheet.insertSheet(name);
}

function readRows(key) {
  const config = SHEETS[key];
  const sheet = getOrCreateSheet(config.name);
  const lastRow = sheet.getLastRow();
  const lastColumn = config.headers.length;

  if (lastRow < 2) return [];

  return sheet.getRange(2, 1, lastRow - 1, lastColumn).getValues()
    .filter((row) => row.some((cell) => cell !== ''))
    .map((row) => {
      const item = {};
      config.headers.forEach((header, index) => {
        item[header] = row[index] == null ? '' : String(row[index]);
      });
      return item;
    });
}

function upsertRow(key, item) {
  const config = SHEETS[key];
  const sheet = getOrCreateSheet(config.name);
  const headers = config.headers;
  const id = item.id;
  const rowValues = headers.map((header) => item[header] == null ? '' : item[header]);
  const rowIndex = findRowIndexById(sheet, id);

  if (rowIndex > 0) {
    sheet.getRange(rowIndex, 1, 1, headers.length).setValues([rowValues]);
  } else {
    sheet.appendRow(rowValues);
  }
}

function deleteRowById(key, id) {
  const sheet = getOrCreateSheet(SHEETS[key].name);
  const rowIndex = findRowIndexById(sheet, id);
  if (rowIndex > 0) sheet.deleteRow(rowIndex);
}

function deleteRowsByField(key, fieldName, value) {
  const config = SHEETS[key];
  const sheet = getOrCreateSheet(config.name);
  const fieldIndex = config.headers.indexOf(fieldName);
  const lastRow = sheet.getLastRow();

  if (fieldIndex < 0 || lastRow < 2) return;

  for (let row = lastRow; row >= 2; row -= 1) {
    if (String(sheet.getRange(row, fieldIndex + 1).getValue()) === String(value)) {
      sheet.deleteRow(row);
    }
  }
}

function findRowIndexById(sheet, id) {
  const lastRow = sheet.getLastRow();
  if (!id || lastRow < 2) return -1;

  const ids = sheet.getRange(2, 1, lastRow - 1, 1).getValues();
  for (let index = 0; index < ids.length; index += 1) {
    if (String(ids[index][0]) === String(id)) return index + 2;
  }
  return -1;
}
