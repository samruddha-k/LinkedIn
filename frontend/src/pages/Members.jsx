import { gql, useQuery, useMutation } from "@apollo/client";

const GET_USERS = gql`
  query {
    users {
      id
      name
    }
  }
`;

const CONNECT = gql`
  mutation($targetId: ID!) {
    connectUser(targetId: $targetId)
  }
`;

export default function Members() {
  const { data, loading, error } = useQuery(GET_USERS);
  const [connectUser] = useMutation(CONNECT);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error loading users</p>;

  const handleConnect = async (id) => {
    console.log("🔥 CLICKED CONNECT:", id);   // ✅ DEBUG

    try {
      const res = await connectUser({
        variables: { targetId: id }
      });

      console.log("✅ RESPONSE:", res);
      alert("Connected!");
    } catch (err) {
      console.error("❌ ERROR:", err);
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Members</h2>

      {data.users.map((u) => (
        <div
          key={u.id}
          style={{
            display: "flex",
            justifyContent: "space-between",
            padding: 10,
            border: "1px solid gray",
            marginBottom: 10
          }}
        >
          <span>{u.name}</span>

          <button
            onClick={() => handleConnect(u.id)}
            style={{
              background: "blue",
              color: "white",
              border: "none",
              padding: "5px 10px",
              cursor: "pointer"
            }}
          >
            Connect
          </button>
        </div>
      ))}
    </div>
  );
}