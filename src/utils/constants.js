export const STAGES = [
  { value: 'new',            label: 'New Lead',        color: '#6366f1' },
  { value: 'contacted',      label: 'Contacted',       color: '#f59e0b' },
  { value: 'interested',     label: 'Interested',      color: '#10b981' },
  { value: 'sample_sent',    label: 'Sample Sent',     color: '#8b5cf6' },
  { value: 'customer',       label: 'Customer',        color: '#06b6d4' },
  { value: 'not_interested', label: 'Not Interested',  color: '#ef4444' },
];

export const STAGE_MAP = Object.fromEntries(
  STAGES.map((s) => [s.value, s])
);

export const GYM_TYPES = [
  { value: 'crossfit',   label: 'CrossFit' },
  { value: 'yoga',       label: 'Yoga' },
  { value: 'pilates',    label: 'Pilates' },
  { value: 'mma',        label: 'MMA' },
  { value: 'climbing',   label: 'Climbing' },
  { value: 'boutique',   label: 'Boutique' },
  { value: 'globo',      label: 'Globo Gym' },
  { value: 'other',      label: 'Other' },
];

export const US_STATES = [
  'AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA',
  'HI','ID','IL','IN','IA','KS','KY','LA','ME','MD',
  'MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ',
  'NM','NY','NC','ND','OH','OK','OR','PA','RI','SC',
  'SD','TN','TX','UT','VT','VA','WA','WV','WI','WY',
];

export const ACTIVITY_TYPES = [
  { value: 'call',    label: 'Call' },
  { value: 'email',   label: 'Email' },
  { value: 'note',    label: 'Note' },
  { value: 'meeting', label: 'Meeting' },
  { value: 'stage_change', label: 'Stage Change' },
];
