import React from 'react';
import { Jumbotron } from "reactstrap";

// Simple jumborton that can take in prop styles and has classNames for easy css

const FlexTron = ({ className, style, titleStyle, title,subtitle, contentStyle, children}) => {

    return (
        <Jumbotron className={className} style={style}>
            <div style={titleStyle}>
                <h1 >{title}</h1>
                <h5>{subtitle}</h5>
            </div>
            <hr />
            <div style={contentStyle}>
                {children}
            </div>
        </Jumbotron>
    )
};

export default FlexTron;