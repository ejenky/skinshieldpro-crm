import { CONTACT_FIELDS } from '../../utils/csvParser';

const FIELD_LABELS = {
  gym_name: 'Gym Name',
  contact_name: 'Contact',
  phone: 'Phone',
  email: 'Email',
  website: 'Website',
  address: 'Address',
  city: 'City',
  state: 'State',
  zip: 'Zip',
  gym_type: 'Type',
};

export default function ImportPreview({ rows, mapping, duplicates }) {
  // Build mapped fields that actually have a column assigned
  const activeFields = CONTACT_FIELDS.filter((f) => mapping[f] !== undefined);

  if (activeFields.length === 0) {
    return (
      <div className="import-preview-empty">
        Map at least one column to preview data
      </div>
    );
  }

  const previewRows = rows.slice(0, 10);

  return (
    <div className="import-preview">
      <h3 className="import-section-title">
        Preview <span className="import-preview-count">first {Math.min(10, rows.length)} of {rows.length} rows</span>
      </h3>
      <div className="import-preview-table-wrap">
        <table className="import-preview-table">
          <thead>
            <tr>
              <th className="import-preview-status">#</th>
              {activeFields.map((f) => (
                <th key={f}>{FIELD_LABELS[f]}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {previewRows.map((row, rowIdx) => {
              const isDup = duplicates.has(rowIdx);
              return (
                <tr key={rowIdx} className={isDup ? 'import-row-dup' : ''}>
                  <td className="import-preview-status">
                    {isDup ? (
                      <span className="import-dup-badge" title="Duplicate detected">DUP</span>
                    ) : (
                      rowIdx + 1
                    )}
                  </td>
                  {activeFields.map((f) => (
                    <td key={f}>{row[mapping[f]] || ''}</td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
