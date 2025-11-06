import type React from "react"

const PrivacyPolicyPage: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-6 text-foreground">Privacy Policy</h1>
        <div className="text-foreground space-y-6">
          <p>
            Your privacy is important to us. It is TrendHive's policy to respect your privacy regarding any information
            we may collect from you across our website.
          </p>

          <h2 className="text-2xl font-semibold pt-4">1. Information We Collect</h2>
          <p>
            We only ask for personal information when we truly need it to provide a service to you. We collect it by
            fair and lawful means, with your knowledge and consent. We also let you know why we're collecting it and how
            it will be used.
          </p>

          <h2 className="text-2xl font-semibold pt-4">2. How We Use Your Information</h2>
          <p>
            We use the information we collect to process transactions, to provide you with the services you request, to
            communicate with you, and to personalize your shopping experience. We do not share your personally
            identifying information with third-parties, except where required by law.
          </p>

          <h2 className="text-2xl font-semibold pt-4">3. Security</h2>
          <p>
            We take precautions to protect your information. When you submit sensitive information via the website, your
            information is protected both online and offline.
          </p>

          <p className="pt-4">This policy is effective as of {new Date().toLocaleDateString()}.</p>
        </div>
      </div>
    </div>
  )
}

export default PrivacyPolicyPage
