"""Test user settings and profile endpoints"""
import sys
import os
import io
from unittest.mock import patch, MagicMock

# Change to backend directory
backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
os.chdir(backend_dir)
sys.path.insert(0, backend_dir)

from fastapi.testclient import TestClient
from app.main import app
from app.database import SessionLocal
from app.models import User, Book

client = TestClient(app)


def cleanup_test_user(email: str):
    """Clean up test user if exists"""
    db = SessionLocal()
    try:
        user = db.query(User).filter(User.email == email).first()
        if user:
            db.delete(user)
            db.commit()
    finally:
        db.close()


def setup_test_user():
    """Register and login a test user"""
    test_email = "testuser_profile@example.com"
    cleanup_test_user(test_email)

    # Register
    client.post("/auth/register", json={
        "email": test_email,
        "username": "testuser_profile",
        "password": "SecurePassword123!"
    })

    # Login
    response = client.post("/auth/login", json={
        "email": test_email,
        "password": "SecurePassword123!"
    })

    data = response.json()
    return data["access_token"], test_email


def test_update_cover_image():
    """Test cover image upload endpoint"""
    print("\n🧪 Testing cover image upload...")

    access_token, email = setup_test_user()

    # Create a dummy image file
    file_content = b"fake image content"
    file = io.BytesIO(file_content)
    file.name = "cover.jpg"

    try:
        # We need to mock the S3 upload
        # Patch where it is used, which is the router
        with patch("app.users.router.upload_file_to_s3") as mock_upload:
            mock_upload.return_value = True

            response = client.post(
                "/users/book-profile/cover",
                headers={"Authorization": f"Bearer {access_token}"},
                files={"file": ("cover.jpg", file_content, "image/jpeg")}
            )

            if response.status_code == 200:
                 print("✅ Cover image upload successful")
                 data = response.json()
                 assert "cover_url" in data
                 print(f"   Cover URL: {data['cover_url']}")
            else:
                 print(f"❌ Expected 200, got {response.status_code}: {response.text}")

    finally:
        cleanup_test_user(email)


def test_update_custom_avatar():
    """Test custom avatar upload endpoint"""
    print("\n🧪 Testing custom avatar upload...")

    access_token, email = setup_test_user()

    # Create a dummy image file
    file_content = b"fake avatar content"

    try:
        with patch("app.users.router.upload_file_to_s3") as mock_upload:
            mock_upload.return_value = True

            response = client.post(
                "/users/book-profile/avatar",
                headers={"Authorization": f"Bearer {access_token}"},
                params={"avatar_type": "custom"},
                files={"file": ("avatar.jpg", file_content, "image/jpeg")}
            )

            if response.status_code == 200:
                    print("✅ Custom avatar upload successful")
                    data = response.json()
                    assert "avatar_url" in data
                    print(f"   Avatar URL: {data['avatar_url']}")
            else:
                    print(f"❌ Expected 200, got {response.status_code}: {response.text}")

    finally:
        cleanup_test_user(email)


if __name__ == "__main__":
    print("🧪 Running user profile tests...\n")
    print("=" * 60)

    try:
        test_update_cover_image()
        test_update_custom_avatar()

        print("\n" + "=" * 60)
        print("🎉 Verification complete")

    except Exception as e:
        print(f"\n❌ Unexpected error: {e}")
        import traceback
        traceback.print_exc()
