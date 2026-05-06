import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { TimerPage } from './TimerPage'
import { StatsPage } from './pages/StatsPage'

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<TimerPage />} />
        <Route path="/stats" element={<StatsPage />} />
      </Routes>
    </BrowserRouter>
  )
}
