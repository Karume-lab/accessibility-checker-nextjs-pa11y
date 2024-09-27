"use client";
import React, { useState } from 'react';

interface AccessibilityIssue {
  message: string;
  code: string;
  type: string;
  context: string;
  selector: string;
  runnerExtras?: {
    description: string;
    impact: string;
    help: string;
    helpUrl: string;
  };
  runner: string;
}

interface Results {
  pageUrl: string;
  issues: AccessibilityIssue[];
  documentTitle: string;
}

export default function Home() {
  const [url, setUrl] = useState<string>('');
  const [results, setResults] = useState<Results | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'axe' | 'html'>('axe');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResults(null);

    try {
      const response = await fetch('http://localhost:5000/api/check-accessibility', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      });

      if (response.ok) {
        const data: Results = await response.json();
        setResults(data);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Something went wrong');
      }
    } catch (err) {
      console.error(err);
      setError('Error connecting to the server.');
    } finally {
      setLoading(false);
    }
  };

  const toggleTab = (tab: 'axe' | 'html') => {
    setActiveTab(tab);
  };

  const axeIssues = results?.issues.filter(issue => issue.runner === 'axe') || [];
  const htmlcsIssues = results?.issues.filter(issue => issue.runner === 'htmlcs') || [];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-gray-100 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-5xl font-extrabold mb-8 text-center bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
          Accessibility Checker
        </h1>
        <form onSubmit={handleSubmit} className="mb-8">
          <div className="flex items-center bg-gray-800 rounded-lg overflow-hidden shadow-lg">
            <input
              id="url"
              type="url"
              placeholder="https://example.com"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              required
              className="flex-grow py-3 px-4 bg-transparent text-gray-100 placeholder-gray-400 focus:outline-none"
            />
            <button
              type="submit"
              className={`bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 transition duration-300 ease-in-out ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
              disabled={loading}
            >
              {loading ? 'Checking...' : 'Check'}
            </button>
          </div>
        </form>

        {error && (
          <div className="bg-red-500 text-white p-4 rounded-lg mb-6 animate-pulse">
            {error}
          </div>
        )}

        {results && (
          <div className="bg-gray-800 rounded-lg shadow-xl overflow-hidden">
            <div className="p-6 border-b border-gray-700">
              <h2 className="text-3xl font-bold mb-2">Results</h2>
              <p className="text-gray-400">{results.pageUrl}</p>
            </div>

            <div className="flex border-b border-gray-700">
              <button
                onClick={() => toggleTab('axe')}
                className={`flex-1 py-3 px-6 font-semibold transition duration-300 ease-in-out ${activeTab === 'axe' ? 'bg-blue-500 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
              >
                Axe Results
              </button>
              <button
                onClick={() => toggleTab('html')}
                className={`flex-1 py-3 px-6 font-semibold transition duration-300 ease-in-out ${activeTab === 'html' ? 'bg-blue-500 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
              >
                HTML/CSS Results
              </button>
            </div>

            <div className="p-6 max-h-[600px] overflow-auto">
              {activeTab === 'axe' && (
                <div className="space-y-6">
                  <h3 className="text-2xl font-bold mb-4">Axe Issues</h3>
                  {axeIssues.map((issue, index) => (
                    <div key={index} className="bg-gray-700 p-6 rounded-lg shadow-md">
                      <h4 className="text-xl font-semibold mb-2">{issue.message}</h4>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <p><span className="font-semibold">Code:</span> {issue.code}</p>
                        <p><span className="font-semibold">Type:</span> {issue.type}</p>
                        <p className="col-span-2"><span className="font-semibold">Context:</span> {issue.context}</p>
                        <p className="col-span-2"><span className="font-semibold">Selector:</span> {issue.selector}</p>
                      </div>
                      {issue.runnerExtras && Object.keys(issue.runnerExtras).length > 0 && (
                        <div className="mt-4 bg-gray-800 p-4 rounded-lg">
                          <h5 className="font-semibold mb-2">Runner Extras:</h5>
                          <p><span className="font-semibold">Description:</span> {issue.runnerExtras.description}</p>
                          <p><span className="font-semibold">Impact:</span> {issue.runnerExtras.impact}</p>
                          <p><span className="font-semibold">Help:</span> {issue.runnerExtras.help}</p>
                          <a href={issue.runnerExtras.helpUrl} className="text-blue-300 hover:underline mt-2 inline-block" target="_blank" rel="noopener noreferrer">
                            Learn more →
                          </a>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'html' && (
                <div className="space-y-6">
                  <h3 className="text-2xl font-bold mb-4">HTML/CSS Issues</h3>
                  {htmlcsIssues.map((issue, index) => (
                    <div key={index} className="bg-gray-700 p-6 rounded-lg shadow-md">
                      <h4 className="text-xl font-semibold mb-2">{issue.message}</h4>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <p><span className="font-semibold">Code:</span> {issue.code}</p>
                        <p><span className="font-semibold">Type:</span> {issue.type}</p>
                        <p className="col-span-2"><span className="font-semibold">Context:</span> {issue.context}</p>
                        <p className="col-span-2"><span className="font-semibold">Selector:</span> {issue.selector}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
