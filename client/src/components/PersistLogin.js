import { Outlet } from 'react-router-dom';
import {useState, useEffect} from 'react';
import useRefreshToken from '../hooks/useRefreshToken';
import auth from '../auth';

const PersistLogin = () => {
    const [loading, setLoading] = useState(true);
    const refreshToken = useRefreshToken();
    const {auth} = auth();
    
    useEffect(() => {
        if (refreshToken) {
        auth.refreshToken(refreshToken)
            .then(() => setLoading(false))
            .catch(() => setLoading(false));
        } else {
        setLoading(false);
        }
    }, [refreshToken]);
    
    return loading ? <div>Loading...</div> : <Outlet />;
}
