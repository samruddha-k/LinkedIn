import { gql, useQuery } from "@apollo/client";
import ForceGraph2D from "react-force-graph-2d";

const GRAPH = gql`
  query {
    users {
      id
      name
    }
    graphConnections {
      source
      target
    }
  }
`;

export default function Graph() {
  const { data, loading, error } = useQuery(GRAPH);

  if (loading) return <p>Loading graph...</p>;
  if (error) return <p>❌ {error.message}</p>;

  // Nodes
  const nodes = data.users.map(u => ({
    id: u.id,
    name: u.name
  }));

  // Links
  const links = data.graphConnections.map(c => ({
    source: c.source,
    target: c.target
  }));

  return (
    <div style={{ height: "600px", border: "1px solid black" }}>
      <ForceGraph2D
        graphData={{ nodes, links }}

        // 🔥 DRAW NAME ON NODE
        nodeCanvasObject={(node, ctx, globalScale) => {
          const label = node.name;
          const fontSize = 12 / globalScale;
          ctx.font = `${fontSize}px Sans-Serif`;
          ctx.fillStyle = "black";
          ctx.fillText(label, node.x, node.y);
        }}

        nodeLabel="name"
      />
    </div>
  );
}