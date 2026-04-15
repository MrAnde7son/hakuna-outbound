import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ToastProvider, ErrorBoundary } from '@hakunahq/ui'
import faviconUrl from '@hakunahq/ui/assets/favicon.svg'
import App from './App.jsx'
import '@hakunahq/ui/tokens/colors.css'
import '@hakunahq/ui/tokens/base.css'
import './index.css'

const faviconLink = document.querySelector("link[rel~='icon']") ?? document.head.appendChild(Object.assign(document.createElement('link'), { rel: 'icon' }))
faviconLink.type = 'image/svg+xml'
faviconLink.href = faviconUrl

const queryClient = new QueryClient({
  defaultOptions: { queries: { refetchOnWindowFocus: false } },
})

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ToastProvider>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </ToastProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  </React.StrictMode>,
)
