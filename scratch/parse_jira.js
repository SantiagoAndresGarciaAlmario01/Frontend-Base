const fs = require('fs');

const fileContent = fs.readFileSync('public/Jira.csv', 'utf8');

// Proper RFC 4180 CSV Parser
function parseCSV(text) {
  const records = [];
  let record = [];
  let field = '';
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    const next = text[i + 1];

    if (inQuotes) {
      if (c === '"') {
        if (next === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += c;
      }
    } else {
      if (c === '"') {
        inQuotes = true;
      } else if (c === ',') {
        record.push(field);
        field = '';
      } else if (c === '\r') {
        // skip
      } else if (c === '\n') {
        record.push(field);
        records.push(record);
        record = [];
        field = '';
      } else {
        field += c;
      }
    }
  }
  if (field || record.length > 0) {
    record.push(field);
    records.push(record);
  }
  return records;
}

const records = parseCSV(fileContent);
const header = records[0];
console.log('Total records:', records.length);
console.log('Header length:', header.length);

const issues = [];
for (let i = 1; i < records.length; i++) {
  const row = records[i];
  if (row.length < 2) continue;
  const obj = {};
  header.forEach((h, idx) => {
    obj[h] = row[idx] || '';
  });
  issues.push(obj);
}

// Write out all HUs with full description to scratch/all_hus_full.txt
const hus = issues.filter(iss => iss['Resumen'] && iss['Resumen'].includes('HU-'));

hus.sort((a, b) => {
  const numA = parseInt((a['Resumen'].match(/HU-(\d+)/) || [])[1] || '0', 10);
  const numB = parseInt((b['Resumen'].match(/HU-(\d+)/) || [])[1] || '0', 10);
  return numA - numB;
});

let out = `=== ALL 24 USER STORIES FROM JIRA.CSV (${hus.length}) ===\n\n`;

hus.forEach(iss => {
  out += `\n================================================================================\n`;
  out += `KEY: ${iss['Clave de incidencia']} | TYPE: ${iss['Tipo de Incidencia']} | SPRINT: ${iss['Sprint']} | ESTADO: ${iss['Estado']}\n`;
  out += `RESUMEN: ${iss['Resumen']}\n`;
  out += `--------------------------------------------------------------------------------\n`;
  out += `${iss['Descripción']}\n`;
});

fs.writeFileSync('scratch/all_hus_full.txt', out, 'utf8');
console.log(`Saved ${hus.length} full HUs to scratch/all_hus_full.txt`);
