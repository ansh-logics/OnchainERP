#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  OnchainERP Database Seeder${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""

# Check if we're in the backend directory
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ Error: Please run this script from the backend directory${NC}"
    exit 1
fi

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}⚠️  node_modules not found. Installing dependencies...${NC}"
    npm install
fi

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo -e "${RED}❌ Error: .env file not found${NC}"
    echo -e "${YELLOW}Please create a .env file with database credentials${NC}"
    exit 1
fi

echo -e "${YELLOW}⚠️  WARNING: This will create sample data in your database${NC}"
echo -e "${YELLOW}   Make sure your database is set up and ready${NC}"
echo ""
read -p "Do you want to continue? (y/n) " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${RED}Cancelled by user${NC}"
    exit 1
fi

echo ""
echo -e "${GREEN}🚀 Starting database seeding...${NC}"
echo ""

# Run the seed script
npm run seed:college

if [ $? -eq 0 ]; then
    echo ""
    echo -e "${GREEN}========================================${NC}"
    echo -e "${GREEN}✅ Seeding completed successfully!${NC}"
    echo -e "${GREEN}========================================${NC}"
    echo ""
    echo -e "${GREEN}Login Credentials:${NC}"
    echo -e "  Email: ${YELLOW}admin@teccollege.edu.in${NC}"
    echo -e "  Password: ${YELLOW}Admin@123${NC}"
    echo ""
else
    echo ""
    echo -e "${RED}========================================${NC}"
    echo -e "${RED}❌ Seeding failed!${NC}"
    echo -e "${RED}========================================${NC}"
    echo ""
    echo -e "${YELLOW}Please check the error messages above${NC}"
    exit 1
fi

