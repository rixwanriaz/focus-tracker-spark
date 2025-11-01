# Daily Team Time Report API

This document describes the new Daily Team Time Report endpoint that provides administrators with a comprehensive view of time tracking data for a specific day across all projects and team members.

## Overview

The Daily Team Time Report endpoint allows administrators to view how much time each team member has spent on each project for a specific day. This report is essential for:

- Daily time tracking oversight
- Project progress monitoring
- Team productivity analysis
- Resource allocation planning
- Billing and financial reporting

## Endpoint Details

### URL
```
GET /api/v1/reports/daily-team-time
```

### Method
`GET`

### Authentication & Authorization
- **Authentication**: Required (user must be logged in)
- **Authorization**: Admin only (requires `finance:read` permission)
- **Organization Scope**: Limited to the authenticated user's organization

## Parameters

| Parameter | Type | Required | Description | Example |
|-----------|------|----------|-------------|---------|
| `date` | `date` (ISO format) | Yes | The date for which to generate the time report | `2024-11-01` |
| `project_id` | `UUID` | No | Optional project UUID to filter results to a specific project | `550e8400-e29b-41d4-a716-446655440000` |

### Query Parameters
```
GET /api/v1/reports/daily-team-time?date=2024-11-01&project_id=550e8400-e29b-41d4-a716-446655440000
```

## Response

### Success Response (200 OK)

```json
{
  "date": "2024-11-01",
  "projects": [
    {
      "project_id": "550e8400-e29b-41d4-a716-446655440000",
      "project_name": "Project Alpha",
      "team_members": [
        {
          "user_id": "550e8400-e29b-41d4-a716-446655440001",
          "user_email": "john.doe@company.com",
          "project_id": "550e8400-e29b-41d4-a716-446655440000",
          "project_name": "Project Alpha",
          "date": "2024-11-01",
          "total_hours": 8.5,
          "billable_hours": 7.0
        },
        {
          "user_id": "550e8400-e29b-41d4-a716-446655440002",
          "user_email": "jane.smith@company.com",
          "project_id": "550e8400-e29b-41d4-a716-446655440000",
          "project_name": "Project Alpha",
          "date": "2024-11-01",
          "total_hours": 6.25,
          "billable_hours": 6.25
        }
      ]
    },
    {
      "project_id": "550e8400-e29b-41d4-a716-446655440003",
      "project_name": "Project Beta",
      "team_members": [
        {
          "user_id": "550e8400-e29b-41d4-a716-446655440001",
          "user_email": "john.doe@company.com",
          "project_id": "550e8400-e29b-41d4-a716-446655440003",
          "project_name": "Project Beta",
          "date": "2024-11-01",
          "total_hours": 2.5,
          "billable_hours": 2.5
        }
      ]
    }
  ]
}
```

### Response Schema

#### DailyTeamTimeResponse
| Field | Type | Description |
|-------|------|-------------|
| `date` | `date` | The date for which the report was generated |
| `projects` | `Array<DailyProjectTimeItem>` | List of projects with team member time data |

#### DailyProjectTimeItem
| Field | Type | Description |
|-------|------|-------------|
| `project_id` | `UUID` | Unique identifier of the project |
| `project_name` | `string` | Name of the project |
| `team_members` | `Array<DailyTeamTimeItem>` | List of team members who logged time on this project |

#### DailyTeamTimeItem
| Field | Type | Description |
|-------|------|-------------|
| `user_id` | `UUID` | Unique identifier of the team member |
| `user_email` | `string` | Email address of the team member |
| `project_id` | `UUID` | Unique identifier of the project |
| `project_name` | `string` | Name of the project |
| `date` | `date` | The date for which time was logged |
| `total_hours` | `float` | Total hours logged by the user on this project for the day |
| `billable_hours` | `float` | Billable hours logged by the user on this project for the day |

## Error Responses

### 401 Unauthorized
```json
{
  "detail": "Not authenticated"
}
```

### 403 Forbidden
```json
{
  "detail": "Forbidden"
}
```

### 400 Bad Request
```json
{
  "detail": "Invalid datetime format: ..."
}
```

## Data Source & Calculation

### Time Entry Aggregation
- The report aggregates data from the `TimeEntry` table
- Only includes completed time entries (`end_ts` is not null)
- Filters time entries that started within the specified date (00:00:00 to 23:59:59 UTC)
- Optionally filters by project when `project_id` parameter is provided
- Groups data by user and project
- Calculates both total and billable hours

### Data Relationships
- Links `TimeEntry` with `User` to get user emails
- Links `TimeEntry` with `Project` to get project names
- Handles cases where project might be null (shows as "No Project")

### Business Logic
- **Billable Hours**: Only includes time entries marked as `billable = true`
- **Total Hours**: Includes all logged time regardless of billable status
- **Organization Scope**: Limited to the authenticated user's organization
- **Date Range**: Uses the exact date provided (no date range expansion)

## Usage Examples

### Using cURL
```bash
curl -X GET \
  "http://localhost:8000/api/v1/reports/daily-team-time?date=2024-11-01&project_id=550e8400-e29b-41d4-a716-446655440000" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Using Python (httpx)
```python
import httpx
from datetime import date

response = httpx.get(
    "http://localhost:8000/api/v1/reports/daily-team-time",
    params={
        "date": date.today().isoformat(),
        "project_id": "550e8400-e29b-41d4-a716-446655440000"  # Optional: filter to specific project
    },
    headers={"Authorization": "Bearer YOUR_JWT_TOKEN"}
)

data = response.json()
for project in data["projects"]:
    print(f"Project: {project['project_name']}")
    for member in project["team_members"]:
        print(f"  {member['user_email']}: {member['total_hours']} hours")
```

### Using JavaScript (fetch)
```javascript
const date = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format

fetch(`http://localhost:8000/api/v1/reports/daily-team-time?date=${date}&project_id=550e8400-e29b-41d4-a716-446655440000`, {
  method: 'GET',
  headers: {
    'Authorization': 'Bearer YOUR_JWT_TOKEN',
    'Content-Type': 'application/json'
  }
})
.then(response => response.json())
.then(data => {
  console.log(`Report for ${data.date}`);
  data.projects.forEach(project => {
    console.log(`Project: ${project.project_name}`);
    project.team_members.forEach(member => {
      console.log(`  ${member.user_email}: ${member.total_hours} hours`);
    });
  });
});
```

## Integration Notes

### Frontend Integration
- Use this endpoint to build daily time tracking dashboards
- Combine with other reporting endpoints for comprehensive analytics
- Cache results appropriately since historical data doesn't change frequently

### Backend Integration
- Consider implementing caching for frequently accessed dates
- May want to add pagination if organizations grow very large
- Consider async processing for organizations with extensive time tracking data

## Related Endpoints

- `GET /api/v1/reports/time` - General time reports with flexible grouping
- `GET /api/v1/projects/{project_id}/user-costs` - User costs for a specific project
- `GET /api/v1/projects/{project_id}/financials` - Financial overview for a project

## Security Considerations

- Only accessible to users with admin role or `finance:read` permission
- Data is scoped to the user's organization
- No sensitive information is exposed beyond what's needed for time tracking oversight
