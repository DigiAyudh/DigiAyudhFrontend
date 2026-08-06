import { Link } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { APP_CONFIG } from '@/config/navigation'
import { Logo } from '@/components/common/Logo'

const sections = [
  {
    title: '1. Acceptance of Terms',
    body: `By accessing or using ${APP_CONFIG.name} ("the Platform"), you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any part of these terms, you must not use the Platform.`,
  },
  {
    title: '2. Eligibility',
    body: `You must be at least 18 years of age to create an account and use the Platform. By registering, you represent and warrant that the information you provide is accurate, current, and complete.`,
  },
  {
    title: '3. Account Responsibility & Verification',
    body: `You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. New client accounts are subject to review and verification by our team. Your account is considered "pending" until an administrator verifies and approves it. We reserve the right to approve or reject any account application at our sole discretion.`,
  },
  {
    title: '4. Use of Services',
    body: `The Platform provides project management, client support, invoicing, and related business tools. You agree to use the Platform only for lawful purposes and in accordance with these terms. You may not use the Platform to infringe on the rights of others or to disrupt the operation of the Platform.`,
  },
  {
    title: '5. Acceptable Use',
    body: `You agree not to: (a) attempt to gain unauthorized access to any part of the Platform; (b) upload malicious code or content; (c) interfere with the security or performance of the Platform; (d) use the Platform to send unsolicited messages or spam; or (e) reverse engineer any portion of the Platform.`,
  },
  {
    title: '6. Intellectual Property',
    body: `All content, design, graphics, and software on the Platform are the exclusive property of ${APP_CONFIG.name} and are protected by intellectual property laws. You may not reproduce, distribute, or create derivative works from any content without our prior written consent.`,
  },
  {
    title: '7. Termination',
    body: `We may suspend or terminate your access to the Platform at any time, with or without notice, if we believe you have violated these terms or if required by law. Upon termination, your right to use the Platform ceases immediately.`,
  },
  {
    title: '8. Disclaimers',
    body: `The Platform is provided on an "as is" and "as available" basis without warranties of any kind, either express or implied, including but not limited to warranties of merchantability, fitness for a particular purpose, or non-infringement. We do not warrant that the Platform will be uninterrupted, secure, or error-free.`,
  },
  {
    title: '9. Limitation of Liability',
    body: `To the maximum extent permitted by law, ${APP_CONFIG.name} shall not be liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of profits, data, or goodwill arising from your use of the Platform.`,
  },
  {
    title: '10. Governing Law',
    body: `These Terms of Service shall be governed by and construed in accordance with the laws of India. Any disputes arising under these terms shall be subject to the exclusive jurisdiction of the courts located in Indore, Madhya Pradesh.`,
  },
  {
    title: '11. Changes to These Terms',
    body: `We may update these Terms of Service from time to time. We will notify you of any material changes by posting the revised terms on this page. Your continued use of the Platform after changes take effect constitutes acceptance of the revised terms.`,
  },
  {
    title: '12. Contact Us',
    body: `If you have any questions about these Terms of Service, please contact us at support@digiayudh.com.`,
  },
]

export default function TermsPage() {
  return (
    <div className="relative min-h-screen bg-background text-foreground">
      <div className="pointer-events-none absolute inset-0 bg-grid" />
      <div className="pointer-events-none absolute -right-40 -top-40 size-[500px] rounded-full bg-purple-600/5 blur-3xl" />
      <div className="pointer-events-none absolute -left-40 bottom-0 size-[500px] rounded-full bg-blue-600/5 blur-3xl" />

      <div className="relative mx-auto max-w-3xl px-4 py-12 sm:px-6">
        <div className="mb-8 flex items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-2">
<div className="flex size-10 items-center justify-center rounded-lg ">
              <Logo />
            </div>
            <span className="text-lg font-bold">{APP_CONFIG.name}</span>
          </Link>
          <Link to="/" className="text-sm text-primary hover:underline">
            ← Back to home
          </Link>
        </div>

        <Card className="border-border/50 bg-card/50 backdrop-blur-sm shadow-xl">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl">Terms of Service</CardTitle>
            <p className="mt-2 text-sm text-muted-foreground">
              Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-pretty text-sm text-muted-foreground">
              Welcome to {APP_CONFIG.name}. These Terms of Service govern your use of our platform and services.
              Please read them carefully.
            </p>

            {sections.map((section) => (
              <div key={section.title}>
                <h2 className="text-lg font-semibold">{section.title}</h2>
                <p className="mt-2 text-pretty text-sm text-muted-foreground">{section.body}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
