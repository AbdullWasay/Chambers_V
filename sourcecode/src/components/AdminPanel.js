import React, { useState } from 'react';
import { CognitoIdentityProviderClient, ListUsersCommand } from '@aws-sdk/client-cognito-identity-provider';

const AdminPanel = () => {
  const [userStats, setUserStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchUserStats = async () => {
    setLoading(true);
    setError('');

    try {
      // Note: This requires AWS credentials to be configured
      // In production, you'd want to call a backend API instead
      const client = new CognitoIdentityProviderClient({ 
        region: process.env.REACT_APP_COGNITO_REGION || 'us-west-2'
      });

      const command = new ListUsersCommand({
        UserPoolId: process.env.REACT_APP_COGNITO_USER_POOL_ID,
        Limit: 60
      });

      let allUsers = [];
      let paginationToken = null;

      do {
        if (paginationToken) {
          command.input.PaginationToken = paginationToken;
        }

        const response = await client.send(command);
        allUsers = allUsers.concat(response.Users);
        paginationToken = response.PaginationToken;
      } while (paginationToken);

      // Calculate statistics
      const statusCounts = allUsers.reduce((acc, user) => {
        acc[user.UserStatus] = (acc[user.UserStatus] || 0) + 1;
        return acc;
      }, {});

      const recentUsers = allUsers
        .sort((a, b) => new Date(b.UserCreateDate) - new Date(a.UserCreateDate))
        .slice(0, 10)
        .map(user => ({
          username: user.Username,
          email: user.Attributes.find(attr => attr.Name === 'email')?.Value || 'No email',
          status: user.UserStatus,
          created: new Date(user.UserCreateDate).toLocaleDateString()
        }));

      setUserStats({
        totalUsers: allUsers.length,
        statusCounts,
        recentUsers
      });

    } catch (err) {
      setError(`Error fetching user data: ${err.message}`);
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      padding: '20px', 
      maxWidth: '800px', 
      margin: '0 auto',
      fontFamily: 'Arial, sans-serif'
    }}>
      <h2>User Pool Statistics</h2>
      
      <button 
        onClick={fetchUserStats}
        disabled={loading}
        style={{
          padding: '10px 20px',
          backgroundColor: '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: loading ? 'not-allowed' : 'pointer',
          marginBottom: '20px'
        }}
      >
        {loading ? 'Loading...' : 'Fetch User Statistics'}
      </button>

      {error && (
        <div style={{ 
          color: 'red', 
          backgroundColor: '#fee', 
          padding: '10px', 
          borderRadius: '5px',
          marginBottom: '20px'
        }}>
          {error}
          <br />
          <small>
            Note: This requires AWS credentials. In production, use a backend API instead.
          </small>
        </div>
      )}

      {userStats && (
        <div>
          <div style={{ 
            backgroundColor: '#f8f9fa', 
            padding: '15px', 
            borderRadius: '5px',
            marginBottom: '20px'
          }}>
            <h3>Total Users: {userStats.totalUsers}</h3>
            
            <h4>Users by Status:</h4>
            <ul>
              {Object.entries(userStats.statusCounts).map(([status, count]) => (
                <li key={status}>
                  <strong>{status}:</strong> {count}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4>Recent Users:</h4>
            <table style={{ 
              width: '100%', 
              borderCollapse: 'collapse',
              backgroundColor: 'white'
            }}>
              <thead>
                <tr style={{ backgroundColor: '#e9ecef' }}>
                  <th style={{ padding: '10px', border: '1px solid #ddd' }}>Username</th>
                  <th style={{ padding: '10px', border: '1px solid #ddd' }}>Email</th>
                  <th style={{ padding: '10px', border: '1px solid #ddd' }}>Status</th>
                  <th style={{ padding: '10px', border: '1px solid #ddd' }}>Created</th>
                </tr>
              </thead>
              <tbody>
                {userStats.recentUsers.map((user, index) => (
                  <tr key={index}>
                    <td style={{ padding: '10px', border: '1px solid #ddd' }}>{user.username}</td>
                    <td style={{ padding: '10px', border: '1px solid #ddd' }}>{user.email}</td>
                    <td style={{ padding: '10px', border: '1px solid #ddd' }}>{user.status}</td>
                    <td style={{ padding: '10px', border: '1px solid #ddd' }}>{user.created}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
