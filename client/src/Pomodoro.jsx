import React, { useEffect, useState } from 'react';
import { ButtonGroup, Button, Container, Table, Row, Col, Form } from 'react-bootstrap';
import ApolloClient, { gql } from 'apollo-boost';

export const Pomodoro = () => {
    const [firstName, setFirstName] = useState();
    const [lastName, setLastName] = useState();
    const [users, setUsers] = useState([]);

    useEffect(() => {
        loadUsers();
    }, []);

    const client = new ApolloClient({
        uri: "http://localhost:4000/graphql"
    });

    const loadUsers = async () => {
        const data = await client.query({
            query: gql`query {
                persons { firstName, lastName, id, startedAt }
            }`
        });

        setUsers(data.data.persons);
    };

    const start = async (id) => {
        await client.mutate({
            mutation: gql`mutation Start($id: Int!) { start(id: $id) { success} }`,
            variables: { id }
        });

        await loadUsers();
    };

    const stop = async (id) => {
        await client.mutate({
            mutation: gql`mutation Stop($id: Int!) { stop(id: $id) { success} }`,
            variables: { id }
        });

        await loadUsers();
    };

    const deletePomodoro = async (id) => {
        await client.mutate({
            mutation: gql`mutation DeletePomodoro($id: Int!) { deletePomodoro(id: $id) { success} }`,
            variables: { id }
        });

        await loadUsers();
    };

    const createPomodoro = async () => {
        await client.mutate({
            mutation: gql`mutation CreatePomodoro($firstName: String, $lastName: String!) {
                createPomodoro(firstName: $firstName, lastName: $lastName) { 
                    success
                } 
            }`,
            variables: { firstName, lastName }
        });

        await loadUsers();
    };

    const renderRow = user => {
        return (
            <tr key={user.id}>
                <td>
                    <span>{user.firstName} {user.lastName}</span>
                </td>
                <td>{user.startedAt ? new Date(user.startedAt).toLocaleTimeString() : null}</td>
                <td>
                    <ButtonGroup>
                        <Button onClick={() => start(user.id)}>Start</Button>
                        <Button onClick={() => stop(user.id)}>Stop</Button>
                        <Button onClick={() => deletePomodoro(user.id)}>Delete</Button>
                    </ButtonGroup>
                </td>
            </tr>
        )
    };

    return (
        <Container>
            <Row>
                <Col>
                    <Form.Control type="text" placeholder="First name" value={firstName} onChange={x => setFirstName(x.target.value)} />
                    <Form.Control type="text" placeholder="Last name" value={lastName}  onChange={x => setLastName(x.target.value)} />
                    <Button onClick={createPomodoro}>Create</Button>
                </Col>
            </Row>
            <Row>
                <Col>
                    <Table striped bordered hover>
                        <thead>
                            <tr>
                                <td>Name</td>
                                <td>Zeit</td>
                                <td>Aktion (Start und Stop)</td>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map(renderRow)}
                        </tbody>
                    </Table>
                </Col>
            </Row>
        </Container>
    );
};