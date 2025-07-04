import { BrowserRouter } from 'react-router'
import './App.css'
import Login from './pages/login'
import { Route, Routes } from 'react-router-dom'
import SignUpPage from './pages/signup'
import Chat from './pages/chat'
import Editor from './pages/editor'

function App() {
  return (
    <>
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/" element={<Chat/>} />
        <Route path="/editor" element={<Editor/>} />
      </Routes>
    </BrowserRouter>
    </>
  )
}

export default App
