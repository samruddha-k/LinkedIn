import { useState } from "react";
import { gql, useQuery, useMutation } from "@apollo/client";

const FEED = gql`
  query {
    feed {
      id
      content
      author {
        name
      }
    }
  }
`;

const CREATE_POST = gql`
  mutation CreatePost($content: String!) {
    createPost(content: $content) {
      id
      content
    }
  }
`;

export default function Feed() {
  const { data, refetch } = useQuery(FEED);
  const [createPost] = useMutation(CREATE_POST);
  const [text, setText] = useState("");

  const post = async () => {
    if (!text) return;
    await createPost({ variables: { content: text } });
    setText("");
    refetch();
  };

  return (
    <div style={{ padding: 20, maxWidth: 600, margin: "0 auto" }}>
      <h2>Feed</h2>

      <div style={{
        background: "blue",
        padding: 15,
        borderRadius: 10,
        boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
        marginBottom: 20
      }}>
        <input
          placeholder="What's on your mind?"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <button onClick={post}>Post</button>
      </div>

      {data?.feed?.map((p) => (
        <div key={p.id} style={{
          background: "white",
          padding: 15,
          borderRadius: 10,
          marginBottom: 10,
          boxShadow: "0 1px 3px rgba(0,0,0,0.1)"
        }}>
          <p>{p.content}</p>
          <small>by {p.author?.name}</small>
        </div>
      ))}
    </div>
  );
}