import React from "react";
import Table from "./components/Table";
import data from "./model/data";
import { ToastProvider } from "./components/Toast";
import { ConfirmProvider } from "./components/ConfirmDialog";
import { ChartBarIcon } from "./components/icons";

function App() {
  return (
    <ToastProvider>
      <ConfirmProvider>
        <div className="min-h-screen bg-linear-to-b from-slate-50 via-slate-100 to-slate-200">
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
            <main>
              <Table products={data} />
            </main>
            <footer className="mt-12 pb-4 text-center text-sm text-gray-500">
              Built with React, TypeScript & Tailwind CSS
            </footer>
          </div>
        </div>
      </ConfirmProvider>
    </ToastProvider>
  );
}

export default App;
