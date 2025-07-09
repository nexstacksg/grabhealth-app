'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function TestUploadDirectPage() {
  const [uploadResult, setUploadResult] = useState<any>(null);
  const [updateResult, setUpdateResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadedFileId, setUploadedFileId] = useState<string | null>(null);

  // Get token from cookie
  const getAccessToken = () => {
    const nameEQ = 'accessToken=';
    const cookies = document.cookie.split(';');
    
    for (let cookie of cookies) {
      cookie = cookie.trim();
      if (cookie.indexOf(nameEQ) === 0) {
        return cookie.substring(nameEQ.length);
      }
    }
    return null;
  };

  // Step 1: Direct upload to Strapi
  const testDirectUpload = async () => {
    if (!selectedFile) {
      setError('Please select a file first');
      return;
    }

    setLoading(true);
    setError(null);
    setUploadResult(null);

    try {
      const token = getAccessToken();
      if (!token) {
        throw new Error('Not authenticated - no access token found');
      }

      const formData = new FormData();
      formData.append('files', selectedFile);

      console.log('=== DIRECT UPLOAD TEST ===');
      console.log('Token:', token.substring(0, 20) + '...');
      console.log('File:', selectedFile.name);

      const response = await fetch('http://localhost:1337/api/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();
      console.log('Upload response:', data);
      
      if (!response.ok) {
        throw new Error(data.error?.message || 'Upload failed');
      }

      setUploadResult(data);
      if (data[0]?.id) {
        setUploadedFileId(data[0].id.toString());
      }
    } catch (err: any) {
      console.error('Upload error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Direct update to user profile
  const testDirectUpdate = async () => {
    if (!uploadedFileId) {
      setError('Please upload a file first');
      return;
    }

    setLoading(true);
    setError(null);
    setUpdateResult(null);

    try {
      const token = getAccessToken();
      if (!token) {
        throw new Error('Not authenticated - no access token found');
      }

      console.log('=== DIRECT UPDATE TEST ===');
      console.log('Token:', token.substring(0, 20) + '...');
      console.log('Image ID:', uploadedFileId);
      console.log('Image ID type:', typeof uploadedFileId);

      // Test different formats
      const tests = [
        {
          name: 'Direct ID (as number)',
          body: { profileImage: parseInt(uploadedFileId) }
        },
        {
          name: 'Direct ID (as string)',
          body: { profileImage: uploadedFileId }
        },
        {
          name: 'Connect array',
          body: { profileImage: { connect: [parseInt(uploadedFileId)] } }
        },
        {
          name: 'Set array',
          body: { profileImage: { set: [parseInt(uploadedFileId)] } }
        }
      ];

      const results = [];

      for (const test of tests) {
        console.log(`\nTrying: ${test.name}`);
        console.log('Body:', JSON.stringify(test.body));

        try {
          const response = await fetch('http://localhost:1337/api/users/me', {
            method: 'PUT',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(test.body),
          });

          const responseText = await response.text();
          console.log('Response status:', response.status);
          console.log('Response:', responseText);

          let responseData;
          try {
            responseData = JSON.parse(responseText);
          } catch {
            responseData = responseText;
          }

          results.push({
            test: test.name,
            status: response.status,
            success: response.ok,
            response: responseData,
            body: test.body
          });

          // If successful, stop trying other formats
          if (response.ok) {
            console.log('✅ Success with format:', test.name);
            break;
          }
        } catch (err: any) {
          results.push({
            test: test.name,
            error: err.message,
            body: test.body
          });
        }
      }

      setUpdateResult({ results });
    } catch (err: any) {
      console.error('Update error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container max-w-4xl py-8">
      <h1 className="text-3xl font-bold mb-8">Direct Upload Test (No Next.js API)</h1>

      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Step 1: Direct Upload */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Step 1: Direct Upload to Strapi</CardTitle>
          <CardDescription>
            Upload directly to http://localhost:1337/api/upload
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
            onClick={testDirectUpload} 
            disabled={loading || !selectedFile}
          >
            {loading ? 'Uploading...' : 'Upload Directly'}
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

      {/* Step 2: Direct Update */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Step 2: Direct Update Profile</CardTitle>
          <CardDescription>
            Update directly to http://localhost:1337/api/users/me
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
            onClick={testDirectUpdate} 
            disabled={loading || !uploadedFileId}
          >
            {loading ? 'Testing formats...' : 'Test Update Formats'}
          </Button>

          {updateResult && (
            <div className="mt-4 p-4 bg-gray-100 rounded">
              <h4 className="font-semibold mb-2">Update Results:</h4>
              <pre className="text-xs overflow-auto">
                {JSON.stringify(updateResult, null, 2)}
              </pre>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Check Console</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Open browser console (F12) to see detailed logs of the requests and responses.</p>
        </CardContent>
      </Card>
    </div>
  );
}