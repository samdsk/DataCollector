#!/bin/bash

# === USER INPUT ===
read -p "Enter the Raspberry Pi username: " USER
read -p "Enter the Raspberry Pi IP address: " HOST
read -s -p "Enter the password: " PASSWORD
echo ""

REMOTE_DIR=/home/$USER/data-collector
ZIP_NAME=deploy.zip
BUILD_DIR=build
PM2_NAME=data-collector
ENTRY_FILE=server.js

# Check for sshpass
if ! command -v sshpass &> /dev/null; then
    echo "Error: 'sshpass' is not installed. Install it using: sudo apt install sshpass"
    exit 1
fi

# Build and zip
echo "==> Preparing build directory..."
rm -rf $BUILD_DIR $ZIP_NAME
mkdir -p $BUILD_DIR
cp -r index.js package*.json src config .env $BUILD_DIR 2>/dev/null
zip -r $ZIP_NAME $BUILD_DIR > /dev/null

# Send the zip to Raspberry Pi
echo "==> Sending zip to Raspberry Pi..."
sshpass -p "$PASSWORD" scp $ZIP_NAME $USER@$HOST:/home/$USER/

# SSH into Raspberry Pi and deploy
echo "==> Connecting via SSH and deploying..."
sshpass -p "$PASSWORD" ssh $USER@$HOST << EOF
rm -rf $REMOTE_DIR
mkdir -p $REMOTE_DIR
unzip -o $ZIP_NAME -d $REMOTE_DIR > /dev/null
cd $REMOTE_DIR/$BUILD_DIR

echo "==> Installing dependencies..."
npm install

echo "==> Restarting PM2..."
pm2 stop $PM2_NAME || true
pm2 start $ENTRY_FILE --name $PM2_NAME
pm2 save

echo "==> Deploy completed on Raspberry Pi!"
EOF