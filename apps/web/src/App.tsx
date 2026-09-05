import React from 'react'

function App() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
        <h1 className="text-3xl font-bold text-blue-600 mb-4">QueueCut</h1>
        <p className="text-gray-600 mb-6">
          Wonderla Chennai Intelligence Engine
        </p>
        <div className="space-y-4 text-sm text-left">
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
            <h3 className="font-semibold text-blue-800">Visit Optimization</h3>
            <p className="text-blue-600 mt-1">Status: Operational</p>
          </div>
          <div className="p-4 bg-green-50 rounded-lg border border-green-100">
            <h3 className="font-semibold text-green-800">FastTrack Engine</h3>
            <p className="text-green-600 mt-1">Status: Operational</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
