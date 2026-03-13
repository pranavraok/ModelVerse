"use client"

import { useMemo, useState } from "react"
import { DashboardHeader } from "@/components/dashboard/header"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Copy, Terminal, CheckCircle2, Download } from "lucide-react"

export default function NodeSetupPage() {
  const [copied, setCopied] = useState(false)

  const registration = useMemo(() => {
    if (typeof window === "undefined") return null
    try {
      const raw = localStorage.getItem("modelverse_node_registration")
      return raw ? JSON.parse(raw) as { node_id: string; api_key: string } : null
    } catch {
      return null
    }
  }, [])

  const envConfig = useMemo(() => {
    return [
      `NODE_ID=${registration?.node_id || ""}`,
      `API_KEY=${registration?.api_key || ""}`,
      "WALLET_PRIVATE_KEY=<enter_your_private_key>",
      "SUPABASE_URL=https://<your-project-ref>.supabase.co",
      "CONTRACT_ADDRESS=0xYourContractAddress",
      "STAKING_CONTRACT=0xYourContractAddress",
      "RPC_URL=https://polygon-mumbai.g.alchemy.com/v2/<your_key>",
    ].join("\n")
  }, [registration])

  const copyConfig = () => {
    navigator.clipboard.writeText(envConfig)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="min-h-screen pb-10">
      <DashboardHeader 
        title="Node Software Setup" 
        subtitle="Complete these steps to start your node and receive jobs"
      />

      <div className="max-w-3xl mx-auto mt-6 px-6 space-y-8">
        {/* Step 1 */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold flex items-center gap-3">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/20 text-primary text-sm">1</span>
            Download Node Software
          </h2>
          <Card className="border-border/40 bg-card/30 p-6">
            <div className="flex gap-4">
              <Button className="flex-1" variant="outline" asChild>
                <a href="/node-software.zip" download>
                <Download className="mr-2 h-4 w-4" /> Mac (Apple Silicon)
                </a>
              </Button>
              <Button className="flex-1" variant="outline" asChild>
                <a href="/node-software.zip" download>
                <Download className="mr-2 h-4 w-4" /> Windows (.exe)
                </a>
              </Button>
              <Button className="flex-1" variant="outline" asChild>
                <a href="/node-software.zip" download>
                <Download className="mr-2 h-4 w-4" /> Linux (.deb)
                </a>
              </Button>
            </div>
            <div className="my-6 text-center text-sm text-muted-foreground">OR clone from GitHub</div>
            <div className="bg-muted p-4 rounded-md relative text-sm font-mono border border-border/50 text-muted-foreground overflow-x-auto">
              git clone https://github.com/yourrepo/node-software.git
            </div>
          </Card>
        </div>

        {/* Step 2 */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold flex items-center gap-3">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/20 text-primary text-sm">2</span>
            Configure Environment
          </h2>
          <Card className="border-border/40 bg-card/30 p-6 relative">
            <Button size="sm" variant="ghost" className="absolute top-4 right-4" onClick={copyConfig}>
              {copied ? <CheckCircle2 className="h-4 w-4 text-accent" /> : <Copy className="h-4 w-4" />}
            </Button>
            <p className="text-sm text-muted-foreground mb-4">Create a <code>.env</code> file in the root directory and paste this configuration:</p>
            <pre className="bg-muted p-4 rounded-md text-sm font-mono border border-border/50 text-muted-foreground overflow-x-auto">
{envConfig}
            </pre>
            {!registration ? (
              <p className="text-xs text-primary mt-3">Register your node first to get NODE_ID and API_KEY.</p>
            ) : null}
            <p className="text-xs text-destructive mt-4 font-medium">Security warning: Never share your private key or API key.</p>
          </Card>
        </div>

        {/* Step 3 */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold flex items-center gap-3">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/20 text-primary text-sm">3</span>
            Start Node
          </h2>
          <Card className="border-border/40 bg-card/30 p-6">
            <div className="space-y-2 font-mono text-sm">
              <p className="text-muted-foreground"># Using Docker</p>
              <div className="bg-muted p-4 rounded-md border border-border/50 overflow-x-auto space-y-1">
                <div>cd node-software</div>
                <div>docker-compose up -d</div>
              </div>
            </div>
            
            <div className="mt-6 flex items-center gap-4 bg-accent/10 text-accent p-4 rounded-lg border border-accent/20">
              <Terminal className="h-5 w-5" />
              <div>
                <p className="font-semibold text-sm">Expected Output:</p>
                <p className="text-xs mt-1">Node abc-123 online. Polling for jobs...</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}