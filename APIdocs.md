# LIC iC-38 Platform — API Route Definitions
> **Version:** 1.0  
> **Base URL:** `/api/v1`  
> **Auth:** JWT Bearer tokens via `Authorization: Bearer <token>`  
> **Format:** All request/response bodies are `application/json`

---

## Table of Contents

1. [Conventions](#1-conventions)
2. [Auth Guards Reference](#2-auth-guards-reference)
3. [Auth Routes](#3-auth-routes)
4. [User Routes](#4-user-routes)
5. [Enrollment Routes](#5-enrollment-routes)
6. [Course Routes](#6-course-routes)
7. [Webinar Routes](#7-webinar-routes)
8. [Test Routes](#8-test-routes)
9. [Attempt Routes](#9-attempt-routes)
10. [Announcement Routes](#10-announcement-routes)
11. [Notification Routes](#11-notification-routes)
12. [Admin Routes](#12-admin-routes)
13. [Ops / Administrator Routes](#13-ops--administrator-routes)
14. [Error Response Reference](#14-error-response-reference)
15. [Route Summary Table](#15-route-summary-table)

---

## 1. Conventions

### URL Structure

```
/api/v1/{actor}/{resource}/{id?}/{sub-resource?}
```

| Segment | Example | Meaning |
|---------|---------|---------|
| `actor` | `admin`, `ops` | Scopes the route to a specific role. Omitted for user-facing routes. |
| `resource` | `courses`, `tests` | The primary resource |
| `id` | `:courseId` | UUID of the specific resource |
| `sub-resource` | `questions`, `attempts` | Nested resource under the parent |

### HTTP Methods

| Method | Usage |
|--------|-------|
| `GET` | Fetch — never mutates state |
| `POST` | Create a new resource or trigger an action |
| `PATCH` | Partial update — only provided fields change |
| `DELETE` | Remove a resource |

### Pagination

All list endpoints accept:
```
GET /resource?page=1&limit=20
```
All list responses wrap data in:
```json
{
  "data": [...],
  "total": 100,
  "page": 1,
  "totalPages": 5
}
```

### Standard Response Envelope

```json
// Success
{
  "success": true,
  "data": { ... }
}

// Error
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "Test with id 'abc' not found"
  }
}

// Validation Error
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "issues": [
      { "field": "email", "message": "Invalid email address" }
    ]
  }
}
```

### Timestamps

All timestamps are returned as **ISO 8601 UTC** strings:
```
"2025-05-01T10:30:00.000Z"
```

---

## 2. Auth Guards Reference

Every route is annotated with one of these guards:

| Guard | Meaning |
|-------|---------|
| `PUBLIC` | No auth required |
| `USER` | Valid user JWT required |
| `USER + ENROLLED` | User JWT + at least one active course assignment |
| `ADMIN` | Valid admin JWT required |
| `ADMIN + permission:name` | Admin JWT + specific RBAC permission |
| `ADMIN_ONLY` | Administrator (ops) JWT required — not regular admin |

Guards are enforced in middleware before the controller runs. A failed guard always returns before hitting any use case.

---

## 3. Auth Routes

### `POST /api/v1/auth/register`
**Guard:** `PUBLIC`  
**Use Case:** `RegisterUserUseCase`  
**Description:** Registers a new user. System auto-generates `username` and a temporary password, returned in the response for the welcome communication.

**Request Body:**
```json
{
  "fullName": "Rajesh Kumar",
  "email": "rajesh.kumar@example.com",
  "phone": "+919876543210"
}
```

**Response `201`:**
```json
{
  "success": true,
  "data": {
    "message": "Registration successful. Please log in with the credentials below.",
    "username": "LIC-00342",
    "temporaryPassword": "Kx7mPqR2nZwA"
  }
}
```

**Errors:** `409` email already registered · `400` validation failed

---

### `POST /api/v1/auth/login`
**Guard:** `PUBLIC`  
**Use Case:** `LoginUserUseCase`  
**Description:** Authenticates a user and returns JWT tokens.

**Request Body:**
```json
{
  "username": "LIC-00342",
  "password": "Kx7mPqR2nZwA"
}
```

**Response `200`:**
```json
{
  "success": true,
  "data": {
    "accessToken": "<jwt>",
    "refreshToken": "<jwt>",
    "user": {
      "userId": "uuid",
      "username": "LIC-00342",
      "fullName": "Rajesh Kumar",
      "email": "rajesh.kumar@example.com",
      "hasActiveEnrollment": false
    }
  }
}
```

> `hasActiveEnrollment: false` → redirect to enrollment form  
> `hasActiveEnrollment: true` → redirect to dashboard

**Errors:** `401` invalid credentials · `401` account suspended

---

### `POST /api/v1/auth/admin/login`
**Guard:** `PUBLIC`  
**Use Case:** `LoginAdminUseCase`  
**Description:** Authenticates an admin. Returns access token with `permissions[]` embedded.

**Request Body:**
```json
{
  "username": "mentor.admin",
  "password": "secure-password"
}
```

**Response `200`:**
```json
{
  "success": true,
  "data": {
    "accessToken": "<jwt>",
    "refreshToken": "<jwt>",
    "admin": {
      "adminId": "uuid",
      "username": "mentor.admin",
      "fullName": "Dr. Priya Sharma",
      "role": "mentor",
      "permissions": [
        "enrollment:view",
        "enrollment:approve",
        "test:create",
        "test:publish",
        "webinar:schedule",
        "webinar:manage",
        "announcement:create",
        "user:view_stats",
        "stats:overview",
        "course:create",
        "course:edit",
        "course:assign_user"
      ]
    }
  }
}
```

**Errors:** `401` invalid credentials · `401` account deactivated

---

### `POST /api/v1/auth/ops/login`
**Guard:** `PUBLIC`  
**Use Case:** `LoginAdministratorUseCase`  
**Description:** Authenticates an Administrator (ops user).

**Request / Response:** Same shape as admin login. Role is `"administrator"`.

---

### `POST /api/v1/auth/refresh`
**Guard:** `PUBLIC`  
**Use Case:** `RefreshTokenUseCase`  
**Description:** Issues a new access token from a valid refresh token.

**Request Body:**
```json
{ "refreshToken": "<jwt>" }
```

**Response `200`:**
```json
{
  "success": true,
  "data": { "accessToken": "<new-jwt>" }
}
```

**Errors:** `401` expired or invalid refresh token

---

### `POST /api/v1/auth/logout`
**Guard:** `USER` | `ADMIN` | `ADMIN_ONLY`  
**Description:** Invalidates the refresh token (adds to blocklist).

**Request Body:**
```json
{ "refreshToken": "<jwt>" }
```

**Response `200`:**
```json
{ "success": true, "data": { "message": "Logged out successfully." } }
```

---

## 4. User Routes

### `GET /api/v1/users/me`
**Guard:** `USER`  
**Description:** Returns the authenticated user's profile.

**Response `200`:**
```json
{
  "success": true,
  "data": {
    "userId": "uuid",
    "username": "LIC-00342",
    "fullName": "Rajesh Kumar",
    "email": "rajesh.kumar@example.com",
    "phone": "+919876543210",
    "status": "active",
    "createdAt": "2025-01-15T08:00:00.000Z",
    "lastLoginAt": "2025-05-01T10:30:00.000Z"
  }
}
```

---

### `PATCH /api/v1/users/me/password`
**Guard:** `USER`  
**Use Case:** `ChangePasswordUseCase`  
**Description:** Changes the authenticated user's password.

**Request Body:**
```json
{
  "oldPassword": "Kx7mPqR2nZwA",
  "newPassword": "MyNewSecurePass123"
}
```

**Response `200`:**
```json
{ "success": true, "data": { "message": "Password changed successfully." } }
```

**Errors:** `401` old password incorrect · `400` new password too weak

---

### `GET /api/v1/users/me/stats`
**Guard:** `USER + ENROLLED`  
**Description:** Returns the user's personal performance summary for the dashboard.

**Response `200`:**
```json
{
  "success": true,
  "data": {
    "testsTaken": 12,
    "testsPassed": 9,
    "passRate": 75.0,
    "averageScore": 68.4,
    "averagePercentage": 68.4,
    "bestScore": 92,
    "coursesEnrolled": 1
  }
}
```

---

## 5. Enrollment Routes

### `GET /api/v1/enrollments/me`
**Guard:** `USER`  
**Description:** Returns all enrollment requests submitted by the authenticated user with their current status.

**Response `200`:**
```json
{
  "success": true,
  "data": [
    {
      "enrollmentId": "uuid",
      "courseId": "uuid",
      "courseTitle": "iC-38 Batch May 2025",
      "status": "approved",
      "submittedAt": "2025-04-10T09:00:00.000Z",
      "reviewedAt": "2025-04-11T10:00:00.000Z",
      "reviewNote": null
    }
  ]
}
```

---

### `POST /api/v1/enrollments`
**Guard:** `USER`  
**Use Case:** `SubmitEnrollmentUseCase`  
**Description:** Submits an enrollment request for a course. User can only have one request per course.

**Request Body:**
```json
{
  "courseId": "uuid",
  "licAgentCode": "LIC123456",
  "dob": "1990-06-15T00:00:00.000Z",
  "city": "Mumbai",
  "experienceYears": 3,
  "motivation": "I want to clear iC-38 to serve my clients better."
}
```

**Response `201`:**
```json
{
  "success": true,
  "data": {
    "enrollmentId": "uuid",
    "status": "pending",
    "message": "Your enrollment request has been submitted. You will be notified once reviewed."
  }
}
```

**Errors:** `409` already enrolled in this course · `400` course not active · `400` underage (< 18) · `400` invalid LIC agent code format

---

### `GET /api/v1/enrollments/me/assignments`
**Guard:** `USER`  
**Description:** Returns all active course assignments for the user. Used at login to decide whether to redirect to enrollment form or dashboard.

**Response `200`:**
```json
{
  "success": true,
  "data": [
    {
      "assignmentId": "uuid",
      "courseId": "uuid",
      "courseTitle": "iC-38 Batch May 2025",
      "courseStatus": "active",
      "assignedAt": "2025-04-11T10:05:00.000Z",
      "isActive": true
    }
  ]
}
```

---

## 6. Course Routes

### `GET /api/v1/courses`
**Guard:** `PUBLIC`  
**Description:** Returns all active courses. Used in the enrollment form dropdown.

**Response `200`:**
```json
{
  "success": true,
  "data": [
    {
      "courseId": "uuid",
      "title": "iC-38 Batch May 2025",
      "description": "Complete preparation for the IRDAI iC-38 examination.",
      "examTarget": "IRDAI iC-38",
      "startDate": "2025-05-01",
      "endDate": "2025-07-31",
      "status": "active"
    }
  ]
}
```

---

### `GET /api/v1/courses/:courseId`
**Guard:** `USER + ENROLLED`  
**Description:** Returns full details of a course the user is enrolled in.

**Response `200`:**
```json
{
  "success": true,
  "data": {
    "courseId": "uuid",
    "title": "iC-38 Batch May 2025",
    "description": "...",
    "examTarget": "IRDAI iC-38",
    "startDate": "2025-05-01",
    "endDate": "2025-07-31",
    "status": "active",
    "totalTests": 8,
    "totalWebinars": 12,
    "createdAt": "2025-04-01T00:00:00.000Z"
  }
}
```

**Errors:** `403` user not assigned to this course

---

## 7. Webinar Routes

### `GET /api/v1/webinars/upcoming`
**Guard:** `USER + ENROLLED`  
**Description:** Returns all upcoming webinars across the user's enrolled courses. Used in dashboard widget.

**Response `200`:**
```json
{
  "success": true,
  "data": [
    {
      "webinarId": "uuid",
      "courseId": "uuid",
      "courseTitle": "iC-38 Batch May 2025",
      "title": "Unit Linked Insurance Plans — Deep Dive",
      "description": "Covering Chapter 7 of the iC-38 syllabus.",
      "scheduledAt": "2025-05-15T14:00:00.000Z",
      "durationMinutes": 90,
      "status": "scheduled",
      "isRegistered": true
    }
  ]
}
```

---

### `GET /api/v1/webinars/past`
**Guard:** `USER + ENROLLED`  
**Description:** Returns completed webinars for the user's courses.

**Response `200`:**
```json
{
  "success": true,
  "data": [
    {
      "webinarId": "uuid",
      "title": "Introduction to IRDAI Regulations",
      "scheduledAt": "2025-05-01T14:00:00.000Z",
      "durationMinutes": 60,
      "status": "completed",
      "attended": true,
      "joinCount": 2
    }
  ]
}
```

---

### `POST /api/v1/webinars/:webinarId/register`
**Guard:** `USER + ENROLLED`  
**Use Case:** `RegisterForWebinarUseCase`  
**Description:** Registers the authenticated user for a webinar. Idempotent — registering twice does not error.

**Response `200`:**
```json
{
  "success": true,
  "data": { "message": "You have been registered for this webinar." }
}
```

**Errors:** `403` user not enrolled in the webinar's course · `400` webinar cancelled or completed

---

### `GET /api/v1/webinars/:webinarId/join`
**Guard:** `USER + ENROLLED`  
**Use Case:** `JoinWebinarUseCase`  
**Description:** Returns a signed room token and join URL. Only works when webinar status is `live`.

**Response `200`:**
```json
{
  "success": true,
  "data": {
    "joinUrl": "https://meet.yourdomain.com/lic-webinar-a1b2c3d4",
    "token": "<signed-jitsi-jwt>",
    "expiresAt": "2025-05-15T15:45:00.000Z"
  }
}
```

**Errors:** `400` webinar is not live yet · `403` user not enrolled in course

---

## 8. Test Routes

### `GET /api/v1/tests`
**Guard:** `USER + ENROLLED`  
**Use Case:** `GetAvailableTestsForUserUseCase` (called within a list use case)  
**Description:** Returns all published, currently available tests across the user's courses. Includes eligibility info for each test.

**Response `200`:**
```json
{
  "success": true,
  "data": [
    {
      "testId": "uuid",
      "courseId": "uuid",
      "courseTitle": "iC-38 Batch May 2025",
      "title": "Chapter 3 — Life Insurance Concepts",
      "description": "25 questions covering basic life insurance principles.",
      "durationMinutes": 30,
      "totalMarks": 25,
      "passingMarks": 15,
      "questionCount": 25,
      "availableFrom": "2025-05-01T00:00:00.000Z",
      "availableUntil": "2025-07-31T23:59:59.000Z",
      "attemptsUsed": 2,
      "maxAttempts": null,
      "allowReattempt": true,
      "cooldownMinutes": 30,
      "canAttempt": false,
      "canAttemptReason": "Please wait until 3:45 PM to reattempt.",
      "nextAttemptAt": "2025-05-10T10:15:00.000Z",
      "lastAttemptResult": {
        "score": 18,
        "percentage": 72.0,
        "passed": true,
        "submittedAt": "2025-05-10T09:45:00.000Z"
      }
    }
  ]
}
```

> `canAttempt: false` with `canAttemptReason` tells the frontend exactly what to show on the disabled button.

---

### `GET /api/v1/tests/:testId`
**Guard:** `USER + ENROLLED`  
**Description:** Returns metadata for a single test (no questions — questions only come at attempt start).

**Response `200`:**
```json
{
  "success": true,
  "data": {
    "testId": "uuid",
    "courseId": "uuid",
    "title": "Chapter 3 — Life Insurance Concepts",
    "description": "25 questions covering basic life insurance principles.",
    "durationMinutes": 30,
    "totalMarks": 25,
    "passingMarks": 15,
    "questionCount": 25,
    "shuffleQuestions": true,
    "allowReattempt": true,
    "cooldownMinutes": 30,
    "maxAttempts": null,
    "availableFrom": "2025-05-01T00:00:00.000Z",
    "availableUntil": "2025-07-31T23:59:59.000Z",
    "status": "published",
    "canAttempt": true,
    "attemptsUsed": 1
  }
}
```

**Errors:** `403` user not enrolled in course · `404` test not found

---

## 9. Attempt Routes

### `POST /api/v1/tests/:testId/attempts`
**Guard:** `USER + ENROLLED`  
**Use Case:** `StartAttemptUseCase`  
**Description:** Starts a new test attempt. Returns the shuffled question list (no correct answers). This is the only time questions are served to the user.

**Request Body:** *(none)*

**Response `201`:**
```json
{
  "success": true,
  "data": {
    "attemptId": "uuid",
    "testId": "uuid",
    "attemptNumber": 2,
    "durationMinutes": 30,
    "startedAt": "2025-05-10T10:00:00.000Z",
    "expiresAt": "2025-05-10T10:30:00.000Z",
    "questions": [
      {
        "questionId": "uuid",
        "questionText": "Which type of insurance provides coverage for a fixed period?",
        "optionA": "Whole life insurance",
        "optionB": "Term life insurance",
        "optionC": "Endowment plan",
        "optionD": "Money-back policy"
      }
    ]
  }
}
```

> `correctOption` and `explanation` are **never** in this response.

**Errors:** `400` cannot attempt with reason — ineligible (cooldown, max attempts, not published, outside window) · `403` user not enrolled in course

---

### `PATCH /api/v1/attempts/:attemptId/answers`
**Guard:** `USER`  
**Use Case:** `SaveAnswerUseCase`  
**Description:** Saves or updates a single answer during an in-progress attempt. Called on every answer change — debounce at client side (min 1s). Idempotent.

**Request Body:**
```json
{
  "questionId": "uuid",
  "selectedOption": "B"
}
```

**Response `200`:**
```json
{
  "success": true,
  "data": { "saved": true }
}
```

**Errors:** `403` attempt does not belong to user · `400` attempt no longer in progress · `400` questionId not in this attempt

---

### `POST /api/v1/attempts/:attemptId/submit`
**Guard:** `USER`  
**Use Case:** `SubmitAttemptUseCase`  
**Description:** Submits the attempt and triggers scoring. Returns a summary (not the full breakdown — use the result endpoint for that).

**Request Body:** *(none)*

**Response `200`:**
```json
{
  "success": true,
  "data": {
    "attemptId": "uuid",
    "status": "submitted",
    "score": 20,
    "totalMarks": 25,
    "percentage": 80.0,
    "passed": true,
    "timeTakenSeconds": 1245,
    "submittedAt": "2025-05-10T10:20:45.000Z"
  }
}
```

**Timed-out response `200`:**
```json
{
  "success": true,
  "data": {
    "attemptId": "uuid",
    "status": "timed_out",
    "message": "Time limit exceeded. Your attempt has been recorded with answers submitted up to this point.",
    "score": 14,
    "totalMarks": 25,
    "percentage": 56.0,
    "passed": false
  }
}
```

**Errors:** `403` attempt does not belong to user · `400` attempt already submitted

---

### `GET /api/v1/attempts/:attemptId/result`
**Guard:** `USER`  
**Use Case:** `GetAttemptResultUseCase`  
**Description:** Returns the full result breakdown (Google Forms style). `correctOption` and `explanation` are revealed here for the first time.

**Response `200`:**
```json
{
  "success": true,
  "data": {
    "attemptId": "uuid",
    "testTitle": "Chapter 3 — Life Insurance Concepts",
    "attemptNumber": 2,
    "score": 20,
    "totalMarks": 25,
    "percentage": 80.0,
    "passed": true,
    "passingMarks": 15,
    "timeTakenSeconds": 1245,
    "submittedAt": "2025-05-10T10:20:45.000Z",
    "questions": [
      {
        "questionId": "uuid",
        "questionText": "Which type of insurance provides coverage for a fixed period?",
        "optionA": "Whole life insurance",
        "optionB": "Term life insurance",
        "optionC": "Endowment plan",
        "optionD": "Money-back policy",
        "correctOption": "B",
        "selectedOption": "B",
        "isCorrect": true,
        "marksAwarded": 1,
        "explanation": "Term life insurance provides coverage for a specified period. If the insured survives the term, no benefit is paid."
      },
      {
        "questionId": "uuid",
        "questionText": "IRDAI stands for?",
        "optionA": "Insurance Regulatory and Development Authority of India",
        "optionB": "Indian Risk and Development Authority",
        "optionC": "Insurance Research and Data Authority of India",
        "optionD": "None of the above",
        "correctOption": "A",
        "selectedOption": "C",
        "isCorrect": false,
        "marksAwarded": 0,
        "explanation": "IRDAI stands for Insurance Regulatory and Development Authority of India, established under the IRDAI Act 1999."
      },
      {
        "questionId": "uuid",
        "questionText": "What is the free-look period for a life insurance policy?",
        "optionA": "7 days",
        "optionB": "10 days",
        "optionC": "15 days",
        "optionD": "30 days",
        "correctOption": "C",
        "selectedOption": null,
        "isCorrect": false,
        "marksAwarded": 0,
        "explanation": "As per IRDAI guidelines, the free-look period for life insurance policies is 15 days from receipt of the policy document."
      }
    ]
  }
}
```

**Errors:** `403` attempt does not belong to user · `400` attempt not yet submitted

---

### `GET /api/v1/tests/:testId/attempts`
**Guard:** `USER`  
**Use Case:** `GetAttemptHistoryUseCase`  
**Description:** Returns all past attempts by the user for a specific test. Used in test detail view.

**Response `200`:**
```json
{
  "success": true,
  "data": [
    {
      "attemptId": "uuid",
      "attemptNumber": 2,
      "score": 20,
      "totalMarks": 25,
      "percentage": 80.0,
      "passed": true,
      "status": "submitted",
      "timeTakenSeconds": 1245,
      "startedAt": "2025-05-10T10:00:00.000Z",
      "submittedAt": "2025-05-10T10:20:45.000Z"
    },
    {
      "attemptId": "uuid",
      "attemptNumber": 1,
      "score": 14,
      "totalMarks": 25,
      "percentage": 56.0,
      "passed": false,
      "status": "submitted",
      "timeTakenSeconds": 1800,
      "startedAt": "2025-05-09T15:00:00.000Z",
      "submittedAt": "2025-05-09T15:30:00.000Z"
    }
  ]
}
```

---

### `GET /api/v1/attempts/recent`
**Guard:** `USER + ENROLLED`  
**Description:** Returns the user's 5 most recent attempts across all tests. Used in the dashboard "Past Tests" widget.

**Query Params:** `?limit=5` (default 5, max 20)

**Response `200`:**
```json
{
  "success": true,
  "data": [
    {
      "attemptId": "uuid",
      "testId": "uuid",
      "testTitle": "Chapter 3 — Life Insurance Concepts",
      "attemptNumber": 2,
      "score": 20,
      "totalMarks": 25,
      "percentage": 80.0,
      "passed": true,
      "submittedAt": "2025-05-10T10:20:45.000Z"
    }
  ]
}
```

---

## 10. Announcement Routes

### `GET /api/v1/announcements`
**Guard:** `USER + ENROLLED`  
**Use Case:** `GetAnnouncementsForUserUseCase`  
**Description:** Returns active announcements for the user's courses and platform-wide. Pinned announcements come first.

**Response `200`:**
```json
{
  "success": true,
  "data": [
    {
      "announcementId": "uuid",
      "courseId": null,
      "courseTitle": null,
      "title": "Platform Maintenance on May 20th",
      "body": "The platform will be down for maintenance from 2AM to 4AM IST on May 20th.",
      "isPinned": true,
      "postedAt": "2025-05-08T09:00:00.000Z",
      "expiresAt": "2025-05-21T00:00:00.000Z"
    },
    {
      "announcementId": "uuid",
      "courseId": "uuid",
      "courseTitle": "iC-38 Batch May 2025",
      "title": "New Test Published — Chapter 5",
      "body": "The Chapter 5 mock test is now available. Good luck!",
      "isPinned": false,
      "postedAt": "2025-05-07T11:00:00.000Z",
      "expiresAt": null
    }
  ]
}
```

---

## 11. Notification Routes

### `GET /api/v1/notifications`
**Guard:** `USER` | `ADMIN`  
**Description:** Returns paginated notifications for the authenticated actor. Pass `?unread=true` to fetch only unread.

**Query Params:** `?unread=false&page=1&limit=20`

**Response `200`:**
```json
{
  "success": true,
  "data": {
    "unreadCount": 3,
    "data": [
      {
        "notificationId": "uuid",
        "type": "enrollment_approved",
        "title": "Enrollment Approved",
        "body": "Your enrollment for iC-38 Batch May 2025 has been approved.",
        "relatedEntityType": "enrollment",
        "relatedEntityId": "uuid",
        "deepLink": "/enrollment",
        "isRead": false,
        "createdAt": "2025-04-11T10:05:00.000Z",
        "readAt": null
      },
      {
        "notificationId": "uuid",
        "type": "test_published",
        "title": "New Test Available",
        "body": "Chapter 5 mock test is now available in your course.",
        "relatedEntityType": "test",
        "relatedEntityId": "uuid",
        "deepLink": "/dashboard/tests/uuid",
        "isRead": true,
        "createdAt": "2025-05-07T11:00:00.000Z",
        "readAt": "2025-05-07T11:15:00.000Z"
      }
    ],
    "total": 12,
    "page": 1,
    "totalPages": 1
  }
}
```

---

### `GET /api/v1/notifications/unread-count`
**Guard:** `USER` | `ADMIN`  
**Description:** Returns just the unread count. Called on page load to populate the bell badge.

**Response `200`:**
```json
{
  "success": true,
  "data": { "unreadCount": 3 }
}
```

---

### `PATCH /api/v1/notifications/:notificationId/read`
**Guard:** `USER` | `ADMIN`  
**Description:** Marks a single notification as read.

**Response `200`:**
```json
{ "success": true, "data": { "message": "Notification marked as read." } }
```

**Errors:** `403` notification does not belong to user · `404` notification not found

---

### `PATCH /api/v1/notifications/read-all`
**Guard:** `USER` | `ADMIN`  
**Description:** Marks all unread notifications as read for the authenticated actor.

**Response `200`:**
```json
{ "success": true, "data": { "message": "All notifications marked as read." } }
```

---

## 12. Admin Routes

All routes in this section are prefixed with `/api/v1/admin/` and require a valid **Admin JWT**.

---

### Dashboard & Stats

#### `GET /api/v1/admin/stats/overview`
**Guard:** `ADMIN + stats:overview`  
**Description:** Returns aggregated platform stats for the admin dashboard.

**Response `200`:**
```json
{
  "success": true,
  "data": {
    "totalUsers": 342,
    "activeUsers": 310,
    "pendingEnrollments": 7,
    "activeEnrollments": 289,
    "activeCourses": 2,
    "upcomingWebinars": 3,
    "publishedTests": 14,
    "testsAttemptedToday": 45,
    "overallPassRate": 71.4,
    "averageScore": 65.2
  }
}
```

---

### Enrollment Management

#### `GET /api/v1/admin/enrollments`
**Guard:** `ADMIN + enrollment:view`  
**Description:** Returns paginated enrollment requests with optional status filter.

**Query Params:** `?status=pending&page=1&limit=20`

**Response `200`:**
```json
{
  "success": true,
  "data": [
    {
      "enrollmentId": "uuid",
      "userId": "uuid",
      "userFullName": "Rajesh Kumar",
      "userEmail": "rajesh.kumar@example.com",
      "courseId": "uuid",
      "courseTitle": "iC-38 Batch May 2025",
      "licAgentCode": "LIC123456",
      "city": "Mumbai",
      "experienceYears": 3,
      "motivation": "I want to clear iC-38 to serve my clients better.",
      "status": "pending",
      "submittedAt": "2025-04-10T09:00:00.000Z",
      "reviewedBy": null,
      "reviewedAt": null,
      "reviewNote": null
    }
  ],
  "total": 7,
  "page": 1,
  "totalPages": 1
}
```

---

#### `PATCH /api/v1/admin/enrollments/:enrollmentId`
**Guard:** `ADMIN + enrollment:approve`  
**Use Case:** `ApproveEnrollmentUseCase` | `RejectEnrollmentUseCase`  
**Description:** Approves or rejects a pending enrollment request.

**Request Body (approve):**
```json
{ "action": "approve" }
```

**Request Body (reject):**
```json
{
  "action": "reject",
  "reviewNote": "LIC agent code could not be verified. Please resubmit with a valid code."
}
```

**Response `200`:**
```json
{
  "success": true,
  "data": {
    "enrollmentId": "uuid",
    "status": "approved",
    "reviewedAt": "2025-04-11T10:00:00.000Z"
  }
}
```

**Errors:** `400` enrollment not in PENDING status · `400` reject action missing reviewNote · `404` enrollment not found

---

### Course Management

#### `GET /api/v1/admin/courses`
**Guard:** `ADMIN + course:create`  
**Query Params:** `?status=active&page=1&limit=20`

**Response `200`:**
```json
{
  "success": true,
  "data": [
    {
      "courseId": "uuid",
      "title": "iC-38 Batch May 2025",
      "examTarget": "IRDAI iC-38",
      "startDate": "2025-05-01",
      "endDate": "2025-07-31",
      "status": "active",
      "activeEnrollments": 289,
      "createdAt": "2025-04-01T00:00:00.000Z"
    }
  ],
  "total": 3,
  "page": 1,
  "totalPages": 1
}
```

---

#### `POST /api/v1/admin/courses`
**Guard:** `ADMIN + course:create`  
**Use Case:** `CreateCourseUseCase`

**Request Body:**
```json
{
  "title": "iC-38 Batch August 2025",
  "description": "Full preparation for the IRDAI iC-38 August exam cycle.",
  "examTarget": "IRDAI iC-38",
  "startDate": "2025-08-01",
  "endDate": "2025-10-31"
}
```

**Response `201`:**
```json
{
  "success": true,
  "data": {
    "courseId": "uuid",
    "title": "iC-38 Batch August 2025",
    "status": "draft",
    "createdAt": "2025-05-10T11:00:00.000Z"
  }
}
```

---

#### `PATCH /api/v1/admin/courses/:courseId`
**Guard:** `ADMIN + course:edit`  
**Use Case:** `UpdateCourseUseCase`

**Request Body:** *(any subset of updatable fields)*
```json
{
  "title": "iC-38 Batch August 2025 — Revised",
  "description": "Updated description."
}
```

**Response `200`:** Returns updated course object.

---

#### `POST /api/v1/admin/courses/:courseId/publish`
**Guard:** `ADMIN + course:edit`  
**Use Case:** `PublishCourseUseCase`  
**Description:** Transitions course from `draft` → `active`.

**Response `200`:**
```json
{ "success": true, "data": { "courseId": "uuid", "status": "active" } }
```

**Errors:** `400` course not in DRAFT status · `400` startDate >= endDate

---

#### `POST /api/v1/admin/courses/:courseId/archive`
**Guard:** `ADMIN + course:edit`  
**Use Case:** `ArchiveCourseUseCase`

**Response `200`:**
```json
{ "success": true, "data": { "courseId": "uuid", "status": "archived" } }
```

---

### Webinar Management

#### `GET /api/v1/admin/webinars`
**Guard:** `ADMIN + webinar:schedule`  
**Query Params:** `?courseId=uuid&status=scheduled&page=1&limit=20`

**Response `200`:**
```json
{
  "success": true,
  "data": [
    {
      "webinarId": "uuid",
      "courseId": "uuid",
      "courseTitle": "iC-38 Batch May 2025",
      "title": "Unit Linked Insurance Plans",
      "scheduledAt": "2025-05-15T14:00:00.000Z",
      "durationMinutes": 90,
      "roomId": "lic-webinar-a1b2c3d4",
      "status": "scheduled",
      "registrationCount": 47,
      "createdAt": "2025-05-05T09:00:00.000Z"
    }
  ]
}
```

---

#### `POST /api/v1/admin/webinars`
**Guard:** `ADMIN + webinar:schedule`  
**Use Case:** `ScheduleWebinarUseCase`

**Request Body:**
```json
{
  "courseId": "uuid",
  "title": "Unit Linked Insurance Plans — Deep Dive",
  "description": "Covering Chapter 7 of the iC-38 syllabus.",
  "scheduledAt": "2025-05-15T14:00:00.000Z",
  "durationMinutes": 90,
  "roomConfig": {
    "startMuted": true,
    "lobby": true,
    "maxParticipants": 100
  }
}
```

**Response `201`:**
```json
{
  "success": true,
  "data": {
    "webinarId": "uuid",
    "roomId": "lic-webinar-a1b2c3d4",
    "status": "scheduled",
    "scheduledAt": "2025-05-15T14:00:00.000Z"
  }
}
```

**Errors:** `400` scheduledAt in the past · `400` duration out of range (15–480 min) · `400` course not active

---

#### `POST /api/v1/admin/webinars/:webinarId/start`
**Guard:** `ADMIN + webinar:manage`  
**Use Case:** `StartWebinarUseCase`  
**Description:** Transitions webinar to `live`. Generates moderator room token. Sends `webinar_starting` notifications.

**Response `200`:**
```json
{
  "success": true,
  "data": {
    "webinarId": "uuid",
    "status": "live",
    "joinUrl": "https://meet.yourdomain.com/lic-webinar-a1b2c3d4",
    "token": "<signed-jitsi-moderator-jwt>",
    "expiresAt": "2025-05-15T15:45:00.000Z"
  }
}
```

**Errors:** `400` webinar is not in SCHEDULED status

---

#### `POST /api/v1/admin/webinars/:webinarId/end`
**Guard:** `ADMIN + webinar:manage`  
**Use Case:** `EndWebinarUseCase`  
**Description:** Transitions webinar to `completed`. Invalidates room token.

**Response `200`:**
```json
{ "success": true, "data": { "webinarId": "uuid", "status": "completed" } }
```

---

#### `POST /api/v1/admin/webinars/:webinarId/cancel`
**Guard:** `ADMIN + webinar:manage`  
**Use Case:** `CancelWebinarUseCase`

**Response `200`:**
```json
{ "success": true, "data": { "webinarId": "uuid", "status": "cancelled" } }
```

---

### Test Management

#### `GET /api/v1/admin/tests`
**Guard:** `ADMIN + test:create`  
**Query Params:** `?courseId=uuid&status=draft&page=1&limit=20`

**Response `200`:**
```json
{
  "success": true,
  "data": [
    {
      "testId": "uuid",
      "courseId": "uuid",
      "courseTitle": "iC-38 Batch May 2025",
      "title": "Chapter 5 — Insurance Products",
      "status": "published",
      "questionCount": 30,
      "totalMarks": 30,
      "passingMarks": 18,
      "durationMinutes": 35,
      "availableFrom": "2025-05-08T00:00:00.000Z",
      "availableUntil": "2025-07-31T23:59:59.000Z",
      "totalAttempts": 214,
      "passRate": 68.2,
      "createdAt": "2025-05-07T10:00:00.000Z"
    }
  ]
}
```

---

#### `POST /api/v1/admin/tests`
**Guard:** `ADMIN + test:create`  
**Use Case:** `CreateTestUseCase`  
**Description:** Creates a test in `draft` status. Questions are added separately.

**Request Body:**
```json
{
  "courseId": "uuid",
  "title": "Chapter 7 — ULIP Products",
  "description": "Test covering Unit Linked Insurance Plans.",
  "durationMinutes": 30,
  "totalMarks": 25,
  "passingMarks": 15,
  "shuffleQuestions": true,
  "allowReattempt": true,
  "cooldownMinutes": 30,
  "maxAttempts": null,
  "availableFrom": "2025-05-20T00:00:00.000Z",
  "availableUntil": "2025-07-31T23:59:59.000Z"
}
```

**Response `201`:**
```json
{
  "success": true,
  "data": {
    "testId": "uuid",
    "status": "draft",
    "questionCount": 0,
    "createdAt": "2025-05-10T12:00:00.000Z"
  }
}
```

---

#### `GET /api/v1/admin/tests/:testId`
**Guard:** `ADMIN + test:create`  
**Description:** Returns full test with all questions. Used in the test builder UI.

**Response `200`:**
```json
{
  "success": true,
  "data": {
    "testId": "uuid",
    "title": "Chapter 7 — ULIP Products",
    "status": "draft",
    "questionCount": 3,
    "totalMarks": 3,
    "questions": [
      {
        "questionId": "uuid",
        "questionText": "What does ULIP stand for?",
        "optionA": "Unit Linked Insurance Plan",
        "optionB": "Universal Life Insurance Policy",
        "optionC": "Unified Life Income Plan",
        "optionD": "Unit Liability Insurance Plan",
        "correctOption": "A",
        "explanation": "ULIP stands for Unit Linked Insurance Plan — a product that combines investment and insurance.",
        "marks": 1,
        "orderIndex": 0
      }
    ]
  }
}
```

---

#### `POST /api/v1/admin/tests/:testId/questions`
**Guard:** `ADMIN + test:create`  
**Use Case:** `AddQuestionsUseCase`  
**Description:** Adds questions to a draft test in bulk. Passes through `TestDomain.addQuestion()` for each — enforces test is DRAFT.

**Request Body:**
```json
{
  "questions": [
    {
      "questionText": "What does ULIP stand for?",
      "optionA": "Unit Linked Insurance Plan",
      "optionB": "Universal Life Insurance Policy",
      "optionC": "Unified Life Income Plan",
      "optionD": "Unit Liability Insurance Plan",
      "correctOption": "A",
      "explanation": "ULIP stands for Unit Linked Insurance Plan.",
      "marks": 1
    }
  ]
}
```

**Response `200`:** Returns updated test with all questions.

**Errors:** `400` test is not in DRAFT status · `400` marks < 1

---

#### `DELETE /api/v1/admin/tests/:testId/questions/:questionId`
**Guard:** `ADMIN + test:create`  
**Use Case:** `RemoveQuestionUseCase`  
**Description:** Removes a question from a draft test.

**Response `200`:**
```json
{ "success": true, "data": { "message": "Question removed.", "questionCount": 24, "totalMarks": 24 } }
```

**Errors:** `400` test is not in DRAFT status · `404` question not found in test

---

#### `POST /api/v1/admin/tests/:testId/publish`
**Guard:** `ADMIN + test:publish`  
**Use Case:** `PublishTestUseCase`  
**Description:** Publishes the test. Notifies all course users.

**Response `200`:**
```json
{ "success": true, "data": { "testId": "uuid", "status": "published" } }
```

**Errors:** `400` test not in DRAFT · `400` zero questions · `400` passingMarks > totalMarks

---

#### `POST /api/v1/admin/tests/:testId/archive`
**Guard:** `ADMIN + test:publish`  
**Use Case:** `ArchiveTestUseCase`  

**Response `200`:**
```json
{ "success": true, "data": { "testId": "uuid", "status": "archived" } }
```

---

#### `GET /api/v1/admin/tests/:testId/analytics`
**Guard:** `ADMIN + test:view_results`  
**Use Case:** `GetTestAnalyticsUseCase`  
**Description:** Returns aggregated stats for a test. Used in admin test analytics view.

**Response `200`:**
```json
{
  "success": true,
  "data": {
    "testId": "uuid",
    "testTitle": "Chapter 3 — Life Insurance Concepts",
    "totalAttempts": 214,
    "uniqueUsers": 189,
    "averageScore": 16.3,
    "averagePercentage": 65.2,
    "passRate": 68.2,
    "scoreDistribution": [
      { "range": "0–20%",   "count": 12 },
      { "range": "21–40%",  "count": 18 },
      { "range": "41–60%",  "count": 45 },
      { "range": "61–80%",  "count": 89 },
      { "range": "81–100%", "count": 50 }
    ],
    "perQuestionStats": [
      {
        "questionId": "uuid",
        "questionText": "What does ULIP stand for?",
        "correctPercentage": 82.4,
        "mostChosenWrongOption": "B",
        "skipPercentage": 2.1
      }
    ]
  }
}
```

---

### User Stats (Admin View)

#### `GET /api/v1/admin/users`
**Guard:** `ADMIN + user:view_stats`  
**Query Params:** `?status=active&search=rajesh&page=1&limit=20`

**Response `200`:** Paginated list of user summaries.

---

#### `GET /api/v1/admin/users/:userId`
**Guard:** `ADMIN + user:view_stats`  
**Description:** Returns full profile + activity timeline for a specific user.

**Response `200`:**
```json
{
  "success": true,
  "data": {
    "userId": "uuid",
    "username": "LIC-00342",
    "fullName": "Rajesh Kumar",
    "email": "rajesh.kumar@example.com",
    "status": "active",
    "createdAt": "2025-01-15T08:00:00.000Z",
    "lastLoginAt": "2025-05-10T10:00:00.000Z",
    "enrollments": [
      {
        "courseTitle": "iC-38 Batch May 2025",
        "status": "approved",
        "assignedAt": "2025-04-11T10:05:00.000Z"
      }
    ],
    "testStats": {
      "totalAttempts": 12,
      "passed": 9,
      "failed": 3,
      "passRate": 75.0,
      "averagePercentage": 71.4
    },
    "recentAttempts": [
      {
        "testTitle": "Chapter 3 — Life Insurance",
        "score": 20,
        "totalMarks": 25,
        "percentage": 80.0,
        "passed": true,
        "submittedAt": "2025-05-10T10:20:45.000Z"
      }
    ],
    "webinarsAttended": 6
  }
}
```

---

### Announcement Management

#### `GET /api/v1/admin/announcements`
**Guard:** `ADMIN + announcement:create`  
**Query Params:** `?courseId=uuid&page=1&limit=20`

---

#### `POST /api/v1/admin/announcements`
**Guard:** `ADMIN + announcement:create`  
**Use Case:** `PostAnnouncementUseCase`

**Request Body:**
```json
{
  "courseId": "uuid",
  "title": "New Test Published — Chapter 5",
  "body": "The Chapter 5 mock test is now live. Attempt it before May 31st.",
  "isPinned": false,
  "expiresAt": "2025-05-31T23:59:59.000Z"
}
```

> `courseId: null` → platform-wide announcement

**Response `201`:**
```json
{
  "success": true,
  "data": {
    "announcementId": "uuid",
    "title": "New Test Published — Chapter 5",
    "isPinned": false,
    "postedAt": "2025-05-10T12:00:00.000Z"
  }
}
```

---

#### `PATCH /api/v1/admin/announcements/:announcementId`
**Guard:** `ADMIN + announcement:create`  
**Use Case:** `UpdateAnnouncementUseCase`

**Request Body:** *(any subset)*
```json
{
  "isPinned": true,
  "expiresAt": "2025-06-15T23:59:59.000Z"
}
```

---

#### `DELETE /api/v1/admin/announcements/:announcementId`
**Guard:** `ADMIN + announcement:create`

**Response `200`:**
```json
{ "success": true, "data": { "message": "Announcement deleted." } }
```

---

## 13. Ops / Administrator Routes

All routes are prefixed with `/api/v1/ops/` and require an **Administrator JWT**.

---

### `GET /api/v1/ops/health`
**Guard:** `ADMIN_ONLY`  
**Description:** Returns latest snapshot of all health metrics.

**Response `200`:**
```json
{
  "success": true,
  "data": {
    "recordedAt": "2025-05-10T12:30:00.000Z",
    "metrics": [
      { "name": "cpu_pct",             "value": 34.2,   "unit": "%" },
      { "name": "mem_pct",             "value": 61.7,   "unit": "%" },
      { "name": "db_latency_ms",       "value": 12.4,   "unit": "ms" },
      { "name": "active_connections",  "value": 47,     "unit": "count" },
      { "name": "uptime_seconds",      "value": 864000, "unit": "s" }
    ]
  }
}
```

---

### `GET /api/v1/ops/health/:metricName/timeseries`
**Guard:** `ADMIN_ONLY`  
**Query Params:** `?withinMinutes=60`  
**Description:** Returns time-series data for a specific metric. Used to render sparkline charts.

**Response `200`:**
```json
{
  "success": true,
  "data": {
    "metricName": "cpu_pct",
    "unit": "%",
    "dataPoints": [
      { "value": 31.2, "recordedAt": "2025-05-10T11:30:00.000Z" },
      { "value": 34.2, "recordedAt": "2025-05-10T11:30:30.000Z" }
    ]
  }
}
```

---

### `GET /api/v1/ops/logs`
**Guard:** `ADMIN_ONLY`  
**Query Params:** `?level=ERROR&service=auth&from=2025-05-01&to=2025-05-10&search=token&page=1&limit=50`

**Response `200`:**
```json
{
  "success": true,
  "data": [
    {
      "logId": 100234,
      "level": "ERROR",
      "service": "auth",
      "message": "JWT verification failed — token expired",
      "meta": {
        "userId": "uuid",
        "endpoint": "POST /api/v1/auth/refresh",
        "latencyMs": 5
      },
      "createdAt": "2025-05-10T09:15:32.000Z"
    }
  ],
  "total": 342,
  "page": 1,
  "totalPages": 7
}
```

---

### Admin Provisioning

#### `GET /api/v1/ops/admins`
**Guard:** `ADMIN_ONLY`

**Response `200`:** Paginated list of all admin accounts with role and status.

---

#### `POST /api/v1/ops/admins`
**Guard:** `ADMIN_ONLY`  
**Use Case:** `ProvisionAdminUseCase`

**Request Body:**
```json
{
  "fullName": "Dr. Priya Sharma",
  "email": "priya.sharma@licplatform.com",
  "roleId": "uuid"
}
```

**Response `201`:**
```json
{
  "success": true,
  "data": {
    "adminId": "uuid",
    "username": "priya.sharma",
    "temporaryPassword": "XmK9pLqR3nWz",
    "role": "mentor",
    "message": "Admin account created. Share credentials securely."
  }
}
```

---

#### `PATCH /api/v1/ops/admins/:adminId`
**Guard:** `ADMIN_ONLY`  
**Description:** Deactivate, reactivate, or change role.

**Request Body:**
```json
{ "isActive": false }
```
or
```json
{ "roleId": "uuid" }
```

**Response `200`:** Returns updated admin object.

---

#### `GET /api/v1/ops/roles`
**Guard:** `ADMIN_ONLY`  
**Description:** Returns all roles with their permissions. Used in provisioning role dropdown.

**Response `200`:**
```json
{
  "success": true,
  "data": [
    {
      "roleId": "uuid",
      "name": "mentor",
      "description": "Full course management access except admin provisioning.",
      "permissions": [
        "enrollment:view", "enrollment:approve",
        "course:create", "course:edit",
        "test:create", "test:publish",
        "webinar:schedule", "webinar:manage",
        "announcement:create", "user:view_stats", "stats:overview"
      ]
    }
  ]
}
```

---

## 14. Error Response Reference

| HTTP Code | `code` | When thrown |
|-----------|--------|-------------|
| `400` | `VALIDATION_ERROR` | Zod schema parse failed at controller |
| `400` | `DOMAIN_ERROR` | Business rule violation in a Domain class |
| `401` | `UNAUTHORIZED` | Missing/expired token or bad credentials |
| `403` | `FORBIDDEN` | Valid token but insufficient RBAC permission |
| `404` | `NOT_FOUND` | Resource does not exist |
| `409` | `CONFLICT` | Duplicate resource (email, enrollment, etc.) |
| `500` | `DATABASE_ERROR` | Unhandled DB error — never exposes SQL to client |
| `500` | `INTERNAL_ERROR` | Unexpected server error |

All errors follow the envelope:
```json
{
  "success": false,
  "error": {
    "code": "DOMAIN_ERROR",
    "message": "Reattempts are not allowed for this test."
  }
}
```

---

## 15. Route Summary Table

| Method | Route | Guard | Use Case |
|--------|-------|-------|----------|
| `POST` | `/auth/register` | PUBLIC | `RegisterUserUseCase` |
| `POST` | `/auth/login` | PUBLIC | `LoginUserUseCase` |
| `POST` | `/auth/admin/login` | PUBLIC | `LoginAdminUseCase` |
| `POST` | `/auth/ops/login` | PUBLIC | `LoginAdministratorUseCase` |
| `POST` | `/auth/refresh` | PUBLIC | `RefreshTokenUseCase` |
| `POST` | `/auth/logout` | USER/ADMIN | — |
| `GET` | `/users/me` | USER | — |
| `PATCH` | `/users/me/password` | USER | `ChangePasswordUseCase` |
| `GET` | `/users/me/stats` | USER+ENROLLED | — |
| `GET` | `/enrollments/me` | USER | — |
| `POST` | `/enrollments` | USER | `SubmitEnrollmentUseCase` |
| `GET` | `/enrollments/me/assignments` | USER | — |
| `GET` | `/courses` | PUBLIC | — |
| `GET` | `/courses/:courseId` | USER+ENROLLED | — |
| `GET` | `/webinars/upcoming` | USER+ENROLLED | — |
| `GET` | `/webinars/past` | USER+ENROLLED | — |
| `POST` | `/webinars/:id/register` | USER+ENROLLED | `RegisterForWebinarUseCase` |
| `GET` | `/webinars/:id/join` | USER+ENROLLED | `JoinWebinarUseCase` |
| `GET` | `/tests` | USER+ENROLLED | — |
| `GET` | `/tests/:testId` | USER+ENROLLED | — |
| `POST` | `/tests/:testId/attempts` | USER+ENROLLED | `StartAttemptUseCase` |
| `PATCH` | `/attempts/:id/answers` | USER | `SaveAnswerUseCase` |
| `POST` | `/attempts/:id/submit` | USER | `SubmitAttemptUseCase` |
| `GET` | `/attempts/:id/result` | USER | `GetAttemptResultUseCase` |
| `GET` | `/tests/:testId/attempts` | USER | — |
| `GET` | `/attempts/recent` | USER+ENROLLED | — |
| `GET` | `/announcements` | USER+ENROLLED | `GetAnnouncementsForUserUseCase` |
| `GET` | `/notifications` | USER/ADMIN | — |
| `GET` | `/notifications/unread-count` | USER/ADMIN | — |
| `PATCH` | `/notifications/:id/read` | USER/ADMIN | — |
| `PATCH` | `/notifications/read-all` | USER/ADMIN | — |
| `GET` | `/admin/stats/overview` | `stats:overview` | — |
| `GET` | `/admin/enrollments` | `enrollment:view` | — |
| `PATCH` | `/admin/enrollments/:id` | `enrollment:approve` | `ApproveEnrollmentUseCase` / `RejectEnrollmentUseCase` |
| `GET` | `/admin/courses` | `course:create` | — |
| `POST` | `/admin/courses` | `course:create` | `CreateCourseUseCase` |
| `PATCH` | `/admin/courses/:id` | `course:edit` | `UpdateCourseUseCase` |
| `POST` | `/admin/courses/:id/publish` | `course:edit` | `PublishCourseUseCase` |
| `POST` | `/admin/courses/:id/archive` | `course:edit` | `ArchiveCourseUseCase` |
| `GET` | `/admin/webinars` | `webinar:schedule` | — |
| `POST` | `/admin/webinars` | `webinar:schedule` | `ScheduleWebinarUseCase` |
| `POST` | `/admin/webinars/:id/start` | `webinar:manage` | `StartWebinarUseCase` |
| `POST` | `/admin/webinars/:id/end` | `webinar:manage` | `EndWebinarUseCase` |
| `POST` | `/admin/webinars/:id/cancel` | `webinar:manage` | `CancelWebinarUseCase` |
| `GET` | `/admin/tests` | `test:create` | — |
| `POST` | `/admin/tests` | `test:create` | `CreateTestUseCase` |
| `GET` | `/admin/tests/:id` | `test:create` | — |
| `POST` | `/admin/tests/:id/questions` | `test:create` | `AddQuestionsUseCase` |
| `DELETE` | `/admin/tests/:id/questions/:qId` | `test:create` | `RemoveQuestionUseCase` |
| `POST` | `/admin/tests/:id/publish` | `test:publish` | `PublishTestUseCase` |
| `POST` | `/admin/tests/:id/archive` | `test:publish` | `ArchiveTestUseCase` |
| `GET` | `/admin/tests/:id/analytics` | `test:view_results` | `GetTestAnalyticsUseCase` |
| `GET` | `/admin/users` | `user:view_stats` | — |
| `GET` | `/admin/users/:id` | `user:view_stats` | — |
| `GET` | `/admin/announcements` | `announcement:create` | — |
| `POST` | `/admin/announcements` | `announcement:create` | `PostAnnouncementUseCase` |
| `PATCH` | `/admin/announcements/:id` | `announcement:create` | `UpdateAnnouncementUseCase` |
| `DELETE` | `/admin/announcements/:id` | `announcement:create` | — |
| `GET` | `/ops/health` | ADMIN_ONLY | — |
| `GET` | `/ops/health/:metric/timeseries` | ADMIN_ONLY | — |
| `GET` | `/ops/logs` | ADMIN_ONLY | — |
| `GET` | `/ops/admins` | ADMIN_ONLY | — |
| `POST` | `/ops/admins` | ADMIN_ONLY | `ProvisionAdminUseCase` |
| `PATCH` | `/ops/admins/:id` | ADMIN_ONLY | — |
| `GET` | `/ops/roles` | ADMIN_ONLY | — |

---

*Document Version: 1.0 — API Route Definitions*  
*Next: Controller implementations → Middleware setup → Integration tests*