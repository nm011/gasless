import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { CssBaseline, ThemeProvider } from '@mui/material'
import theme from './theme'
import { WalletProvider } from './contexts/WalletContext'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <WalletProvider>
        <App />
      </WalletProvider>
    </ThemeProvider>
  </React.StrictMode>
)