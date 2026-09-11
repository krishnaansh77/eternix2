'use client'

import { Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { SUBSCRIPTION_PLANS, type Product } from '@/lib/products'

interface PricingCardsProps {
  onSelectPlan: (plan: Product) => void
  selectedPlan?: string
}

export function PricingCards({ onSelectPlan, selectedPlan }: PricingCardsProps) {
  return (
    <div className="grid gap-6 md:grid-cols-3">
      {SUBSCRIPTION_PLANS.map((plan) => (
        <Card
          key={plan.id}
          className={cn(
            "relative flex flex-col backdrop-blur-xl border-white/10 transition-all duration-300 hover:scale-[1.02]",
            plan.popular
              ? "bg-gradient-to-b from-primary/20 to-primary/5 border-primary/30 shadow-lg shadow-primary/20"
              : "bg-white/5 hover:bg-white/10",
            selectedPlan === plan.id && "ring-2 ring-primary"
          )}
        >
          {plan.popular && (
            <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground">
              Recommended
            </Badge>
          )}
          
          <CardHeader className="pb-4">
            <CardTitle className="text-xl text-white">{plan.name}</CardTitle>
            <CardDescription className="text-white/60 min-h-[40px]">
              {plan.description}
            </CardDescription>
          </CardHeader>
          
          <CardContent className="flex-1">
            <div className="mb-6">
              <span className="text-4xl font-bold text-white">
                ${(plan.priceInCents / 100).toFixed(0)}
              </span>
              <span className="text-white/60">/{plan.interval}</span>
            </div>
            
            <ul className="space-y-3">
              {plan.features.map((feature, index) => (
                <li key={index} className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
                  <span className="text-sm text-white/80">{feature}</span>
                </li>
              ))}
            </ul>
          </CardContent>
          
          <CardFooter>
            <Button
              className={cn(
                "w-full transition-all",
                plan.popular
                  ? "bg-primary hover:bg-primary/90"
                  : "bg-white/10 hover:bg-white/20 text-white border border-white/20"
              )}
              onClick={() => onSelectPlan(plan)}
            >
              {plan.priceInCents === 0 ? "Get Started Free" : "Start Free Trial"}
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}
