import { BrowserRouter } from 'react-router-dom'
import './App.css'
import Login from './pages/login'
import { Route, Routes } from 'react-router-dom'
import SignUpPage from './pages/signup'
import Chat from './pages/chat'
import Editor from './pages/editor'
import { RecoilRoot } from 'recoil'

function App() {
  return (
    <>
    <RecoilRoot>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUpPage />} />
          <Route path="/" element={<Chat/>} />
          <Route path="/editor/*" element={<Editor/>} />
        </Routes>
      </BrowserRouter>
    </RecoilRoot>
    </>
  )
}

export default App
