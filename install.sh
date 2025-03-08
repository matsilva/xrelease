#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Installing xrelease...${NC}"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo -e "${RED}Error: npm is not installed. Please install Node.js and npm first.${NC}"
    exit 1
fi

# Install xrelease globally
echo -e "${BLUE}Installing xrelease globally...${NC}"
npm install -g xrelease

# Check if installation was successful
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ xrelease installed successfully!${NC}"
    echo -e "\nTo initialize xrelease in your project, run:"
    echo -e "${BLUE}xrelease init${NC}"
else
    echo -e "${RED}Error: Failed to install xrelease${NC}"
    exit 1
fi 