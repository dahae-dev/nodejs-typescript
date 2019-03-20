#!/bin/bash

# EC2 was already setup. CI/CD gets update and rebuild it.
echo "[+] Start deploy-clean."
# Stop the server
pm2 stop 0

# Remove repository
\rm -rf /home/ubuntu/studystates-server

# Make directory
mkdir /home/ubuntu/studystates-server

echo "[+] End deploy-clean."
