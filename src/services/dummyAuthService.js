import { dummyUsers } from '../data/userDummyData.js';

// Simulates POST /api/v1/auth/register
export const dummyRegister = (formData) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const exists = dummyUsers.find(
        (u) => u.email === formData.email || u.phone === formData.phone,
      );
      if (exists) {
        reject({ message: 'User with this email or phone already exists.' });
        return;
      }
      const username = `LIC-0034${dummyUsers.length + 2}`;
      const temporaryPassword = 'NewPass@123';
      dummyUsers.push({
        userId: `uuid-new-${Date.now()}`,
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        username,
        temporaryPassword,
        accessToken: `dummy-access-token-${dummyUsers.length}`,
        refreshToken: `dummy-refresh-token-${dummyUsers.length}`,
        hasActiveEnrollment: false,
      });
      resolve({
        success: true,
        data: {
          message:
            'Registration successful. Please log in with the credentials below.',
          username,
          temporaryPassword,
        },
      });
    }, 800);
  });
};

// Simulates POST /api/v1/auth/login
export const dummyLogin = (credentials) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const user = dummyUsers.find(
        (u) =>
          u.username === credentials.username &&
          u.temporaryPassword === credentials.password,
      );
      if (!user) {
        reject({ message: 'Invalid username or password.' });
        return;
      }
      resolve({
        success: true,
        data: {
          accessToken: user.accessToken,
          refreshToken: user.refreshToken,
          user: {
            userId: user.userId,
            username: user.username,
            fullName: user.fullName,
            email: user.email,
            hasActiveEnrollment: user.hasActiveEnrollment,
          },
        },
      });
    }, 800);
  });
};
