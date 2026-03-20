import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import FinanceMonitor from './pages/FinanceMonitor'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/finance" element={<FinanceMonitor />} />
    </Routes>
  )
}

export default App
