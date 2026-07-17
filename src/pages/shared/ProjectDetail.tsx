import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Calendar, DollarSign, Flag, FileText, LinkIcon, Download, Eye, Trash2 } from 'lucide-react'
import { useAppDispatch, useAppSelector } from '../../redux/hooks'
import { fetchProjects } from '../../redux/slices/projectsSlice'
import { fetchTasks } from '../../redux/slices/tasksSlice'
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Badge } from '../../components/ui/badge'
import { StatusBadge } from '../../components/common/StatusBadge'
import { Progress } from '../../components/ui/progress'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../components/ui/tabs'
import PageLoader from '../../components/common/FullPageLoader'
import { EmptyState } from '../../components/common/EmptyState'
import { projectProgress, formatDate, formatCurrency, formatFileSize } from '../../lib/utils'

interface ProjectDocument {
  _id: string
  name: string
  type: 'file' | 'link'
  url?: string
  size?: number
  uploadedBy: string
  uploadedDate: string
  visibleTo: string[]
}

export default function ProjectDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const { projects, loading } = useAppSelector((s) => s.projects)
  const { tasks } = useAppSelector((s) => s.tasks)
  const { user } = useAppSelector((s) => s.auth)
  const [projectDocs, setProjectDocs] = useState<ProjectDocument[]>([
    {
      _id: 'pdoc1',
      name: 'Architecture Design',
      type: 'file',
      size: 2048000,
      uploadedBy: 'admin@company.com',
      uploadedDate: '2024-01-15',
      visibleTo: ['admin', 'employee', 'client'],
    },
    {
      _id: 'pdoc2',
      name: 'GitHub Repository',
      type: 'link',
      url: 'https://github.com/example/project',
      uploadedBy: 'employee@company.com',
      uploadedDate: '2024-01-10',
      visibleTo: ['admin', 'employee'],
    },
  ])

  useEffect(() => {
    if (projects.length === 0) dispatch(fetchProjects())
    dispatch(fetchTasks(undefined))
  }, [dispatch, projects.length])

  const project = projects.find((p) => p._id === id)
  const projectTasks = tasks.filter((t) => t.projectId === id)

  // Filter documents based on user role
  const visibleDocs = projectDocs.filter(doc => 
    doc.visibleTo.includes(user?.role || '')
  )

  if (loading && !project) return <PageLoader />
  if (!project) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" onClick={() => navigate(-1)}><ArrowLeft className="mr-2 h-4 w-4" /> Back</Button>
        <p className="text-text-light">Project not found.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Button variant="ghost" onClick={() => navigate(-1)} className="-ml-2"><ArrowLeft className="mr-2 h-4 w-4" /> Back to projects</Button>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-balance">{project.title}</h1>
            <StatusBadge status={project.status} />
          </div>
          <p className="max-w-2xl text-text-light">{project.description}</p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card><CardContent className="flex items-center gap-3 p-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary"><Calendar className="h-5 w-5" /></div>
          <div><p className="text-xs text-text-light">Timeline</p><p className="text-sm font-medium">{formatDate(project.startDate)} - {formatDate(project.endDate)}</p></div>
        </CardContent></Card>
        <Card><CardContent className="flex items-center gap-3 p-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary"><DollarSign className="h-5 w-5" /></div>
          <div><p className="text-xs text-text-light">Budget</p><p className="text-sm font-medium">{project.budget ? formatCurrency(project.budget) : '—'}</p></div>
        </CardContent></Card>
        <Card><CardContent className="flex items-center gap-3 p-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary"><Flag className="h-5 w-5" /></div>
          <div><p className="text-xs text-text-light">Priority</p><p className="text-sm font-medium capitalize">{project.priority}</p></div>
        </CardContent></Card>
      </div>

      <Card>
        <CardContent className="space-y-2 p-5">
          <div className="flex justify-between text-sm"><span className="font-medium">Overall progress</span><span>{projectProgress(project.status)}%</span></div>
          <Progress value={projectProgress(project.status)} />
        </CardContent>
      </Card>

      <Tabs defaultValue="tasks">
        <TabsList>
          <TabsTrigger value="tasks">Tasks ({projectTasks.length})</TabsTrigger>
          <TabsTrigger value="documents">Documents & Links ({visibleDocs.length})</TabsTrigger>
          <TabsTrigger value="overview">Overview</TabsTrigger>
        </TabsList>
        <TabsContent value="tasks">
          <Card>
            <CardHeader><CardTitle>Tasks</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {projectTasks.length === 0 && <p className="py-4 text-center text-sm text-text-light">No tasks yet.</p>}
              {projectTasks.map((t) => (
                <div key={t._id} className="flex items-center justify-between gap-3 rounded-lg border border-border p-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{t.title}</p>
                    <p className="text-xs text-text-light">Due {formatDate(t.dueDate)}</p>
                  </div>
                  <StatusBadge status={t.status} />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="documents">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Project Documents & Links
              </CardTitle>
            </CardHeader>
            <CardContent>
              {visibleDocs.length === 0 ? (
                <EmptyState 
                  icon={<FileText className="h-6 w-6" />} 
                  title="No documents" 
                  description="No documents or links have been shared for this project yet." 
                />
              ) : (
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {visibleDocs.map((doc) => (
                    <Card key={doc._id} className="border">
                      <CardContent className="p-4 space-y-3">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-start gap-3 flex-1 min-w-0">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary mt-1">
                              {doc.type === 'link' ? (
                                <LinkIcon className="h-4 w-4" />
                              ) : (
                                <FileText className="h-4 w-4" />
                              )}
                            </div>
                            <div className="min-w-0">
                              <p className="truncate text-sm font-medium">{doc.name}</p>
                              <p className="text-xs text-text-light mt-1">By: {doc.uploadedBy}</p>
                            </div>
                          </div>
                        </div>
                        {doc.type === 'file' && doc.size && (
                          <p className="text-xs text-text-light">{formatFileSize(doc.size)}</p>
                        )}
                        <p className="text-xs text-text-light">{formatDate(doc.uploadedDate)}</p>
                        <div className="flex gap-2 pt-2">
                          {doc.type === 'link' ? (
                            <Button
                              size="sm"
                              variant="outline"
                              className="flex-1 gap-2"
                              onClick={() => window.open(doc.url, '_blank')}
                            >
                              <Eye className="h-3 w-3" />
                              Open
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              variant="outline"
                              className="flex-1 gap-2"
                            >
                              <Download className="h-3 w-3" />
                              Download
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="overview">
          <Card>
            <CardHeader><CardTitle>Description</CardTitle></CardHeader>
            <CardContent><p className="text-sm leading-relaxed text-text-light">{project.description}</p></CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
