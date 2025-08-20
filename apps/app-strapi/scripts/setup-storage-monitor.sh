#!/bin/bash

# Setup script for storage monitoring cron job

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
MONITOR_SCRIPT="$SCRIPT_DIR/monitor-storage.sh"

echo "Storage Monitoring Setup"
echo "======================="
echo

# Check if monitoring script exists
if [ ! -f "$MONITOR_SCRIPT" ]; then
    echo "Error: Storage monitoring script not found at $MONITOR_SCRIPT"
    exit 1
fi

# Function to add cron job
add_cron_job() {
    local schedule=$1
    local job="$schedule $MONITOR_SCRIPT"
    
    # Check if job already exists
    if crontab -l 2>/dev/null | grep -q "$MONITOR_SCRIPT"; then
        echo "Storage monitoring cron job already exists. Updating..."
        # Remove existing job
        crontab -l 2>/dev/null | grep -v "$MONITOR_SCRIPT" | crontab -
    fi
    
    # Add new job
    (crontab -l 2>/dev/null; echo "$job") | crontab -
    echo "Cron job added: $job"
}

# Display options
echo "Choose monitoring frequency:"
echo "1) Every hour"
echo "2) Every 30 minutes"
echo "3) Every 15 minutes"
echo "4) Every 5 minutes (for testing)"
echo "5) Custom cron schedule"
echo "6) Remove monitoring cron job"
echo

read -p "Enter your choice (1-6): " choice

case $choice in
    1)
        add_cron_job "0 * * * *"
        echo "Storage monitoring will run every hour"
        ;;
    2)
        add_cron_job "*/30 * * * *"
        echo "Storage monitoring will run every 30 minutes"
        ;;
    3)
        add_cron_job "*/15 * * * *"
        echo "Storage monitoring will run every 15 minutes"
        ;;
    4)
        add_cron_job "*/5 * * * *"
        echo "Storage monitoring will run every 5 minutes (testing mode)"
        ;;
    5)
        echo "Enter custom cron schedule (e.g., '0 */6 * * *' for every 6 hours):"
        read -p "Schedule: " custom_schedule
        add_cron_job "$custom_schedule"
        echo "Storage monitoring will run with schedule: $custom_schedule"
        ;;
    6)
        # Remove cron job
        if crontab -l 2>/dev/null | grep -q "$MONITOR_SCRIPT"; then
            crontab -l 2>/dev/null | grep -v "$MONITOR_SCRIPT" | crontab -
            echo "Storage monitoring cron job removed"
        else
            echo "No storage monitoring cron job found"
        fi
        ;;
    *)
        echo "Invalid choice"
        exit 1
        ;;
esac

echo
echo "Current cron jobs:"
crontab -l 2>/dev/null | grep "$MONITOR_SCRIPT" || echo "No storage monitoring jobs found"

echo
echo "To manually run storage monitoring:"
echo "  $MONITOR_SCRIPT"

echo
echo "To view monitoring logs:"
echo "  tail -f $SCRIPT_DIR/../logs/storage-monitor.log"