#!/bin/bash

# Complete Backup Script for GrabHealth Strapi
# This script performs a full backup of both database and uploads

# Get the directory where this script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}   GrabHealth Strapi Full Backup${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Run database backup
echo -e "${YELLOW}Step 1: Database Backup${NC}"
echo -e "${YELLOW}----------------------${NC}"
if "${SCRIPT_DIR}/backup-database.sh"; then
    echo -e "${GREEN}✓ Database backup completed${NC}"
else
    echo -e "${RED}✗ Database backup failed${NC}"
    exit 1
fi

echo ""

# Run uploads backup
echo -e "${YELLOW}Step 2: Uploads Backup${NC}"
echo -e "${YELLOW}---------------------${NC}"
if "${SCRIPT_DIR}/backup-uploads.sh"; then
    echo -e "${GREEN}✓ Uploads backup completed${NC}"
else
    echo -e "${RED}✗ Uploads backup failed${NC}"
    # Don't exit here as database backup was successful
fi

echo ""
echo -e "${BLUE}========================================${NC}"
echo -e "${GREEN}✓ Full backup process completed!${NC}"
echo -e "${BLUE}========================================${NC}"

# Show backup locations
echo ""
echo -e "${BLUE}Backup locations:${NC}"
echo -e "  Database: ${SCRIPT_DIR}/../backups/"
echo -e "  Uploads:  ${SCRIPT_DIR}/../backups/uploads/"