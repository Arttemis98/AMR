import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express, { NextFunction, Request, Response } from 'express';
import { cert, getApps, initializeApp, ServiceAccount } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { GoogleGenAI } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load local env files if present in Node 22+
for (const envFile of ['.env.local', '.env']) {
  const envPath = path.resolve(__dirname, envFile);
  if (fs.existsSync(envPath) && typeof process.loadEnvFile === 'function') {
    try {
      process.loadEnvFile(envPath);
    } catch {
      // Ignore parse errors on optional env files
    }
  }
}

function loadFirebaseProjectId(): string {
  if (process.env.FIREBASE_PROJECT_ID) {
    return process.env.FIREBASE_PROJECT_ID;
  }
  try {
    const configPath = path.resolve(__dirname, 'firebase-applet-config.json');
    if (fs.existsSync(configPath)) {
      const parsed = JSON.parse(fs.readFileSync(configPath, 'utf-8')) as { projectId?: string };
      if (parsed.projectId) return parsed.projectId;
    }
  } catch {
    // Fallback below
  }
  return 'iris-f3631';
}

function initFirebaseAdmin(): void {
  if (getApps().length > 0) return;

  const projectId = loadFirebaseProjectId();
  const serviceAccountEnv = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;

  if (serviceAccountEnv) {
    try {
      const parsed = JSON.parse(serviceAccountEnv) as ServiceAccount;
      initializeApp({
        credential: cert(parsed),
        projectId: parsed.projectId || projectId,
      });
      return;
    } catch (err) {
      console.error('Invalid FIREBASE_SERVICE_ACCOUNT_JSON configuration:', err);
    }
  }

  initializeApp({ projectId });
}

initFirebaseAdmin();

interface AuthenticatedRequest extends Request {
  uid?: string;
}

async function requireFirebaseAuth(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Authentication required.' });
    return;
  }

  const idToken = authHeader.slice('Bearer '.length).trim();
  if (!idToken) {
    res.status(401).json({ error: 'Authentication required.' });
    return;
  }

  try {
    const decoded = await getAuth().verifyIdToken(idToken);
    req.uid = decoded.uid;
    next();
  } catch (err) {
    console.error('Firebase token verification failed:', err);
    res.status(401).json({ error: 'Invalid or expired authentication token.' });
  }
}

// Per-user in-memory rate limit: 20 requests per 10 minutes
const CHAT_RATE_LIMIT_MAX = 20;
const CHAT_RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const chatRateLimitMap = new Map<string, number[]>();

function isRateLimited(uid: string): boolean {
  const now = Date.now();
  const cutoff = now - CHAT_RATE_LIMIT_WINDOW_MS;
  const timestamps = (chatRateLimitMap.get(uid) || []).filter((ts) => ts > cutoff);
  if (timestamps.length >= CHAT_RATE_LIMIT_MAX) {
    chatRateLimitMap.set(uid, timestamps);
    return true;
  }
  timestamps.push(now);
  chatRateLimitMap.set(uid, timestamps);
  return false;
}

const SYSTEM_INSTRUCTION = `
You are the Chief Scientific Advisor for "IRIS" (Indian Resistance Interpretation Surveillance), India's AMR tracking portal.
Your role is to assist researchers, clinicians, and environmental scientists who use the portal.

Objectives:
1. Data Interpretation: Help interpret antibiograms, PCR gene detection, and NGS findings to identify resistance trends.
2. One Health Approach: Connect findings from environmental samples (WWTPs, rivers) to clinical risks (hospital outbreaks).
3. Gap Analysis: Suggest missing validation steps (e.g., genotypic validation via PCR for Colistin resistance).
4. Policy Recommendations: Suggest evidence-based public health interventions for antimicrobial stewardship.

Tone:
- Professional, authoritative, yet collaborative.
- Use standard Indian English context where appropriate.
- Prioritize public health impact and clearly distinguish general scientific guidance from user-provided data.
`;

interface ChatHistoryEntry {
  role: 'user' | 'model';
  text: string;
}

function getGeminiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured on the server.');
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// --- NCBI BLAST URL API HELPERS ---
const NCBI_BLAST_URL = 'https://blast.ncbi.nlm.nih.gov/Blast.cgi';

interface ParsedBlastHit {
  accession: string;
  description: string;
  score: number;
  evalue: string;
  identity: number;
  organism: string;
  genus: string;
  lineage: string;
}

function extractXmlTag(block: string, tag: string): string {
  const match = block.match(new RegExp(`<${tag}>([\\s\\S]*?)<\\/${tag}>`, 'i'));
  return match ? match[1].trim() : '';
}

function decodeXmlEntities(value: string): string {
  return value
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

function parseOrganismFromDef(def: string): { organism: string; genus: string } {
  const cleaned = decodeXmlEntities(def)
    .replace(/^PREDICTED:\s*/i, '')
    .replace(/^Uncultured\s+/i, 'Uncultured ')
    .trim();
  const bracketMatch = cleaned.match(/\[([A-Z][a-z]+(?:\s+[a-z0-9._-]+)?)\]/);
  if (bracketMatch) {
    const org = bracketMatch[1];
    return { organism: org, genus: org.split(/\s+/)[0] || 'Unknown' };
  }
  const words = cleaned.split(/\s+/).filter(Boolean);
  if (words.length >= 2) {
    return { organism: `${words[0]} ${words[1]}`, genus: words[0] };
  }
  return { organism: words[0] || 'Unknown organism', genus: words[0] || 'Unknown' };
}

function parseNcbiBlastXml(xml: string, database: string): ParsedBlastHit[] {
  const hitBlocks = xml.match(/<Hit>[\s\S]*?<\/Hit>/gi) || [];
  const hits: ParsedBlastHit[] = [];

  for (const hitBlock of hitBlocks.slice(0, 5)) {
    const accession = decodeXmlEntities(extractXmlTag(hitBlock, 'Hit_accession')) ||
      decodeXmlEntities(extractXmlTag(hitBlock, 'Hit_id'));
    const rawDef = decodeXmlEntities(extractXmlTag(hitBlock, 'Hit_def'));
    const firstHsp = (hitBlock.match(/<Hsp>[\s\S]*?<\/Hsp>/i) || [hitBlock])[0];

    const bitScoreRaw = Number(extractXmlTag(firstHsp, 'Hsp_bit-score'));
    const evalue = extractXmlTag(firstHsp, 'Hsp_evalue') || '0.0';
    const identityCount = Number(extractXmlTag(firstHsp, 'Hsp_identity'));
    const alignLen = Number(extractXmlTag(firstHsp, 'Hsp_align-len'));

    const identity =
      alignLen > 0 && Number.isFinite(identityCount)
        ? Number(((identityCount / alignLen) * 100).toFixed(1))
        : 0;
    const score = Number.isFinite(bitScoreRaw) ? Math.round(bitScoreRaw) : 0;
    const { organism, genus } = parseOrganismFromDef(rawDef);

    hits.push({
      accession: accession || 'N/A',
      description: rawDef || organism,
      score,
      evalue,
      identity,
      organism,
      genus,
      lineage: database === 'nt' ? 'NCBI Nucleotide Collection (nt)' : 'NCBI 16S Ribosomal RNA RefSeq',
    });
  }

  return hits;
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '1mb' }));

  app.post('/api/chat', requireFirebaseAuth, async (req: AuthenticatedRequest, res: Response) => {
    const uid = req.uid;
    if (!uid) {
      res.status(401).json({ error: 'Authentication required.' });
      return;
    }

    if (isRateLimited(uid)) {
      res.status(429).json({ error: 'Rate limit exceeded. Please wait a few minutes before sending more queries.' });
      return;
    }

    try {
      const body = req.body as { message?: unknown; history?: unknown };
      const message = typeof body?.message === 'string' ? body.message.trim() : '';

      if (!message) {
        res.status(400).json({ error: 'Message is required.' });
        return;
      }

      const rawHistory = Array.isArray(body?.history) ? body.history : [];
      const history: ChatHistoryEntry[] = rawHistory
        .filter(
          (item): item is ChatHistoryEntry =>
            Boolean(item) &&
            typeof item === 'object' &&
            ((item as ChatHistoryEntry).role === 'user' || (item as ChatHistoryEntry).role === 'model') &&
            typeof (item as ChatHistoryEntry).text === 'string' &&
            (item as ChatHistoryEntry).text.trim().length > 0
        )
        .slice(-16);

      const ai = getGeminiClient();
      const contents = [
        ...history.map((item) => ({
          role: item.role,
          parts: [{ text: item.text }],
        })),
        {
          role: 'user' as const,
          parts: [{ text: message }],
        },
      ];

      const response = await ai.models.generateContent({
        model: 'gemini-4-hydrogen',
        contents,
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
        },
      });

      res.json({ text: response.text || 'No response generated.' });
    } catch (error) {
      console.error('Server /api/chat error:', error);
      res.status(500).json({ error: 'AI advisor is unavailable' });
    }
  });

  // Submit nucleotide sequence to NCBI BLAST URL API (CMD=Put)
  app.post('/api/blast', requireFirebaseAuth, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const body = req.body as { sequence?: unknown; database?: unknown };
      const rawSequence = typeof body?.sequence === 'string' ? body.sequence.trim() : '';
      const cleanSequence = rawSequence.replace(/^>.*$/gm, '').replace(/[^ACGTRYKMSWBDHVNacgtrykmswbdhvn]/g, '').toUpperCase();

      if (cleanSequence.length < 50) {
        res.status(400).json({ error: 'Sequence must contain at least 50 valid nucleotide bases.' });
        return;
      }
      if (cleanSequence.length > 20000) {
        res.status(400).json({ error: 'Sequence exceeds the 20,000 bp limit for online BLAST submission.' });
        return;
      }

      const database = body?.database === 'nt' ? 'nt' : '16S_ribosomal_RNA';
      const params = new URLSearchParams({
        CMD: 'Put',
        PROGRAM: 'blastn',
        DATABASE: database,
        QUERY: cleanSequence,
        HITLIST_SIZE: '5',
        FORMAT_TYPE: 'XML',
        TOOL: 'iris-amr-portal',
        EMAIL: 'surveillance@iris-amr.local',
      });

      const ncbiRes = await fetch(NCBI_BLAST_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'User-Agent': 'IRIS-AMR-Portal/1.0',
        },
        body: params.toString(),
      });

      if (!ncbiRes.ok) {
        console.error('NCBI BLAST Put failed with status:', ncbiRes.status);
        res.status(502).json({ error: 'NCBI BLAST service is temporarily unavailable.' });
        return;
      }

      const text = await ncbiRes.text();
      const ridMatch = text.match(/RID\s*=\s*([A-Z0-9_-]+)/i);
      const rtoeMatch = text.match(/RTOE\s*=\s*(\d+)/i);

      if (!ridMatch || !ridMatch[1]) {
        console.error('NCBI BLAST Put did not return an RID.');
        res.status(502).json({ error: 'NCBI BLAST did not accept the sequence submission.' });
        return;
      }

      res.json({
        rid: ridMatch[1],
        rtoe: rtoeMatch ? Number(rtoeMatch[1]) : 10,
        database,
      });
    } catch (error) {
      console.error('Server /api/blast POST error:', error);
      res.status(500).json({ error: 'Unable to submit BLAST search.' });
    }
  });

  // Poll NCBI BLAST URL API (CMD=Get) for SearchInfo and XML hits
  app.get('/api/blast', requireFirebaseAuth, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const rid = typeof req.query.rid === 'string' ? req.query.rid.trim() : '';
      const database = req.query.database === 'nt' ? 'nt' : '16S_ribosomal_RNA';

      if (!rid || !/^[A-Z0-9_-]{6,32}$/i.test(rid)) {
        res.status(400).json({ error: 'Valid BLAST Request ID (rid) is required.' });
        return;
      }

      const infoUrl = `${NCBI_BLAST_URL}?CMD=Get&FORMAT_OBJECT=SearchInfo&RID=${encodeURIComponent(rid)}`;
      const infoRes = await fetch(infoUrl, {
        headers: { 'User-Agent': 'IRIS-AMR-Portal/1.0' },
      });

      if (!infoRes.ok) {
        console.error('NCBI BLAST SearchInfo failed with status:', infoRes.status);
        res.status(502).json({ error: 'Failed to poll NCBI BLAST status.' });
        return;
      }

      const infoText = await infoRes.text();
      const statusMatch = infoText.match(/Status=([A-Z]+)/i);
      const status = statusMatch ? statusMatch[1].toUpperCase() : 'UNKNOWN';

      if (status === 'WAITING') {
        res.json({ status: 'WAITING' });
        return;
      }

      if (status === 'FAILED' || status === 'UNKNOWN') {
        res.json({ status: 'FAILED', hits: [] });
        return;
      }

      if (infoText.includes('ThereAreHits=no')) {
        res.json({ status: 'READY', hits: [] });
        return;
      }

      const resultUrl = `${NCBI_BLAST_URL}?CMD=Get&FORMAT_TYPE=XML&RID=${encodeURIComponent(rid)}`;
      const resultRes = await fetch(resultUrl, {
        headers: { 'User-Agent': 'IRIS-AMR-Portal/1.0' },
      });

      if (!resultRes.ok) {
        console.error('NCBI BLAST XML fetch failed with status:', resultRes.status);
        res.status(502).json({ error: 'Failed to retrieve NCBI BLAST results.' });
        return;
      }

      const xmlText = await resultRes.text();
      const hits = parseNcbiBlastXml(xmlText, database);
      res.json({ status: 'READY', hits });
    } catch (error) {
      console.error('Server /api/blast GET error:', error);
      res.status(500).json({ error: 'Unable to retrieve BLAST results.' });
    }
  });

  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(__dirname, 'dist');
    app.use(express.static(distDir));
    app.use((_req, res) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  }

  const port = Number(process.env.PORT) || 3000;
  app.listen(port, '0.0.0.0', () => {
    console.log(`IRIS server running on http://0.0.0.0:${port}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
