import { useRef, useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { Upload, X, ExternalLink, Copy, Check, Award } from 'lucide-react'
import { useAppDispatch, useAppSelector } from '../../redux/hooks'
import { setUser, updateProfile } from '../../redux/slices/authSlice'
import apiClient from '../../services/api'
import { PageHeader } from '../../components/common/PageHeader'
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Textarea } from '../../components/ui/textarea'
import { Badge } from '../../components/ui/badge'
import { FormField } from '../../components/common/FormField'
import { Avatar, AvatarImage, AvatarFallback } from '../../components/ui/avatar'
import { StatusBadge } from '../../components/common/StatusBadge'
import { getInitials } from '../../utils/helpers'
import { formatDate } from '../../lib/utils'

interface FormValues {
  name: string
  phone: string
  companyName: string
  city: string
  country: string
  bio: string
}

interface Certificate {
  _id: string
  title: string
  issueDate: string
  expiryDate?: string
  verificationUrl: string
  issuedBy: string
}

export default function ProfilePage() {
  const dispatch = useAppDispatch()
  const { user } = useAppSelector((s) => s.auth)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [previewImage, setPreviewImage] = useState<string | null>(user?.profileImage || null)
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const isClient = user?.role === 'client'
  const [employeeCertificates, setEmployeeCertificates] = useState<Certificate[]>([])
  const [isLoadingCerts, setIsLoadingCerts] = useState(!isClient)

  // Fetch employee certificates on mount
  useEffect(() => {
    if (isClient || !user?._id) return
    
    const fetchCertificates = async () => {
      setIsLoadingCerts(true)
      try {
        const response = await apiClient.getCertificatesByEmployee(user._id)
        setEmployeeCertificates(response.data.certificates || response.data)
      } catch (err) {
        console.error('[v0] Failed to fetch certificates:', err)
        setEmployeeCertificates([])
      } finally {
        setIsLoadingCerts(false)
      }
    }
    
    fetchCertificates()
  }, [user?._id, isClient])

  const { register, handleSubmit, formState: { isDirty }, reset } = useForm<FormValues>({
    defaultValues: {
      name: user?.name || '',
      phone: user?.phone || '',
      companyName: user?.companyName || '',
      city: user?.city || '',
      country: user?.country || '',
      bio: user?.bio || '',
    },
  })
  
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB')
      return
    }

    // Validate file type
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      toast.error('Only JPG, PNG, and WebP files are allowed')
      return
    }

    setIsUploadingPhoto(true)
    try {
      // Create preview while uploading to backend
      const reader = new FileReader()
      reader.onloadend = () => {
        const result = reader.result as string
        setPreviewImage(result)
      }
      reader.readAsDataURL(file)

      // Upload to backend
      const response = await apiClient.uploadProfilePicture(file)
      const uploadedImageUrl = response.data.url || response.data.profileImage
      
      if (user) {
        dispatch(setUser({ ...user, profileImage: uploadedImageUrl }))
        toast.success('Profile photo updated successfully')
      }
    } catch (error) {
      toast.error(apiClient.getErrorMessage(error) || 'Failed to upload photo')
      setPreviewImage(null)
    } finally {
      setIsUploadingPhoto(false)
    }
  }

  const handleRemovePhoto = async () => {
    setPreviewImage(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
    
    try {
      await apiClient.deleteProfilePicture()
      if (user) {
        dispatch(setUser({ ...user, profileImage: undefined }))
        toast.success('Profile photo removed')
      }
    } catch (error) {
      toast.error(apiClient.getErrorMessage(error) || 'Failed to remove photo')
    }
  }

  const handleCopyCertLink = (certId: string, url: string) => {
    navigator.clipboard.writeText(url)
    setCopiedId(certId)
    toast.success('Verification link copied to clipboard')
    setTimeout(() => setCopiedId(null), 2000)
  }

  const onSubmit = async (values: FormValues) => {
    if (!user) return
    
    setIsSubmitting(true)
    try {
      await dispatch(updateProfile({ ...values, id: user._id })).unwrap()
      toast.success('Profile updated successfully')
      reset(values)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update profile')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader title="My Profile" subtitle="Manage your personal information." />

      <div className="grid gap-6 lg:grid-cols-3">
        <Card>
          <CardContent className="flex flex-col items-center gap-3 p-6 text-center">
            <div className="relative">
              <Avatar className="h-24 w-24">
                <AvatarImage src={previewImage || user?.profileImage} alt={user?.name} />
                <AvatarFallback className="text-2xl">{getInitials(user?.name || 'U')}</AvatarFallback>
              </Avatar>
              {previewImage && (
                <button
                  onClick={handleRemovePhoto}
                  className="absolute -right-2 -top-2 rounded-full bg-destructive p-1 text-white hover:bg-destructive/90"
                  title="Remove photo"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handlePhotoChange}
              className="hidden"
            />
            <Button
              size="sm"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploadingPhoto}
              className="gap-2"
            >
              <Upload className="h-4 w-4" />
              {isUploadingPhoto ? 'Uploading...' : 'Upload Photo'}
            </Button>
            <p className="text-xs text-text-light">Max 5MB • JPG, PNG, WebP</p>
            <div>
              <h3 className="text-lg font-semibold">{user?.name}</h3>
              <p className="text-sm text-text-light">{user?.email}</p>
            </div>
            <div className="flex items-center gap-2">
              <StatusBadge status={user?.role || 'client'} />
              {user?.verificationStatus && <StatusBadge status={user.verificationStatus} />}
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader><CardTitle>Edit Details</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField label="Full Name"><Input {...register('name')} /></FormField>
                <FormField label="Phone"><Input {...register('phone')} /></FormField>
                <FormField label="Company"><Input {...register('companyName')} /></FormField>
                <FormField label="City"><Input {...register('city')} /></FormField>
                <FormField label="Country"><Input {...register('country')} /></FormField>
              </div>
              <FormField label="Bio"><Textarea rows={3} {...register('bio')} placeholder="A short bio..." /></FormField>
              <div className="flex justify-end">
                <Button type="submit" disabled={!isDirty || isSubmitting}>
                  {isSubmitting ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Certificates Section - Only visible to employees and admins */}
      {!isClient && !isLoadingCerts && employeeCertificates.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Award className="h-5 w-5" />Certificates & Credentials</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2">
              {employeeCertificates.map((cert) => {
                const isExpired = cert.expiryDate && new Date(cert.expiryDate) < new Date()
                return (
                  <Card key={cert._id} className="border">
                    <CardContent className="p-4 space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="space-y-1">
                          <h4 className="font-semibold text-sm">{cert.title}</h4>
                          <p className="text-xs text-text-light">Issued: {formatDate(cert.issueDate)}</p>
                        </div>
                        {isExpired && (
                          <Badge variant="destructive" className="whitespace-nowrap">Expired</Badge>
                        )}
                      </div>
                      {cert.expiryDate && (
                        <p className={`text-xs ${isExpired ? 'text-destructive' : 'text-text-light'}`}>
                          Expires: {formatDate(cert.expiryDate)}
                        </p>
                      )}
                      <p className="text-xs text-text-light">Issued by: {cert.issuedBy}</p>
                      <div className="flex gap-2 pt-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1 gap-2"
                          onClick={() => window.open(cert.verificationUrl, '_blank')}
                        >
                          <ExternalLink className="h-3 w-3" />
                          View
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleCopyCertLink(cert._id, cert.verificationUrl)}
                        >
                          {copiedId === cert._id ? (
                            <Check className="h-3 w-3" />
                          ) : (
                            <Copy className="h-3 w-3" />
                          )}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
