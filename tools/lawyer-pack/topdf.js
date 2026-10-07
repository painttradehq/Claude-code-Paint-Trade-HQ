const { chromium } = require('playwright'); const fs = require('fs'); const path = require('path');
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
  const p = await b.newPage();
  for (const f of fs.readdirSync('html').filter(x => x.endsWith('.html'))) {
    await p.goto('file://' + path.resolve('html', f)); await p.waitForTimeout(200);
    const out = f === 'combined.html' ? '../paint-trade-hq-legal-review-pack.pdf' : 'pdf/' + f.replace('.html', '.pdf');
    await p.pdf({ path: out, format: 'A4', printBackground: true, margin: { top: '22mm', bottom: '22mm', left: '18mm', right: '18mm' }, displayHeaderFooter: true, headerTemplate: '<div></div>', footerTemplate: '<div style="font-size:8px;color:#888;width:100%;text-align:center;font-family:Arial">Paint Trade HQ · legal review pack · page <span class="pageNumber"></span> of <span class="totalPages"></span></div>' });
    console.log('pdf', out);
  }
  await b.close();
})();
