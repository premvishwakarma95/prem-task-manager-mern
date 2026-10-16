import { Router } from 'express';
import mongoose from 'mongoose';
import Task, { STATUSES, PRIORITIES } from '../models/Task.js';

const router = Router();

// Whitelist fields so clients can never write _id, timestamps, etc.
const pick = (body) => {
  const out = {};
  for (const k of ['title', 'description', 'status', 'priority']) {
    if (body[k] !== undefined) out[k] = body[k];
  }
  return out;
};

const validate = (data, { partial }) => {
  const errors = [];
  if (!partial || data.title !== undefined) {
    if (typeof data.title !== 'string' || !data.title.trim()) errors.push('title is required');
    else if (data.title.length > 120) errors.push('title must be at most 120 characters');
  }
  if (data.description !== undefined && String(data.description).length > 1000)
    errors.push('description must be at most 1000 characters');
  if (data.status !== undefined && !STATUSES.includes(data.status))
    errors.push(`status must be one of: ${STATUSES.join(', ')}`);
  if (data.priority !== undefined && !PRIORITIES.includes(data.priority))
    errors.push(`priority must be one of: ${PRIORITIES.join(', ')}`);
  return errors;
};

const checkId = (req, res, next) => {
  if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ errors: ['invalid task id'] });
  next();
};

// GET /api/tasks?status=todo&q=search&page=1&limit=10
// Returns { items, page, limit, total, pages }. Newest first (_id is monotonic and indexed).
router.get('/', async (req, res) => {
  const filter = {};
  if (req.query.status) {
    if (!STATUSES.includes(req.query.status)) return res.status(400).json({ errors: ['invalid status filter'] });
    filter.status = req.query.status;
  }
  if (req.query.q) {
    const safe = String(req.query.q).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    filter.title = { $regex: safe, $options: 'i' };
  }
  const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 10, 1), 50);
  const total = await Task.countDocuments(filter);
  const pages = Math.max(Math.ceil(total / limit), 1);
  const page = Math.min(Math.max(parseInt(req.query.page, 10) || 1, 1), pages); // clamp out-of-range pages
  const items = await Task.find(filter).sort({ _id: -1 }).skip((page - 1) * limit).limit(limit);
  res.json({ items, page, limit, total, pages });
});

router.post('/', async (req, res) => {
  const data = pick(req.body);
  const errors = validate(data, { partial: false });
  if (errors.length) return res.status(400).json({ errors });
  const task = await Task.create(data);
  res.status(201).json(task);
});

router.patch('/:id', checkId, async (req, res) => {
  const data = pick(req.body);
  const errors = validate(data, { partial: true });
  if (errors.length) return res.status(400).json({ errors });
  const task = await Task.findByIdAndUpdate(req.params.id, data, { new: true, runValidators: true });
  if (!task) return res.status(404).json({ errors: ['task not found'] });
  res.json(task);
});

router.delete('/:id', checkId, async (req, res) => {
  const task = await Task.findByIdAndDelete(req.params.id);
  if (!task) return res.status(404).json({ errors: ['task not found'] });
  res.status(204).end();
});

export default router;
