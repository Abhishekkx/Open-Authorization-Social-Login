import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { userAPI } from '../../services/api';

const AccountSettings = () => {
  const { user, refreshUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [authLogs, setAuthLogs] = useState([]);
  const [showLogs, setShowLogs] = useState(false);

  const [formData, setFormData] = useState({
    name: user?.name || '',
    avatar: user?.avatar || ''
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        avatar: user.avatar || ''
      });
    }
  }, [user]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      await userAPI.updateProfile(formData);
      await refreshUser();
      setMessage('Profile updated successfully!');
      setTimeout(() => setMessage(null), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleUnlinkProvider = async (provider) => {
    if (!confirm(`Are you sure you want to unlink your ${provider} account?`)) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await userAPI.unlinkProvider(provider);
      await refreshUser();
      setMessage(`${provider} account unlinked successfully!`);
      setTimeout(() => setMessage(null), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to unlink provider');
    } finally {
      setLoading(false);
    }
  };

  const loadAuthLogs = async () => {
    try {
      const response = await userAPI.getAuthLogs();
      setAuthLogs(response.data.logs);
      setShowLogs(true);
    } catch (err) {
      setError('Failed to load auth logs');
    }
  };

  return (
    <div className="settings-container">
      <div className="settings-header">
        <h1>Account Settings</h1>
        <p>Manage your profile and connected accounts</p>
      </div>

      {message && (
        <div className="success-banner">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
            <path d="M8 12L11 15L16 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          {message}
        </div>
      )}
      
      {error && (
        <div className="error-banner">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
            <path d="M12 8V12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            <circle cx="12" cy="16" r="1" fill="currentColor"/>
          </svg>
          {error}
        </div>
      )}

      <div className="settings-grid">
        {/* Profile Information Card */}
        <div className="settings-card">
          <div className="settings-card-header">
            <div className="settings-card-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div>
              <h2>Profile Information</h2>
              <p>Update your personal details</p>
            </div>
          </div>
          
          <form onSubmit={handleUpdateProfile} className="settings-form">
            <div className="form-group">
              <label htmlFor="name">Full Name</label>
              <input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="form-input"
                placeholder="Enter your name"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="avatar">Avatar URL</label>
              <input
                id="avatar"
                type="url"
                value={formData.avatar}
                onChange={(e) => setFormData({ ...formData, avatar: e.target.value })}
                className="form-input"
                placeholder="https://example.com/avatar.jpg"
              />
              <span className="form-hint">Provide a URL to your profile picture</span>
            </div>

            {formData.avatar && (
              <div className="avatar-preview">
                <span className="form-hint">Preview:</span>
                <img src={formData.avatar} alt="Avatar preview" />
              </div>
            )}

            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? (
                <>
                  <div className="btn-spinner"></div>
                  Updating...
                </>
              ) : (
                <>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  Update Profile
                </>
              )}
            </button>
          </form>
        </div>

        {/* Connected Accounts Card */}
        <div className="settings-card">
          <div className="settings-card-header">
            <div className="settings-card-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
            </div>
            <div>
              <h2>Connected Accounts</h2>
              <p>Manage your OAuth providers</p>
            </div>
          </div>

          <div className="connected-accounts-list">
            {['google', 'facebook'].map((provider) => {
              const isConnected = user?.providers?.includes(provider);
              const canUnlink = user?.providers?.length > 1;

              return (
                <div key={provider} className={`account-item ${isConnected ? 'connected' : 'disconnected'}`}>
                  <div className="account-info">
                    <div className={`account-icon account-icon-${provider}`}>
                      {provider === 'google' && (
                        <svg width="24" height="24" viewBox="0 0 24 24">
                          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                        </svg>
                      )}
                      {provider === 'facebook' && (
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="#1877F2">
                          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                        </svg>
                      )}
                    </div>
                    <div className="account-details">
                      <h3>{provider.charAt(0).toUpperCase() + provider.slice(1)}</h3>
                      <span className={`account-status ${isConnected ? 'status-connected' : 'status-disconnected'}`}>
                        {isConnected ? (
                          <>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                            </svg>
                            Connected
                          </>
                        ) : (
                          <>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                              <circle cx="12" cy="12" r="10" strokeWidth="2"/>
                              <path d="M15 9l-6 6M9 9l6 6" strokeWidth="2" strokeLinecap="round"/>
                            </svg>
                            Not Connected
                          </>
                        )}
                      </span>
                    </div>
                  </div>
                  {isConnected && (
                    <button
                      onClick={() => handleUnlinkProvider(provider)}
                      className="btn btn-unlink"
                      disabled={!canUnlink || loading}
                      title={!canUnlink ? 'Cannot unlink last provider' : 'Unlink this account'}
                    >
                      {loading ? 'Unlinking...' : 'Unlink'}
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          {user?.providers?.length === 1 && (
            <div className="settings-info-box">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <circle cx="12" cy="12" r="10" strokeWidth="2"/>
                <path d="M12 16v-4M12 8h.01" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              <p>You must have at least one connected account to access your profile.</p>
            </div>
          )}
        </div>

        {/* Authentication Logs Card */}
        <div className="settings-card full-width">
          <div className="settings-card-header">
            <div className="settings-card-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <h2>Authentication Logs</h2>
              <p>View your recent login activity</p>
            </div>
          </div>

          <button
            onClick={loadAuthLogs}
            className="btn btn-secondary"
            style={{ marginBottom: '24px' }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            {showLogs ? 'Refresh Logs' : 'View Auth Logs'}
          </button>

          {showLogs && authLogs.length > 0 && (
            <div className="logs-table-container">
              <table className="logs-table">
                <thead>
                  <tr>
                    <th>Action</th>
                    <th>Provider</th>
                    <th>Status</th>
                    <th>IP Address</th>
                    <th>Date & Time</th>
                  </tr>
                </thead>
                <tbody>
                  {authLogs.map((log) => (
                    <tr key={log._id}>
                      <td>
                        <span className="log-action">{log.action}</span>
                      </td>
                      <td>
                        <span className="log-provider">{log.provider || '-'}</span>
                      </td>
                      <td>
                        <span className={`log-status ${log.success ? 'status-success' : 'status-failed'}`}>
                          {log.success ? (
                            <>
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                              </svg>
                              Success
                            </>
                          ) : (
                            <>
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                <circle cx="12" cy="12" r="10" strokeWidth="2"/>
                                <path d="M15 9l-6 6M9 9l6 6" strokeWidth="2" strokeLinecap="round"/>
                              </svg>
                              Failed
                            </>
                          )}
                        </span>
                      </td>
                      <td>
                        <span className="log-ip">{log.ipAddress || '-'}</span>
                      </td>
                      <td>
                        <span className="log-date">{new Date(log.createdAt).toLocaleString()}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {showLogs && authLogs.length === 0 && (
            <div className="empty-state">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p>No authentication logs found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AccountSettings;
