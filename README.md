# LeadGenTool

A full-stack lead management dashboard built to help businesses organize, qualify, prioritize, and export potential sales leads.

## Features

- **Lead Scoring:** Automatically calculates a score based on industry, company size, email availability, and website availability.
- **Dashboard Analytics:** Displays total leads, qualified leads, and average lead score.
- **Search and Filtering:** Search leads and filter by industry and minimum score.
- **Duplicate Removal:** Detects and removes duplicate company records.
- **CSV Export:** Exports filtered lead results for use in sales workflows.
- **Lead Management:** Add and store leads through a React interface connected to a Django REST API.

## Technology Stack

**Frontend**
- React
- Vite
- Tailwind CSS
- JavaScript

**Backend**
- Python
- Django
- Django REST Framework

**Database**
- SQLite

## Architecture

The React frontend communicates with the Django REST API using HTTP requests. Django REST Framework validates incoming lead data, applies the lead-scoring logic, and stores records in SQLite.

## API Endpoints

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/leads/` | Retrieve leads |
| POST | `/api/leads/` | Create a lead |
| GET | `/api/leads/stats/` | Retrieve dashboard statistics |
| POST | `/api/leads/remove-duplicates/` | Remove duplicate leads |
| GET | `/api/leads/export/` | Export leads as CSV |

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/sumsinh/LeadGenTool
cd LeadGenTool
```

### 2. Set up the backend

Open a terminal:

```bash
cd backend
python -m venv venv
```

Activate the virtual environment on Windows:

```powershell
.\venv\Scripts\Activate.ps1
```

Install dependencies:

```bash
pip install django djangorestframework django-cors-headers
```

Apply database migrations:

```bash
python manage.py migrate
```

Start the backend:

```bash
python manage.py runserver
```

The API will be available at `http://127.0.0.1:8000/`.

### 3. Set up the frontend

Open a second terminal:

```bash
cd frontend
npm install
npm run dev
```

Open the local URL displayed by Vite, usually `http://localhost:5173/`.

## Database and Data

SQLite stores lead records locally. Run Django migrations to create the database schema. Add sample leads through the dashboard or API.

## Design and Business Value

Lead scoring helps sales teams prioritize potentially valuable companies. Search, filters, duplicate removal, and CSV export reduce manual work and make lead lists easier to prepare for outreach.

## Current Scope

This project demonstrates lead management and qualification. It does not currently implement live web scraping or automated lead enrichment.

## Future Improvements

- Integrate authorized lead data sources.
- Add email and website validation.
- Introduce user authentication and role-based access.
- Deploy the frontend and backend.
- Consider PostgreSQL for production workloads.
