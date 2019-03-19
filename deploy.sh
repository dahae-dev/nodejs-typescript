#!/bin/bash

echo "[*] Start deploy"
# EC2 was already setup. CI/CD gets update and rebuild it.
cd ~/studystates-server
git checkout dev
git pull
npm install
npm run build
pm2 stop build/server
pm2 start build/server
pm2 start npm -- start
echo "[+] Deploy end"
