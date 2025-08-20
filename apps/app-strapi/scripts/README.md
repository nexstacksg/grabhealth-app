# GrabHealth Strapi Backup Scripts

This directory contains backup and restore scripts for the GrabHealth Strapi application.

## Prerequisites

1. **PostgreSQL client tools** (for database backups):
   ```bash
   # macOS
   brew install postgresql

   # Ubuntu/Debian
   sudo apt-get install postgresql-client
   ```

2. **s3cmd** (only if using DigitalOcean Spaces for uploads):
   ```bash
   # macOS
   brew install s3cmd

   # Ubuntu/Debian
   sudo apt-get install s3cmd
   ```

## Available Scripts

### 1. `backup-database.sh`
Backs up the PostgreSQL database to a compressed SQL file.

```bash
./backup-database.sh
```

Features:
- Creates timestamped backups
- Compresses backups with gzip
- Automatically removes old backups (keeps last 30 by default)
- Creates a `latest_backup.sql.gz` symlink

### 2. `restore-database.sh`
Restores the database from a backup file.

```bash
# Restore from specific backup
./restore-database.sh grabhealth_backup_20241219_120000.sql.gz

# Restore from latest backup
./restore-database.sh latest
```

Features:
- Lists available backups if no file specified
- Creates a safety backup before restore
- Handles compressed backups automatically

### 3. `backup-uploads.sh`
Backs up upload files (from DigitalOcean Spaces or local storage).

```bash
./backup-uploads.sh
```

Features:
- Downloads files from DigitalOcean Spaces if configured
- Creates tar.gz archives of uploads
- Keeps last 10 upload backups by default

### 4. `backup-all.sh`
Performs a complete backup (database + uploads).

```bash
./backup-all.sh
```

### 5. `setup-cron-backup.sh`
Sets up automated backups using cron.

```bash
./setup-cron-backup.sh
```

Options:
- Daily backups at custom times
- Weekly backups
- Custom cron schedules

### 6. `monitor-storage.sh`
Monitors disk usage and sends email alerts when threshold is reached.

```bash
./monitor-storage.sh
```

Features:
- Checks disk usage percentage
- Sends email alerts when usage exceeds threshold (default 70%)
- Creates status file for API access
- Prevents duplicate alerts within 24 hours
- Logs all monitoring activities

### 7. `setup-storage-monitor.sh`
Sets up automated storage monitoring using cron.

```bash
./setup-storage-monitor.sh
```

Options:
- Every hour (recommended)
- Every 30 minutes
- Every 15 minutes
- Every 5 minutes (for testing)
- Custom cron schedule

### 8. `test-db-connection.sh`
Tests database connectivity and shows basic information.

```bash
./test-db-connection.sh
```

Features:
- Verifies database connection
- Shows database size
- Lists table count
- Useful for troubleshooting

## Backup Locations

All backups are stored in:
- Database backups: `apps/app-strapi/backups/`
- Upload backups: `apps/app-strapi/backups/uploads/`
- Backup logs: `apps/app-strapi/backups/backup.log`

## Configuration

You can customize backup behavior with environment variables:

```bash
# Maximum number of backups to keep
export MAX_BACKUPS=30  # for database
export MAX_BACKUPS=10  # for uploads

# Custom backup directory
export BACKUP_DIR=/path/to/backup/directory

# Storage monitoring settings
export STORAGE_THRESHOLD=70     # Alert when disk usage reaches 70%
export ADMIN_EMAIL=admin@example.com
export SMTP_HOST=smtp.gmail.com
export SMTP_PORT=587
export SMTP_USER=your-email@gmail.com
export SMTP_PASS=your-app-password
```

## Manual Backup Process

1. **Full Backup**:
   ```bash
   cd apps/app-strapi/scripts
   ./backup-all.sh
   ```

2. **Database Only**:
   ```bash
   ./backup-database.sh
   ```

3. **Uploads Only**:
   ```bash
   ./backup-uploads.sh
   ```

## Restore Process

1. **List available backups**:
   ```bash
   ls -la ../backups/grabhealth_backup_*.sql.gz
   ```

2. **Restore database**:
   ```bash
   ./restore-database.sh grabhealth_backup_20241219_120000.sql.gz
   ```

## Automated Backups

To set up daily automated backups:

```bash
./setup-cron-backup.sh
```

This will guide you through setting up cron jobs for automatic backups.

## Important Notes

1. **Database Connection**: The scripts use environment variables from `.env` file for database connection.

2. **Permissions**: Make sure scripts are executable:
   ```bash
   chmod +x *.sh
   ```

3. **Storage Space**: Monitor available disk space as backups can consume significant storage.

4. **Security**: Backup files contain sensitive data. Ensure proper file permissions and consider encrypting backups for additional security.

5. **Testing**: Always test restore procedures in a non-production environment first.

## Troubleshooting

1. **Permission Denied**:
   ```bash
   chmod +x script-name.sh
   ```

2. **pg_dump not found**:
   Install PostgreSQL client tools (see Prerequisites).

3. **Connection refused**:
   Check database connection settings in `.env` file.

4. **Cron not working**:
   Check cron logs: `grep CRON /var/log/syslog`

## Best Practices

1. **Regular Backups**: Set up automated daily backups
2. **Off-site Storage**: Copy backups to external storage regularly
3. **Test Restores**: Periodically test the restore process
4. **Monitor Logs**: Check backup logs for any errors
5. **Retention Policy**: Adjust MAX_BACKUPS based on your needs