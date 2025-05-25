import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Dashboard from './components/Dashboard';
import Login from './components/Login';
import CVOptimizer from './components/CVOptimizer';

function App() {
  return (
    <div className="min-h-screen bg-neutral-100 dark:bg-neutral-900">
      <Router>
        <Navbar />
        <main className="container mx-auto px-4 py-10 max-w-7xl">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/login" element={<Login />} />
            <Route path="/optimize" element={<CVOptimizer />} />
          </Routes>
        </main>
      </Router>
    </div>
  );
}

export default App;
