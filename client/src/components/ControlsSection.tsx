
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
import { Plus, Shield, Calendar, User } from 'lucide-react';
import type { Control, CreateControlInput, Policy, Risk, ControlStatus } from '../../../server/src/schema';

interface ControlsSectionProps {
  controls: Control[];
  setControls: (controls: Control[] | ((prev: Control[]) => Control[])) => void;
  policies: Policy[];
  risks: Risk[];
}

export function ControlsSection({ controls, setControls, policies, risks }: ControlsSectionProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState<CreateControlInput>({
    name: '',
    description: null,
    control_type: '',
    status: 'draft' as ControlStatus,
    policy_id: null,
    owner: '',
    implementation_date: null,
    last_audit_date: null
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);
    try {
      const newControl = await trpc.createControl.mutate(formData);
      setControls((prev: Control[]) => [...prev, newControl]);
      setFormData({
        name: '',
        description: null,
        control_type: '',
        status: 'draft' as ControlStatus,
        policy_id: null,
        owner: '',
        implementation_date: null,
        last_audit_date: null
      });
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Failed to create control:', error);
    } finally {
      setIsCreating(false);
    }
  };

  const getStatusColor = (status: ControlStatus) => {
    switch (status) {
      case 'compliant': return 'bg-green-100 text-green-800 border-green-200';
      case 'implemented': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'audited': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'non_compliant': return 'bg-red-100 text-red-800 border-red-200';
      case 'draft': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getLinkedRisks = (controlId: number) => {
    return risks.filter(risk => risk.control_id === controlId);
  };

  const getLinkedPolicy = (policyId: number | null) => {
    if (!policyId) return null;
    return policies.find(policy => policy.id === policyId);
  };

  const formatDate = (date: Date | null) => {
    if (!date) return 'Not set';
    return new Date(date).toLocaleDateString();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Control Management</h2>
          <p className="text-gray-600">Security and compliance controls</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              New Control
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>Create New Control</DialogTitle>
                <DialogDescription>
                  Add a new security or compliance control
                </DialogDescription>
              </DialogHeader>
              
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Control Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setFormData((prev: CreateControlInput) => ({ ...prev, name: e.target.value }))
                    }
                    placeholder="Enter control name"
                    required
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description || ''}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                      setFormData((prev: CreateControlInput) => ({
                        ...prev,
                        description: e.target.value || null
                      }))
                    }
                    placeholder="Control description"
                    rows={3}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="control_type">Control Type *</Label>
                    <Input
                      id="control_type"
                      value={formData.control_type}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setFormData((prev: CreateControlInput) => ({ ...prev, control_type: e.target.value }))
                      }
                      placeholder="e.g., Technical, Administrative"
                      required
                    />
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="status">Status *</Label>
                    <Select
                      value={formData.status}
                      onValueChange={(value: ControlStatus) =>
                        setFormData((prev: CreateControlInput) => ({ ...prev, status: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="implemented">Implemented</SelectItem>
                        <SelectItem value="audited">Audited</SelectItem>
                        <SelectItem value="compliant">Compliant</SelectItem>
                        <SelectItem value="non_compliant">Non-Compliant</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="policy_id">Linked Policy</Label>
                    <Select
                      value={formData.policy_id?.toString() || 'none'}
                      onValueChange={(value: string) =>
                        setFormData((prev: CreateControlInput) => ({
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
                  
                  <div className="grid gap-2">
                    <Label htmlFor="owner">Owner *</Label>
                    <Input
                      id="owner"
                      value={formData.owner}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setFormData((prev: CreateControlInput) => ({ ...prev, owner: e.target.value }))
                      }
                      placeholder="Control owner"
                      required
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  
                  <div className="grid gap-2">
                    <Label htmlFor="implementation_date">Implementation Date</Label>
                    <Input
                      id="implementation_date"
                      type="date"
                      value={formData.implementation_date?.toISOString().split('T')[0] || ''}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setFormData((prev: CreateControlInput) => ({
                          ...prev,
                          implementation_date: e.target.value ? new Date(e.target.value) : null
                        }))
                      }
                    />
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="last_audit_date">Last Audit Date</Label>
                    <Input
                      id="last_audit_date"
                      type="date"
                      value={formData.last_audit_date?.toISOString().split('T')[0] || ''}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setFormData((prev: CreateControlInput) => ({
                          ...prev,
                          last_audit_date: e.target.value ? new Date(e.target.value) : null
                        }))
                      }
                    />
                  </div>
                </div>
              </div>
              
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isCreating}>
                  {isCreating ? 'Creating...' : 'Create Control'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {controls.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Shield className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No controls found</h3>
            <p className="text-gray-500 text-center mb-4">
              Start by creating your first security or compliance control
            </p>
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create First Control
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {controls.map((control: Control) => {
            const linkedRisks = getLinkedRisks(control.id);
            const linkedPolicy = getLinkedPolicy(control.policy_id);
            
            return (
              <Card key={control.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="flex items-center gap-2">
                        <Shield className="h-5 w-5 text-blue-600" />
                        {control.name}
                        <Badge className={getStatusColor(control.status)}>
                          {control.status.replace('_', ' ')}
                        </Badge>
                      </CardTitle>
                      {control.description && (
                        <CardDescription className="mt-2">
                          {control.description}
                        </CardDescription>
                      )}
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <User className="h-4 w-4" />
                      <span>Owner: {control.owner}</span>
                    </div>
                    
                    <div className="text-sm text-gray-600">
                      <span className="font-medium">Type:</span> {control.control_type}
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="h-4 w-4" />
                      <span>Implemented: {formatDate(control.implementation_date)}</span>
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="h-4 w-4" />
                      <span>Last Audit: {formatDate(control.last_audit_date)}</span>
                    </div>
                  </div>
                  
                  <div className="border-t pt-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        {linkedPolicy && (
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-sm font-medium">Linked Policy:</span>
                            <Badge variant="outline">{linkedPolicy.title}</Badge>
                          </div>
                        )}
                        
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">Mitigated Risks:</span>
                          <Badge variant="outline">
                            {linkedRisks.length} risk{linkedRisks.length !== 1 ? 's' : ''}
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="text-xs text-gray-500 text-right">
                        Created: {formatDate(control.created_at)}
                      </div>
                    </div>
                    
                    {linkedRisks.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {linkedRisks.slice(0, 3).map((risk) => (
                          <Badge 
                            key={risk.id} 
                            variant={risk.risk_level === 'critical' ? 'destructive' : 'secondary'}
                            className="text-xs"
                          >
                            {risk.name}
                          </Badge>
                        ))}
                        {linkedRisks.length > 3 && (
                          <Badge variant="secondary" className="text-xs">
                            +{linkedRisks.length - 3} more
                          </Badge>
                        )}
                      </div>
                    )}
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
