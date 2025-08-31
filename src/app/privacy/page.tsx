export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>

        <div className="space-y-6 text-gray-300">
          <section>
            <h2 className="text-xl font-semibold text-white mb-3">
              Information We Collect
            </h2>
            <p>
              We collect basic profile information and email address when you
              sign in with Google.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">
              How We Use Your Information
            </h2>
            <p>
              Your information is used solely to provide nutrition planning
              services and save your meal combinations.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">
              Data Security
            </h2>
            <p>
              We use Firebase Authentication and Firestore for secure data
              storage and processing.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">Contact</h2>
            <p>
              For privacy concerns, please contact us through the application.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
