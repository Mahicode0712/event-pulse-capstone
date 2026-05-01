import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import './index.css'
import App from './App.jsx'
import { store } from './app/store'
import ErrorBoundary from './components/ErrorBoundary'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <ErrorBoundary>
          <App />
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: '#1A0025',
                border: '1px solid #FF2D78',
                color: '#fff',
              },
              iconTheme: {
                primary: '#FF2D78',
                secondary: '#fff',
              },
            }}
          />
        </ErrorBoundary>
      </BrowserRouter>
    </Provider>
  </StrictMode>,
)
