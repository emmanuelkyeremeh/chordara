#!/bin/bash

echo "🎵 Setting up Chordara - AI-Powered Music Production App"
echo "========================================================"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

echo "✅ Node.js and npm are installed"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Check if installation was successful
if [ $? -eq 0 ]; then
    echo "✅ Dependencies installed successfully"
else
    echo "❌ Failed to install dependencies"
    exit 1
fi

# Copy environment file
if [ ! -f .env ]; then
    echo "📝 Creating environment file..."
    cp example.env .env
    echo "✅ Environment file created. Please edit .env with your API keys."
else
    echo "✅ Environment file already exists"
fi

echo ""
echo "🎉 Setup complete!"
echo ""
echo "Next steps:"
echo "1. Edit .env file with your Firebase and OpenRouter API keys"
echo "2. Set up Firebase project with Authentication, Firestore, and Storage"
echo "3. Run 'npm run dev' to start the development server"
echo ""
echo "For detailed setup instructions, see README.md"
