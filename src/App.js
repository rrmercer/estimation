import './App.css';
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import Container from 'react-bootstrap/Container';
import Navbar from 'react-bootstrap/Navbar';
import InputGroup from 'react-bootstrap/InputGroup';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Form from 'react-bootstrap/Form';
import React, { useEffect, useMemo, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux'
import { updateComplexity, updateRisk, updateEffort, updateLocalUserName, updateFromBackend, selectUsers, selectShowEstimations, selectLocalUser, showEstimations, hideEstimations, clear } from './estimators';
import backendUrl from './utils.js';
import { useSearchParams } from "react-router-dom";
import DataTable from 'react-data-table-component';
import { FcMindMap } from "react-icons/fc";

const Section = ({title, user, updateLevel, disabled}) => {
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
          <Button disabled={disabled} variant={level === "low" ? "primary" : "secondary"} 
            onClick={() => { dispatch(updateLevel([user, "low"]))}}>Low</Button>
          <Button disabled={disabled} variant={level === "medium" ? "primary" : "secondary"} 
            onClick={() => { dispatch(updateLevel([user, "medium"]))}}>Medium</Button>
          <Button disabled={disabled} variant={level === "high" ? "primary" : "secondary"} 
            onClick={() => { dispatch(updateLevel([user, "high"]))}}>
              High
          </Button>
        </ButtonGroup>
      </Card.Body>
    </Card>
  );
}

function App() {
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams(); 
  var users = useSelector(selectUsers);
  const displayEstimations = useSelector(selectShowEstimations);
  const localUser = useSelector(selectLocalUser);

  const isLocalUserNameSet = useMemo(() => {
    return localUser === null;
  }, [localUser]);

  const POLLING_RATE = 2000; // 2 seconds
  // @todo Update speed of refreshes
  //poll backend for changes to users every POLLING_RATE
  const updateState = useCallback(async () => {
    // TODO: dry out with initial load, do we need both? Initial load is slow
    let response = await fetch(backendUrl("estimation"));
    if (!response.ok) {
      const message = `An error has occured: ${response.status}`;
      throw new Error(message);
    } else {
      const data = await response.json();
      dispatch(updateFromBackend([data]));
      return data;
    }
    
  }, [dispatch]);

  useEffect(() => {
    setInterval(updateState, POLLING_RATE);
  }, [updateState]);
  
  // wrap the whole tree in this little check to prevent folks from abusing the site
  const password = searchParams.get("password");
  if (password !== "lilpassword!") {
    console.error(`wrong password ${JSON.stringify(password)}`);
    return <></>;
  }
  
  const setLocalUserName = ({e}) => {
    const name = e.target.value;
    dispatch(updateLocalUserName([name]));
  }

  // table data transformation from obj to an array of objects
  // TODO: move this to a method; clean up return and such {...}
  const tableData = Object.entries(users).map(([username, user]) => {
    const {id, risk, complexity, effort, score} = {...user};
    return {id, username, risk, complexity, effort, score};
  });


  const displayValue = (value, username) => {
    /**
      * 0.) if the user is == local user (The current user line) then just show the values for that user
      * 1.) If user has not entered anything; display a blank
      * 2.) Otherwise, hide the value if displayEstimations is False; show the estimation if displayEstimations is True
      */
    if (value === "" || value === undefined) {
      return "";
    }
    if (username === localUser) {
      return value;
    } else {
      if (displayEstimations) {
        return value;
      } 
      return <FcMindMap />;
    }
  }

  
  return (
    <div className="App">
     
        <header className="App-header">
        
          <Navbar expand="lg" className="bg-body-tertiary justify-content-between">
              <Form inline>
                <InputGroup>
                  <InputGroup.Text id="basic-addon1">@</InputGroup.Text>
                  <Form.Control type="text" placeholder="Enter your username" value={localUser} onChange={(e) => setLocalUserName({e})} />
                </InputGroup>
              </Form>
            </Navbar>
        
        </header>
        
        <Container justify="center">
          
          <Row className="add-space">
            <Col><Section title="Risk" user={localUser} updateLevel={updateRisk} disabled={isLocalUserNameSet} /></Col>
            <Col><Section title="Complexity" user={localUser} updateLevel={updateComplexity} disabled={isLocalUserNameSet}/></Col>
            <Col><Section title="Effort" user={localUser} updateLevel={updateEffort} disabled={isLocalUserNameSet}/></Col>
          </Row>
        
          <Row className="justify-content-md-center add-space">          
            <Col> 
              <Button variant="primary" onClick={() => dispatch(clear())}>Clear</Button>
            </Col>
            <Col>
              <Form>
                <Form.Check 
                  type="switch"
                  checked={displayEstimations}
                  onChange={() => {
                    if (displayEstimations) {
                      dispatch(hideEstimations());
                    } else {
                      dispatch(showEstimations());
                    }
                  }}
                  id="custom-switch"
                  label="Show"
              />
              </Form>
            </Col>
          </Row>
          <Row>
            <DataTable
              keyField='id'
              defaultSortFieldId='score'
              columns={
                    [{
                        name: 'Name',
                        selector: row => row.username,
                        sortable: true,
                        cell: (row, index, column, id) => {
                            return row["username"] === "null" ? "Enter your username above!" : row["username"]
                        }
                    },
                    {
                      name: 'Risk',
                      selector: row => row.risk,
                      sortable: true,
                      cell: (row, index, column, id) => {return displayValue(row["risk"], row["username"])}
                    },
                    {
                      name: "Complexity",
                      selector: row => row.complexity,
                      sortable: true,
                      cell: (row, index, column, id) => {return displayValue(row["complexity"], row["username"])}
                    },
                    {
                      name: "Effort",
                      selector: row => row.effort,
                      sortable: true,
                      cell: (row, index, column, id) => {return displayValue(row["effort"], row["username"])}
                    },
                    {
                      name: "Score",
                      selector: row => row.score,
                      sortable: true,
                      cell: (row, index, column, id) => {return displayValue(row["score"], row["username"])}
                    }
                  ] }
                  data={tableData} >
                </DataTable>
            </Row>
        </Container>
      
    </div>
  );
}

export default App;
