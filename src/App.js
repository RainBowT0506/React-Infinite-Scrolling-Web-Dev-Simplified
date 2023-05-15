import logo from "./logo.svg";
import "./App.css";
import { useCallback, useRef, useState } from "react";
import useBookSearch from "./useBookSearch";

function App() {
  const [query, setQuery] = useState("");
  const [pageNum, setPageNum] = useState(1);

  const { books, hasMore, loading, error } = useBookSearch(query, pageNum);

  const loadMoreObserver = useRef();
  const lastBookElementRef = useCallback((node) => {
    if (loading) return;
    if (loadMoreObserver.current) loadMoreObserver.current.disconnect();
    loadMoreObserver.current = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && hasMore) {
        setPageNum((prevPageNum) => prevPageNum + 1);
      }
    });
    if (node) loadMoreObserver.current.observe(node);
    console.log(node);
  });

  function handleSearch(e) {
    setQuery(e.target.value);
    setPageNum(1);
  }

  return (
    <>
      <input type="text" value={query} onChange={handleSearch}></input>
      {books.map((book, index) => {
        if (books.length === index + 1) {
          return (
            <div ref={lastBookElementRef} key={book}>
              {book}
            </div>
          );
        } else {
          return <div key={book}>{book}</div>;
        }
      })}
      <div>{loading && "Loading..."}</div>
      <div>{error && "Error"}</div>
    </>
  );
}

export default App;
