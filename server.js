const express = require('express');
const { body, validationResult, param } = require('express-validator');
const db = require('./db');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Serve frontend
app.use(express.static(path.join(__dirname, 'public')));

function handleValidationErrors(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ error: errors.array().map(e => e.msg).join(', ') });
  }
  return null;
}

// API base: /api/droids
app.get('/api/droids', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM droids ORDER BY id ASC');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/droids/:id', param('id').isInt(), async (req, res) => {
  const v = handleValidationErrors(req, res);
  if (v) return;
  try {
    const { id } = req.params;
    const result = await db.query('SELECT * FROM droids WHERE id = $1', [id]);
    if (result.rowCount === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/droids',
  body('name').isLength({ min: 1 }).withMessage('name required'),
  body('type').isLength({ min: 1 }).withMessage('type required'),
  body('year_production').optional().isInt().withMessage('year_production must be integer'),
  body('status').optional().isLength({ min: 1 }),
  async (req, res) => {
    const v = handleValidationErrors(req, res);
    if (v) return;
    try {
      const { name, type, manufacturer, year_production, status } = req.body;
      const result = await db.query(
        'INSERT INTO droids (name, type, manufacturer, year_production, status) VALUES ($1,$2,$3,$4,$5) RETURNING *',
        [name, type, manufacturer || null, year_production || null, status || null]
      );
      res.status(201).json(result.rows[0]);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal server error' });
    }
});

app.put('/api/droids/:id',
  param('id').isInt(),
  body('name').optional().isLength({ min: 1 }).withMessage('name required'),
  body('type').optional().isLength({ min: 1 }).withMessage('type required'),
  body('year_production').optional().isInt().withMessage('year_production must be integer'),
  async (req, res) => {
    const v = handleValidationErrors(req, res);
    if (v) return;
    try {
      const { id } = req.params;
      const fields = [];
      const values = [];
      let idx = 1;
      for (const key of ['name','type','manufacturer','year_production','status']) {
        if (req.body[key] !== undefined) {
          fields.push(key + ' = $' + idx);
          values.push(req.body[key]);
          idx++;
        }
      }
      if (fields.length === 0) return res.status(400).json({ error: 'No fields to update' });
      values.push(id);
      const sql = `UPDATE droids SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`;
      const result = await db.query(sql, values);
      if (result.rowCount === 0) return res.status(404).json({ error: 'Not found' });
      res.json(result.rows[0]);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal server error' });
    }
});

app.delete('/api/droids/:id', param('id').isInt(), async (req, res) => {
  const v = handleValidationErrors(req, res);
  if (v) return;
  try {
    const { id } = req.params;
    const result = await db.query('DELETE FROM droids WHERE id = $1 RETURNING *', [id]);
    if (result.rowCount === 0) return res.status(404).json({ error: 'Not found' });
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Always return index.html for any other path (SPA fallback)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log('Server listening on port', port);
});
