Below is a structured, minimally invasive **implementation plan** to introduce **personal document stores** for users, enabling them to upload PDFs that get parsed and embedded into Pinecone for question-answering (RAG). This plan also ensures the **user bot** in DMs can access these personal documents via the standard Pinecone-based RAG flow.

---

## 1. Database & Metadata Changes

### a) `UserDocument` Table (Prisma)
**Goal**: Track each PDF doc the user uploads (metadata only: filename, fileUrl, etc.).  
**Location**: `prisma/schema.prisma`

**Proposed**:

```prisma
model UserDocument {
  id         String   @id
  userId     String
  filename   String
  fileUrl    String
  contentType String
  createdAt  DateTime
  updatedAt  DateTime

  user User  @relation(fields: [userId], references: [id])

  // Optionally store other flags (e.g. isEmbeddingComplete, numberOfChunks)
}
```

1. **`id`**: unique ID for the doc (like `doc_${Date.now()}_${...}`).
2. **`userId`**: foreign key to `User`.
3. **`filename`**, **`fileUrl`**, **`contentType`**: required doc data.
4. **`createdAt/updatedAt`**: timestamps.

### b) Additional Pinecone Metadata
Any PDF chunk embedded for a user’s personal doc store should have:
```
{
  "ownerId": "<userId>",
  "type": "pdf_chunk",
  // plus existing fields (filename, messageId, channelId, etc.) if relevant
}
```
This ensures RAG queries for a user’s documents can filter by `"ownerId": userId` in addition to normal channel or DM-based filters.

---

## 2. Server-Side Endpoints

### a) **API Endpoint**: `POST /api/users/docs`
Handles PDF upload for personal store.  
**File**: e.g. `app/api/users/docs/route.ts`

**Steps**:
1. **Check auth** (via `getAuth(request)`).
2. **Parse `FormData`** containing the PDF.
3. **Upload** to S3 (reuse existing `upload/route.ts` logic or add a specialized route).
4. **Save** a row in `UserDocument` (with `userId`, `filename`, `fileUrl`, etc.).
5. **Kick off** background PDF processing (similar to `process-pdf` route for channels).

```ts
// app/api/users/docs/route.ts (example)
import { NextRequest, NextResponse } from 'next/server'
import { getAuth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/db'
import { processUserPdf } from '@/lib/pdfUserDocs' // new helper, see below

export async function POST(req: NextRequest) {
  const { userId } = getAuth(req)
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // 1) parse FormData, handle file
  // 2) upload to S3
  // 3) create user doc record
  // 4) call processUserPdf(...)

  return NextResponse.json({ success: true })
}
```

### b) **Background Process**: `processUserPdf(...)`
Equivalent to `processPdfAttachment` but for user docs.  
**New** file: `lib/pdfUserDocs.ts` (or incorporate into existing `pdf.ts` but maintain clarity by separating logic)

**Logic**:
- Reuse `chunkText(...)`, `pdfParse`, etc.
- For each chunk, call `embedMessage(chunk, randomChunkId, { ownerId: userId, type: 'pdf_chunk', filename, ... })`.
- Store vectors in Pinecone with the new `ownerId` field.

---

## 3. RAG Query Modifications

### a) Distinguish Personal Queries
When the user is in their personal doc store chat, we want queries to filter by `"ownerId": userId`.  
**Existing**: `queryMessages(...)` in `lib/rag.ts` or similar.

**Enhance**:
```ts
export async function queryMessages(query: string, channelId?: string, ownerId?: string) {
  // ...
  const filter: any = {}
  if (channelId) filter.channelId = channelId
  if (ownerId) filter.ownerId = ownerId

  // pass filter to pinecone
}
```
**Note**: If we’re searching the personal doc store, we call `queryMessages(query, undefined, userId)` so that the filter is `ownerId = userId`.

### b) Update User Bot Access to Docs
When the user bot responds in a DM, also pass `ownerId = <the DM’s user ID>` so the bot can see that user’s personal doc chunks. This means:
1. If the channel is a DM, identify the user’s ID (the user who “owns” the bot).
2. Add `ownerId` to filter in Pinecone queries, so that the user’s documents are included in context.

**Implementation**:
In `lib/bot.ts`, where we do:
```ts
const relevantMessages = await queryMessages(
  message.content, 
  message.channelId
)
```
Check if channel is DM with a single user who “owns” it. Then add `ownerId: userId` if relevant.

---

## 4. Front-End / UI Changes

### a) Sidebar Link: “My Documents”
**File**: `components/Sidebar.tsx` or `app/(protected)/layout.tsx`, etc.

**Approach**:
- Add a new sidebar entry **“My Documents”**.
- Clicking it navigates to e.g. `app/(protected)/my-docs/page.tsx`.

```tsx
<Button variant="ghost" onClick={() => router.push('/my-docs')}>
  <FileIcon className="mr-2" />
  My Documents
</Button>
```

### b) My Documents Page
**File**: `app/(protected)/my-docs/page.tsx`  
**Features**:
1. **Upload PDF**: a file input or re-use existing `upload` approach. Then call `POST /api/users/docs`.
2. **List** of user PDFs (use `prisma.userDocument.findMany({ where: { userId } })`).
3. **Chat** interface to ask about user’s docs:
   - Very similar to existing message input.  
   - When user sends a query, call a new route or the same RAG logic but with `ownerId: userId`.
4. **Display** RAG answer from user’s doc store. Possibly store ephemeral “chat messages” in state or an ephemeral DB table.  

**Implementation Sketch**:
```tsx
export default function MyDocsPage() {
  // 1) fetch user docs
  // 2) display a file upload button -> calls POST /api/users/docs
  // 3) Chat area: input, messages
  // 4) On user question -> call /api/rag or new route with { query, ownerId: userId }
}
```

---

## 5. Chat Functionality for Personal Docs

### a) Option 1: “Mini Chat” in the same page
- Just store ephemeral Q/A in React state.  
- Each Q triggers `fetch('/api/rag?ownerId=xyz', { query })`.

### b) Option 2: Create a “userDocChannel” concept
- **Mimic** channels so it has the same real-time structure. This is more complicated (since we’d be simulating a new type of channel).  

**Recommendation**: Start with a **simpler local chat** in `MyDocsPage`. 

---

## 6. Minor Adjustments & Observations

1. **Add Condition** in `initBotUser` to skip adding user bot to personal docs, if you prefer. 
2. **Potential** collision with “Note to Self” DM channels. Make sure we don’t double-embed the same doc store chunk if the user is also using note-to-self.  
3. **Security**: Only filter `ownerId = userId`, so other users can’t see these doc store chunks. 

---

## 7. Detailed File/Function Summary

| **File**                                | **Changes**                                                                                        |
|-----------------------------------------|-----------------------------------------------------------------------------------------------------|
| **`prisma/schema.prisma`**             | Add `UserDocument` model.                                                                          |
| **`lib/pdfUserDocs.ts` (new)**         | Expose `processUserPdf(...)` replicating `pdf.ts` logic.                                           |
| **`app/api/users/docs/route.ts`**      | Handle user doc upload + S3 + DB row + background embed.                                            |
| **`lib/rag.ts`**                       | Add optional `ownerId?: string` param to `queryMessages`.                                           |
| **`lib/bot.ts`**                       | In DM scenario, pass `ownerId` for queries if the user’s personal docs should be included.          |
| **`components/Sidebar.tsx`**           | Add “My Documents” link that navigates to a new “MyDocsPage”.                                       |
| **`app/(protected)/my-docs/page.tsx`** | UI for uploading user docs & chatting with them (RAG-based).                                        |

---

## 8. Potential Side Effects / Considerations

- **Migration**: Creating the `UserDocument` table requires a new Prisma migration.  
- **Pinecone**: Adding new metadata fields for `ownerId`, ensures we handle old vectors gracefully. Old vectors simply won’t have an `ownerId`. 
- **Performance**: Large PDFs will produce many chunks. Watch out for Pinecone usage/billing.  
- **UI**: The “My Docs” chat interface is somewhat custom compared to the main channel. If you want real-time or a larger conversation log, you may replicate Slack’s message structure.  
- **Security**: Must verify only the document owner can query that doc’s content. The Pinecone filter approach is crucial here.

---

### Final Notes
This plan keeps changes **straightforward** and **minimal** by leveraging existing PDF parse + embed logic, simply adding a **new table** and **metadata** (ownerId) for personal docs. The existing user bot logic is extended to pass `ownerId` so the user can seamlessly rely on personal documents in their DM conversation.