import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface TrackedUser {
  username: string;
  addedAt: number;
  lastUpdated?: number;
}

interface UserContextType {
  trackedUsers: TrackedUser[];
  addUser: (username: string) => void;
  removeUser: (username: string) => void;
  isUserTracked: (username: string) => boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [trackedUsers, setTrackedUsers] = useState<TrackedUser[]>([]);

  // Load from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('trackedUsers');
    if (stored) {
      setTrackedUsers(JSON.parse(stored));
    }
  }, []);

  // Save to localStorage whenever trackedUsers changes
  useEffect(() => {
    localStorage.setItem('trackedUsers', JSON.stringify(trackedUsers));
  }, [trackedUsers]);

  const addUser = (username: string) => {
    if (!isUserTracked(username)) {
      setTrackedUsers([...trackedUsers, { 
        username, 
        addedAt: Date.now(),
        lastUpdated: Date.now()
      }]);
    }
  };

  const removeUser = (username: string) => {
    setTrackedUsers(trackedUsers.filter(u => u.username !== username));
  };

  const isUserTracked = (username: string) => {
    return trackedUsers.some(u => u.username.toLowerCase() === username.toLowerCase());
  };

  return (
    <UserContext.Provider value={{ trackedUsers, addUser, removeUser, isUserTracked }}>
      {children}
    </UserContext.Provider>
  );
};

export const useTrackedUsers = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useTrackedUsers must be used within UserProvider');
  }
  return context;
};
