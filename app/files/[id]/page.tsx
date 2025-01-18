'use client';

import { useEffect, useState, useRef } from 'react';
import dynamic from 'next/dynamic';
import { editor } from 'monaco-editor';
import Navbar from '@/app/components/Navbar';

const MonacoEditor = dynamic(() => import('@monaco-editor/react'), {
  ssr: false
});

interface FileData {
  _id: string;
  name: string;
  content: string;
  type: string;
}

interface Comment {
  _id: string;
  fileId: string;
  commentKey: string;
  comment: string;
  lineNumber: number;
  createdAt: string;
  replies: Comment[];
  parentId?: string;
}

export default function FilePage({ params }: { params: { id: string } }) {
  const [file, setFile] = useState<FileData | null>(null);
  const [error, setError] = useState('');
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [currentLine, setCurrentLine] = useState<number | null>(null);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [highlightedLine, setHighlightedLine] = useState<number | null>(null);
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
  const decorationsRef = useRef<string[]>([]);

  const fetchComments = async () => {
    try {
      const response = await fetch(`/api/comments?fileId=${params.id}`);
      const data = await response.json();
      if (response.ok) {
        setComments(data);
      }
    } catch (err) {
      console.error('Failed to fetch comments:', err);
    }
  };

  useEffect(() => {
    const fetchFile = async () => {
      try {
        const response = await fetch(`/api/files/${params.id}`);
        const data = await response.json();
        
        if (response.ok) {
          setFile(data);
        } else {
          setError(data.error || 'Failed to fetch file');
        }
      } catch (err) {
        setError('Failed to fetch file');
      }
    };

    fetchFile();
    fetchComments();
  }, [params.id]);

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

  const renderComment = (comment: Comment, depth = 0) => (
    <div
      key={comment._id}
      className={`p-3 bg-gray-50 rounded ${depth > 0 ? 'ml-4 border-l-2 border-blue-200' : ''}`}
    >
      <div 
        className="cursor-pointer hover:bg-gray-100"
        onClick={() => highlightLine(comment.lineNumber)}
      >
        <div className="text-sm font-medium text-gray-600 mb-1">
          Line {comment.lineNumber}
        </div>
        <p className="text-gray-800">{comment.comment}</p>
        <div className="flex items-center justify-between mt-1">
          <div className="text-xs text-gray-500">
            {new Date(comment.createdAt).toLocaleString()}
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setReplyingTo(comment._id);
            }}
            className="text-xs text-blue-500 hover:text-blue-700"
          >
            Reply
          </button>
        </div>
      </div>

      {replyingTo === comment._id && (
        <div className="mt-2 pl-4">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Write your reply..."
            className="w-full p-2 border rounded mb-2 text-sm"
            rows={2}
          />
          <div className="flex gap-2">
            <button
              onClick={() => addComment(comment._id)}
              disabled={!newComment}
              className="bg-blue-500 text-white px-3 py-1 rounded text-sm disabled:opacity-50"
            >
              Reply
            </button>
            <button
              onClick={() => {
                setReplyingTo(null);
                setNewComment('');
              }}
              className="text-gray-500 hover:text-gray-700 text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {comment.replies?.length > 0 && (
        <div className="mt-2">
          {comment.replies.map(reply => renderComment(reply, depth + 1))}
        </div>
      )}
    </div>
  );

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="p-4 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      </div>
    );
  }

  if (!file) {
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
          <h1 className="text-2xl font-bold">{file.name}</h1>
          <p className="text-sm text-gray-500">Press Ctrl+K (Cmd+K on Mac) to quickly add a comment</p>
        </div>
        <div className="flex-grow border rounded-lg overflow-hidden h-[calc(100vh-150px)]">
          <MonacoEditor
            height="100%"
            defaultLanguage="text"
            theme="vs-dark"
            value={file.content || ''}
            options={{
              readOnly: true,
              minimap: { enabled: true },
              scrollBeyondLastLine: false,
              fontSize: 14,
              wordWrap: 'on',
              lineNumbers: 'on',
              glyphMargin: true,
              renderLineHighlight: 'all'
            }}
            onMount={handleEditorDidMount}
          />
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
    </div>
  </>
  );

}
