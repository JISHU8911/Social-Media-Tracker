# Social Interaction Tracker (SIT) - System Architecture Report

**Document Version**: 2.0  
**Scope**: Multi-Tenant Multi-Organization SaaS Architecture  
**Target Environment**: Next.js App Router, Vercel Deployment, PostgreSQL DB  

---

## 1. System High-Level Architecture

The SIT Multi-Organization platform is structured as a single-codebase multi-tenant application enforcing strict logical tenant separation at the database and application authorization layers.

```
+-----------------------------------------------------------------------------------+
|                                 CLIENT LAYER                                      |
|  - Modern SaaS Landing Page (/)                                                   |
|  - Auth Portals (/login, /signup, /register-organization)                        |
|  - Platform Super Admin HQ (/super-admin)                                         |
|  - Organization Admin Portal (/admin, /admin/members, /admin/join-requests)       |
|  - Member Workspace (/member, /member/history, /profile)                          |
+-----------------------------------------------------------------------------------+
                                          |
                                    HTTPS / REST API
                                          |
+-----------------------------------------------------------------------------------+
|                              APPLICATION LAYER (Next.js)                          |
|  - Auth & Session Middleware (lib/auth.ts - JWT HS256)                            |
|  - Tenant Scoping Guard (verifyOrgAccess, requireOrgAdmin, requirePlatformSuperAdmin)|
|  - Business Logic & Validation (Name Regex, Duplicate Protection, Max Lengths)    |
|  - External Integrations (@vercel/blob for image uploads, xlsx for reporting)     |
+-----------------------------------------------------------------------------------+
                                          |
                                Prisma ORM (Type-Safe)
                                          |
+-----------------------------------------------------------------------------------+
|                               DATABASE LAYER (PostgreSQL)                         |
|  - Organization (id, orgId, uniqueCode, officialEmail, status)                    |
|  - User (id, email, passwordHash, role, organizationId)                           |
|  - OrganizationMembership (organizationId, userId, designationId, role)           |
|  - JoinRequest (organizationId, userId, designationId, status)                    |
|  - Post (id, organizationId, title, imageUrl, trackingCode)                       |
|  - Designation (id, organizationId, designationName)                              |
|  - Submission (id, organizationId, userId, postId, fullName, designationId)       |
+-----------------------------------------------------------------------------------+
```

---

## 2. Multi-Tenant Data Isolation Strategy

Data isolation is guaranteed through **Logical Database Partitioning**:
1. **Tenant ID Pointer**: Core entity models (`Post`, `Designation`, `Submission`, `OrganizationMembership`, `JoinRequest`) hold a direct relation to `organizationId`.
2. **Session Scoping**: Upon successful authentication, the user's JWT payload and session object store `organizationId` and `organizationStatus`.
3. **Query Scoping**: Every Prisma database query executed within `/api/admin/*`, `/api/posts`, `/api/designations`, `/api/submissions`, and `/api/analytics` injects an explicit `where: { organizationId: session.organizationId }` filter clause.
4. **Cross-Tenant Guard**: If a user attempts to fetch or mutate an item belonging to another `organizationId`, the API route halts execution and returns an HTTP `403 Forbidden` error.

---

## 3. Data Flow & Request Lifecycles

### 3.1 Organization Onboarding Lifecycle
1. **Submit Registration**: Visitor enters Org Name, Official Email, and Password on `/register-organization`. Org created with `status: "PENDING"`.
2. **Super Admin Review**: Platform Super Admin reviews pending orgs at `/super-admin`.
3. **Approval Execution**:
   - Generates sequential `orgId` (e.g. `ORG-1001`) and 8-character `uniqueCode` (e.g. `K8P2X9F4`).
   - Creates or updates `User` with role `ORGANIZATION_SUPER_ADMIN`.
   - Creates `OrganizationMembership`.
   - Updates Org status to `ACTIVE`.

### 3.2 Employee Join & Designation Loading Lifecycle
1. **User Registration**: User signs up on `/signup` with role `USER`.
2. **Credential Verification**: On `/profile`, user submits Org ID and Unique Code to `/api/organizations/verify`.
3. **Dynamic Designation Fetch**: API returns only active `Designation` records for that specific org.
4. **Join Request**: User selects designation and submits a `JoinRequest` (`status: "PENDING"`).
5. **Admin Approval**: Org Admin approves request at `/admin/join-requests`. User role updates to `MEMBER` linked to the organization.

---

## 4. Scalability & Deployment Considerations

- **Serverless Ready**: Built with Next.js App Router serverless API handlers optimized for Vercel deployment.
- **Database Indexing**: Unique indexes on `[organizationId, designationName]`, `[organizationId, userId]`, `[postId, fullName, designationId]`, and `trackingCode` ensure O(1) query performance even as submission volume scales.
