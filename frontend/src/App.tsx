import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import heroImg from './assets/hero.png'

function App() {
  return (
    <main className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
      <h1 className="text-xl font-bold mb-6">Welcome to FullStack IoT Dashboard</h1>
      <img src={heroImg} alt="IoT Dashboard" className="w-full max-w-md rounded-lg shadow-lg mb-6" />
      <p className="text-gray-700 mb-4">Monitor and manage your IoT devices in real-time.</p>
      <div className="flex space-x-4">
        <div className="flex space-x-4 mt-4">
          <img src={viteLogo} alt="Vite Logo" className="w-6 h-6" />
          <a href="/devices" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition">View Devices</a>
        </div>
        <div className="flex space-x-4 mt-4">
          <img src={reactLogo} alt="React Logo" className="w-6 h-6" />
          <a href="/settings" className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition">Settings</a>
        </div>
      </div>
    </main>
  )
}

export default App
