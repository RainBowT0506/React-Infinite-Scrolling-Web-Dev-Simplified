import axios from "axios";
import React, { useEffect } from "react";

export default function useBookSearch(query, pageNum) {
  useEffect(() => {
    let cancel;

    axios({
      method: "GET",
      url: "http://openlibrary.org/search.json",
      params: { q: query, page: pageNum },
      cancelToken: new axios.CancelToken((c) => (cancel = c)),
    })
      .then((res) => {
        console.log(res.data);
      })
      .catch((e) => {
        if (axios.isCancel(e)) return;
      });

    return () => cancel();
  }, [query, pageNum]);
  return null;
}
