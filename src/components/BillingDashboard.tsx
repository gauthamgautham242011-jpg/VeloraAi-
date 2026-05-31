import React, { useState } from "react";
import { 
  CreditCard, 
  Sparkles, 
  Check, 
  Flame, 
  HelpCircle, 
  Calendar, 
  DollarSign, 
  Activity,
  ArrowRight,
  ChevronRight,
  Shield,
  Loader2,
  Info,
  Layers,
  FileText
} from "lucide-react";
import { BillingPlan, CreditPack, UserBillingState, BillingTierId } from "../types";

interface BillingDashboardProps {
  billingState: UserBillingState;
  onInitiateUpgrade: (planId: BillingTierId, name: string, price: number, isSub: boolean) => void;
  onInitiateCreditPack: (packId: string, name: string, amount: number, price: number) => void;
  isProcessing: boolean;
  onClose: () => void;
}

export const BILLING_PLANS: BillingPlan[] = [
  {
    id: "plus",
    name: "Velora Plus",
    price: "₹299",
    interval: "month",
    desc: "Quantum-calibrated access for engineers, writers, and advanced professionals.",
    limits: [
      "5,000 standard premium tokens",
      "Standard responses (gemini-3.5-flash)",
      "Access to core Velora assistant models",
      "Daily rate limiting standard caps"
    ],
    stripePriceId: "price_plus_subscription_299",
    color: "from-blue-600/10 via-indigo-600/5 to-transparent",
    borderClass: "border-blue-500/30 shadow-lg shadow-blue-500/5",
    badgeClass: "bg-blue-500/15 text-blue-400 border-blue-500/20"
  },
  {
    id: "elite",
    name: "Velora Elite Omni",
    price: "₹1000",
    interval: "month",
    desc: "Direct unthrottled access to experimental GPT-6 hybrid hyper-engines.",
    limits: [
      "1,000,000 ultra-priority tokens",
      "Deepest context search grounding enabled",
      "Zero daily rate throttling",
      "Immediate previews of beta Velora personas",
      "Dedicated developer analytics logs",
      "Personalized system prompt templates"
    ],
    stripePriceId: "price_elite_subscription_1000",
    color: "from-purple-600/15 via-indigo-600/5 to-transparent",
    borderClass: "border-purple-500/40 shadow-lg shadow-purple-500/10 animated-glow",
    badgeClass: "bg-purple-500/15 text-purple-400 border-purple-500/20"
  }
];

export const CREDIT_PACKS: CreditPack[] = [
  {
    id: "lunar_topup",
    name: "Lunar Message Pack",
    amount: 25000,
    price: "₹149",
    stripePriceId: "price_lunar_pack_149"
  },
  {
    id: "orbit_topup",
    name: "Orbit Message Pack",
    amount: 100000,
    price: "₹399",
    stripePriceId: "price_orbit_pack_399",
    popularityBadge: true
  },
  {
    id: "stellar_topup",
    name: "Stellar Message Pack",
    amount: 500000,
    price: "₹1199",
    stripePriceId: "price_stellar_pack_1199"
  }
];

export default function BillingDashboard({
  billingState,
  onInitiateUpgrade,
  onInitiateCreditPack,
  isProcessing,
  onClose,
}: BillingDashboardProps) {
  const [activeTab, setActiveTab] = useState<"plans" | "fuel" | "history">("plans");

  const progressPercentage = Math.min(100, Math.max(0, (billingState.creditsRemaining / billingState.creditsMax) * 100));

  return (
    <div id="billing-center-main" className="space-y-6">
      
      {/* Visual Resource Gas Tank Balance Indicator */}
      <div 
        id="billing-resource-header"
        className="relative overflow-hidden rounded-2xl border border-slate-800 bg-gradient-to-r from-slate-950 via-[#0e1424] to-[#0a0f1d] p-6 shadow-xl"
      >
        <div className="absolute top-0 right-0 h-48 w-48 rounded-full bg-blue-600/5 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-12 h-32 w-32 rounded-full bg-indigo-500/5 blur-3xl pointer-events-none" />
        
        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="p-1 px-2.5 text-[9px] font-mono font-bold uppercase tracking-widest text-indigo-400 bg-indigo-500/10 rounded-full border border-indigo-500/20">
                ACTIVE ACCOUNT BALANCE
              </span>
              {billingState.currentTier === "free" ? (
                <span className="p-0.5 px-2 text-[9px] font-semibold text-sky-400 bg-sky-500/10 rounded-full border border-sky-500/20 uppercase">
                  Free Trial Active
                </span>
              ) : (
                <span className="p-0.5 px-2 text-[9px] font-semibold text-emerald-400 bg-emerald-500/10 rounded-full border border-emerald-500/20 uppercase animate-pulse">
                  {billingState.currentTier === "plus" ? "Velora Plus Active" : "Velora Elite Omni Active"}
                </span>
              )}
            </div>
            
            <h2 className="text-2xl font-extrabold text-white tracking-tight">
              {billingState.creditsRemaining.toLocaleString()} <span className="text-slate-500 text-sm font-medium">/ {billingState.creditsMax.toLocaleString()} Messages Remaining</span>
            </h2>
            <p className="text-xs text-slate-400 leading-relaxed max-w-md">
              Usage triggers decrement of daily calculation messages. Choose standard single topups once limits are met.
            </p>
          </div>

          <div className="w-full md:w-64 space-y-2 shrink-0">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-slate-400 font-medium">Allocation Level</span>
              <span className="font-semibold text-white">{progressPercentage.toFixed(1)}%</span>
            </div>
            <div className="h-2.5 w-full bg-slate-900 rounded-full overflow-hidden border border-slate-800">
              <div 
                className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-indigo-600 rounded-full transition-all duration-1000"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Internal Navigation Sub-tabs */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-1.5" id="billing-nav-pills">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab("plans")}
            className={`px-4 py-2 rounded-xl text-xs font-semibold tracking-wide transition-all ${
              activeTab === "plans"
                ? "bg-slate-800 text-white"
                : "text-slate-400 hover:text-white hover:bg-slate-900/60"
            }`}
          >
            Subscription Tiers
          </button>
          <button
            onClick={() => setActiveTab("fuel")}
            className={`px-4 py-2 rounded-xl text-xs font-semibold tracking-wide transition-all ${
              activeTab === "fuel"
                ? "bg-slate-800 text-white"
                : "text-slate-400 hover:text-white hover:bg-slate-900/60"
            }`}
          >
            Message Top-ups
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={`px-4 py-2 rounded-xl text-xs font-semibold tracking-wide transition-all ${
              activeTab === "history"
                ? "bg-slate-800 text-white"
                : "text-slate-400 hover:text-white hover:bg-slate-900/60"
            }`}
          >
            Transaction Log
          </button>
        </div>

        {/* Dynamic Payment Environment status display */}
        <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-500 select-none">
          <div className={`h-1.5 w-1.5 rounded-full ${billingState.stripeConnected ? "bg-emerald-500 animate-pulse" : "bg-amber-500 animate-pulse"}`} />
          {billingState.stripeConnected ? (
            <span className="text-emerald-400 font-medium">Stripe Protocol: Active</span>
          ) : (
            <span className="text-amber-500">Stripe: Sandbox Simulation</span>
          )}
        </div>
      </div>

      {/* Tabs View Content */}
      <div id="billing-tab-content" className="min-h-[200px]">
        
        {/* Tab 1: PLAN CARDS */}
        {activeTab === "plans" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4" id="plans-grid">
            {BILLING_PLANS.map((plan) => {
              const isCurrent = billingState.currentTier === plan.id;
              
              return (
                <div
                  key={plan.id}
                  id={`plan-card-${plan.id}`}
                  className={`relative flex flex-col justify-between rounded-2xl border p-5 bg-gradient-to-b ${plan.color} ${plan.borderClass} hover:border-slate-700/80 transition-all duration-300`}
                >
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="text-md font-bold text-white tracking-wide">{plan.name}</h4>
                        <span className="text-slate-500 text-[10px] uppercase font-mono mt-0.5">Subscription Plan</span>
                      </div>
                      {isCurrent && (
                        <span className="text-[10px] font-bold tracking-wider uppercase text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                          Current Tier
                        </span>
                      )}
                    </div>

                    <div className="flex items-baseline gap-1 py-1">
                      <span className="text-3xl font-extrabold text-white">{plan.price}</span>
                      {plan.interval && (
                        <span className="text-xs text-slate-500 font-mono">/ {plan.interval}</span>
                      )}
                    </div>

                    <p className="text-xs text-slate-400 leading-normal min-h-[40px]">
                      {plan.desc}
                    </p>

                    <ul className="space-y-2.5 border-t border-slate-800/40 pt-4" id={`limits-list-${plan.id}`}>
                      {plan.limits.map((limit, lidx) => (
                        <li key={lidx} className="flex items-start gap-2 text-xs text-slate-300 leading-tight">
                          <Check className="h-3.5 w-3.5 text-blue-500 shrink-0 mt-0.5" />
                          <span>{limit}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="pt-6 mt-4">
                    {isCurrent ? (
                      <button
                        disabled
                        className="w-full text-center py-2.5 rounded-xl border border-slate-800/60 text-slate-500 text-xs font-semibold cursor-not-allowed uppercase tracking-wider bg-slate-900/30"
                      >
                        Active Allocation
                      </button>
                    ) : (
                      <button
                        onClick={() => onInitiateUpgrade(plan.id, plan.name, parseFloat(plan.price.replace("₹", "")), true)}
                        disabled={isProcessing}
                        className={`w-full py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all text-white ${
                          isProcessing 
                            ? "bg-slate-800 cursor-not-allowed" 
                            : plan.id === "elite"
                              ? "bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 shadow-md shadow-purple-500/10 cursor-pointer"
                              : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-md shadow-indigo-500/10 cursor-pointer"
                        }`}
                      >
                        {isProcessing ? (
                          <>
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            Calibrating Setup...
                          </>
                        ) : (
                          <>
                            Upgrade Now
                            <ArrowRight className="h-3 w-3" />
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Tab 2: COGNITIVE GAS CORES FUEL PACKS */}
        {activeTab === "fuel" && (
          <div className="space-y-4">
            <div className="p-4 bg-indigo-950/20 rounded-2xl border border-indigo-950/40 text-xs text-indigo-400 flex items-start gap-2.5 max-w-3xl">
              <Info className="h-4.5 w-4.5 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-white block mb-0.5">Flexible Calculation Core Message Packages</span>
                <span>Message Packs bypass standard subscription limit checks. Remaining messages automatically roll over to succeeding months, never expiring.</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4" id="fuel-packs-grid">
              {CREDIT_PACKS.map((pack) => (
                <div
                  key={pack.id}
                  id={`fuel-pack-card-${pack.id}`}
                  className={`bg-[#111827]/45 rounded-2xl border p-5 flex flex-col justify-between transition-all ${
                    pack.popularityBadge 
                      ? "border-blue-500/30 bg-[#1e293b]/10 shadow-md shadow-indigo-500/5 relative" 
                      : "border-slate-800/40 hover:border-slate-800"
                  }`}
                >
                  {pack.popularityBadge && (
                    <span className="absolute -top-2.5 right-4 bg-gradient-to-r from-blue-500 to-indigo-500 text-[9px] text-white font-bold tracking-wider uppercase px-2.5 py-0.5 rounded-full shadow">
                      Most Selected
                    </span>
                  )}

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wide">{pack.name}</h4>
                      <Flame className={`h-4.5 w-4.5 ${pack.popularityBadge ? "text-blue-400" : "text-slate-500"}`} />
                    </div>

                    <div className="space-y-0.5">
                      <h2 className="text-2xl font-extrabold text-white">+{pack.amount.toLocaleString()}</h2>
                      <span className="text-[10px] text-slate-500 uppercase tracking-widest font-mono font-medium">Messages</span>
                    </div>

                    <p className="text-xs text-slate-400">
                      Instantly increases your allocation to secure continuous chat threads.
                    </p>
                  </div>

                  <div className="pt-6 mt-4 border-t border-slate-900/60 flex items-center justify-between gap-4">
                    <div className="flex flex-col">
                      <span className="text-[9px] text-slate-500 uppercase font-mono">Cost</span>
                      <span className="text-md font-bold text-white">{pack.price}</span>
                    </div>
                    <button
                      onClick={() => onInitiateCreditPack(pack.id, pack.name, pack.amount, parseFloat(pack.price.replace("₹", "")))}
                      disabled={isProcessing}
                      className="px-4 py-2 bg-slate-900 hover:bg-slate-850 text-slate-250 border border-slate-800 hover:text-white rounded-xl text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer active:scale-95"
                    >
                      {isProcessing ? (
                        <Loader2 className="h-3 w-3 animate-spin text-indigo-400" />
                      ) : (
                        <>
                          Buy Pack
                          <ChevronRight className="h-3.5 w-3.5" />
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 3: HISTORIC TRANSACTIONS HISTORY LEDGER */}
        {activeTab === "history" && (
          <div className="rounded-2xl border border-slate-800 bg-[#111827]/10 p-5 overflow-hidden">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-2">
              <FileText className="h-4 w-4 text-slate-500" />
              Receipt Invoicing & Transactions History
            </h3>

            {billingState.history.length === 0 ? (
              <div className="text-center py-10 space-y-2">
                <p className="text-xs text-slate-500">No historic payments logged under this session signature.</p>
                <p className="text-[10px] text-slate-600">Upgrading subscribing plans will log immediate invoice descriptors here.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs" id="history-data-table">
                  <thead>
                    <tr className="border-b border-slate-800/80 text-slate-500 font-mono font-semibold uppercase text-[10px]">
                      <th className="pb-2">Date / Stamp</th>
                      <th className="pb-2">Reference ID</th>
                      <th className="pb-2">Description</th>
                      <th className="pb-2">Type</th>
                      <th className="pb-2 text-right">Amount (INR)</th>
                      <th className="pb-2 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/40 text-slate-300">
                    {billingState.history.map((tx) => (
                      <tr key={tx.id} className="hover:bg-slate-900/10">
                        <td className="py-3 pr-2 text-slate-400 font-medium whitespace-nowrap">{tx.date}</td>
                        <td className="py-3 pr-2 font-mono text-[10px] text-slate-500">{tx.id}</td>
                        <td className="py-3 pr-2 font-medium text-white">{tx.description}</td>
                        <td className="py-3 pr-2 whitespace-nowrap">
                          {tx.type === "subscription" ? (
                            <span className="text-[9px] bg-blue-500/10 text-blue-400 border border-blue-500/10 px-1.5 py-0.5 rounded-full font-mono uppercase font-semibold">
                              Sub
                            </span>
                          ) : (
                            <span className="text-[9px] bg-amber-500/10 text-amber-400 border border-amber-500/10 px-1.5 py-0.5 rounded-full font-mono uppercase font-semibold">
                              Messages
                            </span>
                          )}
                        </td>
                        <td className="py-3 pr-2 text-right font-semibold font-mono text-white">{tx.amount}</td>
                        <td className="py-3 text-right">
                          <span className="text-[9px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/10 px-2 py-0.5 rounded-full uppercase font-bold font-mono">
                            {tx.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

      </div>

      {/* Developer Setup Instructions for Real Stripe Connection */}
      <div className="bg-slate-900/10 rounded-2xl border border-slate-800 p-5 mt-8 space-y-3">
        <h4 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-1.5">
          <Shield className="h-4 w-4 text-blue-500" />
          Velora-6 Production Stripe Connection Pipeline
        </h4>
        <p className="text-xs text-slate-400 leading-relaxed">
          This system is ready for real payment operations and connects to Stripe Checkout natively! To substitute the Sandbox simulation mode with your real Stripe payment gateway:
        </p>

        <div className="text-[11px] font-mono grid grid-cols-1 md:grid-cols-2 gap-3" id="stripe-setup-manual">
          <div className="bg-[#0b0f19] border border-slate-800 p-3 rounded-xl space-y-1">
            <span className="text-blue-400 font-bold block">1. Register API Credentials</span>
            <span className="text-slate-500">Provide keys inside your environment cloud secrets panel:</span>
            <div className="text-[10px] text-slate-400 pt-1">
              • STRIPE_SECRET_KEY="sk_live_..."<br />
              • STRIPE_PUBLISHABLE_KEY="pk_live_..."
            </div>
          </div>
          <div className="bg-[#0b0f19] border border-slate-800 p-3 rounded-xl space-y-1">
            <span className="text-blue-400 font-bold block">2. Configure Billing Webhooks</span>
            <span className="text-slate-500">Enable real-time payment loops with a secure backend listener callback. No database limits constraints apply to client sessions.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
