# MongoDB Connection Fix Summary

## Problem
The application was throwing the error:
```
Error searching employees: Error: Invalid scheme, expected connection string to start with "mongodb://" or "mongodb+srv://"
```

## Root Causes
1. The MongoDB URI retrieved from Consul might have had leading/trailing whitespace or newline characters
2. There was no validation to ensure the connection string had the correct format
3. The error message didn't provide enough debugging information

## Fixes Applied

### 1. Enhanced `src/lib/consul.ts`
- **Added sanitization**: Trims whitespace and removes newlines from Consul values
- **Added validation**: Validates that MONGODB_URI starts with 'mongodb://' or 'mongodb+srv://'
- **Enhanced logging**: Added detailed logging to show raw vs sanitized values and value length
- **Better error messages**: Shows what the actual value starts with when validation fails

### 2. Enhanced `src/lib/mongodb.ts`
- **Added pre-connection validation**: Validates URI format before attempting connection
- **Better error messages**: Shows the actual value received when format is invalid
- **Catches errors early**: Prevents MongoDB connection attempts with invalid URIs

## How to Use with Consul

### Option 1: Use Environment Variable (Recommended for Testing)
Set the `MONGODB_URI` in your `.env.local` file:
```env
MONGODB_URI=mongodb://Username:Password@Host:Port/DBName
```

### Option 2: Connect to Remote Consul via VPN
Set the Consul connection environment variables:
```env
CONSUL_HOST=<your-consul-server-ip>
CONSUL_PORT=8500
CONSUL_TOKEN=<your-consul-token-if-required>
```

Then run the application. The system will:
1. Try to connect to Consul at the specified host
2. Retrieve MONGODB_URI from: `new-config/support-device-checker/setting/MONGODB_URI`
3. Sanitize and validate the connection string
4. Fall back to .env.local if Consul is unavailable

## Testing

### Test MongoDB Connection Format
```bash
node test-mongodb-connection.js
```

### Test Consul Retrieval
```bash
# Set Consul host first
export CONSUL_HOST=<your-consul-server-ip>
node test-consul.js
```

## What the Fixes Do

1. **When retrieving from Consul:**
   - Fetches the value and decodes from base64
   - Trims whitespace and removes newlines
   - Validates the format starts with mongodb:// or mongodb+srv://
   - Logs detailed information for debugging

2. **When connecting to MongoDB:**
   - Validates the URI format before attempting connection
   - Provides clear error messages if format is invalid
   - Only attempts connection with properly formatted URIs

## Troubleshooting

If you still see the error:

1. **Check Consul is accessible:**
   ```bash
   export CONSUL_HOST=<your-consul-ip>
   node test-consul.js
   ```

2. **Verify the value in Consul:**
   - Log into Consul UI
   - Navigate to: `new-config/support-device-checker/setting/MONGODB_URI`
   - Ensure the value is a valid MongoDB connection string
   - Make sure there's no extra whitespace

3. **Check environment variable fallback:**
   - If Consul is unavailable, the system will use `MONGODB_URI` from `.env.local`
   - Update `.env.local` with the correct connection string

## Next Steps

1. Set the correct `CONSUL_HOST` environment variable to point to your Consul server
2. Restart your development server
3. The application will now properly handle the MongoDB connection string