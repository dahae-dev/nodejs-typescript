#!/bin/bash

echo "[*] Start deploy"
# EC2 was already setup. CI/CD gets update and rebuild it.
cd ~/studystates-server
npm install
npm run build
yarn run build-ts
pm2 stop build/server
pm2 start build/server
pm2 start npm -- start
echo "[+] Deploy end"
