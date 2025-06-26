import { Router, Response } from 'express'
import { authMiddleware, AuthRequest } from '../middleware/authMiddleware.js'

const router = Router()

// Get LemonSqueezy checkout URL for Pro plan
router.get('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'User not authenticated' })
    }

    // If user is already Pro, no need to upgrade
    if (req.user.plan === 'pro') {
      return res.json({
        message: 'User already has Pro plan',
        plan: 'pro'
      })
    }

    const checkoutUrl = process.env.LEMONSQUEEZY_CHECKOUT_URL!

    if (!checkoutUrl) {
      return res.status(500).json({ error: 'Checkout URL not configured' })
    }

    // Add user email and redirect URLs as URL parameters for LemonSqueezy
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173'
    const successUrl = `${clientUrl}/notes?upgraded=true`
    const cancelUrl = `${clientUrl}/notes?cancelled=true`
    
    const urlWithParams = new URL(checkoutUrl)
    urlWithParams.searchParams.set('checkout[email]', req.user.email)
    urlWithParams.searchParams.set('checkout[success_url]', successUrl)
    urlWithParams.searchParams.set('checkout[cancel_url]', cancelUrl)

    res.json({
      checkoutUrl: urlWithParams.toString(),
      message: 'Upgrade to Pro for unlimited notes!'
    })
  } catch (error) {
    console.error('Subscribe route error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

export default router 