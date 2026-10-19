# MeethaCart — FYP Milestones Checklist & Defense Tracker

This checklist tracks the implementation, security validations, and test evidence for the Final Year Project defense.

---

## Milestone 1 (M1): Role-Based Auth & Profile Management
- [x] User Model with strict validation (`buyer`, `seller`, `admin`, language pref)
- [x] Otp Model with bcrypt hashing & 5-minute MongoDB TTL
- [x] OTP Rules Implementation:
  - [x] 6-digit generation
  - [x] Hash comparison (never plain text in DB)
  - [x] Single-use enforcement (`consumed` flag)
  - [x] Maximum 5 wrong attempts lock
  - [x] 60-second resend cooldown timer
  - [x] Hourly rate limit (max 5 requests/hour per email)
- [x] Email Service with `EMAIL_MODE=dev` console output & SMTP config
- [x] Signup flow for Buyer & Seller with OTP verification
- [x] Login flow for all roles (email + password $\to$ fresh OTP $\to$ JWT)
- [x] Forgot & Reset password flow with OTP
- [x] Express JWT Authentication Middleware
- [x] Express Role-Based Authorization Middleware (`buyer`, `seller`, `admin`)
- [x] User Profile APIs (Get my profile, Update profile & language)
- [x] Public Baker Profile (`/seller/:id`) with shareable link
- [x] Seller approval gating (Sellers start as `pending`, blocked from adding items)
- [x] Client Auth Screens (Login, Register, OTP Verify, Forgot Password, Reset Password)
- [x] Bilingual UI dictionary foundation (`en.json`, `ur.json`) & toggle

---

## Milestone 2 (M2): Admin Panel
- [x] Admin Dashboard KPI metrics API (Users, Sellers, Pending, Items)
- [x] Seller Approval / Rejection / Blocking API & UI table
- [x] User Management API & view
- [x] Category Management (CRUD with name, slug, description, image)
- [x] Integrity check: prevent deleting categories with attached items
- [x] Orders Audit API & Empty State UI (ready for M4 orders module)
- [x] Client Admin Layout with responsive sidebar & role protection

---

## Milestone 3 (M3): Bakery Item Management, Browsing & Catalog
- [x] Item Model with seller ref, category ref, price, stock, prep time, eggless flag
- [x] Multer upload middleware with file type validation (.jpg, .jpeg, .png, .webp) & 5MB size limit
- [x] Seller item management (Add, Edit, Delete, Stock toggle) restricted to approved sellers
- [x] Ownership validation (Sellers can only modify their own items)
- [x] Public item catalog API with multi-criteria search & filtering
  - [x] Keyword search (title & description)
  - [x] Category filter
  - [x] Price range slider ($min \to max$)
  - [x] Seller filter
  - [x] Pagination & sorting
- [x] Public Item Details Page with image gallery and seller card
- [x] Public Baker Storefront Page listing their items
- [x] Warm bakery UI theme (cream, caramel, chocolate) with responsive cards & filters

---

## Seed Data & Testing Checklist
- [x] Database Seeder Script:
  - [x] 1 Admin (Dedicated env-configured account)
  - [x] 3 Sellers (2 approved, 1 pending)
  - [x] 3 Buyers
  - [x] 5 Categories (Custom Cakes, Traditional Mithai, Artisanal Breads, Cookies & Biscuits, Cupcakes)
  - [x] 20 Sample bakery items with realistic pricing, prep times, and descriptions
- [x] Automated / manual verification for:
  - [x] Expired OTP rejection
  - [x] Wrong OTP attempt tracking & 5-strike lock
  - [x] Reused OTP rejection
  - [x] 60s cooldown enforcement
