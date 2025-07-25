import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MapPin, Target, CheckCircle, AlertTriangle } from "lucide-react";

interface ColumnMapperProps {
  headers: string[];
  onMappingComplete: (mapping: { alamat: string; kecamatan: string; kelurahan: string }) => void;
}

export const ColumnMapper = ({ headers, onMappingComplete }: ColumnMapperProps) => {
  const [mapping, setMapping] = useState({
    alamat: "",
    kecamatan: "",
    kelurahan: ""
  });

  const [autoDetected, setAutoDetected] = useState({
    alamat: "",
    kecamatan: "",
    kelurahan: ""
  });

  useEffect(() => {
    // Auto detect columns based on common patterns
    const detected = {
      alamat: "",
      kecamatan: "",
      kelurahan: ""
    };

    headers.forEach(header => {
      const lowerHeader = header.toLowerCase();
      
      if (!detected.alamat && (lowerHeader.includes('alamat') || lowerHeader.includes('address'))) {
        detected.alamat = header;
      }
      
      if (!detected.kecamatan && (lowerHeader.includes('kecamatan') || lowerHeader.includes('district'))) {
        detected.kecamatan = header;
      }
      
      if (!detected.kelurahan && (lowerHeader.includes('kelurahan') || lowerHeader.includes('desa') || lowerHeader.includes('village'))) {
        detected.kelurahan = header;
      }
    });

    setAutoDetected(detected);
    setMapping(detected);
  }, [headers]);

  const handleSubmit = () => {
    if (mapping.alamat && mapping.kecamatan && mapping.kelurahan) {
      onMappingComplete(mapping);
    }
  };

  const isComplete = mapping.alamat && mapping.kecamatan && mapping.kelurahan;

  return (
    <Card className="animate-fade-in">
      <CardHeader className="text-center">
        <div className="mx-auto w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center mb-4">
          <Target className="w-6 h-6 text-primary-foreground" />
        </div>
        <CardTitle className="text-2xl">Mapping Kolom</CardTitle>
        <CardDescription>
          Pilih kolom yang sesuai dengan data alamat, kecamatan, dan kelurahan
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {autoDetected.alamat && (
          <div className="p-3 bg-success/10 border border-success/20 rounded-lg">
            <div className="flex items-center gap-2 text-success">
              <CheckCircle className="w-4 h-4" />
              <span className="text-sm font-medium">Auto-detection berhasil!</span>
            </div>
          </div>
        )}

        <div className="grid gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              Kolom Alamat
            </label>
            <Select value={mapping.alamat} onValueChange={(value) => setMapping({...mapping, alamat: value})}>
              <SelectTrigger>
                <SelectValue placeholder="Pilih kolom alamat" />
              </SelectTrigger>
              <SelectContent>
                {headers.map(header => (
                  <SelectItem key={header} value={header}>
                    {header}
                    {autoDetected.alamat === header && (
                      <span className="ml-2 text-xs text-success">(auto)</span>
                    )}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              Kolom Kecamatan
            </label>
            <Select value={mapping.kecamatan} onValueChange={(value) => setMapping({...mapping, kecamatan: value})}>
              <SelectTrigger>
                <SelectValue placeholder="Pilih kolom kecamatan" />
              </SelectTrigger>
              <SelectContent>
                {headers.map(header => (
                  <SelectItem key={header} value={header}>
                    {header}
                    {autoDetected.kecamatan === header && (
                      <span className="ml-2 text-xs text-success">(auto)</span>
                    )}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              Kolom Desa / Kelurahan
            </label>
            <Select value={mapping.kelurahan} onValueChange={(value) => setMapping({...mapping, kelurahan: value})}>
              <SelectTrigger>
                <SelectValue placeholder="Pilih kolom desa/kelurahan" />
              </SelectTrigger>
              <SelectContent>
                {headers.map(header => (
                  <SelectItem key={header} value={header}>
                    {header}
                    {autoDetected.kelurahan === header && (
                      <span className="ml-2 text-xs text-success">(auto)</span>
                    )}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {!isComplete && (
          <div className="flex items-start gap-3 p-3 bg-accent/10 border border-accent/20 rounded-lg">
            <AlertTriangle className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />
            <p className="text-sm text-accent-foreground">
              Harap pilih semua kolom yang diperlukan untuk melanjutkan
            </p>
          </div>
        )}

        <Button 
          onClick={handleSubmit} 
          disabled={!isComplete}
          className="w-full"
        >
          Lanjutkan ke Preview Data
        </Button>
      </CardContent>
    </Card>
  );
};