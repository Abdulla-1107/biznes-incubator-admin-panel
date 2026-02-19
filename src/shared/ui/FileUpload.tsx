import { useState, useRef } from "react";
import { Upload, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useFileUpload } from "@/shared/api/query-hooks";
import { cn } from "@/lib/utils";

interface FileUploadProps {
  value?: string;
  onChange: (url: string) => void;
  accept?: string;
  label?: string;
  className?: string;
}

export function FileUpload({ value, onChange, accept = "image/*", label = "Fayl yuklash", className }: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const uploadMutation = useFileUpload();

  const handleFile = async (file: File) => {
    const url = await uploadMutation.mutateAsync(file);
    onChange(url);
  };

  return (
    <div className={cn("space-y-2", className)}>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
        }}
      />
      {value ? (
        <div className="relative inline-block">
          {accept.startsWith("image") ? (
            <img src={value} alt="Uploaded" className="h-20 w-20 rounded-lg object-cover border border-border" />
          ) : (
            <div className="h-20 px-4 rounded-lg border border-border flex items-center gap-2 text-sm text-muted-foreground">
              <Upload className="h-4 w-4" />
              Fayl yuklangan
            </div>
          )}
          <button
            type="button"
            onClick={() => onChange("")}
            className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center"
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      ) : (
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={uploadMutation.isPending}
          onClick={() => inputRef.current?.click()}
          className="gap-2"
        >
          {uploadMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
          {label}
        </Button>
      )}
    </div>
  );
}
