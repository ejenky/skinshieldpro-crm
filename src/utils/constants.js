export const STAGES = [
  { value: 'new',          label: 'New Lead',      color: '#3b82f6' },
  { value: 'contacted',    label: 'Contacted',     color: '#8b5cf6' },
  { value: 'consultation', label: 'Consultation',  color: '#f59e0b' },
  { value: 'treatment',    label: 'Treatment',     color: '#f97316' },
  { value: 'customer',     label: 'Customer',      color: '#22c55e' },
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
