# Docker HTTPS Setup Guide

This guide explains how to run the Night Sky Navigator with HTTPS support using Docker, which is essential for testing the AbsoluteOrientationSensor API and other modern web features.

## Quick Start

### Development with HTTPS

The recommended approach for development with HTTPS support:

```bash
# Option 1: Direct HTTPS development server
npm run setup-certs  # Generate certificates (if not already done)
npm run docker:dev    # Runs development server with HTTPS

# Option 2: HTTP server with HTTPS proxy (recommended for mobile testing)
npm run setup-certs  # Generate certificates 
npm run docker:dev-https  # Runs HTTP dev server behind HTTPS proxy
```

### Production with HTTPS

For production deployment with HTTPS:

```bash
npm run setup-certs  # Generate certificates for production
npm run docker:prod-https  # Runs production server with HTTPS
```

## Available Docker Services

### Development Services

| Service | Command | Ports | Description |
|---------|---------|-------|-------------|
| `dev` | `npm run docker:dev` | 3000 (HTTPS), 3001 | Direct HTTPS development server |
| `dev-http` | `npm run docker:dev-http` | 3000 (HTTP) | HTTP development server |
| `dev-https-proxy` | `npm run docker:dev-https` | 443 (HTTPS), 80 | HTTP dev server behind HTTPS proxy |

### Production Services

| Service | Command | Ports | Description |
|---------|---------|-------|-------------|
| `prod` | `npm run docker:prod` | 8080 (HTTP) | Standard production server |
| `prod-https` | `npm run docker:prod-https` | 443 (HTTPS), 80 | Production server with HTTPS |

## Certificate Management

### Automatic Certificate Generation

The Docker containers will automatically generate self-signed certificates if none are found:

```bash
# Certificates are automatically created in the certs/ directory
# No manual intervention required
```

### Manual Certificate Setup

If you prefer to generate certificates manually:

```bash
# Generate certificates locally
npm run setup-certs

# Or manually with openssl
mkdir -p certs
openssl req -x509 -newkey rsa:4096 -keyout certs/key.pem -out certs/cert.pem \
  -sha256 -days 365 -nodes \
  -subj "/C=US/ST=Dev/L=Dev/O=Dev/OU=Dev/CN=localhost"
```

### Using Custom Certificates

To use your own certificates:

1. Place your certificate files in the `certs/` directory:
   - `certs/cert.pem` (certificate)
   - `certs/key.pem` (private key)

2. Ensure proper permissions:
   ```bash
   chmod 644 certs/cert.pem
   chmod 600 certs/key.pem
   ```

## Architecture

### Development HTTPS Proxy Setup

```
Browser (HTTPS) → Nginx Proxy (443) → Vite Dev Server (3000)
```

- **Nginx Proxy**: Handles HTTPS termination and SSL certificates
- **Vite Dev Server**: Runs in HTTP mode for optimal development experience
- **Benefits**: Hot reload works perfectly, easier certificate management

### Direct HTTPS Development

```
Browser (HTTPS) → Vite Dev Server (3000 HTTPS)
```

- **Vite Dev Server**: Handles HTTPS directly with SSL certificates
- **Benefits**: Simpler setup, direct connection
- **Note**: Requires certificates to be available in container

## Mobile Device Testing

To test on mobile devices with HTTPS:

1. **Start the HTTPS proxy service:**
   ```bash
   npm run docker:dev-https
   ```

2. **Find your computer's IP address:**
   ```bash
   # Linux/macOS
   ip addr show | grep inet | grep -v 127.0.0.1
   
   # Windows
   ipconfig | findstr "IPv4"
   ```

3. **Access from mobile device:**
   ```
   https://YOUR_IP_ADDRESS
   ```
   Example: `https://192.168.1.100`

4. **Accept the self-signed certificate warning** on your mobile device

## Troubleshooting

### Certificate Issues

**Problem**: "SSL certificate error" or "NET::ERR_CERT_AUTHORITY_INVALID"
**Solution**: This is expected with self-signed certificates. Click "Advanced" → "Proceed to localhost (unsafe)" in Chrome, or similar in other browsers.

**Problem**: Certificates not found in container
**Solution**: Ensure the `certs/` directory exists and contains `cert.pem` and `key.pem` files.

### Port Conflicts

**Problem**: Port already in use
**Solution**: 
```bash
# Check what's using the port
lsof -i :443  # or :3000, :80, etc.

# Stop conflicting services or change ports in docker-compose.yml
```

### Hot Reload Not Working

**Problem**: Changes not reflected when using HTTPS proxy
**Solution**: The proxy setup should handle WebSocket connections correctly. If issues persist, use direct HTTPS development:
```bash
npm run docker:dev
```

## Environment Variables

You can customize the setup with environment variables:

```bash
# Custom certificate paths (relative to project root)
CERT_PATH=./my-certs/cert.pem
KEY_PATH=./my-certs/key.pem

# Custom ports
HTTPS_PORT=8443
HTTP_PORT=8080
```

## Security Considerations

### Development

- Self-signed certificates will show security warnings
- Certificates are valid for `localhost` only
- Do not use development certificates in production

### Production

- Use proper SSL certificates from a trusted CA
- Configure proper security headers
- Enable HSTS (Strict-Transport-Security)
- Consider using Let's Encrypt for free SSL certificates

## Integration with CI/CD

For automated testing with HTTPS:

```yaml
# Example GitHub Actions step
- name: Test with HTTPS
  run: |
    npm run setup-certs
    npm run docker:dev-https &
    sleep 10
    curl -k https://localhost/health
```

## Monitoring and Logs

View logs from the HTTPS services:

```bash
# View development proxy logs
docker compose logs dev-https-proxy -f

# View all services
docker compose logs -f

# View specific service
docker compose logs dev -f
```

## Performance Considerations

- **HTTPS Proxy**: Adds minimal overhead (~1-2ms latency)
- **Direct HTTPS**: Slightly faster but requires certificate management in container
- **Production**: Always use HTTPS in production for security and modern web features

## Summary

The HTTPS Docker setup enables:

✅ **AbsoluteOrientationSensor API** testing  
✅ **Service Worker** functionality  
✅ **Mobile device testing** over local network  
✅ **Modern web APIs** that require secure contexts  
✅ **Production-ready HTTPS** deployment  

Choose the setup that best fits your development workflow!