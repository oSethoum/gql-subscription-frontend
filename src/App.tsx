import {
  ApolloClient,
  gql,
  InMemoryCache,
  useSubscription,
  ApolloProvider,
  HttpLink,
  split,
} from "@apollo/client";

import "./App.css";
import { GraphQLWsLink } from "@apollo/client/link/subscriptions";
import { createClient } from "graphql-ws";
import { getMainDefinition } from "@apollo/client/utilities";

const wsLink = new GraphQLWsLink(
  createClient({
    url: "ws://localhost:8081/query",
  })
);
const httpLink = new HttpLink({
  uri: "http://localhost:8081/query",
});

const splitLink = split(
  ({ query }) => {
    const definition = getMainDefinition(query);
    return (
      definition.kind === "OperationDefinition" &&
      definition.operation === "subscription"
    );
  },
  wsLink,
  httpLink
);

const client = new ApolloClient({
  link: splitLink,
  cache: new InMemoryCache(),
});

function App() {
  const { loading, data } = useSubscription(gql`
    subscription {
      GetChannelMessagesBySubscription(token: "token") {
        id
      }
    }
  `);

  return loading ? <div>Loading</div> : <div>{JSON.stringify(data)}</div>;
}

export default () => (
  <ApolloProvider client={client}>
    <App />
  </ApolloProvider>
);
