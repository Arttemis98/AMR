# IRIS — Indian Resistance Interpretation Surveillance

IRIS is a One Health antimicrobial resistance (AMR) surveillance web portal for submitting, moderating, and reviewing clinical and environmental AMR reports across India, with integrated bioinformatics workbenches, real NCBI BLASTN 16S/nucleotide homology lookup, and a Gemini-powered scientific advisor.

## Running Locally

1. Install dependencies:
   ```bash
   npm install
   ```
2. Set required environment variables (in `.env.local` or shell):
   - `GEMINI_API_KEY` — Google Gemini API key used server-side by `/api/chat`.
   - Firebase Admin credentials for token verification:
     - Either `GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account.json`, or
     - `FIREBASE_SERVICE_ACCOUNT_JSON='{"type":"service_account",...}'`, or
     - `FIREBASE_PROJECT_ID` (defaults to `projectId` in `firebase-applet-config.json` for ID token verification).
3. Start the development server (runs on port `3000`):
   ```bash
   npm run dev
   ```
4. Build and run in production:
   ```bash
   npm run build
   npm start
   ```

## Security Rules & Moderation

- **Firestore (`firestore.rules`)**: Newly submitted reports are created with `status: "PENDING"`. Public dashboard queries only return reports with `visibility == "PUBLIC"` and `status == "APPROVED"`. Only users with custom Auth claim `admin == true` can change `status`.
- **Storage (`storage.rules`)**: Uploaded report datasets are stored at `reports/{reportId}/{fileName}` (max 25 MB; `.csv`, `.xlsx`, `.txt`, `.fasta`, `.fastq`, `.gz`, `.pdf`).
