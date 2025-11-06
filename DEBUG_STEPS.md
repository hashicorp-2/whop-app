# 🔍 Debug Steps - What to Check

## Step 1: Check if Trends Load
1. Open http://localhost:3000/dashboard
2. Open browser console (F12)
3. Look for: `[TrendRadar]` logs
4. You should see trends loading

## Step 2: Check if Trend Click Works
1. Click ANY trend card
2. Console should show:
   - `[TrendRadar] Trend clicked: [trend name]`
   - `[TrendRadar] Calling onSelectTrend callback...`
   - `[Dashboard] ⚡ TREND CLICKED: [trend name]`
   - `[Dashboard] Auto-selecting product type: App`
   - `[Dashboard] ⚡ AUTO-GENERATING IMMEDIATELY...`

## Step 3: Check if Generation Starts
1. After clicking trend, console should show:
   - `[Dashboard] ===== STARTING GENERATION =====`
   - `[Dashboard] Using TEST endpoint for verification`
   - `[Dashboard] Response status: 200 OK`
   - `[Dashboard] ===== RAW API RESPONSE =====`

## Step 4: Check if Data Displays
1. After generation, you should see:
   - A card with "✅ Launch Blueprint Generated"
   - Product section with title, concept, features
   - Marketing section with tagline, hooks

## Common Issues

### Issue: Trends don't load
- Check `/api/trends` endpoint
- Check console for network errors
- Verify server is running

### Issue: Clicking trend does nothing
- Check if `onSelectTrend` callback exists
- Check console for `[TrendRadar]` logs
- Verify trend cards are clickable (cursor pointer)

### Issue: Generation doesn't start
- Check if `userGoal` is set
- Check if `selectedProductType` is set
- Check console for missing conditions

### Issue: No data displays
- Check if `structuredBlueprint` state is set
- Check console for API response
- Verify component is receiving data prop

## Quick Test

1. Go to: http://localhost:3000/api/test-blueprint
2. Should see JSON with `product_blueprint` and `marketing_playbook`
3. If this works, the API is fine
4. If frontend doesn't show it, the issue is in the component

