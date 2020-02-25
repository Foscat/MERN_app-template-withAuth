import React, { Component } from 'react';
import TextCard from '../../parts/TextCard';
// import API from "../../../utils/API";

class UserHome extends Component {

    constructor(props){
        super(props);

        this.state={
          user: this.props.user
        }
    }

    componentDidMount(){
      console.log("UserHome mount state", this.state);
    }
    // componentDidUpdate(){
    //     console.log("UserHome updated state", this.state);
    // }

    render() {
      const {user } = this.state;
      return (
        <div>
          <TextCard 
            title={`Name: ${user.name}`}
            subtitle={`Username: ${user.username}`}
          >
            <ul>
              <li>{user.phone_num}</li>
              <li>{user.email}</li>
              <li>{user.createdAt}</li>
            </ul>

            <button type="button" className="btn btn-danger m-1" onClick={this.props.signOut}>Sign out</button>
          </TextCard>
        </div>
      )
    }
}

export default UserHome;