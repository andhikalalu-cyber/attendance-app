#!/bin/bash
# Test script untuk CRUD operations di Netlify Functions lokal

BASE_URL="http://localhost:8888/.netlify/functions"

echo "=== GET All Attendance ==="
curl -X GET "${BASE_URL}/get-attendance" -H "Content-Type: application/json" | jq .

echo -e "\n\n=== POST Add Attendance ==="
curl -X POST "${BASE_URL}/add-attendance" \
  -H "Content-Type: application/json" \
  -d '{"name":"Budi","timestamp":"2026-02-07T10:00:00Z"}' | jq .

echo -e "\n\n=== GET All After Add ==="
curl -X GET "${BASE_URL}/get-attendance" -H "Content-Type: application/json" | jq .

echo -e "\n\n=== PUT Update (ID 1) ==="
curl -X PUT "${BASE_URL}/update-attendance?id=1" \
  -H "Content-Type: application/json" \
  -d '{"name":"Budi Updated"}' | jq .

echo -e "\n\n=== GET All After Update ==="
curl -X GET "${BASE_URL}/get-attendance" -H "Content-Type: application/json" | jq .

echo -e "\n\n=== DELETE (ID 1) ==="
curl -X DELETE "${BASE_URL}/delete-attendance?id=1" \
  -H "Content-Type: application/json" | jq .

echo -e "\n\n=== GET All After Delete ==="
curl -X GET "${BASE_URL}/get-attendance" -H "Content-Type: application/json" | jq .
