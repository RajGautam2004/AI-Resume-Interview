const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
  // 1. Grab the token directly from the HttpOnly cookie!
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({ error: "Access Denied. You must be logged in." });
  }

  try {
    // 2. Verify the token hasn't been tampered with
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    
    // 3. Attach the HR Admin's ID to the request so we know exactly who is posting a job
    req.admin = verified; 
    
    // 4. Let them pass to the route
    next(); 
  } catch (error) {
    res.status(400).json({ error: "Invalid or expired token." });
  }
};

module.exports = verifyToken;