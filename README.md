# 📱 State Herkennen - Product Inventory Management

A modern, responsive React application for managing product inventory with advanced filtering, sorting, and CRUD operations. Built with TypeScript, Vite, and Tailwind CSS.

![React](https://img.shields.io/badge/React-18.2.0-blue.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-4.8.4-blue.svg)
![Vite](https://img.shields.io/badge/Vite-4.0.0-646CFF.svg)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.0-38B2AC.svg)

## ✨ Features

### 🔍 Advanced Search & Filtering

- **Real-time search** by product name
- **Stock status filtering** (In Stock, Out of Stock, All)
- **Instant results** with live filtering

### 📊 Sorting & Organization

- **Multi-field sorting** (Name, Price, Status)
- **Ascending/Descending** order options
- **Visual sort indicators** with arrow icons

### ✏️ Complete CRUD Operations

- **Add products** with form validation
- **Edit existing products** with pre-populated forms
- **Delete products** with confirmation dialogs
- **Form reset** and cancel functionality

### 💾 Data Persistence

- **Local Storage** integration for data persistence
- **Automatic save/load** of product inventory
- **Fallback to initial data** when storage is empty

### 🎨 Modern UI/UX

- **Responsive design** for all screen sizes
- **Dark/light theme ready** architecture
- **Smooth animations** and hover effects
- **Accessible components** with proper ARIA labels

## 🚀 Quick Start

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

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

## 🏗️ Project Structure

```text
src/
├── components/          # Reusable UI components
│   ├── AddProductForm.tsx    # Product creation/editing form
│   ├── ProductTable.tsx      # Main product display table
│   ├── ProductRow.tsx        # Individual product row
│   ├── SearchFilter.tsx      # Search and filter controls
│   ├── SortControls.tsx      # Sorting functionality
│   ├── StatusBadge.tsx       # Stock status indicator
│   └── Table.tsx            # Main container component
├── types/               # TypeScript type definitions
│   └── product.ts       # Product and configuration types
├── utils/               # Utility functions
│   ├── formatters.ts    # Data formatting helpers
│   └── productUtils.ts  # Product data operations
├── model/               # Data models
│   └── data.ts          # Initial product data
└── App.tsx             # Main application component
```

## 🛠️ Technology Stack

- **Frontend Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **State Management**: React Hooks (useState, useCallback, useEffect)
- **Data Storage**: Browser Local Storage
- **Icons**: Unicode emojis (no external icon libraries)

## 🎯 Key Concepts Demonstrated

### DRY Principles Implementation

- **Reusable Components**: Modular, single-responsibility components
- **Utility Functions**: Centralized data operations and formatting
- **Type Definitions**: Shared interfaces across components

### React Best Practices

- **Functional Components** with TypeScript
- **Custom Hooks** for complex state logic
- **Proper Event Handling** with preventDefault
- **Performance Optimization** with useCallback and useMemo

### Modern Development

- **Component Composition** over inheritance
- **Props Interface Design** for type safety
- **Error Boundaries** consideration
- **Accessibility** (ARIA labels, semantic HTML)

## 📱 Usage Examples

### Adding a Product

1. Fill in the product name and price
2. Check "In Stock" if available
3. Click "Add Product"

### Searching Products

1. Type in the search box to filter by name
2. Use filter buttons to show specific stock status

### Editing a Product

1. Click "Edit" on any product row
2. Modify the details in the form
3. Click "Update Product" or "Cancel"

### Sorting Products

1. Click sort buttons (Name, Price, Status)
2. Click again to reverse sort order

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow the existing code style and structure
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
