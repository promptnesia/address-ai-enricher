import { useState, useEffect } from "react";
import { ApiKeyInput } from "@/components/ApiKeyInput";
import { CsvUpload } from "@/components/CsvUpload";
import { ColumnMapper } from "@/components/ColumnMapper";
import { DataPreview } from "@/components/DataPreview";
import { ProcessingStatus } from "@/components/ProcessingStatus";
import { ResultsDownload } from "@/components/ResultsDownload";
import { MapPin, Sparkles } from "lucide-react";

type Step = 'api-key' | 'upload' | 'mapping' | 'preview' | 'processing' | 'results';

const Index = () => {
  const [currentStep, setCurrentStep] = useState<Step>('api-key');
  const [apiKey, setApiKey] = useState('');
  const [csvData, setCsvData] = useState<any[]>([]);
  const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
  const [columnMapping, setColumnMapping] = useState<{alamat: string; kecamatan: string; kelurahan: string}>({
    alamat: '', kecamatan: '', kelurahan: ''
  });
  const [enrichedData, setEnrichedData] = useState<any[]>([]);

  // Load API key from localStorage on component mount
  useEffect(() => {
    const savedApiKey = localStorage.getItem('openai-api-key');
    if (savedApiKey) {
      setApiKey(savedApiKey);
      setCurrentStep('upload');
    }
  }, []);

  const handleApiKeySet = (key: string) => {
    setApiKey(key);
    localStorage.setItem('openai-api-key', key);
    setCurrentStep('upload');
  };

  const handleFileUpload = (data: any[], headers: string[]) => {
    setCsvData(data);
    setCsvHeaders(headers);
    setCurrentStep('mapping');
  };

  const handleMappingComplete = (mapping: {alamat: string; kecamatan: string; kelurahan: string}) => {
    setColumnMapping(mapping);
    setCurrentStep('preview');
  };

  const handleStartProcessing = () => {
    setCurrentStep('processing');
  };

  const handleProcessingComplete = (data: any[]) => {
    setEnrichedData(data);
    setCurrentStep('results');
  };

  const handleReset = () => {
    setCsvData([]);
    setCsvHeaders([]);
    setColumnMapping({alamat: '', kecamatan: '', kelurahan: ''});
    setEnrichedData([]);
    setCurrentStep('upload');
  };

  const steps = [
    { id: 'api-key', title: 'API Key', completed: !!apiKey },
    { id: 'upload', title: 'Upload CSV', completed: csvData.length > 0 },
    { id: 'mapping', title: 'Column Mapping', completed: !!columnMapping.alamat },
    { id: 'preview', title: 'Preview', completed: currentStep !== 'preview' && !!columnMapping.alamat },
    { id: 'processing', title: 'AI Processing', completed: enrichedData.length > 0 },
    { id: 'results', title: 'Results', completed: false }
  ];

  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Header */}
      <div className="bg-gradient-primary text-primary-foreground shadow-elegant">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
              <MapPin className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Address AI Enricher</h1>
              <p className="opacity-90">Enrich alamat dengan data kecamatan dan kelurahan menggunakan AI</p>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8 overflow-x-auto">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div className="flex flex-col items-center min-w-0">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-200 ${
                  step.completed 
                    ? 'bg-success text-success-foreground shadow-glow' 
                    : currentStep === step.id 
                      ? 'bg-gradient-primary text-primary-foreground shadow-elegant' 
                      : 'bg-muted text-muted-foreground'
                }`}>
                  {step.completed ? '✓' : index + 1}
                </div>
                <span className={`text-xs mt-2 text-center ${
                  currentStep === step.id ? 'text-primary font-medium' : 'text-muted-foreground'
                }`}>
                  {step.title}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div className={`h-px w-16 mx-4 transition-colors duration-200 ${
                  step.completed ? 'bg-success' : 'bg-border'
                }`} />
              )}
            </div>
          ))}
        </div>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto">
          {currentStep === 'api-key' && (
            <ApiKeyInput onApiKeySet={handleApiKeySet} isValid={!!apiKey} />
          )}
          
          {currentStep === 'upload' && (
            <CsvUpload onFileUpload={handleFileUpload} />
          )}
          
          {currentStep === 'mapping' && (
            <ColumnMapper headers={csvHeaders} onMappingComplete={handleMappingComplete} />
          )}
          
          {currentStep === 'preview' && (
            <DataPreview 
              data={csvData} 
              headers={csvHeaders} 
              mapping={columnMapping}
              onStartProcessing={handleStartProcessing}
            />
          )}
          
          {currentStep === 'processing' && (
            <ProcessingStatus 
              data={csvData}
              mapping={columnMapping}
              apiKey={apiKey}
              onProcessingComplete={handleProcessingComplete}
            />
          )}
          
          {currentStep === 'results' && (
            <ResultsDownload 
              enrichedData={enrichedData}
              originalHeaders={csvHeaders}
              mapping={columnMapping}
              onReset={handleReset}
            />
          )}
        </div>

        {/* Footer */}
        <div className="text-center mt-16 p-6 border-t">
          <div className="flex items-center justify-center gap-2 text-muted-foreground">
            <Sparkles className="w-4 h-4" />
            <span className="text-sm">Powered by OpenAI GPT-4o-mini</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
