const Consul = require('consul');

const consulClient = new Consul({
  host: process.env.CONSUL_HOST || 'consul',
  port: parseInt(process.env.CONSUL_PORT || '8500', 10),
  ...(process.env.CONSUL_TOKEN && { token: process.env.CONSUL_TOKEN }),
});

async function test() {
  try {
    const kvPath = 'new-config/support-device-checker/setting/MONGODB_URI';
    const value = await consulClient.kv.get(kvPath);
    
    if (value && value.Value) {
      const decodedValue = Buffer.from(value.Value, 'base64').toString('utf-8');
      console.log('✅ Successfully retrieved value from Consul');
      console.log('📝 Decoded value:', decodedValue);
      console.log('📝 Value length:', decodedValue.length);
      console.log('📝 First 10 chars:', decodedValue.substring(0, 10));
      console.log('📝 Last 10 chars:', decodedValue.substring(decodedValue.length - 10));
    } else {
      console.log('❌ Value not found in Consul');
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

test();
