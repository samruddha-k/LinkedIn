const express = require("express");
const cors = require("cors");
const { ApolloServer } = require("@apollo/server");
const { expressMiddleware } = require("@as-integrations/express4");
const neo4j = require("neo4j-driver");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
require("dotenv").config();

/* ---------------- DB ---------------- */
const driver = neo4j.driver(
  process.env.NEO4J_URI,
  neo4j.auth.basic(
    process.env.NEO4J_USERNAME,
    process.env.NEO4J_PASSWORD
  )
);

/* ---------------- APP ---------------- */
const app = express();

const corsOptions = {
  origin: [
    "https://linked-in-kappa-six.vercel.app",
    "https://linkedin-cjvo.onrender.com",
    "http://localhost:3000",
    "http://localhost:5173"
  ],
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
};

app.use(cors(corsOptions));
app.options("/graphql", cors(corsOptions));
app.use(express.json());

/* ---------------- GRAPHQL SCHEMA ---------------- */
const typeDefs = `
  type User {
    id: ID!
    name: String!
    email: String!
    headline: String
    about: String
    location: String
    skills: [String!]
  }

  type Post {
    id: ID!
    content: String!
    author: User
  }

  type Auth {
    token: String!
    user: User!
  }

  type Connection {
    source: ID!
    target: ID!
  }

  type Query {
    me: User
    users: [User]
    feed: [Post]
    graphConnections: [Connection]
  }

  type Mutation {
    register(name: String!, email: String!, password: String!): Auth
    login(email: String!, password: String!): Auth
    createPost(content: String!): Post
    connectUser(targetId: ID!): String
  }
`;

/* ---------------- AUTH ---------------- */
const getUser = (req) => {
  const token = req.headers.authorization?.replace("Bearer ", "");
  if (!token) return null;
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    return null;
  }
};

/* ---------------- RESOLVERS ---------------- */
const resolvers = {
  Query: {
    me: async (_, __, ctx) => {
      if (!ctx.user) return null;

      const session = driver.session();
      const res = await session.run(
        "MATCH (u:User {id:$id}) RETURN u",
        { id: ctx.user.id }
      );

      return res.records[0]?.get("u").properties;
    },

    users: async () => {
      const session = driver.session();
      const res = await session.run("MATCH (u:User) RETURN u");

      return res.records
        .map(r => r.get("u").properties)
        .filter(u => u.email); // remove bad users
    },

    feed: async () => {
      const session = driver.session();
      const res = await session.run(`
        MATCH (u:User)-[:CREATED]->(p:Post)
        RETURN p, u
      `);

      return res.records.map(r => ({
        id: r.get("p").properties.id,
        content: r.get("p").properties.content,
        author: r.get("u").properties
      }));
    },

    graphConnections: async () => {
      const session = driver.session();

      const res = await session.run(`
        MATCH (a:User)-[:CONNECTED]->(b:User)
        RETURN a.id AS source, b.id AS target
      `);

      return res.records.map(r => ({
        source: r.get("source"),
        target: r.get("target")
      }));
    }
  },

  Mutation: {
    register: async (_, { name, email, password }) => {
      const session = driver.session();

      const exists = await session.run(
        "MATCH (u:User {email:$email}) RETURN u",
        { email }
      );

      if (exists.records.length > 0)
        throw new Error("User exists");

      const id = crypto.randomUUID();
      const hash = await bcrypt.hash(password, 10);

      await session.run(
        `CREATE (u:User {
          id:$id,
          name:$name,
          email:$email,
          password:$password,
          headline:"",
          about:"",
          location:"",
          skills:[]
        })`,
        { id, name, email, password: hash }
      );

      const token = jwt.sign({ id }, process.env.JWT_SECRET);

      return {
        token,
        user: { id, name, email }
      };
    },

    login: async (_, { email, password }) => {
      const session = driver.session();

      const res = await session.run(
        "MATCH (u:User {email:$email}) RETURN u",
        { email }
      );

      if (!res.records.length)
        throw new Error("Invalid login");

      const user = res.records[0].get("u").properties;

      const ok = await bcrypt.compare(password, user.password);
      if (!ok) throw new Error("Wrong password");

      const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET);

      return {
        token,
        user
      };
    },

    createPost: async (_, { content }, ctx) => {
      if (!ctx.user) throw new Error("Not logged in");

      const session = driver.session();
      const id = crypto.randomUUID();

      await session.run(`
        MATCH (u:User {id:$id})
        CREATE (p:Post {id:$pid, content:$content})
        CREATE (u)-[:CREATED]->(p)
      `, { id: ctx.user.id, pid: id, content });

      return { id, content };
    },

    connectUser: async (_, { targetId }, ctx) => {
  if (!ctx.user) throw new Error("Not logged in");

  const session = driver.session();

  const res = await session.run(`
    MATCH (a:User), (b:User)
    WHERE a.id = $id AND b.id = $targetId
    MERGE (a)-[:CONNECTED]->(b)
    MERGE (b)-[:CONNECTED]->(a)
    RETURN a.id AS aId, b.id AS bId
  `, {
    id: ctx.user.id,
    targetId
  });

  console.log("CONNECTED:", res.records);

  return "Connected";
}
  }
};

/* ---------------- SERVER ---------------- */
async function start() {
  const server = new ApolloServer({
    typeDefs,
    resolvers
  });

  await server.start();

  app.use(
    "/graphql",
    expressMiddleware(server, {
      context: async ({ req }) => ({
        user: getUser(req)
      })
    })
  );

  app.listen(4000, () =>
    console.log("🚀 Server running at http://localhost:4000/graphql")
  );
}

start();