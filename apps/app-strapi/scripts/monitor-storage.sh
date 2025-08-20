#!/bin/bash

# Storage Monitoring Script
# Monitors disk usage and sends email alerts when threshold is reached

# Load environment variables
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ENV_FILE="$SCRIPT_DIR/../.env"

if [ -f "$ENV_FILE" ]; then
    source "$ENV_FILE"
fi

# Configuration
THRESHOLD=${STORAGE_THRESHOLD:-70}  # Default to 70% if not set
LOG_FILE="$SCRIPT_DIR/../logs/storage-monitor.log"
ALERT_FLAG_FILE="$SCRIPT_DIR/../.storage-alert-sent"

# Email configuration - Using Mailgun
MAILGUN_API_KEY=${MAILGUN_API_KEY}
MAILGUN_DOMAIN=${MAILGUN_DOMAIN}
MAILGUN_FROM_EMAIL=${MAILGUN_FROM_EMAIL:-"noreply@nexstack.sg"}
MAILGUN_FROM_NAME=${MAILGUN_FROM_NAME:-"GrabHealth Server Monitor"}
ADMIN_EMAIL=${ADMIN_EMAIL}

# Create log directory if it doesn't exist
mkdir -p "$(dirname "$LOG_FILE")"

# Log function
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

# Get disk usage percentage for the filesystem containing the app
get_disk_usage() {
    df -h "$SCRIPT_DIR" | awk 'NR==2 {print $5}' | sed 's/%//'
}

# Get detailed disk usage information
get_disk_info() {
    df -h "$SCRIPT_DIR" | awk 'NR==2 {print "Filesystem: " $1 "\nSize: " $2 "\nUsed: " $3 "\nAvailable: " $4 "\nUse%: " $5 "\nMounted on: " $6}'
}

# Send email alert using Mailgun
send_email_alert() {
    local usage=$1
    local disk_info=$2
    
    # Create a temporary Node.js script for sending email via Mailgun
    cat > "$SCRIPT_DIR/send-alert.js" << EOF
const mailgun = require('mailgun-js')({
    apiKey: '${MAILGUN_API_KEY}',
    domain: '${MAILGUN_DOMAIN}'
});

const emailData = {
    from: '${MAILGUN_FROM_NAME} <${MAILGUN_FROM_EMAIL}>',
    to: '${ADMIN_EMAIL}',
    subject: 'ALERT: GrabHealth Server Storage at ${usage}%',
    html: \`
        <h2>⚠️ Storage Alert</h2>
        <p>The server storage has reached <strong style="color: red;">${usage}%</strong> capacity.</p>
        
        <h3>📊 Disk Information:</h3>
        <pre style="background: #f5f5f5; padding: 10px; border-radius: 5px;">${disk_info}</pre>
        
        <h3>📋 Recommendations:</h3>
        <ul>
            <li>Clean up old backup files</li>
            <li>Remove unnecessary logs</li>
            <li>Consider increasing disk space</li>
            <li>Archive old data to external storage</li>
        </ul>
        
        <h3>🔧 Quick Actions:</h3>
        <ul>
            <li>Run cleanup: <code>cd ${SCRIPT_DIR} && ./cleanup-old-backups.sh</code></li>
            <li>Check backups: <code>ls -la ${SCRIPT_DIR}/../backups/</code></li>
            <li>View logs: <code>tail -100 ${LOG_FILE}</code></li>
        </ul>
        
        <hr style="margin: 20px 0;">
        <p style="color: #666;">
            <strong>Server:</strong> ${HOSTNAME:-$(hostname)}<br>
            <strong>Time:</strong> $(date)<br>
            <strong>Threshold:</strong> ${THRESHOLD}%
        </p>
        
        <p style="font-size: 12px; color: #999; margin-top: 20px;">
            This is an automated alert from GrabHealth Server Monitoring System.
        </p>
    \`
};

mailgun.messages().send(emailData, (error, body) => {
    if (error) {
        console.error('Error sending email:', error);
        process.exit(1);
    } else {
        console.log('Email sent:', body.id);
        process.exit(0);
    }
});
EOF

    # Send the email
    cd "$SCRIPT_DIR/.." && node "$SCRIPT_DIR/send-alert.js"
    local exit_code=$?
    
    # Clean up
    rm -f "$SCRIPT_DIR/send-alert.js"
    
    return $exit_code
}

# Main monitoring logic
main() {
    log "Starting storage monitoring..."
    
    # Get current disk usage
    CURRENT_USAGE=$(get_disk_usage)
    DISK_INFO=$(get_disk_info)
    
    log "Current disk usage: ${CURRENT_USAGE}%"
    
    # Check if usage exceeds threshold
    if [ "$CURRENT_USAGE" -ge "$THRESHOLD" ]; then
        log "WARNING: Disk usage (${CURRENT_USAGE}%) exceeds threshold (${THRESHOLD}%)"
        
        # Check if we've already sent an alert recently (within 24 hours)
        if [ -f "$ALERT_FLAG_FILE" ]; then
            LAST_ALERT=$(stat -f "%m" "$ALERT_FLAG_FILE" 2>/dev/null || stat -c "%Y" "$ALERT_FLAG_FILE" 2>/dev/null || echo 0)
            CURRENT_TIME=$(date +%s)
            TIME_DIFF=$((CURRENT_TIME - LAST_ALERT))
            
            # If less than 24 hours since last alert, skip
            if [ "$TIME_DIFF" -lt 86400 ]; then
                log "Alert already sent within the last 24 hours. Skipping..."
                exit 0
            fi
        fi
        
        # Send email alert
        if [ -n "$ADMIN_EMAIL" ] && [ -n "$MAILGUN_API_KEY" ] && [ -n "$MAILGUN_DOMAIN" ]; then
            log "Sending email alert to $ADMIN_EMAIL..."
            if send_email_alert "$CURRENT_USAGE" "$DISK_INFO"; then
                log "Email alert sent successfully"
                touch "$ALERT_FLAG_FILE"
            else
                log "Failed to send email alert"
            fi
        else
            log "Email configuration missing. Please set ADMIN_EMAIL in .env (Mailgun is already configured)"
        fi
        
        # Also log to system
        echo "STORAGE ALERT: Disk usage at ${CURRENT_USAGE}%" | tee -a "$LOG_FILE"
        
    else
        log "Disk usage (${CURRENT_USAGE}%) is below threshold (${THRESHOLD}%)"
        # Remove alert flag if usage is back to normal
        rm -f "$ALERT_FLAG_FILE"
    fi
    
    # Store current usage in a file for API access
    echo "{\"usage\": $CURRENT_USAGE, \"threshold\": $THRESHOLD, \"timestamp\": \"$(date -u +%Y-%m-%dT%H:%M:%SZ)\", \"disk_info\": \"$DISK_INFO\"}" > "$SCRIPT_DIR/../storage-status.json"
}

# Run main function
main