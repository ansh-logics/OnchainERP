"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function AuthTestPage() {
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const testEndpoint = async (endpoint: string, name: string) => {
    const token = localStorage.getItem('authToken');
    const user = localStorage.getItem('user');
    
    const result = {
      name,
      endpoint,
      tokenExists: !!token,
      tokenLength: token?.length || 0,
      userExists: !!user,
      timestamp: new Date().toISOString(),
      status: 'pending' as any,
      response: null as any,
      error: null as any
    };

    try {
      console.log(`Testing ${endpoint}...`);
      const response = await fetch(endpoint, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      result.status = response.status;
      const data = await response.json();
      result.response = data;

      if (!response.ok) {
        result.error = `HTTP ${response.status}: ${data.message || 'Unknown error'}`;
      }
    } catch (error) {
      result.status = 'error';
      result.error = error instanceof Error ? error.message : 'Unknown error';
    }

    return result;
  };

  const runTests = async () => {
    setLoading(true);
    setResults([]);

    const tests = [
      { endpoint: '/api/student-services/test/auth-test', name: 'Auth Test' },
      { endpoint: '/api/student-services/profile', name: 'Profile' },
      { endpoint: '/api/student-services/dashboard', name: 'Dashboard' },
      { endpoint: '/api/student-services/fees', name: 'Fees' },
      { endpoint: '/api/student-services/fee-summary', name: 'Fee Summary' }
    ];

    const testResults = [];
    for (const test of tests) {
      const result = await testEndpoint(test.endpoint, test.name);
      testResults.push(result);
      setResults([...testResults]);
    }

    setLoading(false);
  };

  const getStatusColor = (status: any) => {
    if (status === 200) return 'text-green-600';
    if (status === 401) return 'text-red-600';
    if (status === 404) return 'text-yellow-600';
    if (status === 'error') return 'text-red-800';
    return 'text-gray-600';
  };

  return (
    <div className="container mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>Authentication Debug Tool</CardTitle>
          <CardDescription>
            Test student service endpoints to debug authentication issues
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Button onClick={runTests} disabled={loading}>
              {loading ? 'Running Tests...' : 'Run Authentication Tests'}
            </Button>

            {results.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Test Results:</h3>
                {results.map((result, index) => (
                  <Card key={index} className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium">{result.name}</h4>
                      <span className={`font-mono text-sm ${getStatusColor(result.status)}`}>
                        {result.status}
                      </span>
                    </div>
                    
                    <div className="text-sm text-gray-600 space-y-1">
                      <p><strong>Endpoint:</strong> {result.endpoint}</p>
                      <p><strong>Token:</strong> {result.tokenExists ? `Present (${result.tokenLength} chars)` : 'Missing'}</p>
                      <p><strong>User Data:</strong> {result.userExists ? 'Present' : 'Missing'}</p>
                      
                      {result.error && (
                        <p className="text-red-600"><strong>Error:</strong> {result.error}</p>
                      )}
                      
                      {result.response && (
                        <details className="mt-2">
                          <summary className="cursor-pointer font-medium">Response Data</summary>
                          <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-auto">
                            {JSON.stringify(result.response, null, 2)}
                          </pre>
                        </details>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
