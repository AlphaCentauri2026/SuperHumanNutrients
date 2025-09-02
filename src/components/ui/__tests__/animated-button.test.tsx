import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import {
  AnimatedButton,
  PrimaryButton,
  GradientButton,
} from '../animated-button';
import { Zap, Star } from 'lucide-react';

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    button: ({ children, ...props }: React.ComponentProps<'button'>) => (
      <button {...props}>{children}</button>
    ),
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
}));

describe('AnimatedButton', () => {
  const mockOnClick = jest.fn();

  beforeEach(() => {
    mockOnClick.mockClear();
  });

  describe('Basic Functionality', () => {
    it('renders button with children', () => {
      render(
        <AnimatedButton onClick={mockOnClick}>Test Button</AnimatedButton>
      );
      expect(
        screen.getByRole('button', { name: 'Test Button' })
      ).toBeInTheDocument();
    });

    it('calls onClick when clicked', async () => {
      render(<AnimatedButton onClick={mockOnClick}>Click Me</AnimatedButton>);

      const button = screen.getByRole('button', { name: 'Click Me' });
      fireEvent.click(button);

      await waitFor(() => {
        expect(mockOnClick).toHaveBeenCalledTimes(1);
      });
    });

    it('does not call onClick when disabled', async () => {
      render(
        <AnimatedButton onClick={mockOnClick} disabled>
          Disabled Button
        </AnimatedButton>
      );

      const button = screen.getByRole('button', { name: 'Disabled Button' });
      fireEvent.click(button);

      await waitFor(() => {
        expect(mockOnClick).not.toHaveBeenCalled();
      });
    });

    it('does not call onClick when loading', async () => {
      render(
        <AnimatedButton onClick={mockOnClick} loading>
          Loading Button
        </AnimatedButton>
      );

      const button = screen.getByRole('button', { name: 'Loading Button' });
      fireEvent.click(button);

      await waitFor(() => {
        expect(mockOnClick).not.toHaveBeenCalled();
      });
    });
  });

  describe('Variants', () => {
    it('renders with default variant', () => {
      render(<AnimatedButton onClick={mockOnClick}>Default</AnimatedButton>);
      const button = screen.getByRole('button', { name: 'Default' });
      expect(button).toHaveClass('bg-background');
    });

    it('renders with primary variant', () => {
      render(
        <AnimatedButton variant="primary" onClick={mockOnClick}>
          Primary
        </AnimatedButton>
      );
      const button = screen.getByRole('button', { name: 'Primary' });
      expect(button).toHaveClass('bg-primary');
    });

    it('renders with secondary variant', () => {
      render(
        <AnimatedButton variant="secondary" onClick={mockOnClick}>
          Secondary
        </AnimatedButton>
      );
      const button = screen.getByRole('button', { name: 'Secondary' });
      expect(button).toHaveClass('bg-secondary');
    });

    it('renders with outline variant', () => {
      render(
        <AnimatedButton variant="outline" onClick={mockOnClick}>
          Outline
        </AnimatedButton>
      );
      const button = screen.getByRole('button', { name: 'Outline' });
      expect(button).toHaveClass('border-input');
    });

    it('renders with ghost variant', () => {
      render(
        <AnimatedButton variant="ghost" onClick={mockOnClick}>
          Ghost
        </AnimatedButton>
      );
      const button = screen.getByRole('button', { name: 'Ghost' });
      expect(button).toHaveClass('hover:bg-accent');
    });

    it('renders with destructive variant', () => {
      render(
        <AnimatedButton variant="destructive" onClick={mockOnClick}>
          Destructive
        </AnimatedButton>
      );
      const button = screen.getByRole('button', { name: 'Destructive' });
      expect(button).toHaveClass('bg-destructive');
    });
  });

  describe('Sizes', () => {
    it('renders with small size', () => {
      render(
        <AnimatedButton size="sm" onClick={mockOnClick}>
          Small
        </AnimatedButton>
      );
      const button = screen.getByRole('button', { name: 'Small' });
      expect(button).toHaveClass('h-8');
    });

    it('renders with medium size (default)', () => {
      render(<AnimatedButton onClick={mockOnClick}>Medium</AnimatedButton>);
      const button = screen.getByRole('button', { name: 'Medium' });
      expect(button).toHaveClass('h-10');
    });

    it('renders with large size', () => {
      render(
        <AnimatedButton size="lg" onClick={mockOnClick}>
          Large
        </AnimatedButton>
      );
      const button = screen.getByRole('button', { name: 'Large' });
      expect(button).toHaveClass('h-12');
    });
  });

  describe('Icons', () => {
    it('renders with left icon', () => {
      render(
        <AnimatedButton
          icon={<Zap data-testid="icon" />}
          iconPosition="left"
          onClick={mockOnClick}
        >
          With Icon
        </AnimatedButton>
      );

      expect(screen.getByTestId('icon')).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: 'With Icon' })
      ).toBeInTheDocument();
    });

    it('renders with right icon', () => {
      render(
        <AnimatedButton
          icon={<Star data-testid="icon" />}
          iconPosition="right"
          onClick={mockOnClick}
        >
          With Icon
        </AnimatedButton>
      );

      expect(screen.getByTestId('icon')).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: 'With Icon' })
      ).toBeInTheDocument();
    });

    it('hides icon when loading', () => {
      render(
        <AnimatedButton
          icon={<Zap data-testid="icon" />}
          loading
          onClick={mockOnClick}
        >
          Loading
        </AnimatedButton>
      );

      // Icon should not be visible when loading
      expect(screen.queryByTestId('icon')).not.toBeInTheDocument();
    });
  });

  describe('Loading State', () => {
    it('shows loading spinner when loading', () => {
      render(
        <AnimatedButton loading onClick={mockOnClick}>
          Loading
        </AnimatedButton>
      );

      const button = screen.getByRole('button', { name: 'Loading' });
      expect(button).toBeDisabled();
      expect(button).toHaveClass('disabled:opacity-50');
    });

    it('hides children when loading', () => {
      render(
        <AnimatedButton loading onClick={mockOnClick}>
          Loading
        </AnimatedButton>
      );

      const button = screen.getByRole('button', { name: 'Loading' });
      const childSpan = button.querySelector('span');
      expect(childSpan).toHaveClass('opacity-0');
    });
  });

  describe('Gradient and Floating', () => {
    it('renders with gradient styles', () => {
      render(
        <AnimatedButton gradient onClick={mockOnClick}>
          Gradient
        </AnimatedButton>
      );
      const button = screen.getByRole('button', { name: 'Gradient' });
      expect(button).toHaveClass('bg-gradient-to-r');
      expect(button).toHaveClass('text-white');
    });

    it('renders with floating styles', () => {
      render(
        <AnimatedButton floating onClick={mockOnClick}>
          Floating
        </AnimatedButton>
      );
      const button = screen.getByRole('button', { name: 'Floating' });
      expect(button).toHaveClass('shadow-lg');
      expect(button).toHaveClass('hover:shadow-xl');
    });
  });

  describe('Full Width', () => {
    it('renders with full width', () => {
      render(
        <AnimatedButton fullWidth onClick={mockOnClick}>
          Full Width
        </AnimatedButton>
      );
      const button = screen.getByRole('button', { name: 'Full Width' });
      expect(button).toHaveClass('w-full');
    });
  });

  describe('HTML Attributes', () => {
    it('passes through HTML button attributes', () => {
      render(
        <AnimatedButton
          onClick={mockOnClick}
          title="Tooltip"
          aria-label="Accessible button"
          data-testid="custom-button"
        >
          Custom
        </AnimatedButton>
      );

      const button = screen.getByTestId('custom-button');
      expect(button).toHaveAttribute('title', 'Tooltip');
      expect(button).toHaveAttribute('aria-label', 'Accessible button');
    });

    it('sets correct button type', () => {
      render(
        <AnimatedButton type="submit" onClick={mockOnClick}>
          Submit
        </AnimatedButton>
      );
      const button = screen.getByRole('button', { name: 'Submit' });
      expect(button).toHaveAttribute('type', 'submit');
    });
  });

  describe('Specialized Components', () => {
    it('renders PrimaryButton correctly', () => {
      render(<PrimaryButton onClick={mockOnClick}>Primary</PrimaryButton>);
      const button = screen.getByRole('button', { name: 'Primary' });
      expect(button).toHaveClass('bg-primary');
    });

    it('renders GradientButton correctly', () => {
      render(<GradientButton onClick={mockOnClick}>Gradient</GradientButton>);
      const button = screen.getByRole('button', { name: 'Gradient' });
      expect(button).toHaveClass('bg-gradient-to-r');
      expect(button).toHaveClass('text-white');
    });
  });

  describe('Accessibility', () => {
    it('has proper disabled state', () => {
      render(
        <AnimatedButton disabled onClick={mockOnClick}>
          Disabled
        </AnimatedButton>
      );
      const button = screen.getByRole('button', { name: 'Disabled' });
      expect(button).toBeDisabled();
      expect(button).toHaveClass('disabled:cursor-not-allowed');
    });

    it('has proper focus styles', () => {
      render(<AnimatedButton onClick={mockOnClick}>Focusable</AnimatedButton>);
      const button = screen.getByRole('button', { name: 'Focusable' });
      expect(button).toHaveClass('focus-visible:outline-none');
      expect(button).toHaveClass('focus-visible:ring-2');
    });
  });

  describe('Event Handling', () => {
    it('handles multiple rapid clicks correctly', async () => {
      render(
        <AnimatedButton onClick={mockOnClick}>Rapid Click</AnimatedButton>
      );

      const button = screen.getByRole('button', { name: 'Rapid Click' });

      // Simulate rapid clicking
      fireEvent.click(button);
      fireEvent.click(button);
      fireEvent.click(button);

      await waitFor(() => {
        expect(mockOnClick).toHaveBeenCalledTimes(3);
      });
    });

    it('handles keyboard events correctly', async () => {
      render(<AnimatedButton onClick={mockOnClick}>Keyboard</AnimatedButton>);

      const button = screen.getByRole('button', { name: 'Keyboard' });
      button.focus();

      // Simulate Enter key
      fireEvent.keyDown(button, { key: 'Enter', code: 'Enter' });

      await waitFor(() => {
        expect(mockOnClick).toHaveBeenCalledTimes(1);
      });
    });
  });
});
