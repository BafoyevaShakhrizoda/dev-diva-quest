#!/usr/bin/env python
"""
Quick API Test Script for DevGirlzz
Tests registration, login, and profile endpoints
"""

import requests
import json
import sys
from datetime import datetime

BASE_URL = "http://localhost:8000/api"
TEST_EMAIL = f"test-user-{datetime.now().timestamp()}@example.com"
TEST_PASSWORD = "TestPassword123!"

def test_registration():
    """Test user registration"""
    print("\n🔵 Testing User Registration...")
    url = f"{BASE_URL}/users/register/"
    data = {
        "email": TEST_EMAIL,
        "password": TEST_PASSWORD,
        "first_name": "Test",
        "last_name": "User"
    }
    
    try:
        response = requests.post(url, json=data)
        if response.status_code == 201:
            print(f"✅ Registration successful!")
            print(f"   Email: {TEST_EMAIL}")
            print(f"   Response: {response.json()}")
            return True
        else:
            print(f"❌ Registration failed with status {response.status_code}")
            print(f"   Error: {response.text}")
            return False
    except Exception as e:
        print(f"❌ Connection error: {e}")
        return False

def test_login():
    """Test user login"""
    print("\n🔵 Testing User Login...")
    url = f"{BASE_URL}/users/login/"
    data = {
        "email": TEST_EMAIL,
        "password": TEST_PASSWORD
    }
    
    try:
        response = requests.post(url, json=data)
        if response.status_code == 200:
            print(f"✅ Login successful!")
            token = response.json().get('token')
            print(f"   Token: {token[:20]}...")
            return token
        else:
            print(f"❌ Login failed with status {response.status_code}")
            print(f"   Error: {response.text}")
            return None
    except Exception as e:
        print(f"❌ Connection error: {e}")
        return None

def test_profile(token):
    """Test get user profile"""
    if not token:
        print("⚠️  Skipping profile test (no token)")
        return False
        
    print("\n🔵 Testing Get User Profile...")
    url = f"{BASE_URL}/users/profile/"
    headers = {"Authorization": f"Token {token}"}
    
    try:
        response = requests.get(url, headers=headers)
        if response.status_code == 200:
            print(f"✅ Profile retrieval successful!")
            print(f"   Profile: {json.dumps(response.json(), indent=2)}")
            return True
        else:
            print(f"❌ Profile retrieval failed with status {response.status_code}")
            print(f"   Error: {response.text}")
            return False
    except Exception as e:
        print(f"❌ Connection error: {e}")
        return False

def test_email_config():
    """Test email configuration"""
    print("\n🔵 Testing Email Configuration...")
    
    import os
    from django.conf import settings
    
    email_host_user = settings.EMAIL_HOST_USER
    email_backend = settings.EMAIL_BACKEND
    
    if not email_host_user:
        print("❌ EMAIL_HOST_USER not configured in .env")
        print("   Please add EMAIL_HOST_USER to your .env file")
        return False
    else:
        print(f"✅ Email configured!")
        print(f"   HOST_USER: {email_host_user}")
        print(f"   BACKEND: {email_backend}")
        return True

def main():
    """Run all tests"""
    print("\n" + "="*60)
    print("🧪 DevGirlzz API Test Suite")
    print("="*60)
    
    print(f"\nTesting API at: {BASE_URL}")
    print(f"Test Email: {TEST_EMAIL}")
    
    # Run tests
    registration_ok = test_registration()
    
    if registration_ok:
        token = test_login()
        if token:
            profile_ok = test_profile(token)
        else:
            print("\n⚠️  Could not proceed to profile test")
    
    print("\n" + "="*60)
    print("✅ Test completed!")
    print("="*60)
    print("\n📋 Next steps:")
    print("1. Check email for verification link")
    print("2. If you didn't receive email, configure EMAIL_HOST_USER in .env")
    print("3. See EMAIL_SETUP.md for detailed email configuration")

if __name__ == "__main__":
    main()
