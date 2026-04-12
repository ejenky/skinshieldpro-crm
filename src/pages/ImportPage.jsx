import { useState, useCallback, useMemo } from 'react';
import pb from '../lib/pocketbase';
import CSVUploader from '../components/import/CSVUploader';
import ColumnMapper from '../components/import/ColumnMapper';
import ImportPreview from '../components/import/ImportPreview';
import { parseCSV, autoMapHeaders, CONTACT_FIELDS } from '../utils/csvParser';
import { useToast } from '../components/layout/layoutContext';
import './ImportPage.css';

const STEPS = { UPLOAD: 0, MAP: 1, IMPORTING: 2, DONE: 3 };

export default function ImportPage() {
  const [step, setStep] = useState(STEPS.UPLOAD);
  const [fileName, setFileName] = useState('');
  const [headers, setHeaders] = useState([]);
  const [rows, setRows] = useState([]);
  const [mapping, setMapping] = useState({});

  // Import state
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState({ imported: 0, skipped: 0, errors: 0 });

  // Existing contacts for dupe detection (loaded once before import)
  const [existingContacts, setExistingContacts] = useState([]);
  const addToast = useToast();

  const handleFileParsed = useCallback((text, name) => {
    const parsed = parseCSV(text);
    if (parsed.length < 2) return; // need header + at least one row
    const hdrs = parsed[0];
    const dataRows = parsed.slice(1).filter((r) => r.some((cell) => cell.trim()));
    setHeaders(hdrs);
    setRows(dataRows);
    setFileName(name);
    setMapping(autoMapHeaders(hdrs));
    setStep(STEPS.MAP);
    setResults({ imported: 0, skipped: 0, errors: 0 });
    setProgress(0);
  }, []);

  // Duplicate detection
  const duplicates = useMemo(() => {
    const dups = new Set();
    if (existingContacts.length === 0 || rows.length === 0) return dups;

    const phoneIdx = mapping.phone;
    const gymIdx = mapping.gym_name;
    const cityIdx = mapping.city;

    // Build lookup sets from existing contacts
    const existingPhones = new Set();
    const existingGymCity = new Set();
    for (const c of existingContacts) {
      if (c.phone) existingPhones.add(c.phone.replace(/\D/g, ''));
      if (c.gym_name && c.city) {
        existingGymCity.add(`${c.gym_name.toLowerCase().trim()}|${c.city.toLowerCase().trim()}`);
      }
    }

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      // Phone match
      if (phoneIdx !== undefined && row[phoneIdx]) {
        const digits = row[phoneIdx].replace(/\D/g, '');
        if (digits && existingPhones.has(digits)) { dups.add(i); continue; }
      }
      // Gym name + city match
      if (gymIdx !== undefined && cityIdx !== undefined && row[gymIdx] && row[cityIdx]) {
        const key = `${row[gymIdx].toLowerCase().trim()}|${row[cityIdx].toLowerCase().trim()}`;
        if (existingGymCity.has(key)) { dups.add(i); continue; }
      }
    }
    return dups;
  }, [existingContacts, rows, mapping]);

  const loadExisting = useCallback(async () => {
    try {
      const all = await pb.collection('contacts').getFullList({
        fields: 'id,phone,gym_name,city',
      });
      setExistingContacts(all);
    } catch (err) {
      console.error('Failed to load existing contacts:', err);
    }
  }, []);

  // Load existing contacts when entering MAP step
  const handleMappingReady = useCallback(async () => {
    await loadExisting();
  }, [loadExisting]);

  // Trigger the load when step changes to MAP
  // (called via effect-like pattern from handleFileParsed, but we need
  // to call after state settles — use a ref-less approach)
  useState(() => {
    // This runs only once on mount — we'll call loadExisting from the
    // start-import handler instead, so duplicates are fresh.
  });

  const handleStartImport = useCallback(async () => {
    // Refresh existing contacts for accurate dupe detection
    await loadExisting();

    setStep(STEPS.IMPORTING);
    setProgress(0);

    let imported = 0;
    let skipped = 0;
    let errors = 0;
    const total = rows.length;

    // Re-build dupe sets with fresh data
    const freshExisting = await pb.collection('contacts').getFullList({
      fields: 'id,phone,gym_name,city',
    });
    const existingPhones = new Set();
    const existingGymCity = new Set();
    for (const c of freshExisting) {
      if (c.phone) existingPhones.add(c.phone.replace(/\D/g, ''));
      if (c.gym_name && c.city) {
        existingGymCity.add(`${c.gym_name.toLowerCase().trim()}|${c.city.toLowerCase().trim()}`);
      }
    }

    for (let i = 0; i < total; i++) {
      const row = rows[i];

      // Build contact data from mapping
      const data = { stage: 'new', source: 'scraper' };
      for (const field of CONTACT_FIELDS) {
        if (mapping[field] !== undefined && row[mapping[field]]) {
          let val = row[mapping[field]].trim();
          // Store phone as raw digits
          if (field === 'phone') val = val.replace(/\D/g, '');
          data[field] = val;
        }
      }

      // Duplicate check
      let isDup = false;
      if (data.phone) {
        const digits = data.phone;
        if (existingPhones.has(digits)) isDup = true;
      }
      if (!isDup && data.gym_name && data.city) {
        const key = `${data.gym_name.toLowerCase().trim()}|${data.city.toLowerCase().trim()}`;
        if (existingGymCity.has(key)) isDup = true;
      }

      if (isDup) {
        skipped++;
      } else {
        try {
          await pb.collection('contacts').create(data);
          imported++;
          // Add to lookup sets so subsequent rows in this batch also get deduped
          if (data.phone) existingPhones.add(data.phone);
          if (data.gym_name && data.city) {
            existingGymCity.add(`${data.gym_name.toLowerCase().trim()}|${data.city.toLowerCase().trim()}`);
          }
        } catch (err) {
          errors++;
          console.error(`Row ${i + 1} import error:`, err);
        }
      }

      setProgress(Math.round(((i + 1) / total) * 100));
      setResults({ imported, skipped, errors });
    }

    setStep(STEPS.DONE);
    if (errors > 0) {
      addToast(`Import finished with ${errors} error${errors !== 1 ? 's' : ''}`, 'error');
    } else {
      addToast(`Imported ${imported} contact${imported !== 1 ? 's' : ''} successfully`);
    }
  }, [rows, mapping, loadExisting, addToast]);

  const handleReset = useCallback(() => {
    setStep(STEPS.UPLOAD);
    setFileName('');
    setHeaders([]);
    setRows([]);
    setMapping({});
    setResults({ imported: 0, skipped: 0, errors: 0 });
    setProgress(0);
    setExistingContacts([]);
  }, []);

  return (
    <div className="import-page">
      <h2 className="import-title">Import Contacts</h2>

      {step === STEPS.UPLOAD && (
        <CSVUploader onFileParsed={handleFileParsed} />
      )}

      {step === STEPS.MAP && (
        <>
          <div className="import-file-info">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
            </svg>
            <span>{fileName}</span>
            <span className="import-file-rows">{rows.length} rows</span>
            <button className="import-file-change" onClick={handleReset}>Change file</button>
          </div>

          <ColumnMapper
            headers={headers}
            mapping={mapping}
            onChange={(newMapping) => { setMapping(newMapping); handleMappingReady(); }}
          />

          <ImportPreview
            rows={rows}
            mapping={mapping}
            duplicates={duplicates}
          />

          <div className="import-actions">
            {duplicates.size > 0 && (
              <span className="import-dup-notice">
                {duplicates.size} duplicate{duplicates.size !== 1 ? 's' : ''} will be skipped
              </span>
            )}
            <button className="btn-secondary" onClick={handleReset}>Cancel</button>
            <button
              className="btn-primary"
              onClick={handleStartImport}
              disabled={!CONTACT_FIELDS.some((f) => mapping[f] !== undefined)}
            >
              Import {rows.length - duplicates.size} Contact{rows.length - duplicates.size !== 1 ? 's' : ''}
            </button>
          </div>
        </>
      )}

      {(step === STEPS.IMPORTING || step === STEPS.DONE) && (
        <div className="import-progress-section">
          <div className="import-progress-bar-track">
            <div
              className="import-progress-bar-fill"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="import-progress-pct">{progress}%</span>

          <div className="import-summary">
            <div className="import-summary-card import-summary-card--success">
              <span className="import-summary-value">{results.imported}</span>
              <span className="import-summary-label">Imported</span>
            </div>
            <div className="import-summary-card import-summary-card--warn">
              <span className="import-summary-value">{results.skipped}</span>
              <span className="import-summary-label">Duplicates Skipped</span>
            </div>
            <div className="import-summary-card import-summary-card--error">
              <span className="import-summary-value">{results.errors}</span>
              <span className="import-summary-label">Errors</span>
            </div>
          </div>

          {step === STEPS.DONE && (
            <div className="import-done-actions">
              <button className="btn-primary" onClick={handleReset}>Import Another File</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
