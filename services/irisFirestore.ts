import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  Unsubscribe,
} from 'firebase/firestore';
import { deleteObject, ref, uploadBytes } from 'firebase/storage';
import { User } from 'firebase/auth';
import { AMRReport, DataType, ReportStatus, SampleSource, ThemePreference, UserProfile } from '../types';
import { auth, db, handleFirestoreError, OperationType, storage } from './firebase';

export const THEME_STORAGE_KEY = 'iris_theme_preference';

export function getStoredThemePreference(): ThemePreference {
  try {
    const saved = localStorage.getItem(THEME_STORAGE_KEY);
    if (saved === 'dark' || saved === 'light') {
      return saved;
    }
    if (typeof window !== 'undefined' && window.matchMedia?.('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
  } catch {
    // Ignore storage errors
  }
  return 'light';
}

export function applyThemePreference(theme: ThemePreference): void {
  if (typeof document !== 'undefined') {
    const root = document.documentElement;
    root.classList.toggle('dark', theme === 'dark');
    root.setAttribute('data-theme', theme);
  }
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    // Ignore storage errors
  }
}

const clamp = (value: string | undefined, max: number, fallback = ''): string => {
  const trimmed = (value ?? '').trim();
  if (!trimmed) return fallback;
  return trimmed.slice(0, max);
};

export function computeInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'IR';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase().slice(0, 4);
}

const PENDING_PROFILE_KEY_PREFIX = 'iris_pending_profile_';

export function savePendingRegistrationProfile(
  uid: string,
  data: { name: string; institute: string; email: string }
) {
  try {
    localStorage.setItem(`${PENDING_PROFILE_KEY_PREFIX}${uid}`, JSON.stringify(data));
  } catch {
    // Ignore storage errors
  }
}

export function getPendingRegistrationProfile(
  uid: string
): { name?: string; institute?: string; email?: string } | null {
  try {
    const raw = localStorage.getItem(`${PENDING_PROFILE_KEY_PREFIX}${uid}`);
    if (!raw) return null;
    return JSON.parse(raw) as { name?: string; institute?: string; email?: string };
  } catch {
    return null;
  }
}

export function clearPendingRegistrationProfile(uid: string) {
  try {
    localStorage.removeItem(`${PENDING_PROFILE_KEY_PREFIX}${uid}`);
  } catch {
    // Ignore storage errors
  }
}

export function buildFallbackProfile(user: User): UserProfile {
  const pending = getPendingRegistrationProfile(user.uid);
  const name = clamp(user.displayName || pending?.name || user.email?.split('@')[0], 120, 'Researcher');
  return {
    uid: user.uid,
    name,
    designation: 'Researcher',
    institute: clamp(pending?.institute, 200, 'IRIS Network Member'),
    address: '',
    email: clamp(user.email || pending?.email, 160, ''),
    mobile: '',
    orcid: '',
    avatarInitials: computeInitials(name),
    themePreference: getStoredThemePreference(),
  };
}

export async function fetchOrCreateUserProfile(user: User): Promise<UserProfile> {
  const userDocPath = `users/${user.uid}`;
  const privateDocPath = `users/${user.uid}/private/contact`;
  const userRef = doc(db, 'users', user.uid);
  const privateRef = doc(db, 'users', user.uid, 'private', 'contact');

  let publicSnap;
  try {
    publicSnap = await getDoc(userRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, userDocPath);
  }

  if (publicSnap.exists()) {
    const pubData = publicSnap.data();
    let privData: Record<string, unknown> = {};
    try {
      const privSnap = await getDoc(privateRef);
      if (privSnap.exists()) {
        privData = privSnap.data();
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, privateDocPath);
    }

    const themePref: ThemePreference | undefined =
      pubData.themePreference === 'dark' || pubData.themePreference === 'light'
        ? pubData.themePreference
        : undefined;

    return {
      uid: user.uid,
      name: String(pubData.name ?? 'Researcher'),
      designation: String(pubData.designation ?? 'Researcher'),
      institute: String(pubData.institute ?? 'IRIS Network Member'),
      orcid: String(pubData.orcid ?? ''),
      avatarInitials: String(pubData.avatarInitials ?? computeInitials(String(pubData.name ?? 'IR'))),
      themePreference: themePref,
      email: String(privData.email ?? user.email ?? ''),
      mobile: String(privData.mobile ?? ''),
      address: String(privData.address ?? ''),
    };
  }

  const fallback = buildFallbackProfile(user);

  // Only persist to Firestore if email is verified (required by security rules)
  if (!user.emailVerified) {
    return fallback;
  }

  const initialTheme = fallback.themePreference ?? getStoredThemePreference();

  try {
    await setDoc(userRef, {
      uid: user.uid,
      name: clamp(fallback.name, 120, 'Researcher'),
      designation: clamp(fallback.designation, 120, 'Researcher'),
      institute: clamp(fallback.institute, 200, 'IRIS Network Member'),
      orcid: clamp(fallback.orcid, 32, ''),
      avatarInitials: clamp(fallback.avatarInitials, 4, 'IR'),
      themePreference: initialTheme,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, userDocPath);
  }

  try {
    await setDoc(privateRef, {
      uid: user.uid,
      email: clamp(fallback.email || user.email || 'user@iris.org', 160, 'user@iris.org'),
      mobile: clamp(fallback.mobile, 32, ''),
      address: clamp(fallback.address, 300, ''),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, privateDocPath);
  }

  clearPendingRegistrationProfile(user.uid);
  return fallback;
}

export async function saveUserProfile(uid: string, profile: UserProfile): Promise<UserProfile> {
  if (!auth.currentUser || auth.currentUser.uid !== uid) {
    throw new Error('You must be signed in to update your profile.');
  }
  if (!auth.currentUser.emailVerified) {
    throw new Error('Please verify your email address before saving profile changes.');
  }

  const userDocPath = `users/${uid}`;
  const privateDocPath = `users/${uid}/private/contact`;
  const userRef = doc(db, 'users', uid);
  const privateRef = doc(db, 'users', uid, 'private', 'contact');

  const safeName = clamp(profile.name, 120, 'Researcher');
  const safeInitials = computeInitials(safeName);
  const safeDesignation = clamp(profile.designation, 120, 'Researcher');
  const safeInstitute = clamp(profile.institute, 200, 'IRIS Network Member');
  const safeOrcid = clamp(profile.orcid, 32, '');
  const safeTheme: ThemePreference =
    profile.themePreference === 'dark' || profile.themePreference === 'light'
      ? profile.themePreference
      : getStoredThemePreference();
  const safeEmail = clamp(profile.email || auth.currentUser.email || 'user@iris.org', 160, 'user@iris.org');
  const safeMobile = clamp(profile.mobile, 32, '');
  const safeAddress = clamp(profile.address, 300, '');

  let pubSnap;
  try {
    pubSnap = await getDoc(userRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, userDocPath);
  }

  if (pubSnap.exists()) {
    try {
      await updateDoc(userRef, {
        name: safeName,
        designation: safeDesignation,
        institute: safeInstitute,
        orcid: safeOrcid,
        avatarInitials: safeInitials,
        themePreference: safeTheme,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, userDocPath);
    }
  } else {
    try {
      await setDoc(userRef, {
        uid,
        name: safeName,
        designation: safeDesignation,
        institute: safeInstitute,
        orcid: safeOrcid,
        avatarInitials: safeInitials,
        themePreference: safeTheme,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, userDocPath);
    }
  }

  let privSnap;
  try {
    privSnap = await getDoc(privateRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, privateDocPath);
  }

  if (privSnap.exists()) {
    try {
      await updateDoc(privateRef, {
        email: safeEmail,
        mobile: safeMobile,
        address: safeAddress,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, privateDocPath);
    }
  } else {
    try {
      await setDoc(privateRef, {
        uid,
        email: safeEmail,
        mobile: safeMobile,
        address: safeAddress,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, privateDocPath);
    }
  }

  applyThemePreference(safeTheme);

  return {
    ...profile,
    uid,
    name: safeName,
    designation: safeDesignation,
    institute: safeInstitute,
    orcid: safeOrcid,
    avatarInitials: safeInitials,
    themePreference: safeTheme,
    email: safeEmail,
    mobile: safeMobile,
    address: safeAddress,
  };
}

export async function saveUserThemePreference(uid: string, theme: ThemePreference): Promise<void> {
  applyThemePreference(theme);

  if (!auth.currentUser || auth.currentUser.uid !== uid || !auth.currentUser.emailVerified) {
    return;
  }

  const userDocPath = `users/${uid}`;
  const userRef = doc(db, 'users', uid);

  try {
    const pubSnap = await getDoc(userRef);
    if (pubSnap.exists()) {
      await updateDoc(userRef, {
        themePreference: theme,
        updatedAt: serverTimestamp(),
      });
    } else {
      const fallback = buildFallbackProfile(auth.currentUser);
      await setDoc(userRef, {
        uid,
        name: clamp(fallback.name, 120, 'Researcher'),
        designation: clamp(fallback.designation, 120, 'Researcher'),
        institute: clamp(fallback.institute, 200, 'IRIS Network Member'),
        orcid: clamp(fallback.orcid, 32, ''),
        avatarInitials: clamp(fallback.avatarInitials, 4, 'IR'),
        themePreference: theme,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, userDocPath);
  }
}

function mapDocToAMRReport(id: string, data: Record<string, unknown>): AMRReport {
  return {
    id,
    authorId: typeof data.authorId === 'string' ? data.authorId : undefined,
    location: {
      state: String(data.state ?? ''),
      city: String(data.city ?? ''),
      siteName: String(data.siteName ?? ''),
    },
    latitude: typeof data.latitude === 'string' ? data.latitude : undefined,
    longitude: typeof data.longitude === 'string' ? data.longitude : undefined,
    date: String(data.date ?? ''),
    source: (data.source as SampleSource) || 'CLINICAL',
    dataType: (data.dataType as DataType) || 'AST_ONLY',
    organism: String(data.organism ?? 'Unknown isolate'),
    resistanceFlag: (data.resistanceFlag as 'HIGH' | 'MEDIUM' | 'LOW') || 'MEDIUM',
    summary: String(data.summary ?? ''),
    submittedBy: typeof data.submittedBy === 'string' ? data.submittedBy : undefined,
    submittedByInstitute: typeof data.submittedByInstitute === 'string' ? data.submittedByInstitute : undefined,
    standard: typeof data.standard === 'string' ? data.standard : undefined,
    fileName: typeof data.fileName === 'string' ? data.fileName : undefined,
    filePath: typeof data.filePath === 'string' ? data.filePath : undefined,
    visibility: (data.visibility as 'PUBLIC' | 'PRIVATE') || 'PUBLIC',
    status: (data.status as ReportStatus) || 'PENDING',
  };
}

export function subscribePublicReports(
  onData: (reports: AMRReport[]) => void,
  onError?: (err: Error) => void
): Unsubscribe {
  const path = 'reports';
  const q = query(
    collection(db, path),
    where('visibility', '==', 'PUBLIC'),
    where('status', '==', 'APPROVED')
  );
  return onSnapshot(
    q,
    (snapshot) => {
      const items = snapshot.docs.map((d) => mapDocToAMRReport(d.id, d.data() as Record<string, unknown>));
      items.sort((a, b) => b.date.localeCompare(a.date));
      onData(items);
    },
    (error) => {
      console.error('Public reports subscription error:', error.message);
      if (onError) onError(error);
    }
  );
}

export function subscribeUserReports(
  uid: string,
  onData: (reports: AMRReport[]) => void,
  onError?: (err: Error) => void
): Unsubscribe {
  const path = 'reports';
  const q = query(collection(db, path), where('authorId', '==', uid));
  return onSnapshot(
    q,
    (snapshot) => {
      const items = snapshot.docs.map((d) => mapDocToAMRReport(d.id, d.data() as Record<string, unknown>));
      items.sort((a, b) => b.date.localeCompare(a.date));
      onData(items);
    },
    (error) => {
      console.error('User reports subscription error:', error.message);
      if (onError) onError(error);
    }
  );
}

const MAX_REPORT_FILE_BYTES = 25 * 1024 * 1024;
const ALLOWED_REPORT_FILE_REGEX = /\.(csv|xlsx|txt|fasta|fastq|gz|pdf)$/i;

export function validateReportFile(file: File): void {
  if (file.size > MAX_REPORT_FILE_BYTES) {
    throw new Error('Uploaded file exceeds the 25 MB maximum size limit.');
  }
  if (!ALLOWED_REPORT_FILE_REGEX.test(file.name)) {
    throw new Error('Unsupported file format. Allowed formats: .csv, .xlsx, .txt, .fasta, .fastq, .gz, .pdf.');
  }
}

function sanitizeFileName(name: string): string {
  const base = name.split(/[/\\]/).pop() || 'dataset.txt';
  const cleaned = base.replace(/[^a-zA-Z0-9._-]/g, '_');
  return cleaned.slice(0, 180) || 'dataset.txt';
}

export interface CreateReportInput {
  state: string;
  city: string;
  siteName: string;
  latitude?: string;
  longitude?: string;
  date: string;
  source: SampleSource;
  dataType: DataType;
  standard: string;
  organism: string;
  resistanceFlag: 'HIGH' | 'MEDIUM' | 'LOW';
  summary: string;
  fileName?: string;
  file?: File | null;
  clinicalSampleType?: string;
  ph?: string;
  temperature?: string;
  cod?: string;
  visibility: 'PUBLIC' | 'PRIVATE';
}

export async function createReport(
  uid: string,
  userProfile: UserProfile,
  input: CreateReportInput
): Promise<AMRReport> {
  if (!auth.currentUser || auth.currentUser.uid !== uid) {
    throw new Error('You must be signed in to submit a report.');
  }
  if (!auth.currentUser.emailVerified) {
    throw new Error('Please verify your email address before submitting surveillance data.');
  }

  if (input.file) {
    validateReportFile(input.file);
  }

  const reportId = `R-${Date.now()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
  const reportPath = `reports/${reportId}`;
  const safeFileName = input.file ? sanitizeFileName(input.file.name) : '';

  const payload = {
    authorId: uid,
    submittedBy: clamp(userProfile.name, 120, 'Researcher'),
    submittedByInstitute: clamp(userProfile.institute, 200, ''),
    state: clamp(input.state, 80, 'Unknown'),
    city: clamp(input.city, 80, 'Unknown'),
    siteName: clamp(input.siteName, 120, input.city || 'Sampling Site'),
    latitude: clamp(input.latitude, 32, ''),
    longitude: clamp(input.longitude, 32, ''),
    date: clamp(input.date, 20, new Date().toISOString().slice(0, 10)),
    source: input.source,
    dataType: input.dataType,
    standard: clamp(input.standard, 80, 'CLSI M100 (2024)'),
    organism: clamp(input.organism, 120, 'Unclassified isolate'),
    resistanceFlag: input.resistanceFlag,
    summary: clamp(input.summary, 500, 'Surveillance data submitted.'),
    fileName: clamp(safeFileName || input.fileName, 200, ''),
    filePath: '',
    clinicalSampleType: clamp(input.clinicalSampleType, 80, ''),
    ph: clamp(input.ph, 20, ''),
    temperature: clamp(input.temperature, 20, ''),
    cod: clamp(input.cod, 20, ''),
    visibility: input.visibility,
    status: 'PENDING' as ReportStatus,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  try {
    await setDoc(doc(db, 'reports', reportId), payload);
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, reportPath);
  }

  let storedFilePath = '';
  if (input.file) {
    storedFilePath = `reports/${reportId}/${safeFileName}`;
    try {
      const storageRef = ref(storage, storedFilePath);
      await uploadBytes(storageRef, input.file, {
        contentType: input.file.type || 'application/octet-stream',
      });
      await updateDoc(doc(db, 'reports', reportId), {
        filePath: storedFilePath,
        updatedAt: serverTimestamp(),
      });
    } catch (uploadError) {
      // Roll back report record if file upload fails so no broken metadata remains
      await deleteDoc(doc(db, 'reports', reportId)).catch(() => {});
      const message =
        uploadError instanceof Error
          ? uploadError.message
          : 'Failed to upload dataset file to storage.';
      throw new Error(`File upload failed: ${message}`);
    }
  }

  return {
    id: reportId,
    authorId: uid,
    location: {
      state: payload.state,
      city: payload.city,
      siteName: payload.siteName,
    },
    latitude: payload.latitude || undefined,
    longitude: payload.longitude || undefined,
    date: payload.date,
    source: payload.source,
    dataType: payload.dataType,
    organism: payload.organism,
    resistanceFlag: payload.resistanceFlag,
    summary: payload.summary,
    submittedBy: payload.submittedBy,
    submittedByInstitute: payload.submittedByInstitute,
    standard: payload.standard,
    fileName: payload.fileName,
    filePath: storedFilePath || undefined,
    visibility: payload.visibility,
    status: 'PENDING',
  };
}

export async function deleteUserReport(reportId: string, filePath?: string): Promise<void> {
  const reportPath = `reports/${reportId}`;
  if (filePath) {
    try {
      await deleteObject(ref(storage, filePath));
    } catch {
      // Ignore missing storage object errors when deleting report metadata
    }
  }
  try {
    await deleteDoc(doc(db, 'reports', reportId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, reportPath);
  }
}
