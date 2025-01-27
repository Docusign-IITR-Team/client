'use client';

import { signIn, useSession } from 'next-auth/react';
import Link from 'next/link';
import Navbar from './components/Navbar';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { BrainCircuit, FileText, Users, Bot, Lock, Zap } from 'lucide-react';
import { DarkBlueBackground } from '@/app/components/dark-blue-background';
import { SparklesCore } from '@/components/ui/sparkles';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TextGenerateEffect } from '@/app/components/text-generate-effect';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { InfiniteMovingCards } from '@/app/components/infinite-moving-cards';
import { TypewriterEffectSmooth } from '@/components/ui/typewriter-effect';
import { Footer } from './components/Footer';

const features = [
  {
    icon: <BrainCircuit className='h-6 w-6' />,
    title: 'AI-Powered Analysis',
    description:
      'Advanced document analysis providing insights on terms, conditions, and potential risks.',
    color: 'text-blue-500',
  },
  {
    icon: <FileText className='h-6 w-6' />,
    title: 'Smart Agreement Creation',
    description:
      'Create legal agreements through an intuitive chat interface with AI guidance.',
    color: 'text-blue-400',
  },
  {
    icon: <Users className='h-6 w-6' />,
    title: 'Real-time Collaboration',
    description:
      'Work together with team members, add comments, and track changes in real-time.',
    color: 'text-blue-500',
  },
];

const useCases = [
  {
    title: 'Legal Professionals',
    items: [
      'Automated contract analysis and risk assessment',
      'Quick generation of standard legal documents',
      'Efficient document review and collaboration',
      'Track changes and maintain version history',
      'Secure client document sharing',
    ],
  },
  {
    title: 'Business Owners',
    items: [
      'Create and manage rental agreements',
      'Generate employment contracts',
      'Handle vendor agreements',
      'Maintain legal document compliance',
      'Collaborate with legal teams',
    ],
  },
  {
    title: 'Real Estate',
    items: [
      'Streamlined lease agreement creation',
      'Property management documentation',
      'Tenant screening forms',
      'Maintenance contracts',
      'Real estate purchase agreements',
    ],
  },
];

const faqs = [
  {
    question: 'How does the AI-powered analysis work?',
    answer:
      'Our AI system uses advanced natural language processing to analyze legal documents, identifying key terms, potential risks, and suggesting improvements. It provides a comprehensive breakdown of important clauses, deadlines, and obligations while highlighting any areas that may need attention.',
  },
  {
    question: 'Is my data secure?',
    answer:
      'Yes, we take security seriously. All documents are encrypted both in transit and at rest. We use enterprise-grade security measures, regular security audits, and comply with industry standards to ensure your data remains private and secure.',
  },
  {
    question: 'Can I customize the generated agreements?',
    answer:
      'While our AI helps generate initial drafts, you have full control to modify and customize any part of the agreement. Our chat interface makes it easy to specify your requirements and make changes as needed.',
  },
];

const testimonials = [
  {
    quote:
      "This platform has revolutionized our legal document management. It's a game-changer!",
    name: 'Sarah Johnson',
    title: 'Corporate Lawyer',
  },
  {
    quote:
      "The AI-powered analysis saves us countless hours. It's like having a team of expert paralegals at your fingertips.",
    name: 'Michael Chang',
    title: 'Legal Tech Consultant',
  },
  {
    quote:
      'As a small business owner, this tool has made legal compliance so much easier and more affordable.',
    name: 'Emily Rodriguez',
    title: 'Startup Founder',
  },
];

export default function Home() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
      },
    },
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
      >
        <DarkBlueBackground className='min-h-screen'>
          <Navbar />
          <main className='relative'>
            <div className='absolute inset-0 h-screen w-full'>
              <div className='absolute inset-0 bg-gradient-to-tr from-[#1e3a8a]/50 via-[#1e40af]/30 to-[#1e3a8a]/10 pointer-events-none' />
              <SparklesCore
                background='transparent'
                minSize={0.4}
                maxSize={1}
                particleDensity={100}
                className='w-full h-full'
                particleColor='#ffffff'
              />
            </div>

            <div className='relative z-10 pt-40'>
              {/* Hero Section */}
              <motion.div
                initial='hidden'
                animate='visible'
                variants={containerVariants}
                className='container mx-auto px-4'
              >
                <motion.div
                  variants={itemVariants}
                  className='text-center space-y-8'
                >
                  <div className='h-[8rem] flex items-center justify-center text-white'>
                    <TypewriterEffectSmooth
                      words={[
                        { text: 'Create' },
                        { text: 'and' },
                        { text: 'manage' },
                        { text: 'legal' },
                        { text: 'documents' },
                        { text: 'with' },
                        { text: 'AI', className: 'text-blue-500' },
                      ]}
                    />
                  </div>
                  <motion.p
                    variants={itemVariants}
                    className='mx-auto max-w-[700px] text-white/90 text-lg'
                  >
                    Create, manage, and share legal documents effortlessly.
                    Powered by AI for accuracy and efficiency.
                  </motion.p>
                  <motion.div
                    variants={itemVariants}
                    className='flex justify-center gap-4'
                  >
                    <Link href='/dashboard'>
                      <Button
                        size='lg'
                        className='bg-blue-500 text-white hover:bg-blue-600'
                      >
                        Get Started
                      </Button>
                    </Link>
                    <Button
                      size='lg'
                      variant='outline'
                      className='border-blue-500 text-blue-500 hover:bg-blue-500/10'
                    >
                      Learn More
                    </Button>
                  </motion.div>
                  ;
                </motion.div>

                {/* Features Grid */}
                <motion.div
                  variants={containerVariants}
                  className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-24'
                >
                  {features.map((feature, index) => (
                    <motion.div
                      key={index}
                      variants={itemVariants}
                      className='relative group'
                      whileHover={{
                        scale: 1.05,
                        transition: { duration: 0.2 },
                      }}
                    >
                      <div className='absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg blur opacity-30 group-hover:opacity-100 transition duration-1000 group-hover:duration-200' />
                      <Card className='relative p-6 bg-white/10 backdrop-blur-sm border-blue-500/20 shadow-lg'>
                        <div
                          className={cn(
                            'w-12 h-12 rounded-lg flex items-center justify-center',
                            feature.color
                          )}
                        >
                          {feature.icon}
                        </div>
                        <h3 className='mt-4 text-lg font-semibold text-white'>
                          {feature.title}
                        </h3>
                        <p className='mt-2 text-white/80'>
                          {feature.description}
                        </p>
                      </Card>
                    </motion.div>
                  ))}
                </motion.div>

                {/* Solutions for Every Need Section */}
                <motion.section
                  variants={containerVariants}
                  className='mt-32 rounded-lg p-8'
                >
                  <motion.h2
                    variants={itemVariants}
                    className='text-3xl font-bold text-center mb-12 text-white'
                  >
                    <TextGenerateEffect words='Solutions for Every Need' />
                  </motion.h2>
                  <Tabs
                    defaultValue={useCases[0].title
                      .toLowerCase()
                      .replace(' ', '-')}
                    className='w-full'
                  >
                    <TabsList className='grid w-full grid-cols-3 bg-blue-500/20'>
                      {useCases.map((useCase) => (
                        <TabsTrigger
                          key={useCase.title}
                          value={useCase.title.toLowerCase().replace(' ', '-')}
                          className='data-[state=active]:bg-blue-500 data-[state=active]:text-white'
                        >
                          {useCase.title}
                        </TabsTrigger>
                      ))}
                    </TabsList>
                    {useCases.map((useCase) => (
                      <TabsContent
                        key={useCase.title}
                        value={useCase.title.toLowerCase().replace(' ', '-')}
                      >
                        <Card className='p-6 bg-white/10 backdrop-blur-sm shadow-lg border-blue-500/20'>
                          <ul className='space-y-4'>
                            {useCase.items.map((item, itemIndex) => (
                              <motion.li
                                key={itemIndex}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{
                                  duration: 0.3,
                                  delay: itemIndex * 0.1,
                                }}
                                className='flex items-center gap-3'
                              >
                                <Badge
                                  variant='outline'
                                  className='h-6 w-6 rounded-full bg-blue-500 text-white border-blue-500'
                                >
                                  {itemIndex + 1}
                                </Badge>
                                <span className='text-white/90'>{item}</span>
                              </motion.li>
                            ))}
                          </ul>
                        </Card>
                      </TabsContent>
                    ))}
                  </Tabs>
                </motion.section>

                {/* FAQ Section */}
                <motion.section
                  variants={containerVariants}
                  className='mt-32 mb-24 rounded-lg p-8 text-white/90'
                >
                  <motion.h2
                    variants={itemVariants}
                    className='text-3xl font-bold text-center mb-12 text-white bg-clip-text bg-gradient-to-r from-blue-500 to-blue-600'
                  >
                    <TextGenerateEffect words='Frequently Asked Questions' />
                  </motion.h2>
                  <Accordion type='single' collapsible className='w-full'>
                    {faqs.map((faq, index) => (
                      <AccordionItem key={index} value={`item-${index}`}>
                        <AccordionTrigger className='text-white'>
                          {faq.question}
                        </AccordionTrigger>
                        <AccordionContent className='text-white/80'>
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3 }}
                          >
                            {faq.answer}
                          </motion.div>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </motion.section>
              </motion.div>
            </div>
          </main>
          <Footer />
        </DarkBlueBackground>
      </motion.div>
    </AnimatePresence>
  );
}
