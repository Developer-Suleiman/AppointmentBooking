const express = require('express')
const Notification = require('../models/Notification')
const requireAuth = require('../middleware/requireAuth')

const router = express.Router()

router.get('/', requireAuth, async (req, res) => {
  try {
    const notifications = await Notification.find({ userId: req.user.userId })
      .sort({ createdAt: -1 })
      .limit(50)
      .select('-userId')

    return res.json({ notifications })
  } catch (error) {
    return res.status(500).json({ message: 'Unable to load notifications.', error: error.message })
  }
})

router.patch('/:id/read', requireAuth, async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.userId },
      { readAt: new Date() },
      { new: true }
    ).select('-userId')

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found.' })
    }

    return res.json({ notification })
  } catch (error) {
    return res.status(400).json({ message: 'Unable to update notification.' })
  }
})

module.exports = router
