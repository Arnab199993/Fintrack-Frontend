# Redux Toolkit Setup Guide

## Overview

Your Fintrack frontend has been refactored to use **Redux Toolkit** instead of Context API. The API layer now uses a clean **BaseApi class pattern** in JavaScript.

## What Changed

### 1. **State Management: Context API → Redux Toolkit**
- **Before**: Used React Context API with `AppContext` for global state
- **After**: Uses Redux Toolkit with organized slices for `auth`, `user`, and `app`

### 2. **API Layer: Functional → BaseApi Class Pattern**
- **Before**: Functional exports like `baseGetAsync`, `basePostAsync`
- **After**: `BaseApi` class with static methods like `BaseGetRequestAsync`, `BasePostRequestAsync`, `BasePostRequestFileAsync`

### 3. **Authentication Token Management**
- **Before**: Stored in localStorage directly
- **After**: Synced with Redux store via `authSlice`

## File Structure

```
src/
├── store/
│   ├── store.js                 # Redux store configuration
│   └── slices/
│       ├── authSlice.js         # Auth state (token, isAuthenticated)
│       ├── userSlice.js         # User profile state
│       └── appSlice.js          # App state (page, toast, authReady)
├── utils/
│   ├── BaseApi.js               # Base API class with HTTP methods
│   ├── SessionHelper.js         # Session/token management
│   └── api.js                   # API endpoints using BaseApi
├── hooks/
│   └── useApp.js                # Custom hook replacing useApp from Context
└── main.jsx                     # Updated with Redux Provider
```

## How to Use

### Using the API

```javascript
import { api } from './utils/api.js'

// GET request
const user = await api.users.getProfile()

// POST request
const result = await api.auth.login({ email, password })

// File upload
const upload = await api.users.updateAvatar(file)

// With query parameters
const transactions = await api.transactions.list({ limit: 20, page: 1 })
```

### Using Redux State

```javascript
import { useApp } from './hooks/useApp.js'

export function MyComponent() {
  const { 
    user,              // Current user profile
    navigate,          // Navigate to page
    showToast,         // Show toast notification
    logout,            // Logout function
    setUser,           // Update user profile
    setUserToken,      // Set auth token
    isAuthenticated,   // Auth status
    page               // Current page
  } = useApp()

  return <div>...</div>
}
```

## Redux Store Structure

### Auth Slice
```javascript
{
  token: string | null,           // JWT token
  isAuthenticated: boolean,       // Auth status
  loading: boolean,               // Loading state
  error: string | null            // Error message
}
```

### User Slice
```javascript
{
  profile: {
    id: string,
    firstName: string,
    lastName: string,
    email: string,
    // ... other fields
  } | null,
  loading: boolean,
  error: string | null
}
```

### App Slice
```javascript
{
  currentPage: string,            // Current page (dashboard, transactions, etc.)
  toast: {
    message: string,
    type: string,                 // success, error, warning, info
    id: number
  } | null,
  authReady: boolean,             // Auth initialization status
  loading: boolean
}
```

## BaseApi Class Methods

### Available Methods

```javascript
import BaseApi from './utils/BaseApi.js'

// GET request
BaseApi.BaseGetRequestAsync(endpoint)

// POST request  
BaseApi.BasePostRequestAsync(endpoint, data)

// POST file upload
BaseApi.BasePostRequestFileAsync(endpoint, file)

// PATCH request
BaseApi.BasePatchRequestAsync(endpoint, data)

// DELETE request
BaseApi.BaseDeleteRequestAsync(endpoint)
```

### Example: Creating Custom API Methods

```javascript
import BaseApi from '../utils/BaseApi.js'

export const customApi = {
  getData: () => BaseApi.BaseGetRequestAsync('custom/data'),
  createItem: (data) => BaseApi.BasePostRequestAsync('custom/items', data),
  uploadDocument: (file) => BaseApi.BasePostRequestFileAsync('custom/upload', file),
}
```

## Session & Token Management

### SessionHelper Methods

```javascript
import SessionHelper from './utils/SessionHelper.js'

SessionHelper.GetCustomer()          // Get current token
SessionHelper.SetCustomer(token)     // Save token
SessionHelper.ClearSession()         // Clear all session data
SessionHelper.IsAuthenticated()      // Check if authenticated
```

## Migration Notes

### Before (Context API)
```javascript
import { useApp } from './context/AppContext.jsx'

const { user, setUser, page, navigate, showToast } = useApp()
```

### After (Redux)
```javascript
import { useApp } from './hooks/useApp.js'

const { user, setUser, page, navigate, showToast } = useApp()
// Same API, powered by Redux underneath!
```

## Setup Instructions

1. **Install Dependencies**
   ```bash
   npm install
   ```
   This will install Redux Toolkit and React-Redux which are now in package.json

2. **Environment Variables**
   Create a `.env.local` file:
   ```
   VITE_API_BASE_URL=http://localhost:8000/api/v1
   ```

3. **Start Development Server**
   ```bash
   npm run dev
   ```

## Key Improvements

✅ **Centralized State Management**: All app state in Redux
✅ **Predictable State Updates**: Reducers ensure predictable state changes
✅ **DevTools Integration**: Redux DevTools for debugging
✅ **Persistence**: Token stored in localStorage and synced with Redux
✅ **Clean API Pattern**: BaseApi class simplifies HTTP requests
✅ **Type-Safe Ready**: Can be easily upgraded to TypeScript
✅ **Scalable**: Easy to add more slices and API methods

## Troubleshooting

### Token Not Persisting
- Check `SessionHelper.SetCustomer()` is called when login is successful
- Verify `setUserToken()` is called after receiving token from API

### State Not Updating
- Use Redux DevTools to inspect state changes
- Ensure `dispatch()` is being called in hooks

### API Requests Failing
- Check `BaseApi.BaseUrl` is correctly set in `.env.local`
- Verify token is being sent in Authorization header
- Check server CORS settings

## Next Steps

- Consider adding Redux middleware for logging/analytics
- Implement Redux persist for better offline support
- Add more specific error handling in API methods
- Consider upgrading to TypeScript for better type safety
