#!/bin/bash

# Deploy script for Vercel
echo "🚀 Starting deployment process..."

# Check if vercel CLI is installed
if ! command -v vercel &> /dev/null
then
    echo "❌ Vercel CLI not found. Installing..."
    npm i -g vercel
fi

# Check if .env exists
if [ ! -f .env ]; then
    echo "⚠️  Warning: .env file not found"
    echo "Make sure to set environment variables in Vercel Dashboard"
fi

# Run build test
echo "🔨 Testing build locally..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
    
    # Ask for confirmation
    read -p "Deploy to Vercel? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]
    then
        echo "🚀 Deploying to Vercel..."
        vercel --prod
        
        if [ $? -eq 0 ]; then
            echo "✅ Deployment successful!"
            echo "🌐 Your app is now live!"
        else
            echo "❌ Deployment failed. Check logs above."
        fi
    else
        echo "❌ Deployment cancelled"
    fi
else
    echo "❌ Build failed. Fix errors before deploying."
    exit 1
fi
