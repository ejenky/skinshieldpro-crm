## Commands
- npm run dev — Local dev server (port 5173)
- npm run build — Production build for Netlify
- npm run preview — Preview production build locally

## Build Order
1. PocketBase client setup (lib/pocketbase.js)
2. Create PocketBase collections via admin UI or migration
3. Auth hook + Login page
4. Layout (Sidebar + TopBar + Layout wrapper)
5. Dashboard page with stat cards
6. Contacts table with search/filter
7. Contact detail panel with activity logging
8. Pipeline kanban board
9. CSV import page
10. Settings page
11. Polish: loading states, error handling, empty states, mobile responsive

## Rules
- All data operations go through PocketBase JS SDK
- Mobile-responsive: sidebar collapses, table becomes card view
- Stage changes always auto-log an activity
- Phone numbers display formatted but store raw digits
- Dates display relative ("2 hours ago") when recent, absolute when older
- Dark theme only (no light mode toggle needed)
- Do NOT modify any existing PocketBase collections

## File Structure
src/
├── main.jsx
├── App.jsx                    — Router setup
├── lib/
│   └── pocketbase.js          — PocketBase client init
├── hooks/
│   ├── useContacts.js         — CRUD operations for contacts
│   ├── useActivities.js       — CRUD for activities
│   ├── useAuth.js             — Auth state and operations
│   └── useDashboardStats.js   — Aggregated stats queries
├── components/
│   ├── layout/
│   │   ├── Sidebar.jsx
│   │   ├── TopBar.jsx
│   │   └── Layout.jsx
│   ├── contacts/
│   │   ├── ContactTable.jsx
│   │   ├── ContactDetail.jsx
│   │   ├── ContactForm.jsx
│   │   └── StageBadge.jsx
│   ├── pipeline/
│   │   ├── KanbanBoard.jsx
│   │   ├── KanbanColumn.jsx
│   │   └── KanbanCard.jsx
│   ├── activities/
│   │   ├── ActivityFeed.jsx
│   │   ├── ActivityEntry.jsx
│   │   └── AddActivity.jsx
│   ├── dashboard/
│   │   ├── StatCards.jsx
│   │   ├── PipelineOverview.jsx
│   │   └── RecentActivity.jsx
│   └── import/
│       ├── CSVUploader.jsx
│       ├── ColumnMapper.jsx
│       └── ImportPreview.jsx
├── pages/
│   ├── LoginPage.jsx
│   ├── DashboardPage.jsx
│   ├── ContactsPage.jsx
│   ├── PipelinePage.jsx
│   ├── ContactDetailPage.jsx
│   ├── ImportPage.jsx
│   └── SettingsPage.jsx
└── utils/
    ├── csvParser.js
    ├── formatters.js
    └── constants.js
