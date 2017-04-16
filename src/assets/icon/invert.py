####
# This script 'inverts' all svgs given as argument that do not end in '-inverted.svg'.
# All output svgs are stored with the '-inverted.svg' ending.
# It is safe to call 'python invert.py *.svg' in the icon folder
#
# Inverting means the following: we expect black and white images.
# After inversion, the white parts will stay white and the black parts are transparent.
# In an svg viewer this looks like a completely white image but if there is colored
# background behind the image, you get the black icon in a different color.
#
# Inversion is done by wrapping the original svg in a <mask> element.
# We then create a white rectangle that uses this mask
# The rectangle is larger than the original image, which yield a white border.
# This is important for .css styling: The colored background can be smaller than
# the image (otherwise one gets artifacts like very thin colored borders) and still
# cover the whole original image.
####

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
