import { useLocation, useNavigate } from 'react-router-dom'
import { useEffect, useRef, useState } from 'react'
import '../index.css'

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
const ACCEPTED_FORMATS = ['image/jpeg', 'image/png', 'image/jpg']
const ACCEPTED_EXTENSIONS = '.jpeg,.png,.jpg'

const PAYMENT_INFO = {
  upi: {
    id: 'metaversevitb@indianbk',
    qrCodeUrl: '/upi-qr.jpg', // Path to the uploaded QR code
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
  const location = useLocation()
  const navigate = useNavigate()

  // Retrieve teamId and teamName internally from search params, location state, or sessionStorage
  const [teamInfo, setTeamInfo] = useState(() => {
    const searchParams = new URLSearchParams(location.search || window.location.search)
    const paramTeamId = searchParams.get('teamId') || searchParams.get('id')
    const paramTeamName = searchParams.get('teamName') || searchParams.get('team')

    let stored = null
    try {
      const raw = sessionStorage.getItem('codeverse_team')
      if (raw) stored = JSON.parse(raw)
    } catch {
      // ignore parse error
    }

    const teamId = paramTeamId || location.state?.teamId || stored?.teamId || ''
    const teamName =
      paramTeamName ||
      location.state?.teamName ||
      location.state?.registration?.teamName ||
      stored?.teamName ||
      ''

    if (teamId) {
      try {
        sessionStorage.setItem('codeverse_team', JSON.stringify({ teamId, teamName }))
      } catch {
        // ignore storage error
      }
    }

    return { teamId, teamName }
  })

  // Keep teamInfo in sync if URL query parameter updates
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search || window.location.search)
    const paramTeamId = searchParams.get('teamId') || searchParams.get('id')
    const paramTeamName = searchParams.get('teamName') || searchParams.get('team')

    if (paramTeamId && paramTeamId !== teamInfo.teamId) {
      const updated = {
        teamId: paramTeamId,
        teamName: paramTeamName || teamInfo.teamName,
      }
      setTeamInfo(updated)
      try {
        sessionStorage.setItem('codeverse_team', JSON.stringify(updated))
      } catch {
        // ignore
      }
    }
  }, [location.search, teamInfo.teamId, teamInfo.teamName])

  const [activeTab, setActiveTab] = useState('upi')
  const [copied, setCopied] = useState(false)

  const [formData, setFormData] = useState({
    paymentMethod: 'UPI',
    transactionId: '',
    transactionDate: '',
    amount: '',
  })

  const [file, setFile] = useState(null)
  const [filePreview, setFilePreview] = useState(null)
  const [fileError, setFileError] = useState('')
  const [dragActive, setDragActive] = useState(false)
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')

  const fileInputRef = useRef(null)

  const handleCopyUPI = async () => {
    try {
      await navigator.clipboard.writeText(PAYMENT_INFO.upi.id)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
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
      return 'Invalid file format. Please upload a JPEG, PNG, or JPG image.'
    }
    if (selectedFile.size > MAX_FILE_SIZE) {
      return `File size exceeds 10MB. Your file is ${(selectedFile.size / (1024 * 1024)).toFixed(2)}MB.`
    }
    return ''
  }

  const handleFileSelect = (selectedFile) => {
    const err = validateFile(selectedFile)
    if (err) {
      setFileError(err)
      setFile(null)
      setFilePreview(null)
      return
    }

    setFileError('')
    setFile(selectedFile)

    const reader = new FileReader()
    reader.onload = (e) => {
      setFilePreview(e.target.result)
    }
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

    if (!formData.paymentMethod) {
      newErrors.paymentMethod = 'Please select a payment method.'
    }
    if (!formData.transactionId.trim()) {
      newErrors.transactionId = 'Transaction ID / UTR is required.'
    }
    if (!formData.transactionDate) {
      newErrors.transactionDate = 'Transaction date is required.'
    }
    if (!formData.amount || Number(formData.amount) <= 0) {
      newErrors.amount = 'Please enter a valid payment amount.'
    }
    if (!file) {
      newErrors.file = 'Payment screenshot proof is required.'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitError('')

    if (!validateForm()) {
      return
    }

    if (!teamInfo.teamId) {
      setSubmitError(
        'Missing registration session: Team ID was not found. Please submit your team registration from the review page first.'
      )
      return
    }

    setIsSubmitting(true)

    const formDataToSend = new FormData()
    formDataToSend.append('paymentMethod', formData.paymentMethod)
    formDataToSend.append('transactionId', formData.transactionId)
    formDataToSend.append('transactionDate', formData.transactionDate)
    formDataToSend.append('amount', formData.amount)
    formDataToSend.append('teamName', teamInfo.teamName)
    formDataToSend.append('teamId', teamInfo.teamId)
    formDataToSend.append('screenshot', file)

    try {
      const response = await fetch('https://codeverse-sitetest.onrender.com/api/submit-payment', {
        method: 'POST',
        body: formDataToSend,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit payment details.')
      }

      // Save confirmation state for resilience on page refresh
      const confirmationState = {
        teamName: data.teamName || teamInfo.teamName,
        uniqueId: data.uniqueId,
        status: data.status || 'payment_submitted',
      }

      try {
        sessionStorage.setItem('codeverse_confirmation', JSON.stringify(confirmationState))
      } catch {
        // ignore
      }

      navigate('/register/confirmation', {
        state: confirmationState,
      })
    } catch (err) {
      console.error('Error submitting payment:', err)
      setSubmitError(err.message || 'Unable to submit payment. Please verify your details.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="page">
      <div className="container">
        <h1 className="pageTitle">Payment Portal</h1>
        <p className="pageSubtitle">
          CodeVerse Hackathon — Execute transaction sequence to finalize registration.
        </p>

        {/* ── Section 1: Payment Information ───────────────────────── */}
        <section className="section" aria-label="Payment information">
          <div className="sectionHeader">
            <h2 className="sectionTitle">Payment Information</h2>
            {teamInfo.teamName && (
              <span className="sectionMeta">
                Team: {teamInfo.teamName}
              </span>
            )}
          </div>
          <p className="sectionSubtitle">Choose your preferred payment method below.</p>
          <hr className="divider" />

          {/* Payment Method Tabs */}
          <div className="tabGroup" role="tablist">
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'upi'}
              className={`tabBtn ${activeTab === 'upi' ? 'tabBtnActive' : ''}`}
              onClick={() => {
                setActiveTab('upi')
                setFormData((prev) => ({ ...prev, paymentMethod: 'UPI' }))
              }}
            >
              <span>📱</span> UPI Payment
            </button>

            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'bank'}
              className={`tabBtn ${activeTab === 'bank' ? 'tabBtnActive' : ''}`}
              onClick={() => {
                setActiveTab('bank')
                setFormData((prev) => ({ ...prev, paymentMethod: 'Bank Transfer' }))
              }}
            >
              <span>🏦</span> Bank Transfer
            </button>
          </div>

          {/* UPI View */}
          {activeTab === 'upi' && (
            <div className="card">
              <div className="upiBlock">
                <div className="upiDetails">
                  <span className="label">Official UPI ID</span>
                  <div className="upiIdBox">
                    <span>{PAYMENT_INFO.upi.id}</span>
                    <button type="button" className="copyBtn" onClick={handleCopyUPI}>
                      {copied ? '✓ Copied' : '📋 Copy UPI ID'}
                    </button>
                  </div>
                  <p style={{ fontSize: '0.82rem', color: '#64748b', marginTop: '10px' }}>
                    Send the registration fee via any UPI application (GPay, PhonePe, Paytm).
                  </p>
                </div>

                <div className="upiQrBox">
                  <img
                    className="upiQrImage"
                    src={PAYMENT_INFO.upi.qrCodeUrl}
                    alt="UPI QR Code"
                    onError={(e) => {
                      e.target.style.display = 'none'
                    }}
                  />
                  <div className="upiQrHint">Scan to Pay</div>
                </div>
              </div>
            </div>
          )}

          {/* Bank Transfer View */}
          {activeTab === 'bank' && (
            <div className="bankGrid">
              <div className="bankItem">
                <div className="bankItemLabel">Account Holder</div>
                <div className="bankItemValue">{PAYMENT_INFO.bank.holderName}</div>
              </div>

              <div className="bankItem">
                <div className="bankItemLabel">Bank Name</div>
                <div className="bankItemValue">{PAYMENT_INFO.bank.bankName}</div>
              </div>

              <div className="bankItem">
                <div className="bankItemLabel">Account Number</div>
                <div className="bankItemValue">{PAYMENT_INFO.bank.accountNumber}</div>
              </div>

              <div className="bankItem">
                <div className="bankItemLabel">IFSC Code</div>
                <div className="bankItemValue">{PAYMENT_INFO.bank.ifscCode}</div>
              </div>
              <div className="bankItem">
                <div className="bankItemLabel">Beneficiary Name</div>
                <div className="bankItemValue">{PAYMENT_INFO.bank.beneficiaryName}</div>
              </div>

              <div className="bankItem">
                <div className="bankItemLabel">Account Type</div>
                <div className="bankItemValue">{PAYMENT_INFO.bank.accountType}</div>
              </div>
            </div>
          )}
        </section>

        {/* ── Section 2: Submit Payment Details Form ──────────────── */}
        <section className="section" aria-label="Submit payment details">
          <h2 className="sectionTitle">Submit Payment Details</h2>
          <p className="sectionSubtitle">
            Fill in your payment confirmation details after completing the transaction.
          </p>
          <hr className="divider" />

          <form onSubmit={handleSubmit} noValidate>
            {/* Payment Method */}
            <div className="fieldGroup">
              <label className="label" htmlFor="paymentMethod">
                Payment Method<span className="required">*</span>
              </label>
              <select
                id="paymentMethod"
                name="paymentMethod"
                className={`select ${errors.paymentMethod ? 'inputError' : ''}`}
                value={formData.paymentMethod}
                onChange={handleInputChange}
              >
                <option value="UPI">UPI</option>
                <option value="Bank Transfer">Bank Transfer</option>
                <option value="Other">Other</option>
              </select>
              {errors.paymentMethod && (
                <span className="errorMsg" role="alert">
                  {errors.paymentMethod}
                </span>
              )}
            </div>

            {/* Transaction ID & Date Grid */}
            <div className="grid">
              <div className="fieldGroup">
                <label className="label" htmlFor="transactionId">
                  Transaction ID / UTR<span className="required">*</span>
                </label>
                <input
                  id="transactionId"
                  name="transactionId"
                  type="text"
                  className={`input ${errors.transactionId ? 'inputError' : ''}`}
                  value={formData.transactionId}
                  onChange={handleInputChange}
                  placeholder="Enter 12-digit UTR or reference ID"
                  autoComplete="off"
                />
                {errors.transactionId && (
                  <span className="errorMsg" role="alert">
                    {errors.transactionId}
                  </span>
                )}
              </div>

              <div className="fieldGroup">
                <label className="label" htmlFor="transactionDate">
                  Transaction Date<span className="required">*</span>
                </label>
                <input
                  id="transactionDate"
                  name="transactionDate"
                  type="date"
                  className={`input ${errors.transactionDate ? 'inputError' : ''}`}
                  value={formData.transactionDate}
                  onChange={handleInputChange}
                />
                {errors.transactionDate && (
                  <span className="errorMsg" role="alert">
                    {errors.transactionDate}
                  </span>
                )}
              </div>
            </div>

            {/* Amount */}
            <div className="fieldGroup">
              <label className="label" htmlFor="amount">
                Amount Paid (₹)<span className="required">*</span>
              </label>
              <input
                id="amount"
                name="amount"
                type="number"
                min="1"
                step="0.01"
                className={`input ${errors.amount ? 'inputError' : ''}`}
                value={formData.amount}
                onChange={handleInputChange}
                placeholder="e.g. 500"
              />
              {errors.amount && (
                <span className="errorMsg" role="alert">
                  {errors.amount}
                </span>
              )}
            </div>

            {/* Payment Screenshot Dropzone */}
            <div className="fieldGroup">
              <label className="label">
                Payment Screenshot / Proof<span className="required">*</span>
              </label>

              <div
                className={`fileDropZone ${dragActive ? 'fileDropZoneActive' : ''} ${
                  fileError || errors.file ? 'fileDropZoneError' : ''
                }`}
                onClick={() => fileInputRef.current?.click()}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                role="button"
                tabIndex={0}
                aria-label="Upload payment screenshot"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept={ACCEPTED_EXTENSIONS}
                  onChange={handleFileInputChange}
                  style={{ display: 'none' }}
                />

                <div className="fileDropIcon">📁</div>
                <p className="fileDropText">
                  <strong>Click to upload</strong> or drag and drop
                </p>
                <p className="fileDropHint">
                  Supported formats: JPEG, PNG, JPG • Maximum file size: 10MB
                </p>
              </div>

              {fileError && (
                <span className="errorMsg" role="alert">
                  {fileError}
                </span>
              )}
              {errors.file && !file && (
                <span className="errorMsg" role="alert">
                  {errors.file}
                </span>
              )}

              {/* Uploaded File Preview */}
              {file && filePreview && (
                <div className="filePreviewCard">
                  <img className="filePreviewThumb" src={filePreview} alt="Screenshot preview" />
                  <div className="filePreviewDetails">
                    <div className="filePreviewName">{file.name}</div>
                    <div className="filePreviewSize">{formatFileSize(file.size)}</div>
                  </div>
                  <button type="button" className="removeBtn" onClick={removeFile}>
                    ✕ Remove
                  </button>
                </div>
              )}
            </div>

            {/* Error Banner */}
            {submitError && (
              <div className="formError" role="alert">
                {submitError}
              </div>
            )}

            {/* Submit Button */}
            <button type="submit" className="submitBtn" disabled={isSubmitting}>
              {isSubmitting ? 'Submitting Payment...' : 'Submit Payment Details →'}
            </button>
          </form>
        </section>
      </div>
    </main>
  )
}
