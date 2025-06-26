import { Router, Request, Response } from 'express'
import crypto from 'crypto'
import { supabase } from '../lib/supabase.js'

const router = Router()

// LemonSqueezy webhook endpoint
// Configure this URL in LemonSqueezy: http://localhost:3000/api/webhook
router.post('/', async (req: Request, res: Response) => {
  try {
    const signature = req.headers['x-signature'] as string
    const webhookSecret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET!

    if (!webhookSecret) {
      console.error('LEMONSQUEEZY_WEBHOOK_SECRET not configured')
      return res.status(500).json({ error: 'Webhook secret not configured' })
    }

    // Parse the body if it's raw buffer
    let payload
    if (Buffer.isBuffer(req.body)) {
      payload = JSON.parse(req.body.toString())
    } else {
      payload = req.body
    }

    // Verify webhook signature using raw body
    const rawBody = Buffer.isBuffer(req.body) ? req.body.toString() : JSON.stringify(req.body)
    const hash = crypto.createHmac('sha256', webhookSecret).update(rawBody, 'utf8').digest('hex')
    
    // LemonSqueezy sends signature without sha256= prefix, but some services include it
    const expectedSignature = signature.startsWith('sha256=') ? `sha256=${hash}` : hash

    console.log('Webhook received:', {
      signature,
      expectedSignature,
      eventName: payload?.meta?.event_name,
      bodyType: typeof req.body,
      isBuffer: Buffer.isBuffer(req.body)
    })

    if (signature !== expectedSignature) {
      console.error('Invalid webhook signature:', { 
        received: signature, 
        expected: expectedSignature,
        rawBodyLength: rawBody.length
      })
      return res.status(401).json({ error: 'Invalid signature' })
    }

    const { meta, data } = payload

    // Handle subscription events
    if (meta?.event_name === 'subscription_created' || 
        meta?.event_name === 'subscription_updated' || 
        meta?.event_name === 'subscription_payment_success' ||
        meta?.event_name === 'order_created') {
      const customerEmail = data?.attributes?.customer_email || data?.attributes?.user_email

      if (!customerEmail) {
        console.error('No customer email in webhook payload')
        return res.status(400).json({ error: 'No customer email found' })
      }

      // Update user plan to 'pro'
      const { data: updatedUser, error } = await supabase
        .from('users')
        .update({ plan: 'pro' })
        .eq('email', customerEmail)
        .select()

      if (error) {
        console.error('Error updating user plan:', error)
        return res.status(500).json({ error: 'Failed to update user plan' })
      }

      if (!updatedUser || updatedUser.length === 0) {
        console.error('User not found for email:', customerEmail)
        return res.status(404).json({ error: 'User not found' })
      }

      console.log(`Successfully upgraded user ${customerEmail} to Pro plan`)
      
      res.json({
        message: 'Plan upgraded successfully',
        user: updatedUser[0]
      })
    } else {
      console.log('Unhandled webhook event:', meta?.event_name)
      res.json({ message: 'Event received but not processed' })
    }
  } catch (error) {
    console.error('Webhook error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

export default router 