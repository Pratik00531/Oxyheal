import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { lungCancerApi } from '@/lib/lungCancerApi';
import { calculateRiskScore, getRiskLevel, interpretLungRADS } from '@/lib/lungCancerUtils';
import type { LungCancerAssessment } from '@/types/lungCancer';
import { AlertCircle, CheckCircle2, XCircle, FileText, Upload, ArrowLeft } from 'lucide-react';

export default function LungCancerResults() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [assessment, setAssessment] = useState<LungCancerAssessment | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploadDialogOpen, setUploadDialogOpen] = useState<string | null>(null);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadLoading, setUploadLoading] = useState(false);

  useEffect(() => {
    loadAssessment();
  }, [id]);

  const loadAssessment = async () => {
    if (!id) return;
    
    setLoading(true);
    try {
      const result = await lungCancerApi.getAssessment(id);
      if (result.error) {
        toast({
          title: 'Error',
          description: typeof result.error === 'string' ? result.error : 'Failed to load assessment',
          variant: 'destructive',
        });
      } else if (result.data) {
        // Transform snake_case fields from database to camelCase for frontend
        const data = result.data as any;
        const transformedAssessment: LungCancerAssessment = {
          id: data.id,
          userId: data.user_id,
          demographics: data.demographics,
          smokingHistory: data.smoking_history,
          medicalHistory: data.medical_history,
          environmentalExposures: data.environmental_exposures,
          symptoms: data.symptoms,
          eligibility: data.eligibility,
          status: data.status,
          notes: data.notes,
          createdAt: data.created_at,
          updatedAt: data.updated_at,
          ldctReports: data.ldct_reports,
          pathologyReports: data.pathology_reports,
          biomarkerReports: data.biomarker_reports,
          stagingReports: data.staging_reports,
        };
        setAssessment(transformedAssessment);
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load assessment',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUploadLDCT = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!id) return;

    const formData = new FormData(e.currentTarget);
    setUploadLoading(true);

    try {
      const report = {
        scanDate: formData.get('scanDate') as string,
        clinicalHistory: formData.get('clinicalHistory') as string || '',
        technique: formData.get('technique') as string || 'Low-dose CT',
        findings: formData.get('findings') as string,
        impression: formData.get('impression') as string,
        lungRADS: Number(formData.get('lungRADS')),
        recommendation: formData.get('recommendation') as string,
        radiologistName: formData.get('radiologistName') as string || undefined,
      };

      const result = await lungCancerApi.uploadLDCTReport(id, report, uploadFile || undefined);

      if (result.error) {
        toast({
          title: 'Upload Failed',
          description: typeof result.error === 'string' ? result.error : 'Failed to upload report',
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Report Uploaded',
          description: 'LDCT report has been uploaded successfully',
        });
        setUploadDialogOpen(null);
        setUploadFile(null);
        loadAssessment(); // Reload to show updated reports
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to upload report',
        variant: 'destructive',
      });
    } finally {
      setUploadLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container max-w-4xl mx-auto py-8 px-4">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading assessment...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!assessment) {
    return (
      <div className="container max-w-4xl mx-auto py-8 px-4">
        <Alert variant="destructive">
          <XCircle className="h-4 w-4" />
          <AlertTitle>Assessment Not Found</AlertTitle>
          <AlertDescription>
            The assessment you're looking for doesn't exist or has been removed.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const riskScore = calculateRiskScore({
    demographics: assessment.demographics,
    smokingHistory: assessment.smokingHistory,
    medicalHistory: assessment.medicalHistory,
    environmentalExposures: assessment.environmentalExposures,
  });

  const riskLevel = getRiskLevel(riskScore);

  return (
    <div className="container max-w-4xl mx-auto py-8 px-4">
      <Button
        variant="ghost"
        onClick={() => navigate('/report')}
        className="mb-6"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Health Assessments
      </Button>

      <div className="space-y-6">
        {/* Screening Eligibility */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {assessment.eligibility.isEligible ? (
                <CheckCircle2 className="h-6 w-6 text-green-600" />
              ) : (
                <XCircle className="h-6 w-6 text-orange-600" />
              )}
              Screening Eligibility
            </CardTitle>
            <CardDescription>
              Based on USPSTF 2021 Guidelines
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert variant={assessment.eligibility.isEligible ? "default" : "destructive"}>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>
                {assessment.eligibility.isEligible ? 'You Are Eligible' : 'Not Eligible'}
              </AlertTitle>
              <AlertDescription className="mt-2">
                {assessment.eligibility.reason}
              </AlertDescription>
            </Alert>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <p className="text-sm font-medium">Age Requirement</p>
                <Badge variant={assessment.eligibility.criteria.ageEligible ? "default" : "secondary"}>
                  {assessment.eligibility.criteria.ageEligible ? 'Met' : 'Not Met'}
                </Badge>
                <p className="text-xs text-muted-foreground">
                  Age: {assessment.demographics.age} (Required: 50-80)
                </p>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium">Pack-Year History</p>
                <Badge variant={assessment.eligibility.criteria.packYearsEligible ? "default" : "secondary"}>
                  {assessment.eligibility.criteria.packYearsEligible ? 'Met' : 'Not Met'}
                </Badge>
                <p className="text-xs text-muted-foreground">
                  {assessment.smokingHistory.packYears} pack-years (Required: ≥20)
                </p>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium">Smoking Status</p>
                <Badge variant={assessment.eligibility.criteria.smokingStatusEligible ? "default" : "secondary"}>
                  {assessment.eligibility.criteria.smokingStatusEligible ? 'Met' : 'Not Met'}
                </Badge>
                <p className="text-xs text-muted-foreground capitalize">
                  {assessment.smokingHistory.smokingStatus} smoker
                </p>
              </div>
            </div>

            <Separator />

            <div className="bg-muted p-4 rounded-lg">
              <p className="font-medium mb-2">Recommendation:</p>
              <p className="text-sm">{assessment.eligibility.recommendation}</p>
            </div>
          </CardContent>
        </Card>

        {/* Risk Assessment */}
        <Card>
          <CardHeader>
            <CardTitle>Risk Assessment</CardTitle>
            <CardDescription>
              Calculated based on multiple risk factors
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Overall Risk Score</span>
                <Badge 
                  variant={riskLevel.level === 'low' ? 'default' : 'destructive'}
                  className="text-base px-3 py-1"
                >
                  {riskScore}/100
                </Badge>
              </div>
              <Progress value={riskScore} className="h-3" />
              <p className="text-sm text-muted-foreground">
                Risk Level: <span className="font-medium capitalize">{riskLevel.level.replace('-', ' ')}</span>
                {' - '}
                {riskLevel.description}
              </p>
            </div>

            <Separator />

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium mb-2">Risk Factors Present:</p>
                <ul className="space-y-1 text-sm">
                  <li className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                    {assessment.smokingHistory.packYears} pack-year smoking history
                  </li>
                  {assessment.medicalHistory.hasLungDisease && (
                    <li className="flex items-center gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                      Previous lung disease
                    </li>
                  )}
                  {assessment.medicalHistory.hasFamilyHistory && (
                    <li className="flex items-center gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                      Family history of lung cancer
                    </li>
                  )}
                  {assessment.medicalHistory.hasChestRadiation && (
                    <li className="flex items-center gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                      Previous chest radiation
                    </li>
                  )}
                  {assessment.environmentalExposures.asbestosExposure && (
                    <li className="flex items-center gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                      Asbestos exposure
                    </li>
                  )}
                </ul>
              </div>

              <div>
                <p className="text-sm font-medium mb-2">Demographics:</p>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>Age: {assessment.demographics.age}</li>
                  <li className="capitalize">Sex: {assessment.demographics.sex}</li>
                  <li className="capitalize">
                    Smoking: {assessment.smokingHistory.smokingStatus}
                  </li>
                  {assessment.smokingHistory.smokingStatus === 'former' && 
                    assessment.smokingHistory.yearsQuit && (
                    <li>Quit: {assessment.smokingHistory.yearsQuit} years ago</li>
                  )}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Reports Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Medical Reports
            </CardTitle>
            <CardDescription>
              Upload and manage your screening and diagnostic reports
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* LDCT Upload Dialog */}
              <Dialog open={uploadDialogOpen === 'ldct'} onOpenChange={(open) => setUploadDialogOpen(open ? 'ldct' : null)}>
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    className="h-auto py-6 flex flex-col items-center gap-2"
                  >
                    <Upload className="h-5 w-5" />
                    <div className="text-center">
                      <p className="font-medium">LDCT Report</p>
                      <p className="text-xs text-muted-foreground">Low-Dose CT Scan</p>
                    </div>
                    {assessment.ldctReports && assessment.ldctReports.length > 0 && (
                      <Badge variant="secondary" className="mt-2">
                        {assessment.ldctReports.length} Uploaded
                      </Badge>
                    )}
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Upload LDCT Report</DialogTitle>
                    <DialogDescription>
                      Upload your Low-Dose CT scan report with findings and Lung-RADS score
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleUploadLDCT} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="scanDate">Scan Date *</Label>
                      <Input id="scanDate" name="scanDate" type="date" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="clinicalHistory">Clinical History</Label>
                      <Textarea id="clinicalHistory" name="clinicalHistory" placeholder="Patient history..." />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="findings">Findings *</Label>
                      <Textarea id="findings" name="findings" placeholder="CT scan findings..." required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="impression">Impression *</Label>
                      <Textarea id="impression" name="impression" placeholder="Radiologist impression..." required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lungRADS">Lung-RADS Score *</Label>
                      <Input id="lungRADS" name="lungRADS" type="number" min="0" max="4" required />
                      <p className="text-xs text-muted-foreground">0=Incomplete, 1=Negative, 2=Benign, 3=Probably Benign, 4=Suspicious</p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="recommendation">Recommendation *</Label>
                      <Textarea id="recommendation" name="recommendation" placeholder="Follow-up recommendations..." required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="radiologistName">Radiologist Name</Label>
                      <Input id="radiologistName" name="radiologistName" placeholder="Dr. Name" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="file">Upload PDF/Image (Optional)</Label>
                      <Input 
                        id="file" 
                        type="file" 
                        accept=".pdf,image/*"
                        onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                      />
                    </div>
                    <div className="flex gap-2 justify-end">
                      <Button type="button" variant="outline" onClick={() => setUploadDialogOpen(null)}>
                        Cancel
                      </Button>
                      <Button type="submit" disabled={uploadLoading}>
                        {uploadLoading ? 'Uploading...' : 'Upload Report'}
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>

              {/* Placeholder buttons for other report types */}
              <Button
                variant="outline"
                className="h-auto py-6 flex flex-col items-center gap-2"
                onClick={() => toast({ title: 'Coming Soon', description: 'Pathology report upload will be available soon' })}
              >
                <Upload className="h-5 w-5" />
                <div className="text-center">
                  <p className="font-medium">Pathology Report</p>
                  <p className="text-xs text-muted-foreground">Biopsy Results</p>
                </div>
              </Button>

              <Button
                variant="outline"
                className="h-auto py-6 flex flex-col items-center gap-2"
                onClick={() => toast({ title: 'Coming Soon', description: 'Biomarker report upload will be available soon' })}
              >
                <Upload className="h-5 w-5" />
                <div className="text-center">
                  <p className="font-medium">Biomarker Report</p>
                  <p className="text-xs text-muted-foreground">Molecular Testing</p>
                </div>
              </Button>

              <Button
                variant="outline"
                className="h-auto py-6 flex flex-col items-center gap-2"
                onClick={() => toast({ title: 'Coming Soon', description: 'Staging report upload will be available soon' })}
              >
                <Upload className="h-5 w-5" />
                <div className="text-center">
                  <p className="font-medium">Staging Report</p>
                  <p className="text-xs text-muted-foreground">PET-CT / Staging</p>
                </div>
              </Button>
            </div>

            {assessment.ldctReports && assessment.ldctReports.length > 0 && (
              <>
                <Separator />
                <div className="space-y-2">
                  <h4 className="font-medium">Latest LDCT Results</h4>
                  <div className="bg-muted p-4 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Lung-RADS Score:</span>
                      <Badge variant={assessment.ldctReports[0].lung_rads >= 3 ? "destructive" : "default"}>
                        {assessment.ldctReports[0].lung_rads}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {interpretLungRADS(assessment.ldctReports[0].lung_rads).description}
                    </p>
                    <p className="text-sm mt-2">
                      <span className="font-medium">Recommendation:</span> {assessment.ldctReports[0].recommendation}
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">
                      Scan Date: {new Date(assessment.ldctReports[0].scan_date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex gap-4">
          <Button
            variant="outline"
            onClick={() => navigate('/lung-cancer/new')}
            className="flex-1"
          >
            New Assessment
          </Button>
          <Button
            onClick={() => window.print()}
            className="flex-1"
          >
            Print Results
          </Button>
        </div>
      </div>
    </div>
  );
}
