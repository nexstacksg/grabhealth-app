# 🚀 Quick Reference - Backup & Monitoring

## 📋 Most Used Commands

```bash
# From apps/app-strapi directory:

# Backup Operations
pnpm run backup              # Full backup (DB + uploads)
pnpm run backup:db           # Database backup only
pnpm run restore:db latest   # Restore from latest backup

# Monitoring
pnpm run monitor:storage     # Check disk usage now
pnpm run test:db            # Test database connection

# Setup (run once)
pnpm run backup:setup       # Enable daily backups
pnpm run monitor:setup      # Enable storage alerts
```

## 🎯 Quick Setup (First Time)

```bash
cd apps/app-strapi
pnpm install                # Install dependencies
pnpm run backup:setup       # Choose option 1 (daily)
pnpm run monitor:setup      # Choose option 1 (hourly)
```

## 📧 Email Alerts

- **Recipient**: admin@nexstack.sg
- **Trigger**: Disk usage > 70%
- **Frequency**: Max once per 24 hours

## 📂 Important Locations

```bash
backups/                    # All backup files
├── *.sql.gz              # Database backups
└── uploads/*.tar.gz       # Upload backups

logs/storage-monitor.log    # Monitoring logs
storage-status.json        # Current disk status
```

## 🔍 Check Status

```bash
# View recent backups
ls -la backups/ | tail -10

# Check current disk usage
df -h /

# View monitoring logs
tail -20 logs/storage-monitor.log

# See scheduled jobs
crontab -l
```

## 🚨 Emergency Commands

```bash
# Disk full - quick cleanup
rm backups/grabhealth_backup_*.sql.gz  # Remove old backups
truncate -s 0 logs/*.log                # Clear logs

# Failed backup - debug
pnpm run test:db                        # Test connection
tail -50 backups/backup.log             # Check errors

# Manual backup before risky operation
pnpm run backup:db                      # Quick DB backup
```

## 🌐 Web Interface

1. Login as admin
2. Go to `/settings/server`
3. Features:
   - View disk usage
   - Change alert threshold
   - Run manual backup
   - Update admin email

## 📝 Configuration

Current settings in `.env`:
```bash
ADMIN_EMAIL=admin@nexstack.sg
STORAGE_THRESHOLD=70
```

## ⏰ Default Schedule

- **Backups**: Daily at 2 AM
- **Monitoring**: Every hour
- **Retention**: 30 days for backups

## 💡 Tips

1. Test restore monthly: `pnpm run restore:db latest`
2. Keep 30% disk space free
3. Check logs weekly
4. Copy important backups off-site

---
Full documentation: `BACKUP_AND_MONITORING_USAGE.md`