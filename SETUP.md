# Setup Instructions

## Prerequisites

1. Node.js 18+ installed
2. npm or yarn package manager

## Installation

1. Install dependencies:
```bash
npm install
```

2. Add your assets to `public/images/`:
   - `hero.jpg` - Your black and white portrait
   - `logo.png` - Your AR monogram logo  
   - `itch-cover.jpg` - ITCH album cover

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Features Implemented

✅ Hover-to-reveal navigation on hero image
✅ Black text labels with connecting lines to body parts
✅ Logo positioned at top center
✅ Modal system for all sections (Bio, Sign Up, Resume, Music, Store)
✅ Bio text integrated
✅ Resume content (all 9 roles) integrated
✅ Music section with ITCH album
✅ Email signup form with full country list
✅ Self-hosted email capture (stores in `data/emails.json`)
✅ Social media links in footer
✅ Store section ready for future merchandise
✅ Mobile-responsive design
✅ Kim Petras-inspired styling

## Deployment

This project is ready to deploy on Vercel:

1. Push your code to GitHub
2. Import the project in Vercel
3. Deploy!

The email capture will work in production - emails will be stored in the `data/emails.json` file.

## Customization

- Edit `data/resume.json` to update resume content
- Edit component files in `app/components/` to customize sections
- Update `app/globals.css` for styling changes
- Modify `tailwind.config.js` for theme customization


