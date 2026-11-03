# RadioSatCare API contract

The whole API is two endpoints, implemented in `server/http/api.ts` and served by the Next.js route
`app/api/[...path]/route.ts`. The website only ever calls same-origin `/api/...`. There is no database,
no login and no admin area: each enquiry is emailed to `BUSINESS_EMAIL` and nothing is kept on the website.

## Error shape (every non-2xx JSON response)

```json
{ "ok": false, "error": { "code": "VALIDATION_ERROR", "message": "Human readable", "fields": { "email": "Enter a valid email address" } } }
```

`fields` is only present for `VALIDATION_ERROR`. Codes: `VALIDATION_ERROR` (400), `TOO_FAST` (400),
`FORBIDDEN` (403, foreign origin), `NOT_FOUND` (404), `RATE_LIMITED` (429), `INTERNAL_ERROR` (500),
`SEND_FAILED` (502, the email could not be delivered). Stack traces and internals are never sent.

## `GET /api/health`

`200 { "status": "ok" }`

## `POST /api/enquiries`

Body:

| field | type | rules |
|-------|------|-------|
| `fullName` | string | trimmed, 2-100, no control characters |
| `email` | string | valid email, <=254, lower-cased |
| `phone` | string | 7-20 chars; digits, spaces, `+ - ( )` only |
| `vehicle` | string, optional | <=120 (make and model) |
| `radioType` | string, optional | <=80 (radio / provider type if known) |
| `issueCategory` | enum | `activation` \| `signal` \| `channels` \| `subscription` \| `other` |
| `message` | string | trimmed, 10-2000, max 2 links |
| `preferredContact` | enum | `phone` \| `email` |
| `consent` | literal `true` | privacy-notice consent |
| `website` | string | honeypot, must be empty |
| `startedAt` | number | epoch ms when the form was rendered (time trap, min 2s) |
| `submissionId` | string | client-generated UUID (idempotency key) |

Responses:
- `201 { "ok": true, "reference": "RSC-7K3F9Q" }`: the email was delivered. The reference is in the email subject.
- `200 { "ok": true, "reference": "...", "duplicate": true }`: the same `submissionId`, or identical content from
  the same email, was already delivered in the last 10 minutes (kept in memory). Nothing is sent again.
- Honeypot tripped: answered as `201` with a fake reference, nothing is sent (bots learn nothing).
- `400 TOO_FAST` when submitted faster than 2 s; `400 VALIDATION_ERROR` with a `fields` map.
- `403 FORBIDDEN` when the `Origin` header names another site (the site's own origin is always accepted).
- `429 RATE_LIMITED` (default 5 enquiries per visitor IP per hour). Invalid or failed requests are not counted.
- `502 SEND_FAILED` when email delivery fails. Because no copy is kept, the visitor is told to retry or call.
  A retry with the same `submissionId` sends again (failures are never remembered as duplicates).

The visitor's IP is used in memory only for rate limiting. It is never stored, logged or emailed.
