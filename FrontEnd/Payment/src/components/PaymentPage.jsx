import { useState, useRef } from 'react'

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB in bytes
const ACCEPTED_FORMATS = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif', 'image/webp']
const ACCEPTED_EXTENSIONS = '.jpeg,.png,.jpg,.gif,.webp'

// Dummy payment data — replace with real data later
const PAYMENT_INFO = {
  upi: {
    id: 'metaversevitb@indianbk',
    qrCodeUrl: '/upi-qr.jpg',
  },
  bank: {
    holderName: 'METAVERSITY CLUB VIT BHOPAL',
    bankName: 'INDIAN BANK',
    accountNumber: '7967541510',
    ifscCode: 'IDIB000V143',
    beneficiaryName: 'METAVERSE CLUB',
    accountType: 'SB',
  },
}

export default function PaymentPage() {
  const [activeTab, setActiveTab] = useState('upi')
  const [copied, setCopied] = useState(false)
  const [formData, setFormData] = useState({
    paymentMethod: '',
    transactionId: '',
    transactionDate: '',
    amount: '',
  })
  const [file, setFile] = useState(null)
  const [filePreview, setFilePreview] = useState(null)
  const [fileError, setFileError] = useState('')
  const [dragActive, setDragActive] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [errors, setErrors] = useState({})
  const fileInputRef = useRef(null)

  const handleCopyUPI = async () => {
    try {
      await navigator.clipboard.writeText(PAYMENT_INFO.upi.id)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Fallback
      const textArea = document.createElement('textarea')
      textArea.value = PAYMENT_INFO.upi.id
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }))
    }
  }

  const validateFile = (selectedFile) => {
    if (!selectedFile) return ''
    if (!ACCEPTED_FORMATS.includes(selectedFile.type)) {
      return 'Invalid file format. Please upload a JPEG, PNG, JPG, GIF, or WebP image.'
    }
    if (selectedFile.size > MAX_FILE_SIZE) {
      return `File size exceeds 10MB. Your file is ${(selectedFile.size / (1024 * 1024)).toFixed(2)}MB.`
    }
    return ''
  }

  const handleFileSelect = (selectedFile) => {
    const error = validateFile(selectedFile)
    if (error) {
      setFileError(error)
      setFile(null)
      setFilePreview(null)
      return
    }
    setFileError('')
    setFile(selectedFile)
    const reader = new FileReader()
    reader.onload = (e) => setFilePreview(e.target.result)
    reader.readAsDataURL(selectedFile)
  }

  const handleFileInputChange = (e) => {
    if (e.target.files?.[0]) {
      handleFileSelect(e.target.files[0])
    }
  }

  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    if (e.dataTransfer.files?.[0]) {
      handleFileSelect(e.dataTransfer.files[0])
    }
  }

  const removeFile = () => {
    setFile(null)
    setFilePreview(null)
    setFileError('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB'
  }

  const validateForm = () => {
    const newErrors = {}
    if (!formData.paymentMethod) newErrors.paymentMethod = 'Please select a payment method'
    if (!formData.transactionId.trim()) newErrors.transactionId = 'Transaction ID / UTR is required'
    if (!formData.transactionDate) newErrors.transactionDate = 'Transaction date is required'
    if (!formData.amount || Number(formData.amount) <= 0) newErrors.amount = 'Please enter a valid amount'
    if (!file) newErrors.file = 'Payment screenshot is required'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (validateForm()) {
      setIsSubmitting(true)
      
      const formDataToSend = new FormData()
      formDataToSend.append('paymentMethod', formData.paymentMethod)
      formDataToSend.append('transactionId', formData.transactionId)
      formDataToSend.append('transactionDate', formData.transactionDate)
      formDataToSend.append('amount', formData.amount)
      
      // Extract team name from URL if passed
      const urlParams = new URLSearchParams(window.location.search)
      const teamName = urlParams.get('team') || 'Unknown Team'
      formDataToSend.append('teamName', teamName)
      
      formDataToSend.append('screenshot', file)

      try {
        const response = await fetch('http://localhost:5000/api/submit-payment', {
          method: 'POST',
          body: formDataToSend,
        })
        
        if (!response.ok) {
          throw new Error('Failed to submit payment details')
        }
        
        const data = await response.json()
        console.log('Success:', data)
        setSubmitted(true)
      } catch (err) {
        console.error('Error submitting form:', err)
        setErrors((prev) => ({ ...prev, submit: err.message }))
      } finally {
        setIsSubmitting(false)
      }
    }
  }

  const handleCloseSuccess = () => {
    setSubmitted(false)
    setFormData({ paymentMethod: '', transactionId: '', transactionDate: '', amount: '' })
    removeFile()
    setErrors({})
  }

  return (
    <div className="payment-page">
      <div className="scanlines"></div>
      
      {/* Holographic Hexagonal Grid Network */}
      <div className="hologram-container">
        <div className="hex-node node-1"></div>
        <div className="hex-node node-2"></div>
        <div className="hex-node node-3"></div>
        <div className="hex-link link-1"></div>
        <div className="hex-link link-2"></div>
      </div>

      <div className="payment-container">
        {/* Header */}
        <header className="payment-header">
          <div className="glitch-wrapper">
            <div className="payment-header__badge">CODEVERSE</div>
          </div>
          <h1 className="payment-header__title glitch" data-text="Payment Portal">Payment Portal</h1>
          <p className="payment-header__subtitle">
            Execute transaction sequence to finalize registration
          </p>
        </header>

        {/* Payment Information Section */}
        <section className="section-card">
          <div className="hud-corner top-left"></div>
          <div className="hud-corner top-right"></div>
          <div className="hud-corner bottom-left"></div>
          <div className="hud-corner bottom-right"></div>
          <div className="section-card__header">
            <div className="section-card__icon">💳</div>
            <div>
              <h2 className="section-card__title">Payment Information</h2>
              <p className="section-card__description">Choose your preferred payment method</p>
            </div>
          </div>

          {/* Tabs */}
          <div className="payment-tabs">
            <button
              className={`payment-tab ${activeTab === 'upi' ? 'payment-tab--active' : ''}`}
              onClick={() => setActiveTab('upi')}
            >
              📱 UPI Payment
            </button>
            <button
              className={`payment-tab ${activeTab === 'bank' ? 'payment-tab--active' : ''}`}
              onClick={() => setActiveTab('bank')}
            >
              🏦 Bank Transfer
            </button>
          </div>

          {/* UPI Content */}
          {activeTab === 'upi' && (
            <div className="upi-section">
              <div className="upi-id-block">
                <div className="upi-id-label">UPI ID</div>
                <div className="upi-id-value">
                  <span>{PAYMENT_INFO.upi.id}</span>
                  <button className="copy-btn" onClick={handleCopyUPI}>
                    {copied ? '✓ Copied!' : '📋 Copy'}
                  </button>
                </div>
              </div>
              <div className="upi-qr-block">
                <img
                  src={PAYMENT_INFO.upi.qrCodeUrl}
                  alt="UPI QR Code"
                  onError={(e) => {
                    e.target.style.display = 'flex'
                    e.target.style.alignItems = 'center'
                    e.target.style.justifyContent = 'center'
                    e.target.alt = 'QR Code Placeholder'
                  }}
                />
                <div className="upi-qr-label">Scan to Pay</div>
              </div>
            </div>
          )}

          {/* Bank Transfer Content */}
          {activeTab === 'bank' && (
            <div className="bank-details-grid">
              <div className="bank-detail-item">
                <div className="bank-detail-item__label">Beneficiary Name</div>
                <div className="bank-detail-item__value">{PAYMENT_INFO.bank.beneficiaryName}</div>
              </div>
              <div className="bank-detail-item">
                <div className="bank-detail-item__label">Account Holder Name</div>
                <div className="bank-detail-item__value">{PAYMENT_INFO.bank.holderName}</div>
              </div>
              <div className="bank-detail-item">
                <div className="bank-detail-item__label">Bank Name</div>
                <div className="bank-detail-item__value">{PAYMENT_INFO.bank.bankName}</div>
              </div>
              <div className="bank-detail-item">
                <div className="bank-detail-item__label">Account Number</div>
                <div className="bank-detail-item__value">{PAYMENT_INFO.bank.accountNumber}</div>
              </div>
              <div className="bank-detail-item">
                <div className="bank-detail-item__label">IFSC Code</div>
                <div className="bank-detail-item__value">{PAYMENT_INFO.bank.ifscCode}</div>
              </div>
              <div className="bank-detail-item">
                <div className="bank-detail-item__label">Account Type</div>
                <div className="bank-detail-item__value">{PAYMENT_INFO.bank.accountType}</div>
              </div>
            </div>
          )}
        </section>

        {/* Payment Submission Section */}
        <section className="section-card">
          <div className="hud-corner top-left"></div>
          <div className="hud-corner top-right"></div>
          <div className="hud-corner bottom-left"></div>
          <div className="hud-corner bottom-right"></div>
          <div className="section-card__header">
            <div className="section-card__icon">📤</div>
            <div>
              <h2 className="section-card__title">Submit Payment Details</h2>
              <p className="section-card__description">Fill in your payment details after completing the transaction</p>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Payment Method */}
            <div className="form-group">
              <label className="form-label">
                Payment Method <span className="required">*</span>
              </label>
              <select
                className="form-select"
                name="paymentMethod"
                value={formData.paymentMethod}
                onChange={handleInputChange}
              >
                <option value="">Select payment method</option>
                <option value="UPI">UPI</option>
                <option value="Bank Transfer">Bank Transfer</option>
                <option value="Other">Other</option>
              </select>
              {errors.paymentMethod && <div className="error-message">⚠ {errors.paymentMethod}</div>}
            </div>

            {/* Transaction ID & Date */}
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">
                  Transaction ID / UTR <span className="required">*</span>
                </label>
                <input
                  className="form-input"
                  type="text"
                  name="transactionId"
                  value={formData.transactionId}
                  onChange={handleInputChange}
                  placeholder="Enter transaction ID or UTR number"
                />
                {errors.transactionId && <div className="error-message">⚠ {errors.transactionId}</div>}
              </div>
              <div className="form-group">
                <label className="form-label">
                  Transaction Date <span className="required">*</span>
                </label>
                <input
                  className="form-input"
                  type="date"
                  name="transactionDate"
                  value={formData.transactionDate}
                  onChange={handleInputChange}
                />
                {errors.transactionDate && <div className="error-message">⚠ {errors.transactionDate}</div>}
              </div>
            </div>

            {/* Amount */}
            <div className="form-group">
              <label className="form-label">
                Amount (₹) <span className="required">*</span>
              </label>
              <input
                className="form-input"
                type="number"
                name="amount"
                value={formData.amount}
                onChange={handleInputChange}
                placeholder="Enter the amount paid"
                min="1"
                step="0.01"
              />
              {errors.amount && <div className="error-message">⚠ {errors.amount}</div>}
            </div>

            {/* File Upload */}
            <div className="form-group">
              <label className="form-label">
                Payment Screenshot / Proof <span className="required">*</span>
              </label>
              <div
                className={`file-upload-zone ${dragActive ? 'file-upload-zone--active' : ''} ${fileError ? 'file-upload-zone--error' : ''}`}
                onClick={() => fileInputRef.current?.click()}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept={ACCEPTED_EXTENSIONS}
                  onChange={handleFileInputChange}
                  style={{ display: 'none' }}
                />
                <div className="file-upload-zone__icon">📁</div>
                <p className="file-upload-zone__text">
                  <strong>Click to upload</strong> or drag and drop
                </p>
                <p className="file-upload-zone__hint">
                  Supported formats: JPEG, PNG, JPG, GIF, WebP &bull; Max size: 10MB
                </p>
              </div>
              {fileError && <div className="error-message">⚠ {fileError}</div>}
              {errors.file && !file && <div className="error-message">⚠ {errors.file}</div>}

              {/* File Preview */}
              {file && filePreview && (
                <div className="file-preview">
                  <img className="file-preview__image" src={filePreview} alt="Preview" />
                  <div className="file-preview__info">
                    <div className="file-preview__name">{file.name}</div>
                    <div className="file-preview__size">{formatFileSize(file.size)}</div>
                  </div>
                  <button type="button" className="file-preview__remove" onClick={removeFile}>
                    ✕ Remove
                  </button>
                </div>
              )}
            </div>

            {errors.submit && <div className="error-message" style={{marginBottom: '16px'}}>⚠ {errors.submit}</div>}

            {/* Submit Button */}
            <button type="submit" className="submit-btn" disabled={isSubmitting}>
              {isSubmitting ? 'Submitting...' : 'Submit Payment Details'}
            </button>
          </form>
        </section>
      </div>

      {/* Success Modal */}
      {submitted && (
        <div className="success-overlay" onClick={handleCloseSuccess}>
          <div className="success-modal" onClick={(e) => e.stopPropagation()}>
            <div className="success-modal__icon">✅</div>
            <h3 className="success-modal__title">Payment Submitted!</h3>
            <p className="success-modal__text">
              Your payment details have been submitted successfully. Our team will verify your payment and confirm your registration shortly.
            </p>
            <button className="success-modal__btn" onClick={handleCloseSuccess}>
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
