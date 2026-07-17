'use client'

import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'
import { Mail, Phone, MapPin, Send } from 'lucide-react'
import { useAppDispatch, useAppSelector } from '@/redux/hooks'
import { submitContactRequest } from '@/redux/slices/contactSlice'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Textarea } from '../ui/textarea'
import { FormField } from '../common/FormField'
import PhoneInput from 'react-phone-input-2'
import 'react-phone-input-2/lib/style.css'
import '../../index.css'

const schema = z.object({
  name: z.string().min(2, 'Please enter your name'),
  email: z.string().email('Enter a valid email'),
  countryCode: z.string().optional(),
  phone: z.string().optional(),
  company: z.string().optional(),
  subject: z.string().min(3, 'Add a short subject'),
  message: z.string().min(10, 'Tell us a little more (min 10 chars)'),
})

type ContactForm = z.infer<typeof schema>

const details = [
  { icon: Mail, label: 'Email', value: 'hello@digiayudh.com' },
  { icon: Phone, label: 'Phone', value: '+91 9109442020' },
  { icon: MapPin, label: 'Office', value: 'Indore, Madhya Pradesh · Remote-first' },
]

export function ContactSection() {
  const dispatch = useAppDispatch()
  const submitting = useAppSelector((s) => s.contact.submitting)

  const {
    register,
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<ContactForm>({
    resolver: zodResolver(schema),
    defaultValues: {
      countryCode: '+1',
      phone: '',
    },
  })

  const onSubmit = async (values: ContactForm) => {
    const result = await dispatch(submitContactRequest(values))
    if (submitContactRequest.fulfilled.match(result)) {
      toast.success('Thanks! Our team will reach out shortly.')
      reset()
    } else {
      toast.error((result.payload as string) || 'Something went wrong. Try again.')
    }
  }

  return (
    <section id="contact" className="py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        <div className="relative overflow-hidden rounded-3xl border border-border bg-card">

          <div className="pointer-events-none absolute -right-20 -top-20 h-80 w-80 rounded-full bg-primary/20 blur-3xl" />

          <div className="grid lg:grid-cols-2">

            <div className="p-8 lg:p-12">

              <span className="inline-flex rounded-full border border-primary/30 bg-primary/10 px-4 py-1 text-sm font-medium text-primary">
                Start something great
              </span>

              <h2 className="mt-5 text-3xl font-bold tracking-tight sm:text-4xl">
                Let's build something amazing together.
              </h2>

              <p className="mt-5 max-w-md text-lg text-muted-foreground">
                Have a question or need a custom software solution? Tell us about your
                project and our team will get back to you within one business day.
              </p>
              <ul className="mt-10 space-y-3">

                {[
                  'Free consultation',
                  'Fast response within 24 hours',
                  'Custom software solutions',
                ].map((item) => (

                  <li
                    key={item}
                    className="flex items-center gap-2 text-sm text-muted-foreground"
                  >
                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-green-500/20">
                      ✓
                    </div>

                    {item}
                  </li>

                ))}

              </ul>

              <div className="mt-10 space-y-5">
                {details.map((d) => (
                  <div key={d.label} className="flex items-center gap-4">

                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <d.icon className="h-5 w-5" />
                    </div>

                    <div>
                      <p className="text-sm text-muted-foreground">
                        {d.label}
                      </p>

                      <p className="font-medium">
                        {d.value}
                      </p>
                    </div>

                  </div>
                ))}
              </div>

              

            </div>

            <form
              onSubmit={handleSubmit(onSubmit)}
              className="border-t border-border p-8 lg:border-l lg:border-t-0 lg:p-12"
            >
              <div className="grid gap-5 sm:grid-cols-2">
                <FormField label="Name" htmlFor="c-name" error={errors.name?.message} required>
                  <Input id="c-name" placeholder="Ayush" {...register('name')} />
                </FormField>
                <FormField label="Email" htmlFor="c-email" error={errors.email?.message} required>
                  <Input id="c-email" type="email" placeholder="ayush@company.com" {...register('email')} />
                </FormField>
                <FormField label="Phone" error={errors.phone?.message}>
                  <Controller
                    name="phone"
                    control={control}
                    render={({ field }) => (
                      <PhoneInput
                        country="in"
                        enableSearch
                        value={field.value || ''}
                        onChange={(value, country) => {
                          field.onChange(value)
                          if (country && typeof country !== 'string') {
                            setValue('countryCode', `+${country.dialCode} `)
                          }
                        }}
                      />
                    )}
                  />
                </FormField>
                <FormField label="Company" htmlFor="c-company" error={errors.company?.message}>
                  <Input id="c-company" placeholder="DigiAyudh" {...register('company')} />
                </FormField>
              </div>
              <div className="mt-4">
                <FormField label="Subject" htmlFor="c-subject" error={errors.subject?.message} required>
                  <Input id="c-subject" placeholder="How can we help?" {...register('subject')} />
                </FormField>
              </div>
              <div className="mt-4">
                <FormField label="Message" htmlFor="c-message" error={errors.message?.message} required>
                  <Textarea id="c-message" rows={5} placeholder="Tell us about your team and goals..." {...register('message')} />
                </FormField>
              </div>
              <Button
                type="submit"
                size="lg"
                className="mt-8 w-full rounded-xl"
                isLoading={submitting}
              >
                {submitting ? 'Sending...' : 'Send Message'}

                <Send className="ml-2 h-4 w-4" />
              </Button>

              <p className="mt-4 text-center text-xs text-muted-foreground">
                Your information is secure and will never be shared.
              </p>
            </form>

          </div>
        </div>
      </div>
    </section>

  )
}
