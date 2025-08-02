
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
import { Plus, Search, Shield, FileText, Calendar, User } from 'lucide-react';
import type { AuditFinding, CreateAuditFindingInput, Control, Policy, AuditFindingStatus } from '../../../server/src/schema';

interface AuditFindingsSectionProps {
  auditFindings: AuditFinding[];
  setAuditFindings: (auditFindings: AuditFinding[] | ((prev: AuditFinding[]) => AuditFinding[])) => void;
  controls: Control[];
  policies: Policy[];
}

export function AuditFindingsSection({ auditFindings, setAuditFindings, controls, policies }: AuditFindingsSectionProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState<CreateAuditFindingInput>({
    title: '',
    description: null,
    status: 'open' as AuditFindingStatus,
    control_id: null,
    policy_id: null,
    severity: '',
    auditor: '',
    audit_date: new Date(),
    due_date: null,
    remediation_plan: null
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);
    try {
      const newAuditFinding = await trpc.createAuditFinding.mutate(formData);
      setAuditFindings((prev: AuditFinding[]) => [...prev, newAuditFinding]);
      setFormData({
        title: '',
        description: null,
        status: 'open' as AuditFindingStatus,
        control_id: null,
        policy_id: null,
        severity: '',
        auditor: '',
        audit_date: new Date(),
        due_date: null,
        remediation_plan: null
      });
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Failed to create audit finding:', error);
    } finally {
      setIsCreating(false);
    }
  };

  const getStatusColor = (status: AuditFindingStatus) => {
    switch (status) {
      case 'open': return 'bg-red-100 text-red-800 border-red-200';
      case 'in_progress': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'resolved': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'closed': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getLinkedControl = (controlId: number | null) => {
    if (!controlId) return null;
    return controls.find(control => control.id === controlId);
  };

  const getLinkedPolicy = (policyId: number | null) => {
    if (!policyId) return null;
    return policies.find(policy => policy.id === policyId);
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString();
  };

  const isDueDateOverdue = (dueDate: Date | null) => {
    if (!dueDate) return false;
    return new Date(dueDate) < new Date();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Audit Findings</h2>
          <p className="text-gray-600">Track audit findings and compliance issues</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              New Audit Finding
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>Create New Audit Finding</DialogTitle>
                <DialogDescription>
                  Document a new audit finding or compliance issue
                </DialogDescription>
              </DialogHeader>
              
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="title">Finding Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setFormData((prev: CreateAuditFindingInput) => ({ ...prev, title: e.target.value }))
                    }
                    placeholder="Enter audit finding title"
                    required
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description || ''}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                      setFormData((prev: CreateAuditFindingInput) => ({
                        ...prev,
                        description: e.target.value || null
                      }))
                    }
                    placeholder="Detailed description of the finding"
                    rows={3}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="severity">Severity *</Label>
                    <Select
                      value={formData.severity || 'medium'}
                      onValueChange={(value: string) =>
                        setFormData((prev: CreateAuditFindingInput) => ({ ...prev, severity: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select severity" />
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
                      onValueChange={(value: AuditFindingStatus) =>
                        setFormData((prev: CreateAuditFindingInput) => ({ ...prev, status: value }))
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
                    <Label htmlFor="auditor">Auditor *</Label>
                    <Input
                      id="auditor"
                      value={formData.auditor}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setFormData((prev: CreateAuditFindingInput) => ({ ...prev, auditor: e.target.value }))
                      }
                      placeholder="Auditor name"
                      required
                    />
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="audit_date">Audit Date *</Label>
                    <Input
                      id="audit_date"
                      type="date"
                      value={formData.audit_date.toISOString().split('T')[0]}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setFormData((prev: CreateAuditFindingInput) => ({
                          ...prev,
                          audit_date: new Date(e.target.value)
                        }))
                      }
                      required
                    />
                  </div>
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="due_date">Due Date</Label>
                  <Input
                    id="due_date"
                    type="date"
                    value={formData.due_date?.toISOString().split('T')[0] || ''}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setFormData((prev: CreateAuditFindingInput) => ({
                        ...prev,
                        due_date: e.target.value ? new Date(e.target.value) : null
                      }))
                    }
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="control_id">Related Control</Label>
                    <Select
                      value={formData.control_id?.toString() || 'none'}
                      onValueChange={(value: string) =>
                        setFormData((prev: CreateAuditFindingInput) => ({
                          ...prev,
                          control_id: value === 'none' ? null : parseInt(value)
                        }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select control" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">No control</SelectItem>
                        {controls.map((control) => (
                          <SelectItem key={control.id} value={control.id.toString()}>
                            {control.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="policy_id">Related Policy</Label>
                    <Select
                      value={formData.policy_id?.toString() || 'none'}
                      onValueChange={(value: string) =>
                        setFormData((prev: CreateAuditFindingInput) => ({
                          ...prev,
                          policy_id: value === 'none' ? null : parseInt(value)
                        }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select policy" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">No policy</SelectItem>
                        {policies.map((policy) => (
                          <SelectItem key={policy.id} value={policy.id.toString()}>
                            {policy.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="remediation_plan">Remediation Plan</Label>
                  <Textarea
                    id="remediation_plan"
                    value={formData.remediation_plan || ''}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                      setFormData((prev: CreateAuditFindingInput) => ({
                        ...prev,
                        remediation_plan: e.target.value || null
                      }))
                    }
                    placeholder="Plan to address the finding"
                    rows={3}
                  />
                </div>
              </div>
              
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isCreating}>
                  {isCreating ? 'Creating...' : 'Create Finding'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {auditFindings.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Search className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No audit findings found</h3>
            <p className="text-gray-500 text-center mb-4">
              Start by documenting audit findings and compliance issues
            </p>
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create First Finding
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card className="border-l-4 border-l-red-500">
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-red-600">
                  {auditFindings.filter(f => f.status === 'open').length}
                </div>
                <p className="text-sm text-gray-600">Open</p>
              </CardContent>
            </Card>
            <Card className="border-l-4 border-l-yellow-500">
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-yellow-600">
                  {auditFindings.filter(f => f.status === 'in_progress').length}
                </div>
                <p className="text-sm text-gray-600">In Progress</p>
              </CardContent>
            </Card>
            <Card className="border-l-4 border-l-blue-500">
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-blue-600">
                  {auditFindings.filter(f => f.status === 'resolved').length}
                </div>
                <p className="text-sm text-gray-600">Resolved</p>
              </CardContent>
            </Card>
            <Card className="border-l-4 border-l-green-500">
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-green-600">
                  {auditFindings.filter(f => f.status === 'closed').length}
                </div>
                <p className="text-sm text-gray-600">Closed</p>
              </CardContent>
            </Card>
          </div>
          
          {auditFindings.map((finding: AuditFinding) => {
            const linkedControl = getLinkedControl(finding.control_id);
            const linkedPolicy = getLinkedPolicy(finding.policy_id);
            const isOverdue = isDueDateOverdue(finding.due_date);
            
            return (
              <Card key={finding.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="flex items-center gap-2">
                        <Search className="h-5 w-5 text-purple-600" />
                        {finding.title}
                        <Badge className={getSeverityColor(finding.severity)}>
                          {finding.severity.toUpperCase()}
                        </Badge>
                        <Badge className={getStatusColor(finding.status)}>
                          {finding.status.replace('_', ' ')}
                        </Badge>
                        {isOverdue && (
                          <Badge variant="destructive">Overdue</Badge>
                        )}
                      </CardTitle>
                      {finding.description && (
                        <CardDescription className="mt-2">
                          {finding.description}
                        </CardDescription>
                      )}
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <User className="h-4 w-4" />
                      <span>Auditor: {finding.auditor}</span>
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="h-4 w-4" />
                      <span>Audit Date: {formatDate(finding.audit_date)}</span>
                    </div>
                    
                    {finding.due_date && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Calendar className="h-4 w-4" />
                        <span className={isOverdue ? 'text-red-600 font-medium' : ''}>
                          Due: {formatDate(finding.due_date)}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  <div className="border-t pt-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      {linkedControl && (
                        <div className="flex items-center gap-2">
                          <Shield className="h-4 w-4 text-blue-500" />
                          <span className="text-sm font-medium">Related Control:</span>
                          <Badge variant="outline">{linkedControl.name}</Badge>
                        </div>
                      )}
                      
                      {linkedPolicy && (
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-green-500" />
                          <span className="text-sm font-medium">Related Policy:</span>
                          <Badge variant="outline">{linkedPolicy.title}</Badge>
                        </div>
                      )}
                    </div>
                    
                    {finding.remediation_plan && (
                      <div className="flex items-start gap-2 mb-4">
                        <FileText className="h-4 w-4 text-gray-500 mt-0.5" />
                        <div>
                          <span className="text-sm font-medium">Remediation Plan:</span>
                          <p className="text-sm text-gray-600 mt-1">{finding.remediation_plan}</p>
                        </div>
                      </div>
                    )}
                    
                    <div className="text-xs text-gray-500">
                      Created: {formatDate(finding.created_at)}
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
