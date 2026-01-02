import { useState, useEffect } from 'react';
import WeeklyTable from './components/WeeklyTable';
import './App.css';

function App() {
  return (
    <div className="app">
      <header className="app-header">
        <h1>Haftalık Planlama</h1>
      </header>
      <main className="app-main">
        <WeeklyTable />
      </main>
    </div>
  );
}

export default App;

