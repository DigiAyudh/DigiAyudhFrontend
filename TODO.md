# Fix "meetings is not iterable" Render Error

## Goal
Fix `TypeError: meetings is not iterable` at `AdminMeetingsPage.tsx:181` caused by `meetings` in Redux state being `undefined` (backend response shape mismatch overwrites initial `[]`).

## Status: COMPLETE

## Steps

- [x] 1. `src/redux/slices/businessSlice.ts`: Add `extractArray<T>()` helper to safely unwrap arrays from various backend response shapes (`{ data: [...] }`, `{ meetings: [...] }`, `{ data: { meetings: [...] } }`, plain array, undefined → `[]`).
- [x] 2. `src/redux/slices/businessSlice.ts`: Apply helper in `fetchMeetings` (fixes reported crash for AdminMeetingsPage + shared/MeetingsPage).
- [x] 3. `src/redux/slices/businessSlice.ts`: Apply helper to `fetchInvoices`, `fetchDocuments`, `fetchAuditLogs`, `fetchAttendance` to prevent same crash class.
- [x] 4. `src/redux/slices/businessSlice.ts`: Make `createMeeting`/`updateMeeting`/`deleteMeeting` reducers defensive (guard array before mutation).
- [x] 5. `src/pages/admin/AdminMeetingsPage.tsx`: Guard sort with `Array.isArray(meetings) ? meetings : []`.
- [x] 6. `src/pages/shared/MeetingsPage.tsx`: Same defensive guard.
- [x] 7. Verify: `npm run build` — succeeded, `dist/` generated.
- [x] 8. Verify: `npm run dev` — Meetings pages render without crash (state always an array now).

## Note
- `src/pages/admin/LeaveRequestsPage.tsx` line 55 TS error (`status` property) is pre-existing and unrelated to this fix.

