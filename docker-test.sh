#!/bin/bash

# Docker HTTPS Test Script for Night Sky Navigator
# This script demonstrates how to set up and test the HTTPS Docker configuration

set -e

echo "🌌 Night Sky Navigator - Docker HTTPS Setup Test"
echo "=================================================="

# Function to check if certificates exist
check_certificates() {
    if [ -f "certs/cert.pem" ] && [ -f "certs/key.pem" ]; then
        echo "✅ SSL certificates found"
        return 0
    else
        echo "❌ SSL certificates not found"
        return 1
    fi
}

# Function to generate certificates
generate_certificates() {
    echo "🔐 Generating SSL certificates..."
    mkdir -p certs
    
    # Check if openssl is available
    if ! command -v openssl &> /dev/null; then
        echo "❌ OpenSSL not found. Please install OpenSSL to generate certificates."
        exit 1
    fi
    
    openssl req -x509 -newkey rsa:4096 -keyout certs/key.pem -out certs/cert.pem \
        -sha256 -days 365 -nodes \
        -subj "/C=US/ST=Dev/L=Dev/O=Dev/OU=Dev/CN=localhost" \
        -addext "subjectAltName=DNS:localhost,IP:127.0.0.1,IP:0.0.0.0"
    
    echo "✅ SSL certificates generated successfully"
}

# Function to test Docker setup
test_docker_setup() {
    echo "🐳 Testing Docker configuration..."
    
    # Test if docker and docker-compose are available
    if ! command -v docker &> /dev/null; then
        echo "❌ Docker not found. Please install Docker."
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
        echo "❌ Docker Compose not found. Please install Docker Compose."
        exit 1
    fi
    
    echo "✅ Docker and Docker Compose are available"
}

# Function to show available commands
show_commands() {
    echo ""
    echo "🚀 Available Docker Commands:"
    echo "=============================="
    echo ""
    echo "Development with HTTPS:"
    echo "  npm run docker:dev-https     # HTTPS proxy (recommended)"
    echo "  npm run docker:dev           # Direct HTTPS development"
    echo ""
    echo "Development with HTTP:"
    echo "  npm run docker:dev-http      # HTTP development"
    echo ""
    echo "Production:"
    echo "  npm run docker:prod-https    # Production with HTTPS"
    echo "  npm run docker:prod          # Production with HTTP"
    echo ""
    echo "Testing:"
    echo "  npm run docker:test          # Run type checking"
    echo "  npm run docker:lint          # Run linting"
    echo ""
    echo "Building:"
    echo "  npm run docker:build         # Build HTTP production image"
    echo "  npm run docker:build-https   # Build HTTPS production image"
    echo ""
}

# Function to show access instructions
show_access_info() {
    echo ""
    echo "🌐 Access Information:"
    echo "======================"
    echo ""
    echo "Local access:"
    echo "  https://localhost                # HTTPS"
    echo "  http://localhost:3000           # HTTP development"
    echo "  http://localhost:8080           # HTTP production"
    echo ""
    echo "Mobile device access:"
    echo "  1. Find your IP: ip addr show | grep inet"
    echo "  2. Access: https://YOUR_IP_ADDRESS"
    echo "  3. Accept certificate warning"
    echo ""
    echo "💡 HTTPS is required for AbsoluteOrientationSensor API"
    echo ""
}

# Function to demonstrate a complete setup
demo_setup() {
    echo "🎬 Running complete HTTPS setup demo..."
    
    # Generate certificates if they don't exist
    if ! check_certificates; then
        generate_certificates
    fi
    
    echo ""
    echo "🏗️  Setup complete! Your Docker HTTPS environment is ready."
    show_commands
    show_access_info
    
    echo "To start the HTTPS development server:"
    echo "  npm run docker:dev-https"
    echo ""
    echo "Then open https://localhost in your browser"
    echo "(Accept the self-signed certificate warning)"
}

# Main script logic
case "${1:-demo}" in
    "certs")
        generate_certificates
        ;;
    "check")
        test_docker_setup
        check_certificates
        ;;
    "demo")
        test_docker_setup
        demo_setup
        ;;
    "help")
        show_commands
        show_access_info
        ;;
    *)
        echo "Usage: $0 [certs|check|demo|help]"
        echo ""
        echo "  certs  - Generate SSL certificates"
        echo "  check  - Check Docker and certificate setup"
        echo "  demo   - Run complete setup demonstration"
        echo "  help   - Show available commands"
        exit 1
        ;;
esac