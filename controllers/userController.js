const getUserProfile = async (req, res) => {
  try {
    res.json({ message: 'Welcome to the user panel data endpoint' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getUserProfile };