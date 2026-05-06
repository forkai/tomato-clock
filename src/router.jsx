import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import TimerPage from '@/App';
import { StatsPage } from '@/pages/StatsPage';

/**
 * 路由配置
 * / - 计时器页面
 * /stats - 统计页面
 */
export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<TimerPage />} />
        <Route path="/stats" element={<StatsPage />} />
      </Routes>
    </BrowserRouter>
  );
}
