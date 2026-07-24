import { fetchAttendanceUsersPage } from './external';
import { syncEmployeesFromAttendanceUsers, EmployeeSyncSummary } from './employee-sync';

export type EmployeeSyncJobStatus = 'queued' | 'running' | 'completed' | 'failed' | 'cancelled';

export interface EmployeeSyncJob {
  id: string;
  status: EmployeeSyncJobStatus;
  page: number;
  size: number;
  totalPages?: number;
  summary: EmployeeSyncSummary;
  error?: string;
  startedAt: string;
  updatedAt: string;
  completedAt?: string;
}

const jobs = new Map<string, EmployeeSyncJob>();

function createSummary(): EmployeeSyncSummary {
  return { created: 0, updated: 0, skipped: 0, failed: 0, errors: [] };
}

function mergeSummary(target: EmployeeSyncSummary, source: EmployeeSyncSummary) {
  target.created += source.created;
  target.updated += source.updated;
  target.skipped += source.skipped;
  target.failed += source.failed;
  target.errors.push(...source.errors.slice(0, 10));
}

function isRetryable(error: unknown) {
  const status = typeof error === 'object' && error && 'status' in error ? Number((error as { status: number }).status) : 0;
  return !status || status >= 500;
}

async function withRetry<T>(operation: () => Promise<T>, attempts = 3): Promise<T> {
  let lastError: unknown;
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      if (!isRetryable(error) || attempt === attempts) break;
      await new Promise((resolve) => setTimeout(resolve, 300 * attempt));
    }
  }
  throw lastError;
}

function updateJob(job: EmployeeSyncJob, patch: Partial<EmployeeSyncJob>) {
  Object.assign(job, patch, { updatedAt: new Date().toISOString() });
}

function isCancelled(job: EmployeeSyncJob) {
  return job.status === 'cancelled';
}

async function runEmployeeSyncJob(job: EmployeeSyncJob, credentialToken: string) {
  updateJob(job, { status: 'running' });

  try {
    let page = 0;
    while (true) {
      if (isCancelled(job)) return;
      const result = await withRetry(() => fetchAttendanceUsersPage(credentialToken, page, job.size));
      if (isCancelled(job)) return;
      const summary = await syncEmployeesFromAttendanceUsers(result.users);
      mergeSummary(job.summary, summary);

      updateJob(job, {
        page,
        totalPages: result.totalPages,
      });

      const reachedTotalPages = result.totalPages !== undefined && page + 1 >= result.totalPages;
      const reachedLastFlag = result.last === true;
      const reachedShortPage = result.totalPages === undefined && result.users.length < job.size;

      if (reachedTotalPages || reachedLastFlag || reachedShortPage || result.users.length === 0) {
        break;
      }

      page += 1;
    }

    if (isCancelled(job)) return;
    updateJob(job, { status: 'completed', completedAt: new Date().toISOString() });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Gagal sinkronisasi employee';
    updateJob(job, {
      status: 'failed',
      error: message,
      completedAt: new Date().toISOString(),
      summary: {
        ...job.summary,
        failed: job.summary.failed + 1,
        errors: [...job.summary.errors, message].slice(0, 10),
      },
    });
  }
}

export function startEmployeeSyncJob(credentialToken: string, size = 100) {
  const now = new Date().toISOString();
  const job: EmployeeSyncJob = {
    id: crypto.randomUUID(),
    status: 'queued',
    page: 0,
    size,
    summary: createSummary(),
    startedAt: now,
    updatedAt: now,
  };

  jobs.set(job.id, job);
  void runEmployeeSyncJob(job, credentialToken);
  return job;
}

export function getEmployeeSyncJob(id: string) {
  return jobs.get(id) || null;
}

export function cancelEmployeeSyncJob(id: string) {
  const job = jobs.get(id);
  if (!job || !['queued', 'running'].includes(job.status)) return job || null;
  updateJob(job, { status: 'cancelled', completedAt: new Date().toISOString() });
  return job;
}
