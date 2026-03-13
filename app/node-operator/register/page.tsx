"use client"

import { useState, useEffect } from "react"
import { DashboardHeader } from "@/components/dashboard/header"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Checkbox } from "@/components/ui/checkbox"
import { useRouter } from "next/navigation"
import { Cpu, ShieldCheck, HelpCircle } from "lucide-react"

export default function RegisterNodePage() {
  const router = useRouter()
  const [cpuCores, setCpuCores] = useState(4)
  const [ram, setRam] = useState("")
  const [stake, setStake] = useState([10])
  const [isRegistering, setIsRegistering] = useState(false)

  useEffect(() => {
    if (typeof navigator !== "undefined") {
      setCpuCores(navigator.hardwareConcurrency || 4)
    }
  }, [])

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsRegistering(true)
    // Simulate transaction
    setTimeout(() => {
      setIsRegistering(false)
      router.push("/node-operator/setup")
    }, 2000)
  }

  return (
    <div className="min-h-screen pb-10">
      <DashboardHeader 
        title="Become a Node Operator" 
        subtitle="Earn MATIC by running AI models on your laptop or server. Expected earnings: 0.3 - 1.5 MATIC / hr."
      />
      
      <div className="max-w-4xl mx-auto mt-6 px-6 grid gap-6 md:grid-cols-[1fr_350px]">
        {/* Registration Form */}
        <Card className="border-border/40 bg-card/30 p-6">
          <h2 className="text-xl font-semibold mb-6">Hardware Information</h2>
          <form onSubmit={handleRegister} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>CPU Cores (Auto-detected)</Label>
                <div className="flex items-center gap-2 px-3 py-2 bg-muted rounded-md text-sm border border-border/50">
                  <Cpu className="h-4 w-4" /> {cpuCores} Cores Detected
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="ram">RAM (GB)</Label>
                <Input id="ram" placeholder="e.g. 16" required min="4" type="number" onChange={(e) => setRam(e.target.value)} />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="nodeName">Node Name (Optional)</Label>
              <Input id="nodeName" placeholder="My Node #1" maxLength={50} />
            </div>

            <div className="space-y-4 pt-4">
              <div className="flex justify-between items-end">
                <Label>Stake Amount (MATIC)</Label>
                <span className="text-sm font-medium text-accent">{stake[0]} MATIC</span>
              </div>
              <Slider 
                value={stake} 
                onValueChange={setStake} 
                max={100} 
                min={10} 
                step={1} 
              />
              <p className="text-xs text-muted-foreground">Minimum stake is 10 MATIC. Higher stake increases earnings multiplier.</p>
            </div>

            <div className="flex items-start space-x-3 pt-4">
              <Checkbox id="terms" required />
              <div className="grid gap-1.5 leading-none">
                <label
                  htmlFor="terms"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Accept Terms and Conditions
                </label>
                <p className="text-xs text-muted-foreground">
                  I understand nodes may be slashed for returning incorrect results.
                </p>
              </div>
            </div>

            <Button type="submit" className="w-full bg-primary hover:bg-primary/90 mt-4" disabled={isRegistering}>
              {isRegistering ? "Registering on blockchain..." : "Register Node"}
            </Button>
          </form>
        </Card>

        {/* Requirements Sidebar */}
        <div className="space-y-6">
          <Card className="border-border/40 bg-card/30 p-6">
            <h3 className="font-semibold flex items-center gap-2 mb-4">
              <ShieldCheck className="h-5 w-5 text-primary" />
              Requirements
            </h3>
            <ul className="space-y-3 text-sm">
              <li className="flex gap-2"><span className="text-accent">✓</span> 10 MATIC stake (refundable)</li>
              <li className="flex gap-2"><span className="text-accent">✓</span> 4GB+ RAM</li>
              <li className="flex gap-2"><span className="text-accent">✓</span> Stable internet connection</li>
              <li className="flex gap-2"><span className="text-accent">✓</span> Docker installed</li>
            </ul>
          </Card>

          <Card className="border-border/40 bg-card/30 p-6">
            <h3 className="font-semibold flex items-center gap-2 mb-4">
              <HelpCircle className="h-5 w-5 text-muted-foreground" />
              FAQ
            </h3>
            <div className="space-y-4 text-sm">
              <div>
                <p className="font-medium text-foreground">How do I earn?</p>
                <p className="text-muted-foreground text-xs mt-1">Get paid per inference task completed successfully.</p>
              </div>
              <div>
                <p className="font-medium text-foreground">What is slashing?</p>
                <p className="text-muted-foreground text-xs mt-1">Losing a portion of your stake for bad behavior or offline status.</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}