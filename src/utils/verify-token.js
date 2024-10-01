// import { decode as jwtDecode } from 'jwt-decode'; // Correct import

const verifyToken = () => {
    const token = localStorage.getItem('token'); 

    // Check if the token is null or empty
    if (token == null || token === "") {
        console.error("No token found. Redirecting to login."); // Log an error message
        // router.push('/'); // Uncomment this when using the router
        return; 
    }
    return token;
}

export default verifyToken; 
