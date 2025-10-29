import React, { useState, useCallback } from 'react'
import sample from '../assets/sample.json'

export default function Editor({ onVisualize, onClear }){
  const [text, setText] = useState('')
  const [error, setError] = useState(null)

  function handleVisualize(){
    try{
      const parsed = JSON.parse(text)
      setError(null)
      onVisualize(parsed)
    }catch(err){
      setError(err.message)
    }
  }

  return (
    <div className="p-4 space-y-3">
      <div className="flex gap-2">
        <button className="px-3 py-1 bg-indigo-600 text-white rounded" onClick={handleVisualize}>Visualize</button>
        <button className="px-3 py-1 bg-gray-200 rounded text-black" onClick={() => { setText(JSON.stringify(sample,null,2)); onVisualize(sample); setError(null) }}>Load Sample</button>
        <button className="px-3 py-1 bg-red-500 text-white rounded" onClick={() => { setText(''); onClear() }}>Clear</button>
      </div>
      <textarea
        value={text}
        onChange={(e)=>setText(e.target.value)}
        className="w-full h-64 p-2 border rounded font-mono text-sm bg-white text-black"
        placeholder="Paste JSON here"
      />
      {error && <div className="text-red-600">Invalid JSON: {error}</div>}
    </div>
  )
}