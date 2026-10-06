require('dotenv').config();

const { createClient } = require('@supabase/supabase-js');
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

const app = express();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const PORT = process.env.PORT || 5000;

// --------------------
// Middleware
// --------------------

app.use(cors());
app.use(express.json());

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
    const uniqueSuffix =
      Date.now() + '-' + Math.round(Math.random() * 1E9);

    cb(null, uniqueSuffix + path.extname(file.originalname));
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
        message: error.message
      });
    }

    res.json({
      status: 'ok',
      message: 'Backend connected to Supabase successfully'
    });

  } catch (err) {
    res.status(500).json({
      status: 'error',
      message: err.message
    });
  }
});

// --------------------
// Team Registration
// --------------------

app.post('/api/register', async (req, res) => {
  try {
    const { teamName, members } = req.body;

    if (!teamName || !teamName.trim()) {
      return res.status(400).json({
        error: 'Team name is required.'
      });
    }

    if (!Array.isArray(members)) {
      return res.status(400).json({
        error: 'Members data is required.'
      });
    }

    if (members.length < 4 || members.length > 6) {
      return res.status(400).json({
        error: 'Team size must be between 4 and 6 members.'
      });
    }

    // Create team
    const { data: team, error: teamError } = await supabase
      .from('teams')
      .insert({
        team_name: teamName.trim(),
        status: 'awaiting_payment'
      })
      .select()
      .single();

    if (teamError) {
      console.error('Team creation error:', teamError);

      return res.status(500).json({
        error: 'Failed to create team.',
        details: teamError.message
      });
    }

    // Create team members
    const memberRows = members.map((member, index) => ({
      team_id: team.id,
      full_name: member.fullName,
      college_registration_number: member.registrationNumber,
      college_email: member.collegeEmail,
      contact_number: member.phoneNumber,
      role: index === 0 ? 'leader' : 'member'
    }));

    const { error: memberError } = await supabase
      .from('team_members')
      .insert(memberRows);

    if (memberError) {
      console.error('Member creation error:', memberError);

      // Remove team if member insertion fails
      await supabase
        .from('teams')
        .delete()
        .eq('id', team.id);

      return res.status(500).json({
        error: 'Failed to create team members.',
        details: memberError.message
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

      // Validate team ID
      if (!teamId) {
        return res.status(400).json({
          error: 'Team ID is required.'
        });
      }

      // Check team exists
      const { data: team, error: teamError } = await supabase
        .from('teams')
        .select('id, team_name, unique_id, status')
        .eq('id', teamId)
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
          team_id: teamId,
          payment_method: paymentMethod,
          transaction_id: transactionId,
          transaction_date: transactionDate,
          amount: amount,
          proof_url: file.filename,
          verification_status: 'pending'
        })
        .select()
        .single();

      if (paymentError) {
        console.error('Payment database error:', paymentError);

        return res.status(500).json({
          error: 'Failed to save payment.',
          details: paymentError.message
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
          .eq('id', teamId);

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
        teamId: teamId,
        teamName: team.team_name || teamName,
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
// Start Server
// --------------------

app.listen(PORT, () => {
  console.log(
    `Backend server running on http://localhost:${PORT}`
  );
});