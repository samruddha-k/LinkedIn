import { useState } from "react";
import { gql, useQuery, useMutation } from "@apollo/client";

const ME = gql`
  query {
    me {
      id
      name
      email
      headline
      about
      location
      skills
    }
  }
`;

const UPDATE_PROFILE = gql`
  mutation($headline: String, $about: String, $location: String, $skills: [String!]) {
    updateProfile(
      headline: $headline
      about: $about
      location: $location
      skills: $skills
    ) {
      id
      name
      headline
      about
      location
      skills
    }
  }
`;

export default function Profile() {
  const { data, loading, error, refetch } = useQuery(ME);
  const [updateProfile] = useMutation(UPDATE_PROFILE);

  const [form, setForm] = useState({
    headline: "",
    about: "",
    location: "",
    skills: ""
  });

  if (loading) return <p>Loading...</p>;
  if (error) return <p>❌ {error.message}</p>;

  const user = data.me;

  const handleUpdate = async () => {
    await updateProfile({
      variables: {
        headline: form.headline || user.headline,
        about: form.about || user.about,
        location: form.location || user.location,
        skills: form.skills ? form.skills.split(",") : user.skills
      }
    });

    refetch();
    alert("Profile updated ✅");
  };

  return (
    <div style={{ padding: 20, maxWidth: 600, margin: "0 auto" }}>
      <h2>My Profile</h2>

      <div style={{ background: "white", padding: 20, borderRadius: 10 }}>
        <p><b>Name:</b> {user.name}</p>
        <p><b>Email:</b> {user.email}</p>
        <p><b>Headline:</b> {user.headline}</p>
        <p><b>About:</b> {user.about}</p>
        <p><b>Location:</b> {user.location}</p>
        <p><b>Skills:</b> {user.skills?.join(", ")}</p>
      </div>

      <h3 style={{ marginTop: 20 }}>Edit Profile</h3>

      <input
        placeholder="Headline"
        onChange={(e) => setForm({ ...form, headline: e.target.value })}
      />
      <br /><br />

      <input
        placeholder="About"
        onChange={(e) => setForm({ ...form, about: e.target.value })}
      />
      <br /><br />

      <input
        placeholder="Location"
        onChange={(e) => setForm({ ...form, location: e.target.value })}
      />
      <br /><br />

      <input
        placeholder="Skills (comma separated)"
        onChange={(e) => setForm({ ...form, skills: e.target.value })}
      />
      <br /><br />

      <button onClick={handleUpdate}>
        Update Profile
      </button>
    </div>
  );
}