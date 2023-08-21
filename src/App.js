import './App.css';
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import React, { useState, useEffect, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux'
import { updateComplexity, updateRisk, selectUsers, selectShowEstimations, showEstimations, hideEstimations, clear } from './estimators';

const Section = ({title, initLevel, user, updateLevel}) => {
  const dispatch = useDispatch();
  const users = useSelector(selectUsers);
  const [level, setLevel] = useState();
  
  //users["rob"]["risk"]

  return (
    <Card style={{ width: '18rem' }}>
      <Card.Body>
        <Card.Title>{title}</Card.Title>
        <Card.Subtitle className="mb-2 text-muted">Select an {title} level</Card.Subtitle>
        
        <ButtonGroup aria-label="Basic example">
          <Button variant={level === "low" ? "primary" : "secondary"} 
            onClick={() => {setLevel("low"); dispatch(updateLevel([user, "low"]))}}>Low</Button>
          <Button variant={level === "medium" ? "primary" : "secondary"} 
            onClick={() => {setLevel("medium"); dispatch(updateLevel([user, "medium"]))}}>Medium</Button>
          <Button variant={level === "high" ? "primary" : "secondary"} 
            onClick={() => {setLevel("high"); dispatch(updateLevel([user, "high"]))}}>
              High
          </Button>
        </ButtonGroup>
      </Card.Body>
    </Card>
  );
}


function App() {
  const dispatch = useDispatch();
  const users = useSelector(selectUsers);
  const displayEstimations = useSelector(selectShowEstimations);
  const localUser = "rob";

  const showOrHideButton = useMemo(() => {
    if (displayEstimations) {
      return  <Button variant="secondary" onClick={() => {dispatch(hideEstimations());}}>Hide</Button>
    } else {
      return <Button variant="primary" onClick={() => {dispatch(showEstimations());}}>Show</Button>
    }
  }, [displayEstimations]);
  
  return (
    <div className="App">
      
      <header className="App-header">
        <Container>
          <Row>
            <Col><Section title="Risk" initLevel={users["rob"]["risk"]} user={localUser} updateLevel={updateRisk} /></Col>
            <Col><Section title="Complexity" initLevel={users["rob"]["complexity"]} user={localUser} updateLevel={updateComplexity}/></Col>
            <Col><Section title="Effort" /></Col>
          </Row>
          <Row>
            <Col> 
              <Button variant="primary" onClick={() => dispatch(clear())}>Clear</Button>
              {showOrHideButton}
            </Col>
            <Col></Col>
          </Row>
        </Container>
       
        
        <Container>
          <Row>
            <Col>Name</Col>
            <Col>Risk</Col>
            <Col>Complexity</Col>
            <Col>Effort</Col>
            <Col>Score</Col>
          </Row>
          {
            Object.entries(users).map(([userName, user]) => {
                const {risk, complexity, effort, score} = {...user};
                if (displayEstimations) {
                  return <Row key={userName}><Col>{userName}</Col><Col>{!risk ? "" : risk}</Col><Col>{!complexity ? "": complexity}</Col><Col>{!effort ? "": effort}</Col><Col>{score}</Col></Row>
                } else {
                  return <Row key={userName}><Col>{userName}</Col><Col>hidden</Col><Col>hidden</Col><Col>hidden</Col><Col>hidden</Col></Row>
                }
                
            })
          }
        </Container>
        
         
      </header>
    </div>
  );
}

export default App;
