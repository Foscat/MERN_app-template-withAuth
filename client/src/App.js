import React, { Component } from 'react';
import {  BrowserRouter as Router, Route, Switch  } from 'react-router-dom';
import Home from "./components/pages/Home";
import WorkBench from './components/pages/WorkBench';
import NoMatch from './components/pages/NoMatch';
import NavBar from "./components/parts/NavBar";
import API from './utils/API';
import UserHome from './components/pages/UserHome';

// This is the router for react page components
class App extends Component {

    constructor(props){
        super(props);
        this.state = {
            user: null,
            loading: false,
            token: localStorage.getItem("token"),
            loggedIn: false,
        }
    }

    componentDidMount(){
        console.log("App mount state:", this.state);
        // this.authenticate();
    }

    componentDidUpdate(){
        console.log("App update state:", this.state);
    }

    // General handler for inputs thats value is to change the state
    // If state does not exsist it makes a state field with its name
    handleInputChange = event => {
        const { name, value } = event.target;
        this.setState({
          [name]: value
        });
    }

    logInUser = () => {
        let s = this.state;

        // If one of the form fields has no value block submit
        if (!s.logInUsername ||!s.logInPassword) {
          // If failed block submit and show alert
          this.setState({
            title: "Error",
            text: "Please fill out all fields before attempting sign in.",
            show: true
          });
          return;
        }
        // Send field info to db using utils api call
        API.signInUser({
            username: s.logInUsername,
            password: s.logInPassword
        })
        // After form submits call function to get all users to see updated info and close model
        .then(res => {
            // console.log(res);
            
            this.setState({show: false, user: res.data.user[0], loggedIn:true});
            localStorage.setItem("token",res.data.info);
        })
        .catch(err => this.setState({ user: err }))
    }

    authenticate = async () => {
        API.currentUser({token: this.state.token})
        .then(res => {
            console.log("Authenticate res",res);
            if(!res.data.length){
                return "authentication failed"
            }
            else {
                this.setState({ user: res.data[0], loggedIn: true });
                return res.data[0];}
        })
        .catch(err => {
            console.error("Authentication error", err);
            return err;
        })
    }

    signOutUser = () => {
        localStorage.removeItem("token");
        this.setState({ user: null, token:"", loggedIn: false });
    };

    render() {
        let home;
        if(!this.state.loggedIn || !this.state.user){
            home =  <Home 
                    logIn={this.logInUser} 
                    authenticate={this.authenticate}
                    handleChange={this.handleInputChange}
                    signOut={this.signOutUser}
                />
        }
        else {
            home = <UserHome 
                    user={this.state.user} 
                    signOut={this.signOutUser} 
                    authenticate={this.authenticate}
                    />
        }
        return (
            <div>
                {/* Allows navbar to stay on all pages */}
                <NavBar />
                <Router>
                    <div>
                        <Switch>
                            {/* 'exact path' is how you set up html page routes */}
                            <Route exact path="/" render={() => home}  />
                            {/* Workbench is for writing new code to keep new parts isolated for easier developing */}
                            <Route exact path="/workbench" component={WorkBench} />
                            {/* If no url routes match show error page */}
                            <Route component={NoMatch} />
                        </Switch>
                    </div>
                </Router>
            </div>
        );
    }
}

export default App;