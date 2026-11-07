# GuestPulse — RSVP & Event Guest-List Tracker

A modern, high-performance RSVP & Guest-List Tracker built with **pure vanilla HTML, CSS, and JavaScript**. Zero dependencies, zero frameworks, no backend required, and persistent client-side data storage via `localStorage`.

![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/Vanilla_CSS-1572B6?style=flat&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/Vanilla_JS-F7DF1E?style=flat&logo=javascript&logoColor=black)
![License](https://img.shields.io/badge/License-MIT-green.svg)

---

## ✨ Features

- **📊 Live Event Dashboard & Capacity Gauge**
  - Track total invited guests and overall headcount including plus-ones.
  - Real-time attendance capacity progress bar showing remaining seats against venue limits.
  - Instant breakdown counters for Confirmed (Attending), Awaiting Reply (Pending), Declined, and Day-of Checked In.

- **👥 Complete Guest Directory & CRUD**
  - Add, edit, and delete guests with detailed records.
  - Track contact info (Email, Phone), Circle/Group (Family, Friends, VIP, Colleagues, Wedding Party, etc.).
  - Plus-one companion names and headcounts.
  - Table seating assignments and special accommodation notes.
  - One-click day-of event check-in toggle.
  - Quick RSVP status cycling directly from table rows.

- **🔍 Search, Filter & Multi-Sort Engine**
  - Instant real-time fuzzy search across names, emails, phone numbers, notes, and tables.
  - Filter by RSVP status, group category, check-in state, or specific dietary restriction.
  - Sort by Name (A-Z / Z-A), Status priority, Party size, Table number, or Date added.

- **⚡ Bulk Operations**
  - Select all or multiple guests to bulk mark as Attending, Declined, Check-in, or Delete with a single click.

- **🍽️ Catering & Allergen Summary View**
  - Aggregated metrics for special diets: Vegetarian, Vegan, Gluten-Free, Halal, Kosher, Nut Allergy, Dairy-Free, and Shellfish Allergy.
  - Dedicated catering sheet ready to print for venue chefs and caterers.

- **🪑 Tables & Seating Chart**
  - Automatic grouping of confirmed guests by table with seat counts and companion breakdowns.

- **💌 Simulated Guest RSVP Portal**
  - Built-in portal view simulating the exact invitation flow guests experience when accepting or declining online.

- **💾 Import & Export**
  - **Export to CSV**: Download the complete guest directory with all metadata.
  - **Import from CSV**: Seamlessly upload and merge existing spreadsheets.
  - **Sample Demo Data**: Instant one-click loader to test with realistic mock data.
  - **Print Ready**: Optimized print stylesheets (`@media print`) for clean paper printing.

---

## 🚀 Getting Started

No build step or server setup is required!

1. Clone or download this repository:
   ```bash
   git clone https://github.com/Enthusiast123/guestpulse-rsvp-tracker.git
   cd guestpulse-rsvp-tracker
   ```
2. Double-click `index.html` or open it in any modern browser (Chrome, Firefox, Safari, Edge).
3. All guest data automatically persists in your browser's `localStorage`.

---

## 🛠️ Tech Stack & Architecture

- **Markup**: Semantic HTML5 with accessible dialog modals.
- **Styling**: Pure vanilla CSS (no Tailwind, no preprocessors, zero CSS variables) with responsive Flexbox and Grid layouts.
- **Logic**: Modern modular vanilla JavaScript (ES6+), pure client-side state management, and `localStorage` persistence.

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).
