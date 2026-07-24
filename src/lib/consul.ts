import Consul from 'consul';

// Initialize Consul client
const consulHost = process.env.CONSUL_HOST || 'consul';
const consulPort = parseInt(process.env.CONSUL_PORT || '8500', 10);
const consulToken = process.env.CONSUL_TOKEN;

const consulClient = new Consul({
  host: consulHost,
  port: consulPort,
  ...(consulToken && { token: consulToken }),
});

// Configuration interface
export interface ConsulConfig {
  MONGODB_URI: string;
  MONGODB_DB_NAME?: string;
  EXTERNAL_AUTH_BASE_URL?: string;
  EXTERNAL_AUTH_LOGIN_BASE_URL?: string;
  EXTERNAL_AUTH_LOGIN_PATH?: string;
  EXTERNAL_AUTH_CREDENTIAL_CHECK_PATH?: string;
  EXTERNAL_AUTH_ATTENDANCE_BASE_URL?: string;
  EXTERNAL_ATTENDANCE_BASE_URL?: string;
  EXTERNAL_AUTH_USERS_PATH?: string;
  EXTERNAL_ATTENDANCE_USERS_PATH?: string;
  EXTERNAL_AUTH_PROFILE_PATH?: string;
  DEV_AUTH_VALIDATION_BASE_URL?: string;
  DEV_AUTH_LOGIN_BASE_URL?: string;
  DEV_AUTH_LOGIN_PATH?: string;
  DEV_AUTH_CREDENTIAL_CHECK_PATH?: string;
  DEV_AUTH_LOGIN_TOKEN_SOURCE?: string;
  DEV_AUTH_CREDENTIAL_TOKEN_SOURCE?: string;
  APP_SESSION_SECRET?: string;
  APP_AUTH_DEFAULT_ROLE?: string;
  APP_AUTH_AUTO_SYNC?: string;
  APP_AUTH_REQUIRED_ACCESS_SCOPE?: string;
}

// Cache for configuration
let configCache: Partial<ConsulConfig> | null = null;

function isProductionEnv(): boolean {
  return process.env.NODE_ENV === 'production';
}

function getEnvMongoUri(): string | null {
  const envUri = process.env.MONGODB_URI?.trim();
  return envUri || null;
}

function getEnvMongoDbName(): string | null {
  const envDbName = process.env.MONGODB_DB_NAME?.trim();
  return envDbName || null;
}

/**
 * Fetch a single value from Consul KV store
 * @param key - The key to fetch (without prefix)
 * @returns The value or null if not found
 */
async function getKVValue(key: string): Promise<string | null> {
  try {
    const kvPath = `new-config/support-device-checker/setting/${key}`;
    const value = await consulClient.kv.get(kvPath);
    
    if (value && value.Value) {
      const decodedValue = Buffer.from(value.Value, 'base64').toString('utf-8');
      // Trim whitespace and remove newlines
      const sanitizedValue = decodedValue.trim().replace(/\n/g, '').replace(/\r/g, '');
      
      console.log(`✅ Fetched ${key} from Consul`);

      // Validate MongoDB URI format
      if (key === 'MONGODB_URI' && sanitizedValue) {
        if (!sanitizedValue.startsWith('mongodb://') && !sanitizedValue.startsWith('mongodb+srv://')) {
          console.error(`❌ Invalid MONGODB_URI format. Expected to start with 'mongodb://' or 'mongodb+srv://'`);
          console.error(`❌ Actual value starts with: '${sanitizedValue.substring(0, 20)}'`);
          return null;
        }
      }
      
      return sanitizedValue;
    }
    
    console.warn(`⚠️ Key ${key} not found in Consul`);
    return null;
  } catch (error) {
    console.error(`❌ Error fetching ${key} from Consul:`, error);
    return null;
  }
}

export async function getSettingValue(key: keyof ConsulConfig | string): Promise<string | null> {
  return getKVValue(String(key));
}

/**
 * Fetch all required configuration from Consul KV store
 * Development reads environment variables. Production reads Consul only.
 * @returns Configuration object
 */
export async function getConfig(): Promise<ConsulConfig> {
  // Return cached config if available
  if (configCache && configCache.MONGODB_URI) {
    return configCache as ConsulConfig;
  }

  const config: Partial<ConsulConfig> = {};

  if (!isProductionEnv()) {
    const envUri = getEnvMongoUri();
    const envDbName = getEnvMongoDbName();
    if (!envUri) {
      throw new Error('MONGODB_URI not found in environment variables for development');
    }

    console.log('📋 Development mode: using MONGODB_URI from environment variable');
    config.MONGODB_URI = envUri;
    if (envDbName) {
      console.log('📋 Development mode: using MONGODB_DB_NAME from environment variable');
      config.MONGODB_DB_NAME = envDbName;
    }
  } else {
    console.log('📡 Production mode: fetching MONGODB_URI from Consul...');

    const mongodbUri = await getKVValue('MONGODB_URI');
    if (!mongodbUri) {
      throw new Error('MONGODB_URI not found in Consul for production');
    }
    config.MONGODB_URI = mongodbUri;

    const dbName = await getKVValue('MONGODB_DB_NAME');
    if (dbName) {
      config.MONGODB_DB_NAME = dbName;
    }
  }

  // Cache the configuration
  configCache = config;

  console.log('✅ Configuration loaded successfully');
  return config as ConsulConfig;
}

/**
 * Clear the configuration cache
 * Useful for testing or when configuration might change
 */
export function clearConfigCache(): void {
  configCache = null;
}

/**
 * Check if Consul is accessible
 * @returns true if Consul is accessible, false otherwise
 */
export async function isConsulAvailable(): Promise<boolean> {
  try {
    await consulClient.agent.self();
    console.log('✅ Consul is accessible');
    return true;
  } catch (error) {
    console.warn('⚠️ Consul is not accessible');
    return false;
  }
}
