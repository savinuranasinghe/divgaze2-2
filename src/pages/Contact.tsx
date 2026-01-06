import { useState, useEffect } from 'react';
import { ArrowRight, Mail, Calendar, Phone } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { AnimatedSection } from '@/components/shared/AnimatedSection';
import { useToast } from '@/hooks/use-toast';

const Contact = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    service: '',
    message: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Auto-scroll to form if #contact in URL
  useEffect(() => {
    if (window.location.hash === '#contact') {
      const formElement = document.getElementById('contact-form');
      if (formElement) {
        setTimeout(() => {
          formElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
          formElement.classList.add('highlight-form');
          setTimeout(() => {
            formElement.classList.remove('highlight-form');
          }, 2000);
        }, 300);
      }
    }
  }, []);

  // Validation functions
  const validateName = (name: string): string | null => {
    if (!name.trim()) return 'Name is required';
    if (name.length < 2) return 'Name must be at least 2 characters';
    if (name.length > 100) return 'Name must be less than 100 characters';
    if (!/^[a-zA-Z\s.-]+$/.test(name)) return 'Name can only contain letters, spaces, dots, and hyphens';
    return null;
  };

  const validateEmail = (email: string): string | null => {
    if (!email.trim()) return 'Email is required';
    if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email)) return 'Please enter a valid email address';
    return null;
  };

  const validatePhone = (phone: string): string | null => {
    if (!phone.trim()) return 'Phone number is required';
    const cleanPhone = phone.replace(/[\s()-]/g, '');
    if (cleanPhone.length < 7) return 'Phone number must be at least 7 digits';
    if (cleanPhone.length > 15) return 'Phone number is too long';
    if (!/^\+?[\d]+$/.test(cleanPhone)) return 'Phone number can only contain digits and + symbol';
    return null;
  };

  const validateMessage = (message: string): string | null => {
    if (!message.trim()) return 'Message is required';
    if (message.length < 10) return 'Message must be at least 10 characters';
    if (message.length > 5000) return 'Message must be less than 5000 characters';
    return null;
  };

  const validateService = (service: string): string | null => {
    if (!service) return 'Please select a service';
    return null;
  };

  // Handle input changes with real-time validation
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name === 'phone') {
      const sanitizedValue = value.replace(/[^0-9+\s()-]/g, '');
      setFormData(prev => ({ ...prev, [name]: sanitizedValue }));
    } else if (name === 'name') {
      const sanitizedValue = value.replace(/[^a-zA-Z\s.-]/g, '');
      setFormData(prev => ({ ...prev, [name]: sanitizedValue }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }

    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // Validate all fields
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    const nameError = validateName(formData.name);
    if (nameError) newErrors.name = nameError;

    const emailError = validateEmail(formData.email);
    if (emailError) newErrors.email = emailError;

    const phoneError = validatePhone(formData.phone);
    if (phoneError) newErrors.phone = phoneError;

    const serviceError = validateService(formData.service);
    if (serviceError) newErrors.service = serviceError;

    const messageError = validateMessage(formData.message);
    if (messageError) newErrors.message = messageError;

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast({
        title: "⚠️ Please fix the errors",
        description: "Check the form fields and try again.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('https://divgaze-agent.vercel.app/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          email: formData.email.trim().toLowerCase(),
          phone: formData.phone.trim(),
          service: formData.service,
          message: formData.message.trim(),
          language: 'English',
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: '✅ Message sent successfully!',
          description: "We'll get back to you within 24 hours. Check your email for confirmation.",
        });
        setFormData({ name: '', email: '', phone: '', service: '', message: '' });
        setErrors({});
      } else {
        throw new Error(data.error || 'Failed to send message');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      toast({
        title: '❌ Failed to send message',
        description: error instanceof Error ? error.message : 'Please try again or email us directly at divgaze@gmail.com',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Layout>
      {/* Hero Section */}
      <section className="section-full relative overflow-hidden font-inter pt-20 bg-background">
        <div className="noise-overlay" />

        <div className="container-premium relative z-10">
          <div className="grid md:grid-cols-2 gap-16">
            {/* Left Column - Info */}
            <AnimatedSection>
              <span className="text-sm font-medium text-muted-foreground tracking-widest uppercase mb-4 block">
                Contact
              </span>
              <h1 className="heading-xl mb-8">
                Let's <span className="opacity-60">talk.</span>
              </h1>
              <p className="body-lg text-muted-foreground mb-12">
                Have a project in mind? We'd love to hear about it. 
                Fill out the form or reach out directly.
              </p>

              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-secondary flex items-center justify-center">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Email us at</p>
                    <a href="mailto:divgaze@gmail.com" className="font-medium hover:opacity-70 transition-opacity">
                      divgaze@gmail.com
                    </a>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-secondary flex items-center justify-center">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Call us at</p>
                    <a href="tel:+94771234567" className="font-medium hover:opacity-70 transition-opacity">
                      +94 77 123 4567
                    </a>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-secondary flex items-center justify-center">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Schedule a call</p>
                    <a href="#contact-form" className="font-medium hover:opacity-70 transition-opacity">
                      Fill the form below
                    </a>
                  </div>
                </div>
              </div>
            </AnimatedSection>

            {/* Right Column - Form */}
            <AnimatedSection delay={0.2} direction="right">
              <form onSubmit={handleSubmit} className="space-y-6" id="contact-form">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium mb-2">
                    Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    maxLength={100}
                    className={`w-full px-4 py-4 bg-secondary border-2 ${errors.name ? 'border-red-500' : 'border-transparent'} focus:ring-2 focus:ring-foreground transition-all outline-none`}
                    placeholder="Your name"
                  />
                  {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    maxLength={254}
                    className={`w-full px-4 py-4 bg-secondary border-2 ${errors.email ? 'border-red-500' : 'border-transparent'} focus:ring-2 focus:ring-foreground transition-all outline-none`}
                    placeholder="your@email.com"
                  />
                  {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-medium mb-2">
                    Phone
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    maxLength={20}
                    inputMode="tel"
                    className={`w-full px-4 py-4 bg-secondary border-2 ${errors.phone ? 'border-red-500' : 'border-transparent'} focus:ring-2 focus:ring-foreground transition-all outline-none`}
                    placeholder="+94 77 123 4567"
                  />
                  {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
                </div>

                <div>
                  <label htmlFor="service" className="block text-sm font-medium mb-2">
                    I'm interested in...
                  </label>
                  <select
                    id="service"
                    name="service"
                    value={formData.service}
                    onChange={handleChange}
                    required
                    className={`w-full px-4 py-4 bg-secondary border-2 ${errors.service ? 'border-red-500' : 'border-transparent'} focus:ring-2 focus:ring-foreground transition-all outline-none appearance-none cursor-pointer`}
                  >
                    <option value="">Select a service</option>
                    <option value="Web Development">Web Development</option>
                    <option value="AI Solutions">AI Solutions</option>
                    <option value="Creative Design">Creative Design</option>
                    <option value="Other">Other</option>
                  </select>
                  {errors.service && <p className="text-red-500 text-sm mt-1">{errors.service}</p>}
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium mb-2">
                    Message
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={6}
                    maxLength={5000}
                    className={`w-full px-4 py-4 bg-secondary border-2 ${errors.message ? 'border-red-500' : 'border-transparent'} focus:ring-2 focus:ring-foreground transition-all outline-none resize-none`}
                    placeholder="Tell us about your project..."
                  />
                  {errors.message && <p className="text-red-500 text-sm mt-1">{errors.message}</p>}
                  <p className="text-muted-foreground text-xs mt-1 text-right">{formData.message.length}/5000</p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? 'Sending...' : 'Send Message'}
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </button>
                </div>
              </form>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* Map or Additional Info Section */}
      <section className="py-20 bg-primary text-primary-foreground font-inter">
        <div className="container-premium">
          <AnimatedSection>
            <div className="text-center">
              <h2 className="heading-md mb-4">Based globally. Available worldwide.</h2>
              <p className="text-primary-foreground/70">
                We work with clients across every timezone.
              </p>
            </div>
          </AnimatedSection>
        </div>
      </section>
    </Layout>
  );
};

export default Contact;
