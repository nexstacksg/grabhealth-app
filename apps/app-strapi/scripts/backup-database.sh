#!/bin/bash

# Database Backup Script for GrabHealth Strapi
# This script creates backups of the PostgreSQL database

# Load environment variables
set -a
source "$(dirname "$0")/../.env"
set +a

# Configuration
BACKUP_DIR="${BACKUP_DIR:-$(dirname "$0")/../backups}"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILENAME="grabhealth_backup_${TIMESTAMP}.sql"
BACKUP_PATH="${BACKUP_DIR}/${BACKUP_FILENAME}"
MAX_BACKUPS=${MAX_BACKUPS:-30}  # Keep last 30 backups by default

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

echo -e "${YELLOW}Starting database backup...${NC}"
echo "Database: ${DATABASE_NAME}"
echo "Host: ${DATABASE_HOST}"
echo "Backup file: ${BACKUP_PATH}"

# Perform the backup using pg_dump
if PGPASSWORD="${DATABASE_PASSWORD}" pg_dump \
    -h "${DATABASE_HOST}" \
    -p "${DATABASE_PORT}" \
    -U "${DATABASE_USERNAME}" \
    -d "${DATABASE_NAME}" \
    --no-owner \
    --no-privileges \
    --clean \
    --if-exists \
    --verbose \
    > "${BACKUP_PATH}" 2>&1; then
    
    echo -e "${GREEN}✓ Database backup completed successfully${NC}"
    
    # Compress the backup
    echo -e "${YELLOW}Compressing backup...${NC}"
    gzip "${BACKUP_PATH}"
    BACKUP_PATH="${BACKUP_PATH}.gz"
    
    # Get file size
    BACKUP_SIZE=$(ls -lh "${BACKUP_PATH}" | awk '{print $5}')
    echo -e "${GREEN}✓ Backup compressed successfully (${BACKUP_SIZE})${NC}"
    
    # Clean up old backups
    echo -e "${YELLOW}Cleaning up old backups...${NC}"
    BACKUP_COUNT=$(ls -1 "${BACKUP_DIR}"/grabhealth_backup_*.sql.gz 2>/dev/null | wc -l)
    
    if [ "${BACKUP_COUNT}" -gt "${MAX_BACKUPS}" ]; then
        BACKUPS_TO_DELETE=$((BACKUP_COUNT - MAX_BACKUPS))
        ls -1t "${BACKUP_DIR}"/grabhealth_backup_*.sql.gz | tail -n "${BACKUPS_TO_DELETE}" | xargs rm -f
        echo -e "${GREEN}✓ Removed ${BACKUPS_TO_DELETE} old backup(s)${NC}"
    fi
    
    # Create a latest backup symlink
    ln -sf "${BACKUP_FILENAME}.gz" "${BACKUP_DIR}/latest_backup.sql.gz"
    
    echo -e "${GREEN}✓ Backup process completed!${NC}"
    echo "Backup location: ${BACKUP_PATH}"
    
else
    echo -e "${RED}✗ Database backup failed!${NC}"
    exit 1
fi