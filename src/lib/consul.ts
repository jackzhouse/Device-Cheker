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
interface ConsulConfig {
  MONGODB_URI: string;
}

// Cache for configuration
let configCache: Partial<ConsulConfig> | null = null;

/**
 * Fetch a single value from Consul KV store
 * @param key - The key to fetch (without prefix)
 * @returns The value or null if not found
 */
async function getKVValue(key: string): Promise<string | null> {
  try {
    const kvPath = `new-config/support-device-checker/setting/${key}`;
    const value = await consulClient.kv.get(kvPath);
    console.log(value)
    
    if (value && value.Value) {
      const decodedValue = Buffer.from(value.Value, 'base64').toString('utf-8');
      // Trim whitespace and remove newlines
      const sanitizedValue = decodedValue.trim().replace(/\n/g, '').replace(/\r/g, '');
      
      console.log(`✅ Fetched ${key} from Consul`);
      console.log(`📝 Raw value (first 100 chars):`, decodedValue.substring(0, 100));
      console.log(`📝 Sanitized value (first 100 chars):`, sanitizedValue.substring(0, 100));
      console.log(`📝 Value length: ${sanitizedValue.length}`);
      return value.Value
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

/**
 * Fetch all required configuration from Consul KV store
 * Falls back to environment variables if Consul is unavailable
 * @returns Configuration object
 */
export async function getConfig(): Promise<ConsulConfig> {
  // Return cached config if available
  if (configCache && configCache.MONGODB_URI) {
    return configCache as ConsulConfig;
  }

  console.log('📡 Fetching configuration from Consul...');

  const config: Partial<ConsulConfig> = {};

  // Try to fetch MONGODB_URI from Consul
  const mongodbUri = await getKVValue('MONGODB_URI');
  
  // Fallback to environment variable if Consul fetch fails
  if (!mongodbUri) {
    const envUri = process.env.MONGODB_URI;
    if (envUri) {
      console.log('📋 Using MONGODB_URI from environment variable');
      config.MONGODB_URI = envUri;
    } else {
      throw new Error('MONGODB_URI not found in Consul or environment variables');
    }
  } else {
    config.MONGODB_URI = mongodbUri;
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
    console.warn('⚠️ Consul is not accessible, will use environment variables');
    return false;
  }
}