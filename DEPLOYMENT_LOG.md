# Deployment Log

## 2026-04-06 - CORS Fix Deployment

### Issue
Production CORS error blocking API calls from `https://www.elemental.bond` to backend at `https://deepseek-oracle-backend-production.up.railway.app`

### Root Cause
Email and license API routes needed explicit CORS configuration with `@cross_origin()` decorator and `OPTIONS` method support.

### Changes Applied
1. **backend/app/api/email.py**
   - Added `@cross_origin()` decorator to all routes
   - Added `OPTIONS` method to route decorators
   - Routes fixed: `/api/capture-email`, `/api/mark-conversion`, `/api/export-emails`, `/api/email-stats`

2. **backend/app/api/license.py**
   - Added `@cross_origin()` decorator to all routes
   - Added `OPTIONS` method to route decorators
   - Routes fixed: `/api/verify-license`, `/api/generate-full-report`

3. **backend/app/__init__.py**
   - Verified global CORS configuration is correct
   - Confirmed preflight OPTIONS handler is in place

### Verification Steps
After deployment completes:
1. Open browser DevTools Network tab
2. Visit https://www.elemental.bond
3. Fill out the form and submit
4. Verify Email Gate modal appears after 5 seconds
5. Enter email and click unlock
6. Check Network tab - `/api/capture-email` should return 200 OK
7. Verify no CORS errors in console

### Expected Result
- Email Gate modal works correctly
- API calls succeed without CORS errors
- Upsell modal appears 3 seconds after email unlock
- Full conversion funnel operational

### Deployment Trigger
This file update triggers automatic redeployment on Railway and Vercel.
