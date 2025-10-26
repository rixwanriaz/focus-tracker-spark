# Reporting & Forecasting API - Quick Reference

## Endpoints at a Glance

### Reporting
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/reports/time` | Generate time report (JSON body) |
| GET | `/reports/time` | Get time report (query params) |
| GET | `/reports/time/csv` | Download CSV export |
| GET | `/reports/leaderboard` | Profitability leaderboard |
| GET | `/reports/capacity` | Capacity planning |
| GET | `/reports/exports` | List export jobs |
| GET | `/reports/{export_id}` | Get export status |

### Forecasting
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/forecast/project/{id}` | Compute forecast |
| GET | `/forecast/project/{id}` | Get forecast |

---

## Common Query Parameters

### Date Filters
```bash
from_date=2025-10-01    # ISO date format
to_date=2025-10-31      # ISO date format
```

### Pagination
```bash
limit=50                # Max results (default: 50)
offset=0                # Skip results (default: 0)
```

### Grouping
```bash
group_by=user           # Single dimension
group_by=user,project   # Multiple dimensions
```

---

## Example cURL Commands

### 1. Get Time Report
```bash
curl "http://localhost:8000/api/v1/reports/time?from_date=2025-10-01&to_date=2025-10-31&group_by=project" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 2. Download CSV
```bash
curl "http://localhost:8000/api/v1/reports/time/csv?from_date=2025-10-01&to_date=2025-10-31" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  --output report.csv
```

### 3. Get Leaderboard
```bash
curl "http://localhost:8000/api/v1/reports/leaderboard?sort_by=profitability&limit=10" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 4. Compute Forecast
```bash
curl -X POST "http://localhost:8000/api/v1/forecast/project/YOUR_PROJECT_ID" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"lookback_days": 30, "confidence": 0.95}'
```

### 5. Get Forecast
```bash
curl "http://localhost:8000/api/v1/forecast/project/YOUR_PROJECT_ID" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## Response Examples

### Time Report Response
```json
{
  "rows": [
    {
      "user_id": "uuid",
      "project_id": "uuid",
      "task_id": null,
      "total_hours": 44.0,
      "billable_hours": 44.0,
      "billable_value": null
    }
  ],
  "total_count": 1
}
```

### Leaderboard Response
```json
{
  "items": [
    {
      "project_id": "uuid",
      "project_name": "AI Integration",
      "revenue": 1200.27,
      "cost": 800.0,
      "profit": 400.27,
      "margin": 33.36,
      "billable_hours": 120.0
    }
  ],
  "total_count": 1
}
```

### Forecast Response
```json
{
  "project_id": "uuid",
  "method": "linear_burn",
  "computed_at": "2025-10-26T18:45:01Z",
  "predicted_budget_exhausted_date": "2025-11-14",
  "confidence_band": {
    "low_date": "2025-11-07",
    "high_date": "2025-12-06"
  },
  "series": [/* array of {date, cumulative_spend} */],
  "explanation": "Linear burn based on last 30 days..."
}
```

### Capacity Response
```json
{
  "items": [
    {
      "user_id": "uuid",
      "available_hours": 240.0,
      "booked_hours": 0.0,
      "actual_hours": 44.0,
      "utilization": 0.18,
      "booking_load": 0.0,
      "status": "underbooked"
    }
  ],
  "total_count": 1
}
```

---

## Status Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Created (forecast computed) |
| 400 | Bad request (invalid date format, etc.) |
| 403 | Forbidden (insufficient permissions) |
| 404 | Not found (project/export doesn't exist) |
| 500 | Server error |

---

## Swagger UI

Interactive documentation: **http://localhost:8000/docs**

Full documentation: See `REPORTING_FORECASTING_API.md`

