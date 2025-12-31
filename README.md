# DSA Tracker

![Project Status](https://img.shields.io/badge/status-active-success.svg)
![Next.js](https://img.shields.io/badge/Next.js-15-black)
![Firebase](https://img.shields.io/badge/firebase-11-orange)
![Tailwind](https://img.shields.io/badge/Tailwind-3-blue)

**Live Demo:** [https://dsa-tracker-delta.vercel.app/](https://dsa-tracker-delta.vercel.app/)

## 📖 About

DSA Tracker is a comprehensive dashboard designed to help developers track their Data Structures and Algorithms (DSA) progress. It serves as a central hub to monitor solved questions, maintain consistency through streaks, and keep track of upcoming coding contests.

Built with a mobile-first approach, it ensures that your progress is accessible anywhere, keeping you motivated on your journey to mastering DSA.

## ✨ Key Features

- **📊 Analytics Dashboard**: Visualize your progress with interactive charts breaking down solved questions by Difficulty, Platform, and Topic.
- **🔥 Streak Tracking**: Stay consistent with a daily streak monitor that tracks your activity and helps build a coding habit.
- **🏆 Contest Tracker**: Automatically tracks upcoming contests and maintains a history of the ones you've attempted.
- **📝 Question Bank**: A detailed log of all your solved problems, searchable and organized for easy review.
- **📱 Responsive UI**: A fully responsive interface ensuring a seamless experience on both desktop and mobile devices.
- **🧠 AI-Ready Infrastructure**: Integrated with Google's Genkit and Gemini 2.0 Flash, setting the foundation for future AI-powered insights and smart suggestions.

## 🛠️ Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/) (App Directory)
- **Language**: TypeScript
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) & [Shadcn UI](https://ui.shadcn.com/)
- **Backend/Database**: [Firebase](https://firebase.google.com/) (Firestore & Auth)
- **AI Integration**: [Genkit](https://firebase.google.com/docs/genkit) (Gemini 2.0 Flash)
- **Icons**: Lucide React
- **Charts**: Recharts

## 🚀 Getting Started

Follow these steps to run the project locally.

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- A Firebase project with Firestore and Auth enabled.

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/yourusername/dsa-tracker.git
    cd dsa-tracker
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Configure Environment Variables:**
    Create a `.env.local` file in the root directory and add your Firebase and App credentials:
    ```env
    NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
    NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
    NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
    
    # Optional: For AI features
    GOOGLE_GENAI_API_KEY=your_gemini_api_key
    ```

4.  **Run the development server:**
    ```bash
    npm run dev
    ```

5.  **Open the app:**
    Navigate to [http://localhost:3000](http://localhost:3000) in your browser.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is open source and available under the [MIT License](LICENSE).
