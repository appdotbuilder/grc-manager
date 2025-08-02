
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
import { Plus, AlertCircle, Server, Calendar, User, FileText } from 'lucide-react';
import type { Incident, CreateIncidentInput, Asset, IncidentSeverity, IncidentStatus } from '../../../server/src/schema';

interface IncidentsSectionProps {
  incidents: Incident[];
  setIncidents: (incidents: Incident[] | ((prev: Incident[]) => Incident[])) => void;
  assets: Asset[];
}

export function IncidentsSection({ incidents, setIncidents, assets }: IncidentsSectionProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState<CreateIncidentInput>({
    title: '',
    description: null,
    severity: 'medium' as IncidentSeverity,
    status: 'open' as IncidentStatus,
    asset_id: null,
    discovered_date: new Date(),
    resolved_date: null,
    root_cause: null,
    remediation_actions: null,
    reporter: '',
    assigned_to: null
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);
    try {
      const newIncident = await trpc.createIncident.mutate(formData);
      setIncidents((prev: Incident[]) => [...prev, newIncident]);
      setFormData({
        title: '',
        description: null,
        severity: 'medium' as IncidentSeverity,
        status: 'open' as IncidentStatus,
        asset_id: null,
        discovered_date: new Date(),
        resolved_date: null,
        root_cause: null,
        remediation_actions: null,
        
        reporter: '',
        assigned_to: null
      });
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Failed to create incident:', error);
    } finally {
      setIsCreating(false);
    }
  };

  const getSeverityColor = (severity: IncidentSeverity) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status: IncidentStatus) => {
    switch (status) {
      case 'open': return 'bg-red-100 text-red-800 border-red-200';
      case 'investigating': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'resolved': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'closed': return 'bg-green-100 text-green-800 border-green-200';
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

  const calculateResolutionTime = (discoveredDate: Date, resolvedDate: Date | null) => {
    if (!resolvedDate) return null;
    const diffTime = Math.abs(new Date(resolvedDate).getTime() - new Date(discoveredDate).getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Incident Management</h2>
          <p className="text-gray-600">Track and respond to security incidents</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              New Incident
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>Create New Incident</DialogTitle>
                <DialogDescription>
                  Report a new security incident
                </DialogDescription>
              </DialogHeader>
              
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="title">Incident Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setFormData((prev: CreateIncidentInput) => ({ ...prev, title: e.target.value }))
                    }
                    placeholder="Enter incident title"
                    required
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description || ''}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                      setFormData((prev: CreateIncidentInput) => ({
                        ...prev,
                        description: e.target.value || null
                      }))
                    }
                    placeholder="Incident description"
                    rows={3}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="severity">Severity *</Label>
                    <Select
                      value={formData.severity}
                      onValueChange={(value: IncidentSeverity)  =>
                        setFormData((prev: CreateIncidentInput) => ({ ...prev, severity: value }))
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
                      onValueChange={(value: IncidentStatus) =>
                        setFormData((prev: CreateIncidentInput) => ({ ...prev, status: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="open">Open</SelectItem>
                        <SelectItem value="investigating">Investigating</SelectItem>
                        <SelectItem value="resolved">Resolved</SelectItem>
                        <SelectItem value="closed">Closed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="reporter">Reporter *</Label>
                    <Input
                      id="reporter"
                      value={formData.reporter}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setFormData((prev: CreateIncidentInput) => ({ ...prev, reporter: e.target.value }))
                      }
                      placeholder="Incident reporter"
                      required
                    />
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="assigned_to">Assigned To</Label>
                    <Input
                      id="assigned_to"
                      value={formData.assigned_to || ''}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setFormData((prev: CreateIncidentInput) => ({
                          ...prev,
                          assigned_to: e.target.value || null
                        }))
                      }
                      placeholder="Assigned to"
                    />
                  </div>
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="asset_id">Affected Asset</Label>
                  <Select
                    value={formData.asset_id?.toString() || 'none'}
                    onValueChange={(value: string) =>
                      setFormData((prev: CreateIncidentInput) => ({
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
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="discovered_date">Discovered Date *</Label>
                    <Input
                      id="discovered_date"
                      type="date"
                      value={formData.discovered_date.toISOString().split('T')[0]}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setFormData((prev: CreateIncidentInput) => ({
                          ...prev,
                          discovered_date: new Date(e.target.value)
                        }))
                      }
                      required
                    />
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="resolved_date">Resolved Date</Label>
                    <Input
                      id="resolved_date"
                      type="date"
                      value={formData.resolved_date?.toISOString().split('T')[0] || ''}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setFormData((prev: CreateIncidentInput) => ({
                          ...prev,
                          resolved_date: e.target.value ? new Date(e.target.value) : null
                        }))
                      }
                    />
                  </div>
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="root_cause">Root Cause</Label>
                  <Textarea
                    id="root_cause"
                    value={formData.root_cause || ''}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                      setFormData((prev: CreateIncidentInput) => ({
                        ...prev,
                        root_cause: e.target.value || null
                      }))
                    }
                    placeholder="Root cause analysis"
                    rows={2}
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="remediation_actions">Remediation Actions</Label>
                  <Textarea
                    id="remediation_actions"
                    value={formData.remediation_actions || ''}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                      setFormData((prev: CreateIncidentInput) => ({
                        ...prev,
                        remediation_actions: e.target.value || null
                      }))
                    }
                    placeholder="Actions taken to resolve the incident"
                    rows={2}
                  />
                </div>
              </div>
              
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isCreating}>
                  {isCreating ? 'Creating...' : 'Create Incident'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {incidents.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <AlertCircle className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No incidents found</h3>
            <p className="text-gray-500 text-center mb-4">
              Fortunately, no security incidents have been reported yet
            </p>
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Report Incident
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card className="border-l-4 border-l-red-500">
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-red-600">
                  {incidents.filter(i => i.status === 'open').length}
                </div>
                <p className="text-sm text-gray-600">Open</p>
              </CardContent>
            </Card>
            <Card className="border-l-4 border-l-yellow-500">
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-yellow-600">
                  {incidents.filter(i => i.status === 'investigating').length}
                </div>
                <p className="text-sm text-gray-600">Investigating</p>
              </CardContent>
            </Card>
            <Card className="border-l-4 border-l-blue-500">
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-blue-600">
                  {incidents.filter(i => i.status === 'resolved').length}
                </div>
                <p className="text-sm text-gray-600">Resolved</p>
              </CardContent>
            </Card>
            <Card className="border-l-4 border-l-green-500">
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-green-600">
                  {incidents.filter(i => i.status === 'closed').length}
                </div>
                <p className="text-sm text-gray-600">Closed</p>
              </CardContent>
            </Card>
          </div>
          
          {incidents.map((incident: Incident) => {
            const linkedAsset = getLinkedAsset(incident.asset_id);
            const resolutionTime = calculateResolutionTime(incident.discovered_date, incident.resolved_date);
            
            return (
              <Card key={incident.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="flex items-center gap-2">
                        <AlertCircle className="h-5 w-5 text-red-600" />
                        {incident.title}
                        <Badge className={getSeverityColor(incident.severity)}>
                          {incident.severity.toUpperCase()}
                        </Badge>
                        <Badge className={getStatusColor(incident.status)}>
                          {incident.status.replace('_', ' ')}
                        </Badge>
                      </CardTitle>
                      {incident.description && (
                        <CardDescription className="mt-2">
                          {incident.description}
                        </CardDescription>
                      )}
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <User className="h-4 w-4" />
                      <span>Reporter: {incident.reporter}</span>
                    </div>
                    
                    {incident.assigned_to && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <User className="h-4 w-4" />
                        <span>Assigned: {incident.assigned_to}</span>
                      </div>
                    )}
                    
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="h-4 w-4" />
                      <span>Discovered: {formatDate(incident.discovered_date)}</span>
                    </div>
                    
                    {incident.resolved_date && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Calendar className="h-4 w-4" />
                        <span>Resolved: {formatDate(incident.resolved_date)}</span>
                      </div>
                    )}
                  </div>
                  
                  {linkedAsset && (
                    <div className="flex items-center gap-2 mb-4 text-sm text-gray-600">
                      <Server className="h-4 w-4" />
                      <span>Affected Asset: {linkedAsset.name}</span>
                    </div>
                  )}
                  
                  {resolutionTime && (
                    <div className="mb-4">
                      <Badge variant="outline">
                        Resolved in {resolutionTime} day{resolutionTime !== 1 ? 's' : ''}
                      </Badge>
                    </div>
                  )}
                  
                  <div className="border-t pt-4 space-y-3">
                    {incident.root_cause && (
                      <div className="flex items-start gap-2">
                        <FileText className="h-4 w-4 text-gray-500 mt-0.5" />
                        <div>
                          <span className="text-sm font-medium">Root Cause:</span>
                          <p className="text-sm text-gray-600 mt-1">{incident.root_cause}</p>
                        </div>
                      </div>
                    )}
                    
                    {incident.remediation_actions && (
                      <div className="flex items-start gap-2">
                        <FileText className="h-4 w-4 text-gray-500 mt-0.5" />
                        <div>
                          <span className="text-sm font-medium">Remediation Actions:</span>
                          <p className="text-sm text-gray-600 mt-1">{incident.remediation_actions}</p>
                        </div>
                      </div>
                    )}
                    
                    <div className="text-xs text-gray-500">
                      Created: {formatDate(incident.created_at)}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
