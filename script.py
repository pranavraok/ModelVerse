import glob

bg_str = '''<div className="min-h-screen bg-gradient-to-br from-indigo-950 via-[#050505] to-emerald-950 relative overflow-hidden">
      {/* Dynamic Background */}
      <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80" aria-hidden="true">
        <div className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-primary to-primary/20 opacity-20 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]" style={{ clipPath: 'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)' }}></div>
      </div>'''

glass_classes = "glass-card border-white/[0.15] bg-white/[0.08] backdrop-blur-3xl shadow-[0_0_30px_rgba(255,255,255,0.05)]"

for page in glob.glob("app/creator/*/page.tsx"):
    with open(page, "r") as f:
        c = f.read()
    
    c = c.replace('<div className="min-h-screen">', bg_str)
    
    c = c.replace('className="group relative border-border/40 bg-card/30', 'className="group relative ' + glass_classes)
    c = c.replace('className="lg:col-span-2 border-border/40 bg-card/30', 'className="lg:col-span-2 ' + glass_classes)
    c = c.replace('className="border-border/40 bg-card/30', 'className="' + glass_classes)
    c = c.replace('className="border-border/40 bg-muted/30', 'className="' + glass_classes)
    c = c.replace('className="border-border/40 bg-gradient-to-br from-accent/20 to-accent/5', 'className="' + glass_classes)
    c = c.replace('className="mt-6 border-border/40 bg-card/30', 'className="mt-6 ' + glass_classes)
    c = c.replace('className="lg:col-span-3 border-border/40 bg-card/30', 'className="lg:col-span-3 ' + glass_classes)
    c = c.replace('className="mx-auto max-w-2xl border-border/40 bg-card/30', 'className="mx-auto max-w-2xl ' + glass_classes)

    with open(page, "w") as f:
        f.write(c)

print("Replaced styles successfully")
