import { Routes, Route } from 'react-router-dom';

// Screens are added under src/pages/ as modules are implemented, and routed here.
export default function App() {
  return (
    <Routes>
      <Route path="/" element={<div className="p-8">App shell — add routes here.</div>} />
    </Routes>
  );
}
