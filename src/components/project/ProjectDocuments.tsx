import { useState, useRef } from 'react'
import { Plus, Trash2, Download, File, Link as LinkIcon, FileText, Image as ImageIcon } from 'lucide-react'
import toast from 'react-hot-toast'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card'
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
import { Label } from '../../components/ui/label'
import { Textarea } from '../../components/ui/textarea'

interface ProjectDocument {
  _id: string
  name: string
  type: 'document' | 'image' | 'link'
  url: string
  uploadedBy: string
  uploadedAt: string
  visibility: 'public' | 'private' | 'internal'
  description?: string
}

interface ProjectDocumentsProps {
  projectId: string
  canEdit: boolean
  userRole: 'admin' | 'employee' | 'client'
  userId: string
  clientId?: string
}

export default function ProjectDocuments({ projectId, canEdit, userRole, userId, clientId }: ProjectDocumentsProps) {
  const [documents, setDocuments] = useState<ProjectDocument[]>([
    { _id: 'd1', name: 'Project Proposal', type: 'document', url: '#', uploadedBy: 'admin@mail.com', uploadedAt: '2024-01-15', visibility: 'public' },
    { _id: 'd2', name: 'API Documentation', type: 'document', url: '#', uploadedBy: 'employee@mail.com', uploadedAt: '2024-01-16', visibility: 'private', description: 'Internal API docs' },
  ])
  const [links, setLinks] = useState<any[]>([
    { _id: 'l1', name: 'Hosting Dashboard', url: 'https://hosting.example.com', description: 'Production server access', visibility: 'private' },
    { _id: 'l2', name: 'GitHub Repository', url: 'https://github.com/example/project', description: 'Source code', visibility: 'public' },
  ])
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isOpen, setIsOpen] = useState(false)
  const [linkName, setLinkName] = useState('')
  const [linkUrl, setLinkUrl] = useState('')
  const [linkDescription, setLinkDescription] = useState('')

  const getVisibilityColor = (visibility: string) => {
    switch (visibility) {
      case 'public':
        return 'bg-blue-100 text-blue-800'
      case 'private':
        return 'bg-yellow-100 text-yellow-800'
      case 'internal':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'image':
        return <ImageIcon className="h-4 w-4" />
      case 'link':
        return <LinkIcon className="h-4 w-4" />
      default:
        return <FileText className="h-4 w-4" />
    }
  }

  // Filter documents based on visibility and user role
  const visibleDocuments = documents.filter((doc) => {
    if (doc.visibility === 'public') return true
    if (doc.visibility === 'internal' && (userRole === 'admin' || userRole === 'employee')) return true
    if (doc.visibility === 'private' && (userRole === 'client' && clientId || userRole !== 'client')) return true
    return false
  })

  const visibleLinks = links.filter((link) => {
    if (link.visibility === 'public') return true
    if (link.visibility === 'private' && (userRole === 'admin' || userRole === 'employee')) return true
    return false
  })

  const handleAddLink = () => {
    if (!linkName.trim() || !linkUrl.trim()) {
      toast.error('Please fill in all fields')
      return
    }

    const newLink = {
      _id: `l${Date.now()}`,
      name: linkName,
      url: linkUrl,
      description: linkDescription,
      visibility: 'private',
    }
    setLinks([...links, newLink])
    toast.success('Link added successfully')
    setLinkName('')
    setLinkUrl('')
    setLinkDescription('')
    setIsOpen(false)
  }

  const handleDeleteDocument = (id: string) => {
    if (window.confirm('Delete this document?')) {
      setDocuments(documents.filter((d) => d._id !== id))
      toast.success('Document deleted')
    }
  }

  const handleDeleteLink = (id: string) => {
    if (window.confirm('Delete this link?')) {
      setLinks(links.filter((l) => l._id !== id))
      toast.success('Link deleted')
    }
  }

  return (
    <Tabs defaultValue="documents" className="space-y-4">
      <TabsList>
        <TabsTrigger value="documents">Documents & Media ({visibleDocuments.length})</TabsTrigger>
        <TabsTrigger value="links">Project Links ({visibleLinks.length})</TabsTrigger>
      </TabsList>

      <TabsContent value="documents" className="space-y-4">
        {canEdit && (
          <div className="flex justify-end">
            <Button size="sm" className="gap-2">
              <Plus className="h-4 w-4" />
              Upload Document
            </Button>
          </div>
        )}

        {visibleDocuments.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center text-text-light">
              No documents available
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-3">
            {visibleDocuments.map((doc) => (
              <Card key={doc._id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex gap-3 flex-1 min-w-0">
                      <div className="flex-shrink-0 p-2 bg-muted rounded">
                        {getFileIcon(doc.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-medium truncate">{doc.name}</h3>
                          <Badge variant="outline" className={`text-xs ${getVisibilityColor(doc.visibility)}`}>
                            {doc.visibility}
                          </Badge>
                        </div>
                        {doc.description && (
                          <p className="text-sm text-text-light mt-1">{doc.description}</p>
                        )}
                        <p className="text-xs text-text-light mt-1">
                          Uploaded by {doc.uploadedBy} on {doc.uploadedAt}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      <Button size="sm" variant="ghost">
                        <Download className="h-4 w-4" />
                      </Button>
                      {canEdit && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-destructive"
                          onClick={() => handleDeleteDocument(doc._id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </TabsContent>

      <TabsContent value="links" className="space-y-4">
        {(userRole === 'admin' || userRole === 'employee') && (
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-2">
                <Plus className="h-4 w-4" />
                Add Link
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Project Link</DialogTitle>
                <DialogDescription>
                  Add a relevant link for this project (e.g., hosting, repository, documentation)
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="linkName">Link Name *</Label>
                  <Input
                    id="linkName"
                    placeholder="e.g., Production Server"
                    value={linkName}
                    onChange={(e) => setLinkName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="linkUrl">URL *</Label>
                  <Input
                    id="linkUrl"
                    placeholder="https://example.com"
                    value={linkUrl}
                    onChange={(e) => setLinkUrl(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="linkDescription">Description</Label>
                  <Textarea
                    id="linkDescription"
                    placeholder="Optional description"
                    rows={2}
                    value={linkDescription}
                    onChange={(e) => setLinkDescription(e.target.value)}
                  />
                </div>
                <div className="flex gap-3 justify-end pt-4">
                  <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleAddLink}>Add Link</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}

        {visibleLinks.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center text-text-light">
              No links available
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-3">
            {visibleLinks.map((link) => (
              <Card key={link._id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex gap-3 flex-1 min-w-0">
                      <div className="flex-shrink-0 p-2 bg-muted rounded">
                        <LinkIcon className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium">{link.name}</h3>
                        {link.description && (
                          <p className="text-sm text-text-light">{link.description}</p>
                        )}
                        <a
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-primary hover:underline truncate block"
                        >
                          {link.url}
                        </a>
                      </div>
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => window.open(link.url, '_blank')}
                      >
                        <LinkIcon className="h-4 w-4" />
                      </Button>
                      {(userRole === 'admin' || userRole === 'employee') && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-destructive"
                          onClick={() => handleDeleteLink(link._id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </TabsContent>
    </Tabs>
  )
}
