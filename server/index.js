var express = require('express');
const cors = require('cors');
var { ApolloServer, gql } = require('apollo-server-express');
var { GraphQLScalarType } = require('graphql');

const data = [
    { id: 1, firstName: 'Max', lastName: 'Mustermann', startedAt: new Date() },
    { id: 2, firstName: 'Test', lastName: 'Master', startedAt: new Date() },
    { id: 3, lastName: 'Focusboy', startedAt: null },
];

var typeDefs = gql`
  scalar Date

  type Result {
    success: Boolean
  }

  type Person {
    id: Int!
    lastName: String!
    firstName: String
    startedAt: Date
  }

  type Query {
    persons(firstName: String): [Person]
  }

  type Mutation {
    createPomodoro(firstName: String, lastName: String!): Result
    deletePomodoro(id: Int!): Result
    start(id: Int!): Result
    stop(id: Int!): Result
  }
`;

const resolvers = {
  Query: { 
    persons: (parent, args, context, info) => data.filter(y => !args.firstName || y.firstName === args.firstName),
  },
  Mutation: {
    createPomodoro: (parent, args, context, info) => {
      const nextId = Math.max(...data.map(x => x.id)) + 1;
      
      data.push({ id: nextId, ...args });

      return { success: true };
    },
    deletePomodoro: (parent, args, context, info) => {
      const index = data.indexOf(getPersonById(args.id));
      data.splice(index, 1);
      
      return { success: true };
    },
    start: (parent, args, context, info) => {
      getPersonById(args.id).startedAt = new Date();
      return { success: true };
    },
    stop: (parent, args, context, info) => {
      getPersonById(args.id).startedAt = null;
      return { success: true };
    },
  },
  Date: new GraphQLScalarType({
    name: 'Date',
    description: 'Date custom scalar type',
    parseValue: value => new Date(value),
    serialize: value => value.getTime(),
    parseLiteral: ast => ast.kind === Kind.INT ? parseInt(ast.value, 10) : null
  })
};

const getPersonById = id => data.find(x => x.id === id);

const server = new ApolloServer({ typeDefs, resolvers });
const app = express();

app.use(cors());
server.applyMiddleware({ app });

app.listen({ port: 4000 }, () =>
  console.log(`🚀 Server ready at http://localhost:4000${server.graphqlPath}`)
);