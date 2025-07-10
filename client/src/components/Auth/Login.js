import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { FiEye, FiEyeOff, FiUser, FiMail, FiLock } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../UI/LoadingSpinner';

const LoginContainer = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, ${props => props.theme.colors.primary}15 0%, ${props => props.theme.colors.secondary} 100%);
  padding: ${props => props.theme.spacing.lg};
`;

const LoginCard = styled.div`
  background: ${props => props.theme.colors.surface};
  border-radius: 12px;
  box-shadow: ${props => props.theme.shadows.heavy};
  padding: ${props => props.theme.spacing.xxl};
  width: 100%;
  max-width: 400px;
  border: 1px solid ${props => props.theme.colors.border};
`;

const Logo = styled.div`
  text-align: center;
  margin-bottom: ${props => props.theme.spacing.xl};
`;

const LogoIcon = styled.div`
  width: 60px;
  height: 60px;
  background: ${props => props.theme.colors.primary};
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto ${props => props.theme.spacing.md};
  color: white;
  font-size: 24px;
  font-weight: bold;
`;

const Title = styled.h1`
  color: ${props => props.theme.colors.text};
  font-size: 24px;
  font-weight: 600;
  margin-bottom: ${props => props.theme.spacing.sm};
`;

const Subtitle = styled.p`
  color: ${props => props.theme.colors.textSecondary};
  font-size: 14px;
  margin-bottom: ${props => props.theme.spacing.xl};
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.lg};
`;

const InputGroup = styled.div`
  position: relative;
`;

const InputLabel = styled.label`
  display: block;
  color: ${props => props.theme.colors.text};
  font-weight: 500;
  margin-bottom: ${props => props.theme.spacing.sm};
  font-size: 14px;
`;

const InputWrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;
`;

const Input = styled.input`
  width: 100%;
  padding: ${props => props.theme.spacing.md} ${props => props.theme.spacing.lg};
  padding-left: ${props => props.hasIcon ? '44px' : props.theme.spacing.lg};
  padding-right: ${props => props.hasAction ? '44px' : props.theme.spacing.lg};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius};
  background: ${props => props.theme.colors.background};
  color: ${props => props.theme.colors.text};
  font-size: 16px;
  transition: all 0.3s ease;

  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary};
    box-shadow: 0 0 0 3px ${props => props.theme.colors.primary}20;
  }

  &::placeholder {
    color: ${props => props.theme.colors.textSecondary};
  }
`;

const InputIcon = styled.div`
  position: absolute;
  left: ${props => props.theme.spacing.md};
  color: ${props => props.theme.colors.textSecondary};
  pointer-events: none;
`;

const PasswordToggle = styled.button`
  position: absolute;
  right: ${props => props.theme.spacing.md};
  background: none;
  border: none;
  color: ${props => props.theme.colors.textSecondary};
  cursor: pointer;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    color: ${props => props.theme.colors.text};
  }
`;

const SubmitButton = styled.button`
  width: 100%;
  padding: ${props => props.theme.spacing.md} ${props => props.theme.spacing.lg};
  background: ${props => props.theme.colors.primary};
  color: white;
  border: none;
  border-radius: ${props => props.theme.borderRadius};
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${props => props.theme.spacing.sm};

  &:hover:not(:disabled) {
    background: ${props => props.theme.colors.primaryHover};
    transform: translateY(-1px);
    box-shadow: ${props => props.theme.shadows.medium};
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

const GuestButton = styled.button`
  width: 100%;
  padding: ${props => props.theme.spacing.md} ${props => props.theme.spacing.lg};
  background: transparent;
  color: ${props => props.theme.colors.textSecondary};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius};
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${props => props.theme.spacing.sm};

  &:hover:not(:disabled) {
    background: ${props => props.theme.colors.secondary};
    color: ${props => props.theme.colors.text};
    border-color: ${props => props.theme.colors.primary};
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const Divider = styled.div`
  display: flex;
  align-items: center;
  margin: ${props => props.theme.spacing.lg} 0;
  
  &::before,
  &::after {
    content: '';
    flex: 1;
    height: 1px;
    background: ${props => props.theme.colors.border};
  }

  span {
    margin: 0 ${props => props.theme.spacing.md};
    color: ${props => props.theme.colors.textSecondary};
    font-size: 12px;
    font-weight: 500;
  }
`;

const Footer = styled.div`
  text-align: center;
  margin-top: ${props => props.theme.spacing.xl};
`;

const FooterText = styled.p`
  color: ${props => props.theme.colors.textSecondary};
  font-size: 14px;
`;

const FooterLink = styled(Link)`
  color: ${props => props.theme.colors.primary};
  font-weight: 600;
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
`;

const ErrorMessage = styled.div`
  background: ${props => props.theme.colors.error}15;
  border: 1px solid ${props => props.theme.colors.error}30;
  color: ${props => props.theme.colors.error};
  padding: ${props => props.theme.spacing.md};
  border-radius: ${props => props.theme.borderRadius};
  font-size: 14px;
  margin-bottom: ${props => props.theme.spacing.lg};
`;

function Login() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const { loginUser, loginAsGuest } = useAuth();
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError(''); // Clear error when user starts typing
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password) {
      setError('Please fill in all fields');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const result = await loginUser(formData.email, formData.password);
      
      if (result.success) {
        toast.success('Welcome back!');
        navigate('/dashboard');
      } else {
        setError(result.error);
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGuestLogin = async () => {
    setIsLoading(true);
    setError('');

    try {
      const result = await loginAsGuest();
      
      if (result.success) {
        toast.success('Welcome, guest!');
        navigate('/dashboard');
      } else {
        setError(result.error);
      }
    } catch (error) {
      console.error('Guest login error:', error);
      setError('Failed to create guest account. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <LoadingSpinner fullscreen text="Signing you in..." />;
  }

  return (
    <LoginContainer>
      <LoginCard>
        <Logo>
          <LogoIcon>📝</LogoIcon>
          <Title>Welcome Back</Title>
          <Subtitle>Sign in to your collaborative workspace</Subtitle>
        </Logo>

        {error && <ErrorMessage>{error}</ErrorMessage>}

        <Form onSubmit={handleSubmit}>
          <InputGroup>
            <InputLabel htmlFor="email">Email Address</InputLabel>
            <InputWrapper>
              <InputIcon>
                <FiMail size={16} />
              </InputIcon>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleInputChange}
                hasIcon
                required
              />
            </InputWrapper>
          </InputGroup>

          <InputGroup>
            <InputLabel htmlFor="password">Password</InputLabel>
            <InputWrapper>
              <InputIcon>
                <FiLock size={16} />
              </InputIcon>
              <Input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleInputChange}
                hasIcon
                hasAction
                required
              />
              <PasswordToggle
                type="button"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
              </PasswordToggle>
            </InputWrapper>
          </InputGroup>

          <SubmitButton type="submit" disabled={isLoading}>
            {isLoading ? 'Signing In...' : 'Sign In'}
          </SubmitButton>
        </Form>

        <Divider>
          <span>OR</span>
        </Divider>

        <GuestButton onClick={handleGuestLogin} disabled={isLoading}>
          <FiUser size={16} />
          Continue as Guest
        </GuestButton>

        <Footer>
          <FooterText>
            Don't have an account?{' '}
            <FooterLink to="/register">Sign up here</FooterLink>
          </FooterText>
        </Footer>
      </LoginCard>
    </LoginContainer>
  );
}

export default Login;