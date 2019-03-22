#!/bin/bash

# EC2 was already setup. CI/CD gets update and rebuild it.
echo "[+] Start deploy-clean."
# Stop the server
echo "[+] Stop studystates-server server"
pm2 stop "studystates-server"
pm2 delete "studystates-server"

# Remove repository
echo "[+] Remove old version repository"
\rm -rf /home/ubuntu/studystates-server/dev

# Make directory
echo "[+] Make folder for new version"
mkdir -p /home/ubuntu/studystates-server/dev
echo "[+] End deploy-clean."
