"use client"

/**
 * app/node-operator/setup/page.tsx
 *
 * Reads the registration saved in localStorage by register/page.tsx
 * and generates a ready-to-paste .env for the node-service daemon.
 *
 * localStorage key: "modelverse_node_registration"
 * Shape: { node_id, api_key, wallet, stake_matic, node_name, tx_hash, registered_at }
 */

import { useMemo, useState } from "react"
import { DashboardHeader } from "@/components/dashboard/header"
import { Card }            from "@/components/ui/card"
import { Button }          from "@/components/ui/button"
import { getBackendUrl, getWsJobsUrl } from "@/lib/runtime-env"
import {
  Copy, Terminal, CheckCircle2, Download, ExternalLink, AlertCircle,
} from "lucide-react"

// ─── env ──────────────────────────────────────────────────────────────────────
const BACKEND_URL   = getBackendUrl()
const WS_URL        = getWsJobsUrl()
const STAKING_ADDR  = process.env.NEXT_PUBLIC_STAKING_CONTRACT       ?? "0x0000000000000000000000000000000000000000"
const JOB_MANAGER   = process.env.NEXT_PUBLIC_JOB_MANAGER_ADDRESS    ?? "0x0000000000000000000000000000000000000000"
const MODEL_REG     = process.env.NEXT_PUBLIC_MODEL_REGISTRY_ADDRESS ?? "0x0000000000000000000000000000000000000000"
const RPC_URL       = process.env.NEXT_PUBLIC_RPC_URL                ?? "https://rpc-amoy.polygon.technology"
const PINATA_GW     = process.env.NEXT_PUBLIC_PINATA_GATEWAY_URL     ?? "https://gateway.pinata.cloud/ipfs/"

// ─── types ────────────────────────────────────────────────────────────────────
interface RegInfo {
  node_id:       string
  api_key:       string
  wallet:        string
  stake_matic:   number
  node_name:     string
  tx_hash:       string
  registered_at: string
}

export default function NodeSetupPage() {
  const [copiedEnv, setCopiedEnv] = useState(false)
  const [copiedCmd, setCopiedCmd] = useState(false)

  // ── read registration ──────────────────────────────────────────────────────
  const reg = useMemo<RegInfo | null>(() => {
    if (typeof window === "undefined") return null
    try {
      const raw = localStorage.getItem("modelverse_node_registration")
      return raw ? (JSON.parse(raw) as RegInfo) : null
    } catch {
      return null
    }
  }, [])

  // ── build .env content ─────────────────────────────────────────────────────
  // Matches exactly what node_daemon.py and backend_client.py expect.
  const envContent = useMemo(() => [
    `# ModelVerse node-service .env`,
    `# Auto-generated ${new Date().toISOString().slice(0, 10)} — fill in NODE_PRIVATE_KEY before running`,
    ``,
    `# ── Identity ─────────────────────────────────────────────────────────────────`,
    `# This key is used by the daemon to sign on-chain transactions (TESTNET ONLY).`,
    `# NEVER commit a real mainnet private key.`,
    `NODE_PRIVATE_KEY=0xYOUR_TESTNET_PRIVATE_KEY_HERE`,
    ``,
    `# ── Backend API (set automatically after registration) ───────────────────────`,
    `# node_daemon.py reads NODE_API_KEY; if blank it calls /api/nodes/register.`,
    `NODE_API_KEY=${reg?.api_key ?? ""}`,
    ``,
    `# ── Backend HTTP + WebSocket ──────────────────────────────────────────────────`,
    `BACKEND_HTTP_URL=${BACKEND_URL}`,
    `COORDINATOR_WS_URL=${WS_URL}`,
    `COORDINATOR_AUTH_MODE=header`,
    `BACKEND_API_KEY_HEADER=x-node-api-key`,
    ``,
    `# ── Blockchain ────────────────────────────────────────────────────────────────`,
    `RPC_URL=${RPC_URL}`,
    `STAKING_CONTRACT=${STAKING_ADDR}`,
    `JOB_MANAGER_ADDRESS=${JOB_MANAGER}`,
    `MODEL_REGISTRY_ADDRESS=${MODEL_REG}`,
    `# Kept for ABI compatibility — not actively used by node logic`,
    `STAKE_REGISTRY_ADDRESS=0x0000000000000000000000000000000000000000`,
    ``,
    `# ── IPFS ──────────────────────────────────────────────────────────────────────`,
    `PINATA_GATEWAY_URL=${PINATA_GW}`,
    `NFT_STORAGE_GATEWAY_URL=https://nftstorage.link/ipfs/`,
    `IPFS_GATEWAY=https://ipfs.io/ipfs/`,
    `IPFS_FALLBACK_GATEWAYS=`,
    ``,
    `# ── Local ─────────────────────────────────────────────────────────────────────`,
    `MODEL_CACHE_DIR=./models_cache`,
    `LOG_LEVEL=INFO`,
  ].join("\n"), [reg])

  const startCmd = "cd node-service\npython node_daemon.py"

  const copyEnv = () => {
    navigator.clipboard.writeText(envContent)
    setCopiedEnv(true)
    setTimeout(() => setCopiedEnv(false), 2000)
  }
  const copyCmd = () => {
    navigator.clipboard.writeText(startCmd)
    setCopiedCmd(true)
    setTimeout(() => setCopiedCmd(false), 2000)
  }

  // ── render ─────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen pb-10">
      <DashboardHeader
        title="Node Software Setup"
        subtitle="Complete these steps to start your node daemon and receive jobs."
      />

      <div className="max-w-3xl mx-auto mt-6 px-6 space-y-10">

        {/* ── registration summary banner ── */}
        {reg ? (
          <Card className="border-accent/30 bg-accent/5 p-5">
            <div className="flex items-center gap-3 mb-4">
              <CheckCircle2 className="h-5 w-5 text-accent shrink-0" />
              <h3 className="font-semibold text-accent">Registration Confirmed</h3>
            </div>
            <div className="grid sm:grid-cols-2 gap-x-10 gap-y-3 text-sm">
              <div>
                <p className="text-[11px] text-muted-foreground uppercase tracking-wide mb-0.5">Node ID</p>
                <p className="font-mono text-xs break-all">{reg.node_id}</p>
              </div>
              <div>
                <p className="text-[11px] text-muted-foreground uppercase tracking-wide mb-0.5">API Key</p>
                <p className="font-mono text-xs break-all">{reg.api_key}</p>
              </div>
              <div>
                <p className="text-[11px] text-muted-foreground uppercase tracking-wide mb-0.5">Wallet</p>
                <p className="font-mono text-xs">{reg.wallet}</p>
              </div>
              <div>
                <p className="text-[11px] text-muted-foreground uppercase tracking-wide mb-0.5">Stake</p>
                <p className="font-semibold">{reg.stake_matic} MATIC</p>
              </div>
              {reg.tx_hash && (
                <div className="sm:col-span-2">
                  <p className="text-[11px] text-muted-foreground uppercase tracking-wide mb-0.5">Stake Transaction</p>
                  <a
                    href={`https://amoy.polygonscan.com/tx/${reg.tx_hash}`}
                    target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-1 text-xs text-accent hover:underline font-mono"
                  >
                    {reg.tx_hash} <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              )}
            </div>
          </Card>
        ) : (
          <Card className="border-destructive/30 bg-destructive/5 p-4">
            <div className="flex items-center gap-3 text-sm text-destructive">
              <AlertCircle className="h-4 w-4 shrink-0" />
              No registration found.{" "}
              <a href="/node-operator/register" className="underline font-medium">Register your node first</a>
              {" "}to get your NODE_ID and API_KEY.
            </div>
          </Card>
        )}

        {/* ── step 1: get software ── */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold flex items-center gap-3">
            <StepBadge n={1} />
            Get Node Software
          </h2>
          <Card className="border-border/40 bg-card/30 p-6">
            <div className="flex flex-wrap gap-3 mb-5">
              {["Mac (Apple Silicon)", "Windows (.exe)", "Linux (.deb)"].map(label => (
                <Button key={label} variant="outline" asChild className="flex-1 min-w-[140px]">
                  <a href="/node-software.zip" download>
                    <Download className="mr-2 h-4 w-4" /> {label}
                  </a>
                </Button>
              ))}
            </div>
            <p className="text-center text-sm text-muted-foreground mb-4">OR clone from GitHub</p>
            <div className="bg-muted px-4 py-3 rounded-md border border-border/50 font-mono text-sm text-muted-foreground overflow-x-auto">
              git clone https://github.com/yourrepo/modelverse-node.git
            </div>
          </Card>
        </section>

        {/* ── step 2: configure .env ── */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold flex items-center gap-3">
            <StepBadge n={2} />
            Configure <code className="text-primary text-[0.95em]">node-service/.env</code>
          </h2>
          <Card className="border-border/40 bg-card/30 p-6 relative">
            <Button
              size="sm" variant="ghost"
              className="absolute top-4 right-4 text-muted-foreground"
              onClick={copyEnv}
            >
              {copiedEnv
                ? <CheckCircle2 className="h-4 w-4 text-accent" />
                : <Copy className="h-4 w-4" />
              }
            </Button>

            <p className="text-sm text-muted-foreground mb-4">
              Create a file named <code className="bg-muted px-1 rounded text-xs">.env</code> inside
              the <code className="bg-muted px-1 rounded text-xs">node-service/</code> directory.
              Your <code className="bg-muted px-1 rounded text-xs">NODE_API_KEY</code> and
              contract addresses are already filled in.
              You only need to supply your <span className="text-primary font-semibold">NODE_PRIVATE_KEY</span>.
            </p>

            <pre className="bg-muted px-4 py-3 rounded-md text-[11px] font-mono border border-border/50 text-muted-foreground overflow-x-auto whitespace-pre leading-5">
              {envContent}
            </pre>

            <p className="text-xs text-destructive mt-3 font-semibold">
              ⚠ Never share your private key or API key with anyone.
            </p>
          </Card>
        </section>

        {/* ── step 3: start daemon ── */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold flex items-center gap-3">
            <StepBadge n={3} />
            Start the Node Daemon
          </h2>
          <Card className="border-border/40 bg-card/30 p-6 relative">
            <Button
              size="sm" variant="ghost"
              className="absolute top-4 right-4 text-muted-foreground"
              onClick={copyCmd}
            >
              {copiedCmd
                ? <CheckCircle2 className="h-4 w-4 text-accent" />
                : <Copy className="h-4 w-4" />
              }
            </Button>

            <pre className="bg-muted px-4 py-3 rounded-md border border-border/50 font-mono text-sm text-muted-foreground overflow-x-auto">
              {startCmd}
            </pre>

            <div className="mt-5 flex items-start gap-4 bg-accent/10 text-accent p-4 rounded-lg border border-accent/20">
              <Terminal className="h-5 w-5 shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-semibold mb-1">Expected startup logs:</p>
                <p className="text-xs font-mono opacity-75 leading-5">
                  INFO  Pre-flight healthcheck PASSED ✔<br />
                  INFO  Using NODE_API_KEY from environment (registration skipped)<br />
                  INFO  Connected to coordinator websocket: ws://…<br />
                  INFO  Starting node daemon (interval=30 sec address=0x… node_id=…)
                </p>
              </div>
            </div>
          </Card>
        </section>

        {/* ── step 4: stopping ── */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold flex items-center gap-3">
            <StepBadge n={4} />
            Stopping Your Node
          </h2>
          <Card className="border-border/40 bg-card/30 p-6">
            <p className="text-sm text-muted-foreground mb-5">
              When you&apos;re finished, stop the daemon (Ctrl+C) then unstake from the Settings page
              to retrieve your MATIC. The contract only releases funds if no fraud was detected.
            </p>

            <div className="grid sm:grid-cols-2 gap-4 mb-5">
              <div className="rounded-lg border border-border/40 p-4">
                <p className="font-medium text-sm mb-1">Normal exit</p>
                <p className="text-xs text-muted-foreground">
                  Stop daemon → Settings → Unstake → MATIC returned to your wallet instantly.
                </p>
              </div>
              <div className="rounded-lg border border-destructive/30 p-4">
                <p className="font-medium text-sm text-destructive mb-1">Fraud / slashing</p>
                <p className="text-xs text-muted-foreground">
                  Returning incorrect inference results causes the contract to slash your stake.
                  Honest nodes always keep their full stake.
                </p>
              </div>
            </div>

            <Button
              variant="outline"
              className="border-border/60"
              onClick={() => (window.location.href = "/node-operator/settings")}
            >
              Go to Settings → Unstake
            </Button>
          </Card>
        </section>

      </div>
    </div>
  )
}

// ─── helpers ──────────────────────────────────────────────────────────────────
function StepBadge({ n }: { n: number }) {
  return (
    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/20 text-primary text-sm font-bold">
      {n}
    </span>
  )
}