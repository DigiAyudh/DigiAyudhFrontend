import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Plus, Pencil, Trash2, Mail, Key, Shield, Crown, ChevronDown } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAppDispatch, useAppSelector } from '../../redux/hooks'
import { fetchEmployees, createEmployee, updateEmployee } from '../../redux/slices/employeesSlice'
import type { Employee } from '../../types'
import { PageHeader } from '../../components/common/PageHeader'
import { DataTable, type Column } from '../../components/common/DataTable'
import { Button } from '../../components/ui/button'
import { Badge } from '../../components/ui/badge'
import { Avatar, AvatarFallback } from '../../components/ui/avatar'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '../../components/ui/dialog'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '../../components/ui/select'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from '../../components/ui/dropdown-menu'
import { FormField } from '../../components/common/FormField'
import { Input } from '../../components/ui/input'
import { ConfirmDialog } from '../../components/common/ConfirmDialog'
import { getInitials } from '../../lib/utils'

const employeeSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Valid email required'),
  position: z.string().min(2, 'Position is required'),
  department: z.string().min(2, 'Department is required'),
  phone: z.string().min(6, 'Phone is required'),
  city: z.string().min(2, 'City is required'),
  country: z.string().min(2, 'Country is required'),
  role: z.enum(['employee', 'admin'], { message: 'Select a valid role' }),
  password: z.string().min(6, 'Password must be at least 6 characters').optional().or(z.literal('')),
})
type EmployeeForm = z.infer<typeof employeeSchema>
type EmployeeWithRole = Employee & { role?: 'employee' | 'admin' }

export default function EmployeesPage() {
  const dispatch = useAppDispatch()
  const { employees, loading } = useAppSelector((s) => s.employees)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<EmployeeWithRole | null>(null)
  const [deleting, setDeleting] = useState<EmployeeWithRole | null>(null)
  const [settingPassword, setSettingPassword] = useState<EmployeeWithRole | null>(null)
  const [newPassword, setNewPassword] = useState('')

  const { register, handleSubmit, reset, setValue, watch, formState: { errors, isSubmitting } } = useForm<EmployeeForm>({
    resolver: zodResolver(employeeSchema),
    defaultValues: { role: 'employee' },
  })

  const selectedRole = watch('role')

  useEffect(() => {
    dispatch(fetchEmployees('digiayudh'))
  }, [dispatch])

  const openCreate = () => {
    setEditing(null)
    reset({ name: '', email: '', position: '', department: '', phone: '', city: '', country: '', role: 'employee', password: '' })
    setDialogOpen(true)
  }

  const openEdit = (emp: EmployeeWithRole) => {
    setEditing(emp)
    reset({
      name: emp.name, email: emp.email, position: emp.position, department: emp.department,
      phone: emp.phone, city: emp.city, country: emp.country, role: emp.role || 'employee',
    })
    setDialogOpen(true)
  }

  const onSubmit = async (data: EmployeeForm) => {
    try {
      if (editing) {
        await dispatch(updateEmployee({ id: editing._id, data })).unwrap()
        toast.success('Employee updated')
      } else {
        await dispatch(createEmployee(data)).unwrap()
        toast.success('Employee added')
      }
      setDialogOpen(false)
    } catch (err) {
      toast.error(typeof err === 'string' ? err : 'Something went wrong')
    }
  }

  const confirmDelete = async () => {
    if (!deleting) return
    // Soft delete via update (mock) — mark inactive
    await dispatch(updateEmployee({ id: deleting._id, data: { isActive: false } }))
    toast.success('Employee deactivated')
    setDeleting(null)
  }

  const handleSetPassword = async () => {
    if (!settingPassword || !newPassword) {
      toast.error('Password is required')
      return
    }
    try {
      await dispatch(updateEmployee({ id: settingPassword._id, data: { password: newPassword } })).unwrap()
      toast.success('Password updated successfully')
      setSettingPassword(null)
      setNewPassword('')
    } catch (err) {
      toast.error(typeof err === 'string' ? err : 'Failed to update password')
    }
  }

  const handleChangeRole = async (empId: string, newRole: string) => {
    try {
      await dispatch(updateEmployee({ id: empId, data: { role: newRole } })).unwrap()
      toast.success(`Role changed to ${newRole}`)
    } catch (err) {
      toast.error(typeof err === 'string' ? err : 'Failed to change role')
    }
  }

  const columns: Column<EmployeeWithRole>[] = [
    {
      header: 'Employee',
      accessor: 'name',
      cell: (row) => (
        <div className="flex items-center gap-3">
          <Avatar className="h-9 w-9"><AvatarFallback>{getInitials(row.name)}</AvatarFallback></Avatar>
          <div>
            <p className="font-medium">{row.name}</p>
            <p className="flex items-center gap-1 text-xs text-muted-foreground"><Mail className="h-3 w-3" />{row.email}</p>
          </div>
        </div>
      ),
    },
    { header: 'Position', accessor: 'position', sortable: true },
    { header: 'Department', accessor: 'department', cell: (row) => <Badge variant="outline">{row.department}</Badge> },
    { header: 'Location', accessor: 'city', cell: (row) => `${row.city}, ${row.country}` },
    {
      header: 'Role',
      accessor: 'role',
      cell: (row) => (
        <Badge variant={row.role === 'admin' ? 'default' : 'outline'} className="flex w-fit items-center gap-1">
          {row.role === 'admin' && <Shield className="h-3 w-3" />}
          {row.role || 'employee'}
        </Badge>
      ),
    },
    {
      header: 'Status',
      accessor: 'isActive',
      cell: (row) => (
        <Badge variant={row.isActive ? 'success' : 'outline'}>
          {row.isActive ? 'Active' : 'Inactive'}
        </Badge>
      ),
    },
    {
      header: '',
      cell: (row) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            <DropdownMenuItem onClick={() => openEdit(row)}>
              <Pencil className="h-4 w-4 mr-2" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setSettingPassword(row)}>
              <Key className="h-4 w-4 mr-2" />
              Set Password
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            {row.role === 'employee' && (
              <DropdownMenuItem onClick={() => handleChangeRole(row._id, 'admin')} className="text-blue-600">
                <Crown className="h-4 w-4 mr-2" />
                Promote to Admin
              </DropdownMenuItem>
            )}
            {row.role === 'admin' && (
              <DropdownMenuItem onClick={() => handleChangeRole(row._id, 'employee')} className="text-yellow-600">
                <Shield className="h-4 w-4 mr-2" />
                Demote to Employee
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => setDeleting(row)} className="text-destructive">
              <Trash2 className="h-4 w-4 mr-2" />
              Deactivate
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <PageHeader title="Employees" subtitle="Manage your team members and their roles.">
        <Button onClick={openCreate}><Plus className="h-4 w-4" /> Add Employee</Button>
      </PageHeader>

      <DataTable
        columns={columns}
        data={employees}
        loading={loading}
        searchPlaceholder="Search employees..."
        searchKeys={['name', 'email', 'position', 'department']}
        exportFileName="employees"
      />

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit Employee' : 'Add Employee'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField label="Full Name" error={errors.name?.message}>
                <Input {...register('name')} placeholder="Jane Doe" />
              </FormField>
              <FormField label="Email" error={errors.email?.message}>
                <Input type="email" {...register('email')} placeholder="jane@company.com" />
              </FormField>
              <FormField label="Position" error={errors.position?.message}>
                <Input {...register('position')} placeholder="Senior Developer" />
              </FormField>
              <FormField label="Department" error={errors.department?.message}>
                <Input {...register('department')} placeholder="Engineering" />
              </FormField>
              <FormField label="Phone" error={errors.phone?.message}>
                <Input {...register('phone')} placeholder="+1 555 000 0000" />
              </FormField>
              <FormField label="City" error={errors.city?.message}>
                <Input {...register('city')} placeholder="New York" />
              </FormField>
              <FormField label="Country" error={errors.country?.message}>
                <Input {...register('country')} placeholder="USA" />
              </FormField>
              <FormField label="Role" error={errors.role?.message}>
                <Select value={selectedRole} onValueChange={(value) => setValue('role', value as 'employee' | 'admin')}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="employee">Employee</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </FormField>
              {!editing && (
                <FormField label="Initial Password" error={errors.password?.message}>
                  <Input type="password" {...register('password')} placeholder="Set password (optional for now)" />
                </FormField>
              )}
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={isSubmitting}>{editing ? 'Save changes' : 'Add employee'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={!!settingPassword} onOpenChange={(open) => !open && setSettingPassword(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Key className="h-5 w-5" /> Set Password</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <p className="mb-2 text-sm text-muted-foreground">For: <span className="font-medium">{settingPassword?.name}</span></p>
              <FormField label="New Password">
                <Input 
                  type="password" 
                  value={newPassword} 
                  onChange={(e) => setNewPassword(e.target.value)} 
                  placeholder="Enter new password" 
                />
              </FormField>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setSettingPassword(null)}>Cancel</Button>
              <Button onClick={handleSetPassword}>Set Password</Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleting}
        onOpenChange={(o) => !o && setDeleting(null)}
        title="Deactivate employee?"
        description={`${deleting?.name} will be marked inactive. You can reactivate them later.`}
        confirmLabel="Deactivate"
        onConfirm={confirmDelete}
        destructive
      />
    </div>
  )
}
