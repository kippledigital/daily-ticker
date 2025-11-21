# Homepage Loading Issue Analysis

**Issue:** "Loading today's picks..." and "Loading performance data..." stuck on homepage  
**Date:** November 2025  
**Status:** 🔍 Investigating

---

## Problem

The homepage shows:
- "Loading today's picks..." (stuck)
- "Loading performance data..." (stuck)

Both components are stuck in loading state.

---

## Root Cause Analysis

### API Endpoints Are Working ✅

**Tested:**
- ✅ `/api/archive/2025-11-21` - Returns data successfully
- ✅ `/api/performance` - Returns data successfully

**Conclusion:** APIs are working, issue is likely client-side.

---

## Possible Causes

### 1. **Client-Side Fetch Error** (Most Likely)

**Components:**
- `HybridTicker` - Fetches `/api/archive/${dateStr}`
- `PerformanceDashboard` - Fetches `/api/performance`

**Possible Issues:**
- Network error (CORS, timeout)
- Response parsing error
- JavaScript error preventing state update
- Browser console errors

### 2. **State Not Updating**

**Code Check:**
- `HybridTicker` sets `setLoading(false)` in finally block ✅
- `PerformanceDashboard` sets `setLoading(false)` in finally block ✅

**But:** If there's an error before fetch completes, loading might not update.

### 3. **Response Format Mismatch**

**Check:**
- API returns `{ success: true, data: {...} }`
- Components check `data.success` ✅
- But might be checking wrong structure

---

## Debugging Steps

### 1. Check Browser Console

**Open browser DevTools:**
- Console tab
- Look for errors
- Check network tab for failed requests

### 2. Check Component State

**Add console logs:**
```typescript
console.log('Fetching archive:', dateStr)
console.log('Response:', data)
console.log('Setting loading to false')
```

### 3. Check Network Requests

**In DevTools Network tab:**
- Check if requests are being made
- Check response status codes
- Check response bodies

---

## Quick Fixes to Try

### Fix 1: Add Error Handling

**In `HybridTicker`:**
```typescript
if (!response.ok) {
  console.error('Failed to fetch:', response.status)
  setLoading(false)
  return
}
```

**In `PerformanceDashboard`:**
```typescript
if (!response.ok) {
  console.error('Failed to fetch:', response.status)
  setLoading(false)
  return
}
```

### Fix 2: Add Timeout

**Prevent infinite loading:**
```typescript
setTimeout(() => {
  if (loading) {
    console.warn('Loading timeout - forcing stop')
    setLoading(false)
  }
}, 10000) // 10 second timeout
```

### Fix 3: Check Response Structure

**Verify API response matches expected format:**
```typescript
console.log('API Response:', data)
if (data.success && data.data?.stocks) {
  // Handle success
} else {
  console.warn('Unexpected response format:', data)
  setLoading(false)
}
```

---

## Expected Behavior

### Normal Flow:

1. **Component mounts** → `loading = true`
2. **Fetch starts** → API request sent
3. **Response received** → Parse JSON
4. **Check success** → `if (data.success)`
5. **Update state** → `setData(...)`, `setLoading(false)`
6. **Render content** → Show picks/performance

### If Stuck:

- Loading state never changes to `false`
- Component stays in loading UI
- No data displayed

---

## Next Steps

1. **Check Browser Console** - Look for errors
2. **Check Network Tab** - Verify requests are completing
3. **Add Debug Logging** - See where it's failing
4. **Test API Directly** - Verify responses are correct
5. **Fix Error Handling** - Ensure loading state always updates

---

**Status:** 🔍 Need to check browser console for errors

