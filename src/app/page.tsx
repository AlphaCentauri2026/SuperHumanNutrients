'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Navigation } from '@/components/Navigation';
import {
  AnimatedButton,
  GradientButton,
  FloatingButton,
} from '@/components/ui/animated-button';
import { AnimatedCard, ElevatedCard } from '@/components/ui/animated-card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Sparkles,
  Brain,
  Zap,
  Star,
  CheckCircle,
  ArrowRight,
  Play,
  Mail,
  Heart,
  Shield,
  Clock,
} from 'lucide-react';
import {
  fadeInUp,
  staggerContainer,
  staggerItem,
  gradientShift,
} from '@/lib/animations';

export default function Home() {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate API call - replace with actual email service integration
    await new Promise(resolve => setTimeout(resolve, 1000));

    setIsSubmitted(true);
    setIsSubmitting(false);
    setEmail('');
    setName('');
  };

  const scrollToDemo = () => {
    const demoSection = document.getElementById('demo-section');
    demoSection?.scrollIntoView({ behavior: 'smooth' });
  };

  const scrollToApp = () => {
    const appSection = document.getElementById('app-section');
    appSection?.scrollIntoView({ behavior: 'smooth' });
  };

  const valueProps = [
    {
      icon: Brain,
      title: 'Smart AI Combinations',
      description:
        'Science-backed nutrient pairings that maximize absorption and health benefits.',
      color: 'blue',
    },
    {
      icon: Zap,
      title: 'Dynamic & Randomized',
      description:
        'Never boring, always fresh combinations that keep your nutrition exciting.',
      color: 'purple',
    },
    {
      icon: Heart,
      title: 'Catchy Health Names',
      description:
        'Fun, memorable names that make nutrition approachable and engaging.',
      color: 'green',
    },
  ];

  const colorClasses = {
    blue: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
    purple:
      'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400',
    green:
      'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400',
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-background to-purple-50 dark:from-gray-900 dark:via-background dark:to-gray-800 particles">
      <Navigation />

      <main className="relative">
        {/* Hero Section */}
        <section className="relative overflow-hidden">
          <motion.div
            className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16"
            variants={staggerContainer}
            initial="initial"
            animate="animate"
          >
            <div className="text-center">
              <motion.div
                className="inline-flex items-center gap-2 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 px-4 py-2 rounded-full text-sm font-medium mb-6 glass"
                variants={fadeInUp}
              >
                <Sparkles className="w-4 h-4" />
                Powered by AI
              </motion.div>

              <motion.h1
                className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-foreground mb-6 leading-tight"
                variants={fadeInUp}
              >
                AI-Powered Nutrition
                <span className="block text-gradient neon-glow-blue">
                  That Actually Works
                </span>
              </motion.h1>

              <motion.p
                className="text-lg sm:text-xl md:text-2xl text-muted-foreground mb-8 max-w-4xl mx-auto leading-relaxed px-4"
                variants={fadeInUp}
              >
                Discover unique fruit, veggie, and grain combinations designed
                to boost your health — powered by AI.
              </motion.p>

              <motion.div
                className="flex flex-col sm:flex-row gap-4 justify-center mb-12"
                variants={fadeInUp}
              >
                <GradientButton
                  size="lg"
                  icon={<Sparkles className="w-5 h-5" />}
                  iconPosition="left"
                  className="px-8 py-4 text-lg font-semibold glow-hover"
                  onClick={scrollToApp}
                >
                  Generate My Combo
                </GradientButton>
                <AnimatedButton
                  variant="outline"
                  size="lg"
                  icon={<Play className="w-5 h-5" />}
                  iconPosition="left"
                  className="px-8 py-4 text-lg font-semibold border-2 border-border hover:bg-accent btn-bounce"
                  onClick={scrollToDemo}
                >
                  Learn More
                </AnimatedButton>
              </motion.div>

              {/* Trust Indicators */}
              <motion.div
                className="flex flex-wrap justify-center gap-4 sm:gap-8 text-sm text-muted-foreground px-4"
                variants={fadeInUp}
              >
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Free to try</span>
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-blue-500" />
                  <span>Science-backed</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-purple-500" />
                  <span>Instant results</span>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </section>

        {/* Demo/Preview Section */}
        <section
          id="demo-section"
          className="py-20 bg-white/50 dark:bg-gray-900/50"
        >
          <motion.div
            className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
            variants={fadeInUp}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            <div className="text-center mb-12">
              <motion.h2
                className="text-3xl md:text-4xl font-bold text-foreground mb-4"
                variants={fadeInUp}
              >
                See how AI makes nutrition easy
              </motion.h2>
              <motion.p
                className="text-xl text-muted-foreground max-w-2xl mx-auto"
                variants={fadeInUp}
              >
                Watch our AI create personalized nutrition combinations in this
                quick demo
              </motion.p>
            </div>

            <motion.div
              className="relative max-w-4xl mx-auto"
              variants={fadeInUp}
            >
              <ElevatedCard className="overflow-hidden">
                <div className="aspect-video bg-black rounded-lg overflow-hidden">
                  <video
                    className="w-full h-full object-cover"
                    controls
                    preload="metadata"
                    playsInline
                    muted
                    onError={e => {
                      console.error('Video error:', e);
                      console.log('Video src:', e.currentTarget.src);
                    }}
                    onLoadStart={() => console.log('Video loading started')}
                    onCanPlay={() => console.log('Video can play')}
                  >
                    <source src="/Super human nutrition.mp4" type="video/mp4" />
                    <div className="flex items-center justify-center h-full bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30">
                      <div className="text-center">
                        <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Play className="w-8 h-8 text-white ml-1" />
                        </div>
                        <h3 className="text-xl font-semibold text-foreground mb-2">
                          Video Not Supported
                        </h3>
                        <p className="text-muted-foreground">
                          Your browser doesn&apos;t support this video format
                        </p>
                        <p className="text-sm text-muted-foreground mt-2">
                          Try using Safari or convert to MP4 format
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          File: Super human nutrition.mov (226MB)
                        </p>
                      </div>
                    </div>
                  </video>
                </div>
              </ElevatedCard>
            </motion.div>
          </motion.div>
        </section>

        {/* Value Proposition Section */}
        <section className="py-20">
          <motion.div
            className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            <div className="text-center mb-16">
              <motion.h2
                className="text-3xl md:text-4xl font-bold text-foreground mb-4"
                variants={fadeInUp}
              >
                Why Choose Our AI Nutrition?
              </motion.h2>
              <motion.p
                className="text-xl text-muted-foreground max-w-2xl mx-auto"
                variants={fadeInUp}
              >
                Three powerful reasons that make our approach unique
              </motion.p>
            </div>

            <motion.div
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8"
              variants={staggerContainer}
            >
              {valueProps.map((prop, index) => (
                <motion.div
                  key={prop.title}
                  variants={staggerItem}
                  transition={{ delay: index * 0.2 }}
                >
                  <ElevatedCard className="h-full text-center p-6 lg:p-8 card-hover">
                    <motion.div
                      className={`mx-auto w-16 h-16 ${colorClasses[prop.color as keyof typeof colorClasses]} rounded-2xl flex items-center justify-center mb-6`}
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      transition={{ duration: 0.2 }}
                    >
                      <prop.icon className="w-8 h-8" />
                    </motion.div>
                    <h3 className="text-xl font-semibold text-foreground mb-4">
                      {prop.title}
                    </h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {prop.description}
                    </p>
                  </ElevatedCard>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </section>

        {/* Main CTA Section */}
        <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-700 dark:to-purple-700 relative overflow-hidden">
          <motion.div
            className="absolute top-0 left-0 w-full h-full opacity-10"
            variants={gradientShift}
            animate="animate"
          />

          <motion.div
            className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8 relative z-10"
            variants={fadeInUp}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            <motion.h2
              className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6"
              variants={fadeInUp}
            >
              Start eating smarter today — free to try
            </motion.h2>
            <motion.p
              className="text-xl text-blue-100 dark:text-blue-200 mb-8 max-w-2xl mx-auto"
              variants={fadeInUp}
            >
              Join thousands of users who have transformed their nutrition with
              AI-powered meal planning.
            </motion.p>
            <motion.div variants={fadeInUp}>
              <FloatingButton
                size="lg"
                icon={<ArrowRight className="w-5 h-5" />}
                iconPosition="right"
                className="bg-white dark:bg-gray-100 text-blue-600 dark:text-blue-700 hover:bg-gray-100 dark:hover:bg-gray-200 px-8 py-4 text-lg font-semibold glow"
                onClick={scrollToApp}
              >
                Try It Now
              </FloatingButton>
            </motion.div>
          </motion.div>
        </section>

        {/* App Functionality Section */}
        <section id="app-section" className="py-20">
          <motion.div
            className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            <div className="text-center mb-16">
              <motion.h2
                className="text-3xl md:text-4xl font-bold text-foreground mb-4"
                variants={fadeInUp}
              >
                Experience the Power of AI Nutrition
              </motion.h2>
              <motion.p
                className="text-xl text-muted-foreground max-w-2xl mx-auto"
                variants={fadeInUp}
              >
                Try our AI-powered meal planner and see how it creates
                personalized nutrition combinations for you
              </motion.p>
            </div>

            <motion.div variants={fadeInUp}>
              <ElevatedCard className="p-8">
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-semibold text-foreground mb-4">
                    Ready to generate your first AI nutrition combo?
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    Click below to access our full meal planning tool
                  </p>
                  <Link href="/planner">
                    <GradientButton
                      size="lg"
                      icon={<Sparkles className="w-5 h-5" />}
                      iconPosition="left"
                      className="px-8 py-4 text-lg font-semibold glow-hover"
                    >
                      Launch AI Meal Planner
                    </GradientButton>
                  </Link>
                </div>
              </ElevatedCard>
            </motion.div>
          </motion.div>
        </section>

        {/* Email Capture Section */}
        <section className="py-20 bg-white/50 dark:bg-gray-900/50">
          <motion.div
            className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center"
            variants={fadeInUp}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            <motion.div variants={fadeInUp}>
              <ElevatedCard className="p-8">
                <div className="mb-6">
                  <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
                    Get early access updates
                  </h2>
                  <p className="text-muted-foreground">
                    Be the first to know about new features and AI improvements
                  </p>
                </div>

                {isSubmitted ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center"
                  >
                    <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      Thank you for subscribing!
                    </h3>
                    <p className="text-muted-foreground">
                      We&apos;ll keep you updated on our latest features.
                    </p>
                  </motion.div>
                ) : (
                  <form onSubmit={handleEmailSubmit} className="space-y-4">
                    <div className="flex flex-col sm:flex-row gap-4">
                      <div className="flex-1">
                        <Label htmlFor="name" className="sr-only">
                          Name
                        </Label>
                        <Input
                          id="name"
                          type="text"
                          placeholder="Your name"
                          value={name}
                          onChange={e => setName(e.target.value)}
                          required
                          className="w-full"
                        />
                      </div>
                      <div className="flex-1">
                        <Label htmlFor="email" className="sr-only">
                          Email
                        </Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="Your email"
                          value={email}
                          onChange={e => setEmail(e.target.value)}
                          required
                          className="w-full"
                        />
                      </div>
                    </div>
                    <AnimatedButton
                      type="submit"
                      loading={isSubmitting}
                      icon={<Mail className="w-4 h-4" />}
                      iconPosition="left"
                      className="w-full sm:w-auto px-8"
                    >
                      {isSubmitting ? 'Subscribing...' : 'Subscribe'}
                    </AnimatedButton>
                  </form>
                )}
              </ElevatedCard>
            </motion.div>
          </motion.div>
        </section>

        {/* Testimonials Section */}
        <section className="py-20">
          <motion.div
            className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
            variants={fadeInUp}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            <motion.div className="text-center mb-12" variants={fadeInUp}>
              <h2 className="text-3xl font-bold text-foreground mb-4">
                What Our Users Say
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Join thousands of users who have transformed their nutrition
                with AI-powered meal planning.
              </p>
            </motion.div>

            <motion.div
              className="grid grid-cols-1 md:grid-cols-3 gap-8"
              variants={staggerContainer}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
            >
              {[
                {
                  name: 'Sarah Johnson',
                  role: 'Fitness Enthusiast',
                  content:
                    "The AI meal planner is incredible! It's like having a personal nutritionist who knows exactly what I need.",
                  rating: 5,
                },
                {
                  name: 'Mike Chen',
                  role: 'Health Coach',
                  content:
                    'I recommend this to all my clients. The personalized meal plans are scientifically accurate and easy to follow.',
                  rating: 5,
                },
                {
                  name: 'Emma Davis',
                  role: 'Busy Professional',
                  content:
                    'Finally, a meal planner that actually works! The AI understands my preferences and creates delicious combinations.',
                  rating: 5,
                },
              ].map((testimonial, index) => (
                <motion.div
                  key={testimonial.name}
                  variants={staggerItem}
                  transition={{ delay: index * 0.2 }}
                >
                  <AnimatedCard className="h-full glass">
                    <div className="flex items-center mb-4">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star
                          key={i}
                          className="w-4 h-4 text-yellow-400 fill-current"
                        />
                      ))}
                    </div>
                    <p className="text-muted-foreground mb-4 italic">
                      &ldquo;{testimonial.content}&rdquo;
                    </p>
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold mr-3">
                        {testimonial.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-semibold text-foreground">
                          {testimonial.name}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {testimonial.role}
                        </div>
                      </div>
                    </div>
                  </AnimatedCard>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </section>
      </main>
    </div>
  );
}
