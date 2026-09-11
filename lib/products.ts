export interface Product {
  id: string
  name: string
  description: string
  priceInCents: number
  interval: 'month' | 'year'
  features: string[]
  popular?: boolean
}

export const SUBSCRIPTION_PLANS: Product[] = [
  {
    id: 'starter',
    name: 'Starter',
    description: 'Perfect for individual practitioners getting started',
    priceInCents: 0,
    interval: 'month',
    features: [
      'Up to 50 patients',
      'Basic AI diagnosis',
      'Standard reports',
      'Email support',
      'Mobile access',
    ],
  },
  {
    id: 'professional',
    name: 'Professional',
    description: 'For growing practices with advanced needs',
    priceInCents: 4900, // $49/month
    interval: 'month',
    popular: true,
    features: [
      'Unlimited patients',
      'Advanced AI diagnosis with confidence scores',
      'Priority processing',
      'Custom report templates',
      'API access',
      '24/7 priority support',
      'Team collaboration (up to 5)',
    ],
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    description: 'For hospitals and large medical institutions',
    priceInCents: 19900, // $199/month
    interval: 'month',
    features: [
      'Everything in Professional',
      'Unlimited team members',
      'Custom AI model training',
      'HIPAA compliance tools',
      'Dedicated account manager',
      'SLA guarantee',
      'On-premise deployment option',
      'Advanced analytics & insights',
    ],
  },
]
