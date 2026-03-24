import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle, Loader2, Mail } from 'lucide-react';
import AppNav from '@/components/AppNav';
import { apiClient } from '@/integrations/api/client';

const VerifyEmail = () => {
  const { uid, token } = useParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        const response = await apiClient.verifyEmail(uid, token);
        
        if (response.success) {
          setStatus('success');
          setMessage('Your email has been successfully verified! You can now log in.');
          
          // Redirect to login after 3 seconds
          setTimeout(() => {
            navigate('/auth');
          }, 3000);
        } else {
          setStatus('error');
          setMessage(response.error || 'Email verification failed. Please try again.');
        }
      } catch (error: any) {
        setStatus('error');
        setMessage(
          error.response?.data?.error || 
          'Email verification failed. The link may have expired or is invalid.'
        );
      }
    };

    if (uid && token) {
      verifyEmail();
    } else {
      setStatus('error');
      setMessage('Invalid verification link.');
    }
  }, [uid, token, navigate]);

  const handleResendEmail = async () => {
    setStatus('loading');
    setMessage('Sending new verification email...');
    
    try {
      const response = await apiClient.resendVerification();
      
      if (response.success) {
        setStatus('success');
        setMessage('New verification email sent! Please check your inbox.');
      } else {
        setStatus('error');
        setMessage(response.error || 'Failed to resend verification email.');
      }
    } catch (error: any) {
      setStatus('error');
      setMessage(error.response?.data?.error || 'Failed to resend verification email.');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <AppNav />
      
      <div className="container mx-auto px-4 py-20">
        <div className="max-w-md mx-auto">
          <div className="bg-card border border-border rounded-2xl p-8 text-center">
            {/* Icon */}
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
              {status === 'loading' && <Loader2 className="w-10 h-10 text-primary animate-spin" />}
              {status === 'success' && <CheckCircle className="w-10 h-10 text-green-500" />}
              {status === 'error' && <XCircle className="w-10 h-10 text-red-500" />}
            </div>

            {/* Title */}
            <h1 className="font-display text-2xl font-bold text-foreground mb-4">
              {status === 'loading' && 'Verifying Your Email...'}
              {status === 'success' && 'Email Verified!'}
              {status === 'error' && 'Verification Failed'}
            </h1>

            {/* Message */}
            <p className="font-body text-muted-foreground mb-8">
              {message}
            </p>

            {/* Actions */}
            <div className="space-y-4">
              {status === 'success' && (
                <button
                  onClick={() => navigate('/auth')}
                  className="w-full bg-primary text-primary-foreground px-6 py-3 rounded-xl font-body font-medium hover:bg-primary/90 transition-colors"
                >
                  Go to Login
                </button>
              )}

              {status === 'error' && (
                <>
                  <button
                    onClick={handleResendEmail}
                    className="w-full bg-primary text-primary-foreground px-6 py-3 rounded-xl font-body font-medium hover:bg-primary/90 transition-colors"
                  >
                    Resend Verification Email
                  </button>
                  
                  <button
                    onClick={() => navigate('/auth')}
                    className="w-full bg-secondary text-foreground px-6 py-3 rounded-xl font-body font-medium hover:bg-secondary/80 transition-colors"
                  >
                    Back to Login
                  </button>
                </>
              )}
            </div>

            {/* Help Text */}
            {status === 'error' && (
              <div className="mt-8 p-4 bg-muted rounded-xl">
                <div className="flex items-start gap-3">
                  <Mail className="w-5 h-5 text-muted-foreground mt-0.5" />
                  <div className="text-left">
                    <p className="font-body text-sm text-muted-foreground">
                      <strong>Troubleshooting:</strong>
                    </p>
                    <ul className="font-body text-xs text-muted-foreground mt-1 space-y-1">
                      <li>• Check if the verification link has expired (24 hours)</li>
                      <li>• Make sure you clicked the complete link</li>
                      <li>• Check your spam folder for the email</li>
                      <li>• Try resending the verification email</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;
