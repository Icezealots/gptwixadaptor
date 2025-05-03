const express = require('express');
const { Pool } = require('pg');
const app = express();
const port = process.env.PORT || 3000;

const pool = new Pool({
  host: 'dpg-d08obl15pdvs739nmkp0-a.oregon-postgres.render.com',
  user: 'soulv',
  password: 'S1Kt0kXT9u71SNvtyGmoOgXKTs2MZ38y',
  database: 'soulv_db_c786',
  port: 5432
});

app.use(express.json());

// Provision endpoint
app.post('/provision', (req, res) => {
  res.json({ status: 'ok' });
});

// List schemas endpoint
app.get('/listSchemas', (req, res) => {
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
          feedback: { type: 'string' }
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

app.listen(port, () => {
  console.log(`Wix External DB Adaptor listening at http://localhost:${port}`);
});
