import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HelmetProvider } from 'react-helmet-async'
import { QueryClientProvider } from '@tanstack/react-query'
import './index.css'
import App from './App.jsx'
import { Toaster } from 'react-hot-toast'
import { queryClient } from './queryClient.js'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <HelmetProvider>
        <App/>
        <Toaster position="top-right" reverseOrder={false} />
      </HelmetProvider>
    </QueryClientProvider>
  </StrictMode>,
)
