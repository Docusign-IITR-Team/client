'use client';

import { useEffect, useState, useRef } from 'react';
import dynamic from 'next/dynamic';
import { editor } from 'monaco-editor';
import Link from 'next/link';
import { signIn, useSession } from 'next-auth/react';
import Navbar from '@/app/components/Navbar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Download, FileText } from 'lucide-react';
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { DarkBlueBackground } from '@/app/components/dark-blue-background';
import Image from "next/image";

const MonacoEditor = dynamic(() => import('@monaco-editor/react'), {
  ssr: false
});
interface FileData {
  _id: string;
  name: string;
  content: string;
  type: string;
  owner: string;
  collaborators: string[];
  signatures: { [email: string]: boolean };
  updatedAt: string;
}

interface Comment {
  _id: string;
  lineNumber: number;
  comment: string;
  createdAt: string;
  email: string;
  replies?: Comment[];
}

export default function FilePage({ params }: { params: { id: string } }) {
  const [file, setFile] = useState<FileData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [currentLine, setCurrentLine] = useState<number | null>(null);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [highlightedLine, setHighlightedLine] = useState<number | null>(null);
  const [showCollaboratorInput, setShowCollaboratorInput] = useState(false);
  const [newCollaborator, setNewCollaborator] = useState('');
  const [isOwner, setIsOwner] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [currentContent, setCurrentContent] = useState<string>('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSignDialog, setShowSignDialog] = useState(false);
  const [isGeneratingWitness, setIsGeneratingWitness] = useState(false);
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
  const decorationsRef = useRef<string[]>([]);
  const { data: session, status } = useSession();

  useEffect(() => {
    const fetchFile = async () => {
      try {
        const response = await fetch(`/api/files/${params.id}`);
        
        if (!response.ok) {
          if (response.status === 401) {
            setError("Please sign in to view this file");
          } else if (response.status === 403) {
            setError("You don't have permission to view this file");
          } else {
            setError('Failed to fetch file');
          }
          return;
        }

        const data = await response.json();
        setFile(data.file);
        setIsOwner(session?.user?.email === data.file.owner);
      } catch (err) {
        console.error('Error fetching file:', err);
        setError('Failed to fetch file');
      }
    };

    if (status === 'authenticated') {
      fetchFile();
    } else if (status === 'unauthenticated') {
      setError('Please sign in to view this file');
    }
  }, [params.id, status, session?.user?.email]);

  useEffect(() => {
    if (file?.content) {
      setCurrentContent(file.content);
    }
  }, [file?.content]);

  useEffect(() => {
    if (typeof window !== 'undefined') {  
      const monaco = (window as any).monaco;
      if (monaco) {
        monaco.editor.defineTheme('customTheme', {
          base: 'vs',
          inherit: true,
          rules: [],
          colors: {
            'editor.foreground': '#000000',
            'editor.background': '#ffffff',
            'editor.lineHighlightBackground': '#f5f5f5',
            'editorLineNumber.foreground': '#666666',
            'editor.selectionBackground': '#e3e9ff',
            'editor.inactiveSelectionBackground': '#f0f0f0',
          }
        });
      }
    }
  }, []);

  useEffect(() => {
    if (editorRef.current && searchQuery) {
      const editor = editorRef.current;
      const decorations = editor.getModel()?.findMatches(
        searchQuery,
        false, // searchOnlyEditableRange
        true,  // isRegex
        true,  // matchCase
        null,  // wordSeparators
        true   // captureMatches
      ) || [];

      const newDecorations = decorations.map(d => ({
        range: d.range,
        options: {
          inlineClassName: 'search-highlight',
          overviewRuler: {
            color: '#ffd700',
            position: monaco.editor.OverviewRulerLane.Center
          }
        }
      }));

      decorationsRef.current = editor.deltaDecorations(decorationsRef.current, newDecorations);

      // If there are matches, scroll to the first one
      if (decorations.length > 0) {
        editor.revealLineInCenter(decorations[0].range.startLineNumber);
      }
    } else if (editorRef.current && !searchQuery) {
      // Clear decorations when search is empty
      const editor = editorRef.current;
      decorationsRef.current = editor.deltaDecorations(decorationsRef.current, []);
    }
  }, [searchQuery]);

  const fetchComments = async () => {
    try {
      const response = await fetch(`/api/comments?fileId=${params.id}`);
      if (!response.ok) {
        if (response.status === 401) {
          return; // Silently fail for comments if unauthorized
        }
        throw new Error('Failed to fetch comments');
      }
      const data = await response.json();
      setComments(data);
    } catch (err) {
      console.error('Failed to fetch comments:', err);
    }
  };

  useEffect(() => {
    if (status === 'authenticated') {
      fetchComments();
    }
  }, [params.id, status]);

  const handleEditorDidMount = (editor: editor.IStandaloneCodeEditor) => {
    editorRef.current = editor;
    
    editor.onDidChangeCursorPosition((e) => {
      setCurrentLine(e.position.lineNumber);
    });

    // Add keyboard shortcut for comment popup
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyK, () => {
      if (currentLine !== null) {
        const commentInput = document.getElementById('commentInput');
        if (commentInput) {
          commentInput.focus();
        }
      }
    });
  };

  const addComment = async (parentId?: string) => {
    if (!newComment || (!currentLine && !parentId)) return;

    try {
      const response = await fetch('/api/comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fileId: params.id,
          lineNumber: parentId ? undefined : currentLine,
          comment: newComment,
          email: session?.user?.email,
          ...(parentId ? { parentId } : {})
        }),
      });

      const data = await response.json();
      if (response.ok) {
        // Update comments state locally
        if (parentId) {
          setComments(prevComments => {
            return prevComments.map(comment => {
              if (comment._id === parentId) {
                return {
                  ...comment,
                  replies: [...(comment.replies || []), data.comment]
                };
              }
              return comment;
            });
          });
        } else {
          setComments(prevComments => [data.comment, ...prevComments]);
        }
        
        setNewComment('');
        setReplyingTo(null);
      }
    } catch (err) {
      console.error('Failed to add comment:', err);
    }
  };

  const scrollToLine = (lineNumber: number) => {
    if (editorRef.current) {
      // Clear previous decorations
      if (decorationsRef.current.length) {
        editorRef.current.deltaDecorations(decorationsRef.current, []);
      }

      // Add new decoration
      const newDecorations = editorRef.current.deltaDecorations([], [
        {
          range: new monaco.Range(lineNumber, 1, lineNumber, 1),
          options: {
            isWholeLine: true,
            className: 'highlight-line',
            glyphMarginClassName: 'highlight-line-glyph'
          }
        }
      ]);
      decorationsRef.current = newDecorations;

      // Scroll to the line
      editorRef.current.revealLineInCenter(lineNumber);

      // Remove highlight after 2 seconds
      setTimeout(() => {
        if (editorRef.current) {
          editorRef.current.deltaDecorations(decorationsRef.current, []);
          decorationsRef.current = [];
        }
      }, 2000);
    }
  };

  const highlightLine = (lineNumber: number) => {
    if (!editorRef.current) return;
    
    const editor = editorRef.current;
    const model = editor.getModel();
    if (!model) return;

    // Clear previous decorations
    editor.deltaDecorations(decorationsRef.current, []);

    // Add new decoration
    const decorations = editor.deltaDecorations([], [
      {
        range: new monaco.Range(lineNumber, 1, lineNumber, 1),
        options: {
          isWholeLine: true,
          className: 'highlighted-line',
          glyphMarginClassName: 'highlighted-glyph'
        }
      }
    ]);

    decorationsRef.current = decorations;
    setHighlightedLine(lineNumber);

    // Reveal the line
    editor.revealLineInCenter(lineNumber);
  };

  const handleAddCollaborator = async () => {
    if (!newCollaborator || !file) return;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newCollaborator)) {
      setError('Please enter a valid email address');
      return;
    }

    try {
      const response = await fetch(`/api/files/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          collaborators: [...(file.collaborators || []), newCollaborator],
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to add collaborator');
      }

      setFile(prev => prev ? {
        ...prev,
        collaborators: [...(prev.collaborators || []), newCollaborator],
      } : null);
      setNewCollaborator('');
      setShowCollaboratorInput(false);
    } catch (err) {
      console.error('Error adding collaborator:', err);
      setError('Failed to add collaborator');
    }
  };

  const handleRemoveCollaborator = async (email: string) => {
    if (!file) return;

    try {
      const response = await fetch(`/api/files/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          collaborators: file.collaborators.filter(c => c !== email),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to remove collaborator');
      }

      setFile(prev => prev ? {
        ...prev,
        collaborators: prev.collaborators.filter(c => c !== email),
      } : null);
    } catch (err) {
      console.error('Error removing collaborator:', err);
      setError('Failed to remove collaborator');
    }
  };

  const handleEditorChange = (value: string | undefined) => {
    if (!file || !isOwner) return;
    setCurrentContent(value || '');
    setHasChanges(value !== file.content);
  };

  const handleSaveChanges = async () => {
    if (!file || !isOwner || !hasChanges) return;
    
    setIsSaving(true);
    try {
      const response = await fetch(`/api/files/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: currentContent,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update file');
      }

      const data = await response.json();
      if (data.file) {
        setFile(data.file);
        setCurrentContent(data.file.content);
        setHasChanges(false);
      }
    } catch (err) {
      console.error('Error updating file:', err);
      setError('Failed to update file content');
    } finally {
      setIsSaving(false);
    }
  };

  const refreshContent = async () => {
    setIsRefreshing(true);
    try {
      const response = await fetch(`/api/files/${params.id}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch file');
      }

      const data = await response.json();
      setFile(data.file);
      setCurrentContent(data.file.content);
    } catch (err) {
      console.error('Error refreshing file:', err);
      setError('Failed to refresh file content');
    } finally {
      setIsRefreshing(false);
    }
  };

  const analyzeFile = async () => {
    setIsAnalyzing(true);
    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fileId: params.id,
          content: file?.content,
          filename: file?.name
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to analyze file');
      }

      const result = await response.json();
      setAnalysisResult(result);
    } catch (err) {
      console.error('Error analyzing file:', err);
      setError('Failed to analyze file');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getIntensityColor = (intensity: number) => {
    // Create a gradient from red (1) to green (5) with more vibrant colors
    // For owners, invert the intensity (1 becomes 5, 2 becomes 4, etc.)
    const invertedIntensity = isOwner ? (6 - intensity) : intensity;
    
    const colors = {
      1: 'bg-red-500/10 text-red-700 border-red-500/20 hover:bg-red-500/20',
      2: 'bg-orange-500/10 text-orange-700 border-orange-500/20 hover:bg-orange-500/20',
      3: 'bg-yellow-500/10 text-yellow-700 border-yellow-500/20 hover:bg-yellow-500/20',
      4: 'bg-lime-600/10 text-lime-700 border-lime-500/20 hover:bg-lime-500/20',
      5: 'bg-emerald-500/10 text-emerald-700 border-emerald-500/20 hover:bg-emerald-500/20'
    };

    // Add dot colors mapping
    const dotColors = {
      1: 'bg-red-500 shadow-red-500/30',
      2: 'bg-orange-500 shadow-orange-500/30',
      3: 'bg-yellow-500 shadow-yellow-500/30',
      4: 'bg-lime-500 shadow-lime-500/30',
      5: 'bg-emerald-500 shadow-emerald-500/30'
    };

    return {
      card: colors[invertedIntensity as keyof typeof colors] || colors[3],
      dot: dotColors[invertedIntensity as keyof typeof dotColors] || dotColors[3]
    };
  };

  const renderAnalysisResult = (result: any) => {
    if (!result) return null;

    // Filter out deadlines with invalid dates
  

    return (
      <div className="space-y-8">
        {/* Header Section */}
        <div className="border-b pb-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="flex-1">
              <div className="text-sm text-gray-500">Drafted By</div>
              <div className="font-medium">{result.draftedBy}</div>
            </div>
            <div className="w-px h-8 bg-gray-200"></div>
            <div className="flex-1">
              <div className="text-sm text-gray-500">Drafted For</div>
              <div className="font-medium">{result.draftedFor}</div>
            </div>
          </div>
          <p className="text-gray-600 text-sm leading-relaxed">{result.description}</p>
        </div>

        {/* Non-Negotiable Clauses */}
        <div>
          <h3 className="text-sm font-medium text-gray-900 uppercase tracking-wider mb-4">
            Non-Negotiable Clauses
          </h3>
          <div className="space-y-2">
            {result.nonNegotiableClauses.map((clause: string, index: number) => (
              <div 
                key={index} 
                className="flex items-start gap-3 p-3 bg-gray-500/5 hover:bg-gray-500/10 rounded-lg transition-colors"
              >
                <div className="flex-shrink-0 w-6 h-6 bg-gray-900/90 text-white rounded-full flex items-center justify-center text-sm">
                  {index + 1}
                </div>
                <p className="text-gray-700 text-sm leading-relaxed">{clause}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Deadlines */}
        <div>
          <h3 className="text-sm font-medium text-gray-900 uppercase tracking-wider mb-4">
            Key Deadlines
          </h3>
          <div className="space-y-3">
            {result.deadlines.map((deadline: any, index: number) => (
              <div 
                key={index}
                className="flex items-center gap-4 p-3 bg-blue-500/10 hover:bg-blue-500/15 rounded-lg transition-colors"
              >
                <div className="flex-shrink-0">
                  <div className="text-blue-700 font-medium">
                    {new Date(deadline.date).toLocaleDateString(undefined, {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </div>
                </div>
                <div className="w-px h-8 bg-blue-500/20"></div>
                <div className="flex-1">
                  <div className="text-blue-700 text-sm">{deadline.description}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Terms and Conditions */}
        <div>
          <h3 className="text-sm font-medium text-gray-900 uppercase tracking-wider mb-4">
            Terms and Conditions Analysis
          </h3>
          <div className="space-y-3">
            {result.termsAndConditions.map(([term, intensity]: [string, number], index: number) => (
              <div 
                key={index}
                className={`p-4 rounded-lg border transition-all duration-200 ${getIntensityColor(intensity).card}`}
              >
                <div className="flex items-center gap-3">
                  <div className="flex-1">
                    <p className="text-sm leading-relaxed">{term}</p>
                  </div>
                  <div className="flex-shrink-0">
                    <div className={`w-2.5 h-2.5 rounded-full shadow-sm ${getIntensityColor(intensity).dot}`}></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderComment = (comment: Comment, depth = 0) => (
    <div
      key={comment._id}
      className={`relative ${depth > 0 ? 'ml-8 mt-4' : 'mt-4'}`}
    >
      {/* Nesting line */}
      {depth > 0 && (
        <div 
          className="absolute left-[-24px] top-[-16px] bottom-0 w-px bg-gray-200"
          style={{
            content: '""',
          }}
        />
      )}
      
      {/* Comment card */}
      <div 
        onClick={() => scrollToLine(comment.lineNumber)}
        className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer group"
      >
        {/* Comment header */}
        <div className="flex items-center justify-between px-4 py-2 bg-gray-50 rounded-t-lg border-b group-hover:bg-blue-50/50">
          <div className="flex items-center gap-2">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                <span className="text-sm font-medium text-blue-700">
                  {comment.email[0].toUpperCase()}
                </span>
              </div>
            </div>
            <div>
              <div className="text-sm font-medium text-gray-900">{comment.email}</div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">
                  {new Date(comment.createdAt).toLocaleString()}
                </span>
                <span className="text-xs font-medium text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">
                  Line {comment.lineNumber}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Comment content */}
        <div className="px-4 py-3 group-hover:bg-blue-50/20">
          <p className="text-sm text-gray-700 whitespace-pre-wrap">{comment.comment}</p>
        </div>

        {/* Comment actions */}
        <div className="px-4 py-2 border-t bg-gray-50 rounded-b-lg group-hover:bg-blue-50/50">
          <button
            onClick={(e) => {
              e.stopPropagation(); // Prevent card click event
              setReplyingTo(comment._id);
              setCurrentLine(comment.lineNumber);
              document.getElementById('commentInput')?.focus();
            }}
            className="text-xs font-medium text-blue-600 hover:text-blue-800 flex items-center gap-1"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
            </svg>
            Reply
          </button>
        </div>
      </div>

      {/* Nested replies */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="space-y-4">
          {comment.replies.map(reply => renderComment(reply, depth + 1))}
        </div>
      )}

      {/* Reply input */}
      {replyingTo === comment._id && (
        <div className="mt-4 ml-8">
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Write your reply..."
              className="w-full p-3 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows={3}
            />
            <div className="flex justify-end gap-2 mt-3">
              <button
                onClick={(e) => {
                  e.stopPropagation(); // Prevent card click event
                  setReplyingTo(null);
                  setNewComment('');
                }}
                className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800 rounded-md hover:bg-gray-100 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation(); // Prevent card click event
                  addComment(comment._id);
                }}
                disabled={!newComment.trim()}
                className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Post Reply
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const downloadAsText = () => {
    const element = document.createElement("a");
    const file = new Blob([currentContent], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = `${file?.name || 'document'}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const downloadAsPDF = async () => {
    try {
      const response = await fetch('/api/generate-pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: currentContent,
          fileName: file?.name || 'document'
        }),
      });

      if (!response.ok) throw new Error('Failed to generate PDF');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const element = document.createElement("a");
      element.href = url;
      element.download = `${file?.name || 'document'}.pdf`;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error generating PDF:', error);
      // You can add toast notification here for error
    }
  };

  const handleSignDocument = async () => {
    try {
      const response = await fetch(`/api/files/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          signatures: {
            [session!.user!.email!]: true
          }
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to sign document');
      }

      const data = await response.json();
      const updatedFile = {
        ...file!,
        signatures: {
          ...file!.signatures,
          [session!.user!.email!]: true
        }
      };
      setFile(updatedFile);

      // Check if all signatures are collected
      const allSigners = [updatedFile.owner, ...updatedFile.collaborators];
      const allSigned = allSigners.every(email => updatedFile.signatures[email] === true);

      console.log('All signed:', allSigned);

      if (allSigned) {
        console.log('All members have signed, calling witness API');
        setIsGeneratingWitness(true);
        try {
          const witnessResponse = await fetch('/api/witness', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              fileId: params.id,
              fileName: updatedFile.name,
            }),
          });

          if (!witnessResponse.ok) {
            console.error('Failed to call witness API:', await witnessResponse.text());
          } else {
            const witnessData = await witnessResponse.json();
            console.log('Witness generated successfully:', witnessData);
          }
        } catch (error) {
          console.error('Error calling witness API:', error);
        } finally {
          setIsGeneratingWitness(false);
        }
      }

      setShowSignDialog(false);
    } catch (error) {
      console.error('Error signing document:', error);
    }
  };
  const [showSignatureModal, setShowSignatureModal] = useState(false)
  const publicKey = "0x1234...ABCD" // Replace with your actual public key

  const handleSign = async () => {
    setShowSignatureModal(true)
  }

  const handleConfirmSign = async () => {
    setShowSignatureModal(false)
    // Call your existing sign API here
    try {
      const response = await fetch("/api/sign", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ /* your existing payload */ }),
      })
      
      if (!response.ok) {
        throw new Error("Failed to sign")
      }
      
      // Handle successful signing
    } catch (error) {
      console.error("Error signing:", error)
    }
  }

  const getSignatureStatus = () => {
    if (!file?.signatures) return 'Not signed by anyone';
    const totalSigners = [file.owner, ...file.collaborators].length;
    const signedCount = Object.values(file.signatures).filter(Boolean).length;
    return `${signedCount}/${totalSigners} signed`;
  };

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full p-6 bg-white rounded-lg shadow-lg">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Access Denied</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <div className="space-y-4">
              {status === 'unauthenticated' && (
                <button
                  onClick={() => signIn('google')}
                  className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
                >
                  Sign In
                </button>
              )}
              <Link
                href="/"
                className="block w-full bg-gray-100 text-gray-700 px-4 py-2 rounded hover:bg-gray-200 transition-colors"
              >
                Go Back Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (status === 'loading' || !file) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <>
      <style jsx global>{`
        .highlight-line {
          background-color: #fff7d5;
          transition: background-color 0.3s ease;
        }
        .highlight-line-glyph {
          background-color: #ffd700;
        }
        .search-highlight {
          background-color: #ffeb3b80;
          border-radius: 2px;
        }
      `}</style>
      <DarkBlueBackground>
      <Navbar />
    <div className="min-h-screen flex p-4 gap-4 mt-16">
      <div className="flex-grow flex flex-col">
        <div className="mb-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-white">{file?.name}</h1>
              <p className="text-sm text-white">Created by : {file?.owner}</p>
            </div>
            <div className="flex items-center gap-4">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="flex items-center gap-2">
                    <Download className="h-4 w-4" />
                    Download
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={downloadAsText} className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Download as Text
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={downloadAsPDF} className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Download as PDF
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <div className="flex-grow relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search in file..."
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    ×
                  </button>
                )}
              </div>
              <button
                onClick={analyzeFile}
                disabled={isAnalyzing}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
              >
                {isAnalyzing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    Analyzing...
                  </>
                ) : (
                  'Analyze'
                )}
              </button>
              <button
                onClick={refreshContent}
                disabled={isRefreshing}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 flex items-center gap-2"
              >
                {isRefreshing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-700 border-t-transparent"></div>
                    Refreshing...
                  </>
                ) : (
                  'Refresh'
                )}
              </button>
              {isOwner && hasChanges && (
                <button
                  onClick={handleSaveChanges}
                  disabled={isSaving}
                  className={`px-4 py-2 rounded text-white transition-colors ${
                    isSaving 
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-green-600 hover:bg-green-700'
                  }`}
                >
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
              )}
              {isOwner && (
                <div className="relative">
                  <button
                    onClick={() => setShowCollaboratorInput(!showCollaboratorInput)}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
                  >
                    Share
                  </button>
                  {showCollaboratorInput && (
                    <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg p-4 z-10">
                      <div className="mb-4">
                        <h3 className="font-semibold mb-2">Collaborators</h3>
                        {file?.collaborators?.map((email) => (
                          <div key={email} className="flex justify-between items-center py-1">
                            <span className="text-sm">{email}</span>
                            <button
                              onClick={() => handleRemoveCollaborator(email)}
                              className="text-red-600 hover:text-red-800 text-sm"
                            >
                              Remove
                            </button>
                          </div>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <input
                          type="email"
                          value={newCollaborator}
                          onChange={(e) => setNewCollaborator(e.target.value)}
                          placeholder="Enter email"
                          className="flex-1 px-2 py-1 border rounded text-sm"
                        />
                        <button
                          onClick={handleAddCollaborator}
                          className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
                        >
                          Add
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
              <Button
                onClick={() => handleSign()}
                disabled={!session?.user?.email || hasChanges || (file?.signatures?.[session.user.email] ?? false)}
              >
                Sign Document
              </Button>
              <span className="text-sm text-muted-foreground">
                {getSignatureStatus()}
              </span>
            </div>
          </div>
        </div>
        <div className="flex-grow border rounded-lg overflow-hidden h-[calc(100vh-150px)] bg-white shadow-lg">
          {isOwner ? (
            <MonacoEditor
              height="100%"
              defaultLanguage="text"
              theme="customTheme"
              value={currentContent}
              options={{
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                fontSize: 15,
                fontFamily: "'SF Mono', Menlo, Monaco, 'Courier New', monospace",
                wordWrap: 'on',
                lineHeight: 1.6,
                padding: { top: 15, bottom: 15 },
                lineNumbers: 'on',
                renderLineHighlight: 'line',
                glyphMargin: false,
                folding: true,
                links: true,
                contextmenu: true,
                smoothScrolling: true,
                cursorBlinking: 'smooth',
                cursorSmoothCaretAnimation: true,
                roundedSelection: true,
                automaticLayout: true,
                guides: {
                  indentation: true,
                  bracketPairs: true
                },
                colorDecorators: true,
                "bracketPairColorization.enabled": true,
                renderWhitespace: 'boundary',
                scrollbar: {
                  vertical: 'visible',
                  horizontal: 'visible',
                  verticalScrollbarSize: 12,
                  horizontalScrollbarSize: 12,
                  useShadows: true
                }
              }}
              onChange={handleEditorChange}
              onMount={handleEditorDidMount}
            />
          ) : (
            <MonacoEditor
              height="100%"
              defaultLanguage="text"
              theme="customTheme"
              value={file?.content || ''}
              options={{
                readOnly: true,
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                fontSize: 15,
                fontFamily: "'SF Mono', Menlo, Monaco, 'Courier New', monospace",
                wordWrap: 'on',
                lineHeight: 1.6,
                padding: { top: 15, bottom: 15 },
                lineNumbers: 'on',
                renderLineHighlight: 'line',
                glyphMargin: false,
                folding: true,
                links: true,
                contextmenu: true,
                smoothScrolling: true,
                cursorBlinking: 'smooth',
                cursorSmoothCaretAnimation: true,
                roundedSelection: true,
                automaticLayout: true,
                guides: {
                  indentation: true,
                  bracketPairs: true
                },
                colorDecorators: true,
                "bracketPairColorization.enabled": true,
                renderWhitespace: 'boundary',
                scrollbar: {
                  vertical: 'visible',
                  horizontal: 'visible',
                  verticalScrollbarSize: 12,
                  horizontalScrollbarSize: 12,
                  useShadows: true
                }
              }}
              onMount={handleEditorDidMount}
            />
          )}
          {file?.signatures && Object.keys(file.signatures).length > 0 && (
            <div className="mt-8 border-t border-gray-200 pt-8">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold">Document Signatures</h3>
                <p className="text-sm text-gray-500">
                  {Object.keys(file.signatures).length} {Object.keys(file.signatures).length === 1 ? 'Signature' : 'Signatures'}
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {Object.entries(file.signatures).map(([email, signature]) => (
                  <div key={email} className="p-6 bg-gray-900/20 rounded-lg border border-gray-800">
                    <div className="flex flex-col space-y-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-sm font-medium text-gray-200">{email}</p>
                          <p className="text-xs text-gray-400 mt-1">
                            Signed on {new Date(signature.timestamp).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <div className="relative w-full h-[100px] bg-black/20 rounded-lg overflow-hidden">
                        <Image
                          src="/signature.png"
                          alt={`Signature of ${email}`}
                          fill
                          style={{ objectFit: 'contain' }}
                          className="p-2"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="w-96 flex flex-col">
        <div className="bg-white rounded-lg shadow p-4 mb-4">
          <h2 className="text-lg font-semibold mb-2">Add Comment</h2>
          {currentLine ? (
            <>
              <div className="mb-2 p-2 bg-blue-50 rounded text-sm">
                <strong className="text-blue-700">Line {currentLine}</strong>
              </div>
              <textarea
                id="commentInput"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Write your comment..."
                className="w-full p-2 border rounded mb-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                rows={3}
              />
              <button
                onClick={() => addComment()}
                disabled={!newComment}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded disabled:opacity-50 transition-colors"
              >
                Add Comment
              </button>
            </>
          ) : (
            <p className="text-gray-500 text-sm">Place your cursor on a line to add a comment</p>
          )}
        </div>

        <div className="bg-white rounded-lg shadow p-4 flex-grow overflow-y-auto">
          <h2 className="text-lg font-semibold mb-2">Comments</h2>
          {comments.length === 0 ? (
            <p className="text-gray-500 text-sm">No comments yet</p>
          ) : (
            <div className="space-y-4">
              {comments.map(comment => renderComment(comment))}
            </div>
          )}
        </div>
      </div>
      {analysisResult && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm overflow-hidden">
          <div className="bg-white rounded-xl w-full max-w-3xl flex flex-col max-h-[85vh]">
            <div className="flex-shrink-0 sticky top-0 bg-white px-6 py-4 border-b z-10 flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-900">Document Analysis</h2>
              <button
                onClick={() => setAnalysisResult(null)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 min-h-0">
              {renderAnalysisResult(analysisResult)}
            </div>
          </div>
        </div>
      )}
      <Dialog open={showSignDialog} onOpenChange={setShowSignDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Sign Document</DialogTitle>
            <DialogDescription>
              Are you sure you want to sign this document? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowSignDialog(false)}
              disabled={isGeneratingWitness}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={() => {
                handleConfirmSign();
                handleSignDocument();
              }}
              disabled={isGeneratingWitness}
            >
              {isGeneratingWitness ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Generating Witness...
                </>
              ) : (
                'Sign'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={showSignatureModal} onOpenChange={setShowSignatureModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Confirm Your Signature</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center space-y-4">
            <div className="relative w-[300px] h-[100px]">
              <Image
                src="/signature.png"
                alt="Your signature"
                fill
                style={{ objectFit: 'contain' }}
                className="border rounded-lg"
              />
            </div>
            <p className="text-sm text-gray-500">
              Public Key: {publicKey}
            </p>
          </div>
          <DialogFooter className="sm:justify-start">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setShowSignatureModal(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleSignDocument}
            >
              Confirm & Sign
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
    </DarkBlueBackground>
    </>
  );
}
