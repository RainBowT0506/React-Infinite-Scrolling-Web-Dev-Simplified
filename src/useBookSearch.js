import axios from "axios";
import React, { useEffect } from "react";

export default function useBookSearch(query, pageNum) {
  useEffect(() => {
    axios({
      method: "GET",
      url: "http://openlibrary.org/search.json",
      params: { q: query, page: pageNum },
    }).then(
      (res) => {
        console.log(res.data);
      },
      [query, pageNum]
    );
  });
  return null;
}
