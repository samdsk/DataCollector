#!/bin/bash

# === USER INPUT ===
read -p "Enter the Raspberry Pi username: " USER
read -p "Enter the Raspberry Pi IP address: " HOST

REMOTE_DIR=/home/$USER/data-collector
TMP_DIR=/home/$USER/tmp-deploy
ZIP_NAME=deploy.zip
ENV_FILE=.env
PM2_NAME=data-collector
ENTRY_FILE=index.js

# Check if ZIP file exists
if [ ! -f "$ZIP_NAME" ]; then
    echo "Error: $ZIP_NAME not found. Run 'npm run build' first."
    exit 1
fi

# Check if .env file exists
if [ ! -f "$ENV_FILE" ]; then
    echo "Error: $ENV_FILE not found. Make sure the .env file is in the current directory."
    exit 1
fi

# Send the zip and .env to Raspberry Pi
echo "==> Sending $ZIP_NAME and $ENV_FILE to Raspberry Pi..."
scp $ZIP_NAME $ENV_FILE $USER@$HOST:/home/$USER/

# SSH into Raspberry Pi and deploy
echo "==> Connecting via SSH and deploying..."
ssh $USER@$HOST << EOF

mkdir -p $TMP_DIR
unzip -o $ZIP_NAME -d $TMP_DIR > /dev/null

# Ensure target exists and backup Results and Logs if necessary
mkdir -p $REMOTE_DIR
mkdir -p $REMOTE_DIR/results $REMOTE_DIR/logs

# Move existing logs and results temporarily
mv $REMOTE_DIR/results $TMP_DIR/results_backup 2>/dev/null
mv $REMOTE_DIR/logs $TMP_DIR/logs_backup 2>/dev/null

# Copy build files and .env
cp -r $TMP_DIR/* $REMOTE_DIR/
cp $ENV_FILE $REMOTE_DIR/

# Restore preserved folders
mv $TMP_DIR/results_backup $REMOTE_DIR/results 2>/dev/null
mv $TMP_DIR/logs_backup $REMOTE_DIR/logs 2>/dev/null

# Cleanup temporary folder and zip
rm -rf $TMP_DIR $ZIP_NAME $ENV_FILE

cd $REMOTE_DIR

TIMESTAMP=\$(date '+%Y-%m-%d %H:%M:%S')
echo "==> [\$TIMESTAMP] Checking dependencies..."
if [ ! -d "node_modules" ]; then
  echo "==> [\$TIMESTAMP] node_modules not found, running npm install..."
  npm install
else
  echo "==> [\$TIMESTAMP] node_modules already exists, skipping npm install."
fi

TIMESTAMP=\$(date '+%Y-%m-%d %H:%M:%S')
echo "==> [\$TIMESTAMP] Restarting PM2..."
pm2 stop $PM2_NAME || true
pm2 start $ENTRY_FILE --name $PM2_NAME
pm2 save

TIMESTAMP=\$(date '+%Y-%m-%d %H:%M:%S')
echo "==> [\$TIMESTAMP] Deploy completed on Raspberry Pi!"

pm2 logs $PM2_NAME --lines 500
EOF
