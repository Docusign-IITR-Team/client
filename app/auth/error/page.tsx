import { useSearchParams } from 'next/navigation'
 
export default function ErrorPage() {
  return (
    <div className="flex h-screen items-center justify-center">
      <div className="rounded-lg bg-white p-8 shadow-md">
        <h1 className="mb-4 text-2xl font-bold text-red-600">Authentication Error</h1>
        <p className="text-gray-600">
          An error occurred during authentication. Please try again or contact support if the problem persists.
        </p>
      </div>
    </div>
  )
}
