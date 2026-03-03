import React from 'react'
import ReactDOM from 'react-dom/client'
import App from '@/App.jsx'
import '@/index.css'

async function start() {
  // Initialize CrazyGames SDK v3 when available.
  if (window.CrazyGames?.SDK) {
    try {
      await window.CrazyGames.SDK.init()
      // Optionally log the environment for debugging:
      // console.log('CrazyGames SDK environment:', window.CrazyGames.SDK.environment)
    } catch (e) {
      // Fail gracefully if SDK init fails; game should still run.
      console.warn('CrazyGames SDK init failed:', e)
    }
  }

  ReactDOM.createRoot(document.getElementById('root')).render(
    <App />
  )
}

start()
