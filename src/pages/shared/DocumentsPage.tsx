import { useEffect, useRef, useState } from 'react'
import { FileText, Download, File, FileImage, FileArchive, Plus, Upload, Link as LinkIcon, Trash2, Eye, Filter, FolderKanban, User as UserIcon } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAppDispatch, useAppSelector } from '../../redux/hooks'
import { fetchDocuments } from '../../redux/slices/businessSlice'
import { fetchProjects } from '../../redux/slices/projectsSlice'
import { fetchEmployees } from '../../redux/slices/employeesSlice'
import { fetchClients } from '../../redux/slices/clientsSlice'
import { PageHeader } from '../../components/common/PageHeader'
import { Card, CardContent } from '../../components/ui/card'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select'
import { formatFileSize, formatDate } from '../../lib/utils'
import type { DocumentFile, User } from '../../types'

const ICONS: Record<string, typeof File> = {
  contract: FileText,
  invoice: FileText,
  report: FileText,
  asset: FileImage,
  other: FileArchive,
}

const CATEGORIES = ['contract', 'invoice', 'report', 'asset', 'other'] as const

// Helper to get email from uploadedBy (string or User object)
function getUploadedByEmail(uploadedBy: string | User): string {
  if (typeof uploadedBy === 'string') return uploadedBy
  return uploadedBy?.email || uploadedBy?.name || 'Unknown'
}

// Helper to get display name from uploadedBy (string or User object)
function getUploadedByName(uploadedBy: string | User): string {
  if (typeof uploadedBy === 'string') return uploadedBy
  return uploadedBy?.name || uploadedBy?.email || 'Unknown'
}

export default function DocumentsPage() {
  const dispatch = useAppDispatch()
  const { documents, loading } = useAppSelector((s) => s.business)
  const { user } = useAppSelector((s) => s.auth)
  const { projects } = useAppSelector((s) => s.projects)
  const { employees } = useAppSelector((s) => s.employees)
  const { clients } = useAppSelector((s) => s.clients)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isOpen, setIsOpen] = useState(false)
  const [isLinkDialogOpen, setIsLinkDialogOpen] = useState(false)
  const [linkUrl, setLinkUrl] = useState('')
  const [linkTitle, setLinkTitle] = useState('')
  const [selectedProject, setSelectedProject] = useState<string>('all')
  const [selectedOwner, setSelectedOwner] = useState<string>('all')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  const isClient = user?.role === 'client'
  const isEmployee = user?.role === 'employee'
  const isAdmin = user?.role === 'admin'
  const canUpload = Boolean(user && (isClient || isEmployee || isAdmin))

  useEffect(() => {
    dispatch(fetchProjects('digiayudh'))
    if (isAdmin) {
      dispatch(fetchEmployees('digiayudh'))
      dispatch(fetchClients('digiayudh'))
    }
    dispatch(fetchDocuments())
  }, [dispatch, isAdmin])

  // Filter documents based on role and filters
  const filteredDocuments = documents.filter((doc) => {
    if (isEmployee) {
      // Employee can only see documents from their assigned projects
      const assignedProjectIds = projects
        .filter((p) => p.teamMembers && p.teamMembers.includes(user?._id || ''))
        .map((p) => p._id)
      if (!assignedProjectIds.includes(doc.projectId || '')) return false
    }
    if (isClient) {
      // Client can only see documents from their projects
      const clientProjectIds = projects
        .filter((p) => p.clientId && p.clientId === user?._id)
        .map((p) => p._id)
      if (!clientProjectIds.includes(doc.projectId || '')) return false
    }
    if (selectedProject !== 'all' && doc.projectId !== selectedProject) return false
    if (selectedOwner !== 'all' && doc.ownerId !== selectedOwner) return false
    if (selectedCategory !== 'all' && doc.category !== selectedCategory) return false
    return true
  })

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 50 * 1024 * 1024) {
      toast.error('File size must be less than 50MB')
      return
    }

    const project = projects.find((p) => p._id === selectedProject)
    const newDoc: DocumentFile = {
      _id: 'doc_' + Date.now(),
      name: file.name,
      category: 'other',
      size: file.size,
      createdAt: new Date(),
      uploadedBy: user?.email || 'unknown',
      type: 'file',
      url: URL.createObjectURL(file),
      ownerId: user?._id || '',
      projectId: selectedProject !== 'all' ? selectedProject : undefined,
      projectName: project?.title,
      ownerName: user?.name,
      ownerType: isClient ? 'client' : 'employee',
    }

    // In real implementation, this would be an API call
    toast.success('Document uploaded successfully')
    setIsOpen(false)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleAddLink = () => {
    if (!linkUrl || !linkTitle) {
      toast.error('Please provide both title and URL')
      return
    }

    const project = projects.find((p) => p._id === selectedProject)
    const newLink: DocumentFile = {
      _id: 'link_' + Date.now(),
      name: linkTitle,
      category: 'report',
      size: 0,
      createdAt: new Date(),
      uploadedBy: user?.email || 'unknown',
      type: 'link',
      url: linkUrl,
      ownerId: user?._id || '',
      projectId: selectedProject !== 'all' ? selectedProject : undefined,
      projectName: project?.title,
      ownerName: user?.name,
      ownerType: isClient ? 'client' : 'employee',
    }

    // In real implementation, this would be an API call
    toast.success('Link added successfully')
    setIsLinkDialogOpen(false)
    setLinkUrl('')
    setLinkTitle('')
  }

  const handleDownload = (doc: DocumentFile) => {
    if (doc.type === 'file' && doc.url) {
      const a = document.createElement('a')
      a.href = doc.url
      a.download = doc.name
      a.click()
    }
  }

  const handleDeleteDoc = (id: string, uploadedBy: string) => {
    if (user?.email !== uploadedBy && !isAdmin) {
      toast.error('You can only delete documents you uploaded')
      return
    }
    if (window.confirm('Delete this document?')) {
      // In real implementation, this would be an API call
      toast.success('Document deleted')
    }
  }

  return (
    <div className="space-y-6">
      {canUpload && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <p className="text-sm text-blue-900">
              {isClient && "As a client, you can upload and share documents with team members. "}
              {isEmployee && "As an employee, you can upload and share documents with admins and clients. "}
              {isAdmin && "As an admin, you can upload and share documents with all team members. "}
              Documents and links are visible to authorized team members.
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
                    Upload files to share with team members. Project selection is mandatory.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="project">Project *</Label>
                    <Select value={selectedProject} onValueChange={setSelectedProject}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a project" />
                      </SelectTrigger>
                      <SelectContent>
                        {projects.map((p) => (
                          <SelectItem key={p._id} value={p._id}>{p.title}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <Button 
                    onClick={() => fileInputRef.current?.click()} 
                    className="w-full gap-2"
                    disabled={selectedProject === 'all'}
                  >
                    <Plus className="h-4 w-4" />
                    Select File
                  </Button>
                </div>
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
                    <Label htmlFor="project-link">Project *</Label>
                    <Select value={selectedProject} onValueChange={setSelectedProject}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a project" />
                      </SelectTrigger>
                      <SelectContent>
                        {projects.map((p) => (
                          <SelectItem key={p._id} value={p._id}>{p.title}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
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
                  <Button 
                    onClick={handleAddLink} 
                    className="w-full"
                    disabled={selectedProject === 'all'}
                  >
                    Add Link
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        )}
      </div>

      {isAdmin && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Filters:</span>
              </div>
              
              <Select value={selectedProject} onValueChange={setSelectedProject}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="All Projects" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Projects</SelectItem>
                  {projects.map((p) => (
                    <SelectItem key={p._id} value={p._id}>{p.title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedOwner} onValueChange={setSelectedOwner}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="All Owners" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Owners</SelectItem>
                  {employees.map((e) => (
                    <SelectItem key={"emp-" + e._id} value={String(e._id)}>{e.name} (Employee)</SelectItem>
                  ))}
                  {clients.map((c) => (
                    <SelectItem key={"client-" + c._id} value={String(c._id)}>{c.name} (Client)</SelectItem>
                  ))}
                </SelectContent>
```
              </Select>

              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat} className="capitalize">{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="files" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="files">Files</TabsTrigger>
          <TabsTrigger value="links">Links</TabsTrigger>
        </TabsList>

        <TabsContent value="files" className="space-y-4">
          {loading && filteredDocuments.filter((d) => d.type === 'file').length === 0 ? (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-28" />)}
            </div>
          ) : filteredDocuments.filter((d) => d.type === 'file').length === 0 ? (
            <EmptyState icon={<FileText className="h-6 w-6" />} title="No documents" description="Uploaded files will appear here." />
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {filteredDocuments.filter((d) => d.type === 'file').map((doc) => {
                const Icon = ICONS[doc.category] || File
                return (
                  <Card key={doc._id}>
                    <CardContent className="flex flex-col gap-3 p-4">
                      <div className="flex items-start gap-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                          <Icon className="h-5 w-5" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium">{doc.name}</p>
                          <div className="mt-1 flex items-center gap-2 text-xs text-text-light">
                            <Badge variant="outline" className="capitalize">{doc.category}</Badge>
                            {doc.size > 0 && <span>{formatFileSize(doc.size)}</span>}
                          </div>
                        </div>
                      </div>
                      
                      {isAdmin && (
                        <div className="text-xs space-y-1 border-t pt-2">
                          <div className="flex items-center gap-1">
                            <FolderKanban className="h-3 w-3" />
                            <span className="truncate">{doc.projectName || 'No Project'}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <UserIcon className="h-3 w-3" />
                            <span className="truncate">{doc.ownerName || getUploadedByName(doc.uploadedBy)}</span>
                          </div>
                          <div className="text-text-light">{formatDate(doc.createdAt)}</div>
                        </div>
                      )}
                      
                      <div className="flex gap-2 justify-end">
                        <Button variant="ghost" size="sm" onClick={() => handleDownload(doc)} title={"Download " + doc.name}>
                          <Download className="h-4 w-4" />
                        </Button>
                        {canUpload && (user?.email === getUploadedByEmail(doc.uploadedBy) || isAdmin) && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-destructive"
                            onClick={() => handleDeleteDoc(doc._id, getUploadedByEmail(doc.uploadedBy))}
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
          {filteredDocuments.filter((d) => d.type === 'link').length === 0 ? (
            <EmptyState icon={<LinkIcon className="h-6 w-6" />} title="No links" description="Shared links will appear here." />
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {filteredDocuments.filter((d) => d.type === 'link').map((doc) => (
                <Card key={doc._id}>
                  <CardContent className="flex flex-col gap-3 p-4">
                    <div className="flex items-start gap-3">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
                        <LinkIcon className="h-5 w-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">{doc.name}</p>
                        <p className="mt-1 truncate text-xs text-text-light">{doc.url}</p>
                      </div>
                    </div>
                    
                    {isAdmin && (
                      <div className="text-xs space-y-1 border-t pt-2">
                        <div className="flex items-center gap-1">
                          <FolderKanban className="h-3 w-3" />
                          <span className="truncate">{doc.projectName || 'No Project'}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <UserIcon className="h-3 w-3" />
                          <span className="truncate">{doc.ownerName || getUploadedByName(doc.uploadedBy)}</span>
                        </div>
                        <div className="text-text-light">{formatDate(doc.createdAt)}</div>
                      </div>
                    )}
                    
                    <div className="flex gap-2 justify-end">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => window.open(doc.url, '_blank')}
                        title="Open link"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      {canUpload && (user?.email === getUploadedByEmail(doc.uploadedBy) || isAdmin) && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive"
                          onClick={() => handleDeleteDoc(doc._id, getUploadedByEmail(doc.uploadedBy))}
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