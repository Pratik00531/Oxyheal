import { Navigation } from "@/components/Navigation";
import { MobileNav } from "@/components/MobileNav";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { lungCancerApi } from "@/lib/lungCancerApi";
import type { LungCancerAssessment } from "@/types/lungCancer";
import { 
  Upload, 
  FileText, 
  CheckCircle, 
  Heart,
  Stethoscope,
  Activity,
  Brain,
  Bone,
  Eye,
  ArrowRight,
  AlertCircle
} from "lucide-react";

const Report = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [assessments, setAssessments] = useState<LungCancerAssessment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAssessments();
  }, []);

  const loadAssessments = async () => {
    setLoading(true);
    try {
      const result = await lungCancerApi.getAssessments();
      if (result.error) {
        console.error('Failed to load assessments:', result.error);
      } else if (result.data) {
        // Transform snake_case to camelCase
        const transformedAssessments = result.data.map((assessment: any) => ({
          id: assessment.id,
          userId: assessment.user_id,
          demographics: assessment.demographics,
          smokingHistory: assessment.smoking_history,
          medicalHistory: assessment.medical_history,
          environmentalExposures: assessment.environmental_exposures,
          symptoms: assessment.symptoms,
          eligibility: assessment.eligibility,
          status: assessment.status,
          notes: assessment.notes,
          createdAt: assessment.created_at,
          updatedAt: assessment.updated_at,
        }));
        setAssessments(transformedAssessments);
      }
    } catch (error) {
      console.error('Error loading assessments:', error);
    } finally {
      setLoading(false);
    }
  };

  const healthAssessments = [
    {
      id: "lung-cancer",
      title: "Lung Cancer Screening",
      description: "Comprehensive risk assessment based on USPSTF 2021 guidelines",
      icon: Stethoscope,
      color: "text-red-500",
      bgColor: "bg-red-50",
      route: "/lung-cancer/new",
      badge: "New",
      badgeColor: "bg-green-500",
      reports: ["LDCT Scan", "Pathology", "Biomarker", "Staging"]
    },
    {
      id: "cardiovascular",
      title: "Cardiovascular Health",
      description: "Heart health assessment and risk evaluation",
      icon: Heart,
      color: "text-pink-500",
      bgColor: "bg-pink-50",
      route: "#",
      badge: "Coming Soon",
      badgeColor: "bg-gray-400",
      reports: ["ECG", "Echo", "Stress Test"]
    },
    {
      id: "diabetes",
      title: "Diabetes Screening",
      description: "Blood sugar levels and metabolic health tracking",
      icon: Activity,
      color: "text-blue-500",
      bgColor: "bg-blue-50",
      route: "#",
      badge: "Coming Soon",
      badgeColor: "bg-gray-400",
      reports: ["HbA1c", "Glucose", "Insulin"]
    },
    {
      id: "mental-health",
      title: "Mental Wellness",
      description: "Anxiety, depression, and stress level assessment",
      icon: Brain,
      color: "text-purple-500",
      bgColor: "bg-purple-50",
      route: "#",
      badge: "Coming Soon",
      badgeColor: "bg-gray-400",
      reports: ["PHQ-9", "GAD-7", "PSS"]
    },
    {
      id: "bone-density",
      title: "Bone Density Test",
      description: "Osteoporosis risk and bone health evaluation",
      icon: Bone,
      color: "text-orange-500",
      bgColor: "bg-orange-50",
      route: "#",
      badge: "Coming Soon",
      badgeColor: "bg-gray-400",
      reports: ["DEXA Scan", "Bone Markers"]
    },
    {
      id: "vision",
      title: "Vision Assessment",
      description: "Eye health and visual acuity screening",
      icon: Eye,
      color: "text-teal-500",
      bgColor: "bg-teal-50",
      route: "#",
      badge: "Coming Soon",
      badgeColor: "bg-gray-400",
      reports: ["Visual Acuity", "Retinal Scan"]
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <MobileNav />
      
      <main className="md:ml-20 p-6 md:p-8 pb-24 md:pb-8">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header */}
          <div className="space-y-2">
            <h1 className="text-4xl font-display font-bold">Health Assessments</h1>
            <p className="text-muted-foreground text-lg">Complete assessments and upload medical reports</p>
          </div>

          {/* Alert Banner */}
          <Card className="p-4 border-blue-200 bg-blue-50">
            <div className="flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-blue-500 mt-0.5" />
              <div>
                <h3 className="font-semibold text-blue-900">Get Started with Health Screening</h3>
                <p className="text-sm text-blue-700">Complete health assessments to track your wellness journey and get personalized insights.</p>
              </div>
            </div>
          </Card>

          {/* Available Assessments Grid */}
          <div className="space-y-4">
            <h2 className="text-2xl font-display font-bold">Available Assessments</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {healthAssessments.map((assessment) => (
                <Card 
                  key={assessment.id} 
                  className="p-6 gradient-card shadow-soft hover:shadow-medium transition-all duration-300 cursor-pointer hover:scale-105"
                  onClick={() => {
                    if (assessment.route !== "#") {
                      navigate(assessment.route);
                    }
                  }}
                >
                  <div className="space-y-4">
                    {/* Icon and Badge */}
                    <div className="flex items-start justify-between">
                      <div className={`p-4 rounded-2xl ${assessment.bgColor}`}>
                        <assessment.icon className={`w-8 h-8 ${assessment.color}`} />
                      </div>
                      <Badge className={`${assessment.badgeColor} text-white border-none`}>
                        {assessment.badge}
                      </Badge>
                    </div>

                    {/* Content */}
                    <div className="space-y-2">
                      <h3 className="text-xl font-bold">{assessment.title}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {assessment.description}
                      </p>
                    </div>

                    {/* Reports Types */}
                    <div className="flex flex-wrap gap-2">
                      {assessment.reports.map((report, idx) => (
                        <span 
                          key={idx}
                          className="text-xs px-2 py-1 rounded-full bg-purple-light text-primary font-medium"
                        >
                          {report}
                        </span>
                      ))}
                    </div>

                    {/* Action Button */}
                    <Button 
                      className="w-full rounded-full"
                      variant={assessment.route === "#" ? "outline" : "default"}
                      disabled={assessment.route === "#"}
                    >
                      {assessment.route === "#" ? "Coming Soon" : "Start Assessment"}
                      {assessment.route !== "#" && <ArrowRight className="w-4 h-4 ml-2" />}
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Recent Assessments */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-display font-bold">Recent Assessments</h2>
              <Button variant="ghost" className="rounded-full" onClick={() => navigate("/history")}>
                View All
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
            
            {loading ? (
              <Card className="p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Loading assessments...</p>
              </Card>
            ) : assessments.length === 0 ? (
              <Card className="p-8 text-center">
                <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-semibold mb-2">No Assessments Yet</h3>
                <p className="text-muted-foreground mb-4">Start your first health assessment to track your wellness journey</p>
                <Button onClick={() => navigate("/lung-cancer/new")}>
                  Start Lung Cancer Screening
                </Button>
              </Card>
            ) : (
              <div className="space-y-4">
                {assessments.slice(0, 3).map((assessment) => (
                  <Card key={assessment.id} className="p-6 gradient-card shadow-soft hover:shadow-medium transition-smooth">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="p-3 rounded-full bg-purple-light">
                          <Stethoscope className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold">Lung Cancer Screening</h3>
                          <p className="text-sm text-muted-foreground">
                            {new Date(assessment.createdAt).toLocaleDateString('en-US', { 
                              year: 'numeric', 
                              month: 'long', 
                              day: 'numeric' 
                            })}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center space-x-2">
                          <CheckCircle className="w-5 h-5 text-green-500" />
                          <div className="text-right">
                            <p className="text-sm font-medium text-green-500">Completed</p>
                            <p className="text-xs text-muted-foreground capitalize">
                              {assessment.eligibility.isEligible ? 'Eligible' : 'Not Eligible'}
                            </p>
                          </div>
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="rounded-full"
                          onClick={() => navigate(`/lung-cancer/results/${assessment.id}`)}
                        >
                          View Results
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Quick Upload Section */}
          <Card className="p-8 gradient-card shadow-medium">
            <div className="text-center space-y-6">
              <div className="flex justify-center">
                <div className="p-6 rounded-full bg-purple-light">
                  <Upload className="w-12 h-12 text-primary" />
                </div>
              </div>
              <div>
                <h2 className="text-2xl font-display font-bold mb-2">Quick Upload</h2>
                <p className="text-muted-foreground">
                  Have existing medical reports? Upload them directly here
                </p>
              </div>
              <div className="border-2 border-dashed border-border rounded-2xl p-12 hover:border-primary transition-smooth cursor-pointer">
                <p className="text-sm text-muted-foreground">PDF, JPG, PNG up to 10MB</p>
              </div>
              <Button size="lg" className="rounded-full bg-primary hover:bg-primary/90 shadow-soft">
                Choose File
              </Button>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Report;
