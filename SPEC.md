# Travel Agency Agent Application Specification

## 1. Project Overview

**Project Name:** TravelMate AI  
**Type:** Full-stack Travel Agency Web Application  
**Core Functionality:** AI-powered travel booking agent with multi-user support (Travelers, Admins, Property Sales)  
**Target Users:** Travelers seeking resort bookings, Admin staff managing escalations, Property Sales managing availability

## 2. Technology Stack

### Frontend
- **Framework:** Next.js 14 (App Router)
- **Styling:** TailwindCSS
- **State Management:** React Context + Zustand
- **HTTP Client:** Axios

### Backend
- **Framework:** FastAPI (Python)
- **Database:** PostgreSQL with SQLAlchemy ORM
- **Authentication:** JWT-based auth
- **AI Integration:** OpenAI GPT-4 API
- **File Storage:** Local filesystem (production: S3)

### External Services
- **Payment:** Stripe (simulated for demo)
- **Authentication:** JWT tokens

## 3. UI/UX Specification

### Color Palette
- **Primary:** #0EA5E9 (Sky Blue)
- **Primary Dark:** #0284C7
- **Secondary:** #F97316 (Orange)
- **Background:** #F8FAFC
- **Surface:** #FFFFFF
- **Text Primary:** #1E293B
- **Text Secondary:** #64748B
- **Success:** #22C55E
- **Warning:** #EAB308
- **Error:** #EF4444

### Typography
- **Font Family:** Inter (Google Fonts)
- **Headings:** Bold, sizes: h1(2.5rem), h2(2rem), h3(1.5rem), h4(1.25rem)
- **Body:** Regular 1rem, line-height 1.6

### Responsive Breakpoints
- Mobile: < 640px
- Tablet: 640px - 1024px
- Desktop: > 1024px

### Layout Structure

#### Public Pages
- **Landing Page:** Hero section, features, CTA
- **Login/Register:** Centered card form
- **Chat Interface:** Full-screen chat with sidebar

#### Dashboard (Admin/Property Sales)
- **Sidebar:** 240px fixed, collapsible on mobile
- **Header:** User info, notifications
- **Main Content:** Fluid width

### Components

#### Buttons
- Primary: Sky blue bg, white text, rounded-lg, hover:darken
- Secondary: White bg, border, hover:bg-gray-50
- Danger: Red bg for destructive actions

#### Forms
- Input: Full border, rounded, focus:ring-2 sky blue
- Labels: Above input, font-medium
- Error states: Red border, error message below

#### Cards
- White bg, shadow-sm, rounded-xl, padding 1.5rem

#### Chat Bubble
- User: Right-aligned, sky blue bg
- AI: Left-aligned, gray bg
- System: Centered, yellow bg

## 4. Database Schema

### Users
```
id: UUID (PK)
email: String (unique)
password_hash: String
full_name: String
role: Enum (traveler, admin, property_sales)
phone: String (optional)
created_at: DateTime
updated_at: DateTime
```

### Properties
```
id: UUID (PK)
name: String
description: Text
location: String
contact_name: String
contact_email: String
contact_phone: String
images: JSON[]
amenities: JSON[]
created_at: DateTime
updated_at: DateTime
```

### Rooms
```
id: UUID (PK)
property_id: UUID (FK)
name: String
description: Text
max_occupancy: Integer
base_rate: Decimal
created_at: DateTime
```

### Bookings
```
id: UUID (PK)
user_id: UUID (FK)
property_id: UUID (FK)
room_id: UUID (FK)
check_in: Date
check_out: Date
guests: Integer
total_amount: Decimal
status: Enum (pending, confirmed, cancelled, completed)
payment_status: Enum (pending, paid, refunded)
stripe_payment_id: String (optional)
voucher_code: String (unique)
notes: Text
created_at: DateTime
updated_at: DateTime
```

### Messages
```
id: UUID (PK)
user_id: UUID (FK)
conversation_id: UUID
role: Enum (user, assistant, system)
content: Text
is_escalation: Boolean
escalation_status: Enum (pending, resolved)
admin_response: Text (optional)
created_at: DateTime
```

### Documents (Knowledge Base)
```
id: UUID (PK)
title: String
content: Text
file_url: String
created_at: DateTime
```

## 5. API Endpoints

### Auth
- POST /api/auth/register
- POST /api/auth/login
- GET /api/auth/me

### Users
- GET /api/users
- GET /api/users/{id}
- PUT /api/users/{id}

### Properties
- GET /api/properties
- GET /api/properties/{id}
- POST /api/properties (admin)
- PUT /api/properties/{id} (admin)
- DELETE /api/properties/{id} (admin)

### Rooms
- GET /api/properties/{id}/rooms
- POST /api/properties/{id}/rooms (admin/property_sales)
- PUT /api/rooms/{id}
- DELETE /api/rooms/{id}

### Bookings
- GET /api/bookings
- GET /api/bookings/{id}
- POST /api/bookings
- PUT /api/bookings/{id}/confirm (property_sales)
- PUT /api/bookings/{id}/cancel

### Messages
- GET /api/conversations/{id}/messages
- POST /api/conversations/{id}/messages
- POST /api/chat (AI chat endpoint)
- GET /api/escalations (admin)
- PUT /api/escalations/{id} (admin response)

### Documents
- GET /api/documents
- POST /api/documents (admin)
- DELETE /api/documents/{id} (admin)

### Analytics
- GET /api/analytics/overview (admin)
- GET /api/analytics/queries (admin)

## 6. Page Specifications

### Landing Page (/)
- Hero with travel image, headline, CTA button
- Features section (3 columns)
- How it works (3 steps)
- Footer with links

### Login (/login)
- Centered card (max-width 400px)
- Email + password fields
- "Login" button
- "Register" link

### Register (/register)
- Centered card
- Full name, email, password, confirm password
- Role selection (traveler default)
- "Register" button
- "Login" link

### Chat (/chat)
- Full screen layout
- Left sidebar (280px): Conversation list, new chat button
- Main area: Messages + input
- Floating action for mobile menu

### Dashboard (/dashboard)
- Sidebar navigation
- Overview stats cards
- Recent bookings table
- Quick actions

### Admin Escalations (/dashboard/escalations)
- Table of pending escalations
- Filter by status
- Response form modal

### Property Management (/dashboard/properties)
- Property cards grid
- Add property button
- Edit/delete actions

### Booking Management (/dashboard/bookings)
- Bookings table with filters
- Status badges
- Actions: View, Confirm, Cancel

## 7. AI Chat Flow

1. User sends message
2. Backend checks document knowledge base
3. If found → AI responds with context
4. If not found → Check property database
5. If property found with rates → Provide quote
6. If no rates → Escalate to admin
7. Save message to database

## 8. Booking Flow

1. AI provides quote based on property/room rates
2. User requests to book
3. Backend creates pending booking
4. Property sales sees in dashboard
5. Property sales confirms availability
6. User confirms booking intent
7. Payment collected (Stripe simulated)
8. Booking confirmed, voucher generated
9. Confirmation sent to user

## 9. Acceptance Criteria

### Authentication
- [ ] Users can register with email/password
- [ ] Users can login and receive JWT token
- [ ] Protected routes require valid token
- [ ] Role-based access control works

### Chat
- [ ] Users can send messages
- [ ] AI responds with context from knowledge base
- [ ] Escalations are queued for admin
- [ ] Conversation history is preserved

### Bookings
- [ ] Travelers can request bookings
- [ ] Property sales can confirm/reject
- [ ] Payment flow completes (simulated)
- [ ] Voucher generated on confirmation

### Admin Dashboard
- [ ] Can view all escalations
- [ ] Can respond to escalations
- [ ] Can manage properties and rooms
- [ ] Can view analytics

### Property Sales
- [ ] Can view assigned properties
- [ ] Can update room availability
- [ ] Can confirm/reject bookings
