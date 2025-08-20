#!/bin/bash

# Database Restore Script for GrabHealth Strapi
# This script restores the PostgreSQL database from a backup

# Load environment variables
set -a
source "$(dirname "$0")/../.env"
set +a

# Configuration
BACKUP_DIR="${BACKUP_DIR:-$(dirname "$0")/../backups}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to list available backups
list_backups() {
    echo -e "${BLUE}Available backups:${NC}"
    if ls -1 "${BACKUP_DIR}"/grabhealth_backup_*.sql.gz 2>/dev/null | head -20; then
        BACKUP_COUNT=$(ls -1 "${BACKUP_DIR}"/grabhealth_backup_*.sql.gz 2>/dev/null | wc -l)
        if [ "${BACKUP_COUNT}" -gt 20 ]; then
            echo -e "${YELLOW}... and $((BACKUP_COUNT - 20)) more backups${NC}"
        fi
    else
        echo -e "${RED}No backups found in ${BACKUP_DIR}${NC}"
        exit 1
    fi
}

# Check if backup file is provided
if [ -z "$1" ]; then
    echo -e "${YELLOW}Usage: $0 <backup_file>${NC}"
    echo -e "${YELLOW}Example: $0 grabhealth_backup_20241219_120000.sql.gz${NC}"
    echo -e "${YELLOW}         $0 latest (to restore the latest backup)${NC}"
    echo ""
    list_backups
    exit 1
fi

# Handle "latest" option
if [ "$1" == "latest" ]; then
    BACKUP_FILE="${BACKUP_DIR}/latest_backup.sql.gz"
    if [ ! -L "${BACKUP_FILE}" ]; then
        echo -e "${RED}✗ No latest backup symlink found${NC}"
        exit 1
    fi
else
    BACKUP_FILE="${BACKUP_DIR}/$1"
fi

# Check if backup file exists
if [ ! -f "${BACKUP_FILE}" ]; then
    echo -e "${RED}✗ Backup file not found: ${BACKUP_FILE}${NC}"
    echo ""
    list_backups
    exit 1
fi

# Get actual filename if it's a symlink
if [ -L "${BACKUP_FILE}" ]; then
    ACTUAL_FILE=$(readlink "${BACKUP_FILE}")
    echo -e "${BLUE}Using backup: ${ACTUAL_FILE}${NC}"
fi

echo -e "${YELLOW}WARNING: This will restore the database from backup${NC}"
echo -e "${YELLOW}Database: ${DATABASE_NAME}${NC}"
echo -e "${YELLOW}Host: ${DATABASE_HOST}${NC}"
echo -e "${YELLOW}Backup: ${BACKUP_FILE}${NC}"
echo ""
echo -e "${RED}THIS WILL OVERWRITE ALL CURRENT DATA IN THE DATABASE!${NC}"
read -p "Are you sure you want to continue? (yes/no): " CONFIRM

if [ "${CONFIRM}" != "yes" ]; then
    echo -e "${YELLOW}Restore cancelled${NC}"
    exit 0
fi

# Create a current backup before restore
echo -e "${YELLOW}Creating a backup of current database before restore...${NC}"
SAFETY_BACKUP="grabhealth_before_restore_$(date +"%Y%m%d_%H%M%S").sql"
if PGPASSWORD="${DATABASE_PASSWORD}" pg_dump \
    -h "${DATABASE_HOST}" \
    -p "${DATABASE_PORT}" \
    -U "${DATABASE_USERNAME}" \
    -d "${DATABASE_NAME}" \
    --no-owner \
    --no-privileges \
    > "${BACKUP_DIR}/${SAFETY_BACKUP}"; then
    
    gzip "${BACKUP_DIR}/${SAFETY_BACKUP}"
    echo -e "${GREEN}✓ Safety backup created: ${SAFETY_BACKUP}.gz${NC}"
else
    echo -e "${RED}✗ Failed to create safety backup. Aborting restore.${NC}"
    exit 1
fi

# Decompress and restore the backup
echo -e "${YELLOW}Restoring database from backup...${NC}"

# Create temporary file for decompressed backup
TEMP_SQL="/tmp/grabhealth_restore_$$.sql"

# Decompress the backup
if gunzip -c "${BACKUP_FILE}" > "${TEMP_SQL}"; then
    echo -e "${GREEN}✓ Backup decompressed successfully${NC}"
else
    echo -e "${RED}✗ Failed to decompress backup${NC}"
    rm -f "${TEMP_SQL}"
    exit 1
fi

# Restore the database
if PGPASSWORD="${DATABASE_PASSWORD}" psql \
    -h "${DATABASE_HOST}" \
    -p "${DATABASE_PORT}" \
    -U "${DATABASE_USERNAME}" \
    -d "${DATABASE_NAME}" \
    -f "${TEMP_SQL}" \
    > /dev/null 2>&1; then
    
    echo -e "${GREEN}✓ Database restored successfully${NC}"
    
    # Clean up temp file
    rm -f "${TEMP_SQL}"
    
    echo -e "${GREEN}✓ Restore process completed!${NC}"
    echo -e "${YELLOW}Note: You may need to restart Strapi for changes to take effect${NC}"
    
else
    echo -e "${RED}✗ Database restore failed!${NC}"
    echo -e "${YELLOW}Your safety backup is available at: ${BACKUP_DIR}/${SAFETY_BACKUP}.gz${NC}"
    rm -f "${TEMP_SQL}"
    exit 1
fi