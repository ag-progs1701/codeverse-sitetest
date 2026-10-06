import { BrowserRouter, Routes, Route } from 'react-router-dom'
import PaymentPage from './components/PaymentPage'
import ConfirmationPage from './components/ConfirmationPage'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<PaymentPage />} />
        <Route path="/confirmation" element={<ConfirmationPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App