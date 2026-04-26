import { Check, Star, Shield, Zap, Crown, HelpCircle } from 'lucide-react';

export default function Pricing() {
  const plans = [
    {
      name: 'Basic',
      price: '₦1,500',
      period: '/month',
      popular: false,
      features: [
        'Listed on platform',
        'Receive booking requests',
        'Basic profile page',
        'Standard map pin'
      ]
    },
    {
      name: 'Pro',
      price: '₦3,500',
      period: '/month',
      popular: true,
      features: [
        'Everything in Basic',
        'Featured in search results',
        'Verified badge (after KYC)',
        'Profile boost',
        'Priority support'
      ]
    },
    {
      name: 'Premium',
      price: '₦7,000',
      period: '/month',
      popular: false,
      features: [
        'Everything in Pro',
        'Top of search results always',
        'Highlighted map pin',
        '"Top Worker" badge',
        'Dedicated account manager'
      ]
    }
  ];

  const faqs = [
    {
      question: 'When will payments go live?',
      answer: 'We are launching payments in May 2026.'
    },
    {
      question: 'Can I cancel anytime?',
      answer: 'Yes, no long-term contracts.'
    },
    {
      question: 'Is the first month free?',
      answer: 'Yes, all workers get 30 days free.'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <section className="bg-gradient-to-br from-primary-600 to-primary-800 text-white py-16 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-[clamp(2rem,5vw,3.5rem)] font-bold mb-4">
            Simple, Transparent Pricing
          </h1>
          <p className="text-lg md:text-xl text-primary-100 max-w-2xl mx-auto">
            Choose the plan that fits your business needs
          </p>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {plans.map((plan, idx) => (
              <div
                key={idx}
                className={`relative bg-white rounded-2xl shadow-lg p-8 ${
                  plan.popular ? 'border-2 border-green-500 transform md:scale-105' : 'border border-gray-200'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-green-500 text-white px-4 py-1 rounded-full text-sm font-semibold flex items-center">
                      <Star className="w-4 h-4 mr-1 fill-current" />
                      Most Popular
                    </span>
                  </div>
                )}
                
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                  <div className="flex items-baseline justify-center">
                    <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                    <span className="text-gray-500 ml-2">{plan.period}</span>
                  </div>
                </div>

                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, fIdx) => (
                    <li key={fIdx} className="flex items-start">
                      <Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>

                <button
                  className={`w-full py-3 px-6 rounded-xl font-semibold transition-colors ${
                    plan.popular
                      ? 'bg-green-500 text-white hover:bg-green-600'
                      : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                  }`}
                >
                  Get Started — Coming Soon
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* KYC Banner */}
      <section className="py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-2xl p-8 md:p-12 text-white shadow-lg">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
              <div className="flex-shrink-0">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                  <Shield className="w-8 h-8" />
                </div>
              </div>
              <div className="flex-1 text-center md:text-left">
                <h3 className="text-xl md:text-2xl font-bold mb-3">
                  Identity Verification (KYC)
                </h3>
                <p className="text-primary-100 text-lg mb-4">
                  One-time fee of ₦5,000. Get the verified badge and build instant client trust.
                </p>
                <button className="bg-white text-primary-700 px-6 py-3 rounded-xl font-semibold hover:bg-gray-100 transition-colors">
                  Learn More
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
            <p className="text-gray-600">Everything you need to know about our pricing</p>
          </div>

          <div className="space-y-6">
            {faqs.map((faq, idx) => (
              <div
                key={idx}
                className="bg-gray-50 rounded-xl p-6 border border-gray-200"
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                      <HelpCircle className="w-5 h-5 text-primary-600" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {faq.question}
                    </h3>
                    <p className="text-gray-600">{faq.answer}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
