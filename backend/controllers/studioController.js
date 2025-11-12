import Studio from '../models/Studio.js';

// @desc    Get all studios
// @route   GET /api/studio
// @access  Public
export const getStudios = async (req, res) => {
  try {
    const { sessionType, capacity, size } = req.query;

    const query = { isActive: true };

    if (sessionType) {
      query.suitableFor = { $in: [sessionType] };
    }

    if (capacity) {
      query.capacity = { $gte: parseInt(capacity) };
    }

    if (size && ['small', 'medium', 'large'].includes(size)) {
      query.size = size;
    }

    const studios = await Studio.find(query).sort({ name: 1 });

    res.status(200).json({
      success: true,
      count: studios.length,
      studios
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get single studio
// @route   GET /api/studio/:id
// @access  Public
export const getStudioById = async (req, res) => {
  try {
    const studio = await Studio.findById(req.params.id);

    if (!studio || !studio.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Studio not found'
      });
    }

    res.status(200).json({
      success: true,
      studio
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Create studio (admin only)
// @route   POST /api/studio
// @access  Private/Admin
export const createStudio = async (req, res) => {
  try {
    const studio = await Studio.create(req.body);

    res.status(201).json({
      success: true,
      studio
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};