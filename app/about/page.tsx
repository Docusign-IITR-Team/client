'use client';

import { motion } from 'framer-motion';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BrainCircuit, FileText, Users, Bot, Lock, Zap } from 'lucide-react';
import Navbar from '../components/Navbar';
import { BackgroundBeams } from '@/components/ui/background-beams';
import { SparklesCore } from '@/components/ui/sparkles';

const features = [
  {
    icon: <BrainCircuit className="h-6 w-6" />,
    title: 'AI-Powered Analysis',
    description: 'Advanced document analysis providing insights on terms, conditions, and potential risks.',
    color: 'text-purple-500'
  },
  {
    icon: <FileText className="h-6 w-6" />,
    title: 'Smart Agreement Creation',
    description: 'Create legal agreements through an intuitive chat interface with AI guidance.',
    color: 'text-blue-500'
  },
  {
    icon: <Users className="h-6 w-6" />,
    title: 'Real-time Collaboration',
    description: 'Work together with team members, add comments, and track changes in real-time.',
    color: 'text-green-500'
  },
  {
    icon: <Bot className="h-6 w-6" />,
    title: 'Intelligent Suggestions',
    description: 'Get smart recommendations for improving your legal documents.',
    color: 'text-yellow-500'
  },
  {
    icon: <Lock className="h-6 w-6" />,
    title: 'Secure Document Management',
    description: 'Enterprise-grade security for all your sensitive legal documents.',
    color: 'text-red-500'
  },
  {
    icon: <Zap className="h-6 w-6" />,
    title: 'Instant Document Generation',
    description: 'Generate professional agreements in seconds with customizable templates.',
    color: 'text-orange-500'
  }
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
  },
  {
    question: 'How does the collaboration feature work?',
    answer: 'Multiple team members can work on documents simultaneously. You can add comments, suggest changes, and track revisions in real-time. Our notification system keeps everyone updated on changes and mentions.'
  },
  {
    question: 'What types of agreements can I create?',
    answer: 'Our platform supports various agreement types including rental agreements, employment contracts, NDAs, service agreements, and more. The AI-powered system can adapt to different legal document requirements and jurisdictions.'
  }
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <BackgroundBeams />

      {/* Hero Section */}
      <div className="relative pt-20">
        <div className="absolute inset-0 h-96">
          <SparklesCore
            id="tsparticlesfullpage"
            background="transparent"
            minSize={0.6}
            maxSize={1.4}
            particleDensity={100}
            className="w-full h-full"
            particleColor="#FFFFFF"
          />
        </div>
        <div className="relative container mx-auto px-4 py-32 text-center">
          <motion.h1 
            className="text-4xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-blue-600 mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            Revolutionizing Legal Document Management
          </motion.h1>
          <motion.p 
            className="text-xl text-gray-600 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            Harness the power of AI to create, analyze, and manage legal documents with unprecedented efficiency and accuracy.
          </motion.p>
        </div>
      </div>

      {/* Features Grid */}
      <div className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">Key Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card className="p-6 hover:shadow-lg transition-shadow">
                <div className={`${feature.color} mb-4`}>{feature.icon}</div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Use Cases */}
      <div className="bg-gray-50 dark:bg-gray-900/50 py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Use Cases</h2>
          <Tabs defaultValue={useCases[0].title} className="w-full">
            <TabsList className="w-full justify-center mb-8">
              {useCases.map((useCase, index) => (
                <TabsTrigger key={index} value={useCase.title}>
                  {useCase.title}
                </TabsTrigger>
              ))}
            </TabsList>
            {useCases.map((useCase, index) => (
              <TabsContent key={index} value={useCase.title}>
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
                        <span>{item}</span>
                      </motion.li>
                    ))}
                  </ul>
                </Card>
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">Frequently Asked Questions</h2>
        <div className="max-w-3xl mx-auto">
          <Accordion type="single" collapsible>
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger className="text-left">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent>
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </div>
  );
}
