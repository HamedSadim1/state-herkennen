# 📱 State Herkennen - Product Inventory Management

A modern, responsive React application for managing product inventory with advanced filtering, sorting, CRUD operations, CSV import/export, and a polished, accessible UI. Built with TypeScript, Vite, and Tailwind CSS.

![React](https://img.shields.io/badge/React-19.2-blue.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue.svg)
![Vite](https://img.shields.io/badge/Vite-8-646CFF.svg)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-38B2AC.svg)

## ✨ Features

### 🔍 Advanced Search & Filtering

- **Real-time search** by product name, with a one-click **clear button** inside the field
- **Category filter** (All Categories or a specific category)
- **Stock status filtering**: All Products / In Stock / Low Stock / Out of Stock — the same semantics as the dashboard stats, so "In Stock" never silently includes low-stock items
- **Reset filters** button plus an **active-filter counter** ("2 filters active")
- **Live result count** — "Showing X of Y products" so you always know how many are hidden

### 📊 Sorting & Organization

- **Multi-field sorting** (Name, Category, Price, Quantity)
- Sort via the toolbar buttons **or by clicking the column headers**
- **Ascending/Descending** toggle (click again to reverse)
- **Visual sort indicators** with arrow icons and proper `aria-sort` semantics

### ✏️ Complete CRUD Operations

- **Add products** with inline form validation and a double-submit guard
- **Edit existing products** — the form scrolls into view so you never lose context
- **Delete products** behind a custom confirmation dialog (Escape/backdrop to cancel, focus trap, scroll lock)
- **Success feedback** for every action via animated toast notifications

### 💾 Data Persistence & CSV

- **Local Storage** integration for data persistence
- **Automatic save/load** of product inventory
- **Fallback to initial data** when storage is empty
- **CSV export** and **import** (with confirmation dialog; unknown categories produce a warning toast instead of silently changing data)

### 🎨 Modern UI/UX

- **Responsive design** for all screen sizes with a sticky table header
- **Inline SVG icon set** — no emoji, no icon library dependencies
- **Consistent design system**: button variants, chips, inputs, cards, and spacing tokens
- **Smooth animations** (toasts, modals) and hover/press micro-interactions
- **Accessible components**: `aria-sort`, `aria-pressed`, `aria-live` toasts, `role="dialog"` modal with focus management, visible focus rings

## 🚀 Quick Start

### Prerequisites

- Node.js (v18 or higher)
- npm

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/HamedSadim1/state-herkennen.git
   cd state-herkennen
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Start the development server**

   ```bash
   npm run dev
   ```

4. **Open your browser**

   ```text
   http://localhost:5173
   ```

## 📜 Available Scripts

| Command           | Description                              |
| ----------------- | ---------------------------------------- |
| `npm run dev`     | Start development server with hot reload |
| `npm run build`   | Build for production to `dist` folder    |
| `npm run preview` | Preview production build locally         |
| `npm run lint`    | Run ESLint                               |
| `npm run format`  | Format all files with Prettier           |
| `npm test`        | Run the Vitest unit test suite           |

## 🏗️ Project Structure

```text
src/
├── components/             # Reusable UI components
│   ├── AddProductForm.tsx  # Product creation/editing form
│   ├── ConfirmDialog.tsx   # Promise-based confirmation modal
│   ├── confirm-context.ts  # useConfirm hook + context
│   ├── EmptyState.tsx      # Empty-table state (with clear-filters CTA)
│   ├── ErrorBoundary.tsx   # Error boundary with fallback + retry
│   ├── FieldError.tsx      # Reusable per-field validation message
│   ├── icons.tsx           # Inline SVG icon set
│   ├── ProductRow.tsx      # Individual product row
│   ├── ProductTable.tsx    # Product table (sortable headers, rows)
│   ├── SearchFilter.tsx    # Search, category & stock filters
│   ├── SortControls.tsx    # Sort controls (buttons on desktop, select on mobile)
│   ├── SortIndicator.tsx   # Shared sort-state arrow icon
│   ├── StatCard.tsx        # Dashboard stat card (clickable filter shortcut)
│   ├── StatsDashboard.tsx  # Inventory statistics cards
│   ├── StatusBadge.tsx     # Stock status chip
│   ├── Table.tsx           # Main container (wires useInventory to the UI)
│   ├── TableToolbar.tsx    # Export / import / reset toolbar
│   ├── Toast.tsx           # Toast notification system
│   └── toast-context.ts    # useToast hook + context
├── config/
│   └── constants.ts        # 🔑 Single source of truth for all constants
├── hooks/                  # Custom hooks (state + side-effect orchestration)
│   ├── useCsvImport.ts     # CSV import flow (parse → confirm → toasts)
│   └── useInventory.ts     # Inventory state machine (list, sort, filter, undo)
├── model/
│   └── data.ts             # Initial product data
├── types/
│   └── product.ts          # Product and configuration types
├── utils/                  # Pure, unit-tested utility functions
│   ├── cn.ts               # Class merge helper (clsx + tailwind-merge)
│   ├── csv.ts              # CSV export/import (with warnings)
│   ├── formatters.ts       # Data formatting helpers (price, pluralize, ids)
│   └── productUtils.ts     # Sorting, filtering, storage helpers
├── App.tsx                 # Main application component
├── index.tsx               # Application entry point
└── index.css               # Design system (tokens, component classes)
```

> **Import alias:** all modules import through the `@/` alias (`@/config/constants`, `@/hooks/useInventory`, …), which resolves to `src/`. Relative parent imports (`../`) are rejected by ESLint.

## 🛠️ Technology Stack

- **Frontend Framework**: React 19 with TypeScript
- **Build Tool**: Vite 8 (with `@/` → `src` alias)
- **Styling**: Tailwind CSS 4
- **Class Utilities**: `cn()` helper (`clsx` + `tailwind-merge`)
- **State Management**: React Hooks (useState, useCallback, useEffect, useDeferredValue) + Context
- **Data Storage**: Browser Local Storage
- **Icons**: Inline SVG components (no external icon libraries)
- **Testing**: Vitest (31 unit tests covering the pure logic)

## 🎯 Key Concepts Demonstrated

### DRY Principles Implementation

- **Central Constants File**: every hardcoded value (categories, thresholds, durations, CSV config, defaults) lives in `config/constants.ts` and is imported from there
- **Reusable Components**: single-responsibility building blocks (`TableToolbar`, `EmptyState`, `StatCard`, `FieldError`, `ErrorBoundary`)
- **Custom Hooks**: `useInventory` owns the whole state machine; `useCsvImport` encapsulates the CSV import flow so any form can reuse it
- **Utility Functions**: centralized, unit-tested data operations (`productUtils`, `formatters`, `csv`, `cn`)
- **Shared Design Tokens**: button/chip/input classes in `index.css`
- **Shared UI Primitives**: `SortIndicator`, `useToast`, `useConfirm` reused across components
- **Enforced Conventions**: ESLint rejects `../` imports (use `@/`) and all class names merge through `cn()`

### React Best Practices

- **Functional Components** with TypeScript
- **Custom Hooks** and Context for cross-cutting concerns (toasts, confirm dialogs)
- **Proper Event Handling** with preventDefault
- **Performance Optimization** with useCallback and useMemo

### Modern Development

- **Component Composition** over inheritance
- **Props Interface Design** for type safety
- **Accessibility** (ARIA labels, semantic HTML, focus management, `aria-live` regions)

## 📱 Usage Examples

### Adding a Product

1. Fill in the product name, category, price and quantity
2. Click **Add Product** — a success toast confirms it

### Searching & Filtering Products

1. Type in the search box to filter by name (or click the **×** to clear)
2. Use the category select or the stock status buttons (In Stock / Low Stock / Out of Stock)
3. Click **Reset filters** to start fresh

### Editing a Product

1. Click **Edit** on any product row — the page scrolls to the form
2. Modify the details in the form
3. Click **Update Product** or **Cancel**

### Deleting a Product

1. Click **Delete** on any product row
2. Confirm in the dialog (or press Escape to cancel)

### Sorting Products

1. Click the **column headers** (Name, Category, Price, Quantity) or the sort buttons
2. Click again to reverse the sort order

### CSV Import / Export

1. Click **Export CSV** to download the current inventory
2. Click **Import CSV**, pick a file, and confirm the replacement

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow the existing code style and structure (Prettier + ESLint, enforced via husky/lint-staged)
- Use conventional commit messages (commitlint)
- Add TypeScript types for new features
- Test components in different screen sizes
- Ensure accessibility compliance

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built as part of Web Frameworks course at AP Hogeschool
- Inspired by modern inventory management systems
- Thanks to the React and Vite communities for excellent documentation

---

Made with ❤️ using React, TypeScript, and Vite
