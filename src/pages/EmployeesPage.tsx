import { useEffect, useState } from 'react'
import { useAppDispatch, useAppSelector } from '../redux/hooks'
import { fetchEmployees, createEmployee } from '../redux/slices/employeesSlice'
import DashboardLayout from '../layouts/DashboardLayout'
import { Plus, Mail, Phone, MapPin } from 'lucide-react'

export default function EmployeesPage() {
  const dispatch = useAppDispatch()
  const { user } = useAppSelector((state) => state.auth)
  const { employees, loading } = useAppSelector((state) => state.employees)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    position: '',
    department: '',
    city: '',
    country: '',
  })

  useEffect(() => {
    if (user?.company) {
      dispatch(fetchEmployees(user.company))
    }
  }, [user, dispatch])

  const handleCreateEmployee = async (e: React.FormEvent) => {
    e.preventDefault()
    if (user?.company) {
      await dispatch(
        createEmployee({
          ...formData,
          company: user.company,
          joiningDate: new Date(),
          isActive: true,
        })
      )
      setFormData({
        name: '',
        email: '',
        phone: '',
        position: '',
        department: '',
        city: '',
        country: '',
      })
      setShowForm(false)
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold text-text">Employees</h1>
            <p className="text-text-light mt-2">Manage your team members</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary-dark transition"
          >
            <Plus size={20} />
            Add Employee
          </button>
        </div>

        {/* Create Form */}
        {showForm && (
          <div className="bg-background border border-border rounded-xl p-6">
            <h2 className="text-2xl font-bold text-text mb-6">Add New Employee</h2>
            <form onSubmit={handleCreateEmployee} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text mb-2">Full Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Employee name"
                    required
                    className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text mb-2">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="email@example.com"
                    required
                    className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text mb-2">Phone</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+1 (555) 000-0000"
                    required
                    className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text mb-2">Position</label>
                  <input
                    type="text"
                    value={formData.position}
                    onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                    placeholder="Job title"
                    required
                    className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text mb-2">Department</label>
                  <input
                    type="text"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    placeholder="Department"
                    required
                    className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text mb-2">City</label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    placeholder="City"
                    className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-text mb-2">Country</label>
                <input
                  type="text"
                  value={formData.country}
                  onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                  placeholder="Country"
                  className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="flex gap-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition disabled:opacity-50"
                >
                  Add Employee
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-6 py-2 border border-border text-text rounded-lg hover:bg-surface transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Employees Table */}
        <div className="bg-background border border-border rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-surface">
                  <th className="text-left py-4 px-6 text-text-light font-medium">Name</th>
                  <th className="text-left py-4 px-6 text-text-light font-medium">Email</th>
                  <th className="text-left py-4 px-6 text-text-light font-medium">Position</th>
                  <th className="text-left py-4 px-6 text-text-light font-medium">Department</th>
                  <th className="text-left py-4 px-6 text-text-light font-medium">City</th>
                </tr>
              </thead>
              <tbody>
                {employees.map((employee) => (
                  <tr key={employee._id} className="border-b border-border hover:bg-surface">
                    <td className="py-4 px-6 text-text font-medium">{employee.name}</td>
                    <td className="py-4 px-6 flex items-center gap-2 text-text-light">
                      <Mail size={16} />
                      {employee.email}
                    </td>
                    <td className="py-4 px-6 text-text">{employee.position}</td>
                    <td className="py-4 px-6 text-text">{employee.department}</td>
                    <td className="py-4 px-6 flex items-center gap-2 text-text-light">
                      <MapPin size={16} />
                      {employee.city}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {employees.length === 0 && (
          <div className="text-center py-16">
            <p className="text-text-light text-lg">No employees yet. Add your first team member!</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
