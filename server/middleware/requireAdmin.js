const jwt = require('jsonwebtoken')

function requireAdmin(req, res, next) {
  const token = req.cookies?.token

  if (!token) {
    return res.status(401).json({ message: 'Authentication required.' })
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    if (!decoded || decoded.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required.' })
    }

    req.user = decoded
    return next()
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired session.' })
  }
}

module.exports = requireAdmin
