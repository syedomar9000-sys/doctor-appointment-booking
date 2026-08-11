# MedBook — Doctor Appointment Booking Platform

A full-stack web application for discovering doctors by specialty and booking appointments. Patients search, filter, and sort doctors, then book available time slots. Doctors manage their profiles and availability.

## Architecture

```
appoitmentbooking/
├── backend/          # Django + DRF REST API (port 8000)
├── frontend/         # Next.js React app (port 3000)
└── README.md
```

The two projects are **fully independent** — they only communicate over HTTP. The frontend calls the backend API via the `NEXT_PUBLIC_API_URL` environment variable.

---

## Backend Setup

### Prerequisites
- Python 3.10+
- (Optional) PostgreSQL — defaults to SQLite for local development

### Steps

```bash
# 1. Create and activate virtual environment
cd backend/
python3 -m venv ../backend_venv
source ../backend_venv/bin/activate  # Linux/Mac
# or: ..\backend_venv\Scripts\activate  # Windows

# 2. Install dependencies
pip install -r requirements.txt

# 3. Configure environment
cp .env.example .env
# Edit .env with your settings (SQLite works out of the box)

# 4. Run migrations
python manage.py migrate

# 5. Seed specialties
python manage.py seed_specialties

# 6. (Optional) Create a superuser for Django admin
python manage.py createsuperuser

# 7. Start the server
python manage.py runserver 8000
```

The API will be available at `http://localhost:8000/api/`.

### API Endpoints

| Endpoint | Method | Auth | Description |
|---|---|---|---|
| `/api/auth/register/` | POST | Public | Register user (patient/doctor) |
| `/api/auth/login/` | POST | Public | Login, get JWT tokens |
| `/api/auth/token/refresh/` | POST | Public | Refresh access token |
| `/api/auth/logout/` | POST | Auth | Blacklist refresh token |
| `/api/auth/me/` | GET/PATCH | Auth | Current user info |
| `/api/specialties/` | GET | Public | List specialties |
| `/api/doctors/` | GET | Public | Search doctors (filters: specialty, city, available, search) |
| `/api/doctors/<id>/` | GET | Public | Doctor detail |
| `/api/doctors/me/` | GET/PATCH | Doctor | Own profile |
| `/api/patients/me/` | GET/PATCH | Patient | Own profile |
| `/api/scheduling/availability/` | GET/POST | Doctor | List/create availability |
| `/api/scheduling/availability/<id>/` | GET/PUT/DELETE | Doctor | Manage availability |
| `/api/scheduling/doctors/<id>/slots/` | GET | Public | Doctor's open time slots |
| `/api/scheduling/book/` | POST | Patient | Book a slot |
| `/api/scheduling/my-appointments/` | GET | Patient | Patient's appointments |
| `/api/scheduling/my-appointments/<id>/cancel/` | POST | Patient | Cancel (2h cutoff) |
| `/api/scheduling/doctor-appointments/` | GET | Doctor | Doctor's appointments |
| `/api/scheduling/doctor-appointments/<id>/cancel/` | POST | Doctor | Cancel (no restriction) |

---

## Frontend Setup

### Prerequisites
- Node.js 18+

### Steps

```bash
# 1. Install dependencies
cd frontend/
npm install

# 2. Configure environment
cp .env.example .env.local
# Default: NEXT_PUBLIC_API_URL=http://localhost:8000/api

# 3. Start the dev server
npm run dev
```

The app will be available at `http://localhost:3000`.

---

## Pages

### Patient-facing
- `/` — Homepage with specialty grid and search
- `/search` — Doctor search with filters (specialty, city, availability) and sort
- `/doctors/[id]` — Doctor profile with available slots and booking
- `/register` — Patient registration
- `/login` — Patient login
- `/my-appointments` — View and cancel appointments

### Doctor-facing
- `/doctor/register` — Doctor registration
- `/doctor/login` — Doctor login
- `/doctor/profile` — Edit profile (specialty, bio, fees, etc.)
- `/doctor/availability` — Set weekly hours and slot duration
- `/doctor/appointments` — View and cancel bookings

---

## Key Design Decisions

### Slot Generation
Time slots are generated **synchronously** when a doctor's availability is created, updated, or deleted. Slots cover a **rolling 14-day window**. No background jobs or Celery are used.

### Booking Safety
Booking uses `transaction.atomic()` with `select_for_update()` on the `TimeSlot` to prevent double-booking under concurrent requests.

### Booking Limits
A patient can hold **one active (non-cancelled) appointment per doctor** at a time, but may have active appointments with multiple different doctors simultaneously.

### Cancellation
- **Patients**: Can cancel up to **2 hours** before the slot's start time.
- **Doctors**: Can cancel at any time.
- Cancelled appointments free the slot for rebooking.

### JWT Storage (Known Tradeoff)
JWT tokens are stored in **localStorage** for simplicity. This is a known security tradeoff for the MVP — in production, the access token should be kept in memory and the refresh token in an httpOnly cookie to mitigate XSS risks.

### Rating
Doctor rating is a **manually-set** nullable decimal field. `null` is displayed as "Not yet rated" on the frontend. There is no review/comment system.

---

## Out of Scope
The following are explicitly **not implemented**:
- Online payments
- Video/telehealth
- File/image uploads
- Email/SMS notifications
- Background jobs (Celery, cron)
- Production deployment (Docker, CI/CD)
- Review/comment system
- Custom admin panel (Django's built-in admin is available at `/admin/`)
