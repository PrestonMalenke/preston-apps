import React from 'react'
import { createRoot } from 'react-dom/client'
import AvsHub from './apps/AvsHub'
import FallCocktails from './apps/FallCocktails'
import './app-shell.css'

const isAvs = window.location.pathname.includes('avs-hub')
createRoot(document.getElementById('app')).render(
  <React.StrictMode>
    <div className="standalone-shell">
      {isAvs ? <AvsHub /> : <FallCocktails />}
    </div>
  </React.StrictMode>,
)
