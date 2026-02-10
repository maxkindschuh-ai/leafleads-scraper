require('dotenv').config();
const express = require('express');
const path = require('path');
const { nanoid } = require('nanoid');
const { stringify } = require('csv-stringify');

const app = express();
const PORT = process.env.PORT || 4000;

app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'frontend')));

// In-memory jobs
const jobs = new Map();

app.post('/api/run', (req, res) => {
  const { keywords = '', country = 'US', states = '' } = req.body || {};
  const jobId = nanoid();
  const start = Date.now();
  const totalMs = 12000; // ~12s mock
  const maxPerSource = 500;

  const job = {
    id: jobId,
    params: { keywords, country, states, maxPerSource },
    startedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    totals: { found: 0, deduped: 0, withEmail: 0 },
    state: 'running',
    rows: []
  };
  jobs.set(jobId, job);

  const interval = setInterval(() => {
    const p = Math.min(1, (Date.now() - start) / totalMs);
    const found = Math.floor(p * 800);
    const deduped = Math.floor(found * 0.85);
    const withEmail = Math.floor(deduped * 0.4);
    job.totals = { found, deduped, withEmail };
    job.updatedAt = new Date().toISOString();

    if (p >= 1) {
      clearInterval(interval);
      // Generate mock rows
      const n = Math.max(50, Math.min(500, withEmail));
      for (let i = 0; i < n; i++) {
        job.rows.push({
          Name: `Example Tree Co ${i + 1}`,
          Phone: `+1${String(2625551000 + i).padStart(10, '0')}`,
          Email: `info${i + 1}@exampletree.com`
        });
      }
      job.state = 'done';
      job.updatedAt = new Date().toISOString();
    }
  }, 300);

  res.json({ jobId });
});

app.get('/api/status', (req, res) => {
  const job = jobs.get(req.query.jobId);
  if (!job) return res.status(404).json({ error: 'not_found' });
  res.json({
    jobId: job.id,
    state: job.state,
    totals: job.totals,
    startedAt: job.startedAt,
    updatedAt: job.updatedAt,
    budget: { monthlyCap: 100, estThisJob: 1.2, provider: { googlePlaces: { est: 1.2 } } }
  });
});

app.get('/api/download', (req, res) => {
  const job = jobs.get(req.query.jobId);
  if (!job) return res.status(404).json({ error: 'not_found' });
  if (job.state !== 'done') return res.status(202).json({ state: job.state });

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="leadleads_export.csv"');

  const stringifier = stringify({ header: true, columns: ['Name', 'Phone', 'Email'] });
  stringifier.pipe(res);
  job.rows.forEach(r => stringifier.write(r));
  stringifier.end();
});

app.get('/api/config', (req, res) => {
  res.json({ mapsKeyPresent: Boolean(process.env.GOOGLE_MAPS_JS_KEY) });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
