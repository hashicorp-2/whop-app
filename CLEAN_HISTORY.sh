#!/bin/bash
# Script to clean secrets from git history

cd /Users/ogowemr/whop-app

echo "🔍 Checking for secrets in git history..."

# Check if .env files exist in commits
if git log --all --full-history --source -- .env.development .env.local.bak | grep -q .; then
    echo "⚠️  Secrets found in git history. Cleaning..."
    
    # Option 1: Reset to before secrets were added (if possible)
    # Find the commit before secrets were added
    SECRET_COMMIT=$(git log --all --oneline --source -- .env.development .env.local.bak | tail -1 | cut -d' ' -f1)
    
    if [ ! -z "$SECRET_COMMIT" ]; then
        echo "Found secrets starting at commit: $SECRET_COMMIT"
        echo "Resetting to remove secrets from history..."
        
        # Get the commit before secrets were added
        CLEAN_COMMIT=$(git rev-parse ${SECRET_COMMIT}^)
        
        # Reset to clean commit (soft reset to keep changes)
        git reset --soft $CLEAN_COMMIT
        
        # Remove .env files from staging
        git reset HEAD .env.development .env.local.bak 2>/dev/null || true
        
        # Make sure .gitignore is correct
        if ! grep -q "\.env\*" .gitignore; then
            echo ".env*" >> .gitignore
            echo "!.env.example" >> .gitignore
        fi
        
        # Stage all files except .env files
        git add .gitignore
        git add -A
        
        # Create new clean commit
        git commit -m "Ready for production - Launchpad (secrets removed)"
        
        echo "✅ History cleaned. Ready to push."
    else
        echo "❌ Could not find clean commit. Use manual method."
    fi
else
    echo "✅ No secrets found in current commits."
fi

