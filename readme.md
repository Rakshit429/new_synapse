# Event Management System API Documentation

A comprehensive FastAPI backend for managing events, clubs, and fests at IIT Delhi.

## Table of Contents
- [Overview](#overview)
- [Authentication](#authentication)
- [API Endpoints](#api-endpoints)
  - [1. Authentication APIs](#1-authentication-apis)
  - [2. Event APIs](#2-event-apis)
  - [3. User Profile APIs](#3-user-profile-apis)
  - [4. Organization Management APIs](#4-organization-management-apis)
  - [5. Admin APIs](#5-admin-apis)
- [Authorization & Permissions](#authorization--permissions)
- [Error Handling](#error-handling)

---

## Overview

**Base URL**: `/api/v1`

**Authentication**: JWT Bearer Token (obtained via Microsoft OAuth)

**Supported Features**:
- Microsoft Azure AD authentication (IIT Delhi emails only)
- Event browsing and registration
- Personalized event recommendations
- Organization/club management
- Team member management
- Admin user authorization

---

## Authentication

### JWT Token Usage
Include the JWT token in the Authorization header for protected endpoints:

```http
Authorization: Bearer <your_access_token>
```

### Token Expiration
Tokens expire after **7 days** by default.

---

## API Endpoints

### 1. Authentication APIs

#### `POST /auth/login/microsoft`
Authenticate users via Microsoft OAuth and issue JWT tokens.

**Authentication**: None required

**Request Body**:
```json
{
  "code": "string"
}
```

**Response** (200 OK):
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "user": {
    "id": 123,
    "name": "Student Name",
    "email": "student@iitd.ac.in",
    "entry_number": "2024CS10020",
    "department": "Computer Science",
    "hostel": "Aravali",
    "interests": ["Coding", "Music"],
    "photo_url": "https://example.com/photo.jpg",
    "is_active": true,
    "is_superuser": false,
    "created_at": "2026-01-21T10:30:00",
    "authorizations": [
      {
        "id": 1,
        "org_name": "DevClub",
        "role_name": "club_head",
        "org_type": "Club"
      }
    ]
  }
}
```

**Process**:
1. Validates Microsoft authorization code with Azure AD
2. Retrieves user email and name from Microsoft
3. Validates email domain (`@iitd.ac.in` only)
4. Creates new user if first-time login
5. Generates JWT access token

**Error Responses**:
- `400`: Non-IIT Delhi email domain
- `401`: Invalid Microsoft authorization code

---

#### `GET /auth/me`
Fetch the current logged-in user's profile.

**Authentication**: Required

**Response** (200 OK):
```json
{
  "id": 123,
  "name": "Student Name",
  "email": "student@iitd.ac.in",
  "entry_number": "2024CS10020",
  "department": "Computer Science",
  "hostel": "Aravali",
  "interests": ["Coding", "Music"],
  "photo_url": "https://example.com/photo.jpg",
  "is_active": true,
  "is_superuser": false,
  "created_at": "2026-01-21T10:30:00",
  "authorizations": [
    {
      "id": 1,
      "org_name": "DevClub",
      "role_name": "club_head",
      "org_type": "Club"
    }
  ]
}
```

---

### 2. Event APIs

#### `GET /events/`
Browse and search all events with filters and sorting.

**Authentication**: Optional (works for both logged-in and anonymous users)

**Query Parameters**:
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `sort_by` | string | `"date"` | Sort by `"date"` or `"popularity"` |
| `org_type` | string | null | Filter by organization type (e.g., `"Club"`, `"Fest"`) |
| `search` | string | null | Search events by name (case-insensitive) |
| `skip` | integer | 0 | Pagination offset |
| `limit` | integer | 20 | Number of results per page |

**Example Request**:
```http
GET /events/?sort_by=date&org_type=Club&search=hackathon&skip=0&limit=10
```

**Response** (200 OK):
```json
[
  {
    "id": 1,
    "name": "DevClub Hackathon",
    "description": "24-hour coding competition with amazing prizes...",
    "date": "2026-02-15T09:00:00",
    "venue": "LHC Auditorium",
    "org_name": "DevClub",
    "org_type": "Club",
    "tags": ["coding", "hackathon", "prizes"],
    "is_private": false,
    "image_url": "abc123.jpg",
    "is_registered": false
  }
]
```

**Notes**:
- `is_registered` is `true` if logged-in user is registered, `false` otherwise
- For anonymous users, `is_registered` is always `false`

---

#### `GET /events/recommendations`
Get AI-driven personalized event recommendations.

**Authentication**: Required

**Response** (200 OK):
```json
[
  {
    "id": 5,
    "name": "Machine Learning Workshop",
    "description": "Introduction to neural networks...",
    "date": "2026-02-20T18:00:00",
    "venue": "LH-121",
    "org_name": "Data Science Club",
    "org_type": "Club",
    "tags": ["AI", "ML", "workshop"],
    "is_private": false,
    "image_url": "workshop.jpg",
    "is_registered": false
  }
]
```

**Notes**:
- Recommendations based on user interests and registration history
- Returns personalized list of upcoming events

---

#### `GET /events/{event_id}`
Get detailed information about a specific event.

**Authentication**: Required

**Path Parameters**:
| Parameter | Type | Description |
|-----------|------|-------------|
| `event_id` | integer | The event ID |

**Response** (200 OK):
```json
{
  "id": 1,
  "name": "DevClub Hackathon",
  "description": "24-hour coding competition...",
  "date": "2026-02-15T09:00:00",
  "venue": "LHC Auditorium",
  "org_name": "DevClub",
  "org_type": "Club",
  "tags": ["coding", "hackathon"],
  "is_private": false,
  "image_url": "abc123.jpg",
  "is_registered": true,
  "custom_form_schema": [
    {
      "label": "T-shirt Size",
      "type": "select",
      "options": ["S", "M", "L", "XL"]
    },
    {
      "label": "Dietary Restrictions",
      "type": "text"
    }
  ]
}
```

**Error Responses**:
- `404`: Event not found

---

#### `POST /events/{event_id}/register`
Register the current user for an event.

**Authentication**: Required

**Path Parameters**:
| Parameter | Type | Description |
|-----------|------|-------------|
| `event_id` | integer | The event ID to register for |

**Request Body**:
```json
{
  "custom_answers": {
    "T-shirt Size": "M",
    "Dietary Restrictions": "Vegetarian"
  }
}
```

**Response** (200 OK):
```json
{
  "status": "success",
  "msg": "Registered successfully"
}
```

**Error Responses**:
- `404`: Event not found
- `400`: Already registered for this event

---

### 3. User Profile APIs

#### `PUT /user/profile`
Update the current user's profile information.

**Authentication**: Required

**Request Body** (all fields optional):
```json
{
  "interests": ["Coding", "Music", "Sports"],
  "photo_url": "https://example.com/photo.jpg",
  "department": "Computer Science",
  "hostel": "Aravali"
}
```

**Response** (200 OK):
```json
{
  "id": 123,
  "name": "Student Name",
  "email": "student@iitd.ac.in",
  "entry_number": "2024CS10020",
  "department": "Computer Science",
  "hostel": "Aravali",
  "interests": ["Coding", "Music", "Sports"],
  "photo_url": "https://example.com/photo.jpg",
  "is_active": true,
  "is_superuser": false,
  "created_at": "2026-01-21T10:30:00",
  "authorizations": []
}
```

---

#### `GET /user/calendar`
Get all events the current user has registered for.

**Authentication**: Required

**Response** (200 OK):
```json
[
  {
    "id": 1,
    "name": "DevClub Hackathon",
    "description": "24-hour coding competition...",
    "date": "2026-02-15T09:00:00",
    "venue": "LHC Auditorium",
    "org_name": "DevClub",
    "org_type": "Club",
    "tags": ["coding", "hackathon"],
    "is_private": false,
    "image_url": "abc123.jpg",
    "is_registered": true
  }
]
```

---

### 4. Organization Management APIs

These APIs are for users who manage clubs, fests, or departments.

#### `GET /org/dashboard`
Get overview statistics for your organization.

**Authentication**: Required + Must have authorization role

**Response** (200 OK):
```json
{
  "org_name": "DevClub",
  "your_role": "club_head",
  "total_events": 12,
  "total_registrations": 450
}
```

**Error Responses**:
- `403`: User doesn't manage any organization

**Notes**:
- Uses the first authorization role from current user
- Shows aggregate statistics for the organization

---

#### `POST /org/events`
Create a new event under your organization.

**Authentication**: Required + Must have authorization role

**Content-Type**: `multipart/form-data`

**Form Fields**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | Yes | Event name |
| `description` | string | Yes | Event description |
| `date` | string | Yes | ISO datetime (e.g., `"2026-02-20T18:00:00"`) |
| `venue` | string | Yes | Event location |
| `tags` | string | No | JSON array string (e.g., `'["coding", "workshop"]'`) |
| `custom_form_schema` | string | No | JSON array string for registration form fields |
| `photo` | file | No | Event image file |

**Example Form Data**:
```
name: "DevClub Workshop"
description: "Introduction to React.js with hands-on projects..."
date: "2026-02-20T18:00:00"
venue: "LH-121"
tags: '["coding", "workshop", "react"]'
custom_form_schema: '[{"label": "Experience Level", "type": "select", "options": ["Beginner", "Intermediate", "Advanced"]}]'
photo: <file>
```

**Response** (200 OK):
```json
{
  "id": 15,
  "name": "DevClub Workshop",
  "description": "Introduction to React.js with hands-on projects...",
  "date": "2026-02-20T18:00:00",
  "venue": "LH-121",
  "org_name": "DevClub",
  "org_type": "Club",
  "event_manager_email": "head@iitd.ac.in",
  "tags": ["coding", "workshop", "react"],
  "is_private": false,
  "image_url": "abc-def-123.jpg",
  "is_registered": false
}
```

**Notes**:
- Image is saved to `static/uploads/` with UUID filename
- `org_name`, `org_type`, and `event_manager_email` are auto-populated from user's role

---

#### `GET /org/team`
List all team members of your organization.

**Authentication**: Required + Must have authorization role

**Response** (200 OK):
```json
[
  {
    "user_id": 5,
    "name": "John Doe",
    "email": "john@iitd.ac.in",
    "role": "club_head"
  },
  {
    "user_id": 8,
    "name": "Jane Smith",
    "email": "jane@iitd.ac.in",
    "role": "coordinator"
  },
  {
    "user_id": 12,
    "name": "Bob Wilson",
    "email": "bob@iitd.ac.in",
    "role": "executive"
  }
]
```

---

#### `POST /org/team`
Add a new team member to your organization.

**Authentication**: Required + Must be organization head (role contains "head")

**Request Body**:
```json
{
  "email": "newmember@iitd.ac.in",
  "role": "coordinator"
}
```

**Valid Roles**:
- `"coordinator"`
- `"executive"`

**Response** (200 OK):
```json
{
  "msg": "Added John Doe as coordinator"
}
```

**Error Responses**:
- `403`: Only heads can add team members
- `404`: User with that email not found (user must login once first)
- `400`: Invalid role or user already in team

---

#### `DELETE /org/team/{user_id}`
Remove a team member from your organization.

**Authentication**: Required + Must be organization head

**Path Parameters**:
| Parameter | Type | Description |
|-----------|------|-------------|
| `user_id` | integer | The user ID to remove |

**Response** (200 OK):
```json
{
  "msg": "Team member removed"
}
```

**Error Responses**:
- `403`: Only heads can remove team members
- `400`: Cannot remove yourself
- `404`: Member not found in your team

---

### 5. Admin APIs

These APIs are only accessible to superusers.

#### `POST /admin/authorize`
Grant organization management permissions to a user.

**Authentication**: Required + Must be superuser

**Query Parameters**:
| Parameter | Type | Description |
|-----------|------|-------------|
| `email` | string | User's email address |

**Request Body**:
```json
{
  "org_name": "DevClub",
  "role_name": "club_head",
  "org_type": "Club"
}
```

**Response** (200 OK):
```json
{
  "msg": "Authorized Student Name for DevClub"
}
```

**Notes**:
- If user already has this exact role: `{"msg": "User already has this role"}`
- Idempotent operation (safe to call multiple times)

**Error Responses**:
- `403`: Not a superuser
- `404`: User with that email not found

---

#### `GET /admin/users`
List all registered users in the system.

**Authentication**: Required + Must be superuser

**Response** (200 OK):
```json
[
  {
    "id": 1,
    "name": "Student One",
    "email": "student1@iitd.ac.in",
    "entry_number": "2024CS10001",
    "department": "Computer Science",
    "hostel": "Aravali",
    "interests": ["Coding"],
    "photo_url": null,
    "is_active": true,
    "is_superuser": false,
    "created_at": "2026-01-15T08:00:00",
    "authorizations": [
      {
        "id": 1,
        "org_name": "DevClub",
        "role_name": "club_head",
        "org_type": "Club"
      }
    ]
  }
]
```

---

## Authorization & Permissions

### Role Hierarchy

1. **Superuser** (`is_superuser: true`)
   - Full system access
   - Can authorize any user for any organization
   - Access to all `/admin/*` endpoints

2. **Organization Heads** (role_name contains "head")
   - Can manage their organization's team
   - Can create events for their organization
   - Can add/remove coordinators and executives
   - Access to all `/org/*` endpoints

3. **Coordinators/Executives**
   - Can create events for their organization
   - Can view team members
   - Cannot add/remove team members
   - Limited access to `/org/*` endpoints

4. **Regular Users**
   - Can browse and search events
   - Can register for events
   - Can update their own profile
   - Access to `/events/*`, `/user/*`, and `/auth/*` endpoints

### Authentication Requirements

| Endpoint | Authentication | Additional Requirements |
|----------|----------------|------------------------|
| `POST /auth/login/microsoft` | None | Valid Microsoft OAuth code |
| `GET /auth/me` | Required | - |
| `GET /events/` | Optional | - |
| `GET /events/recommendations` | Required | - |
| `GET /events/{event_id}` | Required | - |
| `POST /events/{event_id}/register` | Required | - |
| `PUT /user/profile` | Required | - |
| `GET /user/calendar` | Required | - |
| `GET /org/dashboard` | Required | Must have authorization role |
| `POST /org/events` | Required | Must have authorization role |
| `GET /org/team` | Required | Must have authorization role |
| `POST /org/team` | Required | Must be organization head |
| `DELETE /org/team/{user_id}` | Required | Must be organization head |
| `POST /admin/authorize` | Required | Must be superuser |
| `GET /admin/users` | Required | Must be superuser |

---

## Error Handling

### Error Response Format

All endpoints return errors in this consistent format:

```json
{
  "detail": "Error message explaining what went wrong"
}
```

### Common HTTP Status Codes

| Status Code | Meaning | Common Scenarios |
|-------------|---------|------------------|
| `200` | OK | Successful request |
| `400` | Bad Request | Invalid input, duplicate registration, invalid role |
| `401` | Unauthorized | Missing or invalid JWT token |
| `403` | Forbidden | Insufficient permissions, not a superuser |
| `404` | Not Found | User, event, or resource doesn't exist |
| `422` | Unprocessable Entity | Malformed request body, validation error |
| `500` | Internal Server Error | Unexpected server error |

### Example Error Responses

**401 Unauthorized**:
```json
{
  "detail": "Could not validate credentials"
}
```

**403 Forbidden**:
```json
{
  "detail": "Not a Superuser"
}
```

**404 Not Found**:
```json
{
  "detail": "Event not found"
}
```

**400 Bad Request**:
```json
{
  "detail": "Already registered"
}
```

---

## Configuration

### Environment Variables

The system requires the following environment variables (typically in `.env` file):

```env
# Project
PROJECT_NAME=Event Management System
API_V1_STR=/api/v1

# Security
SECRET_KEY=your-secret-key-here
ACCESS_TOKEN_EXPIRE_MINUTES=10080  # 7 days

# File Upload
UPLOAD_FOLDER=static/uploads

# CORS
BACKEND_CORS_ORIGINS=["http://localhost:3000", "http://localhost:8000"]

# Database
DATABASE_URL=sqlite:///./app.db  # or PostgreSQL connection string

# Microsoft OAuth
MS_CLIENT_ID=your-azure-client-id
MS_CLIENT_SECRET=your-azure-client-secret
MS_TENANT_ID=your-azure-tenant-id
MS_REDIRECT_URI=http://localhost:3000/auth/callback
```

---

## Quick Start Examples

### Example 1: Browse Events (Anonymous)
```bash
curl -X GET "http://localhost:8000/api/v1/events/?sort_by=date&limit=5"
```

### Example 2: Login with Microsoft
```bash
curl -X POST "http://localhost:8000/api/v1/auth/login/microsoft" \
  -H "Content-Type: application/json" \
  -d '{"code": "your-microsoft-oauth-code"}'
```

### Example 3: Register for Event
```bash
curl -X POST "http://localhost:8000/api/v1/events/1/register" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"custom_answers": {"T-shirt Size": "M"}}'
```

### Example 4: Create Event (Organization)
```bash
curl -X POST "http://localhost:8000/api/v1/org/events" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "name=Tech Workshop" \
  -F "description=Learn Python basics" \
  -F "date=2026-03-15T18:00:00" \
  -F "venue=LH-121" \
  -F 'tags=["coding", "python"]' \
  -F "photo=@event_image.jpg"
```

---

## Database Schema Overview

### Core Tables

1. **users**: Student profiles with interests and authentication data
2. **auth_roles**: Organization memberships and roles (club_head, coordinator, etc.)
3. **events**: Event details including custom registration forms
4. **registrations**: User event registrations with custom answers

### Key Relationships

- User → AuthRoles (one-to-many): A user can manage multiple organizations
- User → Registrations (one-to-many): A user can register for multiple events
- Event → Registrations (one-to-many): An event can have multiple registrations

---

## Support & Feedback

For issues, questions, or feature requests:
- Contact your system administrator
- Check server logs for detailed error messages
- Ensure all environment variables are properly configured

---

**Version**: 1.0  
**Last Updated**: January 2026