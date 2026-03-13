"use client"

import { useEffect, useMemo, useState } from "react"
import { ConnectButton } from "@rainbow-me/rainbowkit"
import { useAccount, useReadContract, useWaitForTransactionReceipt, useWriteContract } from "wagmi"
import { parseEther } from "viem"
import { DashboardHeader } from "@/components/dashboard/header"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { registerNode, getPendingJobs, sendHeartbeat, submitBid, type PendingJob } from "@/lib/node-api"
import { 
  Activity,
  ArrowUpRight,
  CheckCircle2,
  Server,
  Wallet,
} from "lucide-react"

const stakingAddress = (process.env.NEXT_PUBLIC_STAKING_CONTRACT_ADDRESS || "0xYourContractAddress") as `0x${string}`

const stakingAbi = [
  {
    type: "function",
    name: "stake",
    stateMutability: "payable",
    inputs: [],
    outputs: [],
  },
  {
    type: "function",
    name: "unstake",
    stateMutability: "nonpayable",
    inputs: [],
    outputs: [],
  },
  {
    type: "function",
    name: "isNodeActive",
    stateMutability: "view",
    inputs: [{ name: "node", type: "address" }],
    outputs: [{ name: "", type: "bool" }],
  },
  {
    type: "function",
    name: "STAKE_AMOUNT",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
  },
] as const

type NodeRegistrationState = {
  node_id: string
  api_key: string
  reputation_score: number
}

const LOCAL_REG_KEY = "modelverse_node_registration"

function formatDate(value?: string): string {
  if (!value) return "-"
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? "-" : date.toLocaleString()
}

export default function NodeOperatorDashboard() {
  const { address, isConnected } = useAccount()
  const [registration, setRegistration] = useState<NodeRegistrationState | null>(null)
  const [jobs, setJobs] = useState<PendingJob[]>([])
  const [assignedJobId, setAssignedJobId] = useState<string | null>(null)
  const [isRegisteringNode, setIsRegisteringNode] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { data: txHash, isPending: isStakePending, writeContract } = useWriteContract()
  const { isSuccess: stakeConfirmed } = useWaitForTransactionReceipt({ hash: txHash })

  const { data: isActiveOnchain } = useReadContract({
    address: stakingAddress,
    abi: stakingAbi,
    functionName: "isNodeActive",
    args: address ? [address] : undefined,
    query: { enabled: Boolean(address) && stakingAddress !== "0xYourContractAddress" },
  })

  const { data: stakeAmountRaw } = useReadContract({
    address: stakingAddress,
    abi: stakingAbi,
    functionName: "STAKE_AMOUNT",
    query: { enabled: stakingAddress !== "0xYourContractAddress" },
  })

  const currentStake = useMemo(() => (stakeAmountRaw as bigint) || parseEther("1"), [stakeAmountRaw])

  const isStaked = Boolean(isActiveOnchain)

  useEffect(() => {
    const raw = localStorage.getItem(LOCAL_REG_KEY)
    if (!raw) return
    try {
      const parsed = JSON.parse(raw) as NodeRegistrationState
      setRegistration(parsed)
    } catch {
      localStorage.removeItem(LOCAL_REG_KEY)
    }
  }, [])

  useEffect(() => {
    if (!stakeConfirmed || !address) return
    void registerNodeWithBackend(address)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stakeConfirmed, address])

  useEffect(() => {
    if (!registration?.node_id || !registration.api_key) return

    const tick = async () => {
      try {
        await sendHeartbeat(registration.node_id, registration.api_key)
        const pending = await getPendingJobs(registration.api_key, 10)
        setJobs(pending)

        if (!assignedJobId && pending.length > 0) {
          const first = pending[0]
          const result = await submitBid(
            first.job_id,
            {
              node_id: registration.node_id,
              estimated_time_ms: 450,
              reputation_score: registration.reputation_score ?? 0.5,
            },
            registration.api_key,
          )
          if (result.won) {
            setAssignedJobId(first.job_id)
          }
        }
      } catch (pollError) {
        setError(pollError instanceof Error ? pollError.message : "Failed polling jobs")
      }
    }

    void tick()
    const interval = window.setInterval(() => void tick(), 5000)
    return () => window.clearInterval(interval)
  }, [registration, assignedJobId])

  const registerNodeWithBackend = async (walletAddress: string) => {
    setIsRegisteringNode(true)
    setError(null)
    try {
      const result = await registerNode(walletAddress)
      setRegistration(result)
      localStorage.setItem(LOCAL_REG_KEY, JSON.stringify(result))
    } catch (registerError) {
      setError(registerError instanceof Error ? registerError.message : "Node registration failed")
    } finally {
      setIsRegisteringNode(false)
    }
  }

  const stakeAndRegister = async () => {
    if (!isConnected || !address) {
      setError("Connect wallet first")
      return
    }

    if (stakingAddress === "0xYourContractAddress") {
      setError("Set NEXT_PUBLIC_STAKING_CONTRACT_ADDRESS in .env.local")
      return
    }

    if (isStaked) {
      await registerNodeWithBackend(address)
      return
    }

    setError(null)
    writeContract({
      address: stakingAddress,
      abi: stakingAbi,
      functionName: "stake",
      value: parseEther("1"),
    })
  }

  const unstake = async () => {
    if (stakingAddress === "0xYourContractAddress") {
      setError("Set NEXT_PUBLIC_STAKING_CONTRACT_ADDRESS in .env.local")
      return
    }
    setError(null)
    writeContract({
      address: stakingAddress,
      abi: stakingAbi,
      functionName: "unstake",
    })
  }

  return (
    <div className="min-h-screen">
      <DashboardHeader 
        title="Operator Dashboard" 
        subtitle="Stake 10 MATIC, register node, and auto-bid on pending jobs"
      />
      
      <div className="p-6 space-y-6">
        <Card className="border-border/40 bg-card/30 p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Wallet</p>
              <p className="font-medium">{address || "Not connected"}</p>
            </div>
            <ConnectButton />
          </div>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card className="border-border/40 bg-card/30 p-4">
              <p className="text-xs text-muted-foreground">Stake</p>
              <p className="text-lg font-semibold">{Number(currentStake) / 1e18} MATIC</p>
            </Card>
            <Card className="border-border/40 bg-card/30 p-4">
              <p className="text-xs text-muted-foreground">Node ID</p>
              <p className="text-sm font-medium break-all">{registration?.node_id || "Not registered"}</p>
            </Card>
            <Card className="border-border/40 bg-card/30 p-4">
              <p className="text-xs text-muted-foreground">Reputation</p>
              <p className="text-lg font-semibold">{registration?.reputation_score ?? 0.5}</p>
            </Card>
            <Card className="border-border/40 bg-card/30 p-4">
              <p className="text-xs text-muted-foreground">Assigned Job</p>
              <p className="text-sm font-medium">{assignedJobId || "None"}</p>
            </Card>
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Button onClick={() => void stakeAndRegister()} disabled={isStakePending || isRegisteringNode || !isConnected}>
              {isStakePending ? "Waiting for stake tx..." : isRegisteringNode ? "Registering..." : isStaked ? "Register Node" : "Stake 1 MATIC + Register"}
            </Button>
            <Button variant="outline" onClick={() => void unstake()} disabled={!isConnected || !isStaked || isStakePending}>
              Unstake
            </Button>
            {registration?.api_key ? (
              <div className="flex items-center gap-2 rounded-lg border border-accent/20 bg-accent/10 px-3 py-2 text-xs">
                <CheckCircle2 className="h-4 w-4 text-accent" />
                API_KEY: <span className="font-mono">{registration.api_key}</span>
              </div>
            ) : null}
          </div>
          {error ? <p className="mt-3 text-sm text-destructive">{error}</p> : null}
        </Card>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="border-border/40 bg-card/30 p-6">
            <h2 className="mb-4 text-lg font-semibold">Pending Jobs (poll every 5s)</h2>
            <div className="space-y-3">
              {jobs.length === 0 ? <p className="text-sm text-muted-foreground">No pending jobs.</p> : null}
              {jobs.map((job) => (
                <div key={job.job_id} className="rounded-xl border border-border/40 p-4">
                  <p className="text-sm font-medium">Job: {job.job_id}</p>
                  <p className="text-xs text-muted-foreground">Model: {job.model_id || job.model_cid || "-"}</p>
                  <p className="text-xs text-muted-foreground">Payment: {job.payment_amount ?? 0} MATIC</p>
                  <p className="text-xs text-muted-foreground">Created: {formatDate(job.created_at)}</p>
                </div>
              ))}
            </div>
          </Card>

          <Card className="border-border/40 bg-card/30 p-6">
            <h2 className="mb-4 text-lg font-semibold">Node Status</h2>
            <div className="space-y-4">
              <div className="flex items-center gap-3 rounded-xl border border-border/40 p-4">
                <Server className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm font-medium">Registration</p>
                  <p className="text-xs text-muted-foreground">{registration ? "Registered" : "Not registered"}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-xl border border-border/40 p-4">
                <Wallet className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm font-medium">Staking</p>
                  <p className="text-xs text-muted-foreground">{isStaked ? "Active (1 MATIC escrowed)" : "Inactive"}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-xl border border-border/40 p-4">
                <Activity className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm font-medium">Bidding</p>
                  <p className="text-xs text-muted-foreground">{assignedJobId ? `Won job ${assignedJobId}` : "No active assignment"}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-xs text-accent">
                <ArrowUpRight className="h-4 w-4" />
                Hackathon mode: first bidder wins
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
