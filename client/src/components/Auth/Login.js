import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { FiEdit3, FiUser, FiLock, FiMail } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../UI/LoadingSpinner';

const LoginContainer = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: ${props => props.theme.spacing.lg};
`;

const LoginCard = styled.div`
  background: ${props => props.theme.colors.background};
  border-radius: 16px;
  box-shadow: ${props => props.theme.shadows.heavy};
  padding: ${props => props.theme.spacing.xxl};
  width: 100%;
  max-width: 400px;
  border: 1px solid ${props => props.theme.colors.border};
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: ${props => props.theme.spacing.xl};
`;

const Logo = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${props => props.theme.spacing.sm};
  margin-bottom: ${props => props.theme.spacing.lg};
`;

const LogoIcon = styled(FiEdit3)`
  font-size: 32px;
  color: ${props => props.theme.colors.primary};
`;

const Title = styled.h1`
  font-size: 28px;
  font-weight: 700;
  color: ${props => props.theme.colors.text};
  margin: 0;
`;

const Subtitle = styled.p`
  color: ${props => props.theme.colors.textSecondary};
  margin-top: ${props => props.theme.spacing.sm};
  font-size: 16px;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.lg};
`;

const InputGroup = styled.div`
  position: relative;
`;

const InputIcon = styled.div`
  position: absolute;
  left: 16px;
  top: 50%;
  transform: translateY(-50%);
  color: ${props => props.theme.colors.textSecondary};
  font-size: 18px;
`;

const Input = styled.input`
  width: 100%;
  padding: 16px 16px 16px 48px;
  border: 2px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius};
  font-size: 16px;
  background: ${props => props.theme.colors.surface};
  color: ${props => props.theme.colors.text};
  transition: border-color 0.2s ease;

  &:focus {
    border-color: ${props => props.theme.colors.primary};
    outline: none;
  }

  &::placeholder {
    color: ${props => props.theme.colors.textSecondary};
  }
`;

const Button = styled.button`
  width: 100%;
  padding: 16px;
  background: ${props => props.theme.colors.primary};
  color: white;
  border: none;
  border-radius: ${props => props.theme.borderRadius};
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${props => props.theme.spacing.sm};

  &:hover {
    background: ${props => props.theme.colors.primaryHover};
  }

  &:disabled {
    background: ${props => props.theme.colors.border};
    cursor: not-allowed;
  }
`;

const GuestButton = styled(Button)`
  background: ${props => props.theme.colors.secondary};
  color: ${props => props.theme.colors.text};
  margin-top: ${props => props.theme.spacing.md};

  &:hover {
    background: ${props => props.theme.colors.border};
  }
`;

const Divider = styled.div`
  text-align: center;
  margin: ${props => props.theme.spacing.lg} 0;
  position: relative;
  color: ${props => props.theme.colors.textSecondary};

  &::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 0;
    right: 0;
    height: 1px;
    background: ${props => props.theme.colors.border};
    z-index: 1;
  }

  span {
    background: ${props => props.theme.colors.background};
    padding: 0 ${props => props.theme.spacing.md};
    position: relative;
    z-index: 2;
  }
`;

const Footer = styled.div`
  text-align: center;
  margin-top: ${props => props.theme.spacing.xl};
  color: ${props => props.theme.colors.textSecondary};

  a {
    color: ${props => props.theme.colors.primary};
    text-decoration: none;
    font-weight: 600;

    &:hover {
      text-decoration: underline;
    }
  }
`;

const ErrorMessage = styled.div`
  background: ${props => props.theme.colors.error}15;
  border: 1px solid ${props => props.theme.colors.error}30;
  color: ${props => props.theme.colors.error};
  padding: ${props => props.theme.spacing.md};
  border-radius: ${props => props.theme.borderRadius};
  margin-bottom: ${props => props.theme.spacing.lg};
  font-size: 14px;
`;

function Login() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [guestName, setGuestName] = useState('');
  const [showGuestForm, setShowGuestForm] = useState(false);
  const { login, loginAsGuest, loading, error } = useAuth();
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await login(formData.email, formData.password);
    if (result.success) {
      navigate('/dashboard');
    }
  };

  const handleGuestLogin = async (e) => {
    e.preventDefault();
    const result = await loginAsGuest(guestName || 'Guest User');
    if (result.success) {
      navigate('/dashboard');
    }
  };

  if (loading) {
    return <LoadingSpinner fullscreen text="Signing you in..." />;
  }

  return (
    <LoginContainer>
      <LoginCard>
        <Header>
          <Logo>
            <LogoIcon />
            <Title>DocuCollab</Title>
          </Logo>
          <Subtitle>Collaborate on documents in real-time</Subtitle>
        </Header>

        {error && <ErrorMessage>{error}</ErrorMessage>}

        {!showGuestForm ? (
          <>
            <Form onSubmit={handleSubmit}>
              <InputGroup>
                <InputIcon>
                  <FiMail />
                </InputIcon>
                <Input
                  type="email"
                  name="email"
                  placeholder="Email address"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
              </InputGroup>

              <InputGroup>
                <InputIcon>
                  <FiLock />
                </InputIcon>
                <Input
                  type="password"
                  name="password"
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                />
              </InputGroup>

              <Button type="submit" disabled={loading}>
                Sign In
              </Button>
            </Form>

            <Divider>
              <span>or</span>
            </Divider>

            <GuestButton
              type="button"
              onClick={() => setShowGuestForm(true)}
            >
              <FiUser />
              Continue as Guest
            </GuestButton>
          </>
        ) : (
          <Form onSubmit={handleGuestLogin}>
            <InputGroup>
              <InputIcon>
                <FiUser />
              </InputIcon>
              <Input
                type="text"
                placeholder="Enter your name (optional)"
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
              />
            </InputGroup>

            <Button type="submit" disabled={loading}>
              Continue as Guest
            </Button>

            <GuestButton
              type="button"
              onClick={() => setShowGuestForm(false)}
            >
              Back to Login
            </GuestButton>
          </Form>
        )}

        <Footer>
          Don't have an account?{' '}
          <Link to="/register">Create one here</Link>
        </Footer>
      </LoginCard>
    </LoginContainer>
  );
}

export default Login;