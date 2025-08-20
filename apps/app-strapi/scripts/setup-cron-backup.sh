#!/bin/bash

# Cron Setup Script for Automated Backups
# This script helps set up automated daily backups

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}   Automated Backup Setup${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Function to add cron job
add_cron_job() {
    local schedule=$1
    local script=$2
    local description=$3
    
    # Create a unique identifier for our cron job
    local cron_comment="# GrabHealth Strapi Backup - ${description}"
    
    # Check if cron job already exists
    if crontab -l 2>/dev/null | grep -q "${cron_comment}"; then
        echo -e "${YELLOW}⚠ Cron job already exists for: ${description}${NC}"
        return 0
    fi
    
    # Add the cron job
    (crontab -l 2>/dev/null; echo "${cron_comment}"; echo "${schedule} ${script} >> ${SCRIPT_DIR}/../backups/backup.log 2>&1") | crontab -
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ Added cron job for: ${description}${NC}"
        echo -e "  Schedule: ${schedule}"
        return 0
    else
        echo -e "${RED}✗ Failed to add cron job for: ${description}${NC}"
        return 1
    fi
}

# Show current cron jobs
echo -e "${BLUE}Current backup cron jobs:${NC}"
if crontab -l 2>/dev/null | grep "GrabHealth Strapi Backup"; then
    crontab -l | grep -A1 "GrabHealth Strapi Backup"
else
    echo "No backup cron jobs found"
fi
echo ""

# Ask user for backup preferences
echo -e "${YELLOW}Choose backup schedule:${NC}"
echo "1) Daily at 2:00 AM (recommended)"
echo "2) Daily at custom time"
echo "3) Weekly on Sunday at 2:00 AM"
echo "4) Custom schedule"
echo "5) Remove all backup cron jobs"
echo ""
read -p "Select option (1-5): " OPTION

case $OPTION in
    1)
        SCHEDULE="0 2 * * *"
        ;;
    2)
        read -p "Enter hour (0-23): " HOUR
        read -p "Enter minute (0-59): " MINUTE
        SCHEDULE="${MINUTE} ${HOUR} * * *"
        ;;
    3)
        SCHEDULE="0 2 * * 0"
        ;;
    4)
        echo -e "${YELLOW}Enter custom cron schedule${NC}"
        echo "Format: minute hour day month weekday"
        echo "Example: 0 2 * * * (daily at 2:00 AM)"
        read -p "Schedule: " SCHEDULE
        ;;
    5)
        echo -e "${YELLOW}Removing all GrabHealth backup cron jobs...${NC}"
        crontab -l 2>/dev/null | grep -v "GrabHealth Strapi Backup" | grep -v "${SCRIPT_DIR}" | crontab -
        echo -e "${GREEN}✓ All backup cron jobs removed${NC}"
        exit 0
        ;;
    *)
        echo -e "${RED}Invalid option${NC}"
        exit 1
        ;;
esac

# Ask what to backup
echo ""
echo -e "${YELLOW}What would you like to backup?${NC}"
echo "1) Database only"
echo "2) Uploads only"
echo "3) Both (recommended)"
read -p "Select option (1-3): " BACKUP_TYPE

# Make scripts executable
chmod +x "${SCRIPT_DIR}"/*.sh

# Create backup directory and log file
mkdir -p "${SCRIPT_DIR}/../backups"
touch "${SCRIPT_DIR}/../backups/backup.log"

# Add appropriate cron jobs
case $BACKUP_TYPE in
    1)
        add_cron_job "${SCHEDULE}" "${SCRIPT_DIR}/backup-database.sh" "Database"
        ;;
    2)
        add_cron_job "${SCHEDULE}" "${SCRIPT_DIR}/backup-uploads.sh" "Uploads"
        ;;
    3)
        add_cron_job "${SCHEDULE}" "${SCRIPT_DIR}/backup-all.sh" "Full Backup"
        ;;
    *)
        echo -e "${RED}Invalid option${NC}"
        exit 1
        ;;
esac

echo ""
echo -e "${GREEN}✓ Cron setup completed!${NC}"
echo ""
echo -e "${BLUE}To view your cron jobs:${NC}"
echo "  crontab -l"
echo ""
echo -e "${BLUE}To view backup logs:${NC}"
echo "  tail -f ${SCRIPT_DIR}/../backups/backup.log"
echo ""
echo -e "${BLUE}To manually run a backup:${NC}"
echo "  ${SCRIPT_DIR}/backup-all.sh"