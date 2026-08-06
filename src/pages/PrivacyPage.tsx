import { Link } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { APP_CONFIG } from '@/config/navigation'
import { Logo } from '@/components/common/Logo'

const sections = [
  {
    title: '1. Information We Collect',
    body: `We collect information you provide directly when you create an account, including your name, company name, work email, phone number, company type, city, state, country, and password. We may also collect information you submit through project management, support tickets, invoices, and other features of the Platform.`,
  },
  {
    title: '2. How We Use Your Information',
    body: `We use the information we collect to: (a) create and manage your account; (b) verify your identity and company details; (c) provide, maintain, and improve the Platform's features; (d) process support tickets and inquiries; (e) send you administrative and service-related communications; and (f) protect the security and integrity of the Platform.`,
  },
  {
    title: '3. Email & Account Verification',
    body: `When you sign up, we use your email address to communicate with you about your account. New client accounts are reviewed and verified by our administrators before full access is granted. We may send you notifications about the status of your account verification.`,
  },
  {
    title: '4. Information Sharing',
    body: `We do not sell, trade, or rent your personal information to third parties. We may share your information only with service providers who assist us in operating the Platform, when required by law, or with your explicit consent.`,
  },
  {
    title: '5. Data Security',
    body: `We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the internet or electronic storage is completely secure, and we cannot guarantee absolute security.`,
  },
  {
    title: '6. Cookies & Tracking',
    body: `The Platform may use cookies and similar technologies to enhance your experience, remember your preferences, and analyze usage patterns. You can control cookies through your browser settings.`,
  },
  {
    title: '7. Your Rights',
    body: `You have the right to access, correct, update, or delete your personal information at any time. You may also object to or restrict the processing of your data where applicable. To exercise these rights, please contact us using the details below.`,
  },
  {
    title: '8. Data Retention',
    body: `We retain your personal information for as long as your account is active or as needed to provide you with the Platform's services, comply with legal obligations, resolve disputes, and enforce our agreements.`,
  },
  {
title: "9. Children's Privacy",
    body: `The Platform is not intended for individuals under the age of 18. We do not knowingly collect personal information from children. If you believe we have collected information from a child, please contact us so we can remove it.`,
  },
  {
    title: '10. Changes to This Policy',
    body: `We may update this Privacy Policy from time to time. We will post any changes on this page and, where appropriate, notify you by email. Your continued use of the Platform after changes take effect constitutes acceptance of the revised policy.`,
  },
  {
    title: '11. Contact Us',
    body: `If you have any questions about this Privacy Policy or how we handle your information, please contact us at privacy@digiayudh.com.`,
  },
]

export default function PrivacyPage() {
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
            <CardTitle className="text-3xl">Privacy Policy</CardTitle>
            <p className="mt-2 text-sm text-muted-foreground">
              Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-pretty text-sm text-muted-foreground">
              {APP_CONFIG.name} ("we", "us", or "our") is committed to protecting your privacy. This Privacy
              Policy explains how we collect, use, and safeguard your personal information when you use our
              platform.
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
