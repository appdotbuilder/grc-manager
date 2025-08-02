
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { trpc } from '@/utils/trpc';
import { useState, useEffect, useCallback } from 'react';
import { PoliciesSection } from '@/components/PoliciesSection';
import { ControlsSection } from '@/components/ControlsSection';
import { RisksSection } from '@/components/RisksSection';
import { AssetsSection } from '@/components/AssetsSection';
import { VulnerabilitiesSection } from '@/components/VulnerabilitiesSection';
import { IncidentsSection } from '@/components/IncidentsSection';
import { AuditFindingsSection } from '@/components/AuditFindingsSection';
import { Shield, FileText, AlertTriangle, Server, Bug, AlertCircle, Search } from 'lucide-react';
import type { Policy, Control, Risk, Asset, Vulnerability, Incident, AuditFinding } from '../../server/src/schema';

function App() {
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [controls, setControls] = useState<Control[]>([]);
  const [risks, setRisks] = useState<Risk[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [vulnerabilities, setVulnerabilities] = useState<Vulnerability[]>([]);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [auditFindings, setAuditFindings] = useState<AuditFinding[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadAllData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [
        policiesData,
        controlsData,
        risksData,
        assetsData,
        vulnerabilitiesData,
        incidentsData,
        auditFindingsData
      ] = await Promise.all([
        trpc.getPolicies.query(),
        trpc.getControls.query(),
        trpc.getRisks.query(),
        trpc.getAssets.query(),
        trpc.getVulnerabilities.query(),
        trpc.getIncidents.query(),
        trpc.getAuditFindings.query()
      ]);

      setPolicies(policiesData);
      setControls(controlsData);
      setRisks(risksData);
      setAssets(assetsData);
      setVulnerabilities(vulnerabilitiesData);
      setIncidents(incidentsData);
      setAuditFindings(auditFindingsData);
    } catch (error) {
      console.error('Failed to load GRC data:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  const refreshData = () => {
    loadAllData();
  };

  // Calculate compliance metrics
  const compliantControls = controls.filter(c => c.status === 'compliant').length;
  const totalControls = controls.length;
  const complianceRate = totalControls > 0 ? Math.round((compliantControls / totalControls) * 100) : 0;

  const criticalRisks = risks.filter(r => r.risk_level === 'critical').length;
  const highRisks = risks.filter(r => r.risk_level === 'high').length;
  const openIncidents = incidents.filter(i => i.status === 'open' || i.status === 'investigating').length;
  const criticalVulnerabilities = vulnerabilities.filter(v => v.severity === 'critical').length;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading GRC Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <Shield className="h-8 w-8 text-blue-600" />
                GRC Dashboard
              </h1>
              <p className="text-gray-600 mt-2">Governance, Risk, and Compliance Management</p>
            </div>
            <Button onClick={refreshData} className="bg-blue-600 hover:bg-blue-700">
              Refresh Data
            </Button>
          </div>
        </div>

        {/* Key Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="border-l-4 border-l-green-500">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Compliance Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{complianceRate}%</div>
              <p className="text-xs text-gray-500 mt-1">
                {compliantControls} of {totalControls} controls compliant
              </p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-red-500">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Critical Risks</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{criticalRisks}</div>
              <p className="text-xs text-gray-500 mt-1">
                {highRisks} high-risk items
              </p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-orange-500">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Open Incidents</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{openIncidents}</div>
              <p className="text-xs text-gray-500 mt-1">
                Require immediate attention
              </p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-purple-500">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Critical Vulnerabilities</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">{criticalVulnerabilities}</div>
              <p className="text-xs text-gray-500 mt-1">
                Need immediate remediation
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="policies" className="w-full">
          <TabsList className="grid w-full grid-cols-7 mb-6">
            <TabsTrigger value="policies" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Policies
            </TabsTrigger>
            <TabsTrigger value="controls" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Controls
            </TabsTrigger>
            <TabsTrigger value="risks" className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Risks
            </TabsTrigger>
            <TabsTrigger value="assets" className="flex items-center gap-2">
              <Server className="h-4 w-4" />
              Assets
            </TabsTrigger>
            <TabsTrigger value="vulnerabilities" className="flex items-center gap-2">
              <Bug className="h-4 w-4" />
              Vulnerabilities
            </TabsTrigger>
            <TabsTrigger value="incidents" className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              Incidents
            </TabsTrigger>
            <TabsTrigger value="audit-findings" className="flex items-center gap-2">
              <Search className="h-4 w-4" />
              Audit Findings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="policies">
            <PoliciesSection 
              policies={policies} 
              setPolicies={setPolicies}
              controls={controls}
            />
          </TabsContent>

          <TabsContent value="controls">
            <ControlsSection 
              controls={controls} 
              setControls={setControls}
              policies={policies}
              risks={risks}
            />
          </TabsContent>

          <TabsContent value="risks">
            <RisksSection 
              risks={risks} 
              setRisks={setRisks}
              controls={controls}
            />
          </TabsContent>

          <TabsContent value="assets">
            <AssetsSection 
              assets={assets} 
              setAssets={setAssets}
              vulnerabilities={vulnerabilities}
              incidents={incidents}
            />
          </TabsContent>

          <TabsContent value="vulnerabilities">
            <VulnerabilitiesSection 
              vulnerabilities={vulnerabilities} 
              setVulnerabilities={setVulnerabilities}
              assets={assets}
            />
          </TabsContent>

          <TabsContent value="incidents">
            <IncidentsSection 
              incidents={incidents} 
              setIncidents={setIncidents}
              assets={assets}
            />
          </TabsContent>

          <TabsContent value="audit-findings">
            <AuditFindingsSection 
              auditFindings={auditFindings} 
              setAuditFindings={setAuditFindings}
              controls={controls}
              policies={policies}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

export default App;
