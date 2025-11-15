"""
Sync existing Django users to UserModel
Run this once to migrate existing users
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from django.contrib.auth.models import User
from prediction.models import UserModel

def sync_users():
    print("Starting user sync...")
    
    # Get all Django users
    django_users = User.objects.all()
    print(f"Found {django_users.count()} Django users")
    
    # Get all UserModel users
    user_models = UserModel.objects.all()
    print(f"Found {user_models.count()} UserModel users")
    
    synced = 0
    skipped = 0
    
    for django_user in django_users:
        email = django_user.email or django_user.username
        
        # Check if UserModel already exists
        if UserModel.objects.filter(email=email).exists():
            print(f"✓ User already exists: {email}")
            skipped += 1
            continue
        
        # Create UserModel
        user_model = UserModel.objects.create(
            name=django_user.first_name or django_user.username,
            age=25,  # Default age
            email=email,
            password='placeholder'  # Password is managed by Django User
        )
        print(f"✅ Created UserModel for: {email} (ID: {user_model.id})")
        synced += 1
    
    print(f"\n✅ Sync complete!")
    print(f"   Synced: {synced}")
    print(f"   Skipped: {skipped}")
    print(f"   Total UserModel users: {UserModel.objects.count()}")
    
    # List all users
    print(f"\n📋 All UserModel users:")
    for um in UserModel.objects.all():
        print(f"   ID: {um.id}, Email: {um.email}, Name: {um.name}")

if __name__ == '__main__':
    sync_users()
