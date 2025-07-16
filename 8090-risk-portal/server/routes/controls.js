import express from 'express';

const router = express.Router();

// Get all controls
router.get('/', async (req, res) => {
  // Return the controls from the JSON file for now
  // In production, this would query Firestore
  res.json({ message: 'Controls endpoint - data served from frontend for now' });
});

// Get control by ID
router.get('/:id', async (req, res) => {
  res.json({ message: `Control ${req.params.id} - data served from frontend for now` });
});

export default router;