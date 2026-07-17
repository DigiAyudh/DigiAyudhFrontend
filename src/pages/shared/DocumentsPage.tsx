import { useEffect, useRef, useState } from 'react'
import { FileText, Download, File, FileImage, FileArchive, Plus, Upload, Link as LinkIcon, Trash2, Eye } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAppDispatch, useAppSelector } from '../../redux/hooks'
import { fetchDocuments } from '../../redux/slices/businessSlice'
import { PageHeader } from '../../components/common/PageHeader'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Badge } from '../../components/ui/badge'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs'
import { Skeleton } from '../../components/ui/skeleton'
import { EmptyState } from '../../components/common/EmptyState'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../../components/ui/dialog'
import { formatFileSize, formatDate } from '../../lib/utils'

const ICONS: Record<string, typeof File> = {
  contract: FileText,
  invoice: FileText,
  report: FileText,
  asset: FileImage,
  other: FileArchive,
}

interface Document {
  _id: string
  name: string
  category: string
  size: number
  createdAt: string
  uploadedBy: string
  type: 'file' | 'link'
  url?: string
  visibleTo: string[]
}

export default function DocumentsPage() {
  const dispatch = useAppDispatch()
  const { documents, loading } = useAppSelector((s) => s.business)
  const { user } = useAppSelector((s) => s.auth)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isOpen, setIsOpen] = useState(false)
  const [isLinkDialogOpen, setIsLinkDialogOpen] = useState(false)
  const [linkUrl, setLinkUrl] = useState('')
  const [linkTitle, setLinkTitle] = useState('')
  const [allDocs, setAllDocs] = useState<Document[]>([])

  const isClient = user?.role === 'client'
  const isEmployee = user?.role === 'employee'
  const isAdmin = user?.role === 'admin'
  const canUpload = isClient || isEmployee || isAdmin

  useEffect(() => {
    dispatch(fetchDocuments())
    // Initialize with sample documents
    setAllDocs([
      {
        _id: 'doc1',
        name: 'Project Requirement Document',
        category: 'contract',
        size: 2048000,
        createdAt: '2024-01-15',
        uploadedBy: 'client@acme.com',
        type: 'file',
        visibleTo: ['admin', 'employee', 'client'],
      },
      {
        _id: 'link1',
        name: 'API Documentation',
        category: 'report',
        size: 0,
        createdAt: '2024-01-10',
        uploadedBy: 'client@acme.com',
        type: 'link',
        url: 'https://api.example.com/docs',
        visibleTo: ['admin', 'employee', 'client'],
      },
      {
        _id: 'doc2',
        name: 'Technical Implementation Guide',
        category: 'report',
        size: 3145728,
        createdAt: '2024-01-18',
        uploadedBy: 'james.dev@digiayudh.com',
        type: 'file',
        visibleTo: ['admin', 'employee', 'client'],
      },
      {
        _id: 'link2',
        name: 'GitHub Repository',
        category: 'report',
        size: 0,
        createdAt: '2024-01-12',
        uploadedBy: 'james.dev@digiayudh.com',
        type: 'link',
        url: 'https://github.com/company/project',
        visibleTo: ['admin', 'employee'],
      },
    ])
  }, [dispatch])

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 50 * 1024 * 1024) {
      toast.error('File size must be less than 50MB')
      return
    }

    const newDoc: Document = {
      _id: `doc_${Date.now()}`,
      name: file.name,
      category: 'other',
      size: file.size,
      createdAt: new Date().toISOString().split('T')[0],
      uploadedBy: user?.email || 'unknown',
      type: 'file',
      visibleTo: ['admin', 'employee', 'client'],
    }

    setAllDocs([newDoc, ...allDocs])
    toast.success('Document uploaded successfully')
    setIsOpen(false)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleAddLink = () => {
    if (!linkUrl || !linkTitle) {
      toast.error('Please provide both title and URL')
      return
    }

    const newLink: Document = {
      _id: `link_${Date.now()}`,
      name: linkTitle,
      category: 'report',
      size: 0,
      createdAt: new Date().toISOString().split('T')[0],
      uploadedBy: user?.email || 'unknown',
      type: 'link',
      url: linkUrl,
      visibleTo: ['admin', 'employee', 'client'],
    }

    setAllDocs([newLink, ...allDocs])
    toast.success('Link added successfully')
    setIsLinkDialogOpen(false)
    setLinkUrl('')
    setLinkTitle('')
  }

  const handleDeleteDoc = (id: string, uploadedBy: string) => {
    // Only allow deletion by the uploader or admins
    if (user?.email !== uploadedBy && !isAdmin) {
      toast.error('You can only delete documents you uploaded')
      return
    }
    if (window.confirm('Delete this document?')) {
      setAllDocs(allDocs.filter(d => d._id !== id))
      toast.success('Document deleted')
    }
  }

  return (
    <div className="space-y-6">
      {canUpload && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <p className="text-sm text-blue-900">
              {isClient && "As a client, you can upload and share documents with team members."}
              {isEmployee && "As an employee, you can upload and share documents with admins and clients."}
              {isAdmin && "As an admin, you can upload and share documents with all team members."}
              {" "}Documents and links are visible to authorized team members.
            </p>
          </CardContent>
        </Card>
      )}

      <div className="flex items-center justify-between">
        <PageHeader title="Documents" subtitle="Contracts, reports and shared files." />
        {canUpload && (
          <div className="flex gap-2">
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Upload className="h-4 w-4" />
                  Upload Document
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Upload Document</DialogTitle>
                  <DialogDescription>
                    Upload files to share with team members (admin and employees)
                  </DialogDescription>
                </DialogHeader>
                <input
                  ref={fileInputRef}
                  type="file"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <Button onClick={() => fileInputRef.current?.click()} className="w-full gap-2">
                  <Plus className="h-4 w-4" />
                  Select File
                </Button>
              </DialogContent>
            </Dialog>

            <Dialog open={isLinkDialogOpen} onOpenChange={setIsLinkDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <LinkIcon className="h-4 w-4" />
                  Add Link
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Document Link</DialogTitle>
                  <DialogDescription>
                    Share a link to external resources (documentation, repositories, etc.)
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Link Title *</Label>
                    <Input
                      id="title"
                      value={linkTitle}
                      onChange={(e) => setLinkTitle(e.target.value)}
                      placeholder="e.g., API Documentation"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="url">URL *</Label>
                    <Input
                      id="url"
                      type="url"
                      value={linkUrl}
                      onChange={(e) => setLinkUrl(e.target.value)}
                      placeholder="https://example.com"
                    />
                  </div>
                  <Button onClick={handleAddLink} className="w-full">Add Link</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        )}
      </div>

      <Tabs defaultValue="files" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="files">Files</TabsTrigger>
          <TabsTrigger value="links">Links</TabsTrigger>
        </TabsList>

        <TabsContent value="files" className="space-y-4">
          {loading && allDocs.filter(d => d.type === 'file').length === 0 ? (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-28" />)}
            </div>
          ) : allDocs.filter(d => d.type === 'file').length === 0 ? (
            <EmptyState icon={<FileText className="h-6 w-6" />} title="No documents" description="Uploaded files will appear here." />
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {allDocs.filter(d => d.type === 'file').map((doc) => {
                const Icon = ICONS[doc.category] || File
                return (
                  <Card key={doc._id}>
                    <CardContent className="flex items-start gap-3 p-4">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">{doc.name}</p>
                        <div className="mt-1 flex items-center gap-2 text-xs text-text-light">
                          <Badge variant="outline" className="capitalize">{doc.category}</Badge>
                          {doc.size > 0 && <span>{formatFileSize(doc.size)}</span>}
                        </div>
                        <p className="mt-1 text-xs text-text-light">{formatDate(doc.createdAt)}</p>
                      </div>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" title={`Download ${doc.name}`}>
                          <Download className="h-4 w-4" />
                        </Button>
                        {canUpload && (user?.email === doc.uploadedBy || isAdmin) && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive"
                            onClick={() => handleDeleteDoc(doc._id, doc.uploadedBy)}
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="links" className="space-y-4">
          {allDocs.filter(d => d.type === 'link').length === 0 ? (
            <EmptyState icon={<LinkIcon className="h-6 w-6" />} title="No links" description="Shared links will appear here." />
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {allDocs.filter(d => d.type === 'link').map((doc) => (
                <Card key={doc._id}>
                  <CardContent className="flex items-start gap-3 p-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
                      <LinkIcon className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{doc.name}</p>
                      <p className="mt-1 truncate text-xs text-text-light">{doc.url}</p>
                      <p className="mt-1 text-xs text-text-light">{formatDate(doc.createdAt)}</p>
                    </div>
                    <div className="flex gap-1 flex-col">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => window.open(doc.url, '_blank')}
                        title="Open link"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      {canUpload && (user?.email === doc.uploadedBy || isAdmin) && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive"
                          onClick={() => handleDeleteDoc(doc._id, doc.uploadedBy)}
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
