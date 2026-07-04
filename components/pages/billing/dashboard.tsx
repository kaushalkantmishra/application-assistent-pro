"use client"

import { useState, useEffect } from "react"
import { PageHeader } from "@/components/page-header"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { AppLoader } from "@/components/app-loader"
import { Check, Star, Sparkles, CreditCard, Gift, Compass, History, Tag } from "lucide-react"
import { toast } from "sonner"

interface WalletTransaction {
  id: string
  amount: number
  type: string
  status: string
  description: string
  createdAt: string
}

export default function BillingDashboard() {
  const [loading, setLoading] = useState(true)
  const [activePlan, setActivePlan] = useState("Free")
  const [walletBalance, setWalletBalance] = useState(0)
  const [transactions, setTransactions] = useState<WalletTransaction[]>([])
  
  // Coupon state
  const [couponCode, setCouponCode] = useState("")
  const [applyingCoupon, setApplyingCoupon] = useState(false)

  // Subscribing state
  const [submittingPayment, setSubmittingPayment] = useState(false)

  useEffect(() => {
    // Load wallet balance and transactions
    Promise.all([
      fetch("/api/wallet/transactions").then(res => res.json()),
      fetch("/api/checkout/subscription").then(res => res.json())
    ]).then(([walletData, subData]) => {
      setWalletBalance(walletData.balance || 0)
      setTransactions(Array.isArray(walletData.transactions) ? walletData.transactions : [])
      setActivePlan(subData.planCode || "Free")
      setLoading(false)
    }).catch(e => {
      console.error(e)
      setLoading(false)
    })
  }, [])

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      toast.error("Please enter a valid coupon code")
      return
    }
    try {
      setApplyingCoupon(true)
      const res = await fetch("/api/wallet/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ couponCode: couponCode.trim() }),
      })
      if (res.ok) {
        const data = await res.json()
        setWalletBalance(data.balance)
        setTransactions(prev => [data.newTransaction, ...prev])
        setCouponCode("")
        toast.success(`Coupon applied successfully! Credited $${data.creditedAmount / 100} to your wallet.`)
      } else {
        const err = await res.json()
        throw new Error(err.error || "Failed to redeem coupon")
      }
    } catch (e: any) {
      toast.error(e.message)
    } finally {
      setApplyingCoupon(false)
    }
  }

  const handleSubscribe = async (planCode: string) => {
    if (planCode === "Free" || planCode === activePlan) return
    try {
      setSubmittingPayment(true)
      // Create Razorpay payment order
      const res = await fetch("/api/checkout/razorpay/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planCode }),
      })

      if (res.ok) {
        const orderData = await res.json()
        
        // Simulating Payment checkout verify
        toast.info("Simulating payment validation transaction gateway...")
        const verifyRes = await fetch("/api/checkout/razorpay/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            razorpayOrderId: orderData.orderId,
            razorpayPaymentId: `pay_${Math.random().toString(36).substring(4)}`,
            signature: "valid_simulated_signature",
            planCode,
          }),
        })

        if (verifyRes.ok) {
          setActivePlan(planCode)
          toast.success(`Successfully upgraded to the ${planCode.toUpperCase()} subscription plan!`)
        } else {
          throw new Error("Payment signature verification failed")
        }
      } else {
        throw new Error("Failed to initialize Razorpay checkout session")
      }
    } catch (e: any) {
      toast.error(e.message)
    } finally {
      setSubmittingPayment(false)
    }
  }

  if (loading) {
    return <AppLoader message="Retrieving billing statements, active orders and wallets balance" />
  }

  return (
    <div className="space-y-8 font-sans text-xs max-w-6xl mx-auto">
      <PageHeader
        title="Billing & Subscription center"
        description="Select subscription tiers, top up credits wallet, redeem coupon codes, and track transactions history"
      />

      {/* Pricing Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Free Plan */}
        <Card className={`border shadow-sm flex flex-col justify-between overflow-hidden ${
          activePlan === "Free" ? "border-indigo-600 bg-indigo-50/5 ring-1 ring-indigo-600" : "border-slate-100"
        }`}>
          <CardHeader className="pb-4">
            <Badge className="bg-slate-100 text-slate-700 hover:bg-slate-150 border-none font-bold text-[9px] w-fit">BASIC</Badge>
            <CardTitle className="text-sm font-extrabold text-slate-800 mt-2">Free Plan</CardTitle>
            <CardDescription className="text-[10.5px]">Ideal for quick dry-runs and evaluation checks</CardDescription>
          </CardHeader>
          <CardContent className="py-4 border-t border-b bg-slate-50/20 space-y-3">
            <div className="text-3xl font-extrabold text-slate-800">$0 <span className="text-xs font-semibold text-slate-450">/month</span></div>
            <div className="space-y-2 text-[11px] text-slate-600 pt-2">
              <div className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-indigo-650" /> 1 AI Mock Interview</div>
              <div className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-indigo-650" /> 1 Resume Optimization</div>
              <div className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-indigo-650" /> 1 Cover Letter template</div>
            </div>
          </CardContent>
          <CardFooter className="py-3.5">
            <Button
              variant="outline"
              disabled
              className="w-full text-xs h-9 font-bold"
            >
              {activePlan === "Free" ? "Current Subscription" : "Upgrade"}
            </Button>
          </CardFooter>
        </Card>

        {/* Premium Plan */}
        <Card className={`border shadow-sm flex flex-col justify-between overflow-hidden relative ${
          activePlan === "Premium" ? "border-indigo-600 bg-indigo-50/5 ring-1 ring-indigo-600" : "border-slate-100"
        }`}>
          <div className="absolute right-0 top-0 bg-indigo-600 text-white font-extrabold text-[8px] uppercase px-3 py-1 rounded-bl-lg tracking-wide flex items-center gap-1">
            <Sparkles className="h-3 w-3 fill-current" /> MOST POPULAR
          </div>
          <CardHeader className="pb-4">
            <Badge className="bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border-none font-bold text-[9px] w-fit">AI ACCELERATE</Badge>
            <CardTitle className="text-sm font-extrabold text-slate-800 mt-2">Premium Plan</CardTitle>
            <CardDescription className="text-[10.5px]">Unlimited coaching and optimizations</CardDescription>
          </CardHeader>
          <CardContent className="py-4 border-t border-b bg-slate-50/20 space-y-3">
            <div className="text-3xl font-extrabold text-slate-800">$19 <span className="text-xs font-semibold text-slate-450">/month</span></div>
            <div className="space-y-2 text-[11px] text-slate-600 pt-2">
              <div className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-indigo-650" /> Unlimited AI Interviews</div>
              <div className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-indigo-650" /> Unlimited Resume Optimization</div>
              <div className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-indigo-650" /> Unlimited ATS Analysis</div>
              <div className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-indigo-650" /> Priority AI Response queue</div>
            </div>
          </CardContent>
          <CardFooter className="py-3.5">
            <Button
              onClick={() => handleSubscribe("Premium")}
              disabled={submittingPayment || activePlan === "Premium"}
              className="w-full text-xs h-9 bg-indigo-600 hover:bg-indigo-700 text-white font-bold cursor-pointer rounded-lg"
            >
              {activePlan === "Premium" ? "Current Subscription" : "Upgrade Premium"}
            </Button>
          </CardFooter>
        </Card>

        {/* Enterprise Plan */}
        <Card className={`border shadow-sm flex flex-col justify-between overflow-hidden ${
          activePlan === "Enterprise" ? "border-indigo-600 bg-indigo-50/5 ring-1 ring-indigo-600" : "border-slate-100"
        }`}>
          <CardHeader className="pb-4">
            <Badge className="bg-slate-100 text-slate-700 hover:bg-slate-150 border-none font-bold text-[9px] w-fit">HUMAN EXPERT</Badge>
            <CardTitle className="text-sm font-extrabold text-slate-800 mt-2">Enterprise Plan</CardTitle>
            <CardDescription className="text-[10.5px]">Get feedback directly from real human coaches</CardDescription>
          </CardHeader>
          <CardContent className="py-4 border-t border-b bg-slate-50/20 space-y-3">
            <div className="text-3xl font-extrabold text-slate-800">$49 <span className="text-xs font-semibold text-slate-450">/month</span></div>
            <div className="space-y-2 text-[11px] text-slate-600 pt-2">
              <div className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-indigo-650" /> All Premium features included</div>
              <div className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-indigo-650" /> Live Human Mock Interviews</div>
              <div className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-indigo-650" /> Dedicated Recruiter dashboard</div>
            </div>
          </CardContent>
          <CardFooter className="py-3.5">
            <Button
              onClick={() => handleSubscribe("Enterprise")}
              disabled={submittingPayment || activePlan === "Enterprise"}
              className="w-full text-xs h-9 bg-slate-800 hover:bg-slate-700 text-white font-bold cursor-pointer rounded-lg"
            >
              {activePlan === "Enterprise" ? "Current Subscription" : "Upgrade Enterprise"}
            </Button>
          </CardFooter>
        </Card>

      </div>

      {/* Wallet Module */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Wallet Balance Card (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <Card className="shadow-sm border border-slate-100 h-full flex flex-col justify-between">
            <CardHeader className="pb-3 border-b bg-slate-50/20">
              <CardTitle className="text-sm font-bold text-slate-850 flex items-center gap-1.5">
                <CreditCard className="h-4.5 w-4.5 text-indigo-650" /> Wallet Balances & Coupons
              </CardTitle>
            </CardHeader>
            <CardContent className="py-5 space-y-5">
              <div className="text-center p-4 border rounded-xl bg-slate-50/30">
                <span className="text-[10px] uppercase font-bold text-slate-450 tracking-wider">AVAILABLE AI BALANCE</span>
                <div className="text-4xl font-extrabold text-slate-800 mt-2">${(walletBalance / 100).toFixed(2)}</div>
                <span className="text-[9.5px] text-slate-450 mt-1 block">Used automatically to top up AI mock credits</span>
              </div>

              {/* Coupon input */}
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-slate-650">Redeem Promotion Code</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="e.g. WELCOME50, MOCKOFF"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    className="text-xs h-9.5 uppercase"
                  />
                  <Button
                    onClick={handleApplyCoupon}
                    disabled={applyingCoupon || !couponCode.trim()}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold h-9.5 text-xs px-4"
                  >
                    <Tag className="h-3.5 w-3.5 mr-1" /> Redeem
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Transactions log (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <Card className="shadow-sm border border-slate-100">
            <CardHeader className="pb-3 border-b bg-slate-50/20">
              <CardTitle className="text-sm font-bold text-slate-850 flex items-center gap-1.5">
                <History className="h-4.5 w-4.5 text-slate-500" /> Transaction History
              </CardTitle>
            </CardHeader>
            <CardContent className="py-2.5">
              {transactions.length === 0 ? (
                <div className="text-center py-10 text-slate-400">
                  No billing transaction logs found for this wallet.
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="text-slate-450 text-[10px] font-bold h-8">Description</TableHead>
                      <TableHead className="text-slate-450 text-[10px] font-bold h-8">Type</TableHead>
                      <TableHead className="text-slate-450 text-[10px] font-bold h-8">Amount</TableHead>
                      <TableHead className="text-slate-450 text-[10px] font-bold h-8 text-right">Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transactions.map((tx) => (
                      <TableRow key={tx.id} className="hover:bg-slate-50/50">
                        <TableCell className="font-semibold text-slate-850 py-2.5">{tx.description}</TableCell>
                        <TableCell className="py-2.5">
                          <Badge className={
                            tx.type === "credit" ? "bg-emerald-50 text-emerald-700 border-none" : "bg-red-50 text-red-700 border-none"
                          }>
                            {tx.type.toUpperCase()}
                          </Badge>
                        </TableCell>
                        <TableCell className={`font-bold py-2.5 ${tx.type === "credit" ? "text-emerald-600" : "text-red-650"}`}>
                          {tx.type === "credit" ? "+" : "-"}${(tx.amount / 100).toFixed(2)}
                        </TableCell>
                        <TableCell className="text-right text-slate-450 py-2.5">
                          {new Date(tx.createdAt).toLocaleDateString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>

      </div>

    </div>
  )
}
