import { CONTACT_FIELDS } from '../../utils/csvParser';

const FIELD_LABELS = {
  gym_name: 'Gym Name',
  contact_name: 'Contact Name',
  phone: 'Phone',
  email: 'Email',
  website: 'Website',
  address: 'Address',
  city: 'City',
  state: 'State',
  zip: 'Zip',
  gym_type: 'Gym Type',
};

export default function ColumnMapper({ headers, mapping, onChange }) {
  return (
    <div className="column-mapper">
      <h3 className="import-section-title">Map Columns</h3>
      <p className="import-section-desc">
        Match your CSV columns to contact fields. Auto-detected mappings are pre-filled.
      </p>
      <div className="mapper-grid">
        {CONTACT_FIELDS.map((field) => (
          <div key={field} className="mapper-row">
            <label className="mapper-label">{FIELD_LABELS[field]}</label>
            <select
              value={mapping[field] !== undefined ? mapping[field] : ''}
              onChange={(e) => {
                const val = e.target.value;
                onChange({
                  ...mapping,
                  [field]: val === '' ? undefined : Number(val),
                });
              }}
            >
              <option value="">-- Skip --</option>
              {headers.map((h, idx) => (
                <option key={idx} value={idx}>{h || `Column ${idx + 1}`}</option>
              ))}
            </select>
          </div>
        ))}
      </div>
    </div>
  );
}
