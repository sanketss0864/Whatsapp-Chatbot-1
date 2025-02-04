import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { HashRouter } from 'react-router-dom'
import { FluentProvider } from '@fluentui/react-components'
import { webLightTheme } from '@fluentui/react-components'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <HashRouter>
    <FluentProvider theme={webLightTheme}>
    <App />
  </FluentProvider>
    </HashRouter>
  </React.StrictMode>
)
