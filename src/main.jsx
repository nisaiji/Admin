// import React from 'react'
import ReactDOM from 'react-dom/client'
import { Provider } from 'react-redux'
import { HashRouter } from 'react-router-dom'
import App from './App.jsx'
import './index.css'
import store from './store/store.jsx'

ReactDOM.createRoot(document.getElementById('root')).render(
  <HashRouter>
    <Provider store ={store}>
    <App />
    </Provider>
  </HashRouter>
)
