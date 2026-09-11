import 'dotenv/config';

export type StorageProvider = 'local' | 's3' | 'supabase';

const storageProvider = (process.env.STORAGE_PROVIDER || 'local').toLowerCase();
if (storageProvider !== 'local' && storageProvider !== 's3' && storageProvider !== 'supabase') {
  throw new Error('STORAGE_PROVIDER must be either local, s3, or supabase');
}

export const runtimeConfig = {
  storageProvider: storageProvider as StorageProvider,
  storageBucket: process.env.STORAGE_BUCKET || null,
  storageEndpoint: process.env.STORAGE_ENDPOINT || null,
  supabaseUrl: process.env.SUPABASE_URL || null,
  supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY || null,
  workerEnabled: process.env.WORKER_ENABLED === 'true',
  workerConcurrency: Math.max(1, Number(process.env.WORKER_CONCURRENCY || 1)),
  eoProcessingEnabled: process.env.EO_PROCESSING_ENABLED === 'true',
};

if (runtimeConfig.storageProvider === 's3' && (!runtimeConfig.storageBucket || !runtimeConfig.storageEndpoint)) {
  throw new Error('STORAGE_PROVIDER=s3 requires STORAGE_BUCKET and STORAGE_ENDPOINT');
}
if (runtimeConfig.storageProvider === 'supabase' && (!runtimeConfig.supabaseUrl || !runtimeConfig.supabaseKey || !runtimeConfig.storageBucket)) {
  throw new Error('STORAGE_PROVIDER=supabase requires SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY (or SUPABASE_KEY), and STORAGE_BUCKET');
}
