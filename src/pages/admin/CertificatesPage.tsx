import { useState, useRef, useEffect } from 'react'
import { Plus, Trash2, Download, ExternalLink, Copy, Check, AlertCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAppSelector } from '../../redux/hooks'
import apiClient from '../../services/api'
import { PageHeader } from '../../components/common/PageHeader'
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { Badge } from '../../components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../../components/ui/dialog'

interface Certificate {
  _id: string
  employeeId: string
  employeeName: string
  employeeEmail: string
  title: string
  issueDate: string
  expiryDate?: string
  certificateUrl: string
  verificationToken: string
  verificationUrl: string
  createdAt: string
  issuedBy: string
}

export default function CertificatesPage() {
  const { user } = useAppSelector((s) => s.auth)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isOpen, setIsOpen] = useState(false)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [certificates, setCertificates] = useState<Certificate[]>([])

  // Fetch certificates from backend on component mount
  useEffect(() => {
    const fetchCertificates = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const response = await apiClient.getCertificates()
        setCertificates(response.data.certificates || response.data)
      } catch (err) {
        console.error('[v0] Failed to fetch certificates:', err)
        setError(apiClient.getErrorMessage(err) || 'Failed to load certificates')
        setCertificates([])
      } finally {
        setIsLoading(false)
      }
    }
    fetchCertificates()
  }, [])

  const [formData, setFormData] = useState({
    employeeName: '',
    employeeEmail: '',
    title: '',
    issueDate: '',
    expiryDate: '',
  })

  const handleAddCertificate = async () => {
    if (!formData.employeeName || !formData.title || !formData.issueDate) {
      toast.error('Please fill in all required fields')
      return
    }

    try {
      const response = await apiClient.issueCertificate({
        employeeName: formData.employeeName,
        employeeEmail: formData.employeeEmail,
        title: formData.title,
        issueDate: formData.issueDate,
        expiryDate: formData.expiryDate || undefined,
        issuedBy: user?.email || 'admin',
      })

      const newCert = response.data.certificate || response.data
      setCertificates([newCert, ...certificates])
      toast.success('Certificate issued successfully')
      setFormData({ employeeName: '', employeeEmail: '', title: '', issueDate: '', expiryDate: '' })
      setIsOpen(false)
    } catch (err) {
      toast.error(apiClient.getErrorMessage(err) || 'Failed to issue certificate')
    }
  }

  const handleDeleteCertificate = async (id: string) => {
    if (window.confirm('Delete this certificate?')) {
      try {
        await apiClient.deleteCertificate(id)
        setCertificates(certificates.filter((c) => c._id !== id))
        toast.success('Certificate deleted successfully')
      } catch (err) {
        toast.error(apiClient.getErrorMessage(err) || 'Failed to delete certificate')
      }
    }
  }

  const handleCopyLink = (url: string, certId: string) => {
    navigator.clipboard.writeText(url)
    setCopiedId(certId)
    toast.success('Link copied to clipboard')
    setTimeout(() => setCopiedId(null), 2000)
  }

  const isExpired = (expiry?: string) => {
    if (!expiry) return false
    return new Date(expiry) < new Date()
  }

  const activeCount = certificates.filter(c => !isExpired(c.expiryDate)).length
  const expiredCount = certificates.filter(c => isExpired(c.expiryDate)).length

  return (
    <div className="space-y-6">
      <Card className="border-primary/30 bg-primary/5">
        <CardContent className="p-4 flex gap-3">
          <AlertCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
          <p className="text-sm text-foreground">
            Only administrators can create and manage employee certificates. Employees will see their certificates on their profile with public verification links.
          </p>
        </CardContent>
      </Card>

      {error && (
        <Card className="border-destructive/30 bg-destructive/5">
          <CardContent className="p-4 flex gap-3">
            <AlertCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-destructive">Error loading certificates</p>
              <p className="text-sm text-destructive/80 mt-1">{error}</p>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex items-center justify-between">
        <PageHeader
          title="Certificates & Experience Letters"
          subtitle="Manage and verify employee credentials and certifications"
        />
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Add Certificate
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Certificate</DialogTitle>
              <DialogDescription>
                Upload or record a new employee certificate or experience letter
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="employeeName">Employee Name *</Label>
                <Input
                  id="employeeName"
                  placeholder="Employee name"
                  value={formData.employeeName}
                  onChange={(e) => setFormData({ ...formData, employeeName: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="employeeEmail">Employee Email *</Label>
                <Input
                  id="employeeEmail"
                  type="email"
                  placeholder="employee@mail.com"
                  value={formData.employeeEmail}
                  onChange={(e) => setFormData({ ...formData, employeeEmail: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="title">Certificate Title *</Label>
                <Input
                  id="title"
                  placeholder="e.g., AWS Solutions Architect"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="issueDate">Issue Date *</Label>
                  <Input
                    id="issueDate"
                    type="date"
                    value={formData.issueDate}
                    onChange={(e) => setFormData({ ...formData, issueDate: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="expiryDate">Expiry Date (optional)</Label>
                  <Input
                    id="expiryDate"
                    type="date"
                    value={formData.expiryDate}
                    onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                  />
                </div>
              </div>
              <div className="flex gap-3 justify-end pt-4">
                <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddCertificate}>Add Certificate</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="active" className="space-y-4">
        <TabsList>
          <TabsTrigger value="active">Active ({activeCount})</TabsTrigger>
          <TabsTrigger value="expired">Expired ({expiredCount})</TabsTrigger>
          <TabsTrigger value="all">All ({certificates.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4">
          {certificates.filter(c => !isExpired(c.expiryDate)).length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center text-text-light">
                No active certificates
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {certificates.filter(c => !isExpired(c.expiryDate)).map((cert) => (
                <CertificateCard
                  key={cert._id}
                  cert={cert}
                  onDelete={handleDeleteCertificate}
                  onCopyLink={handleCopyLink}
                  isCopied={copiedId === cert._id}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="expired" className="space-y-4">
          {certificates.filter(c => isExpired(c.expiryDate)).length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center text-text-light">
                No expired certificates
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {certificates.filter(c => isExpired(c.expiryDate)).map((cert) => (
                <CertificateCard
                  key={cert._id}
                  cert={cert}
                  onDelete={handleDeleteCertificate}
                  onCopyLink={handleCopyLink}
                  isCopied={copiedId === cert._id}
                  isExpired={true}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="all" className="space-y-4">
          {certificates.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center text-text-light">
                No certificates yet
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {certificates.map((cert) => (
                <CertificateCard
                  key={cert._id}
                  cert={cert}
                  onDelete={handleDeleteCertificate}
                  onCopyLink={handleCopyLink}
                  isCopied={copiedId === cert._id}
                  isExpired={isExpired(cert.expiryDate)}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

function CertificateCard({
  cert,
  onDelete,
  onCopyLink,
  isCopied,
  isExpired,
}: {
  cert: Certificate
  onDelete: (id: string) => void
  onCopyLink: (url: string, id: string) => void
  isCopied: boolean
  isExpired?: boolean
}) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-semibold">{cert.title}</h3>
              {isExpired && <Badge variant="outline" className="bg-red-100 text-red-800">Expired</Badge>}
              {!isExpired && cert.expiryDate && <Badge variant="outline" className="bg-green-100 text-green-800">Active</Badge>}
            </div>
            <p className="mt-1 text-sm text-text-light">{cert.employeeName} ({cert.employeeEmail})</p>
            <div className="mt-3 space-y-1 text-xs text-text-light">
              <p>Issued: {cert.issueDate}</p>
              {cert.expiryDate && <p>Expires: {cert.expiryDate}</p>}
              <p>Issued by: {cert.issuedBy}</p>
            </div>
          </div>
          <div className="flex flex-col gap-2 flex-shrink-0">
            <Button
              size="sm"
              variant="outline"
              onClick={() => onCopyLink(cert.verificationUrl, cert._id)}
              className="gap-2"
            >
              {isCopied ? (
                <>
                  <Check className="h-4 w-4" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" />
                  Copy Link
                </>
              )}
            </Button>
            <a href={cert.verificationUrl} target="_blank" rel="noopener noreferrer">
              <Button size="sm" variant="outline" className="w-full gap-2">
                <ExternalLink className="h-4 w-4" />
                View
              </Button>
            </a>
            <Button
              size="sm"
              variant="ghost"
              className="text-destructive"
              onClick={() => onDelete(cert._id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
