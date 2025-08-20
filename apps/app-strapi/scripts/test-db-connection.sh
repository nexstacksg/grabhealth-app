#!/bin/bash

# Test Database Connection Script
# This script verifies that we can connect to the database

# Load environment variables
set -a
source "$(dirname "$0")/../.env"
set +a

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}Testing database connection...${NC}"
echo "Host: ${DATABASE_HOST}"
echo "Port: ${DATABASE_PORT}"
echo "Database: ${DATABASE_NAME}"
echo "User: ${DATABASE_USERNAME}"

# Test connection using psql
if PGPASSWORD="${DATABASE_PASSWORD}" psql \
    -h "${DATABASE_HOST}" \
    -p "${DATABASE_PORT}" \
    -U "${DATABASE_USERNAME}" \
    -d "${DATABASE_NAME}" \
    -c "SELECT version();" > /dev/null 2>&1; then
    
    echo -e "${GREEN}✓ Database connection successful!${NC}"
    
    # Get database size
    DB_SIZE=$(PGPASSWORD="${DATABASE_PASSWORD}" psql \
        -h "${DATABASE_HOST}" \
        -p "${DATABASE_PORT}" \
        -U "${DATABASE_USERNAME}" \
        -d "${DATABASE_NAME}" \
        -t -c "SELECT pg_size_pretty(pg_database_size('${DATABASE_NAME}'));" | xargs)
    
    echo -e "${BLUE}Database size: ${DB_SIZE}${NC}"
    
    # Count tables
    TABLE_COUNT=$(PGPASSWORD="${DATABASE_PASSWORD}" psql \
        -h "${DATABASE_HOST}" \
        -p "${DATABASE_PORT}" \
        -U "${DATABASE_USERNAME}" \
        -d "${DATABASE_NAME}" \
        -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';" | xargs)
    
    echo -e "${BLUE}Number of tables: ${TABLE_COUNT}${NC}"
    
else
    echo -e "${RED}✗ Failed to connect to database!${NC}"
    echo -e "${YELLOW}Please check your database configuration in .env file${NC}"
    exit 1
fi