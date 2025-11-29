import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { lungCancerApi } from '@/lib/lungCancerApi';
import { calculatePackYears, assessScreeningEligibility, calculateRiskScore, getRiskLevel } from '@/lib/lungCancerUtils';
import type { LungCancerFormData, LungCancerAssessment } from '@/types/lungCancer';
import { ArrowLeft, ArrowRight, AlertCircle, CheckCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function LungCancerScreening() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<LungCancerFormData>({
    demographics: {},
    smokingHistory: {},
    medicalHistory: {},
    environmentalExposures: {},
    symptoms: {},
  });

  const totalSteps = 5;
  const progress = (step / totalSteps) * 100;

  const updateFormData = (section: keyof LungCancerFormData, data: any) => {
    setFormData(prev => ({
      ...prev,
      [section]: { ...prev[section], ...data },
    }));
  };

  const handleNext = () => {
    // Validate current step before proceeding
    if (step === 1) {
      if (!formData.demographics.age || !formData.demographics.sex) {
        toast({
          title: 'Required Fields',
          description: 'Please fill in your age and sex',
          variant: 'destructive',
        });
        return;
      }
    }
    
    if (step === 2) {
      if (!formData.smokingHistory.smokingStatus) {
        toast({
          title: 'Required Fields',
          description: 'Please select your smoking status',
          variant: 'destructive',
        });
        return;
      }
    }
    
    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      // Validate required fields
      if (!formData.demographics.age || !formData.demographics.sex) {
        toast({
          title: 'Validation Error',
          description: 'Demographics information is required',
          variant: 'destructive',
        });
        setLoading(false);
        setStep(1);
        return;
      }

      if (!formData.smokingHistory.smokingStatus) {
        toast({
          title: 'Validation Error',
          description: 'Smoking status is required',
          variant: 'destructive',
        });
        setLoading(false);
        setStep(2);
        return;
      }

      // Calculate pack-years
      const packYears = calculatePackYears(
        Number(formData.smokingHistory.packsPerDay) || 0,
        Number(formData.smokingHistory.yearsSmoked) || 0
      );

      const age = Number(formData.demographics.age);
      if (isNaN(age) || age < 1 || age > 120) {
        toast({
          title: 'Invalid Age',
          description: 'Please enter a valid age',
          variant: 'destructive',
        });
        setLoading(false);
        setStep(1);
        return;
      }

      // Build complete assessment
      const assessment: Partial<LungCancerAssessment> = {
        demographics: {
          age: age,
          sex: formData.demographics.sex,
        },
        smokingHistory: {
          packsPerDay: Number(formData.smokingHistory.packsPerDay) || 0,
          yearsSmoked: Number(formData.smokingHistory.yearsSmoked) || 0,
          packYears,
          smokingStatus: formData.smokingHistory.smokingStatus || 'never',
          yearsQuit: formData.smokingHistory.yearsQuit ? Number(formData.smokingHistory.yearsQuit) : undefined,
        },
        medicalHistory: {
          hasLungDisease: formData.medicalHistory.hasLungDisease || false,
          lungDiseaseTypes: formData.medicalHistory.lungDiseaseTypes || [],
          hasChestRadiation: formData.medicalHistory.hasChestRadiation || false,
          hasFamilyHistory: formData.medicalHistory.hasFamilyHistory || false,
          familyHistoryDetails: formData.medicalHistory.familyHistoryDetails,
        },
        environmentalExposures: {
          radonExposure: formData.environmentalExposures.radonExposure || false,
          asbestosExposure: formData.environmentalExposures.asbestosExposure || false,
          airPollutionExposure: formData.environmentalExposures.airPollutionExposure || false,
          secondhandSmokeExposure: formData.environmentalExposures.secondhandSmokeExposure || false,
          exposureDetails: formData.environmentalExposures.exposureDetails,
        },
        symptoms: {
          persistentCough: formData.symptoms.persistentCough || false,
          shortnessOfBreath: formData.symptoms.shortnessOfBreath || false,
          chestPain: formData.symptoms.chestPain || false,
          unexplainedWeightLoss: formData.symptoms.unexplainedWeightLoss || false,
          hemoptysis: formData.symptoms.hemoptysis || false,
          otherSymptoms: formData.symptoms.otherSymptoms,
        },
        eligibility: assessScreeningEligibility(
          {
            age: Number(formData.demographics.age),
            sex: formData.demographics.sex || 'other',
          },
          {
            packsPerDay: Number(formData.smokingHistory.packsPerDay) || 0,
            yearsSmoked: Number(formData.smokingHistory.yearsSmoked) || 0,
            packYears,
            smokingStatus: formData.smokingHistory.smokingStatus || 'never',
            yearsQuit: formData.smokingHistory.yearsQuit ? Number(formData.smokingHistory.yearsQuit) : undefined,
          }
        ),
        status: 'screening-eligible',
      };

      const result = await lungCancerApi.createAssessment(assessment);

      if (result.error) {
        toast({
          title: 'Error',
          description: typeof result.error === 'string' ? result.error : 'Failed to submit assessment',
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Assessment Complete',
          description: 'Your lung cancer risk assessment has been saved.',
        });
        navigate(`/lung-cancer/results/${result.data?.id}`);
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to submit assessment',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container max-w-3xl mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Lung Cancer Screening Assessment</h1>
        <p className="text-muted-foreground">
          Help us assess your eligibility for lung cancer screening based on USPSTF guidelines
        </p>
        <Progress value={progress} className="mt-4" />
        <p className="text-sm text-muted-foreground mt-2">
          Step {step} of {totalSteps}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            {step === 1 && 'Demographics'}
            {step === 2 && 'Smoking History'}
            {step === 3 && 'Medical History'}
            {step === 4 && 'Environmental Exposures'}
            {step === 5 && 'Current Symptoms'}
          </CardTitle>
          <CardDescription>
            {step === 1 && 'Basic information about yourself'}
            {step === 2 && 'Your smoking history is critical for risk assessment'}
            {step === 3 && 'Previous health conditions and family history'}
            {step === 4 && 'Exposure to environmental carcinogens'}
            {step === 5 && 'Any symptoms you may be experiencing'}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Step 1: Demographics */}
          {step === 1 && (
            <>
              <div className="space-y-2">
                <Label htmlFor="age">Age *</Label>
                <Input
                  id="age"
                  type="number"
                  min="18"
                  max="120"
                  value={formData.demographics.age || ''}
                  onChange={(e) => updateFormData('demographics', { age: e.target.value })}
                  placeholder="Enter your age"
                  required
                />
                <p className="text-sm text-muted-foreground">
                  Screening is typically recommended for ages 50-80
                </p>
              </div>

              <div className="space-y-2">
                <Label>Sex *</Label>
                <RadioGroup
                  value={formData.demographics.sex}
                  onValueChange={(value) => updateFormData('demographics', { sex: value })}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="male" id="male" />
                    <Label htmlFor="male" className="font-normal">Male</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="female" id="female" />
                    <Label htmlFor="female" className="font-normal">Female</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="other" id="other" />
                    <Label htmlFor="other" className="font-normal">Other</Label>
                  </div>
                </RadioGroup>
              </div>
            </>
          )}

          {/* Step 2: Smoking History */}
          {step === 2 && (
            <>
              <div className="space-y-2">
                <Label>Smoking Status *</Label>
                <RadioGroup
                  value={formData.smokingHistory.smokingStatus}
                  onValueChange={(value) => updateFormData('smokingHistory', { smokingStatus: value })}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="current" id="current" />
                    <Label htmlFor="current" className="font-normal">Current Smoker</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="former" id="former" />
                    <Label htmlFor="former" className="font-normal">Former Smoker</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="never" id="never" />
                    <Label htmlFor="never" className="font-normal">Never Smoked</Label>
                  </div>
                </RadioGroup>
              </div>

              {formData.smokingHistory.smokingStatus !== 'never' && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="packsPerDay">Packs Per Day *</Label>
                    <Input
                      id="packsPerDay"
                      type="number"
                      step="0.1"
                      min="0"
                      value={formData.smokingHistory.packsPerDay || ''}
                      onChange={(e) => updateFormData('smokingHistory', { packsPerDay: e.target.value })}
                      placeholder="e.g., 1.5"
                    />
                    <p className="text-sm text-muted-foreground">
                      One pack = 20 cigarettes
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="yearsSmoked">Years Smoked *</Label>
                    <Input
                      id="yearsSmoked"
                      type="number"
                      min="0"
                      value={formData.smokingHistory.yearsSmoked || ''}
                      onChange={(e) => updateFormData('smokingHistory', { yearsSmoked: e.target.value })}
                      placeholder="e.g., 20"
                    />
                  </div>

                  {formData.smokingHistory.packsPerDay && formData.smokingHistory.yearsSmoked && (
                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>Pack-Year Calculation</AlertTitle>
                      <AlertDescription>
                        Your pack-year history: {calculatePackYears(
                          Number(formData.smokingHistory.packsPerDay),
                          Number(formData.smokingHistory.yearsSmoked)
                        )} pack-years
                        <br />
                        <span className="text-xs">
                          (Screening requires ≥20 pack-years)
                        </span>
                      </AlertDescription>
                    </Alert>
                  )}
                </>
              )}

              {formData.smokingHistory.smokingStatus === 'former' && (
                <div className="space-y-2">
                  <Label htmlFor="yearsQuit">Years Since Quit *</Label>
                  <Input
                    id="yearsQuit"
                    type="number"
                    min="0"
                    value={formData.smokingHistory.yearsQuit || ''}
                    onChange={(e) => updateFormData('smokingHistory', { yearsQuit: e.target.value })}
                    placeholder="e.g., 5"
                  />
                  <p className="text-sm text-muted-foreground">
                    Screening recommended if quit within last 15 years
                  </p>
                </div>
              )}
            </>
          )}

          {/* Step 3: Medical History */}
          {step === 3 && (
            <>
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="hasLungDisease"
                    checked={formData.medicalHistory.hasLungDisease}
                    onCheckedChange={(checked) => 
                      updateFormData('medicalHistory', { hasLungDisease: checked })
                    }
                  />
                  <Label htmlFor="hasLungDisease" className="font-normal">
                    History of lung disease (COPD, emphysema, etc.)
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="hasChestRadiation"
                    checked={formData.medicalHistory.hasChestRadiation}
                    onCheckedChange={(checked) => 
                      updateFormData('medicalHistory', { hasChestRadiation: checked })
                    }
                  />
                  <Label htmlFor="hasChestRadiation" className="font-normal">
                    Previous radiation therapy to the chest
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="hasFamilyHistory"
                    checked={formData.medicalHistory.hasFamilyHistory}
                    onCheckedChange={(checked) => 
                      updateFormData('medicalHistory', { hasFamilyHistory: checked })
                    }
                  />
                  <Label htmlFor="hasFamilyHistory" className="font-normal">
                    Family history of lung cancer
                  </Label>
                </div>

                {formData.medicalHistory.hasFamilyHistory && (
                  <div className="space-y-2 ml-6">
                    <Label htmlFor="familyHistoryDetails">Details (optional)</Label>
                    <Textarea
                      id="familyHistoryDetails"
                      value={formData.medicalHistory.familyHistoryDetails || ''}
                      onChange={(e) => 
                        updateFormData('medicalHistory', { familyHistoryDetails: e.target.value })
                      }
                      placeholder="e.g., Father diagnosed at age 65"
                      rows={3}
                    />
                  </div>
                )}
              </div>
            </>
          )}

          {/* Step 4: Environmental Exposures */}
          {step === 4 && (
            <>
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="radonExposure"
                    checked={formData.environmentalExposures.radonExposure}
                    onCheckedChange={(checked) => 
                      updateFormData('environmentalExposures', { radonExposure: checked })
                    }
                  />
                  <Label htmlFor="radonExposure" className="font-normal">
                    Radon exposure
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="asbestosExposure"
                    checked={formData.environmentalExposures.asbestosExposure}
                    onCheckedChange={(checked) => 
                      updateFormData('environmentalExposures', { asbestosExposure: checked })
                    }
                  />
                  <Label htmlFor="asbestosExposure" className="font-normal">
                    Asbestos exposure
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="airPollutionExposure"
                    checked={formData.environmentalExposures.airPollutionExposure}
                    onCheckedChange={(checked) => 
                      updateFormData('environmentalExposures', { airPollutionExposure: checked })
                    }
                  />
                  <Label htmlFor="airPollutionExposure" className="font-normal">
                    Significant air pollution exposure
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="secondhandSmokeExposure"
                    checked={formData.environmentalExposures.secondhandSmokeExposure}
                    onCheckedChange={(checked) => 
                      updateFormData('environmentalExposures', { secondhandSmokeExposure: checked })
                    }
                  />
                  <Label htmlFor="secondhandSmokeExposure" className="font-normal">
                    Secondhand smoke exposure
                  </Label>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="exposureDetails">Additional Details (optional)</Label>
                  <Textarea
                    id="exposureDetails"
                    value={formData.environmentalExposures.exposureDetails || ''}
                    onChange={(e) => 
                      updateFormData('environmentalExposures', { exposureDetails: e.target.value })
                    }
                    placeholder="e.g., Worked in construction for 20 years"
                    rows={3}
                  />
                </div>
              </div>
            </>
          )}

          {/* Step 5: Symptoms */}
          {step === 5 && (
            <>
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Important Note</AlertTitle>
                <AlertDescription>
                  Screening is for asymptomatic individuals. If you have concerning symptoms, 
                  please consult your healthcare provider immediately for diagnostic evaluation.
                </AlertDescription>
              </Alert>

              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="persistentCough"
                    checked={formData.symptoms.persistentCough}
                    onCheckedChange={(checked) => 
                      updateFormData('symptoms', { persistentCough: checked })
                    }
                  />
                  <Label htmlFor="persistentCough" className="font-normal">
                    Persistent cough (lasting more than 2-3 weeks)
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="shortnessOfBreath"
                    checked={formData.symptoms.shortnessOfBreath}
                    onCheckedChange={(checked) => 
                      updateFormData('symptoms', { shortnessOfBreath: checked })
                    }
                  />
                  <Label htmlFor="shortnessOfBreath" className="font-normal">
                    Shortness of breath
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="chestPain"
                    checked={formData.symptoms.chestPain}
                    onCheckedChange={(checked) => 
                      updateFormData('symptoms', { chestPain: checked })
                    }
                  />
                  <Label htmlFor="chestPain" className="font-normal">
                    Chest pain
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="unexplainedWeightLoss"
                    checked={formData.symptoms.unexplainedWeightLoss}
                    onCheckedChange={(checked) => 
                      updateFormData('symptoms', { unexplainedWeightLoss: checked })
                    }
                  />
                  <Label htmlFor="unexplainedWeightLoss" className="font-normal">
                    Unexplained weight loss
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="hemoptysis"
                    checked={formData.symptoms.hemoptysis}
                    onCheckedChange={(checked) => 
                      updateFormData('symptoms', { hemoptysis: checked })
                    }
                  />
                  <Label htmlFor="hemoptysis" className="font-normal">
                    Coughing up blood (hemoptysis)
                  </Label>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="otherSymptoms">Other Symptoms (optional)</Label>
                  <Textarea
                    id="otherSymptoms"
                    value={formData.symptoms.otherSymptoms || ''}
                    onChange={(e) => 
                      updateFormData('symptoms', { otherSymptoms: e.target.value })
                    }
                    placeholder="Describe any other symptoms"
                    rows={3}
                  />
                </div>
              </div>
            </>
          )}
        </CardContent>

        <CardFooter className="flex justify-between">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={step === 1}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>

          <Button onClick={handleNext} disabled={loading}>
            {step === totalSteps ? (
              <>
                <CheckCircle className="mr-2 h-4 w-4" />
                {loading ? 'Submitting...' : 'Complete Assessment'}
              </>
            ) : (
              <>
                Next
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
