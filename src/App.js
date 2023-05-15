import logo from "./logo.svg";
import "./App.css";
import { useState } from "react";
import useBookSearch from "./useBookSearch";

function App() {
  const [query, setQuery] = useState("");
  const [pageNum, setPageNum] = useState(1);

  function handleSearch(e) {
    setQuery(e.target.value);
    setPageNum(1);
  }

  const { books, hasMore, loading, error } = useBookSearch(query, pageNum);

  return (
    <>
      <input type="text" onChange={handleSearch}></input>
      {books.map((book) => {
        return <div key={book}>{book}</div>;
      })}
      <div>{loading && "Loading..."}</div>
      <div>{error && "Error"}</div>
    </>
  );
}

export default App;
