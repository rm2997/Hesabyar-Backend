#!/bin/bash

DEPLOY_DIR="./deploy"

echo "Start deploying..."

npm install
npm run build

rm -rf $DEPLOY_DIR
mkdir $DEPLOY_DIR

echo "Start copying..."

cp -r dist $DEPLOY_DIR/
cp package.json $DEPLOY_DIR/
cp package-lock.json $DEPLOY_DIR/

if [ -f .env ]; then
  cp .env $DEPLOY_DIR/
fi

echo "Deploying finished..."


