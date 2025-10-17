# Frontend Rate System Implementation Guide

This document outlines the frontend implementation requirements for the simple per-user-per-project rate system.

## Overview

The rate system has been simplified to provide a clean user experience:
- Each user sets their own hourly rate for each project
- When time tracking starts, billing automatically uses the user's project rate
- No complex rate hierarchies or multiple rate types for users

## API Endpoints

### 1. Set User's Project Rate
**Endpoint:** `POST /api/v1/projects/{project_id}/my-rate`

**Request Body:**
```json
{
  "hourly_rate": 75.0
}
```

**Response:** `204 No Content` (success)

**Purpose:** Allows users to set their own hourly rate for a specific project.

### 2. Resolve Rate for Project
**Endpoint:** `GET /api/v1/projects/{project_id}/rate-resolve?for_user_id={user_id}&rate_type=billable`

**Response:**
```json
{
  "currency": "USD",
  "rate_type": "billable", 
  "hourly_rate": 75.0,
  "source": "rates",
  "resolved_scope": "project_member",
  "resolved_scope_id": "project-uuid"
}
```

**Purpose:** Check what rate will be used for billing before starting time tracking.

### 3. Time Tracking Endpoints
**Start Timer:** `POST /api/v1/time/timers/start`
**Stop Timer:** `POST /api/v1/time/timers/stop`
**Manual Entry:** `POST /api/v1/time/entries`

### 4. Financial Reporting
**Get Financials:** `GET /api/v1/projects/{project_id}/financials`
**Recompute:** `POST /api/v1/projects/{project_id}/financials/recompute`

## Frontend Implementation Requirements

### 1. Project Rate Setup Flow

#### When User Joins a Project
```javascript
// Check if user has a rate set for this project
async function checkUserRate(projectId, userId) {
  try {
    const response = await fetch(
      `/api/v1/projects/${projectId}/rate-resolve?for_user_id=${userId}&rate_type=billable`
    );
    
    if (response.status === 404) {
      // No rate set - show rate setup modal
      showRateSetupModal(projectId);
    } else if (response.ok) {
      const rateData = await response.json();
      console.log(`Your rate for this project: $${rateData.hourly_rate}/hr`);
    }
  } catch (error) {
    console.error('Failed to check rate:', error);
  }
}
```

#### Rate Setup Modal Component
```jsx
function RateSetupModal({ projectId, onComplete }) {
  const [hourlyRate, setHourlyRate] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await fetch(`/api/v1/projects/${projectId}/my-rate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hourly_rate: parseFloat(hourlyRate) })
      });
      
      if (response.ok) {
        onComplete();
      } else {
        throw new Error('Failed to set rate');
      }
    } catch (error) {
      alert('Failed to set rate. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal">
      <h2>Set Your Hourly Rate</h2>
      <p>Please set your hourly rate for this project before starting time tracking.</p>
      
      <form onSubmit={handleSubmit}>
        <label>
          Hourly Rate ($):
          <input
            type="number"
            step="0.01"
            min="0"
            value={hourlyRate}
            onChange={(e) => setHourlyRate(e.target.value)}
            required
          />
        </label>
        
        <button type="submit" disabled={loading}>
          {loading ? 'Setting...' : 'Set Rate'}
        </button>
      </form>
    </div>
  );
}
```

### 2. Time Tracking Integration

#### Enhanced Timer Start with Rate Validation
```javascript
async function startTimer(projectId, taskId = null) {
  try {
    // First, ensure user has a rate set
    const rateCheck = await fetch(
      `/api/v1/projects/${projectId}/rate-resolve?for_user_id=${currentUserId}&rate_type=billable`
    );
    
    if (rateCheck.status === 404) {
      // Show rate setup flow
      showRateSetupModal(projectId, () => {
        // After rate is set, start the timer
        actuallyStartTimer(projectId, taskId);
      });
      return;
    }
    
    // Rate exists, start timer normally
    await actuallyStartTimer(projectId, taskId);
    
  } catch (error) {
    console.error('Failed to start timer:', error);
  }
}

async function actuallyStartTimer(projectId, taskId) {
  const response = await fetch('/api/v1/time/timers/start', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      project_id: projectId,
      task_id: taskId,
      billable: true,
      source: 'timer'
    })
  });
  
  if (response.ok) {
    const timerData = await response.json();
    updateTimerState(timerData);
  }
}
```

### 3. Project Management

#### Adding Users to Projects
```javascript
// Admin/Manager can add users to projects with initial rate
async function addUserToProject(projectId, userId, role = 'contributor', initialRate = null) {
  const response = await fetch(`/api/v1/projects/${projectId}/members`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      user_id: userId,
      role: role,
      hourly_rate_override: initialRate
    })
  });
  
  return response.ok;
}
```

#### Project Members List with Rate Display
```jsx
function ProjectMembersList({ projectId }) {
  const [members, setMembers] = useState([]);

  useEffect(() => {
    fetchMembers();
  }, [projectId]);

  const fetchMembers = async () => {
    const response = await fetch(`/api/v1/projects/${projectId}/members`);
    if (response.ok) {
      const membersData = await response.json();
      setMembers(membersData);
    }
  };

  return (
    <div className="members-list">
      <h3>Project Members</h3>
      {members.map(member => (
        <div key={member.id} className="member-item">
          <span className="member-name">{member.user.full_name}</span>
          <span className="member-role">{member.role}</span>
          {member.hourly_rate_override && (
            <span className="member-rate">${member.hourly_rate_override}/hr</span>
          )}
        </div>
      ))}
    </div>
  );
}
```

### 4. Financial Dashboard

#### Project Financials Display
```jsx
function ProjectFinancials({ projectId }) {
  const [financials, setFinancials] = useState(null);

  useEffect(() => {
    fetchFinancials();
  }, [projectId]);

  const fetchFinancials = async () => {
    const response = await fetch(`/api/v1/projects/${projectId}/financials`);
    if (response.ok) {
      const data = await response.json();
      setFinancials(data);
    }
  };

  const recomputeFinancials = async () => {
    await fetch(`/api/v1/projects/${projectId}/financials/recompute`, {
      method: 'POST'
    });
    fetchFinancials(); // Refresh data
  };

  if (!financials) return <div>Loading...</div>;

  return (
    <div className="financials-dashboard">
      <h3>Project Financials</h3>
      
      <div className="metrics-grid">
        <div className="metric">
          <label>Revenue:</label>
          <span>${financials.revenue.toFixed(2)}</span>
        </div>
        
        <div className="metric">
          <label>Billable Hours:</label>
          <span>{financials.billable_hours.toFixed(2)}h</span>
        </div>
        
        <div className="metric">
          <label>Average Rate:</label>
          <span>
            ${financials.billable_hours > 0 
              ? (financials.revenue / financials.billable_hours).toFixed(2) 
              : '0.00'}/hr
          </span>
        </div>
      </div>
      
      <button onClick={recomputeFinancials}>
        Refresh Financials
      </button>
    </div>
  );
}
```

## User Experience Flow

### 1. New User Joining Project
1. User is added to project (by admin/manager)
2. User navigates to project
3. System checks if user has rate set
4. If no rate: Show rate setup modal (blocking)
5. User sets their hourly rate
6. User can now start time tracking

### 2. Time Tracking Flow
1. User selects project and task (optional)
2. User clicks "Start Timer"
3. System validates user has rate for project
4. If no rate: Show setup modal, then start timer
5. Timer runs and tracks time
6. When stopped, time entry is created with billable=true

### 3. Rate Management
1. User can update their rate anytime via project settings
2. Changes take effect for new time entries
3. Historical financials remain unchanged
4. Rate changes can trigger financial recompute

## Error Handling

### Rate Not Set Error
```javascript
// Handle 404 when checking rate
if (response.status === 404) {
  // Show user-friendly message
  showNotification(
    'Please set your hourly rate for this project before starting time tracking.',
    'info'
  );
  showRateSetupModal(projectId);
}
```

### Rate Setup Validation
```javascript
// Validate rate input
function validateRate(rate) {
  if (!rate || rate <= 0) {
    return 'Rate must be greater than $0';
  }
  if (rate > 1000) {
    return 'Rate seems unusually high. Please confirm.';
  }
  return null;
}
```

## CSS Classes for Styling

```css
.rate-setup-modal {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  z-index: 1000;
}

.rate-input {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
}

.member-rate {
  background: #e8f5e8;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-weight: bold;
  color: #2d5a2d;
}

.financials-metric {
  display: flex;
  justify-content: space-between;
  padding: 0.5rem 0;
  border-bottom: 1px solid #eee;
}
```

## Integration Checklist

- [ ] Implement rate setup modal component
- [ ] Add rate validation to timer start flow
- [ ] Create project members management interface
- [ ] Build financial dashboard with rate-based calculations
- [ ] Add rate display to project member lists
- [ ] Implement error handling for rate-related API calls
- [ ] Add rate update functionality in project settings
- [ ] Test complete flow: join project → set rate → track time → view financials

## Testing Scenarios

1. **New User Flow:** User joins project without rate → setup modal appears
2. **Rate Update:** User changes rate → financials update on recompute
3. **Multiple Users:** Different users with different rates on same project
4. **Rate Validation:** Invalid rate inputs are rejected
5. **Financial Accuracy:** Revenue calculations match hours × rate

This implementation provides a clean, user-friendly experience while maintaining the simplicity of one rate per user per project.
