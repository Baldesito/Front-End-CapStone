import React from "react";
import { Container, Alert, Button } from "react-bootstrap";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log the error to console or error reporting service
    console.error("ErrorBoundary caught an error:", error, errorInfo);
    this.setState({
      error: error,
      errorInfo: errorInfo,
    });
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
    window.location.href = "/";
  };

  render() {
    if (this.state.hasError) {
      return (
        <Container className="mt-5">
          <Alert variant="danger">
            <Alert.Heading>Oops! Qualcosa è andato storto</Alert.Heading>
            <p>
              Si è verificato un errore inaspettato. Per favore, riprova o torna
              alla homepage.
            </p>
            {this.state.error && (
              <details className="mt-3">
                <summary style={{ cursor: "pointer" }}>
                  Dettagli errore (per sviluppatori)
                </summary>
                <pre className="mt-2 p-3 bg-light rounded">
                  <code>
                    {this.state.error.toString()}
                    {"\n\n"}
                    {this.state.errorInfo?.componentStack}
                  </code>
                </pre>
              </details>
            )}
            <hr />
            <div className="d-flex justify-content-end">
              <Button variant="outline-danger" onClick={this.handleReset}>
                Torna alla Homepage
              </Button>
            </div>
          </Alert>
        </Container>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
