import './App.css';
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import React, { useState } from 'react';


const Section = ({title, initSeverity}) => {

  const [severity, setSeverity] = useState(initSeverity);

  return (
    <Card style={{ width: '18rem' }}>
      <Card.Body>
        <Card.Title>{title}</Card.Title>
        <Card.Subtitle className="mb-2 text-muted">Select an {title} level</Card.Subtitle>
        
        <ButtonGroup aria-label="Basic example">
          <Button variant={severity === "low" ? "primary" : "secondary"} onClick={() => {setSeverity("low");}}>Low</Button>
          <Button variant={severity === "medium" ? "primary" : "secondary"} onClick={() => {setSeverity("medium");}}>Medium</Button>
          <Button variant={severity === "high" ? "primary" : "secondary"} onClick={() => {setSeverity("high");}}>High</Button>
        </ButtonGroup>
      </Card.Body>
    </Card>
  );

}

function App() {
  return (
    <div className="App">
      
      <header className="App-header">
        <Container>
          <Row>
            <Col><Section title="Risk" /></Col>
            <Col><Section title="Complexity" /></Col>
            <Col><Section title="Effort" /></Col>
          </Row>
        </Container>
        <Button variant="primary">Clear</Button>
        <Button variant="primary">Show</Button>
        <Container>
          <Row>
            <Col>Name</Col>
            <Col>Risk</Col>
            <Col>Complexity</Col>
            <Col>Effort</Col>
          </Row>
        </Container>
        
         
      </header>
    </div>
  );
}

export default App;
