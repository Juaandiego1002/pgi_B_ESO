'use client'

import { Navbar } from '@/components/landing/navbar'
import { Hero } from '@/components/landing/hero'
import { Services } from '@/components/landing/services'
import { HowItWorks } from '@/components/landing/how-it-works'
import { Testimonials } from '@/components/landing/testimonials'
import { InquiryForm } from '@/components/landing/inquiry-form'
import { ContactForm } from '@/components/landing/contact-form'
import { LandingFooter } from '@/components/landing/footer'

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Navbar />
      <main className="flex-1">
        <Hero />
        <div className="section-divider" />
        <Services />
        <HowItWorks />
        <div className="section-divider" />
        <Testimonials />
        <InquiryForm />
        <div className="section-divider" />
        <ContactForm />
      </main>
      <LandingFooter />
    </div>
  )
}
