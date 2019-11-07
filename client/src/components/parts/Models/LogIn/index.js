import React from 'react';
import { Button, Form, FormGroup, Label, Input, FormText } from 'reactstrap';

const LogIn = props => {

    return(
        <Form>
            <FormGroup>
                <Label for="logInUsername">Username</Label>
                <Input type="text" onChange={props.handleInputChange} name="logInUsername" id="logInUsername" placeholder="Username" />
            </FormGroup>
            <FormGroup>
                <Label for="logInPassword">Password</Label>
                <Input type="password" onChange={props.handleInputChange} name="logInPassword" id="logInPassword" placeholder="Password" />
            </FormGroup>
            
            <Button onClick={props.logIn}>Submit</Button>
        </Form>
    )

}

export default LogIn;