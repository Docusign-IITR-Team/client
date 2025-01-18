'use client';

import { useEffect, useState, useRef } from 'react';
import dynamic from 'next/dynamic';
import { editor } from 'monaco-editor';

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
}

export default function FilePage({ params }: { params: { id: string } }) {
  const [file, setFile] = useState<FileData | null>(null);
  const [error, setError] = useState('');
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [currentLine, setCurrentLine] = useState<number | null>(null);
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);

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

  const addComment = async () => {
    if (currentLine === null || !newComment) return;

    try {
      const response = await fetch('/api/comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fileId: params.id,
          lineNumber: currentLine,
          comment: newComment
        }),
      });

      if (response.ok) {
        setNewComment('');
        fetchComments();
      }
    } catch (err) {
      console.error('Failed to add comment:', err);
    }
  };

  const highlightComment = (comment: Comment) => {
    if (!editorRef.current) return;
    
    const model = editorRef.current.getModel();
    if (!model) return;

    // Get the line content
    const lineContent = model.getLineContent(comment.lineNumber);
    
    // Create selection for the whole line
    const range = {
      startLineNumber: comment.lineNumber,
      startColumn: 1,
      endLineNumber: comment.lineNumber,
      endColumn: lineContent.length + 1
    };

    // Reveal and select the range
    editorRef.current.revealRangeInCenter(range);
    editorRef.current.setPosition({ lineNumber: comment.lineNumber, column: 1 });
  };

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
              renderLineHighlight: 'all'
            }}
            onMount={handleEditorDidMount}
          />
        </div>
      </div>

      <div className="w-80 flex flex-col">
        <div className="bg-white rounded-lg shadow p-4 mb-4">
          <h2 className="text-lg font-semibold mb-2">Add Comment</h2>
          {currentLine ? (
            <>
              <div className="mb-2 p-2 bg-gray-100 rounded text-sm">
                <strong>Line {currentLine}</strong>
              </div>
              <textarea
                id="commentInput"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Write your comment..."
                className="w-full p-2 border rounded mb-2"
                rows={3}
              />
              <button
                onClick={addComment}
                disabled={!newComment}
                className="w-full bg-blue-500 text-white py-2 px-4 rounded disabled:opacity-50"
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
              {comments.map((comment) => (
                <div
                  key={comment._id}
                  className="p-3 bg-gray-50 rounded cursor-pointer hover:bg-gray-100"
                  onClick={() => highlightComment(comment)}
                >
                  <div className="text-sm font-medium text-gray-600 mb-1">
                    Line {comment.lineNumber}
                  </div>
                  <p className="text-gray-800">{comment.comment}</p>
                  <div className="text-xs text-gray-500 mt-1">
                    {new Date(comment.createdAt).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
