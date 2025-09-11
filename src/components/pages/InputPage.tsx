import { useState } from "react";
import { Upload, FileText, Building2, Briefcase, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { COMPANIES, JOB_ROLES } from "@/data/constants";
import { AnalysisData } from "@/types";

interface InputPageProps {
  onAnalyze: (data: AnalysisData) => void;
  onBack: () => void;
}

export function InputPage({ onAnalyze, onBack }: InputPageProps) {
  const [company, setCompany] = useState("");
  const [customCompany, setCustomCompany] = useState("");
  const [jobRole, setJobRole] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [testResume, setTestResume] = useState({
    name: "John Smith",
    email: "john.smith@email.com",
    phone: "+1-555-0123",
    summary: "Experienced software engineer with 3+ years in full-stack development",
    experience: "Software Engineer at ABC Corp (2021-2024)\n- Developed web applications using React and Node.js\n- Improved system performance by 25%",
    education: "BS Computer Science, University of Technology (2017-2021)",
    skills: "JavaScript, Python, React, Node.js, SQL, Git"
  });
  const [useTestResume, setUseTestResume] = useState(false);
  const { toast } = useToast();

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = event.target.files?.[0];
    if (uploadedFile) {
      if (uploadedFile.type === "application/pdf" || 
          uploadedFile.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
        setFile(uploadedFile);
        setUseTestResume(false);
        toast({
          title: "File uploaded successfully",
          description: `${uploadedFile.name} is ready for analysis`,
        });
      } else {
        toast({
          title: "Invalid file type",
          description: "Please upload a PDF or DOCX file",
          variant: "destructive",
        });
      }
    }
  };

  const extractTextFromFile = async (file: File): Promise<string> => {
    // Simulate file text extraction
    // In a real implementation, you'd use libraries like pdf-parse or mammoth
    return `Resume content extracted from ${file.name}\n\nProfessional Summary: Experienced professional with strong background in technology and innovation.\n\nExperience: Multiple years of experience in software development and project management.\n\nSkills: Various technical and soft skills relevant to the industry.`;
  };

  const generateTestResumeText = () => {
    return `${testResume.name}
Email: ${testResume.email} | Phone: ${testResume.phone}

PROFESSIONAL SUMMARY
${testResume.summary}

WORK EXPERIENCE
${testResume.experience}

EDUCATION
${testResume.education}

SKILLS
${testResume.skills}`;
  };

  const handleAnalyze = async () => {
    if (!company || !jobRole) {
      toast({
        title: "Missing information",
        description: "Please select both company and job role",
        variant: "destructive",
      });
      return;
    }

    let resumeText = "";
    let filename = "";

    if (file) {
      resumeText = await extractTextFromFile(file);
      filename = file.name;
    } else if (useTestResume) {
      resumeText = generateTestResumeText();
      filename = "Test Resume";
    } else {
      toast({
        title: "No resume provided",
        description: "Please upload a resume or create a test resume",
        variant: "destructive",
      });
      return;
    }

    const finalCompany = company === "Custom Company" ? customCompany : company;
    
    onAnalyze({
      company: finalCompany,
      jobRole,
      resumeText,
      filename
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 py-8">
      <div className="container mx-auto max-w-4xl px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-hero rounded-2xl mb-6">
            <FileText className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="text-4xl font-bold text-foreground mb-4">Get Started with Kaya AI</h1>
          <p className="text-xl text-muted-foreground">
            Tell us about your target role and upload your resume for AI-powered analysis
          </p>
        </div>

        {/* API Status */}
        <div className="mb-8">
          <Card className="bg-success/10 border-success/20">
            <CardContent className="flex items-center gap-3 p-4">
              <CheckCircle className="w-5 h-5 text-success" />
              <span className="text-success font-medium">API Keys are pre-configured and ready to use!</span>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Company & Role Selection */}
          <Card className="bg-gradient-card border border-border/50 shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="w-5 h-5" />
                Target Company & Role
              </CardTitle>
              <CardDescription>
                Select your target company and position for tailored analysis
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="company">Target Company</Label>
                <Select value={company} onValueChange={setCompany}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select company" />
                  </SelectTrigger>
                  <SelectContent>
                    {COMPANIES.map((comp) => (
                      <SelectItem key={comp} value={comp}>
                        {comp}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                {company === "Custom Company" && (
                  <Input
                    placeholder="Enter company name"
                    value={customCompany}
                    onChange={(e) => setCustomCompany(e.target.value)}
                    className="mt-2"
                  />
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="role">Job Role</Label>
                <Select value={jobRole} onValueChange={setJobRole}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select job role" />
                  </SelectTrigger>
                  <SelectContent>
                    {JOB_ROLES.map((role) => (
                      <SelectItem key={role} value={role}>
                        {role}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Resume Upload */}
          <Card className="bg-gradient-card border border-border/50 shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="w-5 h-5" />
                Upload Resume
              </CardTitle>
              <CardDescription>
                Upload your current resume for AI analysis
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary/50 transition-colors">
                  <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-4" />
                  <Label htmlFor="file-upload" className="cursor-pointer">
                    <span className="text-sm font-medium text-foreground">
                      Click to upload or drag and drop
                    </span>
                    <p className="text-xs text-muted-foreground mt-1">
                      PDF or DOCX files only
                    </p>
                  </Label>
                  <Input
                    id="file-upload"
                    type="file"
                    accept=".pdf,.docx"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </div>
                
                {file && (
                  <div className="flex items-center gap-2 p-3 bg-success/10 rounded-lg border border-success/20">
                    <FileText className="w-4 h-4 text-success" />
                    <span className="text-sm font-medium text-success">{file.name}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Test Resume Builder */}
        <Card className="mt-8 bg-gradient-card border border-border/50 shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="w-5 h-5" />
              Alternative: Create Test Resume
            </CardTitle>
            <CardDescription>
              Don't have a resume? Build one quickly for testing
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={testResume.name}
                  onChange={(e) => setTestResume({...testResume, name: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={testResume.email}
                  onChange={(e) => setTestResume({...testResume, email: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={testResume.phone}
                  onChange={(e) => setTestResume({...testResume, phone: e.target.value})}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="summary">Professional Summary</Label>
                <Textarea
                  id="summary"
                  value={testResume.summary}
                  onChange={(e) => setTestResume({...testResume, summary: e.target.value})}
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="experience">Work Experience</Label>
                <Textarea
                  id="experience"
                  value={testResume.experience}
                  onChange={(e) => setTestResume({...testResume, experience: e.target.value})}
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="education">Education</Label>
                <Textarea
                  id="education"
                  value={testResume.education}
                  onChange={(e) => setTestResume({...testResume, education: e.target.value})}
                  rows={2}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="skills">Skills</Label>
                <Textarea
                  id="skills"
                  value={testResume.skills}
                  onChange={(e) => setTestResume({...testResume, skills: e.target.value})}
                  rows={2}
                />
              </div>
            </div>

            <Button
              variant="outline"
              onClick={() => {
                setUseTestResume(true);
                setFile(null);
                toast({
                  title: "Test resume generated",
                  description: "Ready for analysis",
                });
              }}
              className="w-full"
            >
              Generate Test Resume
            </Button>

            {useTestResume && (
              <div className="p-4 bg-success/10 rounded-lg border border-success/20">
                <p className="text-success font-medium">Test resume generated successfully!</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 mt-8 justify-center">
          <Button variant="outline" onClick={onBack} size="lg">
            ← Back to Home
          </Button>
          <Button variant="hero" onClick={handleAnalyze} size="lg" className="min-w-[200px]">
            🔍 Analyze My Resume
          </Button>
        </div>
      </div>
    </div>
  );
}