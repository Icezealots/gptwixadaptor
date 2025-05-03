const express = require('express');
const { Pool } = require('pg');
const app = express();
const port = process.env.PORT || 3000;  // 預設3000端口

app.use(express.json());

// PostgreSQL Pool
const pool = new Pool({
  host: process.env.PGHOST,
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  database: process.env.PGDATABASE,
  port: process.env.PGPORT
});

// Provision endpoint
app.post('/provision', (req, res) => {
  res.json({ status: 'ok' });
});

// List schemas endpoint
app.get('/listSchemas', (req, res) => {
  console.log('Received request for listSchemas');
  res.json({
    collections: {
      feedbacks: {
        id: 'feedbacks',
        displayName: 'Feedbacks',
        fields: {
          _id: { type: 'string' },
          _createdDate: { type: 'datetime' },
          _updatedDate: { type: 'datetime' },
          _owner: { type: 'string' },
          user_id: { type: 'string' },
          feedback: { type: 'text' }
        },
        allowedOperations: ['get', 'find', 'count', 'update', 'insert', 'remove'],
        maxPageSize: 50,
        ttl: 3600
      }
    }
  });
});

// Get item by _id
app.get('/get', async (req, res) => {
  const { _id } = req.query;
  const result = await pool.query('SELECT * FROM feedbacks WHERE _id = $1', [_id]);
  res.json(result.rows[0] || {});
});

// Find items based on a filter
app.post('/find', async (req, res) => {
  const { filter } = req.body;
  const result = await pool.query('SELECT * FROM feedbacks WHERE feedback LIKE $1', [`%${filter}%`]);
  res.json(result.rows);
});

// Count items
app.post('/count', async (req, res) => {
  const { filter } = req.body;
  const result = await pool.query('SELECT COUNT(*) FROM feedbacks WHERE feedback LIKE $1', [`%${filter}%`]);
  res.json({ count: result.rows[0].count });
});

// Insert item into database
app.post('/insert', async (req, res) => {
  const { user_id, feedback, _owner, _id } = req.body; // 這裡假設 _id 是由外部提供
  const now = new Date().toISOString(); // Current timestamp for _createdDate and _updatedDate

  await pool.query(
    `INSERT INTO feedbacks (_id, user_id, feedback, _createddate, _updateddate, _owner)
     VALUES ($1, $2, $3, $4, $5, $6)`,
    [_id, user_id, feedback, now, now, _owner || null]
  );
  res.json({ _id });
});

// Update item in database
app.post('/update', async (req, res) => {
  const { _id, user_id, feedback } = req.body;
  const now = new Date().toISOString();

  await pool.query(
    `UPDATE feedbacks SET user_id = $1, feedback = $2, _updateddate = $3 WHERE _id = $4`,
    [user_id, feedback, now, _id]
  );
  res.json({ updated: true });
});

// Remove item from database
app.post('/remove', async (req, res) => {
  const { _id } = req.body;

  await pool.query(`DELETE FROM feedbacks WHERE _id = $1`, [_id]);
  res.json({ removed: true });
});

app.listen(port, () => {
  console.log(`Wix External DB Adaptor listening at http://localhost:${port}`);
});
