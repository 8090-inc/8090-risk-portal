import React, { useState, useEffect } from 'react';
import { 
  Upload, 
  Download, 
  RefreshCw, 
  FileText, 
  Settings as SettingsIcon, 
  Key, 
  AlertCircle, 
  Check,
  Eye,
  EyeOff,
  Save,
  Copy,
  Users,
  ChevronRight
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { PageHeader } from '../components/layout/PageHeader';
import { DataStatus } from '../components/data/DataStatus';
import { DataUpload } from '../components/data/DataUpload';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { useRiskStore, useControlStore, useCurrentUser } from '../store';
import { exportRisksToExcel, exportRisksToCSV } from '../utils/exportUtils';
import { exportRisksToPDF } from '../utils/pdfExport';
import { getUserPermissions } from '../types/auth.types';

export const SettingsView: React.FC = () => {
  const [showUpload, setShowUpload] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  const [apiKeySaved, setApiKeySaved] = useState(false);
  const [isSavingKey, setIsSavingKey] = useState(false);
  const [showEnvInstructions, setShowEnvInstructions] = useState(false);
  
  const { risks, loadRisks } = useRiskStore();
  const { controls, loadControls } = useControlStore();
  const user = useCurrentUser();
  
  const permissions = user ? getUserPermissions(user.role) : null;

  // Check if API key exists in environment
  const hasEnvApiKey = !!import.meta.env.VITE_GEMINI_API_KEY;

  useEffect(() => {
    // Load saved API key from localStorage (for demo purposes)
    const savedKey = localStorage.getItem('gemini_api_key');
    if (savedKey) {
      setApiKey(savedKey);
    }
  }, []);

  const dataStatus = {
    lastUpdated: localStorage.getItem('dataLastUpdated') || undefined,
    recordCount: {
      risks: risks.length,
      controls: controls.length
    }
  };

  const handleDataImport = async (data: { risks: any[], controls: any[] }) => {
    try {
      console.log('Importing data:', { risksCount: data.risks.length, controlsCount: data.controls.length });
      
      // Save to localStorage
      localStorage.setItem('importedRisks', JSON.stringify(data.risks));
      localStorage.setItem('importedControls', JSON.stringify(data.controls));
      localStorage.setItem('dataLastUpdated', new Date().toISOString());
      
      // Reload stores
      await loadRisks();
      await loadControls();
      
      setShowUpload(false);
      console.log('Data import successful');
    } catch (error) {
      console.error('Failed to import data:', error);
      alert('Failed to import data. Please check the console for details.');
    }
  };

  const handleRefresh = async () => {
    await Promise.all([loadRisks(), loadControls()]);
  };

  const handleExportExcel = async () => {
    setIsExporting(true);
    try {
      await exportRisksToExcel(risks, `ai-risk-portal-export-${new Date().toISOString().split('T')[0]}.xlsx`);
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportPDF = async () => {
    setIsExporting(true);
    try {
      await exportRisksToPDF(risks, controls);
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportCSV = async () => {
    setIsExporting(true);
    try {
      await exportRisksToCSV(risks, `risks-export-${new Date().toISOString().split('T')[0]}.csv`);
    } finally {
      setIsExporting(false);
    }
  };

  const handleSaveApiKey = async () => {
    setIsSavingKey(true);
    
    // Simulate saving (in reality, this would update .env file on server)
    setTimeout(() => {
      localStorage.setItem('gemini_api_key', apiKey);
      setApiKeySaved(true);
      setIsSavingKey(false);
      setShowEnvInstructions(true);
      
      // Reset success message after 3 seconds
      setTimeout(() => setApiKeySaved(false), 3000);
    }, 1000);
  };

  const handleCopyEnvLine = () => {
    navigator.clipboard.writeText(`VITE_GEMINI_API_KEY=${apiKey}`);
    alert('Copied to clipboard!');
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <PageHeader
        title="Settings"
        description="Manage data imports, exports, and system configuration"
        actions={
          <Button
            variant="secondary"
            size="sm"
            onClick={handleRefresh}
            icon={<RefreshCw className="h-4 w-4" />}
          >
            Refresh Data
          </Button>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Data Status */}
        <div className="lg:col-span-1">
          <DataStatus
            {...dataStatus}
            validationStatus="valid"
            onRefresh={handleRefresh}
          />
        </div>

        {/* Right Column - Configuration Cards */}
        <div className="lg:col-span-2 space-y-6">
          {/* User Management - Admin only */}
          {permissions?.canManageUsers && (
            <Card>
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <Users className="h-5 w-5 text-slate-400 mr-2" />
                    <h3 className="text-lg font-medium text-slate-900">User Management</h3>
                  </div>
                  <Link to="/admin/users">
                    <Button variant="secondary" size="sm" className="flex items-center space-x-2">
                      <span>Manage Users</span>
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
                
                <p className="text-sm text-slate-600 mb-4">
                  Create, edit, and manage user accounts and permissions across the system.
                </p>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-slate-900">12</div>
                    <div className="text-sm text-slate-600">Total Users</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">8</div>
                    <div className="text-sm text-slate-600">Active</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-slate-600">3</div>
                    <div className="text-sm text-slate-600">Admins</div>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* API Configuration - Moved to top for importance */}
          <Card>
            <div className="p-6">
              <div className="flex items-center mb-4">
                <Key className="h-5 w-5 text-slate-400 mr-2" />
                <h3 className="text-lg font-medium text-slate-900">API Configuration</h3>
              </div>
              
              <div className="space-y-4">
                {/* API Key Status */}
                <div>
                  <label className="text-sm font-medium text-slate-700">Google Gemini API Key</label>
                  
                  {hasEnvApiKey ? (
                    <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center">
                        <Check className="h-4 w-4 text-green-600 mr-2" />
                        <span className="text-sm text-green-800">API key configured in environment</span>
                      </div>
                      <p className="mt-1 text-xs text-green-700">
                        Key: {import.meta.env.VITE_GEMINI_API_KEY.substring(0, 8)}...{import.meta.env.VITE_GEMINI_API_KEY.slice(-4)}
                      </p>
                    </div>
                  ) : (
                    <div className="mt-2 space-y-4">
                      {/* API Key Input */}
                      <div>
                        <div className="relative">
                          <input
                            type={showApiKey ? 'text' : 'password'}
                            value={apiKey}
                            onChange={(e) => setApiKey(e.target.value)}
                            placeholder="Enter your Gemini API key"
                            className="w-full px-3 py-2 pr-10 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
                          />
                          <button
                            onClick={() => setShowApiKey(!showApiKey)}
                            className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 transition-colors"
                          >
                            {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                        
                        {apiKey && (
                          <div className="mt-2 flex items-center space-x-2">
                            <Button
                              variant="primary"
                              size="sm"
                              onClick={handleSaveApiKey}
                              disabled={isSavingKey}
                              icon={<Save className="h-4 w-4" />}
                            >
                              {isSavingKey ? 'Saving...' : 'Save Key'}
                            </Button>
                            
                            {apiKeySaved && (
                              <span className="text-sm text-green-600 flex items-center">
                                <Check className="h-4 w-4 mr-1" />
                                Saved locally
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Instructions */}
                      {!apiKey && (
                        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                          <div className="flex items-start">
                            <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                            <div className="ml-2">
                              <h4 className="text-sm font-medium text-amber-900">How to get your API key:</h4>
                              <ol className="mt-2 text-sm text-amber-800 space-y-1 list-decimal list-inside">
                                <li>Visit <a href="https://makersuite.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">Google AI Studio</a></li>
                                <li>Create a new API key</li>
                                <li>Copy and paste it above</li>
                              </ol>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Environment Setup Instructions */}
                      {showEnvInstructions && apiKey && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                          <h4 className="text-sm font-medium text-blue-900 mb-2">To make permanent:</h4>
                          <div className="space-y-2">
                            <p className="text-sm text-blue-800">Add this line to your <code className="bg-blue-100 px-1 py-0.5 rounded">.env</code> file:</p>
                            <div className="flex items-center space-x-2">
                              <code className="flex-1 bg-white px-3 py-2 rounded border border-blue-300 text-xs font-mono">
                                VITE_GEMINI_API_KEY={apiKey}
                              </code>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleCopyEnvLine}
                                icon={<Copy className="h-4 w-4" />}
                              >
                                Copy
                              </Button>
                            </div>
                            <p className="text-xs text-blue-700">Then restart your development server.</p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Rate Limit Info */}
                <div className="pt-2 border-t border-slate-200">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600">API Rate Limit</span>
                    <span className="text-sm font-medium text-slate-900">
                      {import.meta.env.VITE_API_RATE_LIMIT || '10'} requests/minute
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Data Import */}
          <Card>
            <div className="p-6">
              <div className="flex items-center mb-4">
                <Upload className="h-5 w-5 text-slate-400 mr-2" />
                <h3 className="text-lg font-medium text-slate-900">Data Import</h3>
              </div>
              
              <p className="text-sm text-slate-600 mb-4">
                Upload a new Excel file to update risks and controls data. The system will validate 
                the data before importing.
              </p>
              
              <Button
                variant="primary"
                onClick={() => setShowUpload(true)}
                icon={<Upload className="h-4 w-4" />}
              >
                Upload Excel File
              </Button>
            </div>
          </Card>

          {/* Data Export */}
          <Card>
            <div className="p-6">
              <div className="flex items-center mb-4">
                <Download className="h-5 w-5 text-slate-400 mr-2" />
                <h3 className="text-lg font-medium text-slate-900">Data Export</h3>
              </div>
              
              <p className="text-sm text-slate-600 mb-4">
                Export current data in various formats for reporting and backup purposes.
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <Button
                  variant="secondary"
                  onClick={handleExportExcel}
                  disabled={isExporting}
                  icon={<FileText className="h-4 w-4" />}
                  className="justify-center"
                >
                  Export Excel
                </Button>
                
                <Button
                  variant="secondary"
                  onClick={handleExportPDF}
                  disabled={isExporting}
                  icon={<FileText className="h-4 w-4" />}
                  className="justify-center"
                >
                  Export PDF
                </Button>
                
                <Button
                  variant="secondary"
                  onClick={handleExportCSV}
                  disabled={isExporting}
                  icon={<FileText className="h-4 w-4" />}
                  className="justify-center"
                >
                  Export CSV
                </Button>
              </div>
              
              <p className="text-xs text-slate-500 mt-3">
                Exports include all current filters and sorting applied to the data.
              </p>
            </div>
          </Card>

          {/* System Configuration */}
          <Card>
            <div className="p-6">
              <div className="flex items-center mb-4">
                <SettingsIcon className="h-5 w-5 text-slate-400 mr-2" />
                <h3 className="text-lg font-medium text-slate-900">System Configuration</h3>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between py-2">
                  <span className="text-sm text-slate-600">Data Source</span>
                  <span className="text-sm font-medium text-slate-900">Local Excel Data</span>
                </div>
                
                <div className="flex items-center justify-between py-2 border-t border-slate-100">
                  <span className="text-sm text-slate-600">Auto-refresh</span>
                  <span className="text-sm font-medium text-slate-900">On Load</span>
                </div>
                
                <div className="flex items-center justify-between py-2 border-t border-slate-100">
                  <span className="text-sm text-slate-600">Version</span>
                  <span className="text-sm font-medium text-slate-900">
                    v{import.meta.env.VITE_APP_VERSION || '1.0.0'}
                  </span>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Upload Modal */}
      {showUpload && (
        <DataUpload
          onDataImport={handleDataImport}
          onClose={() => setShowUpload(false)}
        />
      )}
    </div>
  );
};