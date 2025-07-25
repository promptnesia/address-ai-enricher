import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Key, Eye, EyeOff, CheckCircle } from "lucide-react";

interface ApiKeyInputProps {
  onApiKeySet: (apiKey: string) => void;
  isValid: boolean;
}

export const ApiKeyInput = ({ onApiKeySet, isValid }: ApiKeyInputProps) => {
  const [apiKey, setApiKey] = useState("");
  const [showKey, setShowKey] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (apiKey.trim()) {
      onApiKeySet(apiKey.trim());
    }
  };

  return (
    <Card className="animate-fade-in">
      <CardHeader className="text-center">
        <div className="mx-auto w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center mb-4">
          <Key className="w-6 h-6 text-primary-foreground" />
        </div>
        <CardTitle className="text-2xl bg-gradient-primary bg-clip-text text-transparent">
          OpenAI API Key
        </CardTitle>
        <CardDescription>
          Masukkan API key OpenAI Anda untuk memulai proses enrichment alamat
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <Input
              type={showKey ? "text" : "password"}
              placeholder="sk-..."
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="pr-20 transition-all duration-200 focus:shadow-glow"
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-2">
              {isValid && (
                <CheckCircle className="w-4 h-4 text-success" />
              )}
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setShowKey(!showKey)}
                className="h-6 w-6 p-0"
              >
                {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </Button>
            </div>
          </div>
          <Button 
            type="submit" 
            className="w-full" 
            disabled={!apiKey.trim()}
          >
            {isValid ? "API Key Valid" : "Simpan API Key"}
          </Button>
        </form>
        <p className="text-xs text-muted-foreground mt-4 text-center">
          API key Anda disimpan secara lokal dan aman
        </p>
      </CardContent>
    </Card>
  );
};