# IRIS Security Specification (Payload-First TDD)

## 1. Data Invariants
1. A `UserProfile` document at `/users/{userId}` can only be created, read, or updated by the authenticated, email-verified user whose `request.auth.uid == userId`.
2. A `UserPrivateInfo` document at `/users/{userId}/private/{infoId}` contains PII (`email`, `mobile`, `address`) and requires the parent `/users/{userId}` document to exist with `uid == request.auth.uid`. Cross-user reads and all `list` queries are denied.
3. An `AMRReport` document at `/reports/{reportId}` cannot exist without a valid `authorId` matching `request.auth.uid`, valid enum values (`source`, `dataType`, `resistanceFlag`, `visibility`), bounded string lengths, and server timestamps (`request.time`).
4. Public list/get access on `/reports` is strictly constrained to documents where `resource.data.visibility == 'PUBLIC'`. Private reports are only readable by `resource.data.authorId == request.auth.uid`.
5. `authorId`, `uid`, and `createdAt` are immutable after document creation.

## 2. The "Dirty Dozen" Adversarial Payloads (Must Return PERMISSION_DENIED)
1. **Unauthenticated Profile Creation:** Anonymous user attempts `create` on `/users/attacker_1`.
2. **Unverified Email Write:** Authenticated user with `email_verified: false` attempts `create` on `/reports/rep_1`.
3. **Cross-User Profile Read (PII Leak):** User A reads `/users/user_b/private/contact`.
4. **Shadow Field Injection (Ghost Field):** Verified user creates `/users/user_a` with an extra field `isAdmin: true`.
5. **Identity Spoofing on Report:** User A creates `/reports/rep_2` with `authorId: "user_b"`.
6. **Parentless Private Info (Orphaned Subcollection):** User A writes `/users/user_a/private/contact` before `/users/user_a` exists.
7. **Timestamp Forgery:** User A creates `/reports/rep_3` with a client-supplied past timestamp instead of `request.time`.
8. **Immutable Field Tampering:** User A updates `/reports/rep_1` attempting to change `authorId` or `createdAt`.
9. **Resource Exhaustion / ID Poisoning:** User A writes `/reports/` with a 1500-character document ID or invalid characters (`../hack`).
10. **Value Poisoning (Oversized Summary):** User A updates `/reports/rep_1` with a 5,000-character `summary` string exceeding the 500-character cap.
11. **Invalid Enum Injection:** User A creates `/reports/rep_4` with `resistanceFlag: "SUPER_CRITICAL"` or `visibility: "ADMIN_ONLY"`.
12. **Blanket Private Report Listing:** User A runs a `list` query on `/reports` without filtering to `visibility == 'PUBLIC'` or `authorId == userA.uid`, attempting to read User B's `PRIVATE` report.
