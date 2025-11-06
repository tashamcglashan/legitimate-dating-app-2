export default function HomePage() {
  return (
    <main className="min-h-screen p-8">
      <h1 className="text-3xl font-bold mb-4">LegitiMate</h1>
      <p className="text-gray-600 mb-6">
        Welcome! Verify to get started.
      </p>
      <a
        href="/verify-selfie"
        className="inline-block bg-pink-600 text-white px-6 py-3 rounded-xl"
      >
        Go to Verification
      </a>
    </main>
  );
}
