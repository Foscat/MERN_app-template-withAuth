import React, { Component } from 'react';
import TextCard from '../../parts/TextCard';
import API from "../../../utils/API";

class UserHome extends Component {

    constructor(props){
        super(props);

        this.state={
            user: props.user
        }
    }

    // componentDidMount(){
    //     console.log("UserHome mount state", this.state);
    // }
    // componentDidUpdate(){
    //     console.log("UserHome updated state", this.state);
    // }

    checkCreds = () => {
      console.log("Check if authorized.");
      API.currentUser({token:localStorage.getItem("token")})
        .then(res => {
          if(res.status === 200){
            console.log("Authenticated");
            return true;
          }
          else{
            console.log("Not authenticated");
            this.props.signOut();
            return false;
          }
        })
        .catch(err => {console.error("There was an error",err)})
    }

    render() {
      return (
        <div>
          <TextCard 
            title={`Name: ${this.state.user.name}`}
            subtitle={`Username: ${this.state.user.username}`}
          >
            <ul>
              <li>{this.state.user.phone_num}</li>
              <li>{this.state.user.email}</li>
              <li>{this.state.user.createdAt}</li>
            </ul>

            <button type="button" className="btn btn-info m-1" onClick={this.checkCreds}>Authenticate me</button>
            <button type="button" className="btn btn-danger m-1" onClick={this.props.signOut}>Sign out</button>
          </TextCard>
        </div>
      )
    }
}

export default UserHome;