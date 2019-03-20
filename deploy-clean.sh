#!/bin/bash

echo "[+] Start deploy-clean."
# EC2 was already setup. CI/CD gets update and rebuild it.
\rm -rf /home/ubuntu/studystates-server
echo "[+] End deploy-clean."
