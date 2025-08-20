# Database Backup & Storage Monitoring Usage Guide

This guide provides detailed instructions for using the GrabHealth database backup and storage monitoring system.

## Table of Contents
- [Quick Start](#quick-start)
- [Database Backup](#database-backup)
- [Storage Monitoring](#storage-monitoring)
- [Web Interface](#web-interface)
- [Email Notifications](#email-notifications)
- [Troubleshooting](#troubleshooting)
- [Best Practices](#best-practices)

## Quick Start

### 1. Initial Setup
```bash
cd apps/app-strapi

# Install dependencies (if not already installed)
pnpm install

# Test database connection
pnpm run test:db

# Set up automated backups (recommended)
pnpm run backup:setup
# Choose option 1 for daily backups at 2 AM

# Set up storage monitoring (recommended)
pnpm run monitor:setup
# Choose option 1 for hourly monitoring
```

### 2. Quick Commands
```bash
# Run backup now
pnpm run backup

# Check storage usage
pnpm run monitor:storage

# View recent backups
ls -la backups/

# Check logs
tail -f logs/storage-monitor.log
```

## Database Backup

### Manual Backup Operations

#### Full Backup (Database + Uploads)
```bash
pnpm run backup
```
This creates:
- Database backup: `backups/grabhealth_backup_YYYYMMDD_HHMMSS.sql.gz`
- Uploads backup: `backups/uploads/uploads_backup_YYYYMMDD_HHMMSS.tar.gz`

#### Database Only Backup
```bash
pnpm run backup:db
```
- Creates compressed SQL dump of your Neon PostgreSQL database
- Automatically maintains last 30 backups (configurable)
- Creates symlink `latest_backup.sql.gz` for easy access

#### Uploads Only Backup
```bash
pnpm run backup:uploads
```
- Backs up files from DigitalOcean Spaces (if configured)
- Falls back to local uploads directory
- Maintains last 10 upload backups

### Restore Operations

#### List Available Backups
```bash
ls -la backups/
```

#### Restore from Specific Backup
```bash
pnpm run restore:db grabhealth_backup_20241219_120000.sql.gz
```

#### Restore from Latest Backup
```bash
pnpm run restore:db latest
```

**Note**: Restore operations create a safety backup before proceeding.

### Automated Backup Scheduling

#### Set Up Automated Backups
```bash
pnpm run backup:setup
```

Options:
1. **Daily at specific time** (recommended)
   - Enter hour (0-23) for daily execution
   - Example: 2 for 2 AM daily

2. **Weekly on specific day**
   - Choose day and time

3. **Custom cron schedule**
   - Enter custom cron expression
   - Example: `0 */6 * * *` for every 6 hours

#### View Current Backup Schedule
```bash
crontab -l | grep backup
```

#### Remove Automated Backups
```bash
pnpm run backup:setup
# Choose option to remove
```

## Storage Monitoring

### Manual Storage Check
```bash
pnpm run monitor:storage
```
Shows:
- Current disk usage percentage
- Available space
- Sends alert if threshold exceeded

### Automated Monitoring Setup

#### Enable Monitoring
```bash
pnpm run monitor:setup
```

Frequency options:
1. **Every hour** (recommended for production)
2. **Every 30 minutes** (for critical systems)
3. **Every 15 minutes** (intensive monitoring)
4. **Every 5 minutes** (testing only)
5. **Custom schedule**

#### Storage Alert Configuration
Default settings in `.env`:
```bash
STORAGE_THRESHOLD=70      # Alert when disk usage reaches 70%
ADMIN_EMAIL=admin@nexstack.sg  # Email recipient for alerts
```

### How Storage Monitoring Works
1. Checks disk usage at scheduled intervals
2. When usage exceeds threshold (70% default):
   - Sends email alert to admin
   - Logs warning to file
   - Creates alert flag (prevents spam)
3. Only one alert sent per 24 hours
4. Alert clears when usage drops below threshold

## Web Interface

### Access Server Settings
1. Login to GrabHealth app as admin
2. Navigate to: `https://yourapp.com/settings/server`
3. Or click "Server Settings" in user menu

### Features Available

#### Storage Status Panel
- Real-time disk usage visualization
- Progress bar with color coding
- Detailed disk information
- Last update timestamp

#### Storage Monitoring Settings
- Enable/disable monitoring
- Adjust alert threshold (1-100%)
- Set monitoring frequency
- Configure admin email

#### Backup Configuration
- Set backup schedule
- Adjust retention days
- Run manual backup
- View recent backups with sizes

### Making Changes
1. Modify settings as needed
2. Click "Save Settings"
3. Changes apply immediately
4. Cron jobs update automatically

## Email Notifications

### Email Configuration
Emails are sent via Mailgun (already configured in your `.env`):
```bash
MAILGUN_API_KEY=your-key
MAILGUN_DOMAIN=nexstack.sg
MAILGUN_FROM_EMAIL=noreply@nexstack.sg
ADMIN_EMAIL=admin@nexstack.sg
```

### Email Alert Contents
When storage exceeds threshold, admin receives:
- Current usage percentage
- Disk space details
- Recommendations for cleanup
- Quick action commands
- Server identification
- Timestamp

### Multiple Recipients
To send alerts to multiple emails, use comma separation:
```bash
ADMIN_EMAIL=admin@nexstack.sg,tech@nexstack.sg,ops@nexstack.sg
```

### Testing Email Alerts
```bash
# Temporarily lower threshold to trigger alert
echo "STORAGE_THRESHOLD=1" >> .env
pnpm run monitor:storage
# Remember to restore original threshold
```

## Troubleshooting

### Common Issues and Solutions

#### Backup Fails
```bash
# 1. Test database connection
pnpm run test:db

# 2. Check PostgreSQL client
pg_dump --version
# If missing, install: brew install postgresql

# 3. Verify credentials
cat .env | grep DATABASE_

# 4. Check logs
tail -50 backups/backup.log
```

#### No Email Alerts
```bash
# 1. Verify email configuration
cat .env | grep -E "MAILGUN|ADMIN_EMAIL"

# 2. Test monitoring manually
pnpm run monitor:storage

# 3. Check alert flag
ls -la .storage-alert-sent
# Remove if stuck: rm .storage-alert-sent

# 4. Review logs
tail -f logs/storage-monitor.log
```

#### Cron Jobs Not Running
```bash
# 1. Check if cron is running
service cron status
# or
ps aux | grep cron

# 2. View cron logs
grep CRON /var/log/syslog

# 3. Test script manually
./scripts/monitor-storage.sh

# 4. Check permissions
ls -la scripts/*.sh
# Fix if needed: chmod +x scripts/*.sh
```

#### Storage Status Not Updating
```bash
# 1. Check status file
cat storage-status.json

# 2. Run manual update
pnpm run monitor:storage

# 3. Verify disk commands work
df -h /
```

## Best Practices

### 1. Backup Strategy
- **Daily backups**: Minimum recommendation
- **Multiple backups**: Before major updates
- **Test restores**: Monthly verification
- **Off-site copies**: Weekly to external storage

### 2. Storage Management
- **Keep 30% free**: Optimal performance
- **Regular cleanup**: Remove old logs/temp files
- **Monitor trends**: Watch for rapid growth
- **Plan ahead**: Upgrade before critical

### 3. Monitoring Configuration
- **Production**: Hourly checks minimum
- **Staging**: Daily checks sufficient
- **Threshold**: 70% for early warning
- **Email list**: Multiple recipients for redundancy

### 4. Security Considerations
- **Backup encryption**: For sensitive data
- **Access control**: Limit backup directory access
- **Secure transfer**: Use SCP/SFTP for off-site
- **Audit logs**: Review access regularly

### 5. Maintenance Schedule
```bash
# Weekly tasks
- Review backup logs
- Check storage trends
- Verify latest backups
- Clean old temp files

# Monthly tasks
- Test restore process
- Archive old backups
- Review email alerts
- Update documentation

# Quarterly tasks
- Capacity planning
- Performance review
- Security audit
- Disaster recovery drill
```

## Advanced Usage

### Custom Backup Retention
```bash
# Edit backup script
vi scripts/backup-database.sh
# Change MAX_BACKUPS=30 to desired value
```

### Manual Cleanup
```bash
# Remove backups older than 60 days
find backups/ -name "*.sql.gz" -mtime +60 -delete

# Clear logs older than 30 days
find logs/ -name "*.log" -mtime +30 -delete
```

### Backup to External Storage
```bash
# Example: Copy to external server
rsync -avz backups/ user@backup-server:/path/to/backups/

# Example: Upload to S3
aws s3 sync backups/ s3://your-bucket/grabhealth-backups/
```

### Monitor Multiple Disks
```bash
# Edit monitor script to check multiple mount points
vi scripts/monitor-storage.sh
# Add additional df checks for other partitions
```

## Integration with CI/CD

### Pre-deployment Backup
```yaml
# Example GitHub Actions
- name: Backup before deploy
  run: |
    ssh user@server 'cd /app && pnpm run backup'
```

### Post-deployment Verification
```bash
# Add to deployment script
pnpm run test:db
pnpm run monitor:storage
```

## Support and Help

### Getting Help
1. Check logs first: `logs/storage-monitor.log`
2. Review this documentation
3. Test components individually
4. Check system resources

### Useful Commands Reference
```bash
# Backup commands
pnpm run backup              # Full backup
pnpm run backup:db           # Database only
pnpm run backup:uploads      # Uploads only
pnpm run restore:db [file]   # Restore database
pnpm run backup:setup        # Configure automation

# Monitoring commands
pnpm run monitor:storage     # Check storage now
pnpm run monitor:setup       # Configure monitoring
pnpm run test:db            # Test database

# Viewing status
tail -f logs/storage-monitor.log    # Live logs
ls -la backups/                     # List backups
cat storage-status.json             # Current status
crontab -l                          # View schedules
```

### Emergency Procedures

#### Disk Full Emergency
```bash
# 1. Clear old backups immediately
cd apps/app-strapi
rm backups/grabhealth_backup_*.sql.gz
# Keep only latest 5

# 2. Clear logs
truncate -s 0 logs/*.log

# 3. Clear temp files
rm -rf .tmp/* .cache/*

# 4. Check what's using space
du -sh * | sort -h
```

#### Restore Emergency
```bash
# 1. Stop application
pm2 stop app-strapi

# 2. Backup current state
pnpm run backup:db

# 3. Restore from known good backup
pnpm run restore:db grabhealth_backup_GOODDATE.sql.gz

# 4. Restart application
pm2 start app-strapi
```

---

Remember: Regular backups and monitoring are your best defense against data loss and system failures. Set up automation and let the system work for you!