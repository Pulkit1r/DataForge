import React, { useState, useEffect } from 'react';

export function ExplainItBack() {
  const [text, setText] = useState('');
  const [saved, setSaved] = useState(false);

  // Load initial from local storage
  useEffect(() => {
    const stored = localStorage.getItem('memoryCliff_explain');
    if (stored) setText(stored);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
    setSaved(false);
  };

  // Debounced save
  useEffect(() => {
    const timer = setTimeout(() => {
      localStorage.setItem('memoryCliff_explain', text);
      if (text.length > 0) {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [text]);

  return (
    <div className="bg-gray-800/80 rounded-xl p-6 border border-gray-700/50 shadow-lg relative">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-xl font-bold text-gray-100">Explain It Back</h3>
        {saved && <span className="text-green-400 text-xs font-semibold bg-green-900/30 px-2 py-1 rounded">Saved!</span>}
      </div>
      <p className="text-gray-400 text-sm mb-4">
        In your own words, explain what you learned about the difference between these two memory architectures.
      </p>
      <textarea
        value={text}
        onChange={handleChange}
        placeholder="Type your explanation here..."
        className="w-full h-32 bg-gray-900 border border-gray-700 rounded-lg p-3 text-sm text-gray-200 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 resize-y"
      />
    </div>
  );
}
