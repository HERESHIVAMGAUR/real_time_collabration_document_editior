import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { FiEdit3, FiLogOut, FiUser, FiMoon, FiSun, FiHome } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';

const HeaderContainer = styled.header`
  background: ${props => props.theme.colors.surface};
  border-bottom: 1px solid ${props => props.theme.colors.border};
  padding: 0 ${props => props.theme.spacing.lg};
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 60px;
  position: sticky;
  top: 0;
  z-index: 100;
`;

const LeftSection = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.lg};
`;

const Logo = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};
  cursor: pointer;
  color: ${props => props.theme.colors.primary};
  font-weight: 600;
  font-size: 18px;

  &:hover {
    opacity: 0.8;
  }
`;

const LogoIcon = styled(FiEdit3)`
  font-size: 24px;
`;

const Nav = styled.nav`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.md};
`;

const NavButton = styled.button`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};
  padding: ${props => props.theme.spacing.sm} ${props => props.theme.spacing.md};
  background: ${props => props.active ? props.theme.colors.primary : 'transparent'};
  color: ${props => props.active ? 'white' : props.theme.colors.text};
  border: none;
  border-radius: ${props => props.theme.borderRadius};
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s ease;

  &:hover {
    background: ${props => props.active ? props.theme.colors.primaryHover : props.theme.colors.secondary};
  }
`;

const RightSection = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.md};
`;

const UserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};
  padding: ${props => props.theme.spacing.sm} ${props => props.theme.spacing.md};
  background: ${props => props.theme.colors.secondary};
  border-radius: ${props => props.theme.borderRadius};
`;

const UserAvatar = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: ${props => props.color || props.theme.colors.primary};
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
  font-size: 14px;
`;

const UserName = styled.span`
  color: ${props => props.theme.colors.text};
  font-weight: 500;
  font-size: 14px;
  max-width: 120px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const IconButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  background: transparent;
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius};
  color: ${props => props.theme.colors.textSecondary};
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: ${props => props.theme.colors.secondary};
    color: ${props => props.theme.colors.text};
  }
`;

const LogoutButton = styled(IconButton)`
  color: ${props => props.theme.colors.error};
  border-color: ${props => props.theme.colors.error}30;

  &:hover {
    background: ${props => props.theme.colors.error}10;
    color: ${props => props.theme.colors.error};
  }
`;

function Header() {
  const { user, logout, updateUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogoClick = () => {
    navigate('/dashboard');
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const toggleTheme = () => {
    const newTheme = user?.preferences?.theme === 'dark' ? 'light' : 'dark';
    updateUser({
      preferences: {
        ...user?.preferences,
        theme: newTheme
      }
    });
  };

  const getInitials = (name) => {
    return name
      ?.split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2) || 'U';
  };

  const isActive = (path) => location.pathname === path;

  return (
    <HeaderContainer>
      <LeftSection>
        <Logo onClick={handleLogoClick}>
          <LogoIcon />
          DocuCollab
        </Logo>
        
        <Nav>
          <NavButton
            active={isActive('/dashboard')}
            onClick={() => navigate('/dashboard')}
          >
            <FiHome size={16} />
            Dashboard
          </NavButton>
        </Nav>
      </LeftSection>

      <RightSection>
        <IconButton onClick={toggleTheme} title="Toggle theme">
          {user?.preferences?.theme === 'dark' ? <FiSun size={16} /> : <FiMoon size={16} />}
        </IconButton>

        <UserInfo>
          <UserAvatar color={user?.color}>
            {user?.avatar ? (
              <img src={user.avatar} alt={user.name} style={{ width: '100%', height: '100%', borderRadius: '50%' }} />
            ) : (
              getInitials(user?.name)
            )}
          </UserAvatar>
          <UserName>{user?.name}</UserName>
          {user?.isGuest && (
            <span style={{ 
              fontSize: '10px', 
              background: '#ffa500', 
              color: 'white', 
              padding: '2px 6px', 
              borderRadius: '10px',
              marginLeft: '4px'
            }}>
              GUEST
            </span>
          )}
        </UserInfo>

        <LogoutButton onClick={handleLogout} title="Logout">
          <FiLogOut size={16} />
        </LogoutButton>
      </RightSection>
    </HeaderContainer>
  );
}

export default Header;