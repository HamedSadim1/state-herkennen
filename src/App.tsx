import React from "react";
import Table from "./components/Table";
import ErrorBoundary from "./components/ErrorBoundary";
import data from "./model/data";
import { ToastProvider } from "./components/Toast";
import { ConfirmProvider } from "./components/ConfirmDialog";
import { ChartBarIcon } from "./components/icons";

function App() {
  return (
    <ToastProvider>
      <ConfirmProvider>
        <div className="min-h-screen bg-linear-to-b from-slate-50 via-slate-100 to-slate-200">
          {/* Skip link: keyboard users jump straight to the content (WCAG 2.4.1). */}
          <a
            href="#main"
            className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[60] focus:bg-white focus:text-gray-900 focus:px-4 focus:py-2 focus:rounded-lg focus:shadow-lg"
          >
            Skip to content
          </a>
          <div className="max-w-6xl mx-auto px-4 py-10 sm:px-6 lg:px-8">
            <header className="text-center mb-10">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-100 text-blue-700 text-xs font-semibold uppercase tracking-wider mb-4">
                <ChartBarIcon className="w-4 h-4" /> Inventory Manager
              </div>
              <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 mb-3 tracking-tight">
                State Herkennen
              </h1>
              <p className="text-lg text-gray-600 max-w-xl mx-auto">
                Product inventory management system — track stock levels,
                categories and value in one place.
              </p>
            </header>
            <main id="main" className="scroll-mt-6">
              <ErrorBoundary>
                <Table products={data} />
              </ErrorBoundary>
            </main>
            <footer className="mt-12 pb-4 text-center text-sm text-gray-600">
              Built with React, TypeScript & Tailwind CSS
            </footer>
          </div>
        </div>
      </ConfirmProvider>
    </ToastProvider>
  );
}

export default App;
