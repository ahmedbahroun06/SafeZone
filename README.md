# SafeZone

**A civic tech platform where Tunisian citizens report, geolocate and track urban problems in real time.**

[**Live app**](https://safezone-app.netlify.app) · Academic project, FST (Université Tunis El Manar) · Jan–Apr 2026

![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-4-646CFF?logo=vite&logoColor=white)
![Firebase](https://img.shields.io/badge/Firebase-Firestore-FFCA28?logo=firebase&logoColor=black)
![Netlify](https://img.shields.io/badge/Deployed%20on-Netlify-00C7B7?logo=netlify&logoColor=white)

## What it does

Citizens often have no simple way to flag a broken streetlight, a pothole or illegal dumping and see what happens next. SafeZone lets anyone report an issue on a map, follow its status, and lets moderators and administrators handle it.

## Features

- **Geolocated reports:** pin an issue on an interactive map, with a photo
- **National heatmap:** see where problems cluster across Tunisia
- **Role-based access:** guest, citizen, moderator and administrator, each with their own permissions
- **Moderation workflow:** moderators and administrators review and update reports
- **Multilingual:** French, English and Arabic (react-i18next)
- **Photo uploads** through Cloudinary
- **Deployed to production** on Netlify

## Tech stack

| Layer | Tools |
|---|---|
| Frontend | React 18, Vite, React Router, Framer Motion, Lucide icons |
| Maps | Leaflet, React-Leaflet, leaflet.heat |
| Backend and data | Firebase (Firestore) |
| Media | Cloudinary |
| i18n | i18next, react-i18next |
| Deployment | Netlify |

## Getting started

Requirements: Node.js 18 or newer.

```bash
git clone https://github.com/ahmedbahroun06/SafeZone.git
cd SafeZone
npm install
npm run dev
```

The app opens on the local address printed by Vite. To run it against your own backend, create a Firebase project (with Firestore) and a Cloudinary account, then put your credentials in the Firebase and Cloudinary configuration in `src`.

Other scripts:

```bash
npm run build     # production build
npm run preview   # preview the production build locally
npm run lint      # ESLint
```

## Team and process

Built by a team of 5 over 3 Agile sprints (January to April 2026). I worked as **Scrum Master** and **full-stack developer**: running sprint planning and reviews, and building features across the React front end and Firebase back end.

## Author

**Ahmed Bahroun** · [LinkedIn](https://www.linkedin.com/in/ahmedbahroun) · [GitHub](https://github.com/ahmedbahroun06)
