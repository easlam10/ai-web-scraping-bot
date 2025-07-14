// Simple test endpoint
module.exports = (req, res) => {
  console.log("Test endpoint called!");
  return res.status(200).json({
    success: true,
    message: "API is working!",
    method: req.method,
    query: req.query,
    timestamp: new Date().toISOString(),
  });
};
