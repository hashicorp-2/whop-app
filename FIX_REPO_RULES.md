# 🔧 Fix Repository Rule Violations

## Error: "push declined due to repository rule violations"

This happens when GitHub repository has branch protection rules or restrictions.

## Common Causes & Solutions

### Solution 1: Push to a Different Branch First

Try pushing to a non-main branch, then create a Pull Request:

```bash
cd /Users/ogowemr/whop-app

# Create a new branch
git checkout -b initial-push

# Push to the new branch
git push -u origin initial-push
```

Then go to GitHub and:
1. Create a Pull Request from `initial-push` to `main`
2. Merge the PR (this bypasses branch protection)
3. After that, you can push directly to main

### Solution 2: Check Repository Settings

The repository might have branch protection rules. Check:

1. Go to: https://github.com/hashicorp-2/whop-app/settings/rules
2. Check if there are branch protection rules on `main`
3. If you're the owner, you can:
   - Temporarily disable branch protection
   - Or push to a different branch

### Solution 3: Make Sure You Have Write Access

Check if you have write access:
- Go to: https://github.com/hashicorp-2/whop-app/settings/access
- Make sure your account has write/admin access

### Solution 4: Check for Large Files

Sometimes files are too large:

```bash
# Check for files over 50MB
find . -type f -size +50M -not -path "./.git/*"

# Make sure .gitignore excludes:
# - node_modules/
# - .next/
# - .env files
```

### Solution 5: Use GitHub Web Interface

If all else fails:

1. Go to: https://github.com/hashicorp-2/whop-app
2. Click "uploading an existing file"
3. Drag and drop your files (excluding node_modules, .next, .env)
4. Commit directly to main through the web interface

---

## Quick Fix: Try Different Branch

```bash
cd /Users/ogowemr/whop-app

# Create and push to new branch
git checkout -b setup
git push -u origin setup

# If that works, go to GitHub and:
# 1. Open a Pull Request
# 2. Merge it to main
```

---

## Check What Rules Exist

Run this to see if there are specific issues:

```bash
cd /Users/ogowemr/whop-app

# Check remote info
git remote show origin

# Try to see what branches exist
git ls-remote --heads origin
```

