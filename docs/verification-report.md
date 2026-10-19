# MeethaCart — FYP-I Verification Report
**Date:** 2026-10-19
**Auditor:** Antigravity AI Agent (code + live API test)
**Scope:** Milestones M1, M2, M3 + Extras
**Method:** Source code review + live API tests (server at localhost:5000, seeded in-memory MongoDB)

---

## 1. Feature Checklist

| # | Feature | Status | What Was Tested | Problem Found | Fixed? |
|---|---------|--------|-----------------|---------------|--------|
| 1a | Buyer & Seller sign-up | **Pass** | POST /api/auth/register — fields validated; seller requires bakeryName; buyer does not | None | — |
| 1b | OTP sent on sign-up, verified only after correct OTP | **Pass** | User created isVerified:false; set true only in verifyOtp; JWT issued only then | None | — |
| 1c | Login: email+password -> OTP -> JWT | **Pass** | Login step 1 sends OTP email (live); verify-login-otp issues JWT only on correct code | None | — |
| 1d | OTP edge cases | **Pass** | Wrong OTP -> "4 attempts remaining" (live); 5 wrong -> locked; consumed:true prevents reuse; 60s cooldown; 5-min expiry; 5/hour limit | None | — |
| 1e | Forgot password with OTP | **Pass** | Sends OTP; resets password with bcrypt; anti-enumeration: same response for unknown email | None | — |
| 1f | Passwords hashed, OTPs hashed, no secrets in code | **Partial** | bcrypt(12) passwords; bcrypt(10) OTPs; .env in .gitignore | Fallback JWT secret 'meethacart_jwt_secret' hardcoded in authController.js:9 and authMiddleware.js:26 | No (rec) |
| 1g | Logout + expired/invalid token rejected | **Pass** | protect middleware rejects invalid/expired JWT with 401 | No server-side blacklist (acceptable for FYP-I) | — |
| 2a | Role-based page guards (UI) | **Pass** | ProtectedRoute checks isAuthenticated + allowedRoles; wrong-role redirect works | None | — |
| 2b | Role-based API protection | **Pass** | No token -> 401; wrong role -> 403. Tested live: admin, seller, user routes all enforce correctly | None | — |
| 3a | View/edit profile, change language | **Pass (API)** | GET /api/users/me returns full profile; PUT /api/users/profile updates all fields incl. preferredLanguage | No profile edit UI screen in any dashboard | No (rec) |
| 3b | Urdu RTL layout | **Pass** | LanguageContext sets dir=rtl + Noto Nastaliq Urdu; [dir="rtl"] CSS rule; Welcome page bilingual | Not verified at 360px (Playwright unavailable) | — |
| 4 | Public seller profile + share link | **Pass** | GET /api/users/seller/:id public; shows isAvailable items only; share copies URL; 404 handled | Pending/blocked seller profile accessible with no status warning to buyer | No (rec) |
| 5 | Seller approval & blocking | **Partial** | Admin approve/block via PATCH /api/admin/sellers/:id/status; blocked seller gets 403 on login; pending gets 403 on item create | Blocked seller items NOT removed from public browse — getItems only checks isAvailable:true | No (rec) |
| 6a | Admin: list & search users | **Pass** | GET /api/admin/users?role=&search= tested live; paginated; UI has role filter + search | None | — |
| 6b | Admin: block/unblock buyers | **Fail** | No API endpoint exists. adminRoutes.js has no PATCH /users/:id/block. UserList.jsx has no block button. | WBS feature missing at both API and UI level | No |
| 6c | Add/edit/delete categories | **Pass** | All 3 CRUD endpoints tested live; duplicate name rejected; delete blocked when items attached (returns count) | None | — |
| 7 | Dashboard KPI counts match DB | **Pass (code)** | getMetrics uses 9 parallel countDocuments calls — always real-time from live DB | Not verified numerically (in-memory DB) | — |
| 8 | View all orders (admin) | **Pass** | GET /api/admin/orders returns {success, count, orders, note}; OrdersPlaceholder.jsx calls it; empty state shown | None | — |
| 9a | Add/edit/delete items (seller) | **Pass** | Required fields validated; price < 1 rejected; negative stock rejected; multer type/size checks; CRUD tested | None | — |
| 9b | Seller can only edit/delete own items | **Pass** | updateItem and deleteItem check item.seller !== req.user._id; non-owner gets 403 | None | — |
| 9c | Pending/blocked seller cannot add items | **Pass** | requireApprovedSeller middleware returns 403 for pending and blocked on all item write routes | None | — |
| 10 | Item search | **Pass** | ?search=cake -> 4 results (live); partial match; case-insensitive regex; no-results -> total=0; special chars -> 0, no crash | None | — |
| 11 | Category, price, seller filters | **Pass** | Category by slug; price 500-1000 -> 8 results; combined filter -> 4 results; min>max -> 0 (correct); seller filter works | None | — |
| 12 | Item details & browsing | **Partial** | Valid ID -> full details; nonexistent 24-char ID -> 404; guest browsing works | GET /api/items/not-a-valid-id returned 500 with raw Mongoose CastError | **YES — fixed, now returns 400** |
| 13 | Welcome/starting page & redirects | **Pass** | Splash sessionStorage skip; language picker; Browse/Sign in/Register links; returning guest logic; RTL on Urdu | None | — |
| 14 | Logo visible, tab title, favicon | **Pass (code)** | Logo component in Navbar/auth/splash/welcome/OTP/footer; HTML text; title tag; favicon.svg exists | Not verified in browser at breakpoints (Playwright unavailable) | — |
| 15 | Under Baking pages for unbuilt modules | **Pass** | 13 routes in underBakingRoutes.js (cart/wishlist/checkout/orders/wallet/notifications/custom-requests/messages/classes/reviews/analytics x3); NotFound.jsx; role protection applied | None | — |
| 16 | Realistic wording, PKR, no Lorem ipsum | **Pass** | All descriptions use real Pakistani bakery language; PKR prices; no Lorem ipsum in seed or UI | Minor: fallback bio in userController.js:102 is generic | — |

---

## 2. Bugs Found

| Severity | Bug | Reproduce | Fixed? |
|----------|-----|-----------|--------|
| High | GET /api/items/not-a-valid-id returned 500 with raw Mongoose CastError | GET http://localhost:5000/api/items/not-hex | YES — returns 400 with clean message |
| Medium | Route ordering: /seller/my-items registered after /:id in itemRoutes.js — Express matched "seller" as item ID | GET /api/items/seller/my-items with valid token attempted findById("seller") | YES — moved /seller/my-items before /:id |
| Medium | Register.jsx used bakeryName/setBakeryName without declaring state — white/blank screen on Seller tab | Go to /register -> click Seller (Baker) tab | YES — useState('') added |
| Medium | Blocked seller items remain in public browse — getItems only filters isAvailable:true, not sellerStatus | Approve seller, add items, block seller — items still in /items browse | No — Recommendation |
| Medium | Admin cannot block/unblock buyers — no API route or UI button | Try to block a buyer from /admin/users | No — Feature missing |
| Low | Pending/blocked seller profile accessible with no status notice | Visit /seller/:id with a pending seller's ID | No — Recommendation |
| Low | No profile edit UI in any dashboard | Try to find Edit Profile in buyer/seller dashboard | No — Recommendation |

---

## 3. Security Findings

| Severity | Finding |
|----------|---------|
| Medium | Fallback JWT secret 'meethacart_jwt_secret' hardcoded in authController.js:9 and authMiddleware.js:26. If .env is absent, tokens can be forged. Recommendation: throw on startup if JWT_SECRET not set. |
| Medium | Blocked seller items visible in public browse (Bug #4). |
| Low | SMTP app password in plain text in server/.env — gitignored but risk if repo goes public. |
| Low | 4 frontend files hardcode http://localhost:5000 for /uploads/ images (ItemCard, ItemDetails, AddEditItem, SellerItems). Breaks on any non-local host. |
| Pass | Email enumeration protected on forgot-password: same response for known/unknown email. |
| Pass | All protected routes return 401/403 correctly — verified live. |
| Pass | Item ownership enforced server-side — cross-seller edit/delete returns 403. |
| Pass | OTP bcrypt-hashed in DB; single-use enforced; 5-attempt lockout confirmed. |

---

## 4. UI vs API Discrepancies

| Description | Direction |
|-------------|-----------|
| Image URLs hardcoded to localhost:5000 | UI-only problem — breaks on any other host |
| Profile edit | API works, no UI screen exists |
| Admin block/unblock buyers | Both missing |
| Blocked seller items in browse | API blocks management but existing items not removed from listing |

---

## 5. What Was NOT Tested (and Why)

- Browser rendering at 360/768/1280px: Playwright driver unavailable (404 from playwright.azureedge.net). All UI reviewed via code.
- Automated Jest + Supertest: No test directory exists in the project.
- Full 5-attempt OTP lockout live: Confirmed "4 attempts remaining" on first wrong OTP; full lock confirmed via otpService.js code reading.
- Blocked seller login live: Confirmed via code (authController.js L213) — returns 403. Not tested live end-to-end.

---

## Final Verdict

> **Ready for FYP-I M1 to M3 demo: YES — with 5 reservations**

**Why YES:** Core auth (register, 2FA login, forgot/reset password), role-based API and UI access, item management (CRUD, search, filter, details), admin panel (seller approval, category CRUD, user listing, orders empty state), welcome/splash/language/RTL, and Under-Baking fallbacks all work. 3 bugs fixed during this audit.

**5 reservations an examiner may ask about:**
1. Admin cannot block buyers — WBS requirement, not implemented at API or UI level.
2. Blocked seller items stay in browse — only availability toggle hides them.
3. No profile edit UI — API exists but no screen to reach it.
4. Hardcoded fallback JWT secret — security issue if .env is missing.
5. Image URLs hardcoded to localhost:5000 — breaks in any real deployment.
