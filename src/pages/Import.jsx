
import React, { useState, useCallback, useRef } from "react";
import { Contact } from "@/entities/Contact";
import { UploadFile, ExtractDataFromUploadedFile } from "@/integrations/Core";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Upload, FileText, AlertCircle, CheckCircle, Download, ArrowLeft, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function ImportPage() {
  const [file, setFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [extractedData, setExtractedData] = useState(null);
  const [importing, setImporting] = useState(false);
  const [importResults, setImportResults] = useState(null);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.name.toLowerCase().endsWith('.csv')) {
      setFile(droppedFile);
      setError(null);
    } else {
      setError("Please upload a CSV file only");
    }
  }, []);

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.name.toLowerCase().endsWith('.csv')) {
      setFile(selectedFile);
      setError(null);
    } else {
      setError("Please upload a CSV file only");
    }
  };

  const processFile = async () => {
    if (!file) return;

    setProcessing(true);
    setProgress(0);
    setError(null);

    try {
      // Update progress during upload
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(90, prev + 10));
      }, 200);

      // Upload file
      const { file_url } = await UploadFile({ file });
      
      // Corrected the schema to expect a direct array of contacts, which is standard for CSV parsing.
      const result = await ExtractDataFromUploadedFile({
        file_url,
        json_schema: {
          type: "array",
          items: Contact.schema()
        }
      });

      clearInterval(progressInterval);
      setProgress(100);

      // Corrected the check to look for a successful result with an array output.
      if (result.status === "success" && Array.isArray(result.output)) {
        setExtractedData(result.output);
      } else {
        throw new Error("Could not process the CSV. Please ensure the file headers (firstName, lastName, etc.) are correct and the format is valid.");
      }
    } catch (error) {
      setError(error.message);
    }

    setProcessing(false);
  };

  const importContacts = async () => {
    if (!extractedData) return;

    setImporting(true);
    try {
      // Clean data - remove empty fields and convert empty strings to undefined
      const cleanedContacts = extractedData.map(contact => {
        const cleaned = {};
        Object.keys(contact).forEach(key => {
          const value = contact[key]?.toString().trim();
          if (value && value !== '') {
            cleaned[key] = value;
          }
        });
        return cleaned;
      });

      const results = await Contact.bulkCreate(cleanedContacts);
      setImportResults({
        success: true,
        imported: cleanedContacts.length,
        contacts: results
      });
      
      // Reset form
      setFile(null);
      setExtractedData(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      setImportResults({
        success: false,
        error: error.message
      });
    }
    setImporting(false);
  };

  const resetImport = () => {
    setFile(null);
    setExtractedData(null);
    setImportResults(null);
    setError(null);
    setProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link to={createPageUrl("Contacts")}>
            <Button variant="outline" size="icon" className="border-slate-200">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Import Contacts</h1>
            <p className="text-slate-600 mt-1">Upload a CSV file with your Google Sheets data</p>
          </div>
        </div>

        {/* Import Results */}
        {importResults && (
          <Card className="mb-8 border-0 shadow-xl">
            <CardHeader className={`${importResults.success ? 'bg-green-50' : 'bg-red-50'} border-b`}>
              <CardTitle className={`flex items-center gap-2 ${importResults.success ? 'text-green-900' : 'text-red-900'}`}>
                {importResults.success ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                {importResults.success ? 'Import Successful!' : 'Import Failed'}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {importResults.success ? (
                <div>
                  <p className="text-slate-700 mb-4">
                    Successfully imported <strong>{importResults.imported}</strong> contacts to your database.
                  </p>
                  <div className="flex gap-3">
                    <Link to={createPageUrl("Contacts")}>
                      <Button className="bg-slate-900 hover:bg-slate-800">
                        <Users className="w-4 h-4 mr-2" />
                        View Contacts
                      </Button>
                    </Link>
                    <Button variant="outline" onClick={resetImport} className="border-slate-200">
                      Import Another File
                    </Button>
                  </div>
                </div>
              ) : (
                <div>
                  <p className="text-red-700 mb-4">{importResults.error}</p>
                  <Button variant="outline" onClick={resetImport} className="border-red-200">
                    Try Again
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* File Upload */}
        {!extractedData && !importResults && (
          <Card className="shadow-xl border-0">
            <CardHeader className="bg-slate-50 border-b border-slate-100">
              <CardTitle className="flex items-center gap-2 text-slate-900">
                <Upload className="w-5 h-5" />
                Upload CSV File
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <div className="text-center mb-6">
                <p className="text-slate-600 mb-4">
                  Upload a CSV file exported from Google Sheets with the following headers:
                </p>
                <div className="flex flex-wrap justify-center gap-2 mb-6">
                  {['firstName', 'lastName', 'companyName', 'workEmail', 'personalEmail', 'phoneNumber'].map(header => (
                    <Badge key={header} variant="secondary" className="bg-slate-100 text-slate-700">
                      {header}
                    </Badge>
                  ))}
                </div>
                <p className="text-sm text-slate-500">
                  Fields can be empty - null values are perfectly fine and will be handled properly.
                </p>
              </div>

              <div
                className={`border-2 border-dashed rounded-xl p-8 transition-all duration-200 ${
                  dragActive 
                    ? "border-slate-400 bg-slate-50" 
                    : "border-slate-300 hover:border-slate-400"
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4 bg-slate-100 rounded-full flex items-center justify-center">
                    <FileText className="w-8 h-8 text-slate-500" />
                  </div>
                  
                  {file ? (
                    <div className="mb-4">
                      <p className="font-semibold text-slate-900">{file.name}</p>
                      <p className="text-sm text-slate-500">
                        {(file.size / 1024).toFixed(1)} KB
                      </p>
                    </div>
                  ) : (
                    <div className="mb-4">
                      <p className="text-lg font-semibold text-slate-900 mb-2">
                        Drop your CSV file here
                      </p>
                      <p className="text-slate-500">or click to browse</p>
                    </div>
                  )}

                  <Button
                    onClick={() => fileInputRef.current?.click()}
                    variant="outline"
                    className="border-slate-200 hover:bg-slate-50"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    {file ? 'Choose Different File' : 'Select CSV File'}
                  </Button>
                </div>
              </div>

              {file && (
                <div className="mt-6 text-center">
                  {processing ? (
                    <div>
                      <Progress value={progress} className="mb-4" />
                      <p className="text-slate-600">Processing your CSV file...</p>
                    </div>
                  ) : (
                    <Button 
                      onClick={processFile}
                      className="bg-slate-900 hover:bg-slate-800"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Process CSV File
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Data Preview */}
        {extractedData && (
          <Card className="shadow-xl border-0">
            <CardHeader className="bg-slate-50 border-b border-slate-100">
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-slate-900">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  Preview Contacts ({extractedData.length})
                </div>
                <Button
                  onClick={importContacts}
                  disabled={importing}
                  className="bg-slate-900 hover:bg-slate-800"
                >
                  {importing ? "Importing..." : "Import All Contacts"}
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto max-h-96">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50">
                      <TableHead>Name</TableHead>
                      <TableHead>Company</TableHead>
                      <TableHead>Work Email</TableHead>
                      <TableHead>Personal Email</TableHead>
                      <TableHead>Phone</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {extractedData.map((contact, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          {[contact.firstName, contact.lastName].filter(Boolean).join(' ') || '—'}
                        </TableCell>
                        <TableCell>{contact.companyName || '—'}</TableCell>
                        <TableCell>{contact.workEmail || '—'}</TableCell>
                        <TableCell>{contact.personalEmail || '—'}</TableCell>
                        <TableCell>{contact.phoneNumber || '—'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
