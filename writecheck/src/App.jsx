import { useState } from 'react'
import './index.css'
import UploadForm from './components/UploadForm';

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-start py-10 px-4">
  <h1 className="text-4xl font-bold text-blue-800 mb-8">WriteCheck</h1>

  <div className="w-full max-w-md bg-white shadow-lg rounded-lg p-6">
    <UploadForm />
  </div>
</div>

  )
}

export default App
