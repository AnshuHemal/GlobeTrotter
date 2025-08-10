from rest_framework.decorators import api_view, parser_classes
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.response import Response
from rest_framework import status
from mongoengine.errors import DoesNotExist
from django.contrib.auth.hashers import make_password, check_password
from django.utils import timezone
from django.utils.timezone import make_aware, is_naive, get_default_timezone
from django.conf import settings
from django.db import models
from django.shortcuts import render
from Auth.models import (
    User, Otp
)
from Auth.decorators import verify_token
from Auth.decorators import verify_token
from Admin.emails import send_otp_email
from django.http import HttpResponse
import jwt
from datetime import datetime, timedelta
import json
from bson import ObjectId
from django.shortcuts import get_object_or_404
from django.core.exceptions import ObjectDoesNotExist
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile
from django.core.mail import EmailMessage
import random
import traceback
import time
import uuid
from rest_framework.permissions import IsAuthenticated
import requests
import base64

def generate_token_and_set_cookie(response, user_id):
    payload = {
        "userId": str(user_id),
        "exp": datetime.utcnow() + timedelta(days=7),
        "iat": datetime.utcnow(),
    }

    token = jwt.encode(payload, settings.SECRET_KEY, algorithm="HS256")

    response.set_cookie(
        key="access_token",
        value=token,
        httponly=True,
        secure=settings.DEBUG is False,
        samesite="Strict",
        max_age=7 * 24 * 60 * 60,  # 7 days
    )
    return token

@api_view(["POST"])
def signup(request):
    data = request.data
    fullname = data.get("fullname")
    email = data.get("email")
    password = data.get("password")
    role = data.get("role")

    if not all([fullname, email, password, role]):
        return Response(
            {"success": False, "message": "All fields are required."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    if User.objects(email=email).first():
        return Response(
            {"success": False, "message": "Account already exists.."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    hashed_password = make_password(password)

    user = User(
        name=fullname, email=email, password=hashed_password, role=role, isverified=True
    )
    user.save()

    response = Response(
        {"success": True, "message": "Account successfully created.."},
        status=status.HTTP_201_CREATED,
    )

    generate_token_and_set_cookie(response, user.id)

    return response

@api_view(["POST"])
def login(request):
    data = request.data
    email = data.get("email")
    password = data.get("password")

    if not all([email, password]):
        return Response(
            {"success": False, "message": "Email and password are required."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    user = User.objects(email=email).first()
    if not user or not check_password(password, user.password):
        return Response(
            {"success": False, "message": "Invalid Credentials"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    user.lastLogin = timezone.now()
    user.onlineStatus = "online"
    user.lastSeen = timezone.now()
    user.save()

    response = Response(
        {
            "success": True,
            "message": "Successfully Logged In",
            "user": {
                "id": str(user.id),
                "email": user.email,
                "name": user.name,
                "role": user.role,
                "isverified": user.isverified,
                "phoneVerified": getattr(user, 'phoneVerified', False),
                "lastLogin": user.lastLogin,
                "onlineStatus": user.onlineStatus,
                "lastSeen": user.lastSeen,
            },
        },
        status=status.HTTP_200_OK,
    )

    generate_token_and_set_cookie(response, user.id)

    return response


@api_view(["POST"])
@verify_token
def logout(request):
    try:
        # Set user status to offline before logging out
        user = request.user
        user.onlineStatus = "offline"
        user.lastSeen = timezone.now()
        user.save()
    except Exception as e:
        # Continue with logout even if status update fails
        print(f"Error updating user status on logout: {e}")

    response = Response(
        {"success": True, "message": "Successfully Logged out.."},
        status=status.HTTP_200_OK,
    )

    response.delete_cookie("access_token")
    return response


@api_view(["GET"])
@verify_token
def verify_view(request):
    return Response({"success": True, "message": "Token is valid."}, status=200)


@api_view(["GET"])
@verify_token
def current_user(request):
    user = request.user
    
    data = {
        "success": True,
        "message": "User fetched..",
        "user": {
            "_id": str(user.id),
            "name": user.name,
            "email": user.email,
            "phone": user.phone,
            "role": user.role,
            "isverified": user.isverified,
            "phoneVerified": getattr(user, 'phoneVerified', False),
            "lastLogin": user.lastLogin,
            "onlineStatus": user.onlineStatus,
            "lastSeen": user.lastSeen,
        },
    }
    
    return Response(data, status=status.HTTP_200_OK)

@api_view(["POST"])
def send_otp(request):
    email = request.data.get("email")
    if not email:
        return Response({"success": False, "message": "Email is required"}, status=400)

    try:
        if User.objects(email=email).first():
            return Response(
                {"success": False, "message": "Account already exists.."},
                status=400,
            )

        otp_code = str(random.randint(100000, 999999))

        # Optional: Delete existing OTPs for the email to avoid duplicates
        Otp.objects(email=email).delete()

        Otp(email=email, code=otp_code).save()
        send_otp_email(email, otp_code)

        return Response(
            {"success": True, "message": "OTP sent to your email.."},
            status=status.HTTP_201_CREATED,
        )
    except Exception as e:
        return Response(
            {"success": False, "message": str(e)}, status=status.HTTP_400_BAD_REQUEST
        )


@api_view(["POST"])
def verify_otp(request):
    email = request.data.get("email")
    code = request.data.get("code")

    if not email or not code:
        return Response(
            {"success": False, "message": "Email and code are required"},
            status=400,
        )

    try:
        otp = Otp.objects(email=email, code=code).first()
        if not otp:
            return Response(
                {"success": False, "message": "Invalid or expired OTP"}, status=400
            )

        otp.delete()

        return Response(
            {"success": True, "message": "Email verified successfully"},
            status=200,
        )
    except Exception as e:
        return Response(
            {
                "success": False,
                "message": "OTP verification failed",
                "error": str(e),
            },
            status=500,
        )