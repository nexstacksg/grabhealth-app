# Production Setup Guide

This guide covers the essential configuration steps for deploying GrabHealth to production.

## Critical Environment Variables

### Backend (app-be) Configuration

When setting up the backend for production, ensure ALL the following environment variables are properly configured:

#### Required Cookie/HTTPS Settings

These variables are **CRITICAL** for proper authentication in production:

```env
# HTTPS Configuration (REQUIRED for production)
USE_HTTPS=true              # Must be true for HTTPS sites
COOKIE_SAME_SITE=lax       # Required for cross-subdomain cookie support

# Cookie Domain
COOKIE_DOMAIN=.grabhealth.ai   # Note the leading dot for subdomain support
```

**⚠️ WARNING**: Missing `USE_HTTPS=true` will cause authentication failures as browsers require the `secure` flag for cookies on HTTPS sites.

#### Complete Backend Environment Variables

```env
# Node Environment
NODE_ENV=production

# Server
PORT=4000

# Database (Production)
DATABASE_URL="postgresql://your-production-database-url"

# JWT Secrets (Generate with: openssl rand -base64 32)
JWT_SECRET=your-super-secret-jwt-key-min-32-chars-long
JWT_REFRESH_SECRET=your-super-secret-refresh-jwt-key
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@example.com
SMTP_PASS=your-app-password
EMAIL_FROM=noreply@grabhealth.ai

# CORS Origins (include all your domains)
CORS_ORIGIN=https://grabhealth.ai,https://www.grabhealth.ai,https://admin.grabhealth.ai,https://api.grabhealth.ai

# Cookie Configuration (CRITICAL)
COOKIE_DOMAIN=.grabhealth.ai
USE_HTTPS=true
COOKIE_SAME_SITE=lax

# Frontend URLs
FRONTEND_URL=https://grabhealth.ai
ADMIN_URL=https://admin.grabhealth.ai

# File Upload
UPLOAD_PATH=uploads
MAX_FILE_SIZE=5242880

# Security
BCRYPT_ROUNDS=10
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Redis (for caching/sessions)
REDIS_URL=redis://your-redis-url:6379
REDIS_TTL=3600

# Third-party Services
STRIPE_SECRET_KEY=your-stripe-key
STRIPE_WEBHOOK_SECRET=your-webhook-secret
OPENAI_API_KEY=your-openai-key

# Storage (DigitalOcean Spaces)
DO_SPACES_KEY=your-do-key
DO_SPACES_SECRET=your-do-secret
DO_SPACES_ENDPOINT=sgp1.digitaloceanspaces.com
DO_SPACES_REGION=sgp1
DO_SPACES_BUCKET=your-bucket
DO_SPACES_CDN_ENDPOINT=https://your-bucket.sgp1.digitaloceanspaces.com

# Email Service
MAIL_GUN_API_KEY=your-mailgun-key
MAILGUN_DOMAIN=your-domain.com
```

### Frontend (app-web) Configuration

```env
# API Configuration
NEXT_PUBLIC_API_URL=https://api.grabhealth.ai

# Third-party Services
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_SECRET=your-api-secret
OPENAI_API_KEY=your-openai-key
```

### Admin Dashboard (app-admin) Configuration

```env
# API Configuration
NEXT_PUBLIC_API_URL=https://api.grabhealth.ai
```

## Environment File Synchronization

**IMPORTANT**: The project uses dual environment file locations for deployment:

1. **Application directories**: `/apps/app-*/. env`
2. **Root deployment files**: `/root/.app-*.env`

When updating environment variables:
- If you modify `apps/app-web/.env` → also update `/root/.app-web.env`
- If you modify `apps/app-be/.env` → also update `/root/.app-be.env`
- If you modify `apps/app-admin/.env` → also update `/root/.app-admin.env`

## Deployment Steps

1. **Set Environment Variables**
   ```bash
   # Copy and edit environment files
   cp apps/app-be/.env.example apps/app-be/.env
   cp apps/app-web/.env.example apps/app-web/.env
   cp apps/app-admin/.env.example apps/app-admin/.env
   
   # Also copy to root deployment location
   cp apps/app-be/.env /root/.app-be.env
   cp apps/app-web/.env /root/.app-web.env
   cp apps/app-admin/.env /root/.app-admin.env
   ```

2. **Build Applications**
   ```bash
   pnpm install
   pnpm run build
   ```

3. **Run Database Migrations**
   ```bash
   cd apps/app-be
   bun run prisma:migrate
   ```

4. **Start with PM2**
   ```bash
   pm2 start ecosystem.config.js
   pm2 save
   pm2 startup
   ```

## Common Production Issues

### 1. Authentication/Cookie Issues

**Symptoms**: 
- Users can't stay logged in
- Authentication fails after redirect
- Cookies not being set

**Solution**: Ensure these variables are set in backend:
```env
USE_HTTPS=true
COOKIE_SAME_SITE=lax
COOKIE_DOMAIN=.yourdomain.com  # Note the leading dot
```

### 2. CORS Errors

**Symptoms**: 
- API calls blocked by CORS
- "Access-Control-Allow-Origin" errors

**Solution**: Update `CORS_ORIGIN` to include all your domains:
```env
CORS_ORIGIN=https://yourdomain.com,https://www.yourdomain.com,https://api.yourdomain.com,https://admin.yourdomain.com
```

### 3. Database Connection Issues

**Solution**: Ensure your production database URL includes SSL:
```env
DATABASE_URL="postgresql://user:pass@host/db?sslmode=require"
```

## Health Checks

After deployment, verify:

1. **API Health**: `curl https://api.yourdomain.com/api/v1/health`
2. **Frontend**: Visit https://yourdomain.com
3. **Admin**: Visit https://admin.yourdomain.com
4. **Authentication**: Test login/logout flow
5. **Cookies**: Check browser DevTools to ensure cookies are set with `Secure` and `SameSite=Lax`

## PM2 Management

```bash
# View status
pm2 status

# View logs
pm2 logs

# Restart all
pm2 restart all

# Restart with updated env vars
pm2 restart all --update-env
```

## Security Checklist

- [ ] All JWT secrets are unique and strong
- [ ] Database uses SSL connection
- [ ] Redis password is set (if exposed)
- [ ] Rate limiting is configured
- [ ] CORS origins are restricted to your domains
- [ ] File upload size limits are set
- [ ] All API keys are kept secret
- [ ] HTTPS is enforced (`USE_HTTPS=true`)
- [ ] Cookies use secure settings