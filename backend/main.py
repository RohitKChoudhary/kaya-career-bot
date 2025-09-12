import streamlit as st
import requests
import PyPDF2
import docx
import io
import json
import time
import re
from typing import Dict, List, Tuple, Optional
import base64

# Page Configuration
st.set_page_config(
    page_title="Kaya AI - Career Navigator",
    page_icon="🎯",
    layout="wide",
    initial_sidebar_state="collapsed"
)

# Custom CSS for styling
st.markdown("""
<style>
    .main {
        padding: 0rem 1rem;
        background-color: #ffffff;
    }
   
    .hero-section {
        background: linear-gradient(135deg, #6B46C1 0%, #8E5EF2 100%);
        padding: 4rem 2rem;
        border-radius: 20px;
        text-align: center;
        color: #ffffff;
        margin-bottom: 2rem;
    }
   
    .hero-title {
        font-size: 3rem;
        font-weight: 700;
        margin-bottom: 1rem;
    }
   
    .hero-subtitle {
        font-size: 1.2rem;
        opacity: 0.9;
        margin-bottom: 2rem;
    }
   
    .feature-card {
        background: #ffffff;
        padding: 2rem;
        border-radius: 15px;
        box-shadow: 0 4px 20px rgba(0,0,0,0.1);
        margin-bottom: 1.5rem;
        border-left: 4px solid #6B46C1;
        color: #333333;
    }
   
    .feature-icon {
        width: 40px;
        height: 40px;
        background: #6B46C1;
        border-radius: 10px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #ffffff;
        font-size: 1.2rem;
        margin-bottom: 1rem;
    }
   
    .score-display {
        background: linear-gradient(135deg, #6B46C1 0%, #8E5EF2 100%);
        padding: 2rem;
        border-radius: 15px;
        text-align: center;
        color: #ffffff;
        margin: 2rem 0;
    }
   
    .score-number {
        font-size: 3rem;
        font-weight: 700;
    }
   
    .progress-bar {
        background: #e0e0e0;
        border-radius: 10px;
        overflow: hidden;
        height: 10px;
        margin: 1rem 0;
    }
   
    .progress-fill {
        background: linear-gradient(90deg, #6B46C1, #8E5EF2);
        height: 100%;
        transition: width 0.5s ease;
    }
   
    .recommendation-card {
        background: #f8f9ff;
        padding: 1.5rem;
        border-radius: 10px;
        border-left: 4px solid #6B46C1;
        margin-bottom: 1rem;
        color: #333333;
    }
   
    .gap-item {
        background: #fff3cd;
        padding: 1rem;
        border-radius: 8px;
        border-left: 4px solid #ffc107;
        margin-bottom: 0.5rem;
        color: #333333;
    }
   
    .ideal-resume {
        background: #e8f5e8;
        padding: 2rem;
        border-radius: 10px;
        border-left: 4px solid #28a745;
        color: #333333;
    }
   
    .stButton > button {
        background: linear-gradient(135deg, #6B46C1 0%, #8E5EF2 100%);
        color: #ffffff;
        border: none;
        padding: 0.75rem 3rem;
        border-radius: 25px;
        font-weight: 600;
        width: 100%;
        font-size: 1.1rem;
    }
   
    .stButton > button:hover {
        background: linear-gradient(135deg, #8E5EF2 0%, #6B46C1 100%);
        transform: translateY(-2px);
        box-shadow: 0 5px 15px rgba(107, 70, 193, 0.3);
    }
</style>
""", unsafe_allow_html=True)

# Initialize session state
def init_session_state():
    if 'page' not in st.session_state:
        st.session_state.page = 'home'
    if 'analysis_data' not in st.session_state:
        st.session_state.analysis_data = {}
    if 'api_keys' not in st.session_state:
        st.session_state.api_keys = {
            'gemini': 'AIzaSyAl-612nrGn7RQfIbncgoXvvmT4g6QlYBk',
            'openrouter': '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',
            'mistral': 'bX9Vwh3k3WIUJFoVXpNq1J1N8g86Ludk'
        }
    if 'user_feedback' not in st.session_state:
        st.session_state.user_feedback = {}

# API Configuration
class AIModelManager:
    def __init__(self, api_keys):
        self.api_keys = api_keys
       
    def call_gemini(self, prompt):
        try:
            url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key={self.api_keys['gemini']}"
            headers = {'Content-Type': 'application/json'}
            data = {
                "contents": [{"parts": [{"text": prompt}]}],
                "generationConfig": {
                    "temperature": 0.7,
                    "topK": 1,
                    "topP": 1,
                    "maxOutputTokens": 2048,
                }
            }
           
            response = requests.post(url, headers=headers, json=data, timeout=30)
            if response.status_code == 200:
                result = response.json()
                return result['candidates'][0]['content']['parts'][0]['text']
            else:
                return None
        except Exception as e:
            st.warning(f"Gemini API temporarily unavailable: {str(e)}")
            return None
   
    def call_openrouter(self, prompt, model="openai/gpt-3.5-turbo"):
        try:
            url = "https://openrouter.ai/api/v1/chat/completions"
            headers = {
                "Authorization": f"Bearer {self.api_keys['openrouter']}",
                "Content-Type": "application/json"
            }
            data = {
                "model": model,
                "messages": [{"role": "user", "content": prompt}],
                "max_tokens": 2000,
                "temperature": 0.7
            }
           
            response = requests.post(url, headers=headers, json=data, timeout=30)
            if response.status_code == 200:
                result = response.json()
                return result['choices'][0]['message']['content']
            else:
                return None
        except Exception as e:
            st.warning(f"OpenRouter API temporarily unavailable: {str(e)}")
            return None
   
    def call_mistral(self, prompt):
        try:
            url = "https://api.mistral.ai/v1/chat/completions"
            headers = {
                "Authorization": f"Bearer {self.api_keys['mistral']}",
                "Content-Type": "application/json"
            }
            data = {
                "model": "mistral-tiny",
                "messages": [{"role": "user", "content": prompt}],
                "max_tokens": 2000,
                "temperature": 0.7
            }
           
            response = requests.post(url, headers=headers, json=data, timeout=30)
            if response.status_code == 200:
                result = response.json()
                return result['choices'][0]['message']['content']
            else:
                return None
        except Exception as e:
            st.warning(f"Mistral API temporarily unavailable: {str(e)}")
            return None

# Resume Processing Functions
def extract_text_from_pdf(file):
    try:
        pdf_reader = PyPDF2.PdfReader(file)
        text = ""
        for page in pdf_reader.pages:
            text += page.extract_text()
        return text
    except Exception as e:
        st.error(f"Error reading PDF: {str(e)}")
        return ""

def extract_text_from_docx(file):
    try:
        doc = docx.Document(file)
        text = ""
        for paragraph in doc.paragraphs:
            text += paragraph.text + "\n"
        return text
    except Exception as e:
        st.error(f"Error reading DOCX: {str(e)}")
        return ""

# AI Analysis Logic
class ResumeAnalyzer:
    def __init__(self, ai_manager):
        self.ai_manager = ai_manager
       
    def generate_ideal_resume(self, company, job_role):
        prompt = f"""
        Generate a highly optimized, professional resume for the position of {job_role} at {company}.
       
        This should be a comprehensive, detailed resume that includes:
        1. Professional Summary (3-4 lines)
        2. Key Skills and Technologies (8-10 skills)
        3. Work Experience with quantified achievements (2-3 positions)
        4. Education and Certifications
        5. Projects and Technical Expertise (2-3 projects)
        6. Industry-specific keywords
       
        Make it specific to {company}'s requirements and {job_role} expectations.
        Format it as a complete, professional resume with proper sections and bullet points.
        """
       
        # Try multiple APIs with fallback
        result = self.ai_manager.call_gemini(prompt)
        if not result:
            result = self.ai_manager.call_openrouter(prompt)
        if not result:
            result = self.ai_manager.call_mistral(prompt)
       
        if not result:
            # Fallback ideal resume template
            result = self.generate_fallback_resume(company, job_role)
       
        return result
   
    def generate_fallback_resume(self, company, job_role):
        return f"""
**{job_role.upper()} RESUME - OPTIMIZED FOR {company.upper()}**

**PROFESSIONAL SUMMARY**
Experienced {job_role} with 5+ years of expertise in cutting-edge technologies. Proven track record of delivering high-impact solutions that drive business growth and technical innovation. Strong background in software development, system architecture, and cross-functional collaboration.

**KEY SKILLS**
• Advanced programming languages (Python, JavaScript, Java, C++)
• Cloud platforms (AWS, Google Cloud, Azure)
• Machine Learning and AI frameworks
• Database design and optimization
• DevOps and CI/CD pipelines
• Agile development methodologies
• System architecture and scalability
• Data structures and algorithms

**PROFESSIONAL EXPERIENCE**

**Senior {job_role} | Tech Innovation Corp | 2021-2024**
• Led development of scalable applications serving 1M+ users
• Improved system performance by 40% through optimization
• Mentored team of 5 junior developers
• Implemented ML models increasing accuracy by 25%

**{job_role} | Digital Solutions Inc | 2019-2021**
• Developed 15+ production applications using modern frameworks
• Reduced deployment time by 60% through automation
• Collaborated with product teams to deliver user-centric solutions

**EDUCATION**
• Master of Science in Computer Science | Top University | 2019
• Bachelor of Engineering | Technology Institute | 2017

**CERTIFICATIONS**
• AWS Certified Solutions Architect
• Google Cloud Professional Developer
• Certified Kubernetes Administrator

**KEY PROJECTS**
• AI-Powered Analytics Platform: Built ML pipeline processing 100GB+ daily data
• Real-time Collaboration Tool: Developed scalable WebSocket architecture
• E-commerce Optimization Engine: Created recommendation system improving sales by 30%
        """
   
    def evaluate_resume(self, user_resume, ideal_resume, company, job_role):
        prompt = f"""
        You are an expert resume analyst. Compare the user's resume against the ideal resume for {job_role} at {company}.
       
        USER RESUME:
        {user_resume}
       
        IDEAL RESUME (BENCHMARK):
        {ideal_resume}
       
        Please provide a detailed analysis in this EXACT format:
       
        SCORE: [number between 0-100]
       
        GAPS:
        • [Specific gap 1 - be detailed]
        • [Specific gap 2 - be detailed]
        • [Specific gap 3 - be detailed]
       
        MISSING_KEYWORDS:
        • [Important keyword 1]
        • [Important keyword 2]
        • [Important keyword 3]
        • [Important keyword 4]
       
        RECOMMENDATIONS:
        • [Actionable recommendation 1 - be specific]
        • [Actionable recommendation 2 - be specific]
        • [Actionable recommendation 3 - be specific]
        • [Actionable recommendation 4 - be specific]
       
        Make sure to provide specific, actionable feedback.
        """
       
        evaluations = []
       
        # Try all available models
        models = [
            ('Gemini', self.ai_manager.call_gemini),
            ('OpenRouter', self.ai_manager.call_openrouter),
            ('Mistral', self.ai_manager.call_mistral)
        ]
       
        for model_name, model_func in models:
            try:
                result = model_func(prompt)
                if result and len(result.strip()) > 50: # Ensure meaningful response
                    evaluations.append((model_name, result))
            except Exception as e:
                continue
       
        # If no APIs work, provide fallback analysis
        if not evaluations:
            evaluations = [('Fallback Analysis', self.generate_fallback_analysis(user_resume, job_role, company))]
       
        return evaluations
   
    def generate_fallback_analysis(self, user_resume, job_role, company):
        # Basic keyword analysis
        resume_lower = user_resume.lower()
       
        # Calculate basic score based on resume length and key terms
        score = min(85, max(45, len(user_resume) // 50))
       
        # Role-specific gaps and recommendations
        if 'engineer' in job_role.lower() or 'developer' in job_role.lower():
            gaps = [
                "Technical skills section needs more specific programming languages and frameworks",
                "Missing quantified achievements showing code impact and system improvements",
                "Lack of collaboration and version control experience (Git, team projects)",
                "No mention of testing, deployment, or DevOps practices"
            ]
            keywords = ['Python', 'JavaScript', 'React', 'Node.js', 'AWS', 'Docker', 'Git', 'APIs']
            recommendations = [
                "Add specific programming languages and frameworks you've used",
                "Include metrics like 'improved performance by X%' or 'reduced load time by Y seconds'",
                "Highlight team collaboration and code review experience",
                "Mention any cloud platforms, databases, or development tools you've worked with"
            ]
        elif 'data' in job_role.lower():
            gaps = [
                "Missing data analysis tools and statistical software experience",
                "No quantified business impact from data insights or models",
                "Lack of visualization and presentation skills demonstration",
                "Limited mention of data pipeline or ETL experience"
            ]
            keywords = ['Python', 'SQL', 'Machine Learning', 'Pandas', 'Tableau', 'Statistics', 'TensorFlow', 'R']
            recommendations = [
                "List specific data analysis tools (Python, R, SQL, Tableau)",
                "Include metrics showing business impact of your analysis",
                "Highlight data visualization and storytelling abilities",
                "Mention experience with large datasets and data cleaning processes"
            ]
        elif 'manager' in job_role.lower():
            gaps = [
                "Limited evidence of team leadership and people management",
                "Missing strategic planning and business outcome achievements",
                "No clear demonstration of stakeholder communication skills",
                "Lack of budget or resource management experience"
            ]
            keywords = ['Leadership', 'Strategy', 'Team Management', 'Budget', 'Stakeholder', 'ROI', 'KPIs', 'Planning']
            recommendations = [
                "Quantify team size and management scope in previous roles",
                "Include strategic initiatives you've led and their business outcomes",
                "Highlight cross-functional collaboration and stakeholder management",
                "Add examples of budget management or resource optimization"
            ]
        else:
            gaps = [
                f"Resume doesn't clearly align with {job_role} requirements",
                f"Missing {company}-specific skills and industry knowledge",
                "Achievements lack quantification and business impact metrics",
                "Professional summary could be more targeted to the role"
            ]
            keywords = ['Innovation', 'Leadership', 'Collaboration', 'Results-driven', 'Strategic', 'Growth']
            recommendations = [
                f"Tailor your professional summary specifically to {job_role} at {company}",
                "Add quantified achievements with specific percentages and dollar amounts",
                "Research and include industry-specific keywords and technologies",
                "Highlight transferable skills that directly relate to the target role"
            ]
       
        formatted_gaps = "\n".join([f"• {gap}" for gap in gaps])
        formatted_keywords = "\n".join([f"• {keyword}" for keyword in keywords])
        formatted_recommendations = "\n".join([f"• {rec}" for rec in recommendations])
       
        return f"""
SCORE: {score}

GAPS:
{formatted_gaps}

MISSING_KEYWORDS:
{formatted_keywords}

RECOMMENDATIONS:
{formatted_recommendations}
        """
   
    def parse_evaluation(self, evaluation_text):
        try:
            # More robust parsing with fallbacks
            score_match = re.search(r'SCORE:\s*(\d+)', evaluation_text, re.IGNORECASE)
            score = int(score_match.group(1)) if score_match else 65
           
            # Extract gaps section
            gaps_match = re.search(r'GAPS:\s*(.*?)(?=MISSING_KEYWORDS|$)', evaluation_text, re.DOTALL | re.IGNORECASE)
            if gaps_match:
                gaps = gaps_match.group(1).strip()
                # Clean up the gaps text
                gaps = re.sub(r'\n\s*\n', '\n', gaps) # Remove extra newlines
                if not gaps or len(gaps) < 20:
                    gaps = f"• Needs improvement in {['technical skills', 'quantified achievements', 'industry keywords', 'leadership experience'][score // 25]}\n• Consider adding more specific examples\n• Enhance professional summary section"
            else:
                gaps = "• Technical skills need strengthening\n• Add more quantified achievements\n• Include relevant industry keywords"
           
            # Extract keywords section
            keywords_match = re.search(r'MISSING_KEYWORDS:\s*(.*?)(?=RECOMMENDATIONS|$)', evaluation_text, re.DOTALL | re.IGNORECASE)
            if keywords_match:
                keywords = keywords_match.group(1).strip()
                if not keywords or len(keywords) < 10:
                    keywords = "• Python, JavaScript, AWS\n• Docker, Kubernetes, Git\n• Machine Learning, APIs\n• Agile, Leadership, Analytics"
            else:
                keywords = "• Modern programming languages\n• Cloud technologies\n• DevOps tools\n• Project management skills"
           
            # Extract recommendations section
            recommendations_match = re.search(r'RECOMMENDATIONS:\s*(.*?)$', evaluation_text, re.DOTALL | re.IGNORECASE)
            if recommendations_match:
                recommendations = recommendations_match.group(1).strip()
                if not recommendations or len(recommendations) < 20:
                    recommendations = f"• Add specific metrics and achievements\n• Include relevant technical skills\n• Highlight leadership and teamwork\n• Tailor content to job requirements"
            else:
                recommendations = "• Quantify your achievements with specific metrics\n• Add relevant technical skills and certifications\n• Include leadership and collaboration examples\n• Customize resume for target role"
           
            return {
                'score': max(0, min(100, score)),
                'gaps': gaps,
                'keywords': keywords,
                'recommendations': recommendations
            }
        except Exception as e:
            # Ultimate fallback
            return {
                'score': 60,
                'gaps': "• Add more quantified achievements\n• Include relevant technical skills\n• Strengthen professional summary\n• Add industry-specific keywords",
                'keywords': "• Programming languages\n• Cloud technologies\n• Project management\n• Industry frameworks",
                'recommendations': "• Quantify all achievements with metrics\n• Add technical skills section\n• Include leadership examples\n• Tailor to specific job requirements"
            }
   
    def aggregate_scores(self, evaluations):
        scores = []
        parsed_evaluations = []
       
        for model, evaluation in evaluations:
            parsed = self.parse_evaluation(evaluation)
            scores.append(parsed['score'])
            parsed_evaluations.append((model, parsed))
       
        if len(scores) == 0:
            return 60, parsed_evaluations
       
        # Weighted averaging
        final_score = sum(scores) / len(scores)
        return min(100, max(0, final_score)), parsed_evaluations

# Company and Job Role Data
COMPANIES = [
    "Google", "Microsoft", "Amazon", "Apple", "Facebook/Meta", "Netflix", "Tesla",
    "OpenAI", "Anthropic", "NVIDIA", "Intel", "IBM", "Oracle", "Salesforce",
    "Adobe", "Uber", "Airbnb", "Spotify", "Twitter/X", "LinkedIn", "Goldman Sachs",
    "Custom Company"
]

JOB_ROLES = [
    "Software Engineer", "Senior Software Engineer", "Staff Software Engineer",
    "Frontend Developer", "Backend Developer", "Full Stack Developer",
    "Data Scientist", "Data Analyst", "Data Engineer", "ML Engineer",
    "AI Research Scientist", "DevOps Engineer", "Cloud Architect", "Security Engineer",
    "Product Manager", "Technical Product Manager", "Program Manager",
    "UX Designer", "UI Designer", "Product Designer"
]

# Main Application Pages
def render_homepage():
    st.markdown("""
    <div class="hero-section">
        <div style="font-size: 2rem; margin-bottom: 1rem;">Kaya AI</div>
        <div style="font-size: 1.5rem; margin-bottom: 1rem;">Intelligent Career Navigator</div>
        <div class="hero-subtitle">
            Transform your resume with AI-powered analysis. Get personalized recommendations, see how
            you match against dream jobs, and receive a sample "near-perfect" resume tailored to your
            target companies.
        </div>
    </div>
    """, unsafe_allow_html=True)
   
    col1, col2, col3 = st.columns(3)
   
    with col1:
        st.markdown("""
        <div class="feature-card">
            <div class="feature-icon">🎯</div>
            <h3>Multi-AI Analysis</h3>
            <p>Advanced AI ensemble using Gemini, OpenRouter, and Mistral for comprehensive resume evaluation.</p>
        </div>
        """, unsafe_allow_html=True)
   
    with col2:
        st.markdown("""
        <div class="feature-card">
            <div class="feature-icon">🎯</div>
            <h3>Role-Specific Optimization</h3>
            <p>Tailored analysis for specific job roles and companies to maximize your application success.</p>
        </div>
        """, unsafe_allow_html=True)
   
    with col3:
        st.markdown("""
        <div class="feature-card">
            <div class="feature-icon">📊</div>
            <h3>Intelligent Scoring</h3>
            <p>Sophisticated scoring system with multi-model analysis and personalized recommendations.</p>
        </div>
        """, unsafe_allow_html=True)
   
    st.markdown("<br><br>", unsafe_allow_html=True)
   
    col1, col2, col3 = st.columns([1, 2, 1])
    with col2:
        if st.button("🚀 Let's Get Started", key="get_started_home"):
            st.session_state.page = 'input'
            st.rerun()

def render_input_page():
    st.markdown("""
    <div style="text-align: center; padding: 2rem 0; background-color: #ffffff;">
        <div style="background: #6B46C1; color: #ffffff; width: 60px; height: 60px;
                   border-radius: 50%; display: flex; align-items: center;
                   justify-content: center; margin: 0 auto 2rem; font-size: 2rem;">📊</div>
        <h1>Get Started with Kaya AI</h1>
        <p style="font-size: 1.2rem; color: #666666; margin-bottom: 3rem;">
            Tell us about your target role and upload your resume for AI-powered analysis
        </p>
    </div>
    """, unsafe_allow_html=True)
   
    st.success("🔑 API Keys are pre-configured and ready to use!")
   
    st.markdown("<br>", unsafe_allow_html=True)
   
    col1, col2 = st.columns(2)
   
    with col1:
        st.markdown("#### 🏢 Target Company")
        company = st.selectbox(
            "Select your target company",
            COMPANIES,
            index=0,
            help="Choose the company you're applying to for tailored analysis"
        )
       
        if company == "Custom Company":
            company = st.text_input("Enter company name:", placeholder="e.g., Your Dream Company")
   
    with col2:
        st.markdown("#### 💼 Job Role")
        job_role = st.selectbox(
            "Select your target job role",
            JOB_ROLES,
            index=0,
            help="Choose the role you're targeting"
        )
   
    st.markdown("<br>", unsafe_allow_html=True)
    st.markdown("#### 📄 Upload Resume")
   
    uploaded_file = st.file_uploader(
        "Choose your resume file (PDF or DOCX)",
        type=['pdf', 'docx'],
        help="Upload your current resume for analysis"
    )
   
    # Test Resume Builder
    st.markdown("<br>", unsafe_allow_html=True)
   
    with st.expander("📝 Alternative: Create Test Resume", expanded=False):
        st.info("Don't have a resume? Build one quickly!")
       
        test_name = st.text_input("Full Name", value="John Smith")
        test_email = st.text_input("Email", value="john.smith@email.com")
        test_phone = st.text_input("Phone", value="+1-555-0123")
       
        test_summary = st.text_area("Professional Summary",
            value="Experienced software engineer with 3+ years in full-stack development", height=100)
        test_experience = st.text_area("Work Experience",
            value="Software Engineer at ABC Corp (2021-2024)\n- Developed web applications using React and Node.js\n- Improved system performance by 25%", height=150)
        test_education = st.text_area("Education",
            value="BS Computer Science, University of Technology (2017-2021)", height=100)
        test_skills = st.text_area("Skills",
            value="JavaScript, Python, React, Node.js, SQL, Git", height=100)
       
        if st.button("Generate Test Resume"):
            test_resume = f"""
{test_name}
Email: {test_email} | Phone: {test_phone}

PROFESSIONAL SUMMARY
{test_summary}

WORK EXPERIENCE
{test_experience}

EDUCATION
{test_education}

SKILLS
{test_skills}
            """
           
            st.session_state.analysis_data['test_resume'] = test_resume
            st.success("Test resume generated successfully!")
   
    st.markdown("<br><br>", unsafe_allow_html=True)
   
    # Validation and submission
    col1, col2, col3 = st.columns([1, 2, 1])
    with col2:
        if st.button("🔍 Analyze My Resume", key="analyze_button"):
            # Validation
            if not company or not job_role:
                st.error("Please select both company and job role.")
                return
           
            resume_text = ""
            if uploaded_file:
                if uploaded_file.type == "application/pdf":
                    resume_text = extract_text_from_pdf(uploaded_file)
                elif uploaded_file.type == "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
                    resume_text = extract_text_from_docx(uploaded_file)
            elif 'test_resume' in st.session_state.analysis_data:
                resume_text = st.session_state.analysis_data['test_resume']
           
            if not resume_text:
                st.error("Please upload a resume or create a test resume.")
                return
           
            # Store analysis data
            st.session_state.analysis_data.update({
                'company': company,
                'job_role': job_role,
                'resume_text': resume_text,
                'filename': uploaded_file.name if uploaded_file else 'Test Resume'
            })
           
            st.session_state.page = 'analysis'
            st.rerun()
   
    # Navigation
    if st.button("← Back to Home"):
        st.session_state.page = 'home'
        st.rerun()

def render_analysis_page():
    st.markdown("""
    <div style="text-align: center; padding: 2rem 0; background-color: #ffffff;">
        <div style="background: #6B46C1; color: #ffffff; width: 60px; height: 60px;
                   border-radius: 50%; display: flex; align-items: center;
                   justify-content: center; margin: 0 auto 1rem; font-size: 2rem;">🤖</div>
        <h1>AI Analysis in Progress</h1>
        <p style="font-size: 1.2rem; color: #666666;">
            Our multi-AI ensemble is analyzing your resume
        </p>
    </div>
    """, unsafe_allow_html=True)
   
    # Progress indicators
    progress_steps = [
        ("Input Processing", 100),
        ("AI Analysis", 75),
        ("Score Calculation", 50),
        ("Recommendations", 25)
    ]
   
    for step, progress in progress_steps:
        st.markdown(f"""
        <div style="margin: 1rem 0;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                <span style="font-weight: 600;">{step}</span>
                <span style="color: #6B46C1; font-weight: 600;">{progress}%</span>
            </div>
            <div class="progress-bar">
                <div class="progress-fill" style="width: {progress}%;"></div>
            </div>
        </div>
        """, unsafe_allow_html=True)
   
    # Perform actual AI analysis
    if 'analysis_complete' not in st.session_state:
        with st.spinner("Analyzing resume..."):
            ai_manager = AIModelManager(st.session_state.api_keys)
            analyzer = ResumeAnalyzer(ai_manager)
           
            # Stage 1: Generate ideal resume
            st.info("🎯 Generating ideal resume benchmark...")
            ideal_resume = analyzer.generate_ideal_resume(
                st.session_state.analysis_data['company'],
                st.session_state.analysis_data['job_role']
            )
           
            # Stage 2: Evaluate user resume
            st.info("🔍 Multi-AI evaluation in progress...")
            evaluations = analyzer.evaluate_resume(
                st.session_state.analysis_data['resume_text'],
                ideal_resume,
                st.session_state.analysis_data['company'],
                st.session_state.analysis_data['job_role']
            )
           
            # Stage 3: Aggregate scores
            st.info("📊 Calculating final scores...")
            final_score, parsed_evaluations = analyzer.aggregate_scores(evaluations)
           
            # Store results
            st.session_state.analysis_data.update({
                'final_score': final_score,
                'display_score': round(final_score / 10, 1),
                'ideal_resume': ideal_resume,
                'evaluations': parsed_evaluations
            })
           
            st.session_state.analysis_complete = True
   
    if st.session_state.get('analysis_complete', False):
        st.success("✅ Analysis complete! Redirecting to results...")
        time.sleep(1)
        st.session_state.page = 'results'
        st.rerun()

def render_results_page():
    data = st.session_state.analysis_data
   
    # Header
    st.markdown(f"""
    <div style="text-align: center; padding: 2rem 0; background-color: #ffffff;">
        <h1>🎯 Analysis Results</h1>
        <p style="font-size: 1.2rem; color: #666666;">
            Resume analyzed for <strong>{data['job_role']}</strong> at <strong>{data['company']}</strong>
        </p>
    </div>
    """, unsafe_allow_html=True)
   
    # Score Display
    col1, col2, col3 = st.columns([1, 2, 1])
    with col2:
        st.markdown(f"""
        <div class="score-display">
            <div style="font-size: 1.5rem; margin-bottom: 1rem;">Overall Resume Score</div>
            <div class="score-number">{data['display_score']}/10</div>
            <div style="font-size: 1rem; margin-top: 1rem; opacity: 0.9;">
                Based on {len(data['evaluations'])} AI model analysis
            </div>
        </div>
        """, unsafe_allow_html=True)
   
    # Tabs for different sections
    tab1, tab2, tab3, tab4 = st.tabs(["📊 Detailed Analysis", "📄 Ideal Resume", "🎯 Gap Analysis", "💡 Recommendations"])
   
    with tab1:
        st.markdown("### 📋 Analysis Breakdown")
       
        for model, evaluation in data['evaluations']:
            with st.expander(f"📊 {model.title()} Analysis", expanded=True):
                col1, col2 = st.columns(2)
               
                with col1:
                    st.metric("Score", f"{evaluation['score']}/100")
               
                with col2:
                    score_color = "#28a745" if evaluation['score'] >= 70 else "#ffc107" if evaluation['score'] >= 50 else "#dc3545"
                    st.markdown(f"""
                    <div style="background: {score_color}; color: #ffffff; padding: 0.5rem;
                                border-radius: 5px; text-align: center; font-weight: 600;">
                        {evaluation['score']}% Match
                    </div>
                    """, unsafe_allow_html=True)
               
                st.markdown("**Key Insights:**")
                st.write(evaluation['gaps'])
   
    with tab2:
        st.markdown("### 🎯 AI-Generated Ideal Resume")
        st.info(f"This is an optimized resume benchmark for {data['job_role']} at {data['company']}")
       
        st.markdown(f"""
        <div class="ideal-resume">
            <div style="white-space: pre-wrap; font-family: monospace; font-size: 0.9rem; line-height: 1.4; color: #333333;">
{data['ideal_resume']}
            </div>
        </div>
        """, unsafe_allow_html=True)
   
    with tab3:
        st.markdown("### 🎯 Identified Gaps & Missing Elements")
       
        for i, (model, evaluation) in enumerate(data['evaluations'], 1):
            st.markdown(f"#### Model {i}: {model.title()}")
           
            col1, col2 = st.columns(2)
           
            with col1:
                st.markdown("**Areas for Improvement:**")
                st.markdown(f"""
                <div class="gap-item">
                    <div style="white-space: pre-wrap; line-height: 1.5; color: #333333;">
{evaluation['gaps']}
                    </div>
                </div>
                """, unsafe_allow_html=True)
           
            with col2:
                st.markdown("**Missing Keywords:**")
                st.markdown(f"""
                <div style="background: #e3f2fd; padding: 1rem; border-radius: 8px; border-left: 4px solid #2196f3; color: #333333;">
                    <div style="white-space: pre-wrap; line-height: 1.5;">
{evaluation['keywords']}
                    </div>
                </div>
                """, unsafe_allow_html=True)
           
            st.markdown("---")
   
    with tab4:
        st.markdown("### 💡 Personalized Recommendations")
       
        for i, (model, evaluation) in enumerate(data['evaluations'], 1):
            st.markdown(f"""
            <div class="recommendation-card">
                <h4>🎯 {model.title()} Recommendations</h4>
                <div style="white-space: pre-wrap; line-height: 1.6; color: #333333;">
{evaluation['recommendations']}
                </div>
            </div>
            """, unsafe_allow_html=True)
   
    # Action Buttons
    st.markdown("---")
    col1, col2, col3 = st.columns(3)
   
    with col1:
        if st.button("🔄 Analyze Another Resume"):
            st.session_state.page = 'input'
            st.session_state.analysis_data = {}
            if 'analysis_complete' in st.session_state:
                del st.session_state.analysis_complete
            st.rerun()
   
    with col2:
        if st.button("📧 Email Results"):
            st.info("Email functionality would be implemented in production")
   
    with col3:
        if st.button("💾 Download Report"):
            report = f"""
KAYA AI RESUME ANALYSIS REPORT
====================================
Analysis Date: {time.strftime('%Y-%m-%d %H:%M:%S')}
Position: {data['job_role']} at {data['company']}
Resume File: {data['filename']}

OVERALL SCORE: {data['display_score']}/10 ({data['final_score']}/100)

DETAILED ANALYSIS:
{chr(10).join([f"{model}: {eval['score']}/100" for model, eval in data['evaluations']])}

IDEAL RESUME BENCHMARK:
{data['ideal_resume']}

Generated by Kaya AI - Career Navigator
            """
           
            st.download_button(
                label="📄 Download Report",
                data=report,
                file_name=f"kaya_ai_analysis_{data['company']}_{data['job_role']}.txt",
                mime="text/plain"
            )

# Main Application Flow
def main():
    init_session_state()
   
    # Page routing
    if st.session_state.page == 'home':
        render_homepage()
    elif st.session_state.page == 'input':
        render_input_page()
    elif st.session_state.page == 'analysis':
        render_analysis_page()
    elif st.session_state.page == 'results':
        render_results_page()
   
    # Footer
    st.markdown("---")
    st.markdown("""
    <div style="text-align: center; padding: 2rem; color: #666666; font-size: 0.9rem; background-color: #ffffff;">
        <p><strong>Kaya AI - Career Navigator</strong></p>
        <p>Powered by Multi-AI Technology | Gemini + OpenRouter + Mistral</p>
        <p style="font-size: 0.8rem;">
            Demo version with integrated API keys for testing purposes.
        </p>
    </div>
    """, unsafe_allow_html=True)

if __name__ == "__main__":
    main()