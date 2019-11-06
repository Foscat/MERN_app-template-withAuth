import React, { Component } from 'react';
import {  BrowserRouter as Router, Route, Switch  } from 'react-router-dom';
import Home from "./components/pages/Home";
import WorkBench from './components/pages/WorkBench';
import NoMatch from './components/pages/NoMatch';
import NavBar from "./components/parts/NavBar";
import API from './utils/API';

// This is the router for react page components
class App extends Component {

    constructor(props){
        super(props);
        this.state = {
            user: "",
            loading: false,
            token: ""
        }
    }

    componentDidMount(){
        console.log("App mount state:", this.state);
        if(localStorage.getItem("token") !== null);
        else this.setState({ token:localStorage.getItem("token") });
    }

    componentDidUpdate(){
        console.log("App update state:", this.state);
    }

    signInUser = async token => {
        localStorage.setItem("token", token);
        this.setState({ token: token, loading: true });
        API.currentUser(this.state.token).then(res=>{
            if (res.data[0]) {
                this.setState({ user: res.data[0].user, loading: false });
            }
        })
        .catch(err=>{
            console.error("There was an error with the sign in.", err);
        })
        
    };

    signOutUser = () => {
        localStorage.removeItem("token");
        this.setState({ token: null });
    };

    render() {
        return (
            <div>
                {/* Allows navbar to stay on all pages */}
                <NavBar />
                <Router>
                    <div>
                        <Switch>
                            {/* 'exact path' is how you set up html page routes */}
                            <Route exact path="/" component={Home} />
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