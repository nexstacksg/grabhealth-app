#!/bin/bash

# Upload Files Backup Script for GrabHealth Strapi
# This script backs up the upload files (stored in DigitalOcean Spaces)

# Load environment variables
set -a
source "$(dirname "$0")/../.env"
set +a

# Configuration
BACKUP_DIR="${BACKUP_DIR:-$(dirname "$0")/../backups/uploads}"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILENAME="uploads_backup_${TIMESTAMP}.tar.gz"
BACKUP_PATH="${BACKUP_DIR}/${BACKUP_FILENAME}"
LOCAL_UPLOADS_DIR="$(dirname "$0")/../public/uploads"
MAX_BACKUPS=${MAX_BACKUPS:-10}  # Keep last 10 upload backups

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

echo -e "${YELLOW}Starting uploads backup...${NC}"

# Check if using DigitalOcean Spaces
if [ -n "${DO_SPACE_BUCKET}" ] && [ -n "${DO_SPACE_ACCESS_KEY}" ]; then
    echo -e "${BLUE}Detected DigitalOcean Spaces configuration${NC}"
    echo "Bucket: ${DO_SPACE_BUCKET}"
    echo "Region: ${DO_SPACE_REGION}"
    
    # Check if s3cmd is installed
    if ! command -v s3cmd &> /dev/null; then
        echo -e "${RED}✗ s3cmd is not installed. Please install it first:${NC}"
        echo "  brew install s3cmd  (on macOS)"
        echo "  apt-get install s3cmd  (on Ubuntu/Debian)"
        exit 1
    fi
    
    # Create s3cmd configuration
    S3CMD_CONFIG="/tmp/.s3cfg_$$"
    cat > "${S3CMD_CONFIG}" << EOF
[default]
access_key = ${DO_SPACE_ACCESS_KEY}
secret_key = ${DO_SPACE_SECRET_KEY}
host_base = ${DO_SPACE_REGION}.digitaloceanspaces.com
host_bucket = %(bucket)s.${DO_SPACE_REGION}.digitaloceanspaces.com
use_https = True
EOF
    
    # Download files from Spaces
    TEMP_DOWNLOAD_DIR="/tmp/grabhealth_uploads_$$"
    mkdir -p "${TEMP_DOWNLOAD_DIR}"
    
    echo -e "${YELLOW}Downloading files from DigitalOcean Spaces...${NC}"
    if s3cmd --config="${S3CMD_CONFIG}" sync "s3://${DO_SPACE_BUCKET}/" "${TEMP_DOWNLOAD_DIR}/" --skip-existing; then
        echo -e "${GREEN}✓ Files downloaded successfully${NC}"
        
        # Create tar archive
        echo -e "${YELLOW}Creating backup archive...${NC}"
        if tar -czf "${BACKUP_PATH}" -C "${TEMP_DOWNLOAD_DIR}" .; then
            echo -e "${GREEN}✓ Backup archive created successfully${NC}"
            
            # Get file size
            BACKUP_SIZE=$(ls -lh "${BACKUP_PATH}" | awk '{print $5}')
            echo -e "${GREEN}✓ Backup size: ${BACKUP_SIZE}${NC}"
            
            # Clean up temp files
            rm -rf "${TEMP_DOWNLOAD_DIR}"
            rm -f "${S3CMD_CONFIG}"
        else
            echo -e "${RED}✗ Failed to create backup archive${NC}"
            rm -rf "${TEMP_DOWNLOAD_DIR}"
            rm -f "${S3CMD_CONFIG}"
            exit 1
        fi
    else
        echo -e "${RED}✗ Failed to download files from Spaces${NC}"
        rm -rf "${TEMP_DOWNLOAD_DIR}"
        rm -f "${S3CMD_CONFIG}"
        exit 1
    fi
    
elif [ -d "${LOCAL_UPLOADS_DIR}" ]; then
    echo -e "${BLUE}Backing up local upload files${NC}"
    echo "Directory: ${LOCAL_UPLOADS_DIR}"
    
    # Check if there are files to backup
    if [ -z "$(ls -A ${LOCAL_UPLOADS_DIR} 2>/dev/null)" ]; then
        echo -e "${YELLOW}No files to backup in ${LOCAL_UPLOADS_DIR}${NC}"
        exit 0
    fi
    
    # Create tar archive of local uploads
    echo -e "${YELLOW}Creating backup archive...${NC}"
    if tar -czf "${BACKUP_PATH}" -C "${LOCAL_UPLOADS_DIR}" .; then
        echo -e "${GREEN}✓ Backup archive created successfully${NC}"
        
        # Get file size
        BACKUP_SIZE=$(ls -lh "${BACKUP_PATH}" | awk '{print $5}')
        echo -e "${GREEN}✓ Backup size: ${BACKUP_SIZE}${NC}"
    else
        echo -e "${RED}✗ Failed to create backup archive${NC}"
        exit 1
    fi
else
    echo -e "${YELLOW}No upload configuration found (neither DigitalOcean Spaces nor local uploads)${NC}"
    exit 0
fi

# Clean up old backups
echo -e "${YELLOW}Cleaning up old backups...${NC}"
BACKUP_COUNT=$(ls -1 "${BACKUP_DIR}"/uploads_backup_*.tar.gz 2>/dev/null | wc -l)

if [ "${BACKUP_COUNT}" -gt "${MAX_BACKUPS}" ]; then
    BACKUPS_TO_DELETE=$((BACKUP_COUNT - MAX_BACKUPS))
    ls -1t "${BACKUP_DIR}"/uploads_backup_*.tar.gz | tail -n "${BACKUPS_TO_DELETE}" | xargs rm -f
    echo -e "${GREEN}✓ Removed ${BACKUPS_TO_DELETE} old backup(s)${NC}"
fi

# Create a latest backup symlink
ln -sf "${BACKUP_FILENAME}" "${BACKUP_DIR}/latest_uploads_backup.tar.gz"

echo -e "${GREEN}✓ Upload backup process completed!${NC}"
echo "Backup location: ${BACKUP_PATH}"