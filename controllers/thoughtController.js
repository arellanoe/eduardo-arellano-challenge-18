const Thought = require('../models/thought');

exports.createThought = async (req, res) => {
  try {
    const thought = new Thought({
      text: req.body.text,
      author: req.user._id,
    });
    await thought.save();
    res.status(201).json(thought);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.getThoughts = async (req, res) => {
  try {
    const thoughts = await Thought.find().sort({ createdAt: -1 });
    res.status(200).json(thoughts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.getThoughtById = async (req, res) => {
  try {
    const thought = await Thought.findById(req.params.id);
    if (!thought) {
      return res.status(404).json({ error: 'Thought not found' });
    }
    res.status(200).json(thought);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.updateThought = async (req, res) => {
  try {
    const thought = await Thought.findById(req.params.id);
    if (!thought) {
      return res.status(404).json({ error: 'Thought not found' });
    }
    if (thought.author.toString() !== req.user._id.toString()) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    thought.text = req.body.text;
    await thought.save();
    res.status(200).json(thought);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.deleteThought = async (req, res) => {
  try {
    const thought = await Thought.findById(req.params.id);
    if (!thought) {
      return res.status(404).json({ error: 'Thought not found' });
    }
    if (thought.author.toString() !== req.user._id.toString()) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    await thought.remove();
    res.status(200).json({ message: 'Thought deleted' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};
