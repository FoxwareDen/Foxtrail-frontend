import React from 'react';
import { useNavigate } from 'react-router-dom';
import Dashboard from './Dashboard';


const LoginPage: React.FC = ()=>{
    const navigate = useNavigate();
    const handleLogin = ()=>{
        navigate('/dashboard')
    }
    return(
        <div className="min-h-screen bg-slate-700 flex flex-col items-center justify-center">
         <h1>Login Page</h1>
         <button
         onClick={handleLogin}
         >Login</button>
        </div>
    )
};

export default LoginPage;