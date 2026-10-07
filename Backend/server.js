require('dotenv').config();

const { createClient } = require('@supabase/supabase-js');
const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const app = express();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const PORT = process.env.PORT || 5000;

// --------------------
// Middleware
// --------------------

const ALLOWED_ORIGINS = [
  // Participant Frontend (homePage, teamRegistration, teamReview)
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  // Participant Payment Portal & Admin (configured dev server port)
  'http://localhost:5174',
  'http://127.0.0.1:5174',
  // Admin & Sibling Vite Dev Servers (automatic port increments when port is busy)
  'http://localhost:5175',
  'http://127.0.0.1:5175',
  'http://localhost:5176',
  'http://127.0.0.1:5176',
  'http://localhost:5177',
  'http://127.0.0.1:5177',
  'http://localhost:5178',
  'http://127.0.0.1:5178',
  'http://localhost:5179',
  'http://127.0.0.1:5179',
  // Vite Preview Servers
  'http://localhost:4173',
  'http://127.0.0.1:4173',
  'http://localhost:4174',
  'http://127.0.0.1:4174',
  'http://localhost:4175',
  'http://127.0.0.1:4175'
];

// Include origins configured in environment variables (if any, without guessing)
if (process.env.ALLOWED_ORIGINS) {
  process.env.ALLOWED_ORIGINS.split(',').forEach((origin) => {
    const trimmed = origin.trim();
    if (trimmed && !ALLOWED_ORIGINS.includes(trimmed)) {
      ALLOWED_ORIGINS.push(trimmed);
    }
  });
}
if (process.env.FRONTEND_URL) {
  process.env.FRONTEND_URL.split(',').forEach((origin) => {
    const trimmed = origin.trim();
    if (trimmed && !ALLOWED_ORIGINS.includes(trimmed)) {
      ALLOWED_ORIGINS.push(trimmed);
    }
  });
}

const corsOptions = {
  origin: (origin, callback) => {
    // Allow non-browser requests with no origin (e.g. server-to-server, curl, health checks)
    if (!origin) {
      return callback(null, true);
    }

    if (ALLOWED_ORIGINS.includes(origin)) {
      return callback(null, true);
    }

    const corsError = new Error('CORS request blocked: origin not allowed.');
    corsError.status = 403;
    return callback(corsError);
  },
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: false,
  optionsSuccessStatus: 204
};

app.use(cors(corsOptions));
app.use(express.json());

// --------------------
// Rate Limiting
// --------------------

const registrationLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Too many requests. Please try again later.'
  }
});

const paymentLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Too many requests. Please try again later.'
  }
});

const adminLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Too many requests. Please try again later.'
  }
});
// --------------------
// Admin Authentication
// --------------------

async function requireAdmin(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'Authentication required.'
      });
    }

    const token = authHeader.replace('Bearer ', '');

    const {
      data: { user },
      error: authError
    } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return res.status(401).json({
        error: 'Invalid or expired authentication token.'
      });
    }

    const { data: admin, error: adminError } = await supabase
      .from('admin')
      .select('user_id, role')
      .eq('user_id', user.id)
      .single();

    if (adminError || !admin) {
      return res.status(403).json({
        error: 'Admin access denied.'
      });
    }

    req.admin = {
      user_id: user.id,
      role: admin.role
    };

    next();
  } catch (err) {
    console.error('Admin authentication error:', err);

    return res.status(500).json({
      error: 'Authentication check failed.'
    });
  }
}

// --------------------
// Audit Logging
// --------------------

async function recordAuditLog({ adminUserId, action, paymentId, teamId, details }) {
  try {
    const { error } = await supabase
      .from('audit_logs')
      .insert({
        admin_user_id: adminUserId || null,
        action,
        payment_id: paymentId || null,
        team_id: teamId || null,
        details: details || {}
      });

    if (error) {
      console.error(`[AUDIT LOG] Failed to record ${action}:`, error.message);
    }
  } catch (err) {
    console.error(`[AUDIT LOG] Unexpected error recording ${action}:`, err.message || err);
  }
}

// --------------------
// Multer setup
// --------------------

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, 'uploads');

    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath);
    }

    cb(null, uploadPath);
  },

  filename: (req, file, cb) => {
    const rawExt = path.extname(file.originalname || '').toLowerCase();
    const safeExt = rawExt.replace(/[^a-z0-9]/g, '');
    const ext = safeExt ? `.${safeExt}` : '.jpg';
    const uniqueSuffix = `${Date.now()}-${crypto.randomBytes(16).toString('hex')}`;

    cb(null, `${uniqueSuffix}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/jpg',
      'image/gif',
      'image/webp'
    ];

    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'));
    }
  }
});

// --------------------
// Validation Helpers
// --------------------

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^\+?[\d\s\-().]{7,20}$/;
const ACCEPTED_PAYMENT_METHODS = ['UPI', 'Bank Transfer', 'Other'];

function isValidUUID(id) {
  return typeof id === 'string' && UUID_REGEX.test(id.trim());
}

function isValidEmail(email) {
  if (typeof email !== 'string') return false;
  const trimmed = email.trim();
  return trimmed.length > 0 && trimmed.length <= 150 && EMAIL_REGEX.test(trimmed);
}

function isValidPhone(phone) {
  if (typeof phone !== 'string') return false;
  const trimmed = phone.trim();
  if (trimmed.length > 25 || !PHONE_REGEX.test(trimmed)) return false;
  const digitsOnly = trimmed.replace(/\D/g, '');
  return digitsOnly.length >= 7 && digitsOnly.length <= 15;
}

function isValidDateString(dateStr) {
  if (typeof dateStr !== 'string') return false;
  const trimmed = dateStr.trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return false;
  const timestamp = Date.parse(trimmed);
  if (isNaN(timestamp)) return false;
  const date = new Date(timestamp);
  const year = date.getUTCFullYear();
  return year >= 2020 && year <= 2035;
}

// --------------------
// Health Check
// --------------------

app.get('/api/health', async (req, res) => {
  try {
    const { error } = await supabase
      .from('teams')
      .select('id')
      .limit(1);

    if (error) {
      return res.status(500).json({
        status: 'error',
        message: 'Database health check failed.'
      });
    }

    res.json({
      status: 'ok',
      message: 'Backend connected to Supabase successfully'
    });

  } catch (err) {
    console.error('Health check error:', err);

    res.status(500).json({
      status: 'error',
      message: 'Service health check encountered an error.'
    });
  }
});

// --------------------
// Team Registration
// --------------------

app.post('/api/register', registrationLimiter, async (req, res) => {
  try {
    if (!req.body || typeof req.body !== 'object') {
      return res.status(400).json({
        error: 'Invalid request body.'
      });
    }

    const { teamName, members } = req.body;

    if (!teamName || typeof teamName !== 'string') {
      return res.status(400).json({
        error: 'Team name is required.'
      });
    }

    const trimmedTeamName = teamName.trim();
    if (!trimmedTeamName) {
      return res.status(400).json({
        error: 'Team name cannot be empty.'
      });
    }

    if (trimmedTeamName.length > 100) {
      return res.status(400).json({
        error: 'Team name cannot exceed 100 characters.'
      });
    }

    if (!Array.isArray(members)) {
      return res.status(400).json({
        error: 'Members data is required and must be an array.'
      });
    }

    if (members.length < 4 || members.length > 6) {
      return res.status(400).json({
        error: 'Team size must be between 4 and 6 members.'
      });
    }

    const memberRows = [];
    const seenEmails = new Set();
    const seenRegNums = new Set();
    const seenPhones = new Set();

    for (let i = 0; i < members.length; i++) {
      const member = members[i];
      const memberIndex = i + 1;

      if (!member || typeof member !== 'object' || Array.isArray(member)) {
        return res.status(400).json({
          error: `Member #${memberIndex} data is invalid.`
        });
      }

      const { fullName, registrationNumber, collegeEmail, phoneNumber } = member;

      // Full Name
      if (!fullName || typeof fullName !== 'string' || !fullName.trim()) {
        return res.status(400).json({
          error: `Full name is required for member #${memberIndex}.`
        });
      }
      const trimmedFullName = fullName.trim();
      if (trimmedFullName.length > 100) {
        return res.status(400).json({
          error: `Full name cannot exceed 100 characters for member #${memberIndex}.`
        });
      }

      // Registration Number
      if (!registrationNumber || typeof registrationNumber !== 'string' || !registrationNumber.trim()) {
        return res.status(400).json({
          error: `Registration number is required for member #${memberIndex}.`
        });
      }
      const trimmedRegNum = registrationNumber.trim();
      if (trimmedRegNum.length > 50) {
        return res.status(400).json({
          error: `Registration number cannot exceed 50 characters for member #${memberIndex}.`
        });
      }

      // College Email
      if (!collegeEmail || !isValidEmail(collegeEmail)) {
        return res.status(400).json({
          error: `Valid college email is required for member #${memberIndex}.`
        });
      }
      const trimmedEmail = collegeEmail.trim().toLowerCase();

      // Phone Number
      if (!phoneNumber || !isValidPhone(phoneNumber)) {
        return res.status(400).json({
          error: `Valid phone number is required for member #${memberIndex}.`
        });
      }
      const trimmedPhone = phoneNumber.trim();

      // Duplicate check within team
      if (seenEmails.has(trimmedEmail)) {
        return res.status(400).json({
          error: `Duplicate email address found within team: ${trimmedEmail}.`
        });
      }
      seenEmails.add(trimmedEmail);

      const normReg = trimmedRegNum.toLowerCase();
      if (seenRegNums.has(normReg)) {
        return res.status(400).json({
          error: `Duplicate registration number found within team: ${trimmedRegNum}.`
        });
      }
      seenRegNums.add(normReg);

      const normPhone = trimmedPhone.replace(/\D/g, '');
      if (seenPhones.has(normPhone)) {
        return res.status(400).json({
          error: `Duplicate phone number found within team for member #${memberIndex}.`
        });
      }
      seenPhones.add(normPhone);

      memberRows.push({
        full_name: trimmedFullName,
        college_registration_number: trimmedRegNum,
        college_email: trimmedEmail,
        contact_number: trimmedPhone,
        role: i === 0 ? 'leader' : 'member'
      });
    }

    // Create team
    const { data: team, error: teamError } = await supabase
      .from('teams')
      .insert({
        team_name: trimmedTeamName,
        status: 'awaiting_payment'
      })
      .select()
      .single();

    if (teamError) {
      console.error('Team creation error:', teamError);

      return res.status(500).json({
        error: 'Failed to create team.'
      });
    }

    // Create team members
    const finalMemberRows = memberRows.map((row) => ({
      ...row,
      team_id: team.id
    }));

    const { error: memberError } = await supabase
      .from('team_members')
      .insert(finalMemberRows);

    if (memberError) {
      console.error('Member creation error:', memberError);

      // Rollback: remove team if member insertion fails
      await supabase
        .from('teams')
        .delete()
        .eq('id', team.id);

      return res.status(500).json({
        error: 'Failed to create team members.'
      });
    }

    res.status(201).json({
      message: 'Team registration created successfully.',
      teamId: team.id,
      teamName: team.team_name,
      status: team.status
    });

  } catch (err) {
    console.error('Registration error:', err);

    res.status(500).json({
      error: 'An error occurred during registration.'
    });
  }
});

// --------------------
// Generate CodeVerse ID
// --------------------

async function generateUniqueId() {
  const { data, error } = await supabase
    .from('teams')
    .select('unique_id')
    .like('unique_id', 'CV26-%')
    .order('unique_id', { ascending: false })
    .limit(1);

  if (error) {
    throw new Error(error.message);
  }

  let nextNumber = 1;

  if (data && data.length > 0 && data[0].unique_id) {
    const lastId = data[0].unique_id;
    const lastNumber = parseInt(lastId.replace('CV26-', ''), 10);

    if (!isNaN(lastNumber)) {
      nextNumber = lastNumber + 1;
    }
  }

  return `CV26-${String(nextNumber).padStart(4, '0')}`;
}

// --------------------
// Payment Submission
// --------------------

app.post(
  '/api/submit-payment',
  paymentLimiter,
  upload.single('screenshot'),
  async (req, res) => {
    try {
      const {
        paymentMethod,
        transactionId,
        transactionDate,
        amount,
        teamId,
        teamName
      } = req.body;

      const file = req.file;

      // Validate screenshot
      if (!file) {
        return res.status(400).json({
          error: 'Payment screenshot is required.'
        });
      }

      // Validate team ID format (must be valid UUID)
      if (!teamId || !isValidUUID(teamId)) {
        return res.status(400).json({
          error: 'A valid Team ID (UUID) is required.'
        });
      }
      const safeTeamId = teamId.trim();

      // Validate payment method
      if (!paymentMethod || typeof paymentMethod !== 'string') {
        return res.status(400).json({
          error: 'Payment method is required.'
        });
      }
      const trimmedMethod = paymentMethod.trim();
      const matchedMethod = ACCEPTED_PAYMENT_METHODS.find(
        (m) => m.toLowerCase() === trimmedMethod.toLowerCase()
      );
      if (!matchedMethod) {
        return res.status(400).json({
          error: 'Invalid payment method. Allowed methods: UPI, Bank Transfer, Other.'
        });
      }

      // Validate transaction ID
      if (!transactionId || typeof transactionId !== 'string') {
        return res.status(400).json({
          error: 'Transaction ID is required.'
        });
      }
      const trimmedTxnId = transactionId.trim();
      if (!trimmedTxnId) {
        return res.status(400).json({
          error: 'Transaction ID cannot be empty.'
        });
      }
      if (trimmedTxnId.length > 100) {
        return res.status(400).json({
          error: 'Transaction ID cannot exceed 100 characters.'
        });
      }

      // Validate transaction date
      if (!transactionDate || !isValidDateString(transactionDate)) {
        return res.status(400).json({
          error: 'A valid transaction date is required (YYYY-MM-DD).'
        });
      }
      const safeDate = transactionDate.trim();

      // Validate amount
      const parsedAmount = Number(amount);
      if (
        amount === undefined ||
        amount === null ||
        typeof amount === 'boolean' ||
        isNaN(parsedAmount) ||
        !isFinite(parsedAmount) ||
        parsedAmount <= 0
      ) {
        return res.status(400).json({
          error: 'Amount must be a positive numeric value.'
        });
      }
      if (parsedAmount > 1000000) {
        return res.status(400).json({
          error: 'Amount exceeds maximum permitted limit.'
        });
      }

      // Check team exists
      const { data: team, error: teamError } = await supabase
        .from('teams')
        .select('id, team_name, unique_id, status')
        .eq('id', safeTeamId)
        .single();

      if (teamError || !team) {
        return res.status(404).json({
          error: 'Team not found.'
        });
      }

      // Save payment in Supabase
      const { data: payment, error: paymentError } = await supabase
        .from('payments')
        .insert({
          team_id: safeTeamId,
          payment_method: matchedMethod,
          transaction_id: trimmedTxnId,
          transaction_date: safeDate,
          amount: parsedAmount,
          proof_url: file.filename,
          verification_status: 'pending'
        })
        .select()
        .single();

      if (paymentError) {
        console.error('Payment database error:', paymentError);

        return res.status(500).json({
          error: 'Failed to save payment.'
        });
      }

      // Generate CodeVerse unique ID
      let uniqueId = team.unique_id;

      if (!uniqueId) {
        uniqueId = await generateUniqueId();

        const { error: updateError } = await supabase
          .from('teams')
          .update({
            unique_id: uniqueId,
            status: 'payment_submitted'
          })
          .eq('id', safeTeamId);

        if (updateError) {
          console.error('Team update error:', updateError);

          return res.status(500).json({
            error: 'Payment saved, but failed to finalize team.'
          });
        }
      }

      // Send result to frontend
      res.status(200).json({
        message: 'Payment details submitted successfully!',
        paymentId: payment.id,
        teamId: safeTeamId,
        teamName: team.team_name || (teamName && typeof teamName === 'string' ? teamName.trim() : ''),
        uniqueId: uniqueId,
        status: 'payment_submitted'
      });

    } catch (err) {
      console.error('Payment submission error:', err);

      res.status(500).json({
        error: 'An error occurred while processing the payment.'
      });
    }
  }
);

// --------------------
// Admin: Get All Teams
// --------------------

app.get('/api/admin/teams', adminLimiter, requireAdmin, async (req, res) => {
  try {
    const { data: teams, error: teamsError } = await supabase
      .from('teams')
      .select('*')
      .order('created_at', { ascending: false });

    if (teamsError) {
      console.error('Admin teams error:', teamsError);

      return res.status(500).json({
        error: 'Failed to fetch teams.'
      });
    }

    const { data: members, error: membersError } = await supabase
      .from('team_members')
      .select('*');

    if (membersError) {
      console.error('Admin members error:', membersError);

      return res.status(500).json({
        error: 'Failed to fetch team members.'
      });
    }

    const { data: payments, error: paymentsError } = await supabase
      .from('payments')
      .select('*');

    if (paymentsError) {
      console.error('Admin payments error:', paymentsError);

      return res.status(500).json({
        error: 'Failed to fetch payments.'
      });
    }

    const result = teams.map((team) => ({
      ...team,

      members: members.filter(
        (member) => member.team_id === team.id
      ),

      payments: payments.filter(
        (payment) => payment.team_id === team.id
      )
    }));

    res.json(result);

  } catch (err) {
    console.error('Admin API error:', err);

    res.status(500).json({
      error: 'Failed to fetch admin data.'
    });
  }
});

// --------------------
// Admin: Verify Payment
// --------------------

app.post('/api/admin/payments/:paymentId/verify', adminLimiter, requireAdmin, async (req, res) => {
  try {
    const { paymentId } = req.params;

    if (!paymentId || !isValidUUID(paymentId)) {
      return res.status(400).json({
        error: 'Invalid payment ID format.'
      });
    }

    const safePaymentId = paymentId.trim();

    // Find payment
    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .select('id, team_id')
      .eq('id', safePaymentId)
      .single();

    if (paymentError || !payment) {
      return res.status(404).json({
        error: 'Payment not found.'
      });
    }

    // Update payment status
    const { data: updatedPayment, error: updatePaymentError } =
      await supabase
        .from('payments')
        .update({
          verification_status: 'verified'
        })
        .eq('id', safePaymentId)
        .select()
        .single();

    if (updatePaymentError) {
      console.error(
        'Verify payment error:',
        updatePaymentError
      );

      return res.status(500).json({
        error: 'Failed to verify payment.'
      });
    }

    // Update team status
    const { error: teamError } = await supabase
      .from('teams')
      .update({
        status: 'verified'
      })
      .eq('id', payment.team_id);

    if (teamError) {
      console.error(
        'Team status update error:',
        teamError
      );

      return res.status(500).json({
        error: 'Payment verified, but team status could not be updated.'
      });
    }

    // Record audit log
    await recordAuditLog({
      adminUserId: req.admin?.user_id,
      action: 'PAYMENT_VERIFIED',
      paymentId: safePaymentId,
      teamId: payment.team_id,
      details: {
        status: 'verified'
      }
    });

    res.json({
      message: 'Payment verified successfully.',
      payment: updatedPayment
    });

  } catch (err) {
    console.error(
      'Verify payment API error:',
      err
    );

    res.status(500).json({
      error: 'An error occurred while verifying payment.'
    });
  }
});

// --------------------
// Admin: Reject Payment
// --------------------

app.post('/api/admin/payments/:paymentId/reject', adminLimiter, requireAdmin, async (req, res) => {
  try {
    const { paymentId } = req.params;
    const { reason } = req.body || {};

    if (!paymentId || !isValidUUID(paymentId)) {
      return res.status(400).json({
        error: 'Invalid payment ID format.'
      });
    }

    const safePaymentId = paymentId.trim();

    if (reason !== undefined && reason !== null) {
      if (typeof reason !== 'string') {
        return res.status(400).json({
          error: 'Rejection reason must be text.'
        });
      }
      if (reason.trim().length > 500) {
        return res.status(400).json({
          error: 'Rejection reason cannot exceed 500 characters.'
        });
      }
    }

    // Find payment
    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .select('id, team_id')
      .eq('id', safePaymentId)
      .single();

    if (paymentError || !payment) {
      return res.status(404).json({
        error: 'Payment not found.'
      });
    }

    const rejectionReason =
      reason?.trim() ||
      'Payment proof or transaction ID could not be verified.';

    // Update payment status
    const { data: updatedPayment, error: updatePaymentError } =
      await supabase
        .from('payments')
        .update({
          verification_status: 'rejected',
          rejection_reason: rejectionReason
        })
        .eq('id', safePaymentId)
        .select()
        .single();

    if (updatePaymentError) {
      console.error(
        'Reject payment error:',
        updatePaymentError
      );

      return res.status(500).json({
        error: 'Failed to reject payment.'
      });
    }

    // Update team status
    const { error: teamError } = await supabase
      .from('teams')
      .update({
        status: 'rejected'
      })
      .eq('id', payment.team_id);

    if (teamError) {
      console.error(
        'Team status update error:',
        teamError
      );

      return res.status(500).json({
        error: 'Payment rejected, but team status could not be updated.'
      });
    }

    // Record audit log
    await recordAuditLog({
      adminUserId: req.admin?.user_id,
      action: 'PAYMENT_REJECTED',
      paymentId: safePaymentId,
      teamId: payment.team_id,
      details: {
        status: 'rejected',
        reason: rejectionReason
      }
    });

    res.json({
      message: 'Payment rejected successfully.',
      payment: updatedPayment
    });

  } catch (err) {
    console.error(
      'Reject payment API error:',
      err
    );

    res.status(500).json({
      error: 'An error occurred while rejecting payment.'
    });
  }
});

// --------------------
// Admin: Get Payment Proof
// --------------------

app.get('/api/admin/payments/:paymentId/proof', adminLimiter, requireAdmin, async (req, res) => {
  try {
    const { paymentId } = req.params;

    if (!paymentId || !isValidUUID(paymentId)) {
      return res.status(400).json({
        error: 'Invalid payment ID format.'
      });
    }

    const safePaymentId = paymentId.trim();

    // Retrieve corresponding payment record
    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .select('id, proof_url, team_id')
      .eq('id', safePaymentId)
      .single();

    if (paymentError || !payment) {
      return res.status(404).json({
        error: 'Payment not found.'
      });
    }

    if (!payment.proof_url) {
      return res.status(404).json({
        error: 'Payment proof file not recorded.'
      });
    }

    // Safely resolve the file path inside backend/uploads
    // path.basename strips directory traversals (../../, /, etc.)
    const safeFilename = path.basename(payment.proof_url.trim());
    const uploadsDir = path.resolve(__dirname, 'uploads');
    const filePath = path.resolve(uploadsDir, safeFilename);

    // Verify resolved path strictly resides inside uploadsDir
    if (!filePath.startsWith(uploadsDir + path.sep)) {
      return res.status(403).json({
        error: 'Access denied: invalid file path.'
      });
    }

    // Verify file exists on disk
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        error: 'Payment proof file does not exist on disk.'
      });
    }

    // Record audit log
    await recordAuditLog({
      adminUserId: req.admin?.user_id,
      action: 'PAYMENT_PROOF_VIEWED',
      paymentId: safePaymentId,
      teamId: payment.team_id,
      details: {
        status: 'viewed'
      }
    });

    // Security headers: prevent MIME sniffing and cache leakage
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Cache-Control', 'private, no-cache, no-store, must-revalidate');

    // Return the file
    res.sendFile(filePath);

  } catch (err) {
    console.error('Payment proof fetch error:', err);

    return res.status(500).json({
      error: 'An error occurred while retrieving the payment proof.'
    });
  }
});

// --------------------
// Error Handling Middleware
// --------------------

app.use((err, req, res, next) => {
  if (err && (err.status === 403 || err.message?.startsWith('CORS request blocked'))) {
    return res.status(403).json({
      error: 'CORS request blocked: origin not allowed.'
    });
  }

  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({
      error: 'Malformed JSON payload.'
    });
  }

  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        error: 'File size exceeds maximum limit of 10 MB.'
      });
    }
    return res.status(400).json({
      error: `File upload error: ${err.message}`
    });
  }

  if (err && err.message === 'Invalid file type') {
    return res.status(400).json({
      error: 'Invalid file type. Only JPEG, PNG, JPG, GIF, and WEBP images are allowed.'
    });
  }

  console.error('Unhandled server error:', err);
  return res.status(500).json({
    error: 'An unexpected internal server error occurred.'
  });
});

// --------------------
// Start Server
// --------------------

app.listen(PORT, () => {
  console.log(
    `Backend server running on http://localhost:${PORT}`
  );
});