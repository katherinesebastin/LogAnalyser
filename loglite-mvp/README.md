# Frontend
A React frontend for viewing and analyzing macOS system logs.    
It connects to a Python Flask backend to fetch log data and display it in a simple interface.  
## What This Project Does
Users can:  
- View different types of macOS logs
- Analyze logs in a table-based UI
- Access system log data through API calls

## Technologies Used
- Node.js
- React
- Vite
- TypeScript
- Gemini API

## Prerequisites
- Node.js installed
- npm installed
- Backend server running

## Project Structure
```bash
frontend/
├── components/                # Reusable UI components
│   ├── Layout.tsx
│   ├── LogTable.tsx
│   └── Modal.tsx
│
├── pages/                     # Application pages/screens
│   ├── Dashboard.tsx
│   ├── GenericLogPage.tsx
│   ├── Projectinfo.tsx
│   └── SecurityInsights.tsx
│
├── services/
│   ├── api.ts                 # Handles backend API requests
│   └── mockService.ts         # Mock/sample data service
│
├── node_modules/
├── .env.local                 # Stores local environment variables
├── .gitignore
├── App.tsx                    # Main application component
├── constants.ts
├── index.html
├── index.tsx                  # Application entry point
├── metadata.json
├── package-lock.json
├── package.json
├── README.md
├── tsconfig.json
├── types.ts                   # Shared TypeScript types
└── vite.config.ts             # Vite configuration
```

## How to Run the Frontend

### 1. Clone the Repository
```bash
git clone https://github.com/katherinesebastin/LogAnalyser.git
cd frontend
```

### 2. Install Dependencies
Run:
```bash
npm install
```

### 3. Configure Environment Variables
Create a file named:
```bash
.env.local
```
Add your Gemini API key:
```env
GEMINI_API_KEY=your_api_key_here
```
Replace `your_api_key_here` with your actual Gemini API key.

### 4. Start the Frontend Server
Run:
```bash
npm run dev
```
You should see output similar to: **`Local: http://localhost:3000/`**  
Open the link in your browser.

## Important
- The backend must be running at **`http://127.0.0.1:5000`**  
- If the backend is not running, the frontend will not be able to retrieve logs.  

## Common Issues

**Issue: "npm command not found"**  
- **Solution:** Install Node.js and restart the terminal. 

**Issue: "No logs appear"**  
- **Solution:**  
   Check:
   - Backend is running
   - Backend URL is correct
   - API endpoints are accessible

**Issue: "Invalid Gemini API key"**  
- **Solution:** Check `.env.local` file and verify the API key.
