import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Building2,
  PiggyBank,
  CreditCard,
  Shield,
  Users,
  TrendingUp,
  CheckCircle2,
  ArrowRight,
  Phone,
  Mail,
  MapPin,
} from 'lucide-react';

export default function Landing() {
  const navigate = useNavigate();
  
  const features = [
    {
      icon: PiggyBank,
      title: 'Secure Savings',
      description: 'Build your financial future with competitive interest rates and secure savings accounts tailored for university staff.',
    },
    {
      icon: CreditCard,
      title: 'Flexible Loans',
      description: 'Access affordable loans with competitive rates and flexible repayment terms designed for your needs.',
    },
    {
      icon: Shield,
      title: 'Trusted & Secure',
      description: 'Your funds are protected with state-of-the-art security measures and transparent management.',
    },
    {
      icon: Users,
      title: 'Member-Focused',
      description: 'Join a community of over 1,400 university staff members benefiting from our services.',
    },
  ];
  
  const stats = [
    { value: '1,400+', label: 'Active Members' },
    { value: 'ETB 45M+', label: 'Total Savings' },
    { value: '12%', label: 'Loan Interest Rate' },
    { value: '98%', label: 'Member Satisfaction' },
  ];
  
  const benefits = [
    'Competitive interest rates on savings',
    'Low-interest emergency loans',
    'Salary deduction repayment option',
    'Quick loan approval process',
    'Transparent financial reporting',
    'Dedicated member support',
  ];
  
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <Building2 className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="font-bold text-lg">AMU SLCO</h1>
                <p className="text-xs text-muted-foreground">Savings & Loan</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="ghost" onClick={() => navigate('/auth')}>
                Sign In
              </Button>
              <Button onClick={() => navigate('/auth')} className="gap-2">
                Get Started
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </nav>
      
      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
        <div className="absolute top-1/4 -left-1/4 w-1/2 h-1/2 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-1/4 w-1/2 h-1/2 bg-accent/10 rounded-full blur-3xl" />
        
        <div className="max-w-7xl mx-auto relative">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6 animate-fade-in">
              <Building2 className="w-4 h-4" />
              Arbaminch University Staff Credit Organization
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold mb-6 animate-slide-up">
              Empowering Your{' '}
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Financial Future
              </span>
            </h1>
            
            <p className="text-xl text-muted-foreground mb-8 animate-slide-up" style={{ animationDelay: '100ms' }}>
              Join Arbaminch University's trusted savings and loan cooperative. 
              Build wealth, access affordable credit, and secure your financial well-being.
            </p>
            
            <div className="flex items-center justify-center gap-4 animate-slide-up" style={{ animationDelay: '200ms' }}>
              <Button size="lg" onClick={() => navigate('/auth')} className="gap-2 text-lg px-8">
                Become a Member
                <ArrowRight className="w-5 h-5" />
              </Button>
              <Button size="lg" variant="outline" onClick={() => navigate('/auth')} className="text-lg px-8">
                Member Login
              </Button>
            </div>
          </div>
        </div>
      </section>
      
      {/* Stats Section */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div
                key={stat.label}
                className="text-center animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <p className="text-3xl md:text-4xl font-bold text-primary mb-2">{stat.value}</p>
                <p className="text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Choose Us?</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              We provide comprehensive financial services designed specifically for Arbaminch University staff.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Card
                key={feature.title}
                className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <CardContent className="p-6">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-primary group-hover:scale-110 transition-all duration-300">
                    <feature.icon className="w-6 h-6 text-primary group-hover:text-primary-foreground transition-colors" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
      
      {/* Benefits Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-primary/5 to-accent/5">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Member Benefits That Make a{' '}
                <span className="text-primary">Difference</span>
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                As a member of AMU Savings and Loan Cooperative, you gain access to exclusive benefits 
                designed to support your financial goals.
              </p>
              
              <div className="grid gap-4">
                {benefits.map((benefit, index) => (
                  <div
                    key={benefit}
                    className="flex items-center gap-3 animate-slide-up"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div className="w-6 h-6 bg-success/20 rounded-full flex items-center justify-center flex-shrink-0">
                      <CheckCircle2 className="w-4 h-4 text-success" />
                    </div>
                    <span>{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-primary to-accent rounded-3xl opacity-10 blur-2xl" />
              <Card className="relative overflow-hidden">
                <CardContent className="p-8">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center">
                      <TrendingUp className="w-8 h-8 text-primary-foreground" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold">Start Saving Today</h3>
                      <p className="text-muted-foreground">Minimum ETB 500/month</p>
                    </div>
                  </div>
                  
                  <div className="space-y-4 mb-6">
                    <div className="flex justify-between items-center p-4 bg-muted/50 rounded-lg">
                      <span className="text-muted-foreground">Annual Interest Rate</span>
                      <span className="font-bold text-success text-lg">6%</span>
                    </div>
                    <div className="flex justify-between items-center p-4 bg-muted/50 rounded-lg">
                      <span className="text-muted-foreground">Loan Eligibility</span>
                      <span className="font-bold">3x Your Savings</span>
                    </div>
                    <div className="flex justify-between items-center p-4 bg-muted/50 rounded-lg">
                      <span className="text-muted-foreground">Max Loan Amount</span>
                      <span className="font-bold">ETB 500,000</span>
                    </div>
                  </div>
                  
                  <Button className="w-full" size="lg" onClick={() => navigate('/auth')}>
                    Join Now
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Secure Your Financial Future?
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            Join over 1,400 Arbaminch University staff members who trust us with their savings and loans.
          </p>
          <Button size="lg" onClick={() => navigate('/auth')} className="gap-2 text-lg px-10">
            Get Started Today
            <ArrowRight className="w-5 h-5" />
          </Button>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="bg-muted/50 border-t py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                  <Building2 className="w-6 h-6 text-primary-foreground" />
                </div>
                <div>
                  <h3 className="font-bold">AMU SLCO</h3>
                  <p className="text-xs text-muted-foreground">Savings & Loan Cooperative</p>
                </div>
              </div>
              <p className="text-muted-foreground">
                Serving Arbaminch University staff since 2010. Building financial security together.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li><button onClick={() => navigate('/auth')} className="hover:text-primary transition-colors">Member Login</button></li>
                <li><button onClick={() => navigate('/auth')} className="hover:text-primary transition-colors">Register</button></li>
                <li><a href="#" className="hover:text-primary transition-colors">Loan Calculator</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">FAQs</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Contact Us</h4>
              <ul className="space-y-3 text-muted-foreground">
                <li className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-primary" />
                  Arbaminch University, Main Campus
                </li>
                <li className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-primary" />
                  +251 46 881 0000
                </li>
                <li className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-primary" />
                  slco@amu.edu.et
                </li>
              </ul>
            </div>
          </div>
          
          <div className="border-t mt-8 pt-8 text-center text-muted-foreground">
            <p>&copy; {new Date().getFullYear()} Arbaminch University Savings & Loan Cooperative. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
