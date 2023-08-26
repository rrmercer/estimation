import './App.css';
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Form from 'react-bootstrap/Form';
import React, { useEffect, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux'
import { updateComplexity, updateRisk, updateEffort, updateLocalUserName, setInitialUsers, selectUsers, selectShowEstimations, selectLocalUser, showEstimations, hideEstimations, clear } from './estimators';
import backendUrl from './utils.js';
import { useSearchParams } from "react-router-dom";

const Section = ({title, user, updateLevel}) => {
  const dispatch = useDispatch();
  const users = useSelector(selectUsers);
  const level = useMemo(() => {
    if (user in users) {
      return users[user][title.toLowerCase()];
    }
  }, [user, title, users]);

  return (
    <Card style={{ width: '18rem' }}>
      <Card.Body>
        <Card.Title>{title}</Card.Title>
        <Card.Subtitle className="mb-2 text-muted">Select an {title} level</Card.Subtitle>
        
        <ButtonGroup aria-label="Basic example">
          <Button variant={level === "low" ? "primary" : "secondary"} 
            onClick={() => { dispatch(updateLevel([user, "low"]))}}>Low</Button>
          <Button variant={level === "medium" ? "primary" : "secondary"} 
            onClick={() => { dispatch(updateLevel([user, "medium"]))}}>Medium</Button>
          <Button variant={level === "high" ? "primary" : "secondary"} 
            onClick={() => { dispatch(updateLevel([user, "high"]))}}>
              High
          </Button>
        </ButtonGroup>
      </Card.Body>
    </Card>
  );
}

const UserName = (props) => {
  const dispatch = useDispatch();
  const localUser = useSelector(selectLocalUser);
  const setLocalUserName = ({e}) => {
    const name = e.target.value;
    dispatch(updateLocalUserName([name]));
  }
  if (localUser === props.userName) {
    return (
      <Form>
        <Form.Group className="mb-3" controlId="formBasicname">
          <Form.Control type="text" placeholder="Enter your name" value={localUser} onChange={(e) => setLocalUserName({e})} />
        </Form.Group>
      </Form>
      );
  } 
  return <>{props.userName}</>;
}

function App() {
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams(); 
  var users = useSelector(selectUsers);
  const displayEstimations = useSelector(selectShowEstimations);
  const localUser = useSelector(selectLocalUser);
  const showOrHideButton = useMemo(() => {
    if (displayEstimations) {
      return  <Button variant="secondary" onClick={() => {dispatch(hideEstimations());}}>Hide</Button>
    } else {
      return <Button variant="primary" onClick={() => {dispatch(showEstimations());}}>Show</Button>
    }
  }, [dispatch, displayEstimations]);
  
  // Initial load of users from backend
  useEffect(() => {
    (async () => {
      let response = await fetch(backendUrl("estimation")); // TODO: uri as a variable
      
      if (!response.ok) {
        const message = `An error has occured: ${response.status}`;
        throw new Error(message);
      } else {
        const result = await response.json();
        dispatch(setInitialUsers([result]));
        //TODO: dispatch(setHideShowEstimations)
        return result;
      }
      
    })();
  }, [dispatch]);
  
  //const POLLING_RATE = 1000; // 1 second
  // poll backend for changes to users every 500ms
  // const updateState = useCallback(async () => {
  //   // TODO: dry out with initial load
  //   let response = await fetch(backendUrl("estimation"));
  //   const data = await response.json();
  //   dispatch(setInitialUsers([data]));
  // }, []);
  // useEffect(() => {
  //   setInterval(updateState, POLLING_RATE);
  // }, [updateState]);
  
  const password = searchParams.get("password");
  if (password !== "lilpassword!") {
    console.error(`wrong password ${JSON.stringify(password)}`);
    return <></>;
  }
  
  console.log(`usersFromAPI = ${JSON.stringify(users)}`);  
  return (
    <div className="App">
      
      <header className="App-header">
        <Container justify="center">
          <Row>
            <Col><Section title="Risk" user={localUser} updateLevel={updateRisk} /></Col>
            <Col><Section title="Complexity" user={localUser} updateLevel={updateComplexity}/></Col>
            <Col><Section title="Effort" user={localUser} updateLevel={updateEffort} /></Col>
          </Row>
        </Container>
        <Container>
          <Row className="justify-content-md-center">
          <Col></Col>
            <Col></Col>
            <Col> 
              <Button variant="primary" onClick={() => dispatch(clear())}>Clear</Button>
            </Col>
            <Col>{showOrHideButton}</Col>
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
                  return <Row key={users[userName].id}>
                    <Col><UserName userName={userName}></UserName></Col>
                    <Col>{!risk ? "" : risk}</Col>
                    <Col>{!complexity ? "": complexity}</Col>
                    <Col>{!effort ? "": effort}</Col>
                    <Col>{score}</Col></Row>
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
