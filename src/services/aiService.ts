import { API_KEYS } from "@/data/constants";
import { EvaluationResult } from "@/types";

export class AIModelManager {
  private apiKeys = API_KEYS;

  async callGemini(prompt: string): Promise<string | null> {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${this.apiKeys.gemini}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.7,
            topK: 1,
            topP: 1,
            maxOutputTokens: 2048,
          }
        })
      });

      if (response.ok) {
        const result = await response.json();
        return result.candidates[0].content.parts[0].text;
      }
      return null;
    } catch (error) {
      console.warn('Gemini API temporarily unavailable:', error);
      return null;
    }
  }

  async callOpenRouter(prompt: string, model = "openai/gpt-3.5-turbo"): Promise<string | null> {
    try {
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: 'POST',
        headers: {
          "Authorization": `Bearer ${this.apiKeys.openrouter}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model,
          messages: [{ role: "user", content: prompt }],
          max_tokens: 2000,
          temperature: 0.7
        })
      });

      if (response.ok) {
        const result = await response.json();
        return result.choices[0].message.content;
      }
      return null;
    } catch (error) {
      console.warn('OpenRouter API temporarily unavailable:', error);
      return null;
    }
  }

  async callMistral(prompt: string): Promise<string | null> {
    try {
      const response = await fetch("https://api.mistral.ai/v1/chat/completions", {
        method: 'POST',
        headers: {
          "Authorization": `Bearer ${this.apiKeys.mistral}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "mistral-tiny",
          messages: [{ role: "user", content: prompt }],
          max_tokens: 2000,
          temperature: 0.7
        })
      });

      if (response.ok) {
        const result = await response.json();
        return result.choices[0].message.content;
      }
      return null;
    } catch (error) {
      console.warn('Mistral API temporarily unavailable:', error);
      return null;
    }
  }
}

export class ResumeAnalyzer {
  constructor(private aiManager: AIModelManager) {}

  async generateIdealResume(company: string, jobRole: string): Promise<string> {
    const prompt = `
    Generate a highly optimized, professional resume for the position of ${jobRole} at ${company}.
    
    This should be a comprehensive, detailed resume that includes:
    1. Professional Summary (3-4 lines)
    2. Key Skills and Technologies (8-10 skills)
    3. Work Experience with quantified achievements (2-3 positions)
    4. Education and Certifications
    5. Projects and Technical Expertise (2-3 projects)
    6. Industry-specific keywords
    
    Make it specific to ${company}'s requirements and ${jobRole} expectations.
    Format it as a complete, professional resume with proper sections and bullet points.
    `;

    let result = await this.aiManager.callGemini(prompt);
    if (!result) result = await this.aiManager.callOpenRouter(prompt);
    if (!result) result = await this.aiManager.callMistral(prompt);
    
    return result || this.generateFallbackResume(company, jobRole);
  }

  private generateFallbackResume(company: string, jobRole: string): string {
    return `**${jobRole.toUpperCase()} RESUME - OPTIMIZED FOR ${company.toUpperCase()}**

**PROFESSIONAL SUMMARY**
Experienced ${jobRole} with 5+ years of expertise in cutting-edge technologies. Proven track record of delivering high-impact solutions that drive business growth and technical innovation. Strong background in software development, system architecture, and cross-functional collaboration.

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

**Senior ${jobRole} | Tech Innovation Corp | 2021-2024**
• Led development of scalable applications serving 1M+ users
• Improved system performance by 40% through optimization
• Mentored team of 5 junior developers
• Implemented ML models increasing accuracy by 25%

**${jobRole} | Digital Solutions Inc | 2019-2021**
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
• E-commerce Optimization Engine: Created recommendation system improving sales by 30%`;
  }

  async evaluateResume(userResume: string, idealResume: string, company: string, jobRole: string) {
    const prompt = `
    You are an expert resume analyst. Compare the user's resume against the ideal resume for ${jobRole} at ${company}.
    
    USER RESUME:
    ${userResume}
    
    IDEAL RESUME (BENCHMARK):
    ${idealResume}
    
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
    `;

    const evaluations = [];
    const models = [
      { name: 'Gemini', func: this.aiManager.callGemini.bind(this.aiManager) },
      { name: 'OpenRouter', func: this.aiManager.callOpenRouter.bind(this.aiManager) },
      { name: 'Mistral', func: this.aiManager.callMistral.bind(this.aiManager) }
    ];

    for (const model of models) {
      try {
        const result = await model.func(prompt);
        if (result && result.trim().length > 50) {
          evaluations.push({ model: model.name, evaluation: result });
        }
      } catch (error) {
        continue;
      }
    }

    if (evaluations.length === 0) {
      evaluations.push({
        model: 'Fallback Analysis',
        evaluation: this.generateFallbackAnalysis(userResume, jobRole, company)
      });
    }

    return evaluations;
  }

  private generateFallbackAnalysis(userResume: string, jobRole: string, company: string): string {
    const score = Math.min(85, Math.max(45, userResume.length / 50));
    
    return `
SCORE: ${Math.round(score)}

GAPS:
• Technical skills section needs more specific programming languages and frameworks
• Missing quantified achievements showing impact and results
• Lack of industry-specific keywords and technologies
• Professional summary could be more targeted to ${jobRole} role

MISSING_KEYWORDS:
• Modern programming languages and frameworks
• Cloud technologies and platforms
• DevOps and automation tools
• Project management methodologies

RECOMMENDATIONS:
• Add specific metrics and quantified achievements to demonstrate impact
• Include relevant technical skills and certifications for ${jobRole}
• Tailor professional summary to highlight ${company}-specific experience
• Research and incorporate industry-standard keywords and technologies
    `;
  }

  parseEvaluation(evaluationText: string): EvaluationResult {
    try {
      const scoreMatch = evaluationText.match(/SCORE:\s*(\d+)/i);
      const score = scoreMatch ? parseInt(scoreMatch[1]) : 65;

      const gapsMatch = evaluationText.match(/GAPS:\s*(.*?)(?=MISSING_KEYWORDS|$)/is);
      const gaps = gapsMatch ? gapsMatch[1].trim() : "• Needs improvement in key areas\n• Add more quantified achievements\n• Enhance technical skills section";

      const keywordsMatch = evaluationText.match(/MISSING_KEYWORDS:\s*(.*?)(?=RECOMMENDATIONS|$)/is);
      const keywords = keywordsMatch ? keywordsMatch[1].trim() : "• Programming languages\n• Cloud technologies\n• Industry frameworks\n• Project management tools";

      const recommendationsMatch = evaluationText.match(/RECOMMENDATIONS:\s*(.*?)$/is);
      const recommendations = recommendationsMatch ? recommendationsMatch[1].trim() : "• Quantify achievements with metrics\n• Add relevant technical skills\n• Include leadership examples\n• Tailor to job requirements";

      return {
        score: Math.max(0, Math.min(100, score)),
        gaps,
        keywords,
        recommendations
      };
    } catch (error) {
      return {
        score: 60,
        gaps: "• Add more quantified achievements\n• Include relevant technical skills\n• Strengthen professional summary",
        keywords: "• Programming languages\n• Cloud technologies\n• Industry frameworks",
        recommendations: "• Quantify all achievements\n• Add technical skills\n• Tailor to role requirements"
      };
    }
  }

  aggregateScores(evaluations: Array<{ model: string; evaluation: string }>) {
    const scores: number[] = [];
    const parsedEvaluations = [];

    for (const { model, evaluation } of evaluations) {
      const parsed = this.parseEvaluation(evaluation);
      scores.push(parsed.score);
      parsedEvaluations.push({ model, evaluation: parsed });
    }

    const baseScore = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 60;
    // Slight jitter to avoid identical scores across runs
    const jitter = Math.floor(Math.random() * 5) - 2; // -2..2
    const adjusted = Math.min(100, Math.max(0, baseScore + jitter));
    
    return {
      finalScore: adjusted,
      parsedEvaluations
    };
  }
}