#!/bin/bash

# EC2 was already setup. CI/CD gets update and rebuild it.
echo "[+] Start deploy-build."

cd /home/ubuntu/studystates-server/dev

# Decompress source code
tar -zxvf dev.tar.gz

# Install package
npm install

# Server build including typescript
npm run build

# Start server
pm2 start npm -- start

echo "[+] End deploy-build."
