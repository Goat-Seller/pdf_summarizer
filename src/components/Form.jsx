import React, { useState } from 'react';

export default function Form({ onSubmit }) {
  const [file, setFile] = useState(null);
  const [error, setError] = useState('');


  const validatePdf = (f) => {
    if (!f) return 'No file selected';
    const isPdfByType = f.type === 'application/pdf';
    return isPdfByType ? '' : 'Only PDF files are allowed';
  };

  const handleChange = (e) => {
    setError(''); 
    const f = e.target.files && e.target.files[0];
    const err = validatePdf(f);
    if (err) {
      setFile(null);
      setError(err);
      return;
    }
    setFile(f);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <label htmlFor="pdf-input">Upload PDF</label>
      <input
        id="pdf-input"
        type="file"
        accept="application/pdf"
        onChange={handleChange}
      />

      {file && <div>Selected: {file.name}</div>}
      {error && <div style={{ color: 'red' }}>{error}</div>}
      <button type="submit">Submit</button>
    </form>
  );
}
