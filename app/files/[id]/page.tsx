'use client';

import { useEffect, useState, useRef } from 'react';
import dynamic from 'next/dynamic';
import { editor } from 'monaco-editor';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { sendEmailNotification } from '@/lib/utils/emailService';
import { saveNotification } from '@/lib/utils/notification';
import Navbar from '@/app/components/Navbar';

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

        // Notify collaborators
        const collaborators = file?.collaborators || [];
        await sendEmailNotification(collaborators, 'New Comment Added', `A new comment has been added: ${newComment}`);

        // Save notification in the database
        collaborators.forEach(async (email) => {
          await saveNotification(email, `A new comment has been added: ${newComment}`, `/files/${params.id}`);
        });
      }
    } catch (err) {
      console.error('Failed to add comment:', err);
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

        // Notify collaborators
        const collaborators = file?.collaborators || [];
        await sendEmailNotification(collaborators, 'Document Saved', 'The document has been saved.');

        // Save notification in the database
        collaborators.forEach(async (email) => {
          await saveNotification(email, 'The document has been saved.', `/files/${params.id}`);
        });
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

  const renderComment = (comment: Comment, depth = 0) => (
    <div
      key={comment._id}
      className={`p-3 bg-white border rounded-lg ${depth > 0 ? 'ml-4' : ''}`}
    >
      <div className="flex justify-between items-start mb-2">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-blue-600">{comment.email}</span>
            <span className="text-xs font-bold text-blue-700 bg-gray-100 border border-blue-300 px-2 py-0.5 rounded hover:bg-blue-200 transition-colors">Line {comment.lineNumber}</span>
            <span className="text-xs text-gray-500">
              {new Date(comment.createdAt).toLocaleString()}
            </span>
          </div>
          <p className="text-sm text-gray-600 mt-1">{comment.comment}</p>
        </div>
        <button
          onClick={() => {
            setReplyingTo(comment._id);
            setCurrentLine(comment.lineNumber);
            document.getElementById('commentInput')?.focus();
          }}
          className="text-xs text-blue-600 hover:text-blue-800"
        >
          Reply
        </button>
      </div>
      
      {comment.replies?.map(reply => renderComment(reply, depth + 1))}
      
      {replyingTo === comment._id && (
        <div className="mt-2 p-2 bg-gray-50 rounded">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Write your reply..."
            className="w-full p-2 border rounded text-sm"
            rows={2}
          />
          <div className="flex justify-end gap-2 mt-2">
            <button
              onClick={() => {
                setReplyingTo(null);
                setNewComment('');
              }}
              className="text-xs text-gray-600 hover:text-gray-800"
            >
              Cancel
            </button>
            <button
              onClick={() => addComment()}
              disabled={!newComment}
              className="text-xs bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 disabled:opacity-50"
            >
              Reply
            </button>
          </div>
        </div>
      )}
    </div>
  );

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
                  onClick={() => signIn()}
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
      <Navbar />
    <div className="min-h-screen flex p-4 gap-4">
      <div className="flex-grow flex flex-col">
        <div className="mb-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold">{file?.name}</h1>
              <p className="text-sm text-gray-500">Press Ctrl+K (Cmd+K on Mac) to quickly add a comment</p>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={analyzeFile}
                disabled={isAnalyzing}
                className={`px-4 py-2 rounded text-white transition-colors flex items-center gap-2 ${
                  isAnalyzing 
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-purple-600 hover:bg-purple-700'
                }`}
              >
                {isAnalyzing ? (
                  <>
                    <svg
                      className="animate-spin h-4 w-4"
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
                    Analyzing...
                  </>
                ) : (
                  <>
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                      />
                    </svg>
                    Analyze
                  </>
                )}
              </button>
              {!isOwner && (
                <button
                  onClick={refreshContent}
                  disabled={isRefreshing}
                  className={`px-4 py-2 rounded text-white transition-colors flex items-center gap-2 ${
                    isRefreshing 
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  <svg
                    className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  </svg>
                  {isRefreshing ? 'Refreshing...' : 'Refresh'}
                </button>
              )}
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Analysis Result</h2>
              <button
                onClick={() => setAnalysisResult(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <pre className="bg-gray-50 p-4 rounded whitespace-pre-wrap">
              {JSON.stringify(analysisResult, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
    </>

  );
}
