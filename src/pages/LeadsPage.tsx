import { useEffect, useState } from 'react'
import { useAppDispatch, useAppSelector } from '../redux/hooks'
import { fetchLeads, createLead, updateLead } from '../redux/slices/leadsSlice'
import DashboardLayout from '../layouts/DashboardLayout'
import { Plus, Mail, Phone } from 'lucide-react'

export default function LeadsPage() {
  const dispatch = useAppDispatch()
  const { user } = useAppSelector((state) => state.auth)
  const { leads, loading } = useAppSelector((state) => state.leads)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    source: 'website',
    budget: '',
    notes: '',
  })

  useEffect(() => {
    if (user?.company) {
      dispatch(fetchLeads(user.company))
    }
  }, [user, dispatch])

  const handleCreateLead = async (e: React.FormEvent) => {
    e.preventDefault()
    if (user?.company) {
      await dispatch(
        createLead({
          ...formData,
          company_id: user.company,
          status: 'new',
          budget: formData.budget ? parseFloat(formData.budget) : undefined,
        })
      )
      setFormData({
        name: '',
        email: '',
        phone: '',
        company: '',
        source: 'website',
        budget: '',
        notes: '',
      })
      setShowForm(false)
    }
  }

  const handleStatusUpdate = async (leadId: string, newStatus: string) => {
    await dispatch(updateLead({ id: leadId, data: { status: newStatus } }))
  }

  const statuses = ['new', 'contacted', 'qualified', 'proposal', 'closed']

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold text-text">Leads</h1>
            <p className="text-text-light mt-2">Manage your sales leads</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary-dark transition"
          >
            <Plus size={20} />
            New Lead
          </button>
        </div>

        {/* Create Form */}
        {showForm && (
          <div className="bg-background border border-border rounded-xl p-6">
            <h2 className="text-2xl font-bold text-text mb-6">Add New Lead</h2>
            <form onSubmit={handleCreateLead} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text mb-2">Lead Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Lead name"
                    required
                    className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text mb-2">Company</label>
                  <input
                    type="text"
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    placeholder="Company name"
                    className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
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
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text mb-2">Budget</label>
                  <input
                    type="number"
                    value={formData.budget}
                    onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                    placeholder="Budget"
                    className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text mb-2">Source</label>
                  <select
                    value={formData.source}
                    onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                    className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="website">Website</option>
                    <option value="referral">Referral</option>
                    <option value="email">Email</option>
                    <option value="social">Social Media</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-text mb-2">Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Additional notes"
                  rows={3}
                  className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="flex gap-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition disabled:opacity-50"
                >
                  Add Lead
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

        {/* Leads Table */}
        <div className="bg-background border border-border rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-surface">
                  <th className="text-left py-4 px-6 text-text-light font-medium">Name</th>
                  <th className="text-left py-4 px-6 text-text-light font-medium">Company</th>
                  <th className="text-left py-4 px-6 text-text-light font-medium">Contact</th>
                  <th className="text-left py-4 px-6 text-text-light font-medium">Budget</th>
                  <th className="text-left py-4 px-6 text-text-light font-medium">Source</th>
                  <th className="text-left py-4 px-6 text-text-light font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {leads.map((lead) => (
                  <tr key={lead._id} className="border-b border-border hover:bg-surface">
                    <td className="py-4 px-6 text-text font-medium">{lead.name}</td>
                    <td className="py-4 px-6 text-text">{lead.company}</td>
                    <td className="py-4 px-6">
                      <div className="flex flex-col gap-1">
                        <a href={`mailto:${lead.email}`} className="flex items-center gap-1 text-primary hover:underline">
                          <Mail size={16} />
                          {lead.email}
                        </a>
                        <a href={`tel:${lead.phone}`} className="flex items-center gap-1 text-text-light text-sm hover:text-text">
                          <Phone size={16} />
                          {lead.phone}
                        </a>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-text">${lead.budget || '0'}</td>
                    <td className="py-4 px-6 text-text capitalize">{lead.source}</td>
                    <td className="py-4 px-6">
                      <select
                        value={lead.status}
                        onChange={(e) => handleStatusUpdate(lead._id, e.target.value)}
                        className={`px-3 py-1 rounded-full text-sm font-medium bg-surface border border-border cursor-pointer ${
                          lead.status === 'closed' ? 'text-green-700' : 'text-text'
                        }`}
                      >
                        {statuses.map((status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {leads.length === 0 && (
          <div className="text-center py-16">
            <p className="text-text-light text-lg">No leads yet. Add your first lead to get started!</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
