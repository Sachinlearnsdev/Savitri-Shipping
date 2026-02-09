# Production Deployment Checklist

## Environment Variables (MUST CHANGE)
- [ ] `JWT_SECRET` - Change to a strong random string (32+ chars). Generate with: `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"`
- [ ] `JWT_REFRESH_SECRET` - Change to a different strong random string (32+ chars)
- [ ] `DATABASE_URL` - Use production MongoDB Atlas connection string with IP whitelist
- [ ] `SMTP_USER` / `SMTP_PASS` - Use production email service (not test account)
- [ ] `CLOUDINARY_CLOUD_NAME` / `CLOUDINARY_API_KEY` / `CLOUDINARY_API_SECRET` - Verify production Cloudinary account
- [ ] `FRONTEND_URL` - Set to actual public site domain (e.g., `https://savitrishipping.in`)
- [ ] `ADMIN_URL` - Set to actual admin panel domain (e.g., `https://admin.savitrishipping.in`)
- [ ] `BACKEND_URL` - Set to actual API domain (e.g., `https://api.savitrishipping.in`)
- [ ] `NODE_ENV=production`
- [ ] `ENABLE_LOGS=false` (or configure proper logging service)

## Security
- [ ] Enable HTTPS (SSL certificate via Let's Encrypt or similar)
- [ ] Update CORS origins to production domains only (remove localhost)
- [ ] Verify secure cookie flags are active (`httpOnly`, `secure`, `sameSite`) - already configured in `src/utils/jwt.js` for production
- [ ] Change default admin password (`singhsachin09820@gmail.com` / `Test@1234`)
- [ ] Remove master OTP fallback for SMS (set `SMS_SERVICE` to actual provider, not `master`)
- [ ] Verify rate limiting is active (configured in `src/app.js`)
- [ ] Request body size limits are set to 10MB (configured in `src/app.js`)
- [ ] Helmet security headers are active (configured in `src/app.js`)
- [ ] Review `ADDITIONAL_CORS_ORIGINS` - remove any development origins

## SMS Provider Setup
- [ ] Register with TRAI DLT portal (mandatory for India)
- [ ] Get entity ID and sender ID approved
- [ ] Configure SMS provider (MSG91 / Twilio / AWS SNS)
- [ ] Register message templates with DLT (OTP templates)
- [ ] Update environment variables:
  - `SMS_SERVICE` - Set to provider name (e.g., `msg91`)
  - `MSG91_API_KEY` - Set API key from provider
- [ ] Remove or disable `SMS_MASTER_OTP` (the `123456` fallback)
- [ ] Test OTP delivery on real phone numbers

## Database
- [ ] Enable MongoDB Atlas backups (daily automated snapshots)
- [ ] Set up monitoring and alerts in Atlas dashboard
- [ ] Review and create database indexes:
  - `SpeedBoatBooking`: compound index on `{ date: 1, status: 1 }`
  - `Customer`: index on `{ email: 1 }`, `{ phone: 1 }`
  - `OTP`: TTL index on `{ expiresAt: 1 }` (auto-expire)
  - `AdminSession` / `CustomerSession`: TTL index on `{ expiresAt: 1 }`
- [ ] Set up connection pooling (default Mongoose pool size is usually sufficient)
- [ ] Configure IP whitelist in MongoDB Atlas (restrict to server IP only)
- [ ] Test database backup and restore procedures

## Email
- [ ] Set up production email service (SendGrid, AWS SES, or dedicated SMTP)
- [ ] Verify sender domain (SPF, DKIM, DMARC records)
- [ ] Update `EMAIL_FROM` to use production domain
- [ ] Test all email templates:
  - Customer OTP verification
  - Admin OTP login
  - Password reset
  - Booking confirmation
  - Booking cancellation
  - Payment proof upload notification

## Monitoring
- [ ] Set up error tracking (Sentry, LogRocket, or similar)
- [ ] Configure uptime monitoring (UptimeRobot, Pingdom, or similar)
- [ ] Set up log aggregation (CloudWatch, Datadog, or PM2 logs)
- [ ] Configure alerts for:
  - Server errors (5xx responses)
  - High response times (> 2s)
  - Database connection failures
  - Memory usage > 80%
  - Disk usage > 80%

## Deployment
- [ ] Set up CI/CD pipeline (GitHub Actions, GitLab CI, etc.)
- [ ] Configure auto-scaling if needed (PM2 cluster mode or container orchestration)
- [ ] Set up staging environment for testing before production
- [ ] Configure process manager (PM2 recommended):
  ```bash
  pm2 start src/server.js --name savitri-api -i max
  pm2 save
  pm2 startup
  ```
- [ ] Set up reverse proxy (Nginx recommended):
  - SSL termination
  - Gzip compression
  - Static file caching
  - Rate limiting at proxy level
- [ ] Configure environment-specific `.env` files (never commit production `.env`)

## Frontend Deployment
- [ ] Build admin panel: `cd savitri-admin && npm run build`
- [ ] Build public site: `cd savitri-public && npm run build`
- [ ] Configure CDN for static assets (CloudFront, Cloudflare, etc.)
- [ ] Set up proper caching headers for static files
- [ ] Update API base URLs in frontend environment configs
- [ ] Test all pages and flows after deployment

## Post-Deployment Verification
- [ ] Verify health check endpoint: `GET /health`
- [ ] Test admin login flow (email + OTP)
- [ ] Test customer registration and login
- [ ] Test speed boat booking flow end-to-end
- [ ] Test party boat booking/inquiry flow
- [ ] Test payment proof upload
- [ ] Verify email delivery (OTP, booking confirmations)
- [ ] Test SMS OTP delivery (if configured)
- [ ] Check CORS is working correctly (no blocked requests)
- [ ] Verify Cloudinary image upload
- [ ] Run through all admin panel pages
- [ ] Test on mobile devices (responsive design)
- [ ] Check browser console for any errors
