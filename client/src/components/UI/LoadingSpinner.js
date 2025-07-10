import React from 'react';
import styled, { keyframes } from 'styled-components';

const spin = keyframes`
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
`;

// Use transient prop ($fullscreen) to avoid forwarding to DOM
const SpinnerContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: ${props => props.$fullscreen ? '100vh' : '200px'};
  padding: ${props => props.theme?.spacing?.lg || '24px'};
`;

const Spinner = styled.div`
  width: ${props => props.$size || '40px'};
  height: ${props => props.$size || '40px'};
  border: 3px solid ${props => props.theme?.colors?.border || '#E0E0E0'};
  border-top: 3px solid ${props => props.theme?.colors?.primary || '#4A90E2'};
  border-radius: 50%;
  animation: ${spin} 1s linear infinite;
`;

const LoadingText = styled.p`
  margin-top: ${props => props.theme?.spacing?.md || '16px'};
  color: ${props => props.theme?.colors?.textSecondary || '#666666'};
  font-size: 14px;
  text-align: center;
`;

function LoadingSpinner({ size, text, fullscreen = false }) {
  return (
    <SpinnerContainer $fullscreen={fullscreen}>
      <div>
        <Spinner $size={size} />
        {text && <LoadingText>{text}</LoadingText>}
      </div>
    </SpinnerContainer>
  );
}

export default LoadingSpinner;