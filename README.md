<p align="center">
  <img src="client/public/logo-mark.svg" alt="MeethaCart Logo" width="80" height="80" />
</p>

# MeethaCart

**Handcrafted & Artisanal Bakery Marketplace**

MeethaCart connects passionate home bakers across Pakistan with customers who appreciate fresh, preservative-free artisanal cakes, traditional mithai, pastries, and savory bakes.

---

## 🎨 Brand Identity

The official brand mark is the **"SL" geometric monogram**:
- A squared `S` whose lower-left segment is drawn in an accent color (`--logo-accent`), forming a hidden `L` together with the top-left and bottom bars.
- Vector assets:
  - `client/public/logo-mark.svg` (for light backgrounds)
  - `client/public/logo-mark-light.svg` (for dark backgrounds)
  - `client/public/favicon.svg` (with `prefers-color-scheme` support)
- React Component: `client/src/components/common/Logo.jsx`

### Regenerating App Icons
To rebuild the raster assets (`favicon.ico`, `apple-touch-icon.png`, `icon-192.png`, `icon-512.png`, `logo-mark.png`):
```bash
cd client
npm run generate-icons
```

---

## 🚀 Running the Project

### Prerequisites
- Node.js (v18+)
- MongoDB (local or MongoDB Atlas connection string)

### 1. Backend Setup
```bash
cd server
npm install
node scripts/seed.js   # Seeds Milestone 3 Karachi demo dataset
npm run dev            # Starts server on http://localhost:5000
```

### 2. Frontend Setup
```bash
cd client
npm install
npm run dev            # Starts Vite development server on http://localhost:5173
```
