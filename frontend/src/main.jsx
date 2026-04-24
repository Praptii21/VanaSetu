import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { MockDataProvider } from './context/MockDataContext'
import App from './App.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <MockDataProvider>
        <App />
      </MockDataProvider>
    </BrowserRouter>
  </React.StrictMode>,
)
