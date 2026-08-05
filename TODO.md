# TODO: Sport Support for Admin/Employee + Remove Admin Sport Tokens

## Steps
- [x] 1. Remove "Sport Tokens" (coin) from admin navigation (navigation.ts) + remove unused Coins import
- [x] 2. Remove `/admin/sport-tokens` route and its import (App.tsx)
- [x] 3. Create new client Sport Support page `/client/sport` (ClientSportPage.tsx)
- [x] 4. Add "Sport Support" item to client navigation (navigation.ts)
- [x] 5. Add `/client/sport` route (App.tsx)
- [x] 6. Update ClientDashboard "Sport Support" section link to point to `/client/sport`
- [x] 7. Verify build/typecheck (build passed successfully)
- [x] 8. Write complete backend instructions in request.backend.md
- [x] 9. Fix Sport ticket status display: add missing sport statuses (`not-picked-up`, `suspended`) to StatusBadge

## Summary
- Client "Sport Support" now creates **sport tickets** via the `/sport-tickets` API, which appear on **both** admin and employee dashboards.
- "Sport Tokens" (coin) option removed from admin navigation and route.
- Backend instructions written to `request.backend.md`.
- Fixed sport ticket status badge rendering on the client side (missing statuses `not-picked-up` and `suspended` now display correctly).
