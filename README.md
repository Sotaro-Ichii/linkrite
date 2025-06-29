# Linkrite

<div align="center">
  <img src="public/logo.png" alt="Linkrite Logo" width="200"/>
  
  **A Japanese Whop-inspired platform for job matching and educational content sales**
  
  [![Next.js](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
  [![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
  [![Firebase](https://img.shields.io/badge/Firebase-10-FFCA28?style=for-the-badge&logo=firebase)](https://firebase.google.com/)
</div>

## 📖 Overview

Linkrite is a job matching and educational content sales platform designed for YouTube editors and content creators. It provides job posting and application features, educational content sales and purchases, and user communication features to support creator monetization.

### 🎯 Target Audience
- YouTube editors
- Content creators
- Freelance designers
- Video production professionals

## ✨ Key Features

### 🔐 Authentication & User Management
- Google login/logout
- User profile display and editing
- Session management

### 📝 Content Management
- **Job Posting & Listing** (Earn Tab)
  - Detailed job information posting
  - Image upload support
  - Real-time updates
- **Educational Content Posting & Listing** (Learn Tab)
  - Educational content sales
  - Content detail display

### 💬 Social Features
- **Feed Functionality**
  - Posts, likes, and comments
  - Real-time updates
  - Image upload support
  - Modern UI/UX
- **Direct Messages (DM)**
  - One-on-one chat
  - DM list and detail views
  - Start DM from profile
  - Real-time updates
  - Chat bubble UI with auto-scroll

### 📋 Application & Management
- **Application System**
  - Job applications
  - Application status management
  - Approve/reject applicants
- **Application History Page**
  - Personal application history display
  - Filter and search functionality
  - Application cancellation
  - Navigation to detail pages

### 🧭 Navigation
- Responsive design
- DM button (Instagram-style)
- Application history link
- Logout functionality

## 🛠️ Tech Stack

### Frontend
- **Next.js 14** - React framework (App Router)
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Heroicons** - Icons

### Backend & Database
- **Firebase Authentication** - User authentication
- **Firestore** - NoSQL database
- **Firebase Storage** - File storage

### Payment & External Services
- **Stripe** - Payment processing (planned)

### Development Tools
- **ESLint** - Code quality
- **PostCSS** - CSS processing

## 🚀 Setup

### Prerequisites
- Node.js 18 or higher
- npm or yarn
- Firebase project

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/linkrite.git
cd linkrite
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Variables
Create a `.env.local` file and add Firebase configuration:
```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

### 4. Firebase Setup
1. Create a project in [Firebase Console](https://console.firebase.google.com/)
2. Enable Google login in Authentication
3. Create Firestore Database
4. Create Storage (for image uploads)

### 5. Start Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to view the application.

## 📁 Project Structure

```
linkrite/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (auth)/            # Authentication pages
│   │   │   ├── login/         # Login page
│   │   │   └── signup/        # Signup page
│   │   ├── applications/      # Application history page
│   │   ├── dm/                # DM functionality
│   │   │   ├── [roomId]/      # DM detail page
│   │   │   └── page.tsx       # DM list page
│   │   ├── earn/              # Job-related
│   │   │   └── [id]/          # Job detail page
│   │   ├── home/              # Home & Feed
│   │   │   ├── post.tsx       # Post page
│   │   │   └── page.tsx       # Main page
│   │   ├── profile/           # Profile
│   │   │   └── [uid]/         # User profile
│   │   └── settings/          # Settings page
│   ├── components/            # Reusable components
│   │   ├── AuthProvider.tsx   # Authentication provider
│   │   ├── EarnPostCard.tsx   # Job card
│   │   └── Navigation.tsx     # Navigation
│   └── lib/                   # Utilities
│       ├── firebase.ts        # Firebase configuration
│       ├── stripe.ts          # Stripe configuration
│       └── utils.ts           # Common functions
├── public/                    # Static files
└── package.json              # Dependencies
```

## 🔧 Development

### Available Scripts
```bash
npm run dev          # Start development server
npm run build        # Production build
npm run start        # Start production server
npm run lint         # Run ESLint
```

### Firestore Indexes
If you encounter query errors, create indexes in the Firebase Console as prompted.

## 🚀 Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Set environment variables
3. Deploy

### Other Platforms
- Netlify
- Firebase Hosting
- AWS Amplify

## 🤝 Contributing

1. Fork this repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Contact

- GitHub: [@your-username](https://github.com/your-username)
- Email: your-email@example.com

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - Amazing React framework
- [Firebase](https://firebase.google.com/) - Backend services
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS
- [Heroicons](https://heroicons.com/) - Beautiful icon set

---

<div align="center">
  ⭐ If you like this project, please give it a star!
</div>
