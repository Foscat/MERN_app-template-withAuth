import React from 'react';

const LogIn = ({handleChange, logIn }) => {
    return(
        <div style={{display:"flex", flexDirection: "column", padding: "50px 0", justifyContent:"space-between"}} className="mx-auto">
            <input type="text" name="logInUsername" onChange={handleChange} />
            <input type="password" name="logInPassword" onChange={handleChange} />
            <button onClick={()=> logIn()}>Log In</button>
        </div>
    );
};

export default LogIn;