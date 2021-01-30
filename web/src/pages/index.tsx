import { Navbar } from "../components/navbar";
import { withUrqlClient } from "next-urql";
import { createUrqlClient } from "../utils/create-urql-cleint";
import { usePostsQuery } from "../generated/graphql";

const Index = () => {
  const [{ data }] = usePostsQuery();

  return (
    <>
      <Navbar />
      <div>hello world </div>
      <br />
      {data ? (
        data.posts.map((p) => <div key={p.id}>{p.title}</div>)
      ) : (
        <div>loading ...</div>
      )}
    </>
  );
};

export default withUrqlClient(createUrqlClient, {ssr: true})(Index);
