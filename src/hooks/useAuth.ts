
// This file is kept for structural compatibility with the user's plan.
// However, the recommended way is to import `useAuth` directly from `../contexts/AuthContext`.
import { useAuth as useAuthFromContext } from '@/contexts/AuthContext';

const useAuth = useAuthFromContext;

export default useAuth;
    