
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { trpc } from '@/utils/trpc';
import { useState } from 'react';
import { Plus, Server, User, MapPin, DollarSign, AlertTriangle, AlertCircle } from 'lucide-react';
import type { Asset, CreateAssetInput, Vulnerability, Incident } from '../../../server/src/schema';

interface AssetsSectionProps {
  assets: Asset[];
  setAssets: (assets: Asset[] | ((prev: Asset[]) => Asset[])) => void;
  vulnerabilities: Vulnerability[];
  incidents: Incident[];
}

export function AssetsSection({ assets, setAssets, vulnerabilities, incidents }: AssetsSectionProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState<CreateAssetInput>({
    name: '',
    description: null,
    asset_type: '',
    value: null,
    owner: '',
    location: null
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);
    try {
      const newAsset = await trpc.createAsset.mutate(formData);
      setAssets((prev: Asset[]) => [...prev, newAsset]);
      setFormData({
        name: '',
        description: null,
        asset_type: '',
        value: null,
        owner: '',
        location: null
      });
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Failed to create asset:', error);
    } finally {
      setIsCreating(false);
    }
  };

  const getAssetVulnerabilities = (assetId: number) => {
    return vulnerabilities.filter(vuln => vuln.asset_id === assetId);
  };

  const getAssetIncidents = (assetId: number) => {
    return incidents.filter(incident => incident.asset_id === assetId);
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString();
  };

  const formatCurrency = (value: number | null) => {
    if (!value) return 'Not specified';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(value);
  };

  const getAssetTypeColor = (type: string) => {
    const colors: { [key: string]: string } = {
      'server': 'bg-blue-100 text-blue-800 border-blue-200',
      'database': 'bg-purple-100 text-purple-800 border-purple-200',
      'application': 'bg-green-100 text-green-800 border-green-200',
      'network': 'bg-orange-100 text-orange-800 border-orange-200',
      'workstation': 'bg-gray-100 text-gray-800 border-gray-200',
      'mobile': 'bg-pink-100 text-pink-800 border-pink-200'
    };
    return colors[type.toLowerCase()] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Asset Management</h2>
          <p className="text-gray-600">Track and protect organizational assets</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              New Asset
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>Create New Asset</DialogTitle>
                <DialogDescription>
                  Add a new organizational asset
                </DialogDescription>
              </DialogHeader>
              
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Asset Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setFormData((prev: CreateAssetInput) => ({ ...prev, name: e.target.value }))
                    }
                    placeholder="Enter asset name"
                    required
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description || ''}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                      setFormData((prev: CreateAssetInput) => ({
                        ...prev,
                        description: e.target.value || null
                      }))
                    }
                    placeholder="Asset description"
                    rows={3}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="asset_type">Asset Type *</Label>
                    <Input
                      id="asset_type"
                      value={formData.asset_type}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setFormData((prev: CreateAssetInput) => ({ ...prev, asset_type: e.target.value }))
                      }
                      placeholder="e.g., Server, Database, Application"
                      required
                    />
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="owner">Owner *</Label>
                    <Input
                      id="owner"
                      value={formData.owner}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setFormData((prev: CreateAssetInput) => ({ ...prev, owner: e.target.value }))
                      }
                      placeholder="Asset owner"
                      required
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="value">Asset Value ($)</Label>
                    <Input
                      id="value"
                      type="number"
                      value={formData.value || ''}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setFormData((prev: CreateAssetInput) => ({
                          ...prev,
                          value: e.target.value ? parseFloat(e.target.value) : null
                        }))
                      }
                      placeholder="Asset value in USD"
                      min="0"
                      step="0.01"
                    />
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      value={formData.location || ''}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setFormData((prev: CreateAssetInput) => ({
                          ...prev,
                          location: e.target.value || null
                        }))
                      }
                      placeholder="Asset location"
                    />
                  </div>
                </div>
              </div>
              
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isCreating}>
                  {isCreating ? 'Creating...' : 'Create Asset'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {assets.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Server className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No assets found</h3>
            <p className="text-gray-500 text-center mb-4">
              Start by cataloging your organizational assets
            </p>
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create First Asset
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card className="border-l-4 border-l-blue-500">
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-blue-600">{assets.length}</div>
                <p className="text-sm text-gray-600">Total Assets</p>
              </CardContent>
            </Card>
            <Card className="border-l-4 border-l-red-500">
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-red-600">
                  {vulnerabilities.filter(v => v.severity === 'critical').length}
                </div>
                <p className="text-sm text-gray-600">Critical Vulnerabilities</p>
              </CardContent>
            </Card>
            <Card className="border-l-4 border-l-orange-500">
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-orange-600">
                  {incidents.filter(i => i.status === 'open' || i.status === 'investigating').length}
                </div>
                <p className="text-sm text-gray-600">Active Incidents</p>
              </CardContent>
            </Card>
          </div>
          
          {assets.map((asset: Asset) => {
            const assetVulnerabilities = getAssetVulnerabilities(asset.id);
            const assetIncidents = getAssetIncidents(asset.id);
            const criticalVulns = assetVulnerabilities.filter(v => v.severity === 'critical').length;
            const openIncidents = assetIncidents.filter(i => i.status === 'open' || i.status === 'investigating').length;
            
            return (
              <Card key={asset.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="flex items-center gap-2">
                        <Server className="h-5 w-5 text-blue-600" />
                        {asset.name}
                        <Badge className={getAssetTypeColor(asset.asset_type)}>
                          {asset.asset_type}
                        </Badge>
                        {criticalVulns > 0 && (
                          <Badge variant="destructive">
                            {criticalVulns} Critical Vulnerabilities
                          </Badge>
                        )}
                        {openIncidents > 0 && (
                          <Badge variant="destructive">
                            {openIncidents} Active Incidents
                          </Badge>
                        )}
                      </CardTitle>
                      {asset.description && (
                        <CardDescription className="mt-2">
                          {asset.description}
                        </CardDescription>
                      )}
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <User className="h-4 w-4" />
                      <span>Owner: {asset.owner}</span>
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <DollarSign className="h-4 w-4" />
                      <span>Value: {formatCurrency(asset.value)}</span>
                    </div>
                    
                    {asset.location && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <MapPin className="h-4 w-4" />
                        <span>Location: {asset.location}</span>
                      </div>
                    )}
                    
                    <div className="text-sm text-gray-600">
                      <span className="font-medium">Created:</span> {formatDate(asset.created_at)}
                    </div>
                  </div>
                  
                  <div className="border-t pt-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="h-4 w-4 text-orange-500" />
                          <span className="text-sm font-medium">Vulnerabilities:</span>
                          <Badge variant="outline">
                            {assetVulnerabilities.length}
                          </Badge>
                          {criticalVulns > 0 && (
                            <Badge variant="destructive" className="text-xs">
                              {criticalVulns} Critical
                            </Badge>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <AlertCircle className="h-4 w-4 text-red-500" />
                          <span className="text-sm font-medium">Incidents:</span>
                          <Badge variant="outline">
                            {assetIncidents.length}
                          </Badge>
                          {openIncidents > 0 && (
                            <Badge variant="destructive" className="text-xs">
                              {openIncidents} Open
                            </Badge>
                          )}
                        </div>
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
