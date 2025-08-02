
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { trpc } from '@/utils/trpc';
import { useState } from 'react';
import { Plus, FileText, Calendar, User } from 'lucide-react';
import type { Policy, CreatePolicyInput, Control } from '../../../server/src/schema';

interface PoliciesSectionProps {
  policies: Policy[];
  setPolicies: (policies: Policy[] | ((prev: Policy[]) => Policy[])) => void;
  controls: Control[];
}

export function PoliciesSection({ policies, setPolicies, controls }: PoliciesSectionProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState<CreatePolicyInput>({
    title: '',
    description: null,
    version: '1.0',
    effective_date: new Date(),
    review_date: null,
    owner: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);
    try {
      const newPolicy = await trpc.createPolicy.mutate(formData);
      setPolicies((prev: Policy[]) => [...prev, newPolicy]);
      setFormData({
        title: '',
        description: null,
        version: '1.0',
        effective_date: new Date(),
        review_date: null,
        owner: ''
      });
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Failed to create policy:', error);
    } finally {
      setIsCreating(false);
    }
  };

  const getLinkedControls = (policyId: number) => {
    return controls.filter(control => control.policy_id === policyId);
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString();
  };

  const isReviewDue = (reviewDate: Date | null) => {
    if (!reviewDate) return false;
    return new Date(reviewDate) < new Date();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Policy Management</h2>
          <p className="text-gray-600">Organizational rules and guidelines</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              New Policy
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>Create New Policy</DialogTitle>
                <DialogDescription>
                  Add a new organizational policy document
                </DialogDescription>
              </DialogHeader>
              
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="title">Policy Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setFormData((prev: CreatePolicyInput) => ({ ...prev, title: e.target.value }))
                    }
                    placeholder="Enter policy title"
                    required
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description || ''}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                      setFormData((prev: CreatePolicyInput) => ({
                        ...prev,
                        description: e.target.value || null
                      }))
                    }
                    placeholder="Policy description"
                    rows={3}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="version">Version *</Label>
                    <Input
                      id="version"
                      value={formData.version}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setFormData((prev: CreatePolicyInput) => ({ ...prev, version: e.target.value }))
                      }
                      placeholder="1.0"
                      required
                    />
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="owner">Owner *</Label>
                    <Input
                      id="owner"
                      value={formData.owner}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setFormData((prev: CreatePolicyInput) => ({ ...prev, owner: e.target.value }))
                      }
                      placeholder="Policy owner"
                      required
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="effective_date">Effective Date *</Label>
                    <Input
                      id="effective_date"
                      type="date"
                      value={formData.effective_date.toISOString().split('T')[0]}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setFormData((prev: CreatePolicyInput) => ({
                          ...prev,
                          effective_date: new Date(e.target.value)
                        }))
                      }
                      required
                    />
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="review_date">Review Date</Label>
                    <Input
                      id="review_date"
                      type="date"
                      value={formData.review_date?.toISOString().split('T')[0] || ''}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setFormData((prev: CreatePolicyInput) => ({
                          ...prev,
                          review_date: e.target.value ? new Date(e.target.value) : null
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
                  {isCreating ? 'Creating...' : 'Create Policy'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {policies.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No policies found</h3>
            <p className="text-gray-500 text-center mb-4">
              Get started by creating your first organizational policy
            </p>
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create First Policy
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {policies.map((policy: Policy) => {
            const linkedControls = getLinkedControls(policy.id);
            const reviewDue = isReviewDue(policy.review_date);
            
            return (
              <Card key={policy.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="flex items-center gap-2">
                        <FileText className="h-5 w-5 text-blue-600" />
                        {policy.title}
                        <Badge variant="secondary">v{policy.version}</Badge>
                        {reviewDue && (
                          <Badge variant="destructive">Review Due</Badge>
                        )}
                      </CardTitle>
                      {policy.description && (
                        <CardDescription className="mt-2">
                          {policy.description}
                        </CardDescription>
                      )}
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <User className="h-4 w-4" />
                      <span>Owner: {policy.owner}</span>
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="h-4 w-4" />
                      <span>Effective: {formatDate(policy.effective_date)}</span>
                    </div>
                    
                    {policy.review_date && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Calendar className="h-4 w-4" />
                        <span className={reviewDue ? 'text-red-600 font-medium' : ''}>
                          Review: {formatDate(policy.review_date)}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  <div className="border-t pt-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">Linked Controls:</span>
                        <Badge variant="outline">
                          {linkedControls.length} control{linkedControls.length !== 1 ? 's' : ''}
                        </Badge>
                      </div>
                      
                      <div className="text-xs text-gray-500">
                        Created: {formatDate(policy.created_at)}
                      </div>
                    </div>
                    
                    {linkedControls.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {linkedControls.slice(0, 3).map((control) => (
                          <Badge key={control.id} variant="secondary" className="text-xs">
                            {control.name}
                          </Badge>
                        ))}
                        {linkedControls.length > 3 && (
                          <Badge variant="secondary" className="text-xs">
                            +{linkedControls.length - 3} more
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
