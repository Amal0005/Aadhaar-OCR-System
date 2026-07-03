import React, { useState } from 'react'
import { toast, Toaster } from 'react-hot-toast'
import axios from 'axios'
import './App.css'
import { ErrorMessages } from './constants/ErrorMessages.js'
import { FileSchema, AadhaarDataSchema } from './schemas/AadhaarSchema.js'
import { useAadhaarOCR } from './hooks/useAadhaarOCR.js'

interface AadhaarData {
  name: string;
  dob: string;
  gender: string;
  aadhaarNumber: string;
  address?: string | undefined;
  pincode?: string | undefined;
}

const App: React.FC = () => {
  const [frontImage, setFrontImage] = useState<File | null>(null)
  const [backImage, setBackImage] = useState<File | null>(null)
  const [previews, setPreviews] = useState<{ front: string | null; back: string | null }>({ front: null, back: null })
  const { loading, result, rawResponse, processImages } = useAadhaarOCR();

  const validateImage = (file: File) => {
    const result = FileSchema.safeParse(file);
    if (!result.success) {
      toast.error(result.error.issues[0]?.message || 'Invalid file');
      return false;
    }
    return true;
  }

  const handleFront = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && validateImage(file)) {
      setFrontImage(file);
      setPreviews(p => ({ ...p, front: URL.createObjectURL(file) }));
    }
  }

  const handleBack = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && validateImage(file)) {
      setBackImage(file);
      setPreviews(p => ({ ...p, back: URL.createObjectURL(file) }));
    }
  }

  const handleOCR = async () => {
    await processImages(frontImage, backImage);
  }

  const handleCopy = () => {
    if (!result) {
      toast.error('No details to copy');
      return;
    }
    const details = `
Aadhaar Number: ${result.aadhaarNumber || 'N/A'}
Name: ${result.name || 'N/A'}
DOB: ${result.dob || 'N/A'}
Gender: ${result.gender || 'N/A'}
Pincode: ${result.pincode || 'N/A'}
Address: ${result.address || 'N/A'}
    `.trim();
    navigator.clipboard.writeText(details)
      .then(() => toast.success('Copied to clipboard'))
      .catch(() => toast.error('Failed to copy'));
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
            <input type="file" onChange={handleFront} hidden accept=".jpg,.jpeg,.png" />
            {previews.front ? (
              <>
                <img src={previews.front} alt="Front" />
                <div className="replace-overlay">Click to Replace</div>
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
            <input type="file" onChange={handleBack} hidden accept=".jpg,.jpeg,.png" />
            {previews.back ? (
              <>
                <img src={previews.back} alt="Back" />
                <div className="replace-overlay">Click to Replace</div>
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

        <button className="parse-btn" onClick={handleOCR} disabled={loading}>
          {loading ? 'Processing...' : 'Process Aadhaar'}
        </button>

        <Toaster position="top-center" />
      </div>

      {/* Right Column: Data View */}
      <div className="data-section">
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h2 style={{ margin: 0 }}>Extracted Information</h2>
            <button 
              onClick={handleCopy} 
              disabled={!result}
              style={{
                padding: '0.5rem 1rem',
                borderRadius: '6px',
                border: 'none',
                backgroundColor: 'var(--primary)',
                color: 'white',
                cursor: result ? 'pointer' : 'not-allowed',
                opacity: result ? 1 : 0.5,
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
              </svg>
              Copy
            </button>
          </div>
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
            <div className="input-group span-full">
              <label>Full Address</label>
              <input className="input-field" readOnly value={result?.address || ''} placeholder="Detailed Address" />
            </div>
          </div>
        </div>


      </div>
    </div>
  )
}

export default App