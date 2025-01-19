import { useState } from 'react';
import { Send, AlertCircle } from 'lucide-react';
import Link from 'next/link';

interface Message {
  type: 'user' | 'bot';
  content: string;
  metadata?: {
    source?: string;
    fileId?: string;
    [key: string]: any;
  };
}

interface AnalysisResponse {
  analysisText?: string;
  metadata?: {
    source?: string;
    [key: string]: any;
  };
}

export default function ClauseAnalyzerBot() {
  const [messages, setMessages] = useState<Message[]>([{
    type: 'bot',
    content: 'Hello! I can help you analyze new clauses and check for conflicts with your existing agreements. What clause would you like to analyze?'
  }]);
  const [input, setInput] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const getFileId = async (filename: string) => {
    try {
      const response = await fetch('/api/get-file-id', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ filename }),
      });

      if (!response.ok) {
        console.error('Failed to get file ID');
        return null;
      }

      const data = await response.json();
      return data.fileId;
    } catch (error) {
      console.error('Error getting file ID:', error);
      return null;
    }
  };

  const analyzeClause = async (clause: string) => {
    try {
      const response = await fetch('/api/analyze-clause', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ clause }),
      });

      if (!response.ok) {
        throw new Error('Failed to analyze clause');
      }

      const data = await response.json();
      console.log("DATA", data);
      
      if (!data.analysisText) {
        return {
          content: 'No relevant analysis found. Please try a different clause.',
          metadata: null
        };
      }

      // Get file ID if source exists
      let fileId = null;
      if (data.metadata?.source) {
        fileId = await getFileId(data.metadata.source);
      }

      return {
        content: data.analysisText,
        metadata: {
          ...data.metadata,
          fileId
        }
      };
    } catch (error) {
      console.error('Error analyzing clause:', error);
      throw error;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isAnalyzing) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { type: 'user', content: userMessage }]);
    setIsAnalyzing(true);

    try {
      const analysis = await analyzeClause(userMessage);
      setMessages(prev => [...prev, {
        type: 'bot',
        content: analysis.content,
        metadata: analysis.metadata
      }]);
    } catch (error) {
      console.error('Error analyzing clause:', error);
      setMessages(prev => [...prev, {
        type: 'bot',
        content: 'Sorry, I encountered an error while analyzing the clause. Please try again.'
      }]);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="flex flex-col h-[800px] border rounded-lg bg-background shadow-sm">
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold">Clause Analyzer</h2>
        <p className="text-sm text-muted-foreground">
          Ask me to analyze new clauses for potential conflicts
        </p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className="max-w-[80%]">
              <div
                className={`rounded-lg px-4 py-2 ${
                  message.type === 'user'
                    ? 'bg-blue-500 text-white'
                    : 'bg-muted'
                }`}
              >
                {message.content}
              </div>
              {message.type === 'bot' && message.metadata?.source && (
                <div className="mt-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4" />
                    <span>
                      Found in: {message.metadata.fileId ? (
                        <Link 
                          href={`/files/${message.metadata.fileId}`}
                          className="font-medium text-blue-500 hover:text-blue-600"
                        >
                          {message.metadata.source}
                        </Link>
                      ) : (
                        <span className="font-medium">{message.metadata.source}</span>
                      )}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
        {isAnalyzing && (
          <div className="flex justify-start">
            <div className="bg-muted rounded-lg px-4 py-2 flex items-center space-x-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-4 border-t">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your clause here..."
            className="flex-1 px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isAnalyzing}
          />
          <button
            type="submit"
            disabled={isAnalyzing || !input.trim()}
            className="p-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="h-5 w-5" />
          </button>
        </div>
      </form>
    </div>
  );
}
