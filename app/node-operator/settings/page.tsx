"use client"

/**
 * app/node-operator/settings/page.tsx
 *
 * Adds a "Staking" tab (first/default) that:
 *   • reads isNodeActive() and getStake() from NodeStaking contract
 *   • calls unstake() when the operator wants to withdraw
 *   • shows the on-chain tx confirmation and PolygonScan link
 *
 * The other tabs (Hardware, Network, Security, Notifications) are kept
 * exactly as in the original file — only the Staking tab is new.
 */

import { useState, useEffect } from "react"
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useReadContract } from "wagmi"
import { formatEther } from "viem"
import {
  Shield, Cpu, Bell, Globe, Save, Network,
  Loader2, AlertCircle, CheckCircle2, LogOut, ExternalLink, Coins,
} from "lucide-react"

import { DashboardHeader } from "@/components/dashboard/header"
import { Card }            from "@/components/ui/card"
import { Button }          from "@/components/ui/button"
import { Input }           from "@/components/ui/input"
import { Label }           from "@/components/ui/label"
import { Switch }          from "@/components/ui/switch"

// ─── env / ABI ────────────────────────────────────────────────────────────────
const STAKING_CONTRACT =
  (process.env.NEXT_PUBLIC_STAKING_CONTRACT ??
   "0x0000000000000000000000000000000000000000") as `0x${string}`

const STAKING_ABI = [
  {
    name: "unstake",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [],
    outputs: [],
  },
  {
    name: "isNodeActive",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "node", type: "address" }],
    outputs: [{ name: "", type: "bool" }],
  },
  {
    name: "getStake",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "node", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
  },
] as const

// ─── tabs config ──────────────────────────────────────────────────────────────
const TABS = [
  { id: "staking",       label: "Staking",       Icon: Coins   },
  { id: "hardware",      label: "Hardware",       Icon: Cpu     },
  { id: "network",       label: "Network",        Icon: Globe   },
  { id: "security",      label: "Security",       Icon: Shield  },
  { id: "notifications", label: "Notifications",  Icon: Bell    },
] as const

type TabId = typeof TABS[number]["id"]

// ─── page ─────────────────────────────────────────────────────────────────────
export default function OperatorSettingsPage() {
  const [activeTab, setActiveTab] = useState<TabId>("staking")
  const { address } = useAccount()

  // ── on-chain reads ─────────────────────────────────────────────────────────
  const { data: isActive, refetch: refetchActive } = useReadContract({
    address: STAKING_CONTRACT,
    abi: STAKING_ABI,
    functionName: "isNodeActive",
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  })

  const { data: stakedWei, refetch: refetchStake } = useReadContract({
    address: STAKING_CONTRACT,
    abi: STAKING_ABI,
    functionName: "getStake",
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  })

  // ── write: unstake() ───────────────────────────────────────────────────────
  const {
    writeContract,
    data: unstakeTxHash,
    isPending: isUnstakePending,
    error: unstakeWriteError,
  } = useWriteContract()

  const { isLoading: isConfirming, isSuccess: unstakeConfirmed } =
    useWaitForTransactionReceipt({ hash: unstakeTxHash })

  // refetch balances after success
  useEffect(() => {
    if (unstakeConfirmed) { refetchActive(); refetchStake() }
  }, [unstakeConfirmed, refetchActive, refetchStake])

  const handleUnstake = () => {
    writeContract({ address: STAKING_CONTRACT, abi: STAKING_ABI, functionName: "unstake" })
  }

  // ── derived ────────────────────────────────────────────────────────────────
  const stakedNum  = stakedWei ? parseFloat(formatEther(stakedWei as bigint)) : 0
  const isBusy     = isUnstakePending || isConfirming
  const canUnstake = !!address && !!isActive && stakedNum > 0 && !isBusy

  // ── render ─────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen">
      <DashboardHeader
        title="Infrastructure Settings"
        subtitle="Configure hardware, network parameters, and manage your stake."
      />

      <div className="p-6">
        <div className="grid gap-6 lg:grid-cols-4">

          {/* sidebar tabs */}
          <nav className="space-y-1">
            {TABS.map(({ id, label, Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  activeTab === id
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <Icon className="h-4 w-4" />
                {label}
              </button>
            ))}
          </nav>

          {/* content card */}
          <Card className="lg:col-span-3 border-border/40 bg-card/30 p-8">

            {/* ── STAKING ── */}
            {activeTab === "staking" && (
              <div className="space-y-8">
                <div>
                  <h3 className="text-lg font-semibold">Stake Management</h3>
                  <p className="text-sm text-muted-foreground">
                    View your on-chain stake and withdraw it when you stop operating.
                  </p>
                </div>

                {/* status grid */}
                <div className="rounded-lg border border-border/40 bg-muted/20 p-6 grid sm:grid-cols-2 gap-6">
                  <div>
                    <p className="text-[11px] uppercase tracking-wide text-muted-foreground mb-1">
                      Connected Wallet
                    </p>
                    <p className="font-mono text-sm">
                      {address ? `${address.slice(0,6)}…${address.slice(-4)}` : "Not connected"}
                    </p>
                  </div>
                  <div>
                    <p className="text-[11px] uppercase tracking-wide text-muted-foreground mb-1">
                      On-chain Status
                    </p>
                    <div className="flex items-center gap-2">
                      <span className={`h-2 w-2 rounded-full ${isActive ? "bg-accent" : "bg-destructive"}`} />
                      <span className={`text-sm font-medium ${isActive ? "text-accent" : "text-destructive"}`}>
                        {isActive ? "Active" : "Inactive / Not staked"}
                      </span>
                    </div>
                  </div>
                  <div>
                    <p className="text-[11px] uppercase tracking-wide text-muted-foreground mb-1">
                      Staked Amount
                    </p>
                    <p className="text-2xl font-bold text-primary">{stakedNum.toFixed(4)} MATIC</p>
                  </div>
                  <div>
                    <p className="text-[11px] uppercase tracking-wide text-muted-foreground mb-1">
                      Contract
                    </p>
                    <a
                      href={`https://amoy.polygonscan.com/address/${STAKING_CONTRACT}`}
                      target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary font-mono"
                    >
                      {STAKING_CONTRACT.slice(0, 12)}… <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                </div>

                {/* warning */}
                <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-4 text-sm">
                  <p className="font-semibold text-amber-400 mb-2">Before unstaking:</p>
                  <ul className="list-disc list-inside text-muted-foreground space-y-1 text-xs">
                    <li>Stop the node daemon first (Ctrl+C in your terminal)</li>
                    <li>Wait for any in-progress jobs to complete</li>
                    <li>Unstaking while actively running may cause job failures and slashing</li>
                  </ul>
                </div>

                {/* write error */}
                {unstakeWriteError && (
                  <div className="flex items-start gap-2 text-destructive text-sm bg-destructive/10 p-3 rounded-lg">
                    <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                    {unstakeWriteError.message?.slice(0, 200)}
                  </div>
                )}

                {/* success */}
                {unstakeConfirmed && (
                  <div className="flex items-center gap-2 text-accent text-sm bg-accent/10 p-3 rounded-lg">
                    <CheckCircle2 className="h-4 w-4 shrink-0" />
                    Unstake confirmed — MATIC returned to your wallet.
                    {unstakeTxHash && (
                      <a
                        href={`https://amoy.polygonscan.com/tx/${unstakeTxHash}`}
                        target="_blank" rel="noopener noreferrer"
                        className="ml-auto flex items-center gap-1 text-xs hover:underline"
                      >
                        View tx <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                  </div>
                )}

                {/* unstake button */}
                <Button
                  variant="outline"
                  className="border-destructive/50 text-destructive hover:bg-destructive/10 hover:border-destructive"
                  onClick={handleUnstake}
                  disabled={!canUnstake}
                >
                  {isBusy ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {isUnstakePending ? "Confirm in wallet…" : "Waiting for confirmation…"}</>
                  ) : (
                    <><LogOut className="mr-2 h-4 w-4" />
                    Unstake &amp; Stop Node ({stakedNum.toFixed(4)} MATIC)</>
                  )}
                </Button>

                {!address && (
                  <p className="text-xs text-muted-foreground">
                    Connect your wallet above to manage your stake.
                  </p>
                )}
                {address && !isActive && stakedNum === 0 && (
                  <p className="text-xs text-muted-foreground">
                    No active stake for this wallet.{" "}
                    <a href="/node-operator/register" className="text-primary hover:underline">
                      Register a node
                    </a>{" "}to stake.
                  </p>
                )}

                {/* slashing info */}
                <div className="rounded-lg border border-border/40 bg-card/20 p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <Shield className="h-4 w-4 text-muted-foreground" />
                    <p className="text-sm font-medium">Slashing Conditions</p>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    The NodeStaking contract burns a portion of your stake if your node is proven to
                    have submitted fraudulent or deliberately wrong inference results.
                    Slashing is triggered on-chain by the JobManager contract after result verification.
                    Honest nodes never lose stake.
                  </p>
                </div>
              </div>
            )}

            {/* ── HARDWARE ── */}
            {activeTab === "hardware" && (
              <div className="space-y-8">
                <div>
                  <h3 className="text-lg font-semibold">Compute Profile</h3>
                  <p className="text-sm text-muted-foreground">
                    Manage hardware specifications and resource allocation.
                  </p>
                </div>
                <div className="space-y-4 max-w-xl">
                  <div className="space-y-2">
                    <Label htmlFor="gpu">Preferred GPU Cluster</Label>
                    <Input id="gpu" defaultValue="NVIDIA RTX Series" className="bg-input/50" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="vram">VRAM Reservation (GB)</Label>
                    <Input id="vram" type="number" defaultValue="24" className="bg-input/50" />
                  </div>
                  <div className="flex items-center justify-between pt-4">
                    <div>
                      <p className="text-sm font-medium">Automatic Overclocking</p>
                      <p className="text-xs text-muted-foreground">Boost performance during peak demand</p>
                    </div>
                    <Switch />
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button className="bg-primary hover:bg-primary/90">
                    <Save className="mr-2 h-4 w-4" /> Save Configuration
                  </Button>
                </div>
              </div>
            )}

            {/* ── NETWORK ── */}
            {activeTab === "network" && (
              <div className="space-y-8">
                <div>
                  <h3 className="text-lg font-semibold">Network Parameters</h3>
                  <p className="text-sm text-muted-foreground">
                    Configure node visibility and connection settings.
                  </p>
                </div>
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Network className="h-5 w-5 text-primary" />
                      <div>
                        <p className="text-sm font-medium">P2P Peer Discovery</p>
                        <p className="text-xs text-muted-foreground">Allow other nodes to discover your gateway</p>
                      </div>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="space-y-2 max-w-sm">
                    <Label htmlFor="port">Inbound Port Range</Label>
                    <Input id="port" defaultValue="30001 - 30010" className="bg-input/50" />
                  </div>
                </div>
              </div>
            )}

            {/* ── SECURITY ── */}
            {activeTab === "security" && (
              <div className="space-y-8">
                <div>
                  <h3 className="text-lg font-semibold">Infrastructure Security</h3>
                  <p className="text-sm text-muted-foreground">Secure your nodes and management dashboard.</p>
                </div>
                <div className="space-y-4 max-w-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Remote Node Management</p>
                      <p className="text-xs text-muted-foreground">Enable SSH-based remote control</p>
                    </div>
                    <Switch />
                  </div>
                  <Button variant="outline" className="w-full border-border/60">
                    Manage Access Keys
                  </Button>
                </div>
              </div>
            )}

            {/* ── NOTIFICATIONS ── */}
            {activeTab === "notifications" && (
              <div className="space-y-8">
                <div>
                  <h3 className="text-lg font-semibold">Alerts &amp; Monitoring</h3>
                  <p className="text-sm text-muted-foreground">
                    Stay updated on infrastructure health and payouts.
                  </p>
                </div>
                <div className="space-y-6">
                  {[
                    { label: "Node Offline Alerts",  desc: "Notify if heartbeats fail" },
                    { label: "High Load Warnings",   desc: "Notify when usage exceeds 90%" },
                    { label: "Job Completion",        desc: "Notify on each completed inference" },
                  ].map(item => (
                    <div key={item.label} className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">{item.label}</p>
                        <p className="text-xs text-muted-foreground">{item.desc}</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                  ))}
                </div>
              </div>
            )}

          </Card>
        </div>
      </div>
    </div>
  )
}