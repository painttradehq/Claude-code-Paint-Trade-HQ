import markdown, glob, re, os
os.chdir('/home/user/Claude-code-Paint-Trade-HQ/lawyer')
CSS = """<style>
@page { size: A4; margin: 22mm 18mm; }
body { font-family: 'Segoe UI', Arial, Helvetica, sans-serif; font-size: 11pt; line-height: 1.45; color: #1F1B2E; }
h1 { font-size: 20pt; margin: 0 0 6pt; color: #34295E; } h2 { font-size: 14pt; margin: 18pt 0 6pt; color: #34295E; border-bottom: 1px solid #DCD3F0; padding-bottom: 3pt; }
h3 { font-size: 12pt; margin: 14pt 0 4pt; }
table { border-collapse: collapse; width: 100%; margin: 8pt 0 12pt; font-size: 9.5pt; }
th, td { border: 1px solid #C9C4DA; padding: 4pt 6pt; vertical-align: top; text-align: left; } th { background: #F1EEF9; }
tr { page-break-inside: avoid; }
blockquote { border-left: 3px solid #B45309; background: #FFF7E6; margin: 8pt 0; padding: 6pt 10pt; color: #5A4A1E; }
code { font-family: Consolas, monospace; font-size: 9.5pt; background: #F4F2F9; padding: 0 2pt; }
li { margin: 2pt 0; } .doc { page-break-before: always; } .doc:first-child { page-break-before: auto; }
.cover { text-align: center; padding-top: 120pt; } .cover h1 { font-size: 28pt; } .cover p { color: #6B6479; font-size: 12pt; }
.cover ol { text-align: left; display: inline-block; margin-top: 30pt; font-size: 12pt; }
</style>"""
files = sorted(glob.glob('*.md')); parts = []
for f in files:
    html = markdown.markdown(open(f, encoding='utf-8').read(), extensions=['tables'])
    open('html/' + f[:-3] + '.html', 'w', encoding='utf-8').write('<!doctype html><html><head><meta charset="utf-8">' + CSS + '</head><body>' + html + '</body></html>')
    parts.append('<div class="doc">' + html + '</div>')
titles = [re.match(r'^#\s+(.*)', open(f, encoding='utf-8').readline()).group(1) for f in files]
cover = '<div class="cover doc"><h1>Paint Trade HQ</h1><p>Legal review pack · prepared 6 October 2026, brief updated 7 October 2026</p><ol>' + ''.join(f'<li>{t}</li>' for t in titles) + '</ol></div>'
open('html/combined.html', 'w', encoding='utf-8').write('<!doctype html><html><head><meta charset="utf-8">' + CSS + '</head><body>' + cover + ''.join(parts) + '</body></html>')
print('html ok')
