import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: number;
  icon: LucideIcon;
  variant?: 'primary' | 'secondary' | 'accent' | 'destructive';
  prefix?: string;
  suffix?: string;
  description?: string;
  href?: string;
}

export function StatsCard({
  title,
  value,
  icon: Icon,
  variant = 'primary',
  prefix = '',
  suffix = '',
  description,
  href,
}: StatsCardProps) {
  const navigate = useNavigate();
  const [displayValue, setDisplayValue] = useState(0);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const duration = 1500;
    const steps = 60;
    const increment = value / steps;
    let current = 0;
    
    const timer = setInterval(() => {
      current += increment;
      if (current >= value) {
        setDisplayValue(value);
        clearInterval(timer);
      } else {
        setDisplayValue(Math.floor(current));
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [value]);

  const variantStyles = {
    primary: 'bg-primary/10 text-primary border-primary/20',
    secondary: 'bg-secondary/20 text-secondary border-secondary/30',
    accent: 'bg-accent/20 text-accent-foreground border-accent/30',
    destructive: 'bg-destructive/10 text-destructive border-destructive/20',
  };

  const iconBgStyles = {
    primary: 'bg-primary text-primary-foreground',
    secondary: 'bg-secondary text-secondary-foreground',
    accent: 'bg-accent text-accent-foreground',
    destructive: 'bg-destructive text-destructive-foreground',
  };

  const handleClick = () => {
    if (href) {
      navigate(href);
    }
  };

  return (
    <Card
      ref={cardRef}
      onClick={handleClick}
      className={cn(
        'hover-lift cursor-pointer transition-all duration-300 border-2',
        variantStyles[variant],
        href && 'hover:scale-[1.02] active:scale-[0.98]'
      )}
    >
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-3xl font-bold">
              {prefix}
              {displayValue.toLocaleString()}
              {suffix}
            </p>
            {description && (
              <p className="text-xs text-muted-foreground">{description}</p>
            )}
          </div>
          <div className={cn('p-3 rounded-lg', iconBgStyles[variant])}>
            <Icon className="h-6 w-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
