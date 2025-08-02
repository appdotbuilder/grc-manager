
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
import { Plus, AlertTriangle, User, TrendingUp, Target } from 'lucide-react';
import type { Risk, CreateRiskInput, Control, RiskLevel } from '../../../server/src/schema';

interface RisksSectionProps {
  risks: Risk[];
  setRisks: (risks: Risk[] | ((prev: Risk[]) => Risk[])) => void;
  controls: Control[];
}

export function RisksSection({ risks, setRisks, controls }: RisksSectionProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState<CreateRiskInput>({
    name: '',
    description: null,
    risk_level: 'medium' as RiskLevel,
    likelihood: 3,
    impact: 3,
    control_id: null,
    owner: '',
    mitigation_strategy: null
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);
    try {
      const newRisk = await trpc.createRisk.mutate(formData);
      setRisks((prev: Risk[]) => [...prev, newRisk]);
      setFormData({
        name: '',
        description: null,
        risk_level: 'medium' as RiskLevel,
        likelihood: 3,
        impact: 3,
        control_id: null,
        owner: '',
        mitigation_strategy: null
      });
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Failed to create risk:', error);
    } finally {
      setIsCreating(false);
    }
  };

  const getRiskLevelColor = (level: RiskLevel) => {
    switch (level) {
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

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString();
  };

  const calculateRiskScore = (likelihood: number, impact: number) => {
    return likelihood * impact;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Risk Management</h2>
          <p className="text-gray-600">Identify and manage organizational risks</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              New Risk
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>Create New Risk</DialogTitle>
                <DialogDescription>
                  Add a new organizational risk
                </DialogDescription>
              </DialogHeader>
              
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Risk Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setFormData((prev: CreateRiskInput) => ({ ...prev, name: e.target.value }))
                    }
                    placeholder="Enter risk name"
                    required
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description || ''}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                      setFormData((prev: CreateRiskInput) => ({
                        ...prev,
                        description: e.target.value || null
                      }))
                    }
                    placeholder="Risk description"
                    rows={3}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="risk_level">Risk Level *</Label>
                    <Select
                      value={formData.risk_level}
                      onValueChange={(value: RiskLevel) =>
                        setFormData((prev: CreateRiskInput) => ({ ...prev, risk_level: value }))
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
                    <Label htmlFor="owner">Owner *</Label>
                    <Input
                      id="owner"
                      value={formData.owner}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setFormData((prev: CreateRiskInput) => ({ ...prev, owner: e.target.value }))
                      }
                      placeholder="Risk owner"
                      required
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="likelihood">Likelihood (1-5) *</Label>
                    <Select
                      value={formData.likelihood.toString()}
                      onValueChange={(value: string) =>
                        setFormData((prev: CreateRiskInput) => ({ ...prev, likelihood: parseInt(value) }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1 - Very Low</SelectItem>
                        <SelectItem value="2">2 - Low</SelectItem>
                        <SelectItem value="3">3 - Medium</SelectItem>
                        <SelectItem value="4">4 - High</SelectItem>
                        <SelectItem value="5">5 - Very High</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="impact">Impact (1-5) *</Label>
                    <Select
                      value={formData.impact.toString()}
                      onValueChange={(value: string) =>
                        setFormData((prev: CreateRiskInput) => ({ ...prev, impact: parseInt(value) }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1 - Very Low</SelectItem>
                        <SelectItem value="2">2 - Low</SelectItem>
                        <SelectItem value="3">3 - Medium</SelectItem>
                        <SelectItem value="4">4 - High</SelectItem>
                        <SelectItem value="5">5 - Very High</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="control_id">Mitigation Control</Label>
                  <Select
                    value={formData.control_id?.toString() || 'none'}
                    onValueChange={(value: string) =>
                      setFormData((prev: CreateRiskInput) => ({
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
                  <Label htmlFor="mitigation_strategy">Mitigation Strategy</Label>
                  <Textarea
                    id="mitigation_strategy"
                    value={formData.mitigation_strategy || ''}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                      setFormData((prev: CreateRiskInput) => ({
                        ...prev,
                        mitigation_strategy: e.target.value || null
                      }))
                    }
                    placeholder="Risk mitigation strategy"
                    rows={3}
                  />
                </div>
              </div>
              
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isCreating}>
                  {isCreating ? 'Creating...' : 'Create Risk'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {risks.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <AlertTriangle className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No risks found</h3>
            <p className="text-gray-500 text-center mb-4">
              Start by identifying and documenting organizational risks
            </p>
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create First Risk
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card className="border-l-4 border-l-red-500">
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-red-600">
                  {risks.filter(r => r.risk_level === 'critical').length}
                </div>
                <p className="text-sm text-gray-600">Critical Risks</p>
              </CardContent>
            </Card>
            <Card className="border-l-4 border-l-orange-500">
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-orange-600">
                  {risks.filter(r => r.risk_level === 'high').length}
                </div>
                <p className="text-sm text-gray-600">High Risks</p>
              </CardContent>
            </Card>
            <Card className="border-l-4 border-l-yellow-500">
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-yellow-600">
                  {risks.filter(r => r.risk_level === 'medium').length}
                </div>
                <p className="text-sm text-gray-600">Medium Risks</p>
              </CardContent>
            </Card>
            <Card className="border-l-4 border-l-green-500">
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-green-600">
                  {risks.filter(r => r.risk_level === 'low').length}
                </div>
                <p className="text-sm text-gray-600">Low Risks</p>
              </CardContent>
            </Card>
          </div>
          
          {risks.map((risk: Risk) => {
            const linkedControl = getLinkedControl(risk.control_id);
            const riskScore = calculateRiskScore(risk.likelihood, risk.impact);
            
            return (
              <Card key={risk.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-orange-600" />
                        {risk.name}
                        <Badge className={getRiskLevelColor(risk.risk_level)}>
                          {risk.risk_level.toUpperCase()}
                        </Badge>
                        <Badge variant="outline">
                          Score: {riskScore}/25
                        </Badge>
                      </CardTitle>
                      {risk.description && (
                        <CardDescription className="mt-2">
                          {risk.description}
                        </CardDescription>
                      )}
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <User className="h-4 w-4" />
                      <span>Owner: {risk.owner}</span>
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <TrendingUp className="h-4 w-4" />
                      <span>Likelihood: {risk.likelihood}/5</span>
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Target className="h-4 w-4" />
                      <span>Impact: {risk.impact}/5</span>
                    </div>
                    
                    <div className="text-sm text-gray-600">
                      <span className="font-medium">Risk Score:</span> {riskScore}/25
                    </div>
                  </div>
                  
                  <div className="border-t pt-4">
                    <div className="grid grid-cols-1 gap-4">
                      {linkedControl && (
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">Mitigation Control:</span>
                          <Badge variant="outline">{linkedControl.name}</Badge>
                          <Badge className={linkedControl.status === 'compliant' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                            {linkedControl.status}
                          </Badge>
                        </div>
                      )}
                      
                      {risk.mitigation_strategy && (
                        <div>
                          <span className="text-sm font-medium">Mitigation Strategy:</span>
                          <p className="text-sm text-gray-600 mt-1">{risk.mitigation_strategy}</p>
                        </div>
                      )}
                      
                      <div className="text-xs text-gray-500">
                        Created: {formatDate(risk.created_at)}
                      </div>
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
