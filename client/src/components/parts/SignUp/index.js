import React, { Component } from 'react';

class SignUp extends Component {

    constructor(props){
        super(props);

        this.state={

        }
    }

    componentDidMount(){
        console.log("SignUp mount state", this.state);
    }

    componentDidUpdate(){
        console.log("SignUp update state")
    }

    render() {
      return (
        <div>
          Sign up page
        </div>
      )
    }
}

export default SignUp;