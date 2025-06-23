# Email Configuration Guide

## Production Email Setup

### Issue: Registration takes 30+ seconds and emails are not being received

This is typically caused by:
1. Incorrect SMTP credentials
2. Firewall blocking SMTP ports
3. Email provider security settings

## Solutions

### 1. For Gmail SMTP

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-specific-password
EMAIL_FROM=noreply@grabhealth.ai
```

**Important:** You must use an App-Specific Password, not your regular Gmail password:
1. Go to https://myaccount.google.com/apppasswords
2. Generate a new app password for "Mail"
3. Use this 16-character password as SMTP_PASS

### 2. For SendGrid (Recommended for Production)

```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=apikey
SMTP_PASS=your-sendgrid-api-key
EMAIL_FROM=noreply@grabhealth.ai
```

### 3. For Other SMTP Providers

Check your provider's documentation for:
- SMTP host and port
- Authentication requirements
- TLS/SSL settings

## Testing Email Configuration

1. **Local Testing:**
   ```bash
   curl -X POST http://localhost:4000/api/v1/auth/test-email \
     -H "Content-Type: application/json" \
     -d '{"email": "test@example.com"}'
   ```

2. **Check Logs:**
   - Look for "Email configuration:" logs showing your settings
   - Check for "Email sent successfully" or error messages
   - Verify SMTP credentials are set (will show "not configured" if missing)

## Common Issues

### 1. Connection Timeout
- **Symptom:** Registration hangs for 30+ seconds
- **Solution:** Check firewall rules for ports 587/465
- **AWS/Cloud:** Security groups must allow outbound SMTP

### 2. Authentication Failed
- **Symptom:** "Invalid credentials" error in logs
- **Solution:** Verify SMTP_USER and SMTP_PASS are correct
- **Gmail:** Must use app-specific password, not regular password

### 3. TLS/SSL Issues
- **Symptom:** "Self signed certificate" errors
- **Solution:** Already handled with `rejectUnauthorized: false` in production

## Monitoring

The updated code includes:
- 10-second timeout on email sending (prevents 30+ second hangs)
- Better error logging with configuration details
- Email sending doesn't block registration completion

## Emergency Workaround

If emails still fail in production:
1. Users can still register (account is created)
2. Admin can manually verify users in the database
3. Update user status from 'PENDING_VERIFICATION' to 'ACTIVE'
4. Clear emailVerificationCode and emailVerificationCodeExpires fields