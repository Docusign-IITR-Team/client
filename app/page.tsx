'use client';

import { signIn, useSession } from 'next-auth/react';
import Link from 'next/link';
import Navbar from './components/Navbar';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { BrainCircuit, FileText, Users, Bot, Lock, Zap } from 'lucide-react';
import { BackgroundBeams } from '@/components/ui/background-beams';
import { SparklesCore } from '@/components/ui/sparkles';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TypewriterEffect } from '@/components/ui/typewriter-effect';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const features = [
  {
    icon: <BrainCircuit className="h-6 w-6" />,
    title: 'AI-Powered Analysis',
    description: 'Advanced document analysis providing insights on terms, conditions, and potential risks.',
    color: 'text-blue-500'
  },
  {
    icon: <FileText className="h-6 w-6" />,
    title: 'Smart Agreement Creation',
    description: 'Create legal agreements through an intuitive chat interface with AI guidance.',
    color: 'text-blue-400'
  },
  {
    icon: <Users className="h-6 w-6" />,
    title: 'Real-time Collaboration',
    description: 'Work together with team members, add comments, and track changes in real-time.',
    color: 'text-blue-500'
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
      'Secure client document sharing'
    ]
  },
  {
    title: 'Business Owners',
    items: [
      'Create and manage rental agreements',
      'Generate employment contracts',
      'Handle vendor agreements',
      'Maintain legal document compliance',
      'Collaborate with legal teams'
    ]
  },
  {
    title: 'Real Estate',
    items: [
      'Streamlined lease agreement creation',
      'Property management documentation',
      'Tenant screening forms',
      'Maintenance contracts',
      'Real estate purchase agreements'
    ]
  }
];

const faqs = [
  {
    question: 'How does the AI-powered analysis work?',
    answer: 'Our AI system uses advanced natural language processing to analyze legal documents, identifying key terms, potential risks, and suggesting improvements. It provides a comprehensive breakdown of important clauses, deadlines, and obligations while highlighting any areas that may need attention.'
  },
  {
    question: 'Is my data secure?',
    answer: 'Yes, we take security seriously. All documents are encrypted both in transit and at rest. We use enterprise-grade security measures, regular security audits, and comply with industry standards to ensure your data remains private and secure.'
  },
  {
    question: 'Can I customize the generated agreements?',
    answer: 'Absolutely! While our AI helps generate initial drafts, you have full control to modify and customize any part of the agreement. Our chat interface makes it easy to specify your requirements and make changes as needed.'
  }
];

const words = [
  {
    text: "Create",
    className: "text-blue-500 dark:text-blue-400",
  },
  { text: "and" },
  { text: "manage" },
  {
    text: "legal documents",
    className: "text-blue-500 dark:text-blue-400",
  },
  { text: "with" },
  {
    text: "AI",
    className: "text-blue-500 dark:text-blue-400",
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
    <div className="min-h-screen bg-gradient-to-b from-background via-blue-900/10 to-background">
      <Navbar />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
      
      <main className="relative">
        <div className="absolute inset-0 h-screen w-full">
          <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/5 via-background to-background pointer-events-none" />
          <SparklesCore
            background="transparent"
            minSize={0.4}
            maxSize={1}
            particleDensity={100}
            className="w-full h-full"
            particleColor="#3b82f6"
          />
        </div>

        <div className="relative z-10 pt-40">
          {/* Hero Section */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="container mx-auto px-4"
          >
            <motion.div variants={itemVariants} className="text-center space-y-8">
              <div className="h-[8rem] flex items-center justify-center">
                <TypewriterEffect words={words} />
              </div>
              <motion.p
                variants={itemVariants}
                className="mx-auto max-w-[700px] text-muted-foreground text-lg"
              >
                Create, manage, and share legal documents effortlessly. Powered by
                AI for accuracy and efficiency.
              </motion.p>
              <motion.div variants={itemVariants} className="flex justify-center gap-4">
                <Button size="lg" className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700">
                  Get Started
                </Button>
                <Button size="lg" variant="outline">
                  Learn More
                </Button>
              </motion.div>
            </motion.div>

            {/* Features Grid */}
            <motion.div
              variants={containerVariants}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-24"
            >
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  className="relative group"
                >
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg blur opacity-30 group-hover:opacity-100 transition duration-1000 group-hover:duration-200" />
                  <Card className="relative p-6 bg-background/80 backdrop-blur-sm">
                    <div className={cn("w-12 h-12 rounded-lg flex items-center justify-center", feature.color)}>
                      {feature.icon}
                    </div>
                    <h3 className="mt-4 text-lg font-semibold">{feature.title}</h3>
                    <p className="mt-2 text-muted-foreground">{feature.description}</p>
                  </Card>
                </motion.div>
              ))}
            </motion.div>

            {/* Use Cases Section */}
            <motion.section
              variants={containerVariants}
              className="mt-32 bg-background/80 backdrop-blur-sm rounded-lg p-8"
            >
              <motion.h2 
                variants={itemVariants}
                className="text-3xl font-bold text-center mb-12 text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-blue-600"
              >
                Solutions for Every Need
              </motion.h2>
              <Tabs defaultValue={useCases[0].title.toLowerCase().replace(' ', '-')} className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  {useCases.map((useCase) => (
                    <TabsTrigger 
                      key={useCase.title} 
                      value={useCase.title.toLowerCase().replace(' ', '-')}
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
                    <Card className="p-6">
                      <ul className="space-y-4">
                        {useCase.items.map((item, itemIndex) => (
                          <motion.li
                            key={itemIndex}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.3, delay: itemIndex * 0.1 }}
                            className="flex items-center gap-3"
                          >
                            <Badge variant="outline" className="h-6 w-6 rounded-full">
                              {itemIndex + 1}
                            </Badge>
                            <span className="text-muted-foreground">{item}</span>
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
              className="mt-32 mb-24 bg-background/80 backdrop-blur-sm rounded-lg p-8"
            >
              <motion.h2 
                variants={itemVariants}
                className="text-3xl font-bold text-center mb-12 text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-blue-600"
              >
                Frequently Asked Questions
              </motion.h2>
              <Accordion type="single" collapsible className="w-full">
                {faqs.map((faq, index) => (
                  <AccordionItem key={index} value={`item-${index}`}>
                    <AccordionTrigger>{faq.question}</AccordionTrigger>
                    <AccordionContent className="text-muted-foreground">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </motion.section>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
