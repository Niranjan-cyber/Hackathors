import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, File, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  onNext: (file: File) => void;
  selectedFile: File | null;
}

export const FileUpload: React.FC<FileUploadProps> = ({ onFileSelect, onNext, selectedFile }) => {
  const [dragActive, setDragActive] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      if (file.size > 10 * 1024 * 1024) {
        toast.error("File size must be less than 10MB");
        return;
      }
      onFileSelect(file);
      toast.success("File uploaded successfully!", {
        duration: 2000,
      });
    }
  }, [onFileSelect]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
    },
    multiple: false,
    onDragEnter: () => setDragActive(true),
    onDragLeave: () => setDragActive(false),
  });

  const removeFile = () => {
    onFileSelect(null as any);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-6">
      <div className="particles">
        {[...Array(50)].map((_, i) => (
          <div
            key={i}
            className="particle"
            style={{
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 20}s`,
              animationDuration: `${15 + Math.random() * 10}s`,
            }}
          />
        ))}
      </div>

      <div className="max-w-2xl w-full space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-5xl font-bold text-gradient floating-animation">
            MCQ Generator
          </h1>
          <p className="text-xl text-muted-foreground">
            Upload your document to generate intelligent multiple-choice questions
          </p>
        </div>

        <Card className="card-gradient border-primary/20 p-8 hover-lift glow-effect">
          {!selectedFile ? (
            <div
              {...getRootProps()}
              className={`relative border-2 border-dashed rounded-xl p-12 text-center transition-all duration-300 cursor-pointer ${
                isDragActive || dragActive
                  ? 'border-primary bg-primary/10 scale-105'
                  : 'border-primary/30 hover:border-primary/60 hover:bg-primary/5'
              }`}
            >
              <input {...getInputProps()} />
              <div className="space-y-6">
                <div className="flex justify-center">
                  <Upload 
                    className={`w-16 h-16 transition-all duration-300 ${
                      isDragActive ? 'text-primary scale-110 animate-bounce' : 'text-primary/70'
                    }`} 
                  />
                </div>
                <div>
                  <h3 className="text-2xl font-semibold text-foreground mb-2">
                    {isDragActive ? 'Drop your file here' : 'Upload Document'}
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    Drag and drop your file here, or click to browse
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Supported formats: PDF (Max 10MB)
                  </p>
                </div>
                <Button variant="outline" size="lg" className="pointer-events-none">
                  Choose File
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center justify-between p-6 bg-primary/10 rounded-lg border border-primary/30">
                <div className="flex items-center space-x-4">
                  <File className="w-8 h-8 text-primary" />
                  <div>
                    <p className="font-medium text-foreground">{selectedFile.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatFileSize(selectedFile.size)}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={removeFile}
                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
              <div className="text-center">
                <p className="text-success font-medium mb-4">✓ File uploaded successfully!</p>
                <Button 
                  onClick={() => {
                    console.log(selectedFile)
                    onNext(selectedFile)
                  }} 
                  size="lg" 
                  variant="default"
                >
                  Proceed to Topic Selection
                </Button>
              </div>
            </div>
          )}
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { title: "AI-Powered", description: "Intelligent question generation using advanced AI" },
            { title: "Multiple Formats", description: "Support for PDF, DOC, TXT, and more" },
            { title: "Customizable", description: "Choose topics, difficulty, and question count" }
          ].map((feature, index) => (
            <Card key={index} className="card-gradient border-primary/20 p-6 text-center hover-lift">
              <h3 className="font-semibold text-foreground mb-2">{feature.title}</h3>
              <p className="text-sm text-muted-foreground">{feature.description}</p>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};
