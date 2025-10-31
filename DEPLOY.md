# Deployment Instructions

## Deploy to GitHub

### 1. Initialize Git Repository (if not already done)
```bash
git init
git add .
git commit -m "Initial commit: Motor simulator with PID and FF control"
```

### 2. Create a New Repository on GitHub
1. Go to https://github.com/new
2. Name your repository (e.g., "motor-simulator" or "ffcontroller")
3. Don't initialize with README (we already have one)
4. Click "Create repository"

### 3. Push to GitHub
Replace `YOUR_USERNAME` and `YOUR_REPO_NAME` with your GitHub username and repository name:

```bash
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
git branch -M main
git push -u origin main
```

### 4. Deploy to Vercel (Recommended for Next.js)

#### Option A: Deploy via Vercel Website
1. Go to https://vercel.com
2. Sign in with your GitHub account
3. Click "New Project"
4. Import your GitHub repository
5. Vercel will auto-detect Next.js settings
6. Click "Deploy"

#### Option B: Deploy via Vercel CLI
```bash
npm install -g vercel
vercel login
vercel
```

### 5. Alternative: GitHub Pages (requires static export)

Add to `next.config.ts`:
```typescript
const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
}
```

Then run:
```bash
npm run build
```

The static files will be in the `out` folder.

## Environment Variables

No environment variables are required for this project.

## Notes

- The `.gitignore` file is already configured to exclude `node_modules/`, `.next/`, and other build artifacts
- Make sure to commit your changes before pushing
- Vercel is the recommended deployment platform for Next.js applications
