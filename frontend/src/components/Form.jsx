import axios from 'axios';
import {useState} from 'react';

export default function Form({ onSubmit }) {
  const [file, setFile] = useState(null);
  const [error, setError] = useState('');
  const [status, setStatus] = useState('idle');
  const [progress, setProgress] = useState(0);
  const [summary, setSummary] = useState('');

  const backendUrl = import.meta.env.VITE_API_URL;
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

  async function handleSubmit(e) {
    e.preventDefault();
    if (!file) {
      setError('Please select a PDF file before submitting.');
      return;
    }
    
    setStatus('uploading');
    setError('');
    setProgress(0);
    setSummary('');

    const formData = new FormData();
    formData.append('pdf', file);
    try {
      await axios.post(`${backendUrl}/summarize`, formData ,{
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = progressEvent.total ?
           Math.round((progressEvent.loaded * 100) / progressEvent.total)
           : 0;
          setProgress(percentCompleted);
        }
        }).then((response) => {
          setSummary(response.data.summary);
        }).catch(function (error) {
          setError(error.message);
        });
      setStatus('success');
    } catch (error) {
      setStatus('error');
      setError(error.message);
      setProgress(0);
      setSummary('');
      return;
    }
    
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
      {file && status != 'uploading' && <button type="submit">Submit</button>}
      {status === 'success' && <div style={{ color: 'green' }}>File uploaded successfully!</div>}
      {status === 'uploading' && <div>Uploading: {progress}%</div>}
      {progress == 100 && status === 'uploading' && <div>Processing PDF...</div>}
      {summary && (<div>
        <p>{summary}</p>
      </div>
      )}
    </form>
  );
}
