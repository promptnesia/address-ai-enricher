import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Play, Database, AlertCircle, FileCheck } from "lucide-react";

interface DataPreviewProps {
  data: any[];
  headers: string[];
  mapping: { alamat: string; kecamatan: string; kelurahan: string };
  onStartProcessing: () => void;
}

export const DataPreview = ({ data, headers, mapping, onStartProcessing }: DataPreviewProps) => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  const validAddresses = data.filter(row => row[mapping.alamat] && row[mapping.alamat].trim() !== '');
  const totalPages = Math.ceil(data.length / itemsPerPage);
  const currentData = data.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <Card className="animate-fade-in">
      <CardHeader className="text-center">
        <div className="mx-auto w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center mb-4">
          <Database className="w-6 h-6 text-primary-foreground" />
        </div>
        <CardTitle className="text-2xl">Preview Data</CardTitle>
        <CardDescription>
          Periksa data sebelum memulai proses enrichment
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-gradient-card rounded-lg border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Baris</p>
                <p className="text-2xl font-bold">{data.length}</p>
              </div>
              <FileCheck className="w-8 h-8 text-primary" />
            </div>
          </div>
          
          <div className="p-4 bg-gradient-card rounded-lg border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Alamat Valid</p>
                <p className="text-2xl font-bold text-success">{validAddresses.length}</p>
              </div>
              <FileCheck className="w-8 h-8 text-success" />
            </div>
          </div>
          
          <div className="p-4 bg-gradient-card rounded-lg border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Akan Diproses</p>
                <p className="text-2xl font-bold text-accent">{validAddresses.length}</p>
              </div>
              <Play className="w-8 h-8 text-accent" />
            </div>
          </div>
        </div>

        {/* Column Mapping Info */}
        <div className="p-4 bg-muted/50 rounded-lg">
          <h4 className="font-medium mb-3">Mapping Kolom:</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="flex items-center gap-2">
              <Badge variant="outline">Alamat</Badge>
              <span className="text-sm">{mapping.alamat}</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline">Kecamatan</Badge>
              <span className="text-sm">{mapping.kecamatan}</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline">Kelurahan</Badge>
              <span className="text-sm">{mapping.kelurahan}</span>
            </div>
          </div>
        </div>

        {/* Data Table */}
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">No</TableHead>
                {headers.slice(0, 5).map(header => (
                  <TableHead key={header}>
                    {header}
                    {(header === mapping.alamat || header === mapping.kecamatan || header === mapping.kelurahan) && (
                      <Badge variant="secondary" className="ml-2 text-xs">
                        {header === mapping.alamat ? 'Alamat' : header === mapping.kecamatan ? 'Kecamatan' : 'Kelurahan'}
                      </Badge>
                    )}
                  </TableHead>
                ))}
                {headers.length > 5 && (
                  <TableHead>...</TableHead>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentData.map((row, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">
                    {(currentPage - 1) * itemsPerPage + index + 1}
                  </TableCell>
                  {headers.slice(0, 5).map(header => (
                    <TableCell key={header} className="max-w-48 truncate">
                      {row[header] || '-'}
                      {header === mapping.alamat && (!row[header] || row[header].trim() === '') && (
                        <AlertCircle className="w-4 h-4 text-destructive inline ml-2" />
                      )}
                    </TableCell>
                  ))}
                  {headers.length > 5 && (
                    <TableCell>...</TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-2">
            <Button
              variant="outline"
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <span className="flex items-center px-4 text-sm">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        )}

        {validAddresses.length === 0 && (
          <div className="flex items-start gap-3 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
            <AlertCircle className="w-5 h-5 text-destructive mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium text-destructive">Tidak ada alamat valid</p>
              <p className="text-sm text-destructive/80">
                Tidak ditemukan data alamat yang dapat diproses. Pastikan kolom alamat terisi dengan benar.
              </p>
            </div>
          </div>
        )}

        <Button 
          onClick={onStartProcessing} 
          disabled={validAddresses.length === 0}
          className="w-full"
          size="lg"
        >
          <Play className="w-5 h-5 mr-2" />
          Mulai Proses Enrichment ({validAddresses.length} alamat)
        </Button>
      </CardContent>
    </Card>
  );
};