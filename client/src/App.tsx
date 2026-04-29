import React, { useState } from 'react'
import axios from 'axios'
import './App.css'

interface AadhaarData {
  name: string;
  dob: string;
  gender: string;
  aadhaarNumber: string;
  address?: string;
  pincode?: string;
}

const App: React.FC = () => {
  const [frontImage, setFrontImage] = useState<File | null>(null)
  const [backImage, setBackImage] = useState<File | null>(null)
  const [previews, setPreviews] = useState<{ front: string | null; back: string | null }>({ front: null, back: null })
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<AadhaarData | null>(null)
  const [rawResponse, setRawResponse] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const handleImage = (e: React.ChangeEvent<HTMLInputElement>, side: 'front' | 'back') => {
    const file = e.target.files?.[0]
    if (file) {
      if (side === 'front') {
        setFrontImage(file)
        setPreviews(p => ({ ...p, front: URL.createObjectURL(file) }))
      } else {
        setBackImage(file)
        setPreviews(p => ({ ...p, back: URL.createObjectURL(file) }))
      }
    }
  }

  // Helper for previews to fix scoping issue in mapping if needed, but we'll do it direct
  const handleFront = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) { setFrontImage(file); setPreviews(p => ({ ...p, front: URL.createObjectURL(file) })); }
  }
  const handleBack = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) { setBackImage(file); setPreviews(p => ({ ...p, back: URL.createObjectURL(file) })); }
  }

  const handleOCR = async () => {
    if (!frontImage) return setError('Upload front image first')
    setLoading(true); setError(null);
    const fd = new FormData()
    fd.append('frontImage', frontImage)
    if (backImage) fd.append('backImage', backImage)

      try {
        const apiUrl = import.meta.env.VITE_API_URL
        console.log("API URL:", apiUrl)
      const response = await axios.post(`${apiUrl}/aadhaar/process`, fd)
      setResult(response.data.data)
      setRawResponse(response.data)
    } catch (err: any) {
      setError(err.response?.data?.error || 'Extraction failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="dashboard">
      {/* Left Column: Uploads */}
      <div className="upload-section">
        <div style={{ marginBottom: '1rem' }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--primary)', marginBottom: '0.5rem' }}>Aadhaar OCR</h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Extract details from your Aadhaar card instantly.</p>
        </div>

        <div>
          <p className="section-title">Aadhaar Front</p>
          <label className={`upload-box ${previews.front ? 'has-image' : ''}`}>
            <input type="file" onChange={handleFront} hidden accept="image/*" />
            {previews.front ? (
              <>
                <img src={previews.front} alt="Front" />
                {loading && <div className="scanner-line" />}
              </>
            ) : (
              <>
                <div className="upload-icon-circle">🪪</div>
                <p>Upload Front Side</p>
              </>
            )}
          </label>
        </div>

        <div>
          <p className="section-title">Aadhaar Back</p>
          <label className={`upload-box ${previews.back ? 'has-image' : ''}`}>
            <input type="file" onChange={handleBack} hidden accept="image/*" />
            {previews.back ? (
              <>
                <img src={previews.back} alt="Back" />
                {loading && <div className="scanner-line" />}
              </>
            ) : (
              <>
                <div className="upload-icon-circle">📄</div>
                <p>Upload Back Side</p>
              </>
            )}
          </label>
        </div>

        <button className="parse-btn" onClick={handleOCR} disabled={loading || !frontImage}>
          {loading ? 'Processing...' : 'Process Aadhaar'}
        </button>

        {error && (
          <div style={{ 
            marginTop: '1rem', 
            padding: '1rem', 
            background: '#fee2e2', 
            color: '#dc2626', 
            borderRadius: '10px',
            fontSize: '0.875rem',
            fontWeight: 500
          }}>
            ⚠️ {error}
          </div>
        )}
      </div>

      {/* Right Column: Data View */}
      <div className="data-section">
        <div>
          <h2>Extracted Information</h2>
          <div className="parsed-grid">
            <div className="input-group">
              <label>Aadhaar Number</label>
              <input className="input-field" readOnly value={result?.aadhaarNumber || ''} placeholder="XXXX XXXX XXXX" />
            </div>
            <div className="input-group">
              <label>Full Name</label>
              <input className="input-field" readOnly value={result?.name || ''} placeholder="Name as per Aadhaar" />
            </div>
            <div className="input-group">
              <label>Date of Birth</label>
              <input className="input-field" readOnly value={result?.dob || ''} placeholder="DD/MM/YYYY" />
            </div>
            <div className="input-group">
              <label>Gender</label>
              <input className="input-field" readOnly value={result?.gender || ''} placeholder="Gender" />
            </div>
            <div className="input-group">
              <label>Pincode</label>
              <input className="input-field" readOnly value={result?.pincode || ''} placeholder="6-digit ZIP" />
            </div>
            <div className="input-group span-2">
              <label>Full Address</label>
              <input className="input-field" readOnly value={result?.address || ''} placeholder="Detailed Address" />
            </div>
          </div>
        </div>

        <div className="api-response-container">
          <h2>Technical Logs</h2>
          <div className={`api-box ${rawResponse ? 'success' : ''}`}>
            {rawResponse ? (
              JSON.stringify(rawResponse, null, 2)
            ) : (
              <div className="placeholder-text">
                <p>Waiting for data extraction...</p>
                <p style={{ fontSize: '0.8rem', opacity: 0.7, marginTop: '0.5rem' }}>Upload images on the left to begin the process.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
