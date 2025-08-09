// server.js
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Pool } = require('pg');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3001;

// Database connection
const db = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true
}));

app.use(express.json());
app.use(express.raw({ type: 'application/json', limit: '10mb' }));

// Authentication middleware
const authenticate = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// =============================================
// AUTHENTICATION ROUTES
// =============================================

// Register new organization
app.post('/api/auth/register', async (req, res) => {
  const client = await db.connect();
  
  try {
    await client.query('BEGIN');
    
    const {
      organizationName,
      email,
      password,
      firstName,
      lastName,
      phone,
      address,
      city,
      state,
      postalCode
    } = req.body;

    // Check if email already exists
    const existingUser = await client.query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );
    
    if (existingUser.rows.length > 0) {
      return res.status(409).json({ error: 'Email already exists' });
    }

    // Create Stripe customer
    const customer = await stripe.customers.create({
      email: email,
      name: organizationName,
      metadata: {
        organization_name: organizationName
      }
    });

    // Calculate trial end date (14 days)
    const trialEndsAt = new Date();
    trialEndsAt.setDate(trialEndsAt.getDate() + 14);

    // Create organization
    const orgResult = await client.query(`
      INSERT INTO organizations (
        name, email, phone, stripe_customer_id, 
        subscription_status, subscription_tier, trial_ends_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id, name, subscription_status, trial_ends_at
    `, [
      organizationName,
      email,
      phone,
      customer.id,
      'trialing',
      'starter',
      trialEndsAt
    ]);

    const organization = orgResult.rows[0];

    // Create primary location
    await client.query(`
      INSERT INTO pharmacy_locations (
        organization_id, name, is_primary,
        address_line1, city, state_province, postal_code
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
    `, [
      organization.id,
      'Main Location',
      true,
      address,
      city,
      state,
      postalCode
    ]);

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create admin user
    const userResult = await client.query(`
      INSERT INTO users (
        organization_id, email, password_hash,
        first_name, last_name, role
      ) VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id, email, first_name, last_name, role
    `, [
      organization.id,
      email,
      passwordHash,
      firstName,
      lastName,
      'admin'
    ]);

    const user = userResult.rows[0];

    await client.query('COMMIT');

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user.id, 
        organizationId: organization.id,
        role: user.role 
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({
      success: true,
      organization,
      user,
      token,
      trialEndsAt
    });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  } finally {
    client.release();
  }
});

// Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const result = await db.query(`
      SELECT 
        u.id, u.organization_id, u.email, u.password_hash, 
        u.first_name, u.last_name, u.role,
        o.name as organization_name, o.subscription_status,
        o.subscription_tier, o.trial_ends_at
      FROM users u
      JOIN organizations o ON u.organization_id = o.id
      WHERE u.email = $1 AND u.is_active = true
    `, [email]);

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = result.rows[0];

    // Verify password
    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Update last login
    await db.query(
      'UPDATE users SET last_login_at = CURRENT_TIMESTAMP WHERE id = $1',
      [user.id]
    );

    // Generate token
    const token = jwt.sign(
      { 
        userId: user.id, 
        organizationId: user.organization_id,
        role: user.role 
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    delete user.password_hash;

    res.json({
      success: true,
      user,
      token
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// =============================================
// SUBSCRIPTION ROUTES
// =============================================

// Get subscription details
app.get('/api/subscription', authenticate, async (req, res) => {
  try {
    const result = await db.query(`
      SELECT 
        o.id, o.name, o.subscription_status, o.subscription_tier,
        o.subscription_start_date, o.subscription_end_date, o.trial_ends_at,
        o.monthly_compound_limit, o.user_limit,
        sp.display_name as plan_name, sp.monthly_price, sp.annual_price,
        COUNT(DISTINCT u.id) as current_users,
        COALESCE(ut.compounds_created, 0) as compounds_this_month
      FROM organizations o
      LEFT JOIN subscription_plans sp ON o.subscription_tier = sp.name
      LEFT JOIN users u ON o.id = u.organization_id AND u.is_active = true
      LEFT JOIN usage_tracking ut ON o.id = ut.organization_id 
        AND ut.billing_period_start = DATE_TRUNC('month', CURRENT_DATE)
      WHERE o.id = $1
      GROUP BY o.id, sp.id, ut.compounds_created
    `, [req.user.organizationId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Organization not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Subscription fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch subscription' });
  }
});

// Create subscription
app.post('/api/subscription/create', authenticate, async (req, res) => {
  try {
    const { planId, billingPeriod = 'monthly' } = req.body;

    // Get organization and plan details
    const orgResult = await db.query(
      'SELECT stripe_customer_id FROM organizations WHERE id = $1',
      [req.user.organizationId]
    );

    const planResult = await db.query(
      'SELECT * FROM subscription_plans WHERE name = $1',
      [planId]
    );

    if (orgResult.rows.length === 0 || planResult.rows.length === 0) {
      return res.status(404).json({ error: 'Organization or plan not found' });
    }

    const org = orgResult.rows[0];
    const plan = planResult.rows[0];

    // Create Stripe checkout session
    const priceId = billingPeriod === 'annual' 
      ? plan.stripe_price_id_annual 
      : plan.stripe_price_id_monthly;

    const session = await stripe.checkout.sessions.create({
      customer: org.stripe_customer_id,
      payment_method_types: ['card'],
      line_items: [{
        price: priceId,
        quantity: 1,
      }],
      mode: 'subscription',
      success_url: `${process.env.CORS_ORIGIN}/dashboard?success=true`,
      cancel_url: `${process.env.CORS_ORIGIN}/subscribe?canceled=true`,
      metadata: {
        organization_id: req.user.organizationId,
        plan_id: planId
      }
    });

    res.json({
      success: true,
      checkout_url: session.url
    });

  } catch (error) {
    console.error('Subscription creation error:', error);
    res.status(500).json({ error: 'Failed to create subscription' });
  }
});

// =============================================
// DASHBOARD ROUTES
// =============================================

// Get dashboard metrics
app.get('/api/dashboard/metrics', authenticate, async (req, res) => {
  try {
    // Get compound metrics
    const compoundResult = await db.query(`
      SELECT 
        COUNT(*) as total_compounds,
        COUNT(CASE WHEN DATE_TRUNC('month', preparation_date) = DATE_TRUNC('month', CURRENT_DATE) THEN 1 END) as this_month,
        COUNT(CASE WHEN risk_level = 'A' THEN 1 END) as level_a,
        COUNT(CASE WHEN risk_level = 'B' THEN 1 END) as level_b,
        COUNT(CASE WHEN risk_level = 'C' THEN 1 END) as level_c
      FROM compound_records
      WHERE organization_id = $1
    `, [req.user.organizationId]);

    // Get formula count
    const formulaResult = await db.query(
      'SELECT COUNT(*) as total_formulas FROM master_formulas WHERE organization_id = $1',
      [req.user.organizationId]
    );

    // Get user count
    const userResult = await db.query(
      'SELECT COUNT(*) as total_users FROM users WHERE organization_id = $1 AND is_active = true',
      [req.user.organizationId]
    );

    res.json({
      compounds: compoundResult.rows[0],
      formulas: formulaResult.rows[0],
      users: userResult.rows[0]
    });

  } catch (error) {
    console.error('Dashboard metrics error:', error);
    res.status(500).json({ error: 'Failed to fetch metrics' });
  }
});

// =============================================
// STRIPE WEBHOOK
// =============================================

app.post('/webhooks/stripe', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  
  try {
    const event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
    
    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object;
        
        // Update organization subscription status
        await db.query(`
          UPDATE organizations 
          SET subscription_status = 'active',
              subscription_start_date = CURRENT_TIMESTAMP
          WHERE id = $1
        `, [session.metadata.organization_id]);
        
        break;
        
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }
    
    res.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(400).json({ error: `Webhook Error: ${error.message}` });
  }
});

// =============================================
// HEALTH CHECK
// =============================================

app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// =============================================
// START SERVER
// =============================================

app.listen(port, () => {
  console.log(`PharmCompound Pro API running on port ${port}`);
});