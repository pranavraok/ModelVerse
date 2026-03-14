import glob

for page in glob.glob("app/creator/*/page.tsx"):
    with open(page, "r") as f:
        c = f.read()
    
    c = c.replace('transition-all hover:border-primary/40 hover:bg-card/50', 'transition-colors hover:bg-white/[0.12] hover:border-white/[0.2]')
    
    with open(page, "w") as f:
        f.write(c)

print("Replaced hover styles successfully")
