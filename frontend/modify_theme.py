import re

with open('src/app/resources/page.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Remove Hero Section
hero_start = content.find('{/* Hero Section */}')
hero_end = content.find('{/* Main Multi-Section Layout */}')
if hero_start != -1 and hero_end != -1:
    content = content[:hero_start] + content[hero_end:]

# 2. Light Theme replacements
replacements = [
    ('bg-zinc-950', 'bg-zinc-50'),
    ('text-zinc-100', 'text-zinc-900'),
    ('selection:text-zinc-950', 'selection:text-white'),
    ('text-white', 'text-zinc-900'),
    ('text-zinc-400', 'text-zinc-600'),
    ('bg-zinc-900', 'bg-white'),
    ('bg-zinc-800', 'bg-zinc-100'),
    ('border-zinc-800', 'border-zinc-200'),
    ('border-zinc-700', 'border-zinc-300'),
    ('text-zinc-300', 'text-zinc-700'),
    ('text-zinc-200', 'text-zinc-700'),
    ('text-zinc-500', 'text-zinc-500'),
]

for old, new in replacements:
    content = content.replace(old, new)

# Fix some specific issues caused by the generic replace
# The black background on the youtube placeholder is good to keep
content = content.replace('bg-white/80 backdrop-blur-sm', 'bg-black/80 backdrop-blur-sm') # revert if it matched (it shouldn't have based on above)
# "absolute top-3 left-3 bg-black/80 text-zinc-900" -> revert text back to white
content = content.replace('bg-black/80 text-zinc-900', 'bg-black/80 text-white')
content = content.replace('bg-black/40', 'bg-black/40')

# Top nav padding
content = content.replace('min-h-screen bg-zinc-50 text-zinc-900 font-sans selection:bg-amber-500 selection:text-white', 'min-h-screen bg-zinc-50 text-zinc-900 font-sans selection:bg-amber-500 selection:text-white pt-24')

with open('src/app/resources/page.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
print("Done")
