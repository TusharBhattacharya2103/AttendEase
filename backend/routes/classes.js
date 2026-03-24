const express = require('express');
const router = express.Router();
const Class = require('../models/Class');
const { protect } = require('../middleware/auth');

router.use(protect);

// @route   GET /api/classes
router.get('/', async (req, res) => {
  try {
    const classes = await Class.find({ isActive: true })
      .populate('professor', 'firstName lastName professorCode')
      .select('name code subject department semester schedule credits');
    
    res.json({ success: true, data: classes });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/classes/:id
router.get('/:id', async (req, res) => {
  try {
    const cls = await Class.findById(req.params.id)
      .populate('professor', 'firstName lastName professorCode email mobile')
      .populate('students', 'firstName lastName rollCode email');
    
    if (!cls) return res.status(404).json({ success: false, message: 'Class not found' });
    
    res.json({ success: true, data: cls });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
