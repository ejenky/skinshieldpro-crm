/**
 * Parse a CSV string into an array of row arrays.
 * Handles: quoted fields, commas inside quotes, escaped quotes (""),
 * \r\n / \n / \r line endings, and trailing newlines.
 */
export function parseCSV(text) {
  const rows = [];
  let i = 0;
  const len = text.length;

  while (i < len) {
    const row = [];
    // Parse one row
    while (i < len) {
      if (text[i] === '"') {
        // Quoted field
        i++; // skip opening quote
        let field = '';
        while (i < len) {
          if (text[i] === '"') {
            if (i + 1 < len && text[i + 1] === '"') {
              // Escaped quote
              field += '"';
              i += 2;
            } else {
              // End of quoted field
              i++; // skip closing quote
              break;
            }
          } else {
            field += text[i];
            i++;
          }
        }
        row.push(field);
      } else {
        // Unquoted field
        let field = '';
        while (i < len && text[i] !== ',' && text[i] !== '\n' && text[i] !== '\r') {
          field += text[i];
          i++;
        }
        row.push(field);
      }

      // After field: comma means more fields, newline means end of row
      if (i < len && text[i] === ',') {
        i++; // skip comma, continue to next field
      } else {
        break; // end of row (or end of input)
      }
    }

    // Skip line ending
    if (i < len && text[i] === '\r') i++;
    if (i < len && text[i] === '\n') i++;

    // Skip fully empty trailing rows
    if (row.length === 1 && row[0] === '' && i >= len) break;

    rows.push(row);
  }

  return rows;
}

/**
 * Given headers from the CSV, return a best-guess mapping to contact fields.
 */
const FIELD_ALIASES = {
  gym_name:     ['gym_name', 'gym name', 'business', 'business name', 'company', 'name', 'studio', 'gym'],
  contact_name: ['contact_name', 'contact name', 'contact', 'owner', 'owner name', 'manager', 'person'],
  phone:        ['phone', 'phone number', 'telephone', 'tel', 'mobile', 'cell'],
  email:        ['email', 'email address', 'e-mail', 'mail'],
  website:      ['website', 'web', 'url', 'site', 'homepage'],
  address:      ['address', 'street', 'street address', 'addr', 'address1'],
  city:         ['city', 'town', 'municipality'],
  state:        ['state', 'st', 'province', 'region'],
  zip:          ['zip', 'zipcode', 'zip code', 'postal', 'postal code', 'postcode'],
  gym_type:     ['gym_type', 'gym type', 'type', 'category', 'business type', 'business category'],
};

export function autoMapHeaders(headers) {
  const mapping = {};
  const usedIndices = new Set();

  for (const [field, aliases] of Object.entries(FIELD_ALIASES)) {
    for (let idx = 0; idx < headers.length; idx++) {
      if (usedIndices.has(idx)) continue;
      const h = headers[idx].toLowerCase().trim();
      if (aliases.includes(h)) {
        mapping[field] = idx;
        usedIndices.add(idx);
        break;
      }
    }
  }

  return mapping;
}

export const CONTACT_FIELDS = Object.keys(FIELD_ALIASES);
