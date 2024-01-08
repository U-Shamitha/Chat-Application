 const jwt = require('jsonwebtoken');

// Authentication middleware
const authenticateToken = (req, res, next) =>{
    const token = req.header('Authorization');
    if (!token) return res.sendStatus(401);
  
    jwt.verify(token, SECRET_KEY, (err, user) => {
      if (err) return res.sendStatus(403);
      req.user = user;
      next();
    });
}


module.exports = { authenticateToken }