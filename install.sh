#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Installing release-toolkit...${NC}"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo -e "${RED}Error: npm is not installed. Please install Node.js and npm first.${NC}"
    exit 1
fi

# Install release-toolkit globally
echo -e "${BLUE}Installing release-toolkit globally...${NC}"
npm install -g release-toolkit

# Check if installation was successful
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ release-toolkit installed successfully!${NC}"
    echo -e "\nTo initialize release-toolkit in your project, run:"
    echo -e "${BLUE}release-toolkit init${NC}"
else
    echo -e "${RED}Error: Failed to install release-toolkit${NC}"
    exit 1
fi 