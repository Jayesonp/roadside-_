import React, { Component, ErrorInfo, ReactNode } from 'react';
import { View, Text, TouchableOpacity, Platform, StyleSheet } from 'react-native';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

/**
 * WebErrorBoundary - A specialized error boundary for web deployments
 * Catches runtime errors and displays a user-friendly error screen
 * with the option to reload the application
 */
export class WebErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error,
      errorInfo: null
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log the error to an error reporting service
    console.error('WebErrorBoundary caught an error:', error, errorInfo);
    this.setState({
      error,
      errorInfo
    });
  }

  handleReload = (): void => {
    // Reload the page
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      window.location.reload();
    } else {
      // Reset the error state for native platforms
      this.setState({
        hasError: false,
        error: null,
        errorInfo: null
      });
    }
  };

  render(): ReactNode {
    if (this.state.hasError) {
      // Render fallback UI
      return (
        <View style={styles.container}>
          <View style={styles.errorCard}>
            <Text style={styles.emoji}>🚗</Text>
            <Text style={styles.title}>RoadSide+ Encountered an Error</Text>
            <Text style={styles.message}>
              We're sorry, something went wrong while loading the application.
            </Text>
            
            {Platform.OS === 'web' && (
              <View style={styles.errorDetails}>
                <Text style={styles.errorText}>
                  {this.state.error?.toString() || 'Unknown error'}
                </Text>
              </View>
            )}
            
            <TouchableOpacity 
              style={styles.button} 
              onPress={this.handleReload}
            >
              <Text style={styles.buttonText}>Reload Application</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a', // slate-900
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  errorCard: {
    backgroundColor: '#1e293b', // slate-800
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 500,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  emoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 12,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    color: '#94a3b8', // slate-400
    marginBottom: 24,
    textAlign: 'center',
  },
  errorDetails: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    padding: 12,
    borderRadius: 8,
    width: '100%',
    marginBottom: 24,
  },
  errorText: {
    color: '#f87171', // red-400
    fontSize: 14,
    fontFamily: Platform.OS === 'web' ? 'monospace' : undefined,
  },
  button: {
    backgroundColor: '#3b82f6', // blue-500
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default WebErrorBoundary;
