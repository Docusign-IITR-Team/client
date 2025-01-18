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
      "questions": [
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
      "heading": "Loan",
      "questions": [
        {
          "field": "loan_purpose",
          "question": "Are you lending or borrowing money?"
        },
        {
          "field": "loan_reason",
          "question": "What is this loan for? (Business, Debts or Bills, Real Estate, Vehicle, Other)"
        },
        {
          "field": "borrower_location",
          "question": "In which state or union territory do you live?"
        },
        {
          "field": "loan_amount",
          "question": "How much are you lending?"
        },
        {
          "field": "charge_interest",
          "question": "Will you charge interest on the loan?"
        },
        {
          "field": "loan_date",
          "question": "When will you lend the money? (Loan date)"
        },
        {
          "field": "repayment_method",
          "question": "How will the borrower repay the loan? (Regular Payments, A single payment, Other)"
        },
        {
          "field": "payment_frequency",
          "question": "How often will the borrower make payments? (Monthly, Weekly, Yearly)"
        },
        {
          "field": "first_payment_date",
          "question": "When will the borrower make the first payment?"
        },
        {
          "field": "schedule_determination",
          "question": "How do you want to determine the payment schedule? (Specify final payment date, By number of payments)"
        },
        {
          "field": "early_repayment",
          "question": "Can the borrower make lump sum payments or repay the loan early?"
        },
        {
          "field": "overdue_penalty",
          "question": "Will you charge a penalty for overdue payments?"
        },
        {
          "field": "penalty_type",
          "question": "What is the penalty? (Late fee, Interest rate increase)"
        },
        {
          "field": "late_fee_amount",
          "question": "How much is the late fee?"
        },
        {
          "field": "grace_period",
          "question": "Grace Period before late fee is charged? (Days)"
        },
        {
          "field": "lender_type",
          "question": "Who is the lender? (Individual, Company/Organization)"
        },
        {
          "field": "lender_details",
          "question": "Provide the full name or company name and address of the lender."
        },
        {
          "field": "borrower_type",
          "question": "Who is the borrower? (Individual, Company/Organization)"
        },
        {
          "field": "borrower_details",
          "question": "Provide the full name or company name and address of the borrower."
        },
        {
          "field": "cosigner",
          "question": "Is anyone co-signing this loan? (Yes/No)"
        },
        {
          "field": "cosigner_details",
          "question": "Who is co-signing the loan? (Individual or Company/Organization)"
        },
        {
          "field": "collateral",
          "question": "Will the borrower back the loan with an asset or personal property?"
        },
        {
          "field": "collateral_details",
          "question": "What is being used to secure the loan?"
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
    if (currentQuestion) {
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
        setIsGenerating(true);
        setMessages(prev => [...prev, {
          type: 'bot',
          content: 'Generating your agreement...'
        }]);

        try {
          const response = await fetch('/api/generate-agreement', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              category: currentCategory,
              answers: answers
            }),
          });

          if (!response.ok) throw new Error('Failed to generate agreement');

          const data = await response.json();
          setGeneratedAgreement(data.agreement);
          setMessages(prev => [...prev, {
            type: 'bot',
            content: 'Your agreement has been generated! You can view it in the preview section.'
          }]);
        } catch (error) {
          setMessages(prev => [...prev, {
            type: 'bot',
            content: 'Sorry, there was an error generating your agreement. Please try again.'
          }]);
        } finally {
          setIsGenerating(false);
        }
      } else {
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    handleAnswer(input.trim());
  };

  return (
    <>
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
      <div className="flex-1 p-4 mt-16">
        <h2 className="text-xl font-bold mb-4">Agreement Preview</h2>
        {isGenerating ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : generatedAgreement ? (
          <div className="prose max-w-none">
            <pre className="whitespace-pre-wrap font-sans">{generatedAgreement}</pre>
          </div>
        ) : (
          <div className="text-gray-500 text-center mt-8">
            Answer all questions to generate your agreement
          </div>
        )}
      </div>
    </div>
    </>

  );
}
