# Kaya AI - Career Navigator

An AI-powered resume analysis tool that provides personalized feedback and recommendations.

## Project Structure

```
├── backend/           # Python Streamlit backend
│   ├── main.py       # Main Streamlit application
│   └── requirements.txt
└── frontend/         # React frontend (Alternative UI)
    ├── src/          # React source code
    ├── public/       # Static assets
    └── ...           # React configuration files
```

## Backend (Python/Streamlit)

### Installation
```bash
cd backend
pip install -r requirements.txt
```

### Running the Backend
```bash
cd backend
streamlit run main.py
```

The Streamlit app will be available at `http://localhost:8501`

### Features
- Multi-AI resume analysis using Gemini, OpenRouter, and Mistral APIs
- PDF and DOCX resume parsing
- Company and role-specific optimization
- Detailed scoring and recommendations
- Test resume builder

## Frontend (React)

### Installation
```bash
cd frontend
npm install
```

### Running the Frontend
```bash
cd frontend
npm run dev
```

The React app will be available at `http://localhost:5173`

### Features
- Modern React-based UI
- Responsive design with Tailwind CSS
- TypeScript support
- Component-based architecture

## API Keys

The application uses the following AI services:
- Google Gemini API
- OpenRouter API  
- Mistral API

API keys are currently hardcoded for demo purposes. In production, these should be stored as environment variables.

## Usage

1. Select your target company and job role
2. Upload your resume (PDF or DOCX) or create a test resume
3. Wait for AI analysis to complete
4. Review your score, gaps, and personalized recommendations
5. Download the detailed analysis report

## License

This project is for educational and demonstration purposes.