# Environment Configuration Guide

## Quick Setup

This guide helps you configure IP addresses across the Zenpark application.

## 📱 Mobile App Configuration

### Step 1: Find Your IP Address

**Windows:**

```bash
ipconfig
```

Look for `IPv4 Address` (e.g., 192.168.1.5)

**Mac/Linux:**

```bash
ifconfig
# or
ip addr
```

### Step 2: Update Mobile App Config

Open `config.ts` in the root directory and update the IP addresses:

```typescript
// Change these to YOUR machine's IP address
export const API_BASE_URL = 'http://YOUR_IP_HERE:8001';
export const YOLO_BASE_URL = 'http://YOUR_IP_HERE:8003';
export const WS_BASE_URL = 'ws://YOUR_IP_HERE:8003';
```

**Example:**

```typescript
export const API_BASE_URL = 'http://192.168.0.105:8001';
export const YOLO_BASE_URL = 'http://192.168.0.105:8003';
export const WS_BASE_URL = 'ws://192.168.0.105:8003';
```

### Alternative: Using .env file

The `.env` file in the root directory is provided for reference. To use it:

1. Install react-native-dotenv:

```bash
npm install react-native-dotenv
```

2. Update `babel.config.js`:

```javascript
module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    [
      'module:react-native-dotenv',
      {
        moduleName: '@env',
        path: '.env',
      },
    ],
  ],
};
```

3. Create `types/env.d.ts`:

```typescript
declare module '@env' {
  export const API_BASE_URL: string;
  export const YOLO_BASE_URL: string;
  export const WS_BASE_URL: string;
}
```

4. Update `config.ts` to import from @env

## 🖥️ Backend Configuration

### Main Backend (zenpark-backend)

Edit `zenpark-backend/.env`:

```env
MONGO_URI="your_mongodb_connection_string"
MYSQL_HOST="localhost"
MYSQL_USER="root"
MYSQL_PASSWORD="root"
MYSQL_DATABASE="project_zenpark"

HOST="0.0.0.0"
PORT=8001
```

Start the server:

```bash
cd zenpark-backend
uvicorn main:app --host 0.0.0.0 --port 8001 --reload
```

### YOLO Service

Edit `YOLO/.env`:

```env
DB_HOST="localhost"
DB_USER="root"
DB_PASSWORD="root"
DB_NAME="project_zenpark"

HOST="0.0.0.0"
PORT=8003
```

Start YOLO detection service:

```bash
cd YOLO
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

Start YOLO WebSocket service:

```bash
cd YOLO
uvicorn main_db:app --host 0.0.0.0 --port 8003 --reload
```

## 🔧 Testing Your Configuration

### 1. Test Backend APIs

**Main Backend:**

```bash
curl http://YOUR_IP:8001/
```

**YOLO Service:**

```bash
curl http://YOUR_IP:8003/parking-status
```

### 2. Test Mobile App

1. Make sure your phone and computer are on the same WiFi network
2. Update the IP addresses in `config.ts`
3. Rebuild the app:

   ```bash
   # Android
   npm run android

   # iOS
   npm run ios
   ```

## 🚨 Troubleshooting

### Cannot connect from mobile to backend

1. **Firewall:** Disable firewall temporarily or allow ports 8001, 8003
   - Windows: `netsh advfirewall firewall add rule name="Zenpark" dir=in action=allow protocol=TCP localport=8001,8003`
2. **Same Network:** Ensure phone and computer are on the same WiFi

3. **Correct IP:** Double-check IP address matches your machine

4. **Server Running:** Verify backend services are running on 0.0.0.0

### WebSocket connection fails

1. Check YOLO service is running on port 8003
2. Verify WS_BASE_URL uses `ws://` not `http://`
3. Check firewall allows WebSocket connections

### Database connection issues

1. Ensure MySQL is running: `mysql -u root -p`
2. Verify database exists: `SHOW DATABASES;`
3. Check credentials in `.env` files

## 📊 Configuration Checklist

- [ ] Found your machine's IP address
- [ ] Updated `config.ts` with correct IP
- [ ] Updated `zenpark-backend/.env` if needed
- [ ] Updated `YOLO/.env` if needed
- [ ] Started Main Backend (port 8001)
- [ ] Started YOLO WebSocket service (port 8003)
- [ ] Started YOLO detection service (port 8000)
- [ ] MySQL database is running
- [ ] MongoDB connection is working
- [ ] Phone and computer on same network
- [ ] Firewall ports 8001, 8003 are open
- [ ] Rebuilt mobile app after config changes

## 📱 Mobile App Rebuild

After changing configuration, always rebuild:

```bash
# Clear Metro bundler cache
npm start -- --reset-cache

# Rebuild Android
npm run android

# Rebuild iOS (Mac only)
npm run ios
```

## 🔄 Configuration Files Reference

| File                   | Purpose              | What to Change             |
| ---------------------- | -------------------- | -------------------------- |
| `config.ts`            | Mobile app API URLs  | IP addresses and ports     |
| `.env`                 | Mobile app reference | Template for future use    |
| `zenpark-backend/.env` | Main backend config  | Database credentials, port |
| `YOLO/.env`            | YOLO service config  | Database credentials, port |

## 💡 Best Practices

1. **Development:** Use IP addresses for local network testing
2. **Production:** Use domain names with HTTPS
3. **Security:** Never commit `.env` files with production credentials
4. **Testing:** Test on actual device, not just emulator
5. **Debugging:** Use `logConfig()` from config.ts to verify URLs

## Example Complete Setup

```bash
# 1. Get IP address
ipconfig  # Found: 192.168.1.100

# 2. Update config.ts
# Change all IPs to 192.168.1.100

# 3. Start backends
cd zenpark-backend
uvicorn main:app --host 0.0.0.0 --port 8001 --reload

# In another terminal
cd YOLO
uvicorn main_db:app --host 0.0.0.0 --port 8003 --reload

# 4. Rebuild mobile app
npm start -- --reset-cache
npm run android

# 5. Test
# Open app on phone
# Check parking status loads
# Verify approvals work
```

## 🎯 Quick Test Commands

```bash
# Test Main Backend
curl http://192.168.1.100:8001/user/test123

# Test YOLO Service
curl http://192.168.1.100:8003/parking-status

# Check WebSocket (using websocat or similar)
websocat ws://192.168.1.100:8003/ws/plates
```

## 📞 Support

If you encounter issues:

1. Check all services are running: `netstat -an | findstr ":8001 :8003"`
2. Verify IP is correct: `ipconfig`
3. Test localhost first: `curl http://localhost:8001`
4. Check logs in backend terminals for errors

Remember: After any configuration change, restart the affected services and rebuild the mobile app!
