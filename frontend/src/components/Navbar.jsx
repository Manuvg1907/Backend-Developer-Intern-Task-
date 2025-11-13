import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import '../styles/Navbar.css';

export const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isAdmin = user?.role === 'admin';

  return (
    <nav className={`navbar ${isAdmin ? 'navbar-admin' : 'navbar-user'}`}>
      <div className="navbar-container">
        <div className="navbar-brand">
          <h1 className="navbar-title">
            {isAdmin ? '⚙️ Admin Control Panel' : '🛒 Product Marketplace'}
          </h1>
        </div>

        <div className="navbar-content">
          <div className="navbar-links">
            {isAdmin ? (
              <>
                <button
                  className={`nav-link ${location.pathname === '/admin' ? 'active' : ''}`}
                  onClick={() => navigate('/admin')}
                >
                  📊 Dashboard
                </button>
              </>
            ) : (
              <>
                <button
                  className={`nav-link ${location.pathname === '/dashboard' && !location.search ? 'active' : ''}`}
                  onClick={() => navigate('/dashboard')}
                >
                  📦 Marketplace
                </button>
              </>
            )}
          </div>

          <div className="navbar-user-info">
            <div className="user-greeting">
              <span className="greeting-text">Welcome, <strong>{user?.name}</strong></span>
              <div className="role-badge" style={{
                background: isAdmin ? '#ff6b6b' : '#51cf66',
                color: 'white'
              }}>
                {isAdmin ? '👨‍💼 ADMIN' : '👤 USER'}
              </div>
            </div>
            <button className="logout-btn" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
