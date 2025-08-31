import React from 'react';
import { render, screen, fireEvent } from '@/__tests__/utils/test-utils';
import { ErrorBoundary } from '../ErrorBoundary';

// Component that throws an error for testing
const ThrowError = ({ shouldThrow = false }: { shouldThrow?: boolean }) => {
  if (shouldThrow) {
    throw new Error('Test error for ErrorBoundary');
  }
  return <div>No error</div>;
};

describe('ErrorBoundary', () => {
  beforeEach(() => {
    // Suppress console.error for expected errors in tests
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renders children when there is no error', () => {
    render(
      <ErrorBoundary>
        <div>Test content</div>
      </ErrorBoundary>
    );

    expect(screen.getByText('Test content')).toBeInTheDocument();
  });

  it('renders error UI when child throws an error', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    expect(
      screen.getByText(/An unexpected error occurred/)
    ).toBeInTheDocument();
    expect(screen.getByText('Try Again')).toBeInTheDocument();
    expect(screen.getByText('Refresh Page')).toBeInTheDocument();
  });

  it('displays error details when expanded', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    const detailsElement = screen.getByText('Error details');
    expect(detailsElement).toBeInTheDocument();

    fireEvent.click(detailsElement);

    expect(
      screen.getByText(/Test error for ErrorBoundary/)
    ).toBeInTheDocument();
  });

  it('handles try again button click correctly', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.getByText('Something went wrong')).toBeInTheDocument();

    const tryAgainButton = screen.getByText('Try Again');

    // The button should be clickable and not cause errors
    expect(() => fireEvent.click(tryAgainButton)).not.toThrow();

    // After clicking try again, the button should still be visible
    // The ErrorBoundary will re-render and catch the error again
    expect(screen.getByText('Try Again')).toBeInTheDocument();
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
  });

  it('handles refresh page button click', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    const refreshButton = screen.getByText('Refresh Page');
    fireEvent.click(refreshButton);

    // The refresh button should be clickable and not cause errors
    expect(refreshButton).toBeInTheDocument();
  });

  it('renders custom fallback when provided', () => {
    const customFallback = <div>Custom error message</div>;

    render(
      <ErrorBoundary fallback={customFallback}>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.getByText('Custom error message')).toBeInTheDocument();
    expect(screen.queryByText('Something went wrong')).not.toBeInTheDocument();
  });

  it('logs error to console when error occurs', () => {
    const consoleSpy = jest
      .spyOn(console, 'error')
      .mockImplementation(() => {});

    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(consoleSpy).toHaveBeenCalledWith(
      'ErrorBoundary caught an error:',
      expect.any(Error),
      expect.any(Object)
    );

    consoleSpy.mockRestore();
  });

  it('handles multiple error states correctly', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.getByText('Something went wrong')).toBeInTheDocument();

    // Test that the error boundary maintains its error state
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
  });

  it('maintains error state until manually reset', () => {
    const { rerender } = render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.getByText('Something went wrong')).toBeInTheDocument();

    // Try to render without error (should still show error UI)
    rerender(
      <ErrorBoundary>
        <ThrowError shouldThrow={false} />
      </ErrorBoundary>
    );

    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
  });

  it('has proper accessibility attributes', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    // Check for proper button roles
    expect(
      screen.getByRole('button', { name: 'Try Again' })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Refresh Page' })
    ).toBeInTheDocument();

    // Check for proper details/summary structure
    const detailsElement = screen.getByText('Error details');
    expect(detailsElement.closest('details')).toBeInTheDocument();

    // Check that the error title is visible and accessible
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
  });

  it('handles async errors correctly', async () => {
    const AsyncErrorComponent = () => {
      const [shouldThrow, setShouldThrow] = React.useState(false);

      React.useEffect(() => {
        if (shouldThrow) {
          throw new Error('Async error');
        }
      }, [shouldThrow]);

      return (
        <div>
          <button onClick={() => setShouldThrow(true)}>Trigger Error</button>
          <div>No error</div>
        </div>
      );
    };

    render(
      <ErrorBoundary>
        <AsyncErrorComponent />
      </ErrorBoundary>
    );

    expect(screen.getByText('No error')).toBeInTheDocument();

    const triggerButton = screen.getByText('Trigger Error');
    fireEvent.click(triggerButton);

    // Error should be caught by ErrorBoundary
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
  });
});
