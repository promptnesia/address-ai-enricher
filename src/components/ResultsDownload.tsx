import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Download, FileCheck, RotateCcw, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ResultsDownloadProps {
  enrichedData: any[];
  originalHeaders: string[];
  mapping: { alamat: string; kecamatan: string; kelurahan: string };
  onReset: () => void;
}

export const ResultsDownload = ({ enrichedData, originalHeaders, mapping, onReset }: ResultsDownloadProps) => {
  const { toast } = useToast();

  const enrichedCount = enrichedData.filter(row => 
    row[mapping.kecamatan] && row[mapping.kecamatan].trim() !== '' &&
    row[mapping.kelurahan] && row[mapping.kelurahan].trim() !== ''
  ).length;

  const downloadCSV = () => {
    try {
      // Create CSV content
      const csvHeaders = originalHeaders.join(',');
      const csvRows = enrichedData.map(row => 
        originalHeaders.map(header => `"${row[header] || ''}"`).join(',')
      );
      
      const csvContent = [csvHeaders, ...csvRows].join('\n');
      
      // Create and download file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      
      link.setAttribute('href', url);
      link.setAttribute('download', `enriched_addresses_${new Date().toISOString().slice(0, 10)}.csv`);
      link.style.visibility = 'hidden';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: "Download berhasil",
        description: "File CSV yang sudah di-enrich berhasil didownload",
      });
    } catch (error) {
      toast({
        title: "Download gagal",
        description: "Terjadi error saat mendownload file",
        variant: "destructive"
      });
    }
  };

  return (
    <Card className="animate-fade-in">
      <CardHeader className="text-center">
        <div className="mx-auto w-12 h-12 bg-success rounded-full flex items-center justify-center mb-4">
          <CheckCircle2 className="w-6 h-6 text-success-foreground" />
        </div>
        <CardTitle className="text-2xl">Enrichment Selesai</CardTitle>
        <CardDescription>
          Data alamat telah berhasil di-enrich dengan informasi kecamatan dan kelurahan
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Summary Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-gradient-card rounded-lg border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Data</p>
                <p className="text-2xl font-bold">{enrichedData.length}</p>
              </div>
              <FileCheck className="w-8 h-8 text-primary" />
            </div>
          </div>
          
          <div className="p-4 bg-gradient-card rounded-lg border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Berhasil Enriched</p>
                <p className="text-2xl font-bold text-success">{enrichedCount}</p>
              </div>
              <CheckCircle2 className="w-8 h-8 text-success" />
            </div>
          </div>
          
          <div className="p-4 bg-gradient-card rounded-lg border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Success Rate</p>
                <p className="text-2xl font-bold text-accent">
                  {enrichedData.length > 0 ? Math.round((enrichedCount / enrichedData.length) * 100) : 0}%
                </p>
              </div>
              <Badge variant="outline" className="text-accent border-accent">
                Complete
              </Badge>
            </div>
          </div>
        </div>

        {/* Sample Results */}
        <div className="space-y-3">
          <h4 className="font-medium">Sample Hasil Enrichment:</h4>
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Conversation ID</TableHead>
                  <TableHead>Alamat</TableHead>
                  <TableHead>Kecamatan</TableHead>
                  <TableHead>Kelurahan</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {enrichedData.slice(0, 5).map((row, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-mono text-sm">
                      {row.conversation_id}
                    </TableCell>
                    <TableCell className="max-w-48 truncate">
                      {row[mapping.alamat] || '-'}
                    </TableCell>
                    <TableCell>
                      {row[mapping.kecamatan] || '-'}
                    </TableCell>
                    <TableCell>
                      {row[mapping.kelurahan] || '-'}
                    </TableCell>
                    <TableCell>
                      {row[mapping.kecamatan] && row[mapping.kelurahan] ? (
                        <Badge variant="default" className="bg-success">Enriched</Badge>
                      ) : (
                        <Badge variant="secondary">Original</Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          {enrichedData.length > 5 && (
            <p className="text-sm text-muted-foreground text-center">
              Dan {enrichedData.length - 5} baris data lainnya...
            </p>
          )}
        </div>

        {/* Download Section */}
        <div className="p-6 bg-gradient-subtle rounded-lg border space-y-4">
          <div className="text-center">
            <Download className="w-12 h-12 mx-auto mb-3 text-success" />
            <h3 className="text-lg font-semibold mb-2">Download Hasil</h3>
            <p className="text-muted-foreground mb-4">
              File CSV dengan data yang sudah di-enrich siap untuk didownload
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Button 
              onClick={downloadCSV}
              className="w-full"
              size="lg"
            >
              <Download className="w-4 h-4 mr-2" />
              Download CSV
            </Button>
            
            <Button 
              onClick={onReset}
              variant="outline"
              className="w-full"
              size="lg"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Proses Data Baru
            </Button>
          </div>
        </div>

        {/* Processing Info */}
        <div className="p-4 bg-muted/50 rounded-lg">
          <h5 className="font-medium mb-2">Informasi Processing:</h5>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Kolom {mapping.kecamatan} dan {mapping.kelurahan} telah diperbarui</li>
            <li>• Data yang tidak memiliki alamat tetap kosong</li>
            <li>• File hasil menggunakan format CSV UTF-8</li>
            <li>• Semua data asli tetap terjaga</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};