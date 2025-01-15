**Issue 1**: Root `/` shows a white page for new/unauthenticated users, forcing manual navigation to `/sign-in`.

**Cause**  
No landing or redirect is configured at `/`. Consequently, unauthenticated visitors see an empty UI instead of a sign-in prompt.

**Fix**  
Add a minimal root page that checks user authentication. If not logged in, redirect to `/sign-in`; if logged in, render the main Slack Clone UI. For Next.js App Router, you can do something like:

---

1. **File:** `app/page.tsx`  
   **Change:** Modify the existing default export (or create one if missing) to redirect unauthenticated users to `/sign-in`.

```tsx
language
'use client'

import { useAuth } from '@clerk/nextjs'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function HomePage() {
  const { userId, isLoaded } = useAuth()
  const router = useRouter()

  // If Clerk auth is not fully loaded yet, show a simple loading state
  if (!isLoaded) {
    return <div>Loading...</div>
  }

  // If no user is logged in, redirect to /sign-in
  if (!userId) {
    useEffect(() => {
      router.replace('/sign-in')
    }, [router])
    return null
  }

  // Otherwise, render main Slack Clone UI (whatever you normally show)
  return (
    <div className="h-screen flex">
      {/* Your main Slack Clone layout, Sidebar, etc. */}
      <p>Welcome! You are signed in.</p>
    </div>
  )
}
```

**Testing**  
- Logout from Clerk, visit your root `https://slack-clone-v0.vercel.app/`.  
- You should be redirected automatically to `https://slack-clone-v0.vercel.app/sign-in`.  
- Sign in and confirm you see the normal Slack UI on the root path.

---

**Issue 2**: RAG (Pinecone + OpenAI embeddings) times out on Vercel with `504 Gateway Timeout` and `Task timed out after 10 seconds`.

**Cause**  
By default, Vercel’s Serverless Functions have a 10-second execution limit on the Hobby (free) plan, leading to a timeout if the embedding call and Pinecone indexing take too long.

**Fix (Short-Term)**  
Increase the function timeout by configuring a larger `maxDuration`. You can do this in `vercel.json` for the affected API routes (assuming you are using Next.js “serverless” functions, not “edge” runtime). For example, allow up to 30 seconds:

---

1. **File:** `vercel.json`  
   **Change:** Add `functions` config with `"maxDuration": 30` and optionally `"memory": 1024` for your `/api` routes.

```json
language
{
  "buildCommand": "npx prisma generate && next build",
  "installCommand": "npm install",
  "framework": "nextjs",
  "functions": {
    "api/**": {
      "maxDuration": 30,
      "memory": 1024
    }
  }
}
```

**Notes and Next Steps**  
- This increases your time limit to 30 seconds. If embedding still exceeds 30s, you may need to reduce chunk size or move heavier tasks off to a background queue or a dedicated server.  
- On Vercel’s free tier, you cannot exceed 10s if you’re using **Edge Functions**. Ensure your RAG routes (`app/api/...`) are not set to `export const runtime = 'edge'`. They must remain default (node) serverless runtime.  
- If you’re on a higher Vercel plan, 30s might be allowed, but test if that truly solves the problem or if you need more optimization.

**How to Verify**  
1. Push these changes to your repo so that Vercel picks up the updated `vercel.json`.  
2. Wait for redeployment.  
3. Trigger the same message => RAG => embedding flow.  
4. Check logs to see if it completes before 30 seconds or if further optimization is needed.

---

### Additional Suggestions

- **Optimize Embeddings**  
  - If your PDF or message text is large, consider smaller chunk sizes or a shorter textual excerpt to reduce embedding time.  
- **Background Queue**  
  - If you expect frequent, large embeddings, place them in a queue (e.g., a separate server or background job) so your user-facing route doesn’t time out.  

These two fixes should resolve the most immediate blockers:
1. A proper redirect for unauthorized users.  
2. A raised serverless function timeout to handle Pinecone + OpenAI calls.

After applying these changes, redeploy, and confirm sign-in works from root, and that your RAG requests no longer hit 10s timeouts (or at least have more leeway).