# 🚀 AI Resume Analyzer

![AI Resume Analyzer Banner](https://img.shields.io/badge/ATS-Powered--By--AI-blueviolet?style=for-the-badge&logo=probot)
![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react)
![Material UI](https://img.shields.io/badge/MUI-5.0-007FFF?style=for-the-badge&logo=mui)
![Firebase](https://img.shields.io/badge/Firebase-Auth--Firestore-FFCA28?style=for-the-badge&logo=firebase)

> **Land your dream job with precision.** A state-of-the-art AI tool that bridges the gap between your resume and job requirements through intelligent analysis, ATS scoring, and actionable insights.

---

## ✨ Features that Make You Stand Out

| Feature | Description |
| :--- | :--- |
| **🎯 ATS Scoring** | Instant scoring across 5 key metrics: Keyword Match, Semantic Alignment, Formatting, Impact, and Overall Compatibility. |
| **🔍 Keyword Insights** | Deep-dive into matched and missing keywords. Bridge the skill gap with precision. |
| **🤖 AI Recommendations** | Smart suggestions for bullet point rewrites and tactical improvements to bypass recruiter gatekeepers. |
| **📊 Analytics Dashboard** | Track your resume's performance over time with beautiful, interactive progression charts. |
| **🌓 Glassmorphic UI** | A premium, modern interface with a toggleable Dark/Light mode and fluid Framer Motion animations. |
| **🔒 Local-First Security** | Your data is yours. Secure local storage with optional Firebase cloud synchronization. |

---

## 🛠️ The Tech Stack

- **Frontend:** [React 18](https://reactjs.org/) + [React Router 6](https://reactrouter.com/)
- **Styling:** [Material UI (MUI)](https://mui.com/) + Custom CSS for Glassmorphism
- **Animations:** [Framer Motion](https://www.framer.com/motion/)
- **Backend/Auth:** [Firebase](https://firebase.google.com/) (Authentication & Firestore)
- **Charts:** [Recharts](https://recharts.org/) for data visualization
- **Parsing:** `pdfjs-dist` & `mammoth` for high-accuracy document extraction

---

## 🚀 Getting Started

### 1. Prerequisites
Ensure you have [Node.js](https://nodejs.org/) installed on your system.

### 2. Installation
```bash
# Clone the repository
git clone <your-repo-url>

# Enter the project directory
cd ai-resume-analyzer

# Install dependencies
npm install
```

### 3. Environment Configuration
Create a `.env` file in the root directory and add your Firebase credentials:
```env
REACT_APP_FIREBASE_API_KEY=your_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your_domain
REACT_APP_FIREBASE_PROJECT_ID=your_id
...
```

### 4. Lift Off
```bash
npm start
```
Navigate to `http://localhost:3000` and start analyzing!

---

## 📁 Project Structure

```text
src/
├── components/
│   ├── analytics/      # Performance trends & charts
│   ├── analysis/       # Detailed result visualization
│   ├── dashboard/      # User command center
│   ├── settings/       # Profile & account management
│   └── common/         # Layout, Navbar, & Sidebar
├── contexts/           # Auth & Theme state management
├── services/           # Analysis, Resume, & User logic
└── utils/              # Export & Helper functions
```

---

## 💡 Pro Tips for Analysis
1. **Clean Formatting**: Use standard fonts and professional layouts for the best extraction results.
2. **Target High Scores**: Aim for searching keyword matches above 80% to ensure your resume passes ATS filters.
3. **Use the Rewriter**: Incorporate the AI-generated impact statements to make your experience more measurable.

---

## 🤝 Contributing
Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## ⚖️ License
Distributed under the MIT License. See `LICENSE` for more information.

---

<p align="center">
  Made with ❤️ for Job Seekers everywhere.
</p>
