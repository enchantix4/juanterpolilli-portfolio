# Deployment Guide - Juan Terpolilli Portfolio

## Step 1: Create GitHub Repository

1. Go to https://github.com/new
2. Repository name: `Juan-Terpolilli-Portfolio` (or `juan-terpolilli-portfolio`)
3. Description: "Portfolio website for Juan Terpolilli"
4. Choose **Public** or **Private**
5. **DO NOT** initialize with README, .gitignore, or license (we already have these)
6. Click "Create repository"

## Step 2: Push to GitHub

After creating the repository, GitHub will show you commands. Run these in your terminal:

```bash
cd "/Users/pablote/Desktop/DESKTOP 6/Alba Rari/CODEZ/Juan Terpolilli Portfolio"
export PATH="$HOME/.nvm/versions/node/v25.1.0/bin:$PATH"

# Add the remote (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/Juan-Terpolilli-Portfolio.git

# Rename branch to main if needed
git branch -M main

# Push to GitHub
git push -u origin main
```

## Step 3: Deploy to Vercel

### Option A: Via Vercel Dashboard (Recommended)

1. Go to https://vercel.com
2. Sign in with your GitHub account
3. Click "Add New Project"
4. Import your `Juan-Terpolilli-Portfolio` repository
5. Vercel will auto-detect Next.js settings:
   - Framework Preset: **Next.js**
   - Build Command: `npm run build` (auto-detected)
   - Output Directory: `.next` (auto-detected)
   - Install Command: `npm install` (auto-detected)
6. Click "Deploy"
7. Wait for deployment to complete (usually 2-3 minutes)

### Option B: Via Vercel CLI

```bash
# Install Vercel CLI globally
npm i -g vercel

# Navigate to project
cd "/Users/pablote/Desktop/DESKTOP 6/Alba Rari/CODEZ/Juan Terpolilli Portfolio"
export PATH="$HOME/.nvm/versions/node/v25.1.0/bin:$PATH"

# Deploy
vercel

# Follow the prompts:
# - Set up and deploy? Yes
# - Which scope? (select your account)
# - Link to existing project? No
# - Project name: juan-terpolilli-portfolio
# - Directory: ./
# - Override settings? No
```

## Step 4: Configure Environment Variables (if needed)

If you have any environment variables, add them in:
- Vercel Dashboard → Your Project → Settings → Environment Variables

## Step 5: Custom Domain (Optional)

1. Go to Vercel Dashboard → Your Project → Settings → Domains
2. Add your custom domain
3. Follow DNS configuration instructions

## Automatic Deployments

Once connected, Vercel will automatically:
- Deploy on every push to `main` branch
- Create preview deployments for pull requests
- Run builds automatically

## Troubleshooting

### Build Errors
- Check Vercel build logs in the dashboard
- Ensure all dependencies are in `package.json`
- Check that Node.js version is compatible (Vercel uses Node 18.x by default)

### Image Optimization
- Next.js Image component is already configured
- Images in `public/images/` are automatically served

### API Routes
- All API routes in `app/api/` are automatically deployed
- Note: File system operations (open-file, open-folder) only work in development

## Current Configuration

- **Framework**: Next.js 14.0.4
- **Node Version**: 18.x (Vercel default)
- **Build Command**: `npm run build`
- **Output Directory**: `.next`

