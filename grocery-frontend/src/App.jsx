import './index.css'  // Make sure this imports Tailwind

function App() {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-6">
      <h1 className="text-4xl font-bold text-green-600 mb-4">Grocery Store</h1>
      <p className="text-lg text-gray-700 mb-6">Welcome to the grocery management system</p>

      <button className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded shadow">
        Test Button
      </button>
    </div>
  )
}

export default App
