#!/bin/bash

# Deploy Script for GLX-Link Production
# Usage: ./deploy.sh

set -e

echo "🚀 Starting deployment process..."

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Configuration
APP_NAME="glx-link"
APP_DIR="/var/www/glx-link"
UPLOADS_DIR="/var/www/glx-link/uploads"
REPO_URL="your-git-repo-url" # Update this with your git repository URL

echo -e "${YELLOW}📁 Step 0: Ensuring uploads directory exists...${NC}"
if [ ! -d "$UPLOADS_DIR" ]; then
    mkdir -p "$UPLOADS_DIR"
    chmod 755 "$UPLOADS_DIR"
    echo -e "${GREEN}✅ Created uploads directory${NC}"
else
    echo -e "${GREEN}✅ Uploads directory already exists${NC}"
fi

echo -e "${YELLOW}📦 Step 1: Pulling latest code from repository...${NC}"
cd $APP_DIR
git pull origin main

echo -e "${YELLOW}📦 Step 2: Installing dependencies...${NC}"
npm ci --production=false

echo -e "${YELLOW}🔨 Step 3: Building application...${NC}"
npm run build

echo -e "${YELLOW}🗄️  Step 4: Running database migrations...${NC}"
npm run db:migrate

echo -e "${YELLOW}🔄 Step 5: Restarting PM2 application...${NC}"
pm2 reload ecosystem.config.cjs --env production

echo -e "${YELLOW}💾 Step 6: Saving PM2 configuration...${NC}"
pm2 save

echo -e "${GREEN}✅ Deployment completed successfully!${NC}"
echo -e "${GREEN}📊 Application status:${NC}"
pm2 status

echo -e "${YELLOW}📝 View logs with: pm2 logs $APP_NAME${NC}"
echo -e "${YELLOW}📊 Monitor with: pm2 monit${NC}"
