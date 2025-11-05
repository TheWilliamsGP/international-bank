// import React, { createContext, useState, useContext, useEffect } from 'react';
// import api from '../utils/api';

// const AuthContext = createContext();

// export const useAuth = () => {
//   const context = useContext(AuthContext);
//   if (!context) {
//     throw new Error('useAuth must be used within an AuthProvider');
//   }
//   return context;
// };

// export const AuthProvider = ({ children }) => {
//   const [user, setUser] = useState(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const token = localStorage.getItem('token');
//     const userData = localStorage.getItem('user');
    
//     if (token && userData) {
//       // Verify token is still valid
//       try {
//         setUser(JSON.parse(userData));
        
//         // Optional: Verify token with backend
//         api.get('/auth/verify')
//           .catch(() => {
//             // Token is invalid, logout
//             logout();
//           });
//       } catch (error) {
//         logout();
//       }
//     }
//     setLoading(false);
//   }, []);

//   // const login = async (email, password) => {
//   //   try {
//   //     const response = await api.post('/auth/login', { email, password });
//   //     const { token, user: userData } = response.data;
      
//   //     localStorage.setItem('token', token);
//   //     localStorage.setItem('user', JSON.stringify(userData));
//   //     setUser(userData);
      
//     //  return { success: true };
//   //  } catch (error) {
//    //   return { 
//    //     success: false, 
//   //      error: error.response?.data?.error || 'Login failed' 
//    //   };
//    // }
//   //};

// //   return { success: true, user: userData };
// //   } catch (error) {
// //     return { 
// //       success: false, 
// //       error: error.response?.data?.error || 'Login failed' 
// //     };
// //   }
// // };

// const login = async (email, password) => {
//   try {
//     const response = await api.post('/auth/login', { email, password });
//     const token = response.data?.token;
//     const userData = response.data?.user;

//     if (!token || !userData) {
//       return { success: false, error: 'Invalid server response' };
//     }

//     localStorage.setItem('token', token);
//     localStorage.setItem('user', JSON.stringify(userData));
//     setUser(userData);

//     return { success: true, user: userData };
//   } catch (error) {
//     return { 
//       success: false, 
//       error: error.response?.data?.error || 'Login failed' 
//     };
//   }
// };


//   const register = async (userData) => {
//     try {
//       const response = await api.post('/auth/register', userData);
//       const { token, user: userDataFromServer } = response.data;
      
//       localStorage.setItem('token', token);
//       localStorage.setItem('user', JSON.stringify(userDataFromServer));
//       setUser(userDataFromServer);
      
//       return { success: true };
//     } catch (error) {
//       return { 
//         success: false, 
//         error: error.response?.data?.error || 'Registration failed' 
//       };
//     }
//   };

//   const logout = () => {
//     localStorage.removeItem('token');
//     localStorage.removeItem('user');
//     setUser(null);
//   };

//   const value = {
//     user,
//     login,
//     register,
//     logout,
//     loading
//   };

//   return (
//     <AuthContext.Provider value={value}>
//       {!loading && children}
//     </AuthContext.Provider>
//   );
// };
// src/context/AuthContext.jsx
import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../utils/api';
import { parseServerError } from '../utils/error';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Verify token on mount and restore user from localStorage
  useEffect(() => {
    let mounted = true;
    const verifyUser = async () => {
      const token = localStorage.getItem('token');
      const userData = localStorage.getItem('user');

      if (token && userData) {
        try {
          setUser(JSON.parse(userData));
          // Optional: verify token with backend; api has interceptor to attach token
          await api.get('/auth/verify');
        } catch (err) {
          // token invalid or verification failed -> logout
          console.warn('Token verification failed, logging out:', err);
          logout();
        }
      }
      if (mounted) setLoading(false);
    };

    verifyUser();
    return () => { mounted = false; };
  }, []);

  // LOGIN: returns { success: boolean, user?, error? } where error is a string
  const login = async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      const token = response.data?.token;
      const userData = response.data?.user;

      if (!token || !userData) {
        return { success: false, error: 'Invalid server response' };
      }

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);

      return { success: true, user: userData };
    } catch (err) {
      const message = parseServerError(err);
      return { success: false, error: message };
    }
  };

  // REGISTER: returns { success: boolean, user?, error? } where error is a string
  const register = async (userData) => {
    try {
      const response = await api.post('/auth/register', userData);
      const token = response.data?.token;
      const userFromServer = response.data?.user;

      if (!token || !userFromServer) {
        return { success: false, error: 'Invalid server response' };
      }

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userFromServer));
      setUser(userFromServer);

      return { success: true, user: userFromServer };
    } catch (err) {
      const message = parseServerError(err);
      return { success: false, error: message };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  const value = {
    user,
    login,
    register,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
