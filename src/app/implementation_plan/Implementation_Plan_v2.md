# User Authentication & Authorization System

## 1. System Purpose, Architectural Objectives & End-to-End Process

### 1.1 Core Functional Objectives
The platform accomplishes four mission-critical business objectives:

1. **Distributed Registration Concurrency Guard & Real-Time Lock Countdown**:
   - **Atomic Race-Condition Protection**: When multiple users attempt to register with the same email or username concurrently, Redis acts as a high-speed distributed synchronization barrier (`SET key owner_uuid NX EX 30`), guaranteeing only one registration pipeline proceeds while rejecting duplicate requests.
   - **Elimination of Polling Storms via Socket.IO**: Replaces traditional 1-second client polling (which generates thousands of wasteful HTTP requests and triggers 429 rate limiters) with a persistent, bidirectional WebSocket connection.
   - **Live Countdown & Instant Early Unlock**: The frontend listens on dynamic email rooms (`reg:lock:{email}`). When a lock is active, the UI disables the submit button and displays a live 1-second ticker (`"Please wait 25s..."`). When the first user completes registration, the backend instantly releases the lock and broadcasts a `lock_released` event via Redis Pub/Sub, immediately dropping the countdown to 0s and enabling the button with zero latency.
   - **Dual-Mode Reliability**: Automatically falls back to a single debounced HTTP endpoint (`GET /auth/register/lock-status`) if WebSockets are blocked by corporate proxies or firewalls.

2. **Enterprise Entity & Access Management (RBAC)**:
   - Complete CRUD management for **Users**, **Groups**, **Roles**, and **Permissions**.
   - Many-to-many relationship mapping through normalized junction tables (`user_groups`, `group_roles`, `role_permissions`).

3. **Secure Authentication & Token Lifecycle**:
   - Industry-standard password hashing using **Argon2id** (memory-hard, resistant to GPU/ASIC cracking).
   - Stateless JWT access tokens (RFC 7519) for API authentication, paired with database-backed refresh tokens for secure session renewal.

4. **Dynamic Effective Permission Resolution**:
   - Authorization is decoupled from hardcoded roles. Every protected route enforces explicit permission strings (e.g., `user.create`, `group.delete`).
   - Effective permissions are computed dynamically on each request through the graph: `User ➔ Groups ➔ Roles ➔ Permissions`, supporting multi-group membership with automatic deduplication.

---

### 1.2 User Personas & Access Boundaries

| User Persona | Definition & Scope | Authorization Boundary |
|---|---|---|
| **Admin User** | Highest-tier system administrator with full access | Has permissions for all administrative modules (Users, Groups, Roles, Permissions, System Config). Superusers bypass check. |
| **Security User** | Specialized auditor and compliance operator | Restricted to user inspection, viewing roles/permissions, account status toggling, and audit log analysis. Denied deletion of roles/groups. |
| **Normal User** | Standard business application end-user | Access is strictly constrained to the dynamic union of permissions granted by their assigned Groups and Roles. |

---

### 1.3 End-to-End Implementation Process Flow
The development must follow an exact chronological 7-phase engineering workflow:

```text
Phase 1: Environment & Persistence
  ├── 1. Project structure & ASGI environment configuration
  ├── 2. SQL Database schema, SQLAlchemy ORM models & Alembic migrations
  └── 3. Unique constraints, composite primary keys & search indexes

Phase 2: Core Security & Concurrency Services
  ├── 4. Argon2id PasswordService (hashing & constant-time verification)
  ├── 5. Redis connection pool & RedisLockService (atomic acquire + Lua safe release)
  ├── 6. Redis Pub/Sub event broadcaster (`registration_events`)
  └── 7. Socket.IO server setup with room handlers (`join_lock_room`, `lock_status`, `lock_released`)

Phase 3: Registration Pipeline with Real-Time Push
  ├── 8. RegistrationService 13-step transaction (lock acquire ➔ DB commit ➔ Pub/Sub publish)
  ├── 9. Public registration endpoint (`POST /auth/register`)
  └── 10. HTTP fallback lock status endpoint (`GET /auth/register/lock-status`)

Phase 4: Authentication & Token Engine
  ├── 11. JWTService (access token creation, claims encoding, cryptographic verification)
  ├── 12. LoginService & public login endpoint (`POST /auth/login`)
  └── 13. FastAPI `get_current_user` dependency (token extraction & user identity binding)

Phase 5: Dynamic Authorization & Entity Management
  ├── 14. PermissionResolver service (union & deduplication graph query)
  ├── 15. Dynamic `require_permission("module.action")` dependency factory
  └── 16. Entity management routes (Users, Groups, Roles, Permissions, Assignments)

Phase 6: Frontend React SPA Architecture
  ├── 17. React Registration Form with Socket.IO room subscription & countdown button state
  ├── 18. Instant unlock push event handler (`lock_released` ➔ enable button)
  ├── 19. React Login & AuthContext state management
  └── 20. Protected routes & permission-aware UI elements (conditional render based on perms)

Phase 7: Testing, Concurrency Verification & Auditing
  ├── 21. Unit & integration test suites
  ├── 22. High-concurrency race condition testing (multi-threaded lock acquire)
  └── 23. Production deployment & security hardening checklist
```

---

# 2. Full User Flow Diagrams

### 2.1 Complete User Registration & Real-Time Lock Countdown Flow

```text
React Registration Form (socket.io-client)
   │
   ↓
User types email: user@example.com (Stops typing for 1s debounce)
   │
   ↓
Emit Socket.IO Event: `join_lock_room` { email: "user@example.com" }
(Fallback: HTTP GET /auth/register/lock-status if socket disconnected)
   │
   ↓
FastAPI & Socket.IO Server: Query Redis TTL(registration:lock:email:{email})
   │
   ├───────────────────────────────┬───────────────────────────────┐
   │ [Lock Active (TTL > 0)]       │ [No Active Lock (TTL <= 0)]   │
   ↓                               ↓                               │
   │ Emit: `lock_status` {         │ Emit: `lock_status` {         │
   │   locked: true, remaining: 22 │   locked: false, remaining: 0 │
   │ }                             │ }                             │
   ↓                               ↓                               │
   │ Submit Button DISABLED:       │ Submit Button ENABLED:        │
   │ "Please wait 22s..."          │ "Register Now"                │
   │ (Live 1s interval countdown)  │                               │
   │                               │                               │
   ├── [User A finishes early]     │                               │
   │   ↓                           │                               │
   │   Redis Pub/Sub Broadcast:    │                               │
   │   `lock_released` event       │                               │
   │   ↓                           │                               │
   │   Instant Push: Timer ➔ 0s    │                               │
   │   Button ENABLED immediately  │                               │
   │                               │                               │
   └── [Or Timer reaches 0s] ──────┤                               │
       Button ENABLED: "Register"  │                               │
       │                           │                               │
   ┌───┴───────────────────────────┴───────────────────────────────┘
   │
   ↓
User Clicks "Register Now" (POST /auth/register)
   │
   ↓
Validate & Normalize Identity (email, username, phone)
   │
   ↓
Generate Redis Lock Key & Owner UUID: registration:lock:email:{normalized_email}
   │
   ↓
Redis Atomic Lock: SET key owner_uuid NX EX 30
   │
   ├───────────────────────────────┬───────────────────────────────┐
   │ [Lock Acquisition Fails]      │ [Lock Acquired (30s TTL)]     │
   ↓                               ↓                               │
409 Conflict:               Check Database for Existing User       │
Registration in Progress           │                               │
(Do not touch lock)         ┌──────┴──────┐                        │
   │                        │             │                        │
   │                  [User Exists]  [User Is New]                 │
   │                        │             │                        │
   │                        ↓             ↓                        │
   │                  Release Lock   Hash Password (Argon2/Bcrypt) │
   │                        │             │                        │
   │                        ↓             ↓                        │
   │                 400 Bad Request: Begin DB Transaction:        │
   │                 Account Exists   • Insert user record         │
   │                        │         • Assign default group       │
   │                        │             │                        │
   │                        │             ↓                        │
   │                        │         Commit DB Transaction?       │
   │                        │             │                        │
   │                        │      ┌──────┴──────┐                 │
   │                        │      │             │                 │
   │                        │ [DB Error]   [Commit OK]             │
   │                        │      │             │                 │
   │                        │      ↓             ↓                 │
   │                        │ Rollback Tx  Safe Release Lock       │
   │                        │ Release Lock (Lua UUID check)        │
   │                        │      │             │                 │
   │                        │      │             ↓                 │
   │                        │      │       Publish to Redis:       │
   │                        │      │       `lock_released` event   │
   │                        │      │             │                 │
   │                        │      ↓             ↓                 │
   │                        │ 500 Error    201 Created:            │
   │                        │ (Safe Retry) Registration Success    │
   │                        │      │             │                 │
   └────────────────────────┴──────┴─────────────┴─────────────────┤
                                                                   ↓
                                                       Return Response to React
```

### 2.2 Complete User Login & Authentication Flow

```text
React Login Form
   │
   │ Submit (identity, password)
   ↓
FastAPI: POST /auth/login
   │
   ↓
Normalize Input Identity
   │
   ↓
Query SQL Database for User
   │
   ├───────────────────────────────┬───────────────────────────────┐
   │ [User Not Found]              │ [User Found]                  │
   ↓                               ↓                               │
401 Unauthorized:           Check Account Status:                  │
Invalid Credentials         is_active == True?                     │
   │                               │                               │
   │                        ┌──────┴──────┐                        │
   │                        │             │                        │
   │                 [Inactive]       [Active]                     │
   │                        │             │                        │
   │                        ↓             ↓                        │
   │                401 Unauthorized: Verify Password Hash         │
   │                Account Inactive  (PasswordService)            │
   │                        │             │                        │
   │                        │      ┌──────┴──────┐                 │
   │                        │      │             │                 │
   │                        │ [Mismatch]     [Match]               │
   │                        │      │             │                 │
   │                        │      ↓             ↓                 │
   │                        │ 401 Error:    JWTService: Sign JWT   │
   │                        │ Invalid Pass  (sub, email, exp)      │
   │                        │      │             │                 │
   │                        │      │             ↓                 │
   │                        │      │        Update last_login_at   │
   │                        │      │             │                 │
   │                        │      │             ↓                 │
   │                        │      │        200 OK: Return JWT     │
   │                        │      │             │                 │
   └────────────────────────┴──────┴─────────────┴─────────────────┤
                                                                   ↓
                                                       Return Response to React
```

### 2.3 End-to-End Sequence Flow (Including Real-Time Countdown)

```text
React SPA (socket.io)     FastAPI & Socket.IO Server       Redis (Lock + Pub/Sub)    SQL Database
      │                             │                           │                         │
      │── 1. Type email (1s pause)─►│                           │                         │
      │   emit('join_lock_room')    │── 2. TTL lock_key ───────►│                         │
      │                             │◄── 3. TTL: 22s ───────────│                         │
      │◄── 4. emit('lock_status',22)│                           │                         │
      │   [Live Countdown: 22s..0s] │                           │                         │
      │   [Button: 'Please wait...']│                           │                         │
      │                             │                           │                         │
      │── 5. POST /auth/register ──►│                           │                         │
      │   { email, password }       │── 6. SET key uuid NX ────►│                         │
      │                             │      (30s TTL Lock)       │                         │
      │                             │◄── 7. Lock Acquired ──────│                         │
      │                             │                           │                         │
      │                             │── 8. Check Duplicate ────►│────────────────────────►│
      │                             │◄── 9. User Not Found ─────│─────────────────────────│
      │                             │                           │                         │
      │                             │── 10. Hash & BEGIN TX ───►│────────────────────────►│
      │                             │   INSERT user; default    │   COMMIT (user_id)      │
      │                             │◄── 11. Tx Committed ──────│─────────────────────────│
      │                             │                           │                         │
      │                             │── 12. Safe Release Lock ─►│                         │
      │                             │   & PUBLISH lock_released │                         │
      │◄── 13. emit('lock_released')│◄── 14. Pub/Sub Broadcast ─│                         │
      │   [Instant Unlock: 0s!]     │                           │                         │
      │◄── 15. 201 Created ─────────│                           │                         │
      │                             │                           │                         │
      │── 16. POST /auth/login ────►│                           │                         │
      │   { email, password }       │── 17. Query Identity ────►│────────────────────────►│
      │                             │◄── 18. user_record ───────│─────────────────────────│
      │                             │   (password_hash)         │                         │
      │                             │   19. Verify & Sign JWT   │   (exp: 60m)            │
      │◄── 20. 200 OK { token } ────│                           │                         │
      │                             │                           │                         │
      │── 21. GET /users ──────────►│                           │                         │
      │   (Bearer JWT Token)        │   22. Decode JWT & exp    │                         │
      │                             │                           │                         │
      │                             │── 23. Resolve Perms ─────►│────────────────────────►│
      │                             │   user_groups ➔ perms     │   Effective Perm Set    │
      │                             │◄── 24. perms: ["view"] ───│─────────────────────────│
      │                             │                           │                         │
      │                             │   25. user.view ➔ ALLOW   │                         │
      │                             │── 26. Query Users List ──►│────────────────────────►│
      │                             │◄── 27. users_data ────────│─────────────────────────│
      │◄── 28. 200 OK [users] ──────│                           │                         │
      │                             │                           │                         │
```

---

# 3. Full System Architecture Diagram & Layered Specifications

### 3.1 Complete 6-Tier System Architecture Blueprint

```text
                                                React.js Single Page App (Tier 1: Presentation Layer)
                                                                          │
                                  ├─────────────── Public Views: Register (Socket.IO Lock Countdown) / Login ─────┐
                                  │                                                                               │
                                  ├─────────────── Protected Views: UserDashboard / UserManagement / RoleMatrix ──┤
                                  │                                                                               │
                                  ├─────────────── State Management: AuthContext & SocketContext (socket.io) ─────┤
                                  │                                                                               │
                                  ├─────────────── Route & UI Guards: ProtectedRoute & PermissionGuard ───────────┤
                                  │                                                                               │
                                  └─────────────── Network Clients: Axios (REST) & socket.io-client (Real-Time) ──┘
                                                                          │
                                                                          ↓ HTTPS REST & WSS WebSockets
                                                     FastAPI ASGI Gateway & Socket.IO Server (/socket.io)
                                                                          │
                                  ┌───────────────────────────────────────┴───────────────────────────────────────┐
                                  │                      ASGI Middleware Processing Pipeline                      │
                                  │ • 1. Request ID (X-Request-ID)             • 2. CORS (Origin / Methods)       │
                                  │ • 3. Security Headers (nosniff / HSTS)     • 4. Request Timing & Logging      │
                                  │ • 5. Rate Limiting (Sliding Window)        • 6. Global Exception Envelope     │
                                  └───────────────────────────────────────┬───────────────────────────────────────┘
                                                                          │
                                                                          ↓
                                                        OpenAPI / Swagger Documented Routers
                                  ┌───────────────────────────────────────┼───────────────────────────────────────┐
                                  │                                       │                                       │
                                  ↓                                       ↓                                       ↓
                            /auth Routers                           /users Routers                         /groups, /roles, /perms
                       [Tag: "Authentication"]                 [Tag: "User Management"]                   [Tags: "RBAC Management"]
                       • POST /auth/register                   • GET /users                               • GET/POST /groups
                       • GET  /auth/register/lock-status       • POST /users                              • POST /groups/{id}/roles
                       • POST /auth/login                      • PATCH /users/{id}                        • GET/POST /roles
                       • POST /auth/refresh                    • DELETE /users/{id}                       • POST /roles/{id}/perms
                       • POST /auth/logout                                                                • GET/POST /permissions
                                  │                                       │                                       │
                                  └───────────────────────────────────────┼───────────────────────────────────────┘
                                                                          │
                                                                          ↓
                                                     Pydantic Validation & OpenAPI Schema Engine
                                  ┌───────────────────────────────────────┴───────────────────────────────────────┐
                                  │ • Request DTO Validation: Type coercion, regex, whitespace trimming, email    │
                                  │ • Response DTO Serialization: from_attributes=True, strict secret removal     │
                                  │ • Swagger Docs Generation: Field descriptions, examples, HTTP error matrix    │
                                  └───────────────────────────────────────┬───────────────────────────────────────┘
                                                                          │
                                                                          ↓
                                                     FastAPI Dependency Injection (DI) Pipeline
                                  ┌───────────────────────────────────────┼───────────────────────────────────────┐
                                  │                                       │                                       │
                                  ↓                                       ↓                                       ↓
                       Resource Lifecycle Providers           Authentication Dependency               Dynamic Authorization Factory
                       • get_db(): Scoped AsyncSession        • get_current_user(token)               • require_permission("code")
                         (Commit / Rollback / Close)            - Extracts Bearer token                 - Bypasses if is_superuser
                       • get_redis(): Pooled Client             - Decodes JWT & verifies exp            - Calls PermissionResolver
                         (Distributed Concurrency Lock)         - Verifies user.is_active == True       - Raises 403 if missing
                                  │                                       │                                       │
                                  └───────────────────────────────────────┼───────────────────────────────────────┘
                                                                          │
                                                                          ↓
                                                            Domain & Application Services
                                  ┌───────────────────────────────────────┼───────────────────────────────────────┐
                                  │                                       │                                       │
                                  ↓                                       ↓                                       ↓
                       Auth & Security Services               Entity Management Services              Dynamic Permission Resolver
                       • AuthService: Orchestration           • UserService: User CRUD & lifecycle    • PermissionResolver: Traverses
                       • PasswordService: Argon2 / Bcrypt     • GroupService: Group CRUD & members      User ➔ Group ➔ Role ➔ Perm
                       • JWTService: Sign & verify tokens     • RoleService: Role CRUD & perms        • Deduplicates effective set
                       • RedisLockService: 30s Lock,          • AuditLogService: Security events      • Evaluates permission matrix
                          Lua Release & Pub/Sub Broadcaster    • SocketIOService: Room push & sync
                                  │                                       │                                       │
                                  └───────────────────────────────────────┼───────────────────────────────────────┘
                                                                          │
                                                                          ↓
                                                   Repository & Data Access Layer (SQLAlchemy ORM)
                                                   • UserRepository        • GroupRepository        • RoleRepository
                                                   • PermissionRepository  • UserGroupRepository    • GroupRoleRepository
                                                   • RolePermRepository    • AuditLogRepository     • RefreshTokenRepository
                                                                          │
                                          ┌───────────────────────────────┴───────────────────────────────┐
                                          │                                                               │
                                          ↓                                                               ↓
                               Redis In-Memory & Pub/Sub Engine                                SQL Relational Database
                               • Key: registration:lock:email                                  (PostgreSQL / SQLite)
                               • Command: SET key uuid NX EX 30                                • users, groups, roles, perms
                               • Pub/Sub: registration_events                                  • user_groups, role_perms
                               • Safe Release: Lua Script & Broadcast                          • refresh_tokens, audit_logs
                               • Rate Limit Sliding Counters                                   • ACID Transactions & Indexes
                               • Revoked Token Blacklist
```

---

### 3.2 Middleware Processing Pipeline Specification (In-Depth)

Every incoming HTTP request must pass through this strictly ordered, 6-stage middleware pipeline before reaching router endpoint handlers:

1. **Request ID Tracing Middleware (Stage 1)**:
   - **Header Ingestion**: Inspects incoming `X-Request-ID` HTTP headers and WebSocket handshake query parameters.
   - **UUID Generation**: If absent or malformed, generates a new cryptographic UUIDv4.
   - **Context Binding**: Binds the Request ID to ASGI `request.state.request_id` and Socket.IO `sid` session data for unified end-to-end tracing across REST and WebSocket events.
   - **Response Header Injection**: Automatically attaches `X-Request-ID: {uuid}` to every outgoing HTTP response header (both successful and error responses).

2. **CORS (Cross-Origin Resource Sharing) Middleware (Stage 2)**:
   - **Origin Whitelist**: Validates incoming `Origin` headers against configured frontend domains (e.g. `http://localhost:3000`, `http://localhost:5173`).
   - **Preflight Short-Circuit**: Directly intercepts HTTP `OPTIONS` preflight requests and returns `204 No Content` with allowed methods (`GET`, `POST`, `PUT`, `PATCH`, `DELETE`, `OPTIONS`) and allowed headers (`Authorization`, `Content-Type`, `X-Request-ID`).
   - **Credentials & Exposed Headers**: Enforces `Access-Control-Allow-Credentials: true` and exposes `X-Request-ID` and `X-Process-Time` to client JavaScript.

3. **Security Headers Middleware (Stage 3)**:
   - **MIME Protection**: Injects `X-Content-Type-Options: nosniff` to eliminate MIME-type sniffing vulnerabilities.
   - **Clickjacking Protection**: Injects `X-Frame-Options: DENY` to prevent embedding within malicious iframes.
   - **Transport Security**: Injects `Strict-Transport-Security: max-age=31536000; includeSubDomains` to force HTTPS.
   - **Cross-Site Scripting (XSS) Mitigation**: Injects `Content-Security-Policy: default-src 'self'` and `X-XSS-Protection: 1; mode=block`.
   - **Referrer Control**: Injects `Referrer-Policy: strict-origin-when-cross-origin`.

4. **Request Timing & Structured Logging Middleware (Stage 4)**:
   - **Monotonic Profiling**: Captures high-precision monotonic start time using `time.perf_counter()`.
   - **Latency Calculation**: Computes total execution duration in milliseconds: `elapsed_ms = (end - start) * 1000`.
   - **Response Header**: Injects `X-Process-Time: {elapsed_ms}ms` into response headers.
   - **Structured JSON Access Log**: Emits structured log event containing:
     - `request_id`: Traced UUIDv4
     - `client_ip`: Remote client IP address
     - `http_method`: GET / POST / PATCH / DELETE
     - `path`: Request URI path
     - `status_code`: Final HTTP response code
     - `latency_ms`: Total execution time in ms

5. **Rate Limiting Middleware (Stage 5)**:
   - **Endpoint Scope**: Active on all public authentication routes (`/auth/register`, `/auth/register/lock-status`, `/auth/login`, `/auth/refresh`).
   - **Sliding Window Algorithm**: Utilizes Redis sorted sets / string counters with sliding expiration keys:
     - IP Key: `ratelimit:ip:{client_ip}`
     - Identity Key: `ratelimit:identity:{normalized_email}`
   - **Thresholds**:
     - `/auth/login`: 5 failed attempts per minute per IP.
     - `/auth/register`: 10 registration requests per minute per IP.
     - `/auth/register/lock-status`: 10 status queries per minute per IP (prevents email enumeration).
   - **Throttling Response**: Returns `429 Too Many Requests` with header `Retry-After: {seconds}` when threshold is exceeded.

6. **Global Exception Handling Middleware (Stage 6)**:
   - **Exception Interception**: Wraps downstream execution in a top-level try-except block.
   - **Traceback Sanitization**: Captures and logs full tracebacks tagged with `request_id` to server logs while hiding internal database queries and file paths from client responses.
   - **Unified Error Envelope**: Serializes all errors into the standard JSON error schema:
     - `error_code`: Machine-readable error constant (e.g. `INTERNAL_SERVER_ERROR`, `DATABASE_UNAVAILABLE`).
     - `message`: Human-readable explanation.
     - `request_id`: Traced UUID for user support referencing.
     - `timestamp`: UTC ISO8601 timestamp.

---

### 3.3 Dependency Injection (DI) Engine & Lifecycle Rules (In-Depth)

FastAPI's `Depends()` hierarchical dependency injection system controls resource lifecycle, connection pooling, authentication verification, dynamic permission evaluation, and service composition:

```text
HTTP Request
     │
     ↓
FastAPI Router Handler
     │
     ├── 1. Database Session Lifecycle: get_db()
     │      • Provider: Yields scoped AsyncSession / Session from SQLAlchemy engine pool
     │      • Transactional Boundary: Wraps handler execution in an active transaction
     │      • Commit Hook: Automatically executes session.commit() if handler returns successfully
     │      • Rollback Hook: Automatically executes session.rollback() if unhandled exception occurs
     │      • Cleanup Hook: Guaranteed session.close() executed in finally block
     │
     ├── 2. Redis Connection & Pub/Sub Lifecycle: get_redis()
     │      • Provider: Yields pooled Redis client connection for distributed locks & Pub/Sub messaging
     │      • Health Check: Performs fast ping verification before lock operations & event broadcasts
     │      • Cleanup Hook: Returns connection to pool immediately after request cycle completes
     │
     ├── 3. Authentication Dependency: get_current_user(token)
     │      • Token Extraction: Extracts Bearer token from Authorization HTTP header
     │      • Signature Verification: Decodes JWT signature using configured algorithm (HS256/RS256)
     │      • Expiration Check: Validates exp claim > current UTC timestamp
     │      • Subject Query: Queries UserRepository using sub UUID claim
     │      • Active Status Check: Verifies user.is_active == True (returns 401 if False)
     │      • Output: Returns validated User entity to downstream dependencies and route handlers
     │
     ├── 4. Dynamic Authorization Factory: require_permission("module.action")
     │      • Factory Pattern: Callable dependency initialized with specific permission string (e.g. "user.create")
     │      • Input: Injects User from get_current_user and db session from get_db
     │      • Superuser Bypass: If user.is_superuser == True, immediately grants access and returns True
     │      • Permission Resolver Invocation: Executes PermissionResolver to compute effective permissions:
     │           User ➔ user_groups ➔ group_roles ➔ role_permissions ➔ Effective Permission Set
     │      • Membership Check: Verifies if target permission exists in computed effective set
     │      • Rejection: If missing, raises HTTP 403 Forbidden with {"error_code": "FORBIDDEN", "required_permission": "..."}
     │      • Output: Returns True and authorizes route execution
     │
     └── 5. Service & Repository Factory Dependencies (Inversion of Control)
            • get_user_repository(db) ➔ get_user_service(repo)
            • get_group_repository(db) ➔ get_group_service(repo)
            • get_role_repository(db) ➔ get_role_service(repo)
            • get_permission_repository(db) ➔ get_permission_service(repo)
            • get_redis_lock_service(redis) + get_socketio_service() + get_password_service() + get_jwt_service() ➔ get_auth_service()
```

---

### 3.4 Pydantic Validation & Swagger / OpenAPI Documentation Architecture (In-Depth)

Every data payload entering and exiting the system must strictly adhere to strongly-typed Pydantic schemas (DTOs).

#### 1. Request DTO Schema Specifications
- **Data Normalization**:
  - `email`: Stripped of leading/trailing whitespace and converted to lowercase via pre-root validators.
  - `username`: Stripped of whitespace, validated against regex `^[a-zA-Z0-9_-]{3,50}$`.
- **Field Constraints & Documentation Attributes**:
  - `LockStatusQuery`:
    - `email`: EmailStr (example: "john@example.com", description: "Normalized email address to check lock TTL")
  - `UserRegisterRequest`:
    - `username`: string (min: 3, max: 50, example: "john_doe", description: "Unique username")
    - `email`: EmailStr (example: "john@example.com", description: "Valid corporate email")
    - `password`: string (min: 8, max: 128, example: "Secret@1234", description: "Strong password")
    - `phone`: string optional (min: 7, max: 20, example: "+1234567890", description: "Contact number")
  - `UserLoginRequest`:
    - `username_or_email`: string (min: 3, max: 255, example: "john@example.com")
    - `password`: string (min: 1, max: 128, example: "Secret@1234")
  - `GroupCreateRequest` / `RoleCreateRequest`:
    - `code`: string (min: 2, max: 50, regex: `^[a-z0-9_]+$`, example: "engineering_lead")
    - `name`: string (min: 2, max: 100, example: "Engineering Lead")
    - `description`: string optional (max: 500)
  - `RolePermissionAssignRequest`:
    - `permission_ids`: List of UUIDs (min items: 1)
  - `UserGroupAssignRequest`:
    - `group_ids`: List of UUIDs (min items: 1)

#### 2. Response DTO Schema Specifications
- **ORM Conversion**: Configured with `from_attributes = True` for direct translation from SQLAlchemy ORM entities.
- **Strict Secret Whitelisting**:
  - `LockStatusResponse`: `{"locked": true, "remaining_seconds": 22}` (email is intentionally omitted from response to prevent reflection attacks).
  - `UserResponse`: Includes `id`, `username`, `email`, `phone`, `is_active`, `is_superuser`, `created_at`, `updated_at`.
  - **NEVER EXPOSED**: `password_hash`, `token_hash`, Redis lock tokens, internal salts.
- **Standard Envelope Models**:
  - `ItemResponse[T]`: `{"data": T, "message": "Operation completed successfully"}`
  - `PaginatedResponse[T]`: `{"items": List[T], "total": 150, "page": 1, "size": 20, "pages": 8}`
  - `TokenResponse`: `{"access_token": "JWT_STRING", "refresh_token": "TOKEN_STRING", "token_type": "Bearer", "expires_in": 3600}`

#### 3. Standard HTTP Status Code Matrix for Swagger UI

| HTTP Code | Name | Scenario / Trigger | Response Schema | Description in Swagger |
|---|---|---|---|---|
| `200 OK` | Success | Query, update, login, or lock-status successful | `ItemResponse` / `LockStatusResponse` | Successful data retrieval, status check, or entity update |
| `201 Created` | Created | Registration or entity creation | `ItemResponse` | Resource successfully created in database |
| `400 Bad Request` | Bad Request | Business rule or domain conflict | `ErrorResponse` | Account already exists or invalid role assignment |
| `401 Unauthorized`| Unauthorized| Invalid, missing, or expired JWT | `ErrorResponse` | Missing credentials, invalid token signature, or inactive user |
| `403 Forbidden` | Forbidden | User lacks required permission | `ErrorResponse` | Insufficient authorization (includes required permission code) |
| `404 Not Found` | Not Found | Entity ID does not exist | `ErrorResponse` | User, Group, Role, or Permission ID not found |
| `409 Conflict` | Conflict | 30s Redis registration lock active | `ErrorResponse` | Registration already in progress for this identity |
| `422 Unprocessable`| Validation Error| Pydantic field constraint failure| `ValidationErrorResponse`| Request payload contains missing or invalid fields |
| `429 Too Many Req`| Rate Limited | Exceeded sliding window attempts | `ErrorResponse` | Brute force or enumeration protection triggered (includes Retry-After) |
| `500 Server Error`| Server Error | Unhandled server exception | `ErrorResponse` | Internal system error (includes sanitized Request ID) |

#### 4. OpenAPI / Swagger Documentation & Tag Organization
- **OpenAPI Tags**:
  - `Authentication`: Public authentication endpoints (`/auth/register`, `/auth/register/lock-status`, `/auth/login`, `/auth/refresh`, `/auth/logout`).
  - `User Management`: User lifecycle, profile updates, and group assignment endpoints (`/users`).
  - `Group Management`: Group CRUD and role assignment endpoints (`/groups`).
  - `Role Management`: Role CRUD and permission binding endpoints (`/roles`).
  - `Permission Management`: Permission catalog querying endpoints (`/permissions`).
  - `Audit Logs`: Security and administrative audit trail querying (`/audit-logs`).

---

### 3.5 Detailed 30-Step Request-to-Response Execution Trace

```text
[Step 1]  User submits form in React SPA (e.g. POST /users to create a new user)
   │
[Step 2]  Axios HTTP Interceptor injects "Authorization: Bearer {JWT}" into request headers
   │
[Step 3]  HTTPS Request reaches FastAPI ASGI Server
   │
[Step 4]  Stage 1: Request ID Middleware inspects header; generates UUIDv4 and binds to request.state
   │
[Step 5]  Stage 2: CORS Middleware verifies Origin against allowed whitelist domains
   │
[Step 6]  Stage 3: Security Headers Middleware prepares defense-in-depth headers
   │
[Step 7]  Stage 4: Request Timing Middleware records monotonic start timestamp
   │
[Step 8]  Stage 5: Rate Limiting Middleware checks Redis sliding window counter for client IP
   │
[Step 9]  FastAPI Router matches incoming path and HTTP method (/users, POST)
   │
[Step 10] Pydantic parses JSON request body and validates types and constraints (UserCreateRequest)
   │      [If validation fails: Immediately short-circuits with 422 Unprocessable Entity]
   │
[Step 11] Dependency Injection: get_db() opens scoped database session and starts transaction
   │
[Step 12] Dependency Injection: get_current_user() extracts Bearer token from header
   │
[Step 13] JWTService decodes cryptographic token signature and checks exp timestamp
   │      [If signature invalid or expired: Immediately raises 401 Unauthorized]
   │
[Step 14] UserRepository loads user record by sub UUID claim and checks user.is_active == True
   │      [If user missing or inactive: Immediately raises 401 Unauthorized]
   │
[Step 15] Dependency Injection: require_permission("user.create") evaluates caller authorization
   │
[Step 16] Checks if user.is_superuser == True [If True: Bypasses check and proceeds to Step 20]
   │
[Step 17] PermissionResolver queries User➔UserGroups➔GroupRoles➔RolePermissions
   │
[Step 18] PermissionResolver merges and deduplicates permissions into Effective Permission Set
   │
[Step 19] Checks if "user.create" exists in Effective Permission Set
   │      [If missing: Immediately raises 403 Forbidden with required permission code]
   │
[Step 20] Dependency Injection injects UserRepository and db session into UserService
   │
[Step 21] UserService checks if email/username already exists in database
   │      [If duplicate: Raises 400 Bad Request with "User with this email already exists"]
   │
[Step 22] PasswordService generates strong Argon2id hash for the initial password
   │
[Step 23] UserRepository creates User model instance and executes session.add(new_user)
   │
[Step 24] AuditLogService creates audit log entry recording caller user_id, action, and target user_id
   │
[Step 25] get_db() commits database transaction (session.commit())
   │      [If database error occurs: Executes session.rollback() and raises 500 Error]
   │
[Step 26] Pydantic serializes created User ORM entity into UserResponse DTO (stripping password_hash)
   │
[Step 27] Stage 4: Request Timing Middleware computes elapsed execution latency in milliseconds
   │
[Step 28] Stage 4: Monotonic logger records structured access log entry with status code and duration
   │
[Step 29] Response headers injected: X-Request-ID, X-Process-Time, and Security Defense Headers
   │
[Step 30] HTTP 201 Created Response returned to React Client with UserResponse payload
```

---

### 3.6 Component Error Handling & Resilience Matrix

| Failure Mode | Trigger / Condition | System Resilience Behavior | Client Response |
|---|---|---|---|
| **Redis Server Down (Registration)** | Redis connection failure during registration | Falls back to database unique constraint validation | Proceeds to DB check or returns `503 Service Unavailable` if strict lock mode is enforced |
| **Redis Server Down (Lock Status)** | Redis down during form lock-status query | Gracefully catches connection exception, returns optimistic fallback | `{ "locked": false, "remaining_seconds": 0 }` (POST endpoint will still enforce DB uniqueness) |
| **Concurrent Lock Clash** | Simultaneous registration of same email | Redis `SET NX EX 30` atomic lock blocks second request | `409 Conflict: Registration in progress` |
| **Countdown Drift / Race** | Client countdown hits 0 while server lock has 1-2s remaining | Backend POST enforces atomic `SET NX EX 30` | `409 Conflict: Registration still in progress, please retry in a moment` |
| **DB Lock Contention** | Database deadlocks or query timeout | Auto-rollback of active transaction, releases Redis lock | `500 Server Error: Transaction conflict, please retry` |
| **Token Expiration** | Client JWT expires during session | Axios response interceptor catches 401, calls `/auth/refresh` | Seamless refresh or redirect to login screen |
| **Permission Revoked** | Role removed from group mid-session | Dynamic resolver queries fresh DB state on each request | `403 Forbidden: Access denied` immediately on next action |
| **Malformed Payload** | Missing required fields or wrong format | Pydantic validation interceptor catches schema error | `422 Unprocessable Entity` with exact field error list |

---

# 4. Full Logic Diagrams

### 4.1 Real-Time Lock Status & 30-Second Concurrent Registration Lock Logic

```text
========================================================================================
PART A: PRE-SUBMIT SOCKET.IO REAL-TIME EVENT PUSH & LIVE UNLOCK (PRIMARY PATH)
========================================================================================

User types email in React Form ➔ Debounce 1s after typing stops
   │
   ↓
React `socket.io-client` emits `join_lock_room` { email: "user@example.com" }
   │
   ↓
FastAPI `python-socketio` adds socket to room `reg:lock:{normalized_email}`
   │
   ↓
Query Redis TTL("registration:lock:email:{normalized_email}")
   │
   ├───────────────────────────────┬───────────────────────────────┐
   │ [Key Does Not Exist (TTL=-2)] │ [Key Exists & Locked (TTL>0)] │
   ↓                               ↓                               │
Emit `lock_status` {               Emit `lock_status` {            │
  locked: false, remaining: 0 }      locked: true, remaining: TTL }│
   │                               │                               │
   ↓                               ↓                               │
Submit Button ENABLED              Submit Button DISABLED:         │
"Register Now"                     "Please wait {TTL}s..."         │
   │                               (Live 1s interval countdown)    │
   │                               │                               │
   │                               ├── [User A finishes in DB]     │
   │                               │   ↓                           │
   │                               │   Safe Release Lua Lock ➔     │
   │                               │   PUBLISH registration_events │
   │                               │   ↓                           │
   │                               │   Socket.IO broadcasts        │
   │                               │   `lock_released` to room     │
   │                               │   ↓                           │
   │                               │   Instant Unlock: Counter ➔ 0 │
   │                               │   Submit Button ENABLED       │
   │                               │                               │
   │                               └── [Or Counter reaches 0s] ────┤
   │                                   Submit Button ENABLED       │
   │                                   "Register Now"              │
   │                                   │                           │
   └───────────────────────────────────┴───────────────────────────┘
                                       │
                                       ↓
========================================================================================
PART B: ATOMIC REGISTRATION TRANSACTION LOGIC (POST /auth/register)
========================================================================================

User clicks "Register Now" (POST /auth/register)
   │
   ↓
Normalize Identity (email, username, phone)
   │
   ↓
Generate Redis Key & Owner UUID: registration:lock:email:{normalized_email}
   │
   ↓
Try Atomic Redis Lock: SET key owner_uuid NX EX 30
   │
   ├───────────────────────────────┬───────────────────────────────┐
   │ [Lock Exists / Failed]        │ [Lock Acquired (30s TTL)]     │
   ↓                               ↓                               │
409 Conflict:               Query Database:                        │
Registration in Progress    SELECT id FROM users WHERE email = ?   │
(Do NOT release lock)              │                               │
   │                        ┌──────┴──────┐                        │
   │                        │             │                        │
   │                  [User Exists]  [User Is New]                 │
   │                        │             │                        │
   │                        ↓             ↓                        │
   │                 Release Lock   Hash Password with Argon2      │
   │                        │             │                        │
   │                        ↓             ↓                        │
   │                 400 Bad Request: Begin DB Transaction:        │
   │                 Account Exists • INSERT into users            │
   │                        │       • INSERT user_groups           │
   │                        │             │                        │
   │                        │             ↓                        │
   │                        │       Commit DB Transaction?         │
   │                        │             │                        │
   │                        │      ┌──────┴──────┐                 │
   │                        │      │             │                 │
   │                        │ [DB Error]   [Commit OK]             │
   │                        │      │             │                 │
   │                        │      ↓             ↓                 │
   │                        │ Rollback Tx  Safe Release Lock       │
   │                        │ Release Lock (Lua UUID check)        │
   │                        │      │             │                 │
   │                        │      ↓             ↓                 │
   │                        │ 500 Error    201 Created:            │
   │                        │ (Retryable)  Registration Success    │
   │                        │      │             │                 │
   └────────────────────────┴──────┴─────────────┴─────────────────┤
                                                                   ↓
                                                           End Request Cycle
```

### 4.2 Dynamic Effective Permission Resolution & RBAC Authorization Logic

```text
Protected Request Invoked (e.g., POST /users)
   │
   ↓
Extract Authorization: Bearer JWT Header
   │
   ├───────────────────────────────┬───────────────────────────────┐
   │ [Header Missing]              │ [Header Present]              │
   ↓                               ↓                               │
401 Unauthorized:           Validate JWT Signature & Expiry        │
Missing Authorization Header       │                               │
   │                        ┌──────┴──────┐                        │
   │                        │             │                        │
   │                 [Invalid / Exp] [Token Valid]                 │
   │                        │             │                        │
   │                        ↓             ↓                        │
   │                 401 Error:     Load User from DB by sub UUID  │
   │                 Invalid Token        │                        │
   │                        │      ┌──────┴──────┐                 │
   │                        │      │             │                 │
   │                        │ [Inactive]     [Active]              │
   │                        │      │             │                 │
   │                        │      ↓             ↓                 │
   │                        │ 401 Error:    Is Superuser?          │
   │                        │ User Disabled (is_superuser == True) │
   │                        │      │             │                 │
   │                        │      │      ┌──────┴──────┐          │
   │                        │      │      │             │          │
   │                        │      │ [Superuser]   [Normal User]   │
   │                        │      │      │             │          │
   │                        │      │      │             ↓          │
   │                        │      │      │     1. Query user_groups: user_id  ➔ group_ids
   │                        │      │      │             │          │
   │                        │      │      │             ↓          │
   │                        │      │      │     2. Query group_roles: group_ids ➔ role_ids
   │                        │      │      │             │          │
   │                        │      │      │             ↓          │
   │                        │      │      │     3. Query role_permissions: role_ids ➔ perms
   │                        │      │      │             │          │
   │                        │      │      │             ↓          │
   │                        │      │      │     4. Deduplicate into Effective Permission Set
   │                        │      │      │        Set = { "user.view", "user.create", ... }
   │                        │      │      │             │          │
   │                        │      │      │             ↓          │
   │                        │      │      │     Is required permission in Effective Set?
   │                        │      │      │             │          │
   │                        │      │      │      ┌──────┴──────┐   │
   │                        │      │      │      │             │   │
   │                        │      │      │ [Missing]       [Found]│
   │                        │      │      │      │             │   │
   │                        │      │      │      ↓             │   │
   │                        │      │      │ 403 Forbidden:     │   │
   │                        │      │      │ Access Denied      │   │
   │                        │      │      │      │             │   │
   │                        │      │      └──────┼─────────────┼───┘
   │                        │      │             │             ↓
   │                        │      │             │     Authorize & Execute Handler
   │                        │      │             │             │
   │                        │      │             │             ↓
   │                        │      │             │     200 OK / 201 Created
   │                        │      │             │             │
   └────────────────────────┴──────┴─────────────┴─────────────┴───┤
                                                                   ↓
                                                       Return Response to Client
```

---

# 5. Full Entity Relationship Diagram (ERD)

```text
┌──────────────────────────────┐
│            USERS             │
├──────────────────────────────┤
│ PK  id           : uuid      │
│ UK  username     : varchar   │
│ UK  email        : varchar   │
│     phone        : varchar   │
│     password_hash: varchar   │
│     is_active    : boolean   │
│     is_superuser : boolean   │
│     created_at   : timestamp │
│     updated_at   : timestamp │
│     last_login_at: timestamp │
└──────────────┬───────────────┘
               │ 1
               │
               ↓ N
┌──────────────────────────────┐         ┌──────────────────────────────┐
│         USER_GROUPS          │         │            GROUPS            │
├──────────────────────────────┤         ├──────────────────────────────┤
│ PK  id         : uuid        │         │ PK  id          : uuid       │
│ FK  user_id    : uuid        │◄────────┤ UK  code        : varchar    │
│ FK  group_id   : uuid        │N       1│     name        : varchar    │
│     assigned_at: timestamp   │         │     description : text       │
│ FK  assigned_by: uuid        │         │     is_active   : boolean    │
└──────────────┬───────────────┘         │     created_at  : timestamp  │
               │ 1                       │     updated_at  : timestamp  │
               ↓                         └──────────────┬───────────────┘
┌──────────────────────────────┐                        │ 1
│         GROUP_ROLES          │                        │
├──────────────────────────────┤                        │
│ PK  id         : uuid        │                        │
│ FK  group_id   : uuid        │◄───────────────────────┘
│ FK  role_id    : uuid        │N
│     assigned_at: timestamp   │
│ FK  assigned_by: uuid        │
└──────────────┬───────────────┘
               │ N
               │
               ↓ 1
┌──────────────────────────────┐         ┌──────────────────────────────┐
│            ROLES             │         │        REFRESH_TOKENS        │
├──────────────────────────────┤         ├──────────────────────────────┤
│ PK  id             : uuid    │         │ PK  id        : uuid         │
│ UK  code           : varchar │         │ FK  user_id   : uuid         │
│     name           : varchar │         │ UK  token_hash: varchar      │
│     description    : text    │         │     expires_at: timestamp    │
│     is_system_role : boolean │         │     revoked_at: timestamp    │
│     created_at     : timestmp│         │     created_at: timestamp    │
│     updated_at     : timestmp│         └──────────────────────────────┘
└──────────────┬───────────────┘
               │ 1
               │
               ↓ N
┌──────────────────────────────┐         ┌──────────────────────────────┐
│       ROLE_PERMISSIONS       │         │         PERMISSIONS          │
├──────────────────────────────┤         ├──────────────────────────────┤
│ PK  id           : uuid      │         │ PK  id          : uuid       │
│ FK  role_id      : uuid      │         │ UK  code        : varchar    │
│ FK  permission_id: uuid      │◄────────┤     name        : varchar    │
│     assigned_at  : timestmp  │N       1│     module      : varchar    │
│ FK  assigned_by  : uuid      │         │     action      : varchar    │
└──────────────────────────────┘         │     description : text       │
                                         │     created_at  : timestamp  │
┌──────────────────────────────┐         └──────────────────────────────┘
│          AUDIT_LOGS          │
├──────────────────────────────┤
│ PK  id         : uuid        │
│ FK  user_id    : uuid        │
│     action     : varchar     │
│     resource   : varchar     │
│     resource_id: varchar     │
│     ip_address : varchar     │
│     created_at : timestamp   │
└──────────────────────────────┘
```

---

# 6. Final Security Model

The complete system follows this model:

```text
                 AUTHENTICATION
                       ↓
                 Who are you?
                       ↓
                      JWT
                       ↓
                 Current User
                       ↓
                 ┌─────┴─────┐
                 ↓           ↓
               Groups     User Status
                 ↓
                Roles
                 ↓
            Permissions
                 ↓
          What can you do?
                 ↓
             Allow / Deny
```

The most important implementation rule is:

```text
Login does NOT automatically mean full access.

Access = Current User
       → Group(s)
       → Role(s)
       → Permission(s)
       → Required Permission
       → Allow / Deny
```

And for registration concurrency and real-time user experience:

```text
Pre-submit: Debounce 1s ➔ Socket.IO `join_lock_room` {email} (or HTTP fallback)
        ↓
Lock active? ➔ Server emits `lock_status`; button disabled with live countdown
        ↓
User A finishes early ➔ Redis Pub/Sub broadcast: `lock_released` (Instant 0s unlock!)
        ↓
Submit attempt: Atomic Redis lock (SET key owner_uuid NX EX 30)
        ↓
One request continues (30-second safety window)
        ↓
Database uniqueness constraint (Permanent final protection)
```

This architecture keeps **Authentication**, **Authorization**, **User Management**, **Registration Concurrency Control**, and **Real-Time Lock UX** separate so a junior developer can implement each part one step at a time and test each layer before moving to the next.

---

# 7. User Types & Access-Control Model

## 7.1 Three User Types

| User Type | Description | Access Level |
|---|---|---|
| **Admin** | Highest-level administrative user | Full CRUD on Users, Groups, Roles, Permissions; system configuration |
| **Security User** | Limited privileged user | View users, view roles/permissions, activate/deactivate users (when permitted), review audit logs |
| **Normal User** | Standard application user | Only features granted through `User → Group → Role → Permission` chain |

**Key Rules:**
- Admin access is controlled through permissions, not hard-coded user-type checks.
- Security User must **not** automatically receive full Admin access (denied: delete group/role/permission, system config).
- Normal User access is **always** resolved dynamically through the permission chain.

## 7.2 Access-Control Entity Hierarchy

```text
User
  ↓ belongs to (many-to-many)
Group
  ↓ has (many-to-many)
Role
  ↓ contains (many-to-many)
Permission
```

### Entity Definitions

| Entity | Purpose | Key Fields | Examples |
|---|---|---|---|
| **User** | Person/account that can log in | `id`, `username`, `email`, `phone`, `password_hash`, `is_active`, `is_superuser`, `created_at`, `updated_at`, `last_login_at` | `john@example.com` |
| **Group** | Business/organizational collection | `id`, `code`, `name`, `description`, `created_at` | `Admin Group`, `Sales Group`, `HR Group`, `Finance Group` |
| **Role** | Access profile attached to group | `id`, `code`, `name`, `description`, `created_at` | `Admin Role`, `Manager Role`, `Editor Role`, `Viewer Role` |
| **Permission** | Smallest unit of access control | `id`, `code`, `name`, `description`, `created_at` | `user.view`, `user.create`, `group.delete`, `report.export` |

### Permission Naming Convention

```text
{module}.{action}
```

Examples: `user.view`, `user.create`, `user.update`, `user.delete`, `group.view`, `group.create`, `role.view`, `role.create`, `permission.view`, `report.view`, `report.export`

### Normal User Access Example

```text
User: Sales Manager
    ↓
Group: Sales
    ↓
Role: Sales Manager Role
    ↓
Permissions: sales.view, sales.create, sales.update, report.view
```

---

# 8. Database Design Plan

## 8.1 Required Tables

```text
Core Tables:              Junction Tables:           Audit Tables:
  users                     user_groups                audit_logs
  groups                    group_roles                refresh_tokens
  roles                     role_permissions
  permissions
```

## 8.2 Relationship Rules

```text
users ↔ user_groups ↔ groups              (Many-to-Many)
groups ↔ group_roles ↔ roles              (Many-to-Many)
roles ↔ role_permissions ↔ permissions   (Many-to-Many)
```

## 8.3 Database Safety Rules

| Rule | Why |
|---|---|
| Enforce unique constraints on `email`, `username`, `phone` | Permanent duplicate-data protection |
| Redis lock is a concurrency guard only | Never rely on Redis alone to prevent duplicates |
| Database unique constraint is the final protection | Even if Redis fails, DB blocks duplicates |
| All junction tables use composite primary keys | Prevent duplicate assignments |
| Add indexes on common lookup fields | `email`, `username`, `is_active` for query performance |
| All tables include `created_at` and `updated_at` | Audit trail and debugging |

---

# 9. Registration Lock & Transaction Order

## 9.1 Business Rule

When two registration requests arrive with the same unique identity data simultaneously, Redis prevents concurrent duplicate registration. Only one request proceeds; the other is immediately rejected.

```text
Request A: email = user@example.com  →  Lock acquired  →  continue
Request B: email = user@example.com  →  Lock exists    →  409 Conflict
```

- Lock TTL: **30 seconds** (configurable, default = 30)
- Different identities can register concurrently without blocking each other

## 9.2 Redis Lock Key Design

```text
registration:lock:email:{normalized_email}
registration:lock:phone:{normalized_phone}
registration:lock:username:{normalized_username}
```

**Normalization rules** (must be identical for Redis key, DB duplicate check, and DB unique constraint):
- Email: lowercase, trim whitespace
- Username: lowercase (if case-insensitive), trim whitespace
- Phone: strip non-numeric characters

## 9.3 Atomic Lock Acquisition

The lock acquisition **must** be atomic — check-and-create in one operation:

```text
CORRECT:   SET key owner_uuid NX EX 30   (atomic: create-only-if-not-exists + TTL)
WRONG:     GET key → if nil → SET key     (race condition: two requests pass GET)
```

## 9.4 Lock Ownership, Safe Release & Pub/Sub Broadcast

Each lock stores an owner UUID so only the creating request can release it:

```text
Request A → creates lock with owner_uuid_A
Request B → sees existing lock → rejected
Request A → completes → Lua script releases ONLY if current value == owner_uuid_A
Request A → publishes `lock_released` to Redis channel `registration_events`
FastAPI Socket.IO → broadcasts `lock_released` to room `reg:lock:{email}` (0ms instant unlock!)
```

**Safe Release Lua Script Concept:**
```text
if redis.call("GET", key) == owner_uuid then
    return redis.call("DEL", key)
else
    return 0
end
```

If the request crashes before cleanup, Redis TTL automatically removes the lock after 30 seconds.

## 9.5 Transaction Order (13 Steps)

```text
 1. Receive request
 2. Validate input (Pydantic)
 3. Normalize identity fields
 4. Generate Redis lock key + owner UUID
 5. Acquire Redis lock atomically (SET NX EX 30)
 6. Check database for existing user
 7. Hash password (Argon2/Bcrypt)
 8. Begin DB transaction: INSERT user + assign default group
 9. Commit transaction
10. Safe-release Redis lock (Lua UUID check)
11. Publish `lock_released` event to Redis Pub/Sub channel `registration_events`
12. Return 201 Created
13. On ANY failure: rollback DB, release owned lock, publish release event, return error
```

**Critical Rules:**
- Never store plaintext passwords in Redis.
- Never create the user before acquiring the lock.
- Never release another request's lock.
- Never remove the database uniqueness constraint.

## 9.6 Failure Cases

| Case | Scenario | System Behavior |
|---|---|---|
| **A: Concurrent same identity** | Two requests, same email, same time | First gets lock → continues; second → `409 Conflict` |
| **B: User already exists** | Lock acquired → DB check finds duplicate | Release lock → return `400 Bad Request: Account exists` |
| **C: DB operation fails** | Lock acquired → INSERT fails | Rollback transaction → release lock → return `500 Error` |
| **D: Request crashes after lock** | Server crashes mid-process | Lock remains → TTL expires in ≤30s → auto-removed |

## 9.7 Response Design

The frontend must distinguish these categories (without exposing Redis internals):

| Category | HTTP Code | When |
|---|---|---|
| Validation error | `422` | Missing/invalid fields |
| Duplicate user | `400` | Email already exists in database |
| Registration in progress | `409` | Redis lock active for this identity |
| Server error | `500` | Database or unexpected failure |

---

# 10. Registration Form Lock Countdown (Real-Time Socket.IO & Event Push)

## 10.1 Feature Overview & Real-Time Socket.IO Protocol

When User A begins registering with an email (acquiring a 30-second Redis lock), and User B opens the registration form and enters that same email:
1. **The Problem with HTTP Polling**: Polling the server every 1s creates up to 30 HTTP requests per waiting user (3,000 req/min for 100 users), exhausting server thread pools and triggering rate limiters ("Too Many Requests").
2. **How Socket.IO Solves It**: The frontend connects once over a persistent WebSocket connection and joins a room for that email (`registration:lock:{email}`).
3. **Instant Event Push**:
   - On joining the room, the server emits an immediate `lock_status` event containing `{ "locked": true, "remaining_seconds": 25 }`.
   - The React submit button shows a live countdown (`"Please wait 25s..."`) and is disabled.
   - When User A finishes registration or the lock expires, the backend releases the lock and broadcasts a `lock_released` event via Redis Pub/Sub to all waiting sockets.
   - User B's countdown immediately stops and the submit button instantly switches to **ENABLED** (`"Register Now"`) with **0 polling requests needed**.
4. **Dual-Mode Reliability (HTTP Fallback)**: If a corporate firewall or proxy blocks WebSockets, the frontend gracefully falls back to a single debounced `GET /auth/register/lock-status` call.

---

## 10.2 User Flow Diagram (Real-Time Socket.IO Push)

```text
User A (First User)                           FastAPI & Socket.IO Server                    User B (Second User)
       │                                                    │                                                    │
       ├── Opens Form & types email                         │                                                    ├── Opens Form & types email
       │   (user@example.com)                               │                                                    │   (user@example.com)
       │                                                    │                                                    │
       ├── Clicks "Register"                                │                                                    ├── Debounce 1s ➔ Emits:
       │   └── POST /auth/register                          │                                                    │   `join_lock_room` {email}
       │       └── Acquires Redis Lock (30s TTL)            │                                                    │
       │           │                                        │◄──────── emit('join_lock_room', {email}) ──────────┤
       │           │                                        │                                                    │
       │           │                                        ├── Queries Redis TTL (25s remaining)                │
       │           │                                        ├── Adds socket to room `reg:lock:email`             │
       │           │                                        │── emit('lock_status', {remaining: 25s}) ──────────►│
       │           │                                        │                                                    │
       │           │                                        │                                                    ├── Button DISABLED with countdown:
       │           │                                        │                                                    │   "Please wait 25s..."
       │           │                                        │                                                    │   (Live 1s interval countdown)
       │           │                                        │                                                    │
       ├── Registration Completes (201)                     │                                                    │
       │   └── Backend Releases Redis Lock                  │                                                    │
       │       └── Publishes to Redis Pub/Sub:              │                                                    │
       │           channel: `registration_events`           │                                                    │
       │           payload: {lock_released}                 │                                                    │
       │                                                    ├── Socket.IO Server receives Pub/Sub message        │
       │                                                    │   └── Broadcasts `lock_released` to room ─────────►│
       │                                                    │                                                    │
       │                                                    │                                                    ├── Instant unlock event received!
       │                                                    │                                                    ├── Countdown stops immediately (0s)
       │                                                    │                                                    ├── Button ENABLED: "Register Now"
       │                                                    │                                                    │
       │                                                    │                                                    ├── User B clicks "Register"
       │                                                    │◄────────────── POST /auth/register ────────────────┤
       │                                                    │                                                    │
       │                                                    ├── Checks DB: User exists (400 Conflict)            │
       │                                                    └── 400 Bad Request: Account Already Exists ────────►┤
       ▼                                                    ▼                                                    ▼
```

---

## 10.3 System Architecture Diagram (Socket.IO + Redis Pub/Sub)

```text
React SPA (socket.io-client)          FastAPI (python-socketio)             Redis (Lock + Pub/Sub Broker)
    │                                     │                                       │
    │ [User types email, pauses 1s]       │                                       │
    │                                     │                                       │
    │── emit('join_lock_room', {email}) ─►│                                       │
    │   email: 'user@example.com'         │── TTL registration:lock:email:... ───►│
    │                                     │◄── remaining_seconds: 22 ─────────────│
    │◄── emit('lock_status', {locked:true,│                                       │
    │         remaining_seconds: 22}) ─── │                                       │
    │                                     │                                       │
    │ [Button: 'Please wait 22s']         │                                       │
    │ [Client decrements 1s locally]      │                                       │
    │                                     │                                       │
    │ [User A finishes registration!]     │ [Release Lock via Lua Script]         │
    │                                     │── PUBLISH registration_events ───────►│
    │                                     │   {event: 'lock_released', email}     │
    │                                     │◄── Redis Pub/Sub Broadcast ───────────│
    │◄── emit('lock_released', {email}) ─ │                                       │
    │                                     │                                       │
    │ [Instant Push Unlock Received!]     │                                       │
    │ [Button ENABLED: 'Register Now']    │                                       │
    │                                     │                                       │
    │── POST /auth/register ─────────────►│                                       │
    │   { email, password }               │── DB Unique check / INSERT ──────────►│
    │◄── 201 Created / 400 Conflict ───── │                                       │
    │                                     │                                       │
```

---

## 10.4 Socket.IO Event & Channel Specifications

### 1. Client-to-Server Events:
| Event Name | Payload | Trigger / Description |
|---|---|---|
| `join_lock_room` | `{ "email": "user@example.com" }` | Fired when user stops typing for 1 second (debounced). Subscribes socket to the email's lock room. |
| `leave_lock_room` | `{ "email": "user@example.com" }` | Fired when user changes the email field or unmounts the registration page. |

### 2. Server-to-Client Events:
| Event Name | Payload | Description |
|---|---|---|
| `lock_status` | `{ "locked": true, "remaining_seconds": 22, "email": "..." }` | Sent immediately to the joining client upon querying Redis TTL. |
| `lock_released` | `{ "email": "user@example.com", "timestamp": "..." }` | Broadcast to all clients in the room when the lock is deleted or registration finishes. |

### 3. Redis Pub/Sub Channel:
| Channel Name | Message Payload | Purpose |
|---|---|---|
| `registration_events` | `{ "event": "lock_released", "email": "user@example.com" }` | Synchronizes lock releases across multiple Uvicorn worker processes and servers. |

---

## 10.5 HTTP Fallback Endpoint (`GET /auth/register/lock-status`)

If WebSocket transport fails (e.g., restricted firewall), the client automatically queries this HTTP endpoint:

```text
GET /auth/register/lock-status?email={email}
   │
   ↓
Validate email format (Pydantic EmailStr)
   │
   ├── [Invalid email format] ➔ Return 422 Unprocessable Entity
   │
   ↓
Normalize email (lowercase, trim whitespace) ➔ Query Redis TTL
   │
   ├── TTL == -2 (key does not exist) ➔ Return: { "locked": false, "remaining_seconds": 0 }
   ├── TTL == -1 (key exists without expiry) ➔ Force EXPIRE 30s ➔ Return: { "locked": true, "remaining_seconds": 30 }
   └── TTL > 0  (key active) ➔ Return: { "locked": true, "remaining_seconds": TTL }
```

---

## 10.6 Frontend Implementation Rules (React + socket.io-client)

| # | Rule | Implementation Requirement |
|---|---|---|
| 1 | **Debounce Email Typing** | Use `setTimeout` (1s debounce) after user stops typing before emitting `join_lock_room`. |
| 2 | **Join Room on Focus/Debounce** | Emit `socket.emit('join_lock_room', { email: normalizedEmail })`. |
| 3 | **Listen for `lock_status`** | On receiving `lock_status`, if `locked === true`, set `countdown = remaining_seconds`, set `disabled = true`, and start local 1s `setInterval` tick. |
| 4 | **Listen for `lock_released`** | On receiving `lock_released` for current email: immediately cancel `setInterval`, set `countdown = 0`, and set `disabled = false` (`"Register Now"`). |
| 5 | **Room Cleanup on Email Change** | If user changes email or navigates away, emit `leave_lock_room` for old email and clear active timer. |
| 6 | **HTTP Fallback on Socket Error** | If socket connection fails or disconnects, automatically call `GET /auth/register/lock-status?email={email}` as fallback. |
| 7 | **Countdown is UX Only** | Client-side timer and Socket.IO events are for user experience; backend Redis lock + DB constraints remain the authoritative security barrier. |

---

## 10.7 Backend Implementation Rules (FastAPI + python-socketio)

| # | Rule | Implementation Requirement |
|---|---|---|
| 1 | **Socket.IO Async Server** | Initialize `sio = socketio.AsyncServer(async_mode='asgi', cors_allowed_origins='*')` and mount at `/socket.io`. |
| 2 | **Room Naming Convention** | Use normalized room names: `f"reg:lock:{normalized_email}"`. |
| 3 | **Immediate State Query on Join** | In `@sio.event on('join_lock_room')`: query Redis TTL for `registration:lock:email:{email}` and immediately emit `lock_status` to `sid`. |
| 4 | **Redis Pub/Sub Broadcaster** | In `AuthService.register()` when lock is released (or in exception handler): publish `{ "event": "lock_released", "email": email }` to Redis channel `registration_events`. |
| 5 | **Background Pub/Sub Listener** | FastAPI startup event runs an `asyncio` background task that listens to `registration_events` and forwards to `sio.emit('lock_released', data, room=room_name)`. |
| 6 | **Safe Room Leave on Disconnect** | On `@sio.event on('disconnect')`: automatically clean up room memberships for the disconnected `sid`. |

---

## 10.8 Corner Cases & Edge Handling

| # | Corner Case | What Happens | How System Handles It |
|---|---|---|---|
| 1 | **User B receives `lock_released` event, but User A registered successfully** | User B button enables → clicks Register | Backend POST checks DB unique constraint → returns `400: Account already exists`. |
| 2 | **User B edits email while locked** | Old room was for email A; new email is B | React emits `leave_lock_room` for A, emits `join_lock_room` for B, resets countdown. |
| 3 | **Two users open form before any lock exists** | Neither room has active lock | Both see enabled buttons; first to submit acquires lock, second receives `409` and socket lock event. |
| 4 | **User A's registration crashes midway** | Lock stays in Redis until 30s TTL expires | TTL expires naturally → Redis key expires → User B's local timer finishes → User B can submit. |
| 5 | **WebSocket disconnects due to unstable WiFi** | User B loses live socket connection | React socket listener falls back to `GET /auth/register/lock-status` and attempts auto-reconnect. |
| 6 | **Countdown reaches 0, User B and C submit at same millisecond** | Race condition between multiple waiting users | Atomic `SET NX EX 30` in Redis ensures only one wins; loser receives `409 Conflict`. |
| 7 | **User A completes registration in 2s (lock released early)** | User B's initial countdown was 30s | Server broadcasts `lock_released` → User B's countdown instantly cuts from 28s to 0s (no waiting!). |
| 8 | **Network latency delays `lock_released` event** | User B submits before event arrives | Backend evaluates Redis lock: if free, proceeds; if still locked, returns `409 Conflict`. |
| 9 | **Multiple Uvicorn workers running across cluster** | Socket.IO connection is on Worker 1, Registration completes on Worker 2 | Redis Pub/Sub broadcasts event to all workers so Worker 1 pushes to User B. |
| 10 | **Case differences (`User@Example.COM` vs `user@example.com`)** | Different casing in room name or key | Backend and frontend both lowercase and trim email before room join and lock query. |

---

## 10.9 Security Fail Cases & Mitigations

| # | Attack / Failure | Risk Level | Mitigation |
|---|---|---|---|
| 1 | **Attacker floods `join_lock_room` with thousands of random emails** | HIGH: Room flooding & memory consumption | Rate-limit socket events per connection (max 20 room joins/min); validate email format before room join. |
| 2 | **Attacker monitors socket events to discover active registrations** | MEDIUM: Registration sniffing | Socket.IO rooms only broadcast boolean unlock states; zero user data or passwords in event payloads. |
| 3 | **Attacker bypasses Socket.IO and sends POST directly via curl** | LOW: Lock bypass attempt | No risk — backend `POST /auth/register` independently enforces atomic Redis `SET NX` locks. |
| 4 | **Attacker creates thousands of idle WebSocket connections** | HIGH: File descriptor exhaustion / DoS | Enforce max concurrent socket connections per IP; set 30s ping timeout / idle disconnect. |
| 5 | **Cross-Site WebSocket Hijacking (CSWSH)** | MEDIUM: Unauthorized socket access | Restrict CORS allowed origins in Socket.IO server to authorized frontend domains. |
| 6 | **Client tampering: user modifies JavaScript to ignore lock status** | NONE: Client-side bypass | Harmless — backend Redis lock and database unique constraints are authoritative. |

---

## 10.10 Approach Comparison & Architecture Decision

| # | Approach | How It Works | Network & Server Impact | Pros | Cons | Verdict |
|---|---|---|---|---|---|---|
| 1 | **HTTP Polling (GET every 1s)** | Frontend sends a GET request every second until lock clears | ❌ **High Overhead**: 30 HTTP requests per waiting user; 100 waiting users = 3,000 req/min | Always accurate to the second | Wastes server bandwidth, overwhelms Redis with TTL queries, easily hits rate limits | ❌ **Rejected: Too Many Requests** |
| 2 | **Socket.IO / WebSockets (Event Push)** | Client joins email room; FastAPI broadcasts `lock_released` event via Redis Pub/Sub | ✅ **Zero Polling Requests**: 1 persistent socket connection, instant event delivery | Real-time 0ms latency, zero redundant HTTP calls, instant early unlock | Requires `python-socketio` and Redis Pub/Sub synchronization across workers | ✅ **RECOMMENDED REAL-TIME ARCHITECTURE** |
| 3 | **Single GET + Client-Side Countdown (Hybrid)** | 1 debounced GET returns `remaining_seconds`; React runs local `setInterval` counter | ✅ **Minimal Overhead**: Exactly **1 HTTP request** total (97% reduction vs polling) | Extremely simple for junior devs (10 lines React code), no socket servers needed | May drift 1–2s from server TTL if lock released early | ✅ **RECOMMENDED HTTP FALLBACK** |
| 4 | **Server-Sent Events (SSE)** | Unidirectional HTTP event stream (`text/event-stream`) pushes lock countdown ticks | ⚠️ **Moderate**: 1 long-lived HTTP connection per client | Native browser support, simpler than full WebSocket | Connection management, proxy buffering issues, overkill for 30s timer | ❌ **Rejected: Overkill for 30s lock** |
| 5 | **No Countdown (Error on Submit Only)** | User fills form, clicks submit, and backend returns `409 Conflict` | ✅ **Zero Pre-checks**: 1 failed POST request on submit | No frontend timer code needed | Terrible UX: user wastes 30s filling out form only to get rejected upon submit | ❌ **Rejected: Poor User Experience** |

### Why Socket.IO Solves Polling ("Too Many Requests"):
1. **Elimination of Polling Storms**: HTTP Polling requires 30 round-trip HTTP requests per waiting user. With Socket.IO, the client receives the initial state on room join and awaits a single event push when unlocked (**0 polling requests**).
2. **Instant Early Unlock**: If User A's registration completes in 2 seconds, Socket.IO pushes `lock_released` immediately to User B, cutting their wait time from 30s to 2s without waiting for a polling interval.
3. **Dual-Layer Architecture for Junior Devs**: The junior developer implements **Socket.IO (Option 2)** for the optimal real-time push experience, while keeping **Single GET (Option 3)** as the lightweight fallback.

---

# 11. Password Handling

Passwords are **never** stored as plaintext. The system uses one dedicated `PasswordService`:

| Operation | Flow |
|---|---|
| **Registration** | Plain password received over HTTPS → `PasswordService.hash(password)` → hash stored in DB |
| **Login** | Plain password received over HTTPS → `PasswordService.verify(password, stored_hash)` → success/failure |

**Rules:**
- Use Argon2id or Bcrypt (Argon2id preferred).
- The frontend must **never** receive the stored password hash.
- Password hash is excluded from all Pydantic response DTOs.
- JWT must **never** contain the password or password hash.

---

# 12. Authentication & Protected Request Flow

## 12.1 Login Flow

```text
React Login Form
      ↓
POST /auth/login { identity, password }
      ↓
Normalize identity → Find user by email/username
      ↓
User found?  ──NO──→  401 Unauthorized: Invalid credentials
      ↓ YES
is_active == True?  ──NO──→  401 Unauthorized: Account inactive
      ↓ YES
PasswordService.verify(password, stored_hash)
      ↓
Match?  ──NO──→  401 Unauthorized: Invalid credentials
      ↓ YES
JWTService: Sign JWT (sub=user_id, email, exp=60min)
      ↓
Update last_login_at → Return 200 OK { access_token, token_type: "Bearer", expires_in: 3600 }
```

**Login validation:** Always return the same generic error message for "user not found" and "wrong password" to prevent account enumeration.

## 12.2 JWT Contents

| Claim | Value | Purpose |
|---|---|---|
| `sub` | User UUID | Identify the user |
| `email` | User email | Quick reference (optional) |
| `iat` | Issued-at timestamp | Token age tracking |
| `exp` | Expiration timestamp | Auto-expire tokens |
| `iss` / `aud` | Issuer / Audience | Multi-service validation (optional) |

**Never include:** password, password_hash, permissions list, or sensitive DB fields.

JWT signing secret/key must come from secure server-side configuration (`.env`), never hard-coded. Development and production secrets must be different.

## 12.3 Protected Request Flow

```text
React (Bearer JWT)
      ↓
Authentication Dependency: get_current_user(token)
      ↓
  1. Extract Bearer token from Authorization header
  2. Decode JWT signature (HS256/RS256)
  3. Verify exp > current UTC time
  4. Query user by sub UUID
  5. Verify user.is_active == True
      ↓
Authorization Dependency: require_permission("module.action")
      ↓
  6. Check user.is_superuser → if True, bypass and allow
  7. Resolve effective permissions (User → Groups → Roles → Permissions)
  8. Check if required permission exists in effective set
      ↓
Permission found?  ──NO──→  403 Forbidden
      ↓ YES
Route handler → Service → Repository → Database → Response
```

---

# 13. Authorization & Permission Resolution

## 13.1 Authentication vs Authorization

```text
Authentication:  "Who are you?"     →  JWT validates identity
Authorization:   "What can you do?" →  Permission check grants/denies access
```

## 13.2 Effective Permission Calculation

Effective permissions are calculated dynamically on every request by traversing the full access chain:

```text
User (user_id)
  │
  ├── Query 1: Find all Group IDs (user_groups table)
  │     └── [ Group A, Group B, ... ]
  │
  ├── Query 2: Find all Role IDs for those Groups (group_roles table)
  │     └── [ Role 1, Role 2, Role 3, ... ]
  │
  ├── Query 3: Find all Permission codes for those Roles (role_permissions + permissions)
  │     └── [ perm.1, perm.2, perm.1, perm.3, perm.2, perm.4, ... ]
  │
  └── Set Union & Deduplication
        └── Effective Set = { perm.1, perm.2, perm.3, perm.4 }
```

### Example: Security Officer with Multi-Group Membership

```text
User: sarah.security@company.com
 │
 ├── Security Operations Group (SEC_OPS)
 │      ├── Role: Security Auditor
 │      │      ├── audit.view
 │      │      ├── audit.export
 │      │      └── user.view
 │      └── Role: User Compliance Officer
 │             ├── user.view       (duplicate)
 │             ├── user.status
 │             └── group.view
 │
 └── Compliance Group (COMPLIANCE)
        └── Role: System Inspector
               ├── user.view       (duplicate)
               ├── role.view
               ├── permission.view
               └── audit.view      (duplicate)

Effective Set = { audit.view, audit.export, group.view, permission.view, role.view, user.status, user.view }
```

| Request | Required Permission | In Set? | Result |
|---|---|---|---|
| `GET /audit/logs` | `audit.view` | YES | `200 OK` |
| `PATCH /users/8b2f/status` | `user.status` | YES | `200 OK` |
| `POST /users` | `user.create` | NO | `403 Forbidden` |
| `DELETE /groups/sales` | `group.delete` | NO | `403 Forbidden` |

### Example: Support Specialist (Single Group)

```text
User: alex.support@company.com
 └── Customer Support Group
        ├── Role: Support Agent → user.view, user.update
        └── Role: Group Assistant → group.view, user.view (duplicate)

Effective Set = { user.view, user.update, group.view }
```

### Superuser Short-Circuit

When `user.is_superuser == True`, the authorization dependency **immediately approves** the request without querying `user_groups`, `group_roles`, or `role_permissions`. All endpoints return `200 OK` or `201 Created`.

## 13.3 Admin Access Flow

```text
Admin Login → JWT → get_current_user → is_superuser check or permission check → Admin Dashboard
  └── Management Modules: Users, Groups, Roles, Permissions
```

Admin must only see and use management actions that are allowed by the security model.

## 13.4 Security User Access Flow

```text
Security User → JWT → same authentication as all users → permission-based authorization → allowed security operations
```

Security User uses the **same** authentication mechanism as every other user. No separate login flow. Permission-based authorization decides allowed operations.

---

# 14. Backend Component Responsibilities

| Component | Responsibility |
|---|---|
| **Auth Router** | Register, login, refresh, logout endpoints; lock-status endpoint |
| **Auth Service** | Registration business flow, login flow, password verification coordination |
| **JWT Service** | Token creation, validation, claim extraction |
| **Password Service** | `hash(password)`, `verify(password, hash)` using Argon2id/Bcrypt |
| **Redis Lock Service** | Build lock key, acquire lock atomically, check lock TTL, safe release via Lua, `PUBLISH registration_events` |
| **Socket.IO Service** | Real-time WebSocket connection manager, room subscriptions (`reg:lock:{email}`), `lock_status` & `lock_released` event push |
| **User Service** | User CRUD, lifecycle, group assignment |
| **Group/Role/Permission Services** | Entity CRUD, assignment operations |
| **Permission Resolver** | Traverse User→Groups→Roles→Permissions, deduplicate, return effective set |
| **Audit Log Service** | Record security events (login, access changes, admin actions) |
| **Repository Layer** | Database access only — separate repos for User, Group, Role, Permission, UserGroup, GroupRole, RolePermission |
| **Authentication Dependency** | Read JWT, validate, load current user, reject unauthenticated |
| **Authorization Dependency** | Factory: `require_permission("code")` → check effective set or superuser bypass → reject 403 |

---

# 15. API Endpoints & Permission Matrix

## 15.1 API Endpoints

### Authentication & Real-Time Lock Events (Public)

```text
WS   /socket.io                        Real-time Socket.IO bidirectional connection
 ├── Event (C➔S): join_lock_room       Subscribe to email lock room (1s typing debounce)
 ├── Event (C➔S): leave_lock_room      Unsubscribe from email lock room
 ├── Event (S➔C): lock_status          Instant TTL countdown push ({locked, remaining_seconds})
 └── Event (S➔C): lock_released        Instant unlock broadcast via Redis Pub/Sub (0s early unlock)

GET  /auth/register/lock-status        HTTP fallback to check registration lock countdown
POST /auth/register                    Public registration (30s Redis concurrency lock)
POST /auth/login                       Public login
POST /auth/refresh                     Refresh JWT token
POST /auth/logout                      Invalidate token
GET  /auth/me                          Get current user profile
```

### Entity Management (Protected)

```text
GET/POST       /users                  List / Create users
GET/PATCH/DEL  /users/{id}             View / Update / Delete user
GET/POST       /groups                 List / Create groups
GET/PATCH/DEL  /groups/{id}            View / Update / Delete group
POST           /groups/{id}/roles      Assign roles to group
GET/POST       /roles                  List / Create roles
GET/PATCH/DEL  /roles/{id}             View / Update / Delete role
POST           /roles/{id}/permissions Assign permissions to role
GET/POST       /permissions            List / Create permissions
GET/PATCH/DEL  /permissions/{id}       View / Update / Delete permission
POST           /users/{id}/groups      Assign groups to user
```

## 15.2 Permission Matrix

| Module | Action | Permission Code | Admin | Security User | Normal User |
|---|---|---|---|---|---|
| User | View | `user.view` | Yes | Yes | Depends |
| User | Create | `user.create` | Yes | Depends | Depends |
| User | Update | `user.update` | Yes | Depends | Depends |
| User | Delete | `user.delete` | Yes | No | No |
| User | Status | `user.status` | Yes | Yes | No |
| Group | View | `group.view` | Yes | Depends | No |
| Group | Create | `group.create` | Yes | No | No |
| Group | Delete | `group.delete` | Yes | No | No |
| Role | View | `role.view` | Yes | Yes | Depends |
| Role | Create | `role.create` | Yes | No | No |
| Role | Delete | `role.delete` | Yes | No | No |
| Permission | View | `permission.view` | Yes | Yes | No |
| Permission | Delete | `permission.delete` | Yes | No | No |

---

# 16. React Frontend Plan

## 16.1 Screens & Implementation Order

```text
1. Registration Screen (with lock countdown)
2. Login Screen
3. Authentication State (AuthContext)
4. Protected Route Handling
5. Current-User Loading
6. Logout Handling
7. User Management UI (Admin)
8. Group/Role/Permission Management UI (Admin)
9. Permission-Based UI (show/hide buttons)
```

## 16.2 Registration Screen (with Socket.IO Countdown & Live Unlock)

1. Collect fields: username, email, password, phone (optional).
2. Client-side form validation.
3. **Debounced email check (1s after typing stops):** React emits `socket.emit('join_lock_room', { email })` (with automatic fallback to `GET /auth/register/lock-status`).
4. **If locked:** Server pushes `lock_status` `{ locked: true, remaining_seconds: 25 }`. Submit button displays `"Please wait 25s..."` and is disabled.
5. **Live countdown & instant push unlock:** Client runs 1s interval decrement while listening to socket. If User A finishes early, backend emits `lock_released` via Redis Pub/Sub ➔ instant 0s unlock and button enablement!
6. **If not locked or timer finishes:** submit button enables immediately (`"Register Now"`).
7. On submit: `POST /auth/register` (disabling button during API execution).

## 16.3 Login Screen

1. Collect credentials (email/username + password).
2. `POST /auth/login`.
3. Store JWT in AuthContext (in-memory, not localStorage for security).
4. Redirect after successful login.
5. Handle authentication failure with clear error.

## 16.4 Protected Routes & Permission-Based UI

```text
Not logged in         →  Redirect to login
Logged in, no access  →  Show 403 page
Logged in, authorized →  Show content
```

**UI hiding is NOT security.** Even if a button is hidden, the backend must still enforce the permission. Frontend permission checks are convenience only.

```text
user.create   →  show "Create User" button
user.delete   →  show "Delete" button
No permission →  hide button (but backend still blocks if API called directly)
```

---

# 17. Implementation Phases

Follow this exact sequence. Do not skip phases.

| Phase | What to Build | Completion Condition |
|---|---|---|
| **1. Project Foundation** | FastAPI + React project structure, DB connection, Redis connection & Pub/Sub broker, Socket.IO server setup, env config, migrations, error format | Health check proves API, DB, Redis, and Socket.IO `/socket.io` are reachable |
| **2. Database Models** | User, Group, Role, Permission, UserGroup, GroupRole, RolePermission models with PKs, FKs, unique constraints, indexes, timestamps | Migration creates schema successfully; all relationships correct |
| **3. Repository Layer** | CRUD methods for all entities: find/create/update user, group, role, permission; assignment methods; load effective access | Services access DB through repositories, no query logic in routers |
| **4. Password Service** | `hash(password)` and `verify(password, hash)` | Registration stores hashes; login verifies correctly |
| **5. Redis Lock & Pub/Sub Service** | Deterministic key creation, atomic lock (SET NX EX 30), owned release (Lua), TTL query, Redis Pub/Sub broadcast | Two concurrent same-identity requests: one acquired, one rejected; release broadcasts `lock_released` event |
| **6. Registration Service** | Full 13-step transaction order from Section 9.5 | Normal registration succeeds; duplicate blocked; concurrent same-identity blocked; release publishes unlock event |
| **7. JWT Service** | Create token, validate token, extract user identity | Valid token identifies user; invalid/expired token rejected |
| **8. Login Service** | Find user → verify password → check status → create JWT → return response | Valid credentials succeed; wrong credentials fail; inactive user rejected |
| **9. Authentication Dependency** | Reusable `get_current_user`: read Bearer → validate JWT → load user → check is_active | Protected endpoint works with valid JWT; rejects missing/invalid JWT |
| **10. Permission Resolver** | Traverse User → Groups → Roles → Permissions → deduplicated effective set | Test user receives exactly expected permissions from group/role config |
| **11. Authorization Dependency** | `require_permission("code")`: check superuser bypass → resolve effective set → check membership → 403 if missing | Permission exists → allowed; missing → 403 Forbidden |
| **12. Admin APIs** | CRUD for Users, Groups, Roles, Permissions, Assignments (build bottom-up: Permission→Role→Group→User) | Admin can build full access chain through API |
| **13. Security APIs** | Security User operations (view-only + activate/deactivate) | Security User can perform allowed ops; gets 403 for admin-only ops |
| **14. React Auth + Socket.IO Countdown** | Registration (with live Socket.IO lock countdown & instant unlock), login, auth state, protected routes, logout | User can register (with live Socket.IO push countdown UX & instant unlock), log in, access protected pages |
| **15. React Management UI** | User/Group/Role/Permission management screens with permission-based show/hide | Admin can configure full access chain from UI |
| **16. Full Testing** | Unit, concurrency, authorization, security, end-to-end tests | All test plans in Section 19 pass |

---

# 18. Test Plans

## 18.1 Registration Tests

| Test | Input | Expected Result |
|---|---|---|
| Normal registration | New email, valid password | `201 Created`; user in DB; password hashed |
| Concurrent same identity | Two requests, same email, same time | Request A → success; Request B → `409 Conflict`; exactly 1 user in DB |
| After lock release | Register same email after first user's lock released | `400 Bad Request: Account exists` (not blocked by Redis — blocked by DB) |
| Different identities concurrent | A: a@example.com, B: b@example.com | Both succeed independently |
| Lock expiration | Acquire lock, crash before cleanup | Lock auto-expires after 30s |
| Lock ownership | Request B tries to release Request A's lock | Lua script rejects: values don't match |

## 18.2 Lock Countdown & Socket.IO Real-Time Tests

| Test | Input / Action | Expected Result |
|---|---|---|
| Socket room join | Emit `join_lock_room` for `user@example.com` | Socket joined to room `reg:lock:user@example.com` |
| Socket lock active | Room join when Redis lock has 22s TTL | Receives event `lock_status` `{ "locked": true, "remaining_seconds": 22 }` |
| Socket lock absent | Room join when no Redis lock exists | Receives event `lock_status` `{ "locked": false, "remaining_seconds": 0 }` |
| Instant unlock push | User A completes registration / releases lock | Backend broadcasts `lock_released` via Redis Pub/Sub; client button enables immediately |
| HTTP fallback | `GET /lock-status?email=locked@example.com` | `{ "locked": true, "remaining_seconds": 22 }` |
| Rate limiting | 15 room joins or status requests in 1 minute | Rate limiter blocks excess attempts |
| Email normalization | `join_lock_room` for `USER@Example.COM` vs lock on `user@example.com` | Room name and lock detected correctly (normalized key) |

## 18.3 Login Tests

| Test | Expected |
|---|---|
| Correct credentials | `200 OK` with JWT |
| Wrong password | `401 Unauthorized` |
| Unknown identity | `401 Unauthorized` (same message as wrong password) |
| Inactive user + correct password | `401 Unauthorized` |
| Expired JWT on protected endpoint | `401 Unauthorized` |
| Malformed JWT | `401 Unauthorized` |
| Missing JWT on protected endpoint | `401 Unauthorized` |

## 18.4 Authorization Tests

Create test user: Group=Sales, Role=Sales Manager, Permissions=`user.view`, `user.create`, `order.view`

| Request | Expected |
|---|---|
| `GET /users` | `200 OK` (has `user.view`) |
| `POST /users` | `200 OK` (has `user.create`) |
| `GET /orders` | `200 OK` (has `order.view`) |
| `PATCH /users/{id}` | `403 Forbidden` (missing `user.update`) |
| `DELETE /users/{id}` | `403 Forbidden` (missing `user.delete`) |

This proves authorization is **permission-based**, not role-name-based.

## 18.5 Security Tests

The junior developer must verify ALL of these:

- [ ] Passwords never stored in plaintext
- [ ] Passwords never placed in JWT
- [ ] Passwords never stored in Redis locks
- [ ] JWT secret not hard-coded in repository
- [ ] Redis lock acquisition is atomic (SET NX, not GET then SET)
- [ ] Redis lock TTL enforced (30s default)
- [ ] Only lock owner can release lock (Lua UUID check)
- [ ] Database unique constraints exist on identity fields
- [ ] Protected APIs reject missing/invalid JWTs
- [ ] Unauthorized users receive `403 Forbidden`
- [ ] Frontend permission checks are never treated as security
- [ ] Inactive users blocked at authentication dependency
- [ ] Lock-status endpoint is rate-limited
- [ ] Lock-status response does not echo the email back

---

# 19. Operational Rules

## 19.1 Error Handling

Use one consistent API error format across the backend:

```text
{
  "error_code": "MACHINE_READABLE_CONSTANT",
  "message": "Human-readable explanation",
  "request_id": "uuid-for-support",
  "timestamp": "2024-01-01T00:00:00Z"
}
```

| Error Category | When | HTTP Code |
|---|---|---|
| Validation error | Missing/invalid fields | `422` |
| Authentication error | Invalid/missing/expired JWT | `401` |
| Authorization error | Missing required permission | `403` |
| Duplicate data | Email/username already exists | `400` |
| Registration in progress | Redis lock active | `409` |
| Not found | Entity ID doesn't exist | `404` |
| Rate limited | Too many requests | `429` |
| Server error | Unexpected failure | `500` |

Log internal diagnostics (tracebacks, query details) on the server. Return only safe, sanitized messages to clients.

## 19.2 Configuration

Server-side configuration required (via `.env` or environment variables):

| Setting | Default | Notes |
|---|---|---|
| `DATABASE_URL` | — | PostgreSQL or SQLite connection string |
| `REDIS_URL` | — | Redis connection string |
| `JWT_SECRET_KEY` | — | **Never hard-code**; dev and prod must differ |
| `JWT_EXPIRATION_MINUTES` | `60` | Access token lifetime |
| `REGISTRATION_LOCK_TTL` | `30` | Redis lock duration in seconds (configurable) |
| `APP_ENVIRONMENT` | `development` | dev / staging / production |

## 19.3 Caching & Redis Rules

```text
SQL Database  →  Permanent user/access data (source of truth)
Redis         →  Short-lived registration lock + rate limiting + Pub/Sub event broker
JWT           →  Signed authentication state (stateless)
```

- Never treat Redis as the permanent user database.
- Optional: cache effective permissions in Redis for performance (add later, not in first implementation).
- Prioritize correctness and simplicity over optimization in v1.

## 19.4 Transaction & Concurrency Rules

Three layers of protection work together:

```text
Layer 1: Redis Lock        →  Prevents concurrent duplicate workflows (fast, in-memory)
Layer 2: DB Transaction    →  Protects the actual write (ACID)
Layer 3: DB Unique Index   →  Protects final data integrity (permanent)
```

```text
Same-time requests → Redis lock → only one continues → DB transaction → DB unique constraint → permanent integrity
```

---

# 20. Acceptance Criteria & Final Execution Order

## 20.1 Acceptance Criteria

The implementation is **complete** only when ALL of these are true:

### Registration
- [ ] Public user can register
- [ ] Duplicate identity protected by DB uniqueness
- [ ] Concurrent same-identity registration serialized by Redis lock
- [ ] Redis lock defaults to 30 seconds
- [ ] Different identities register concurrently
- [ ] Passwords stored only as secure hashes
- [ ] Lock cleanup is safe (Lua UUID check + TTL auto-expire)
- [ ] Lock countdown displayed to waiting users (new)
- [ ] Lock-status endpoint is rate-limited (new)

### User Management
- [ ] Admin can manage Users, Groups, Roles, Permissions
- [ ] User→Group, Group→Role, Role→Permission assignments work
- [ ] Deletion checks for references before proceeding

### Login
- [ ] Valid credentials produce JWT
- [ ] Invalid credentials rejected (generic error message)
- [ ] Inactive users cannot log in
- [ ] Protected endpoints validate JWTs

### Authorization
- [ ] Permissions derived through User→Group→Role→Permission chain
- [ ] Required permissions checked on every protected operation
- [ ] Missing permission returns `403 Forbidden`
- [ ] Superuser bypasses permission checks
- [ ] Security User has only approved security permissions

### Frontend
- [ ] Registration UI works with lock countdown
- [ ] Login UI works
- [ ] Protected routes work
- [ ] User management UI works for permitted users
- [ ] Permission-aware UI hides/shows buttons correctly

## 20.2 Final Development Execution Order

Use this exact order to avoid dependency problems:

```text
 1. Project configuration + environment setup
        ↓
 2. Database connection + Alembic migrations
        ↓
 3. User / Group / Role / Permission models
        ↓
 4. Junction tables (user_groups, group_roles, role_permissions)
        ↓
 5. Database unique constraints + indexes
        ↓
 6. Repository layer (all entities)
        ↓
 7. Password service (Argon2id)
        ↓
 8. Redis connection + health check
        ↓
 9. Redis registration lock service (SET NX EX 30 + Lua release) & Pub/Sub broadcaster
        ↓
 10. Socket.IO server & event handlers (`join_lock_room`, `lock_status`, `lock_released`) + HTTP fallback endpoint  ← REAL-TIME PUSH
        ↓
 11. Registration service (13-step transaction with Pub/Sub broadcast on commit)
        ↓
12. Registration API (POST /auth/register)
        ↓
13. JWT service (create / validate / extract)
        ↓
14. Login service + Login API
        ↓
15. Authentication dependency (get_current_user)
        ↓
16. Effective permission resolver
        ↓
17. Authorization dependency (require_permission)
        ↓
18. User management APIs
        ↓
19. Group management APIs
        ↓
20. Role management APIs
        ↓
21. Permission management APIs
        ↓
22. Assignment APIs (user→group, group→role, role→permission)
        ↓
23. Security User access rules
        ↓
24. React registration (with lock countdown)  ← NEW
        ↓
25. React login
        ↓
26. React protected routing + auth state
        ↓
27. React user/group/role/permission management
        ↓
28. Permission-based UI (show/hide)
        ↓
29. Unit tests
        ↓
30. Concurrency tests (Redis lock races)
        ↓
31. Lock countdown tests  ← NEW
        ↓
32. Authorization tests
        ↓
33. Security tests
        ↓
34. Full end-to-end tests
        ↓
35. Final review and deployment checklist
```
