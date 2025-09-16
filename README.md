# Barcode Generator

Mobile-first web application for generating, previewing, printing, saving, and managing history of barcodes (EAN-13, UPC, Code 128) using pure frontend technologies.

## Features

- Generate valid random EAN-13 and UPC codes (with correct check digit)
- Support for Code 128 arbitrary alphanumeric values
- Manual entry with validation per barcode type
- Step-based UX (Generate -> Preview -> History)
- Live barcode rendering via [JsBarcode](https://github.com/lindell/JsBarcode)
- Print multiple copies with selectable label size
- Save barcode as PNG image
- Local history (persisted in `localStorage`, capped at 50 items) with one-click reprint
- Responsive, mobile-first Tailwind UI

## Tech Stack

- HTML + Vanilla JavaScript (no build framework required)
- [JsBarcode](https://github.com/lindell/JsBarcode) for barcode rendering
- [Tailwind CSS](https://tailwindcss.com/) for styling (custom component classes via `@layer components`)
- Live development via `live-server`

## Project Structure

```
barcode-gen/
├── index.html          # Main application (logic + UI)
├── src/
│   └── input.css       # Tailwind source (components layer)
├── style.css           # Generated Tailwind CSS output
├── tailwind.config.js  # Tailwind config (content paths + primary palette)
├── postcss.config.js   # PostCSS / Tailwind runner config
├── package.json        # Scripts & dependencies
└── node_modules/       # Installed packages
```

## Getting Started

### 1. Install Dependencies

```powershell
npm install
```

### 2. Build Tailwind (one-off build)

```powershell
npm run build
```

Or watch for changes during development:

```powershell
npm run build:css
```

### 3. Start Dev Server

```powershell
npm start
```

This serves `index.html` (default: http://127.0.0.1:8080 or similar port shown in console).

> Alternatively you can drop the folder into any static server (XAMPP/Apache, nginx, etc.). Ensure `style.css` is built first.

## Usage Guide

1. Click **Create New Barcode** or **Generate Random Barcode**
2. Choose a barcode type (EAN-13, UPC, Code 128)
3. (If manual) enter a value:
   - EAN-13: exactly 13 digits (last digit can be auto-generated externally if needed)
   - UPC: exactly 12 digits
   - Code 128: any 1+ character alphanumeric string (current random set: A–Z, 0–9)
4. Button **Next: Preview** activates once input passes validation
5. In Preview step:
   - Adjust Label Size (UI selection currently cosmetic; logic placeholder for future scaling)
   - Set Number of Copies
   - Click **Print** (opens printable window & triggers system print) OR **Save** (downloads PNG)
6. After action you’re taken to **History** where previous barcodes appear (newest first)
7. Use **Reprint** to jump back to Preview for that barcode
8. Click **Generate New Barcode** to begin again

## Barcode Generation Details

- EAN-13: Generates 12 random digits, computes check digit using weight pattern (1,3,...)
- UPC: Generates 11 random digits, computes check digit using standard weighting
- Code 128: Random 6–13 length string from A–Z0–9 (subset of full spec for simplicity)

## Data Persistence

History is stored in `localStorage` under key `barcodeHistory` (array of up to 50 records). Clearing browser storage resets history.

## Customization

### Tailwind Component Classes

Defined in `src/input.css` under `@layer components`:

- `.step-card`
- `.btn-primary`
- `.btn-secondary`
- `.form-select`
- `.form-input`
- `.barcode-item`

Update styles then rebuild CSS (`npm run build`).

### Adding More Barcode Types

1. Add `<option>` to the `#barcode-type` select
2. Extend `generateRandomBarcode()` and validators in `validateBarcodeInput()`
3. Confirm JsBarcode supports the format (see docs)

### Adjusting Print Layout

Modify the inline `<style>` template inside `printBarcode()` for page margins, sizing, or label formatting.

## Production Deployment

Since it’s static:

1. Run `npm run build`
2. Deploy `index.html`, `style.css`, and `node_modules/jsbarcode/dist/JsBarcode.all.min.js` (or bundle that file separately)
3. (Optional) Inline or self-host `JsBarcode` in a `vendor/` folder to avoid shipping full `node_modules`

## Potential Improvements

- Scale canvas / label size dynamically based on selected size
- Add QR or DataMatrix support (would need different library)
- Drag-and-drop batch generation
- Export history (JSON/CSV)
- Dark mode toggle
- PWA install capability & offline caching
- Accessibility enhancements (focus states, aria labels)

## Contributing

1. Fork and clone
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Make changes + `npm run build`
4. Commit & push, open PR

Please keep PRs focused and include a brief summary.

## License

MIT © 2025

---

Enjoy building! Let me know if you’d like CI, tests, or added formats.
