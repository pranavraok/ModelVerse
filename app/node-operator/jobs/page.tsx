"use client"

import { DashboardHeader } from "@/components/dashboard/header"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Activity, Clock, PlayCircle, PlusCircle, CheckCircle2, RotateCcw } from "lucide-react"
import { useState } from "react"

export default function ActiveJobsPage() {
  const [acceptingJobs, setAcceptingJobs] = useState(true)

  return (
    <div className="min-h-screen pb-10">
      <DashboardHeader 
        title="Active Jobs" 
        subtitle="Monitor currently running inference tasks and available jobs queue"
      />

      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center bg-card/30 p-4 rounded-xl border border-border/40">
          <div className="flex items-center gap-4">
            <div className={`h-3 w-3 rounded-full ${acceptingJobs ? 'bg-accent shadow-[0_0_8px_rgba(34,197,94,0.5)]' : 'bg-destructive'}`} />
            <div>
              <p className="font-semibold">{acceptingJobs ? 'Accepting New Jobs' : 'Paused'}</p>
              <p className="text-xs text-muted-foreground">Toggle to stop receiving new jobs</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
              <RotateCcw className="mr-2 h-4 w-4" /> Force Sync
            </Button>
            <Switch checked={acceptingJobs} onCheckedChange={setAcceptingJobs} />
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Active Processing */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Activity className="h-5 w-5 text-accent" />
              Currently Processing
            </h2>
            <Card className="border-border/40 bg-card/30 p-6 overflow-hidden relative">
              <div className="absolute top-0 left-0 w-full h-1 bg-muted">
                <div className="h-full bg-accent animate-pulse" style={{ width: '70%' }} />
              </div>
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="font-semibold text-lg">Job #1453</h3>
                  <p className="text-sm text-muted-foreground mt-1">Model: Credit Scoring v2</p>
                </div>
                <span className="bg-accent/20 text-accent px-3 py-1 rounded-full text-xs font-medium border border-accent/20">
                  Inference running...
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-muted/50 p-3 rounded-lg border border-border/50">
                  <p className="text-xs text-muted-foreground uppercase mb-1">Time Elapsed</p>
                  <p className="font-mono font-medium">2.3s / 3.5s est.</p>
                </div>
                <div className="bg-muted/50 p-3 rounded-lg border border-border/50">
                  <p className="text-xs text-muted-foreground uppercase mb-1">Earning</p>
                  <p className="font-medium text-green-500">0.5 MATIC</p>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Live Logs</p>
                <div className="bg-black/80 rounded-md p-4 font-mono text-[10px] text-green-400 space-y-1">
                  <p>&gt; Loading model weights...</p>
                  <p>&gt; Initializing tensor allocations...</p>
                  <p>&gt; Processing input tensor [1, 224, 224, 3]</p>
                  <p className="animate-pulse">&gt; Running inference pass_1...</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Pending Queue */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Clock className="h-5 w-5 text-muted-foreground" />
              Available Jobs Queue
            </h2>
            <Card className="border-border/40 bg-card/30 p-0 overflow-hidden divide-y divide-border/40">
              {[
                { id: "1454", model: "Image Classifier", price: "0.3", time: "1.2s", nodes: 3 },
                { id: "1455", model: "NLP Sentiment", price: "0.2", time: "0.8s", nodes: 1 },
                { id: "1456", model: "Voice Analyzer", price: "0.8", time: "4.5s", nodes: 5 }
              ].map((job) => (
                <div key={job.id} className="p-4 flex items-center justify-between hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="bg-primary/10 p-2 rounded-lg text-primary">
                      <PlayCircle className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-medium">Job #{job.id}</p>
                      <p className="text-xs text-muted-foreground">{job.model}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-green-500">{job.price} MATIC</p>
                    <p className="text-[10px] text-muted-foreground">{job.nodes} nodes bidding</p>
                  </div>
                  <Button size="sm" variant="secondary" disabled={!acceptingJobs}>Bid</Button>
                </div>
              ))}
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
