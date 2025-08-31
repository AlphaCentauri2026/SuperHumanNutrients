export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Terms of Service</h1>

        <div className="space-y-6 text-gray-300">
          <section>
            <h2 className="text-xl font-semibold text-white mb-3">
              Acceptance of Terms
            </h2>
            <p>
              By using this application, you agree to these terms of service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">
              Service Description
            </h2>
            <p>
              This application provides nutrition planning and meal combination
              services.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">
              User Responsibilities
            </h2>
            <p>
              You are responsible for the accuracy of information you provide
              and for using the service appropriately.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">
              Limitation of Liability
            </h2>
            <p>
              This service is provided as-is without warranties. We are not
              liable for any damages arising from use.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">
              Changes to Terms
            </h2>
            <p>We reserve the right to modify these terms at any time.</p>
          </section>
        </div>
      </div>
    </div>
  );
}
