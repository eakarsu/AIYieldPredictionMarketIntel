#!/bin/bash

# ============================================================
#  AgriYield AI - Start Script
#  AI Yield Prediction & Market Intelligence Platform
# ============================================================

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m'

PROJECT_DIR="$(cd "$(dirname "$0")" && pwd)"

echo -e "${GREEN}"
echo "  ========================================"
echo "    AgriYield AI Platform"
echo "    Yield Prediction & Market Intel"
echo "  ========================================"
echo -e "${NC}"

# Load env
if [ -f "$PROJECT_DIR/.env" ]; then
  export $(grep -v '^#' "$PROJECT_DIR/.env" | xargs)
fi

BACKEND_PORT=${BACKEND_PORT:-3001}
FRONTEND_PORT=${FRONTEND_PORT:-3000}

# Kill processes on used ports
echo -e "${YELLOW}Cleaning up ports $BACKEND_PORT and $FRONTEND_PORT...${NC}"
kill_port() {
  local port=$1
  local pids=$(lsof -ti tcp:$port 2>/dev/null || true)
  if [ -n "$pids" ]; then
    echo -e "  ${RED}Killing processes on port $port: $pids${NC}"
    echo "$pids" | xargs kill -9 2>/dev/null || true
    sleep 1
  else
    echo -e "  ${GREEN}Port $port is free${NC}"
  fi
}

kill_port $BACKEND_PORT
kill_port $FRONTEND_PORT

# Check PostgreSQL
echo -e "\n${BLUE}Checking PostgreSQL...${NC}"
if command -v pg_isready &>/dev/null; then
  if pg_isready -h ${DB_HOST:-localhost} -p ${DB_PORT:-5432} &>/dev/null; then
    echo -e "  ${GREEN}PostgreSQL is running${NC}"
  else
    echo -e "  ${YELLOW}Starting PostgreSQL...${NC}"
    if command -v brew &>/dev/null; then
      brew services start postgresql@14 2>/dev/null || brew services start postgresql 2>/dev/null || true
    fi
    sleep 2
  fi
fi

# Create database if it doesn't exist
echo -e "\n${BLUE}Setting up database...${NC}"
DB_NAME=${DB_NAME:-agriyield_db}
DB_USER=${DB_USER:-postgres}

createdb -h ${DB_HOST:-localhost} -p ${DB_PORT:-5432} -U $DB_USER $DB_NAME 2>/dev/null && \
  echo -e "  ${GREEN}Created database: $DB_NAME${NC}" || \
  echo -e "  ${CYAN}Database $DB_NAME already exists${NC}"

# Install dependencies
echo -e "\n${BLUE}Installing backend dependencies...${NC}"
cd "$PROJECT_DIR/backend"
npm install --silent 2>&1 | tail -1

echo -e "\n${BLUE}Installing frontend dependencies...${NC}"
cd "$PROJECT_DIR/frontend"
npm install --silent 2>&1 | tail -1

# Seed database
echo -e "\n${PURPLE}Seeding database with sample data...${NC}"
cd "$PROJECT_DIR/backend"
node src/seeds/index.js

# Start backend with nodemon (hot reload)
echo -e "\n${GREEN}Starting backend on port $BACKEND_PORT (with hot reload)...${NC}"
cd "$PROJECT_DIR/backend"
npx nodemon src/server.js &
BACKEND_PID=$!

# Wait for backend to be ready
echo -e "${YELLOW}Waiting for backend...${NC}"
for i in {1..30}; do
  if curl -s http://localhost:$BACKEND_PORT/api/health > /dev/null 2>&1; then
    echo -e "  ${GREEN}Backend is ready!${NC}"
    break
  fi
  sleep 1
done

# Start frontend (with hot reload built-in via react-scripts)
echo -e "\n${GREEN}Starting frontend on port $FRONTEND_PORT (with hot reload)...${NC}"
cd "$PROJECT_DIR/frontend"
PORT=$FRONTEND_PORT BROWSER=none npm start &
FRONTEND_PID=$!

# Trap cleanup
cleanup() {
  echo -e "\n${YELLOW}Shutting down...${NC}"
  kill $BACKEND_PID 2>/dev/null || true
  kill $FRONTEND_PID 2>/dev/null || true
  kill_port $BACKEND_PORT
  kill_port $FRONTEND_PORT
  echo -e "${GREEN}Goodbye!${NC}"
  exit 0
}
trap cleanup SIGINT SIGTERM

echo -e "\n${GREEN}============================================${NC}"
echo -e "${GREEN}  AgriYield AI is running!${NC}"
echo -e "${GREEN}============================================${NC}"
echo -e "  ${CYAN}Frontend:${NC}  http://localhost:$FRONTEND_PORT"
echo -e "  ${CYAN}Backend:${NC}   http://localhost:$BACKEND_PORT"
echo -e "  ${CYAN}API:${NC}       http://localhost:$BACKEND_PORT/api/health"
echo -e ""
echo -e "  ${YELLOW}Login:${NC}     admin@agriyield.com / admin123"
echo -e "  ${YELLOW}Press Ctrl+C to stop${NC}"
echo -e "${GREEN}============================================${NC}\n"

# Keep running
wait
