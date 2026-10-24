// @ts-check
import { defineConfig } from 'astro/config';

// The public URL is Josh's call (painttradehq.com, painttradehq.com.au or www.painttradehq.co).
// Set PUBLIC_SITE_URL in the hosting environment; the fallback is only for local builds.
const site = process.env.PUBLIC_SITE_URL || 'https://painttradehq.com';

export default defineConfig({
  site,
  output: 'static',
  trailingSlash: 'never',
  build: { format: 'file' },
  devToolbar: { enabled: false },
});
