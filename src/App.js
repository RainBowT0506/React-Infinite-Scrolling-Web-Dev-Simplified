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

  useBookSearch(query, pageNum);

  return (
    <>
      <input type="text" onChange={handleSearch}></input>
      <div>Title</div>
      <div>Title</div>
      <div>Title</div>
      <div>Title</div>
      <div>Loading...</div>
      <div>Error</div>
    </>
  );
}

export default App;
