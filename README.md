# Juan Terpolilli Portfolio

A modern artist website built with Next.js, inspired by the Kim Petras website design.

## Features

- **Hover-to-Reveal Navigation**: Hover over the hero image to reveal section labels with connecting lines
- **Modal System**: Click sections to open full-screen modals
- **Sections**: Bio, Sign Up, Resume, Music, Store
- **Email Capture**: Self-hosted email list collection
- **Responsive Design**: Mobile-friendly interface

## Setup

1. Install dependencies:
```bash
npm install
```

2. Add your assets to the `public` folder:
   - `public/images/hero.jpg` - Main hero image (black and white portrait)
   - `public/images/logo.png` - AR monogram logo
   - `public/images/itch-cover.jpg` - ITCH album cover

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
/
├── app/
│   ├── components/        # React components
│   ├── api/              # API routes
│   ├── page.tsx          # Main page
│   └── layout.tsx        # Root layout
├── data/
│   ├── resume.json       # Resume data
│   └── emails.json       # Stored emails
└── public/
    └── images/           # Image assets
```

## Assets Needed

Place these files in `public/images/`:
- `hero.jpg` - Your black and white portrait
- `logo.png` - Your AR monogram logo
- `itch-cover.jpg` - ITCH album cover image

## Deployment

This project is ready to deploy on Vercel:

1. Push your code to GitHub
2. Import the project in Vercel
3. Deploy!

## Technologies

- Next.js 14
- TypeScript
- Tailwind CSS
- Framer Motion
- React Hook Form


