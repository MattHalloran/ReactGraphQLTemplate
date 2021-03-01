#!/bin/bash

# Last update: 2021-02-28
# This script is used to start all servers required for the website
# --------- Task Queue ------------------
# 1) 
# --------- Database ------------------
# 1) 
# --------- Python backend ------------------
# 1) 
# --------- React frontend ------------------
# 1) 

# Load functions to help with echo formatting
source "formatting.sh"

# Define global variables
PACKAGE_NAME="NLN"

# Start Task Queue
GROUP="Task Queue Server"
INFO="This uses Redis"
MSG="Navigating to / directory"
checker cd
MSG="Navigating to redis build directory"
checker cd redis/redis-6.0.10
MSG="Starting redis server"
checker src/redis-server

# Start PostgreSQL
# **NOTE: To start postgres on Mac, use "brew services start postgresql"
service postgresql start

# Start Python backend
cd "/$PACKAGE_NAME/backend"
gunicorn -b :5000 src.routes:app

# Start React frontend
cd "/$PACKAGE_NAME/frontend"
serve -s build