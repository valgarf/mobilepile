import sys

def invertSVG(name):
  with open(name+".svg", "r") as fin, open(name+"-inverted.svg", "w") as fout:
    state=0
    for line in fin:
      #if any(line.strip().startswith(el) for el in ['<?xml', '<
      if state==1:
        if not any(line.strip().startswith(tag) for tag in ["</svg>"]):
          fout.write(line)
        else:
          fout.write("""
            </mask>
            </defs>
            <rect x="-10" y="-10" width="120" height="120" fill="white" mask="url(#iconMask)"/>
            """)
          state=2
      if state==2:
        fout.write(line)
      if state==0:
        if not line.strip().startswith("<svg"):
          fout.write(line)
        else:
          fout.write(line.replace('viewBox="0 0 100 100"', 'viewBox="-10 -10 120 120"'))
          fout.write("""
            <defs>
            <mask id="iconMask">
            <rect x="-10" y="-10" width="120" height="120" fill="white"/>
            """)
          state=1

for fname in sys.argv[1:]:
  if fname.endswith('.svg') and not fname.endswith('-inverted.svg'):
    invertSVG(fname[:-4])