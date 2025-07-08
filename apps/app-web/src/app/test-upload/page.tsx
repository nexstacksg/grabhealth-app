'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function TestUploadPage() {
  const [uploadResult, setUploadResult] = useState<any>(null);
  const [updateResult, setUpdateResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadedFileId, setUploadedFileId] = useState<string | null>(null);

  // Step 1: Test file upload to Strapi
  const testUpload = async () => {
    if (!selectedFile) {
      setError('Please select a file first');
      return;
    }

    setLoading(true);
    setError(null);
    setUploadResult(null);

    try {
      const formData = new FormData();
      formData.append('files', selectedFile);

      const response = await fetch('/api/test-upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Upload failed');
      }

      setUploadResult(data);
      if (data.uploadedFile?.id) {
        setUploadedFileId(data.uploadedFile.id.toString());
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Test updating user profile with uploaded image
  const testUpdateProfile = async () => {
    if (!uploadedFileId) {
      setError('Please upload a file first');
      return;
    }

    setLoading(true);
    setError(null);
    setUpdateResult(null);

    try {
      const response = await fetch('/api/test-update-profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ imageId: uploadedFileId }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Update failed');
      }

      setUpdateResult(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Manual test instructions
  const manualTestSteps = `
1. Open browser developer tools (F12)
2. Go to Network tab
3. Upload a file and check:
   - The POST request to /api/upload
   - Response should contain file ID and URL
   - Check if file appears in DigitalOcean Spaces
4. Update profile and check:
   - The PUT request to /api/users/me
   - Request body format
   - Response or error details
  `;

  return (
    <div className="container max-w-4xl py-8">
      <h1 className="text-3xl font-bold mb-8">Test Image Upload</h1>

      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Step 1: File Selection and Upload */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Step 1: Upload File to Strapi</CardTitle>
          <CardDescription>
            Test uploading a file to Strapi's media library
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="file">Select Image</Label>
            <Input
              id="file"
              type="file"
              accept="image/*"
              onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
            />
          </div>
          
          <Button 
            onClick={testUpload} 
            disabled={loading || !selectedFile}
          >
            {loading ? 'Uploading...' : 'Test Upload'}
          </Button>

          {uploadResult && (
            <div className="mt-4 p-4 bg-gray-100 rounded">
              <h4 className="font-semibold mb-2">Upload Result:</h4>
              <pre className="text-xs overflow-auto">
                {JSON.stringify(uploadResult, null, 2)}
              </pre>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Step 2: Update Profile */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Step 2: Update User Profile</CardTitle>
          <CardDescription>
            Test updating the user's profile image with the uploaded file ID
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Uploaded File ID</Label>
            <Input
              value={uploadedFileId || ''}
              onChange={(e) => setUploadedFileId(e.target.value)}
              placeholder="Enter file ID manually or upload a file"
            />
          </div>
          
          <Button 
            onClick={testUpdateProfile} 
            disabled={loading || !uploadedFileId}
          >
            {loading ? 'Updating...' : 'Test Update Profile'}
          </Button>

          {updateResult && (
            <div className="mt-4 p-4 bg-gray-100 rounded">
              <h4 className="font-semibold mb-2">Update Result:</h4>
              <pre className="text-xs overflow-auto">
                {JSON.stringify(updateResult, null, 2)}
              </pre>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Manual Testing Guide */}
      <Card>
        <CardHeader>
          <CardTitle>Manual Testing Steps</CardTitle>
          <CardDescription>
            Follow these steps to debug the issue manually
          </CardDescription>
        </CardHeader>
        <CardContent>
          <pre className="text-sm whitespace-pre-wrap bg-gray-100 p-4 rounded">
            {manualTestSteps}
          </pre>
        </CardContent>
      </Card>
    </div>
  );
}