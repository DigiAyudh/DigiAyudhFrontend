# Backend Developer Requirements — DigiAyudh Frontend Integration

This document specifies the backend API contract required by the frontend to support the following features:

1. **Sport Tickets & Sport Tokens** (client support ticket system)
2. **My Tasks** (employee personal + assigned tasks, to-do lists)
3. **Full Interaction Recording** (ticket reply/comment threads)
4. **Support Ticket Tokens** (per-client support credit balance)

> **Important:** The frontend is **production-bound** and uses the real backend at `VITE_API_URL` (default: `https://digiayudhbackend.vercel.app/api`). **No mocks are used.** All endpoints below must be implemented exactly as specified.

---

## ⚠️ RECENT FRONTEND CHANGES (REQUIRED BACKEND UPDATES)

These frontend changes were made and **require backend verification/updates**:

### A. New Client Sport Support Page (`/client/sport`)

A **new client-facing page** was added where the client posts any query/issue directly. This page creates **Sport Tickets** (NOT legacy support tickets). Backend must ensure:

| # | Requirement | Detail |
|---|-------------|--------|
| 1 | `GET /sport-tickets` | Must be accessible by **client** role to list their own tickets. When a client calls without `clientId`, the backend must **auto-filter to the logged-in client's own tickets** (never return other clients' tickets). |
| 2 | `POST /sport-tickets` | Must be accessible by **client** role. The backend must **NOT trust** the `clientId`/`clientName` from the request body — it must **override them with the JWT-authenticated client's `_id` and `name`**. The client must only be allowed to create tickets for their **own** projects (validate `projectId` belongs to the authenticated client). |
| 3 | `POST /sport-tickets/:id/reply` | Must be accessible by **client** role. Clients can only reply to their **own** tickets. |
| 4 | `GET /sport-tokens?clientId=<id>` | Must be accessible by **client** role so the client dashboard can display their token balance. Only return the authenticated client's own token. |
| 5 | `GET /projects?company=<company>` | Already used by client to populate the project selector on the Sport Support page. Ensure authenticated **clients** can list the projects assigned to them. |

### B. Admin "Sport Tokens" UI Removed

The admin **Sport Tokens page and route** (`/admin/sport-tokens`) were **removed from the frontend**. The backend endpoints (`POST /sport-tokens`, `PUT /sport-tokens/:id`) may remain for admin use, but the admin UI no longer calls them. The **GET** endpoints are still required because the **client dashboard** still displays the token balance.

### C. Sport Tickets Appear on BOTH Admin & Employee Dashboards

Client queries now flow into the shared `/sport-tickets` collection, so they appear on:
- **Admin**: "Sport Tickets" page + "Recent Support Tickets" section on the admin home dashboard.
- **Employee**: "Sport Tickets" page + "Client Support Tickets" section (filtered to the employee's assigned clients).

Backend must ensure `GET /sport-tickets` returns ALL tickets to **admin** (company-wide) and at least the tickets relevant to the **employee** (optionally based on their assigned clients / `assignedTo` filter).

### D. Role Access Matrix for Sport API

| Endpoint | admin | employee | client |
|----------|:-----:|:--------:|:------:|
| `GET /sport-tickets` | ✅ All | ✅ All / assigned | ✅ Own only |
| `GET /sport-tickets/:id` | ✅ | ✅ | ✅ Own only |
| `POST /sport-tickets` | ✅ | ✅ | ✅ Own projects only |
| `POST /sport-tickets/:id/reply` | ✅ | ✅ | ✅ Own only |
| `PUT /sport-tickets/:id` | ✅ | ✅ | ❌ |
| `DELETE /sport-tickets/:id` | ✅ | ❌ | ❌ |
| `GET /sport-tokens` | ✅ | ✅ | ✅ Own only |
| `GET /sport-tokens/:id` | ✅ | ✅ | ✅ Own only |
| `POST /sport-tokens` | ✅ | ❌ | ❌ |
| `PUT /sport-tokens/:id` | ✅ | ❌ | ❌ |

---

## Base URL

```
https://digiayudhbackend.vercel.app/api
```

All endpoints require the `Authorization: Bearer <token>` header (JWT issued after login).

---

## 1. Sport Tokens

Sport tokens represent a client's support credit balance. The admin **grants / adjusts** the balance, and the client's balance is **visible on the client dashboard**.

### Data Model — `SportToken`

```json
{
  "_id": "string",
  "clientId": "string",
  "clientName": "string",
  "balance": 0,
  "totalGranted": 0,
  "used": 0,
  "updatedAt": "ISO8601 date"
}
```

### Endpoints

| Method | Path | Description | Auth |
|--------|------|-------------|------|
| `GET` | `/sport-tokens` | List all tokens. Optional `?clientId=<id>` filters to one client. | admin, employee; client sees own only |
| `GET` | `/sport-tokens/:id` | Get a single token. | admin, employee; client sees own only |
| `POST` | `/sport-tokens` | Create a token for a client (first grant). Body: `{ clientId, clientName, balance, totalGranted, used }`. | admin |
| `PUT` | `/sport-tokens/:id` | Update a token (set new balance, add to totalGranted when granting). Body: `{ balance?, totalGranted?, used? }`. | admin |

**Notes:**
- `balance` must never go negative.
- When admin grants a **new** amount, frontend sends `{ balance: existingBalance + amount }` (or `{ balance: amount }` on first grant).
- When a reply is added to a ticket, the backend should increment `used` for the owning client's token.
- **Client role:** `GET /sport-tokens` without `clientId` must auto-filter to the authenticated client's own token.

### Expected Response Shape

All endpoints return:
```json
{
  "success": true,
  "message": "OK",
  "data": { ...sportToken } | [ ...sportTokens ]
}
```

---

## 2. Sport Tickets

Sport tickets are support requests tied to a **client** and a **specific project**. Both admin and employees manage them (read comments, write replies, change status). Clients can raise them from their dashboard.

### Data Model — `SportTicket`

```json
{
  "_id": "string",
  "subject": "string",
  "description": "string",
  "status": "not-picked-up | in-review | resolved | suspended",
  "priority": "low | medium | high | urgent",
  "category": "string",
  "clientId": "string",
  "clientName": "string",
  "projectId": "string",
  "projectName": "string",
  "createdBy": "string",
  "createdByName": "string",
  "assignedTo": "string | null",
  "screenshots": ["string url"],
  "replies": [
    {
      "authorId": "string",
      "authorName": "string",
      "message": "string",
      "screenshots": ["string url"],
      "createdAt": "ISO8601 date"
    }
  ],
  "createdAt": "ISO8601 date",
  "updatedAt": "ISO8601 date"
}
```

### Status Values

```
not-picked-up  →  in-review  →  resolved
                       ↘         suspended
```

### Endpoints

| Method | Path | Description | Auth |
|--------|------|-------------|------|
| `GET` | `/sport-tickets` | List all tickets. Optional `?clientId=<id>` filters to one client. | admin, employee |
| `GET` | `/sport-tickets/:id` | Get a single ticket with full replies. | admin, employee |
| `POST` | `/sport-tickets` | Create a ticket. Body: all model fields + `status: "not-picked-up"`. | admin, employee, client |
| `POST` | `/sport-tickets/:id/reply` | Add a reply. Body: `{ message, screenshots? }`. Appends to `replies[]`. | admin, employee, client |
| `PUT` | `/sport-tickets/:id` | Update ticket (e.g. change `status`, `assignedTo`, etc.). Body: partial fields. | admin, employee |
| `DELETE` | `/sport-tickets/:id` | Delete a ticket. | admin |

**Notes:**
- The `reply` endpoint must **increment** the owning client's `SportToken.used`.
- Optional `?projectId=<id>` filter to list tickets for a project.
- Optional `?assignedTo=<id>` filter for employee's assigned tickets.

### Expected Response Shape

Same as sport tokens:
```json
{
  "success": true,
  "message": "OK",
  "data": { ...sportTicket } | [ ...sportTickets ]
}
```

---

## 3. Full Interaction Recording (Reply/Comment Threads)

Each sport ticket maintains a **threaded comment history** (the `replies[]` array). The backend must:

1. **Append** to `replies[]` on every reply (never overwrite).
2. Preserve `authorId`, `authorName`, `message`, `screenshots[]`, and `createdAt` for each reply.
3. Return the **full updated ticket** (with all replies) after a reply is added so the frontend can render the complete thread.
4. Update `updatedAt` on the ticket whenever a reply or status change occurs.

---

## 4. My Tasks (Assigned Tasks + To-Do Lists)

The frontend consolidated employee task management into **"My Tasks"** (`/employee/my-tasks`). This shows:
- **Assigned Tasks** (from `/tasks` filtered by `assignedTo` = current user)
- **To-Do List** (personal checklist items from `/todos`)

### Existing Task Endpoints (already used)

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/tasks?company=<company>` | List tasks. Add `&projectId=<id>` to filter by project. |
| `POST` | `/tasks` | Create a task. |
| `PUT` | `/tasks/:id` | Update a task. |
| `DELETE` | `/tasks/:id` | Delete a task. |

The frontend filters tasks by `assignedTo === user._id` to show "My Tasks".

### To-Do List Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/todos?employeeId=<id>` | List to-dos for an employee. |
| `POST` | `/todos` | Create a to-do. Body: `{ taskId, employeeId, title, description?, priority, dueDate?, completed }`. |
| `PUT` | `/todos/:id` | Update a to-do (toggle complete, edit title, etc.). |
| `DELETE` | `/todos/:id` | Delete a to-do. |

### To-Do Model

```json
{
  "_id": "string",
  "taskId": "string",
  "employeeId": "string",
  "title": "string",
  "description": "string | null",
  "completed": false,
  "priority": "low | medium | high",
  "dueDate": "ISO8601 date | null",
  "createdAt": "ISO8601 date",
  "updatedAt": "ISO8601 date"
}
```

---

## 5. Support Tickets (Legacy / Client Support)

The existing client-facing support page (`/client/support`) was enhanced to include **project selection** and **screenshot upload**. Its data model is `SupportTicket`:

```json
{
  "_id": "string",
  "subject": "string",
  "description": "string",
  "priority": "low | medium | high | urgent",
  "status": "open | in-progress | resolved | closed",
  "category": "string",
  "createdBy": "string",
  "createdByName": "string",
  "assignedTo": "string | null",
  "projectId": "string | null",
  "screenshots": ["string url"],
  "replies": [
    { "authorId": "string", "authorName": "string", "message": "string", "createdAt": "ISO8601 date" }
  ],
  "createdAt": "ISO8601 date",
  "updatedAt": "ISO8601 date"
}
```

### Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/support?createdBy=<id>` | List tickets (optionally by creator). |
| `POST` | `/support` | Create a ticket. Body now includes `projectId` and `screenshots?`. |
| `POST` | `/support/:id/reply` | Reply to a ticket. Body: `{ message }`. |
| `PUT` | `/support/:id` | Update a ticket. |

---

## 6. Screenshot / Attachment Upload

Screenshots are uploaded via the **existing document upload endpoint** and stored as URLs. The frontend uploads the image, receives a URL, and sends that URL as part of the ticket/reply payload.

### Endpoint

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/documents` | Multipart upload. Uses `FormData` with `file` and `ownerId`. |

**Expected response** (must contain the file URL):
```json
{
  "success": true,
  "message": "OK",
  "data": { "url": "https://.../file.png" }
}
```

The frontend reads the URL from any of these possible response shapes:
- `res.data.url`
- `res.data.document.url`
- `res.data.data.url`

Please ensure at least one of these is present.

---

## 7. Client & Project Lookups Used by Sport Features

The sport ticket pages need to select a client and its project. The frontend uses these existing endpoints:

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/users/clients` | List clients (for client dropdown). |
| `GET` | `/projects?company=<company>` | List projects (for project dropdown). |

---

## 8. Summary of Required New Endpoints

| # | Method | Path | Purpose |
|---|--------|------|---------|
| 1 | `GET` | `/sport-tokens` | List / filter tokens |
| 2 | `GET` | `/sport-tokens/:id` | Get one token |
| 3 | `POST` | `/sport-tokens` | Create token (admin grant) |
| 4 | `PUT` | `/sport-tokens/:id` | Update token balance |
| 5 | `GET` | `/sport-tickets` | List / filter tickets |
| 6 | `GET` | `/sport-tickets/:id` | Get one ticket |
| 7 | `POST` | `/sport-tickets` | Create ticket |
| 8 | `POST` | `/sport-tickets/:id/reply` | Add reply (interaction recording) |
| 9 | `PUT` | `/sport-tickets/:id` | Update ticket (status, assignee) |
| 10 | `DELETE` | `/sport-tickets/:id` | Delete ticket |

---

## 9. Consistency Guidelines

- Use consistent response envelope: `{ success, message, data }`.
- Always return the **full updated resource** after create/update/reply so the frontend Redux state stays in sync.
- Use `_id` as the primary key (MongoDB-style).
- Store dates as ISO 8601 strings.
- Enforce role-based access control (admin full access; employee can manage assigned tickets; client can create/view own tickets).
- When a ticket reply is created, increment the owning client's `SportToken.used` and decrement effective balance accordingly.
- Do not allow negative token balances.

---

_This document is the source of truth for the backend contract. Any changes to the frontend's expected payloads must be reflected here._
