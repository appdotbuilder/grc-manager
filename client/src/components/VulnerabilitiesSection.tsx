
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { trpc } from '@/utils/trpc';
import { useState } from 'react';
import { Plus, Bug, Server, Calendar, FileText } from 'lucide-react';
import type { Vulnerability, CreateVulnerabilityInput, Asset, VulnerabilitySeverity } from '../../../server/src/schema';

interface VulnerabilitiesSectionProps {
  vulnerabilities: Vulnerability[];
  setVulnerabilities: (vulnerabilities: Vulnerability[] | ((prev: Vulnerability[]) => Vulnerability[])) => void;
  assets: Asset[];
}

export function VulnerabilitiesSection({ vulnerabilities, setVulnerabilities, assets }: VulnerabilitiesSectionProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState<CreateVulnerabilityInput>({
    name: '',
    description: null,
    severity: 'medium' as VulnerabilitySeverity,
    asset_id: null,
    cve_id: null,
    discovered_date: new Date(),
    remediation_plan: null,
    status: 'open'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);
    try {
      const newVulnerability = await trpc.createVulnerability.mutate(formData);
      setVulnerabilities((prev: Vulnerability[]) => [...prev, newVulnerability]);
      setFormData({
        name: '',
        description: null,
        severity: 'medium' as VulnerabilitySeverity,
        asset_id: null,
        cve_id: null,
        discovered_date: new Date(),
        remediation_plan: null,
        status: 'open'
      });
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Failed to create vulnerability:', error);
    } finally {
      setIsCreating(false);
    }
  };

  const getSeverityColor = (severity: VulnerabilitySeverity) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'open': return 'bg-red-100 text-red-800 border-red-200';
      case 'in_progress': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'resolved': return 'bg-green-100 text-green-800 border-green-200';
      case 'closed': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getLinkedAsset = (assetId: number | null) => {
    if (!assetId) return null;
    return assets.find(asset => asset.id === assetId);
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Vulnerability Management</h2>
          <p className="text-gray-600">Track and remediate security vulnerabilities</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              New Vulnerability
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>Create New Vulnerability</DialogTitle>
                <DialogDescription>
                  Document a new security vulnerability
                </DialogDescription>
              </DialogHeader>
              
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Vulnerability Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setFormData((prev: CreateVulnerabilityInput) => ({ ...prev, name: e.target.value }))
                    }
                    placeholder="Enter vulnerability name"
                    required
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description || ''}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                      setFormData((prev: CreateVulnerabilityInput) => ({
                        ...prev,
                        description: e.target.value || null
                      }))
                    }
                    placeholder="Vulnerability description"
                    rows={3}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="severity">Severity *</Label>
                    <Select
                      value={formData.severity}
                      onValueChange={(value: VulnerabilitySeverity) =>
                        setFormData((prev: CreateVulnerabilityInput) => ({ ...prev, severity: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="critical">Critical</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="status">Status *</Label>
                    <Select
                      value={formData.status}
                      onValueChange={(value: string) =>
                        setFormData((prev: CreateVulnerabilityInput) => ({ ...prev, status: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="open">Open</SelectItem>
                        <SelectItem value="in_progress">In Progress</SelectItem>
                        <SelectItem value="resolved">Resolved</SelectItem>
                        <SelectItem value="closed">Closed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="asset_id">Affected Asset</Label>
                    <Select
                      value={formData.asset_id?.toString() || 'none'}
                      onValueChange={(value: string) =>
                        setFormData((prev: CreateVulnerabilityInput) => ({
                          ...prev,
                          asset_id: value === 'none' ? null : parseInt(value)
                        }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select asset" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">No asset</SelectItem>
                        {assets.map((asset) => (
                          <SelectItem key={asset.id} value={asset.id.toString()}>
                            {asset.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="cve_id">CVE ID</Label>
                    <Input
                      id="cve_id"
                      value={formData.cve_id || ''}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setFormData((prev: CreateVulnerabilityInput) => ({
                          ...prev,
                          cve_id: e.target.value || null
                        }))
                      }
                      placeholder="e.g., CVE-2023-1234"
                    />
                  </div>
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="discovered_date">Discovered Date *</Label>
                  <Input
                    id="discovered_date"
                    type="date"
                    value={formData.discovered_date.toISOString().split('T')[0]}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setFormData((prev: CreateVulnerabilityInput) => ({
                        ...prev,
                        discovered_date: new Date(e.target.value)
                      }))
                    }
                    required
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="remediation_plan">Remediation Plan</Label>
                  <Textarea
                    id="remediation_plan"
                    value={formData.remediation_plan || ''}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                      setFormData((prev: CreateVulnerabilityInput) => ({
                        ...prev,
                        remediation_plan: e.target.value || null
                      }))
                    }
                    placeholder="Remediation plan and steps"
                    rows={3}
                  />
                </div>
              </div>
              
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isCreating}>
                  {isCreating ? 'Creating...' : 'Create Vulnerability'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {vulnerabilities.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Bug className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No vulnerabilities found</h3>
            <p className="text-gray-500 text-center mb-4">
              Start by documenting security vulnerabilities in your environment
            </p>
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Document First Vulnerability
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card className="border-l-4 border-l-red-500">
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-red-600">
                  {vulnerabilities.filter(v => v.severity === 'critical').length}
                </div>
                <p className="text-sm text-gray-600">Critical</p>
              </CardContent>
            </Card>
            <Card className="border-l-4 border-l-orange-500">
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-orange-600">
                  {vulnerabilities.filter(v => v.severity === 'high').length}
                </div>
                <p className="text-sm text-gray-600">High</p>
              </CardContent>
            </Card>
            <Card className="border-l-4 border-l-yellow-500">
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-yellow-600">
                  {vulnerabilities.filter(v => v.severity === 'medium').length}
                </div>
                <p className="text-sm text-gray-600">Medium</p>
              </CardContent>
            </Card>
            <Card className="border-l-4 border-l-green-500">
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-green-600">
                  {vulnerabilities.filter(v => v.severity === 'low').length}
                </div>
                <p className="text-sm text-gray-600">Low</p>
              </CardContent>
            </Card>
          </div>
          
          {vulnerabilities.map((vulnerability: Vulnerability) => {
            const linkedAsset = getLinkedAsset(vulnerability.asset_id);
            
            return (
              <Card key={vulnerability.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="flex items-center gap-2">
                        <Bug className="h-5 w-5 text-red-600" />
                        {vulnerability.name}
                        <Badge className={getSeverityColor(vulnerability.severity)}>
                          {vulnerability.severity.toUpperCase()}
                        </Badge>
                        <Badge className={getStatusColor(vulnerability.status)}>
                          {vulnerability.status.replace('_', ' ')}
                        </Badge>
                        {vulnerability.cve_id && (
                          <Badge variant="outline">{vulnerability.cve_id}</Badge>
                        )}
                      </CardTitle>
                      {vulnerability.description && (
                        <CardDescription className="mt-2">
                          {vulnerability.description}
                        </CardDescription>
                      )}
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="h-4 w-4" />
                      <span>Discovered: {formatDate(vulnerability.discovered_date)}</span>
                    </div>
                    
                    {linkedAsset && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Server className="h-4 w-4" />
                        <span>Asset: {linkedAsset.name}</span>
                      </div>
                    )}
                    
                    <div className="text-sm text-gray-600">
                      <span className="font-medium">Status:</span> {vulnerability.status.replace('_', ' ')}
                    </div>
                  </div>
                  
                  {vulnerability.remediation_plan && (
                    <div className="border-t pt-4">
                      <div className="flex items-start gap-2">
                        <FileText className="h-4 w-4 text-gray-500 mt-0.5" />
                        <div>
                          <span className="text-sm font-medium">Remediation Plan:</span>
                          <p className="text-sm text-gray-600 mt-1">{vulnerability.remediation_plan}</p>
                        </div>
                      </div>
                      
                      <div className="text-xs text-gray-500 mt-4">
                        Created: {formatDate(vulnerability.created_at)}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
