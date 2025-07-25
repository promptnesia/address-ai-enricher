import { useState, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, FileText, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface CsvUploadProps {
  onFileUpload: (data: any[], headers: string[]) => void;
}

export const CsvUpload = ({ onFileUpload }: CsvUploadProps) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const parseCSV = (text: string) => {
    const lines = text.split('\n').filter(line => line.trim());
    if (lines.length === 0) return { headers: [], data: [] };

    const headers = lines[0].split(',').map(h => h.trim().replace(/['"]/g, ''));
    const data = lines.slice(1).map(line => {
      const values = line.split(',').map(v => v.trim().replace(/['"]/g, ''));
      const row: any = {};
      headers.forEach((header, index) => {
        row[header] = values[index] || '';
      });
      return row;
    });

    return { headers, data };
  };

  const handleFile = useCallback(async (file: File) => {
    if (!file.name.endsWith('.csv')) {
      toast({
        title: "Format file tidak valid",
        description: "Harap upload file CSV (.csv)",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);
    try {
      const text = await file.text();
      const { headers, data } = parseCSV(text);

      if (!headers.includes('conversation_id')) {
        toast({
          title: "Kolom conversation_id tidak ditemukan",
          description: "CSV harus memiliki kolom 'conversation_id'",
          variant: "destructive"
        });
        return;
      }

      onFileUpload(data, headers);
      toast({
        title: "File berhasil diupload",
        description: `${data.length} baris data berhasil dimuat`,
        variant: "default"
      });
    } catch (error) {
      toast({
        title: "Error parsing CSV",
        description: "Gagal membaca file CSV. Pastikan format file benar.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  }, [onFileUpload, toast]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  }, [handleFile]);

  return (
    <Card className="animate-fade-in">
      <CardHeader className="text-center">
        <div className="mx-auto w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center mb-4">
          <FileText className="w-6 h-6 text-primary-foreground" />
        </div>
        <CardTitle className="text-2xl">Upload CSV File</CardTitle>
        <CardDescription>
          Upload file CSV yang berisi data alamat untuk di-enrich
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200 ${
            isDragOver 
              ? 'border-primary bg-primary/5 shadow-glow' 
              : 'border-muted hover:border-primary/50'
          } ${isProcessing ? 'opacity-50 pointer-events-none' : ''}`}
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          onDragEnter={() => setIsDragOver(true)}
          onDragLeave={() => setIsDragOver(false)}
        >
          <Upload className={`mx-auto w-12 h-12 mb-4 transition-colors duration-200 ${
            isDragOver ? 'text-primary' : 'text-muted-foreground'
          }`} />
          <p className="text-lg font-medium mb-2">
            {isProcessing ? "Memproses file..." : "Drop CSV file di sini"}
          </p>
          <p className="text-muted-foreground mb-4">
            atau
          </p>
          <Button variant="outline" asChild disabled={isProcessing}>
            <label className="cursor-pointer">
              Pilih File
              <input
                type="file"
                accept=".csv"
                onChange={handleFileSelect}
                className="hidden"
              />
            </label>
          </Button>
        </div>
        
        <div className="mt-6 p-4 bg-muted/50 rounded-lg">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
            <div className="text-sm space-y-1">
              <p className="font-medium">Persyaratan file CSV:</p>
              <ul className="text-muted-foreground space-y-1 ml-4">
                <li>• Harus memiliki kolom 'conversation_id' sebagai unique key</li>
                <li>• Kolom alamat, 'Kecamatan', dan 'Desa / Kelurahan'</li>
                <li>• Format encoding UTF-8</li>
              </ul>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};