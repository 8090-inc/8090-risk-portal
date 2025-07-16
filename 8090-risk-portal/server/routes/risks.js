import express from 'express';

const router = express.Router();

// Get all risks
router.get('/', async (req, res) => {
  // Return the risks from the JSON file for now
  // In production, this would query Firestore
  res.json({ message: 'Risks endpoint - data served from frontend for now' });
});

// Get risk by ID
router.get('/:id', async (req, res) => {
  res.json({ message: `Risk ${req.params.id} - data served from frontend for now` });
});

export default router;