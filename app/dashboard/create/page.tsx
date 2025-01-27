'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import Navbar from '@/app/components/Navbar';
import { DarkBlueBackground } from '@/app/components/dark-blue-background';

interface Message {
  type: 'bot' | 'user';
  content: string;
}

interface Answer {
  field: string;
  question: string;
  answer: string;
}

const questions = {
  "categories": [
    {
      "heading": "House Renting",
      "questions":[
        {
          "field": "lease_date",
          "question": "What is the date of this lease agreement? (Format: Day Month Year)"
        },
        {
          "field": "landlord_name",
          "question": "What is the name of the Landlord?"
        },
        {
          "field": "tenant_name",
          "question": "What is the name of the Tenant?"
        },
        {
          "field": "property_address",
          "question": "What is the address of the property being rented?"
        },
        {
          "field": "lease_term_start",
          "question": "What is the start date and time of the lease? (Format: Day Month Year, Time)"
        },
        {
          "field": "lease_term_end",
          "question": "What is the end date and time of the lease? (Format: Day Month Year, Time)"
        },
        {
          "field": "monthly_rent",
          "question": "What is the monthly rent for the property? (Currency: ₹)"
        },
        {
          "field": "rent_due_date",
          "question": "On what day of the month is the rent due?"
        },
        {
          "field": "rent_payment_location",
          "question": "Where should the rent be paid? (Address or payment method details)"
        },
        {
          "field": "allow_pets",
          "question": "Are pets allowed on the property? (yes/no)"
        },
        {
          "field": "guest_stay_limit",
          "question": "What is the maximum duration (in days) that a guest can stay without written permission?"
        },
        {
          "field": "tenant_contact_name",
          "question": "What is the Tenant's contact name for notices?"
        },
        {
          "field": "tenant_contact_phone",
          "question": "What is the Tenant's phone number?"
        },
        {
          "field": "tenant_contact_address",
          "question": "What is the Tenant's address for notices after the tenancy ends?"
        },
        {
          "field": "landlord_contact_name",
          "question": "What is the Landlord's contact name for notices?"
        },
        {
          "field": "landlord_contact_address",
          "question": "What is the Landlord's address for notices?"
        },
        {
          "field": "landlord_contact_phone",
          "question": "What is the Landlord's phone number?"
        },
        {
          "field": "key_replacement_fee",
          "question": "What is the cost of replacing locks or keys due to misplacement?"
        },
        {
          "field": "inspection_contact",
          "question": "If the property is unoccupied for 4 or more days, who will inspect the property? (Name and contact details)"
        },
        {
          "field": "agreement_signature_date",
          "question": "What is the date when this lease will be signed by both parties? (Format: Day Month Year)"
        }
      ]
    },
    {
      "heading": "Service Level Agreements",
      "questions": [
        {
          "field": "agreement_date",
          "question": "What is the date of this SLA? (Format: Day Month Year)"
        },
        {
          "field": "provider_name",
          "question": "What is the name of the Service Provider (company or individual)?"
        },
        {
          "field": "provider_address",
          "question": "What is the address of the Service Provider?"
        },
        {
          "field": "client_name",
          "question": "What is the name of the Client (company or individual)?"
        },
        {
          "field": "client_address",
          "question": "What is the address of the Client?"
        },
        {
          "field": "service_description",
          "question": "Briefly describe the services being provided (e.g., 'IT Support Services', 'Cloud Hosting Services')"
        },
        {
          "field": "start_date",
          "question": "What is the start date of the service? (Format: Day Month Year)"
        },
        {
          "field": "end_date",
          "question": "What is the end date of the service? (Format: Day Month Year)"
        },
        {
          "field": "service_1",
          "question": "Describe the first main service to be provided"
        },
        {
          "field": "service_2",
          "question": "Describe the second main service to be provided"
        },
        {
          "field": "service_3",
          "question": "Describe the third main service to be provided"
        },
        {
          "field": "uptime_guarantee",
          "question": "What is the uptime guarantee? (e.g., '99.9% availability per month')"
        },
        {
          "field": "response_time",
          "question": "What is the response time for critical issues?"
        },
        {
          "field": "resolution_time",
          "question": "What is the resolution time for critical issues?"
        },
        {
          "field": "service_fee",
          "question": "What is the service fee amount? (in ₹)"
        },
        {
          "field": "payment_frequency",
          "question": "How often should payments be made? (e.g., 'monthly', 'quarterly')"
        },
        {
          "field": "payment_due_date",
          "question": "On what day of the billing cycle is payment due?"
        },
        {
          "field": "late_fee",
          "question": "What is the late payment fee per day? (in ₹)"
        },
        {
          "field": "support_hours",
          "question": "What are the support hours? (e.g., '24/7 Support', '9 AM to 6 PM IST, Monday to Friday')"
        },
        {
          "field": "support_channels",
          "question": "What support channels are available? (e.g., 'Email, Phone, Chat')"
        },
        {
          "field": "penalty_rate",
          "question": "What is the penalty rate for not meeting performance metrics? (e.g., '10% credit of monthly fee per 1% downtime')"
        },
        {
          "field": "notice_period",
          "question": "What is the notice period required for termination? (e.g., '30 days')"
        },
        {
          "field": "governing_law",
          "question": "Which state/country's laws govern this agreement?"
        },
        {
          "field": "signature_date",
          "question": "What is the date when this agreement will be signed? (Format: Day Month Year)"
        }
      ]
    }
  ]
};

export default function CreateAgreement() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [currentCategory, setCurrentCategory] = useState<string | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(-1);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedAgreement, setGeneratedAgreement] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Start the conversation by asking for category
    if (messages.length === 0) {
      const categoryOptions = questions.categories.map(cat => cat.heading).join(' or ');
      setMessages([{
        type: 'bot',
        content: `What type of agreement would you like to create? (${categoryOptions})`
      }]);
    }
  }, []);

  const getCurrentQuestion = () => {
    if (!currentCategory) return null;
    const category = questions.categories.find(cat => cat.heading === currentCategory);
    if (!category || currentQuestionIndex < 0 || currentQuestionIndex >= category.questions.length) return null;
    return category.questions[currentQuestionIndex];
  };

  const handleAnswer = async (answer: string) => {
    // Add user's answer to messages
    setMessages(prev => [...prev, { type: 'user', content: answer }]);
    setInput('');

    if (!currentCategory) {
      // Handle category selection
      const category = questions.categories.find(
        cat => cat.heading.toLowerCase() === answer.toLowerCase()
      );
      if (category) {
        setCurrentCategory(category.heading);
        setCurrentQuestionIndex(0);
        setMessages(prev => [...prev, {
          type: 'bot',
          content: category.questions[0].question
        }]);
      } else {
        setMessages(prev => [...prev, {
          type: 'bot',
          content: `Please select a valid category: ${questions.categories.map(cat => cat.heading).join(' or ')}`
        }]);
      }
      return;
    }

    // Handle question answers
    const currentQuestion = getCurrentQuestion();
    if (currentQuestion && !isVerifying) {
      setAnswers(prev => [...prev, {
        field: currentQuestion.field,
        question: currentQuestion.question,
        answer: answer
      }]);

      const category = questions.categories.find(cat => cat.heading === currentCategory)!;
      if (currentQuestionIndex < category.questions.length - 1) {
        // Move to next question
        setCurrentQuestionIndex(prev => prev + 1);
        setMessages(prev => [...prev, {
          type: 'bot',
          content: category.questions[currentQuestionIndex + 1].question
        }]);
      } else {
        // All questions answered, show verification
        setIsVerifying(true);
        const verificationMessage = `Great! Here are your answers. Please verify them:\n\n${answers.map((a, i) => 
          `${i + 1}. ${a.question}\nAnswer: ${a.answer}\n`
        ).join('\n')}\n\nAre these correct? (yes/no)`;
        setMessages(prev => [...prev, { type: 'bot', content: verificationMessage }]);
      }
    } else if (isVerifying) {
      if (answer.toLowerCase() === 'yes') {
        // Generate agreement
        setIsVerifying(false); // Reset verification state
        setIsGenerating(true);
        setMessages(prev => [...prev, {
          type: 'bot',
          content: 'Generating your agreement...'
        }]);

        try {
          // Convert answers array to the required format
          const formattedAnswers = {
            ...answers.reduce((acc, curr) => {
              acc[curr.field] = curr.answer;
              return acc;
            }, {} as Record<string, string>),
            category: currentCategory
          };

          console.log('Making API call with answers:', formattedAnswers);

          const category = currentCategory;
          console.log('Selected category:', category);
          
          let apiRoute = '';
          switch (category?.toLowerCase()) {
            case 'house renting':
              apiRoute = '/api/generate/house_renting';
              console.log('Using house renting route');
              break;
            case 'service level agreements':
              apiRoute = '/api/generate/sla';
              console.log('Using SLA route');
              break;
            default:
              console.log('Invalid category:', category);
              throw new Error('Invalid category selected');
          }

          console.log('Making API call to:', apiRoute);

          const response = await fetch(apiRoute, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              answers: formattedAnswers
            }),
          });

          if (!response.ok) {
            console.error('API response not ok:', response.status);
            throw new Error('Failed to generate agreement');
          }

          const data = await response.json();
          console.log('API response:', data);
          setGeneratedAgreement(data.agreement); 
          setMessages(prev => [...prev, {
            type: 'bot',
            content: 'Your agreement has been generated! You can view it in the preview section.'
          }]);
        } catch (error) {
          console.error('Error generating agreement:', error);
          setMessages(prev => [...prev, {
            type: 'bot',
            content: 'Sorry, there was an error generating your agreement. Please try again.'
          }]);
        } finally {
          setIsGenerating(false);
        }
      } else if (answer.toLowerCase() === 'no') {
        // Reset to beginning of questions
        setCurrentQuestionIndex(0);
        setAnswers([]);
        setIsVerifying(false);
        setMessages(prev => [...prev, {
          type: 'bot',
          content: questions.categories.find(cat => cat.heading === currentCategory)!.questions[0].question
        }]);
      }
    }
  };

  const handleSaveAgreement = async () => {
    if (!generatedAgreement) return;
    
    setIsSaving(true);
    try {
      // Create timestamp in format YYYYMMDD_HHMMSS
      const now = new Date();
      const timestamp = now.toISOString()
        .replace(/[-:]/g, '')    // Remove dashes and colons
        .replace(/\..+/, '')     // Remove milliseconds
        .replace('T', '_');      // Replace T with underscore

      // Create a blob from the agreement text
      const blob = new Blob([generatedAgreement], { type: 'text/plain' });
      const file = new File([blob], `agreement_${timestamp}.txt`, { type: 'text/plain' });

      // Create form data
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', 'agreement'); // Specify this is an agreement

      // Upload the file
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to save agreement');
      }

      // Redirect to dashboard
      router.push('/dashboard');
    } catch (error) {
      console.error('Error saving agreement:', error);
      alert('Failed to save agreement. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    handleAnswer(input.trim());
  };

  return (
    <>
    <DarkBlueBackground className="min-h-screen">

    <div className="flex h-screen">
    <Navbar/>
      {/* Chat Section */}
      <div className="flex-1 flex flex-col p-4 border-r  mt-16">
        <div className="flex-1 overflow-y-auto mb-4 space-y-4">
          {messages.map((message, i) => (
            <div
              key={i}
              className={`p-3 rounded-lg ${
                message.type === 'bot'
                  ? 'bg-gray-100 mr-12'
                  : 'bg-blue-100 ml-12'
              }`}
            >
              <pre className="whitespace-pre-wrap font-sans">{message.content}</pre>
            </div>
          ))}
        </div>
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your answer..."
            className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isGenerating}
          />
          <button
            type="submit"
            disabled={!input.trim() || isGenerating}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            Send
          </button>
        </form>
      </div>

      {/* Preview Section */}
      <div className="flex-1 p-4 mt-16 flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Agreement Preview</h2>
          {generatedAgreement && (
            <button
              onClick={handleSaveAgreement}
              disabled={isSaving}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center gap-2"
            >
              {isSaving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                  Saving...
                </>
              ) : (
                'Save Agreement'
              )}
            </button>
          )}
        </div>
        {isGenerating ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : generatedAgreement ? (
          <div className="prose max-w-none flex-1 overflow-auto border rounded-lg p-4 bg-white shadow-inner">
            <pre className="whitespace-pre-wrap font-sans">{generatedAgreement}</pre>
          </div>
        ) : (
          <div className="text-gray-500 text-center mt-8">
            Answer all questions to generate your agreement
          </div>
        )}
      </div>
    </div>
    </DarkBlueBackground>
    </>

  );
}
