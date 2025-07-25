import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Loader2, CheckCircle, AlertCircle, Download, Brain, Zap } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ProcessingStatusProps {
  data: any[];
  mapping: { alamat: string; kecamatan: string; kelurahan: string };
  apiKey: string;
  onProcessingComplete: (enrichedData: any[]) => void;
}

interface ProcessingLog {
  batch: number;
  status: 'pending' | 'processing' | 'completed' | 'error';
  addresses: string[];
  result?: any;
  error?: string;
}

export const ProcessingStatus = ({ data, mapping, apiKey, onProcessingComplete }: ProcessingStatusProps) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentBatch, setCurrentBatch] = useState(0);
  const [logs, setLogs] = useState<ProcessingLog[]>([]);
  const [enrichedData, setEnrichedData] = useState<any[]>([]);
  const { toast } = useToast();

  const validAddresses = data.filter(row => row[mapping.alamat] && row[mapping.alamat].trim() !== '');
  const totalBatches = Math.ceil(validAddresses.length / 10);

  useEffect(() => {
    if (isProcessing) {
      startProcessing();
    }
  }, [isProcessing]);

  const startProcessing = async () => {
    // Initialize enriched data with original data
    let workingData = [...data];
    
    // Clear existing values in Kecamatan and Kelurahan columns
    workingData = workingData.map(row => ({
      ...row,
      [mapping.kecamatan]: '',
      [mapping.kelurahan]: ''
    }));

    setEnrichedData(workingData);
    
    // Create batches
    const batches: ProcessingLog[] = [];
    for (let i = 0; i < validAddresses.length; i += 10) {
      const batchAddresses = validAddresses.slice(i, i + 10);
      batches.push({
        batch: Math.floor(i / 10) + 1,
        status: 'pending',
        addresses: batchAddresses.map(row => row[mapping.alamat])
      });
    }
    
    setLogs(batches);

    // Process each batch
    for (let i = 0; i < batches.length; i++) {
      setCurrentBatch(i + 1);
      
      // Update log status to processing
      setLogs(prev => prev.map(log => 
        log.batch === i + 1 ? { ...log, status: 'processing' } : log
      ));

      try {
        const batchData = validAddresses.slice(i * 10, (i + 1) * 10);
        const batchInput = batchData.map(row => ({
          conversation_id: row.conversation_id,
          alamat: row[mapping.alamat]
        }));

        const result = await callOpenAI(batchInput);
        
        // Update enriched data with results
        setEnrichedData(prev => {
          const updated = [...prev];
          result.forEach((item: any) => {
            const index = updated.findIndex(row => row.conversation_id === item.conversation_id);
            if (index !== -1) {
              updated[index][mapping.kecamatan] = item.kecamatan || '';
              updated[index][mapping.kelurahan] = item.kelurahan || '';
            }
          });
          return updated;
        });

        // Update log status to completed
        setLogs(prev => prev.map(log => 
          log.batch === i + 1 ? { ...log, status: 'completed', result } : log
        ));

        toast({
          title: `Batch ${i + 1} selesai`,
          description: `${result.length} alamat berhasil diproses`,
        });

      } catch (error) {
        // Update log status to error
        setLogs(prev => prev.map(log => 
          log.batch === i + 1 ? { 
            ...log, 
            status: 'error', 
            error: error instanceof Error ? error.message : 'Unknown error'
          } : log
        ));

        toast({
          title: `Batch ${i + 1} gagal`,
          description: "Terjadi error saat memproses batch ini",
          variant: "destructive"
        });
      }

      setProgress(((i + 1) / batches.length) * 100);
      
      // Add delay between batches to avoid rate limiting
      if (i < batches.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    setIsProcessing(false);
    onProcessingComplete(enrichedData);
  };

  const callOpenAI = async (batchData: any[]) => {
    const prompt = `
Ekstrak informasi Kecamatan dan Desa/Kelurahan dari alamat berikut. Berikan response dalam format JSON array.

Data alamat:
${JSON.stringify(batchData, null, 2)}

Response format:
[
  {
    "conversation_id": "id",
    "kecamatan": "nama kecamatan",
    "kelurahan": "nama desa/kelurahan"
  }
]

Jika tidak dapat diekstrak, kosongkan field tersebut. Pastikan response valid JSON.
    `;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'Anda adalah asisten yang ahli dalam ekstraksi informasi alamat Indonesia. Berikan response dalam format JSON yang valid.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.1
      })
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    
    try {
      return JSON.parse(content);
    } catch (e) {
      throw new Error('Invalid JSON response from OpenAI');
    }
  };

  const getStatusIcon = (status: ProcessingLog['status']) => {
    switch (status) {
      case 'pending':
        return <div className="w-4 h-4 rounded-full bg-muted" />;
      case 'processing':
        return <Loader2 className="w-4 h-4 animate-spin text-primary" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-success" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-destructive" />;
    }
  };

  return (
    <Card className="animate-fade-in">
      <CardHeader className="text-center">
        <div className="mx-auto w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center mb-4">
          <Brain className="w-6 h-6 text-primary-foreground" />
        </div>
        <CardTitle className="text-2xl">AI Processing</CardTitle>
        <CardDescription>
          Memproses {validAddresses.length} alamat dengan OpenAI
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {!isProcessing && (
          <div className="text-center space-y-4">
            <div className="p-6 bg-gradient-subtle rounded-lg border">
              <Zap className="w-12 h-12 mx-auto mb-4 text-accent" />
              <h3 className="text-lg font-semibold mb-2">Siap Memulai Processing</h3>
              <p className="text-muted-foreground mb-4">
                {validAddresses.length} alamat akan diproses dalam {totalBatches} batch
              </p>
              <Button onClick={() => setIsProcessing(true)} className="w-full">
                <Brain className="w-4 h-4 mr-2" />
                Mulai AI Processing
              </Button>
            </div>
          </div>
        )}

        {isProcessing && (
          <>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span>Progress: Batch {currentBatch} dari {totalBatches}</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="h-3" />
            </div>

            <div className="space-y-3 max-h-60 overflow-y-auto">
              {logs.map((log) => (
                <div key={log.batch} className="flex items-center justify-between p-3 bg-gradient-card rounded-lg border">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(log.status)}
                    <div>
                      <p className="font-medium">Batch {log.batch}</p>
                      <p className="text-sm text-muted-foreground">
                        {log.addresses.length} alamat
                      </p>
                    </div>
                  </div>
                  <Badge 
                    variant={
                      log.status === 'completed' ? 'default' : 
                      log.status === 'error' ? 'destructive' : 
                      'secondary'
                    }
                  >
                    {log.status === 'pending' ? 'Menunggu' :
                     log.status === 'processing' ? 'Proses' :
                     log.status === 'completed' ? 'Selesai' : 'Error'}
                  </Badge>
                </div>
              ))}
            </div>
          </>
        )}

        {!isProcessing && logs.length > 0 && (
          <div className="text-center space-y-4">
            <div className="p-4 bg-success/10 border border-success/20 rounded-lg">
              <CheckCircle className="w-8 h-8 mx-auto mb-2 text-success" />
              <h3 className="font-semibold text-success">Processing Selesai!</h3>
              <p className="text-sm text-success/80">
                {logs.filter(l => l.status === 'completed').length} dari {logs.length} batch berhasil diproses
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};