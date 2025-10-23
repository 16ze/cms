#!/bin/bash

echo "🧪 TEST DES APIS DE LOGIN"
echo "=========================="
echo ""

# Test 1: Super Admin Login
echo "📝 Test 1: Super Admin Login"
echo "POST /api/auth/login/super-admin"
curl -X POST http://localhost:3000/api/auth/login/super-admin \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@kairodigital.com","password":"kairo2025!"}' \
  -c cookies.txt \
  -s | jq '.'
echo ""
echo ""

# Test 2: Tenant User Login (Salon)
echo "📝 Test 2: Tenant User Login (Salon)"
echo "POST /api/auth/login/tenant"
curl -X POST http://localhost:3000/api/auth/login/tenant \
  -H "Content-Type: application/json" \
  -d '{"email":"sophie@salon-elegance.fr","password":"test2025"}' \
  -c cookies-tenant1.txt \
  -s | jq '.'
echo ""
echo ""

# Test 3: Tenant User Login (TechStore)
echo "📝 Test 3: Tenant User Login (TechStore)"
echo "POST /api/auth/login/tenant"
curl -X POST http://localhost:3000/api/auth/login/tenant \
  -H "Content-Type: application/json" \
  -d '{"email":"manager@techstore.fr","password":"test2025"}' \
  -c cookies-tenant2.txt \
  -s | jq '.'
echo ""
echo ""

# Test 4: Get Current User (Super Admin)
echo "📝 Test 4: Get Current User (Super Admin)"
echo "GET /api/auth/me"
curl -X GET http://localhost:3000/api/auth/me \
  -b cookies.txt \
  -s | jq '.'
echo ""
echo ""

# Cleanup
rm -f cookies.txt cookies-tenant1.txt cookies-tenant2.txt

echo "✅ Tests terminés !"

