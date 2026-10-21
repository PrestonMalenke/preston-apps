import React from 'react'
import {createRoot} from 'react-dom/client'
import AvsHub from './apps/AvsHub'
import FallCocktails from './apps/FallCocktails'
import './app-shell.css'
const path=window.location.pathname
const isAvs=path.includes('avs-hub')
createRoot(document.getElementById('app')).render(<React.StrictMode><div className="standalone-shell"><header className="standalone-bar"><a href="/" className="standalone-home">← Preston Apps</a><span>{isAvs?'Avs Hub':'Fall Cocktails'}</span></header>{isAvs?<AvsHub/>:<FallCocktails/>}</div></React.StrictMode>)
