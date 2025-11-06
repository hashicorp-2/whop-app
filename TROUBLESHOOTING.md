# 🔧 Troubleshooting: Product & Marketing Sections Not Working

## Quick Check

1. **Open Browser Console** (F12 or Cmd+Option+I)
2. **Look for these logs:**
   - `[Dashboard] ===== RAW API RESPONSE =====` - Should show the full API response
   - `[ProductBlueprintDisplay] Received data:` - Should show the data received by component
   - Any errors with `PROTOCOL_VIOLATION` or `Invalid data structure`

## Common Issues

### Issue 1: API Not Returning Data
**Symptoms:** Console shows empty response or error

**Check:**
```bash
# Test API directly
curl -X POST http://localhost:3000/api/generate-blueprint \
  -H "Content-Type: application/json" \
  -d '{"trend_summary":"AI writing assistants","user_goal":"Sell Knowledge","product_type":"ebook"}'
```

**Fix:**
- Ensure `OPENAI_API_KEY` is set in `.env.local`
- Check server logs for OpenAI API errors

### Issue 2: Data Structure Mismatch
**Symptoms:** Console shows `PROTOCOL_VIOLATION` error

**Check:**
- Look for `[Dashboard] ERROR: Missing required fields` in console
- Check if `product_blueprint` and `marketing_playbook` exist in response

**Fix:**
- The API endpoint `/api/generate-blueprint` should return the exact structure
- Verify the response format matches the JSON schema

### Issue 3: Component Not Rendering
**Symptoms:** No content appears, but no errors in console

**Check:**
- Look for `[ProductBlueprintDisplay] Received data:` in console
- Verify `structuredBlueprint` state is set in dashboard

**Fix:**
- Check React DevTools - is `structuredBlueprint` in state?
- Verify the component is being rendered (check DOM)

### Issue 4: Empty Arrays
**Symptoms:** Sections show "No [feature] available"

**Fix:**
- This is expected if the API returns empty arrays
- The component now handles this gracefully with fallback messages

## Debug Steps

1. **Check API Response:**
   ```javascript
   // In browser console, after selecting a trend:
   // The dashboard should log the full API response
   ```

2. **Check Component Props:**
   ```javascript
   // In React DevTools, check ProductBlueprintDisplay component:
   // - Does it have a `data` prop?
   // - Does `data.product_blueprint` exist?
   // - Does `data.marketing_playbook` exist?
   ```

3. **Check Network Tab:**
   - Open Network tab in DevTools
   - Filter for `/api/generate-blueprint`
   - Check the response payload
   - Verify status code is 200

## Expected Behavior

When working correctly:

1. **Select a trend** → Product type auto-selects
2. **Auto-generation starts** → Loading skeleton appears
3. **API responds** → `structuredBlueprint` state is set
4. **Component renders** → Product and Marketing tabs show content
5. **Download works** → Markdown/JSON export functions

## Still Not Working?

1. **Clear browser cache** and refresh
2. **Check server logs** for errors
3. **Verify environment variables** are loaded
4. **Test API endpoint directly** with curl (see above)
5. **Check browser console** for React errors

