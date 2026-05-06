import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { AppRouter } from './router'
import { DatabaseProvider } from './hooks/useDatabase'

/**
 * 应用入口点
 * 渲染整个 React 应用，包括：
 * - StrictMode（开发时检查潜在问题）
 * - DatabaseProvider（提供数据库上下文）
 * - AppRouter（路由配置）
 */
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <DatabaseProvider>
      <AppRouter />
    </DatabaseProvider>
  </StrictMode>
)