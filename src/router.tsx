import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { TimerPage } from './TimerPage'
import { StatsPage } from './pages/StatsPage'

/**
 * 应用路由配置
 * 使用 React Router 定义应用的路由结构
 *
 * 路由结构：
 * - /         -> 番茄钟计时器页面（默认首页）
 * - /stats    -> 统计数据页面
 */
export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* 首页：番茄钟计时器 */}
        <Route path="/" element={<TimerPage />} />
        {/* 统计页面：查看历史数据和连续天数 */}
        <Route path="/stats" element={<StatsPage />} />
      </Routes>
    </BrowserRouter>
  )
}