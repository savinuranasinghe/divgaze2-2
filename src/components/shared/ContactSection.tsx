import { useState } from 'react';
import { AnimatedSection } from './AnimatedSection';
import { ArrowRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export const ContactSection = () => {
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
    // Remove spaces, dashes, parentheses for validation
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
    
    // For phone field, only allow numbers, +, spaces, dashes, parentheses
    if (name === 'phone') {
      const sanitizedValue = value.replace(/[^0-9+\s()-]/g, '');
      setFormData(prev => ({ ...prev, [name]: sanitizedValue }));
    } else if (name === 'name') {
      // For name, only allow letters, spaces, dots, hyphens
      const sanitizedValue = value.replace(/[^a-zA-Z\s.-]/g, '');
      setFormData(prev => ({ ...prev, [name]: sanitizedValue }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }

    // Clear error when user starts typing
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
    
    // Validate before submission
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
          title: "✅ Message sent successfully!",
          description: "We'll get back to you within 24 hours. Check your email for confirmation.",
        });

        setFormData({
          name: '',
          email: '',
          phone: '',
          service: '',
          message: '',
        });
        setErrors({});
      } else {
        throw new Error(data.error || 'Failed to send message');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      toast({
        title: "❌ Failed to send message",
        description: error instanceof Error ? error.message : "Please try again or email us directly at divgaze@gmail.com",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="contact" className="section-full bg-background font-inter">
      <div className="container-premium">
        <div className="max-w-2xl mx-auto">
          <AnimatedSection>
            <span className="text-sm font-medium text-muted-foreground tracking-widest uppercase mb-4 block text-center">
              Get in Touch
            </span>
            <h2 className="heading-lg text-center mb-12">
              Let's build something <span className="opacity-60">great.</span>
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="contact-name" className="block text-sm font-medium mb-2">
                  Name
                </label>
                <input
                  type="text"
                  id="contact-name"
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
                <label htmlFor="contact-email" className="block text-sm font-medium mb-2">
                  Email
                </label>
                <input
                  type="email"
                  id="contact-email"
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
                <label htmlFor="contact-phone" className="block text-sm font-medium mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  id="contact-phone"
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
                <label htmlFor="contact-service" className="block text-sm font-medium mb-2">
                  I'm interested in...
                </label>
                <select
                  id="contact-service"
                  name="service"
                  value={formData.service}
                  onChange={handleChange}
                  required
                  className={`w-full px-4 py-4 bg-secondary border-2 ${errors.service ? 'border-red-500' : 'border-transparent'} focus:ring-2 focus:ring-foreground transition-all outline-none appearance-none cursor-pointer`}
                >
                  <option value="">Select a service</option>
                  <option value="Creative Lab">Creative Lab</option>
                  <option value="AI Solutions">AI Solutions</option>
                  <option value="Web Development">Web Dev & Systems</option>
                  <option value="Digital Marketing">Digital Marketing</option>
                  <option value="Other">Other</option>
                </select>
                {errors.service && <p className="text-red-500 text-sm mt-1">{errors.service}</p>}
              </div>

              <div>
                <label htmlFor="contact-message" className="block text-sm font-medium mb-2">
                  Message
                </label>
                <textarea
                  id="contact-message"
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
                  className="group relative px-8 py-4 bg-primary text-primary-foreground rounded-full overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed font-medium border-0"
                >
                  <span className="relative z-10">
                    {isSubmitting ? 'Sending...' : 'Send Message'}
                  </span>
                  <div className="absolute inset-0 bg-gray-400 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
                </button>
              </div>
            </form>
          </AnimatedSection>
        </div>
      </div>
    </section>
  );
};
