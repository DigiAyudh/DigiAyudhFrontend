import { useState } from 'react'
import { Plus, Edit2, Trash2, Search, FileText } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAppSelector } from '../../redux/hooks'
import { PageHeader } from '../../components/common/PageHeader'
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Badge } from '../../components/ui/badge'
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

interface InternalDoc {
  _id: string
  title: string
  content: string
  category: 'system' | 'api' | 'database' | 'infrastructure' | 'other'
  createdBy: string
  createdAt: string
  updatedAt: string
}

export default function InternalDocumentationPage() {
  const { user } = useAppSelector((s) => s.auth)
  const isAdmin = user?.role === 'admin'
  const canEdit = user?.role === 'admin' || user?.role === 'employee'

  const [docs, setDocs] = useState<InternalDoc[]>([
    {
      _id: 'doc1',
      title: 'Database Schema Overview',
      content: 'Our database uses PostgreSQL with the following main tables...',
      category: 'database',
      createdBy: 'admin@mail.com',
      createdAt: '2024-01-10',
      updatedAt: '2024-01-15',
    },
    {
      _id: 'doc2',
      title: 'API Authentication Guide',
      content: 'All API requests must include Bearer token in Authorization header...',
      category: 'api',
      createdBy: 'admin@mail.com',
      createdAt: '2024-01-12',
      updatedAt: '2024-01-14',
    },
    {
      _id: 'doc3',
      title: 'System Architecture',
      content: 'The system follows microservices architecture with Docker containerization...',
      category: 'system',
      createdBy: 'admin@mail.com',
      createdAt: '2024-01-08',
      updatedAt: '2024-01-08',
    },
  ])

  const [search, setSearch] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({ title: '', content: '', category: 'system' })

  const handleAddOrEdit = () => {
    if (!formData.title.trim() || !formData.content.trim()) {
      toast.error('Please fill in all fields')
      return
    }

    if (editingId) {
      setDocs(docs.map((doc) => 
        doc._id === editingId 
          ? { ...doc, ...formData, updatedAt: new Date().toISOString().split('T')[0] }
          : doc
      ))
      toast.success('Document updated')
    } else {
      const newDoc: InternalDoc = {
        _id: `doc${Date.now()}`,
        ...formData,
        category: formData.category as any,
        createdBy: user?.email || 'unknown',
        createdAt: new Date().toISOString().split('T')[0],
        updatedAt: new Date().toISOString().split('T')[0],
      }
      setDocs([newDoc, ...docs])
      toast.success('Document created')
    }

    setIsOpen(false)
    setEditingId(null)
    setFormData({ title: '', content: '', category: 'system' })
  }

  const handleEdit = (doc: InternalDoc) => {
    setEditingId(doc._id)
    setFormData({ title: doc.title, content: doc.content, category: doc.category })
    setIsOpen(true)
  }

  const handleDelete = (id: string) => {
    if (window.confirm('Delete this document?')) {
      setDocs(docs.filter((d) => d._id !== id))
      toast.success('Document deleted')
    }
  }

  const openNewDialog = () => {
    setEditingId(null)
    setFormData({ title: '', content: '', category: 'system' })
    setIsOpen(true)
  }

  const filtered = docs.filter(
    (doc) =>
      doc.title.toLowerCase().includes(search.toLowerCase()) ||
      doc.content.toLowerCase().includes(search.toLowerCase())
  )

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'system':
        return 'bg-blue-100 text-blue-800'
      case 'api':
        return 'bg-purple-100 text-purple-800'
      case 'database':
        return 'bg-green-100 text-green-800'
      case 'infrastructure':
        return 'bg-orange-100 text-orange-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Internal Documentation"
        subtitle="System and process documentation for team members"
      />

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-light" />
          <Input
            placeholder="Search documentation..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        {isAdmin && (
          <Dialog open={isOpen} onOpenChange={(open) => {
            setIsOpen(open)
            if (!open) {
              setEditingId(null)
              setFormData({ title: '', content: '', category: 'system' })
            }
          }}>
            <DialogTrigger asChild>
              <Button onClick={openNewDialog} className="gap-2">
                <Plus className="h-4 w-4" />
                New Document
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>{editingId ? 'Edit Document' : 'Create Internal Document'}</DialogTitle>
                <DialogDescription>
                  {editingId ? 'Update the documentation' : 'Add new system or process documentation'}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    placeholder="Enter document title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full h-10 px-3 py-2 border border-border rounded-md bg-background"
                  >
                    <option value="system">System</option>
                    <option value="api">API</option>
                    <option value="database">Database</option>
                    <option value="infrastructure">Infrastructure</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="content">Content *</Label>
                  <Textarea
                    id="content"
                    placeholder="Enter documentation content (supports markdown)"
                    rows={8}
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  />
                </div>
                <div className="flex gap-3 justify-end pt-4">
                  <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleAddOrEdit}>
                    {editingId ? 'Update Document' : 'Create Document'}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {filtered.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center text-text-light">
            {search ? 'No documents found matching your search' : 'No internal documentation yet'}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filtered.map((doc) => (
            <Card key={doc._id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 p-3 bg-muted rounded-lg">
                    <FileText className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-lg font-semibold">{doc.title}</h3>
                          <Badge className={`text-xs ${getCategoryColor(doc.category)}`}>
                            {doc.category}
                          </Badge>
                        </div>
                        <p className="mt-2 text-sm text-text line-clamp-2">{doc.content}</p>
                        <p className="mt-3 text-xs text-text-light">
                          Created by {doc.createdBy} on {doc.createdAt}
                          {doc.updatedAt !== doc.createdAt && ` • Updated ${doc.updatedAt}`}
                        </p>
                      </div>
                      {isAdmin && (
                        <div className="flex gap-2 flex-shrink-0">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleEdit(doc)}
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-destructive"
                            onClick={() => handleDelete(doc._id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
