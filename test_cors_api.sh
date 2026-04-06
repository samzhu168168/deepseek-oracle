#!/bin/bash

# CORS API Test Script
# Tests the backend API endpoints with proper CORS headers

API_BASE="https://deepseek-oracle-backend-production.up.railway.app"

echo "========================================="
echo "Testing Backend API CORS Configuration"
echo "========================================="
echo ""

# Test 1: Health Check
echo "Test 1: Health Check"
echo "---------------------"
curl -i -X GET "$API_BASE/health"
echo ""
echo ""

# Test 2: OPTIONS preflight for /api/capture-email
echo "Test 2: OPTIONS Preflight - /api/capture-email"
echo "-----------------------------------------------"
curl -i -X OPTIONS "$API_BASE/api/capture-email" \
  -H "Origin: https://www.elemental.bond" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type"
echo ""
echo ""

# Test 3: POST to /api/capture-email
echo "Test 3: POST - /api/capture-email"
echo "----------------------------------"
curl -i -X POST "$API_BASE/api/capture-email" \
  -H "Origin: https://www.elemental.bond" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "source": "email_gate",
    "score": 79,
    "element_pair": "Earth-Metal"
  }'
echo ""
echo ""

# Test 4: OPTIONS preflight for /api/verify-license
echo "Test 4: OPTIONS Preflight - /api/verify-license"
echo "------------------------------------------------"
curl -i -X OPTIONS "$API_BASE/api/verify-license" \
  -H "Origin: https://www.elemental.bond" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type"
echo ""
echo ""

echo "========================================="
echo "Tests Complete"
echo "========================================="
echo ""
echo "Expected Results:"
echo "- All responses should include: Access-Control-Allow-Origin: *"
echo "- OPTIONS requests should return 204 or 200"
echo "- POST requests should return 200 with JSON response"
echo ""
