// src/components/LandingPage.js
import React from 'react';
import { useNavigate } from 'react-router-dom';

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <div className="bg-blue-600 text-white p-2 rounded-lg mr-3">
                <span className="font-bold text-lg">Rx</span>
              </div>
              <span className="text-xl font-bold text-gray-900">PharmCompound Pro</span>
            </div>
            <div className="hidden md:flex space-x-8">
              <a href="#features" className="text-gray-600 hover:text-blue-600">Features</a>
              <a href="#pricing" className="text-gray-600 hover:text-blue-600">Pricing</a>
              <button 
                onClick={() => navigate('/login')}
                className="text-gray-600 hover:text-blue-600"
              >
                Login
              </button>
              <button 
                onClick={() => navigate('/register')}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                Start Free Trial
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <div className="inline-block bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-semibold mb-8">
            USP 795/797/800 Compliant
          </div>
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            The Complete Compounding<br />Pharmacy Solution
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Streamline your compound documentation, ensure compliance, and scale your pharmacy with confidence. 
            Join 100+ pharmacies already saving 10+ hours per week.
          </p>
          <div className="flex justify-center space-x-4 mb-8">
            <button 
              onClick={() => navigate('/register')}
              className="bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-all"
            >
              Start 14-Day Free Trial
            </button>
            <button className="border-2 border-blue-600 text-blue-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-50 transition-all">
              Watch Demo
            </button>
          </div>
          <div className="text-sm text-gray-500 space-x-6">
            <span>✓ No credit card required</span>
            <span>✓ Setup in 5 minutes</span>
            <span>✓ Cancel anytime</span>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-blue-600">100+</div>
              <div className="text-gray-600">Active Pharmacies</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-blue-600">50,000+</div>
              <div className="text-gray-600">Compounds Tracked</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-blue-600">99.9%</div>
              <div className="text-gray-600">Uptime SLA</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-blue-600">10hrs</div>
              <div className="text-gray-600">Saved Weekly</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Everything You Need to Run a Modern Compounding Pharmacy
            </h2>
            <p className="text-xl text-gray-600">From formula management to compliance reporting</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: "📋",
                title: "Master Formula Records",
                description: "Create and manage MFRs with automatic version control. Pre-loaded with 500+ verified formulas."
              },
              {
                icon: "⚠️",
                title: "Risk Assessment Automation",
                description: "Automatically classify compounds as Level A, B, or C based on USP guidelines."
              },
              {
                icon: "🔬",
                title: "NIOSH Hazard Tracking",
                description: "Built-in NIOSH drug list with automatic PPE requirements and handling instructions."
              },
              {
                icon: "📊",
                title: "Real-time Analytics",
                description: "Track compound volumes, ingredient usage, and profitability at a glance."
              },
              {
                icon: "🏷️",
                title: "Label Generation",
                description: "Generate compliant labels with all required auxiliary warnings."
              },
              {
                icon: "📱",
                title: "Mobile Access",
                description: "Access formulas and create compounds from any device. Perfect for clean rooms."
              }
            ].map((feature, index) => (
              <div key={index} className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-all">
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Simple, Transparent Pricing</h2>
            <p className="text-xl text-gray-600">Choose the plan that fits your pharmacy's needs</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: "Starter",
                price: "$199",
                period: "/month",
                features: [
                  "100 compounds/month",
                  "3 user accounts",
                  "50 formula templates",
                  "Risk assessment",
                  "MFR generation",
                  "Email support"
                ]
              },
              {
                name: "Professional",
                price: "$399",
                period: "/month",
                popular: true,
                features: [
                  "500 compounds/month",
                  "10 user accounts",
                  "Unlimited formulas",
                  "Advanced analytics",
                  "API access",
                  "Priority support",
                  "Custom branding"
                ]
              },
              {
                name: "Enterprise",
                price: "$699",
                period: "/month",
                features: [
                  "Unlimited compounds",
                  "Unlimited users",
                  "Multiple locations",
                  "Custom reports",
                  "Dedicated support",
                  "Team training",
                  "99.9% uptime SLA"
                ]
              }
            ].map((plan, index) => (
              <div key={index} className={`bg-white rounded-xl shadow-lg p-8 ${plan.popular ? 'ring-2 ring-blue-500 relative' : ''}`}>
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
                      Most Popular
                    </span>
                  </div>
                )}
                <h3 className="text-xl font-bold text-gray-900 mb-4">{plan.name}</h3>
                <div className="mb-6">
                  <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                  <span className="text-gray-600">{plan.period}</span>
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center">
                      <span className="text-green-500 mr-3">✓</span>
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
                <button 
                  onClick={() => navigate('/register')}
                  className={`w-full py-3 rounded-lg font-semibold transition-all ${
                    plan.popular 
                      ? 'bg-blue-600 text-white hover:bg-blue-700' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Start Free Trial
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-blue-600 text-white">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Modernize Your Compounding Pharmacy?</h2>
          <p className="text-xl mb-8 opacity-90">Join 100+ pharmacies already using PharmCompound Pro</p>
          <button 
            onClick={() => navigate('/register')}
            className="bg-white text-blue-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-100 transition-all"
          >
            Start Your 14-Day Free Trial
          </button>
          <p className="text-sm mt-4 opacity-75">No credit card required • Setup in 5 minutes • Cancel anytime</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <div className="bg-blue-600 text-white p-2 rounded-lg mr-3">
                  <span className="font-bold">Rx</span>
                </div>
                <span className="text-lg font-bold">PharmCompound Pro</span>
              </div>
              <p className="text-gray-400">Professional compounding pharmacy management software.</p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">Features</a></li>
                <li><a href="#" className="hover:text-white">Pricing</a></li>
                <li><a href="#" className="hover:text-white">API</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">About</a></li>
                <li><a href="#" className="hover:text-white">Blog</a></li>
                <li><a href="#" className="hover:text-white">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">Help Center</a></li>
                <li><a href="#" className="hover:text-white">Documentation</a></li>
                <li><a href="#" className="hover:text-white">Status</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 PharmCompound Pro. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;