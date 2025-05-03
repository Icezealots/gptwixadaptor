const express = require('express');
const { Pool } = require('pg');
const app = express();
const port = process.env.PORT || 3000;

const SECRET = process.env.WIX_SECRET;

app.use(express.json());

// PostgreSQL Pool
const pool = new Pool({
  host: process.env.PGHOST,
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  database: process.env.PGDATABASE,
  port: process.env.PGPORT,
  ssl: { rejectUnauthorized: false }
});

// 驗證 secretKey（來自 body）
function verifySecret(req, res) {
  const secretFromBody = req.body?.requestContext?.settings?.secretKey;
  if (secretFromBody !== SECRET) {
    res.status(403).json({ error: 'Forbidden: Invalid secret key' });
    return false;
  }
  return true;
}

// ✅ schemas/list — 回傳 schema 給 Wix
app.post('/schemas/list', (req, res) => {
  if (!verifySecret(req, res)) return;

  res.json({
    schemas: [
      {
        id: 'feedbacks',
        displayName: 'feedbacks',
        allowedOperations: ['get', 'find', 'count', 'update', 'insert', 'remove'],
        maxPageSize: 50,
        ttl: 3600,
        fields: {
          _id: {
            displayName: '_id',
            type: 'string',
            queryOperators: ['eq', 'ne']
          },
          _createddate: {
            displayName: '_createddate',
            type: 'datetime',
            queryOperators: ['eq', 'lt', 'gt', 'lte', 'gte']
          },
          user_id: {
            displayName: 'user_id',
            type: 'string',
            queryOperators: ['eq', 'startsWith', 'endsWith', 'contains']
          },
          feedback: {
            displayName: 'feedback',
            type: 'text',
            queryOperators: ['eq', 'startsWith', 'endsWith', 'contains']
          }
        }
      }
    ]
  });
});

// ✅ find — 查詢資料
app.post('/find', async (req, res) => {
  if (!verifySecret(req, res)) return;

  const { filter = {} } = req.body;
  const keyword = filter.feedback?.startsWith || ''; // 只示範一種 operator

  const result = await pool.query(
    `SELECT * FROM feedbacks WHERE feedback ILIKE $1`,
    [`${keyword}%`]
  );
  res.json(result.rows);
});

// ✅ insert — 插入資料
app.post('/insert', async (req, res) => {
  if (!verifySecret(req, res)) return;

  // 從請求中提取資料
  const { _id, user_id, feedback, _owner } = req.body.data;
  const now = new Date().toISOString();

  try {
    // 插入資料庫
    await pool.query(
      `INSERT INTO feedbacks (_id, user_id, feedback, _createddate, _updateddate, _owner)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [_id, user_id, feedback, now, now, _owner]
    );
    res.json({ inserted: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error inserting data into database' });
  }
});


// ✅ ping（可選）
app.get('/ping', (req, res) => {
  res.send('ok');
});

app.listen(port, () => {
  console.log(`Adaptor running on http://localhost:${port}`);
});
