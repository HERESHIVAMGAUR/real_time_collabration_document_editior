import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { FiEdit3, FiUser, FiLock, FiMail } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../UI/LoadingSpinner';

const RegisterContainer = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: ${props => props.theme.spacing.lg};
`;

const RegisterCard = styled.div`
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

  &:hover {
    background: ${props => props.theme.colors.primaryHover};
  }

  &:disabled {
    background: ${props => props.theme.colors.border};
    cursor: not-allowed;
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

const ValidationMessage = styled.div`
  color: ${props => props.theme.colors.error};
  font-size: 12px;
  margin-top: ${props => props.theme.spacing.xs};
  margin-left: ${props => props.theme.spacing.sm};
`;

function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [validationErrors, setValidationErrors] = useState({});
  const { register, loading, error } = useAuth();
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });

    // Clear validation error for this field
    if (validationErrors[name]) {
      setValidationErrors({
        ...validationErrors,
        [name]: ''
      });
    }
  };

  const validateForm = () => {
    const errors = {};

    // Name validation
    if (!formData.name.trim()) {
      errors.name = 'Name is required';
    } else if (formData.name.trim().length < 2) {
      errors.name = 'Name must be at least 2 characters';
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email) {
      errors.email = 'Email is required';
    } else if (!emailRegex.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }

    // Password validation
    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      errors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const result = await register(formData.name, formData.email, formData.password);
    if (result.success) {
      navigate('/dashboard');
    }
  };

  if (loading) {
    return <LoadingSpinner fullscreen text="Creating your account..." />;
  }

  return (
    <RegisterContainer>
      <RegisterCard>
        <Header>
          <Logo>
            <LogoIcon />
            <Title>DocuCollab</Title>
          </Logo>
          <Subtitle>Create your account to start collaborating</Subtitle>
        </Header>

        {error && <ErrorMessage>{error}</ErrorMessage>}

        <Form onSubmit={handleSubmit}>
          <InputGroup>
            <InputIcon>
              <FiUser />
            </InputIcon>
            <Input
              type="text"
              name="name"
              placeholder="Full name"
              value={formData.name}
              onChange={handleInputChange}
              required
            />
            {validationErrors.name && (
              <ValidationMessage>{validationErrors.name}</ValidationMessage>
            )}
          </InputGroup>

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
            {validationErrors.email && (
              <ValidationMessage>{validationErrors.email}</ValidationMessage>
            )}
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
            {validationErrors.password && (
              <ValidationMessage>{validationErrors.password}</ValidationMessage>
            )}
          </InputGroup>

          <InputGroup>
            <InputIcon>
              <FiLock />
            </InputIcon>
            <Input
              type="password"
              name="confirmPassword"
              placeholder="Confirm password"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              required
            />
            {validationErrors.confirmPassword && (
              <ValidationMessage>{validationErrors.confirmPassword}</ValidationMessage>
            )}
          </InputGroup>

          <Button type="submit" disabled={loading}>
            Create Account
          </Button>
        </Form>

        <Footer>
          Already have an account?{' '}
          <Link to="/login">Sign in here</Link>
        </Footer>
      </RegisterCard>
    </RegisterContainer>
  );
}

export default Register;