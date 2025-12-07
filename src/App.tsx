import React from "react";
import Table from "./components/Table";
import data from "./model/data";

function App() {
  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            State Herkennen
          </h1>
          <p className="text-lg text-gray-600">
            Product inventory management system
          </p>
        </header>
        <main>
          <Table products={data} />
        </main>
      </div>
    </div>
  );
}

export default App;
