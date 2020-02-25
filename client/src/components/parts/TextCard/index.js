import React from 'react';
import { Card, CardBody, CardHeader, CardTitle, CardSubtitle } from 'reactstrap';

// General use card for wrapping around other components and give clean presentaiton
// Takes is style props to give ease of css 

const TextCard = ({className, style, title, subtitle, contentStyle, children}) => {
    return(
        <Card className={className} style={style}>
        
            <CardHeader>

                <CardTitle>
                    <h2>{title}</h2>
                </CardTitle>

                <CardSubtitle>
                    <h4>{subtitle}</h4>
                </CardSubtitle>

            </CardHeader>

            <CardBody>

                <div style={contentStyle}>
                    {children}
                </div>
    
            </CardBody>

        </Card>
    )
}

export default TextCard;