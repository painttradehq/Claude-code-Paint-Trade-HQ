# Google Calendar — Connect Google never opens Google — one-line frontend fix (9 Oct, DRAFT, not sent)

Housekeeping fix, not a round. The Google Calendar diagnosis (read-only, 9 Oct) found the authorize-url fetched four times and no callback, no token call, no server error. The cause is in the frontend, not at Google: `frontend/components/calendar/CalendarSettings.tsx`, the **Connect Google** button (`cs-google-connect`) does

```
const r = await api.get('/integrations/google-calendar/authorize-url'); window.location.href = r.data.url || r.data.authorize_url;
```

but `routes/google_calendar.py` returns `{"authorization_url": ...}`. Both keys are undefined, so the browser is sent to `undefined` and Google is never opened. The **Connect Microsoft** button on the same page and the Drive / OneDrive connect in `BusinessPage.tsx` already read `r.data.authorization_url`.

Change only that one line to match them:

```
const r = await api.get('/integrations/google-calendar/authorize-url'); if (r.data?.authorization_url) window.location.href = r.data.authorization_url;
```

Keep the catch and its message. Restart the frontend. Confirm with one check: signed in as the owner on the preview at 1440, Calendar settings › Google Calendar › Connect Google navigates to accounts.google.com with `redirect_uri=…/api/integrations/google-calendar/callback` and `scope=…calendar.readonly…` (read the URL, do not complete Google's consent; the owner connects himself). Nothing else changes; no other file; no test data; the owner's tenant stays read-only. Reply with the one line changed and the check result. Not a round, no report file, no What's new.
