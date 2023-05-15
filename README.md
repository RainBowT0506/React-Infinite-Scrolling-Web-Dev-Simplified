# [Video Note] [React] [Infinite Scrolling With React - Tutorial](https://www.youtube.com/watch?v=NZKUirTtxcg&ab_channel=WebDevSimplified)
## App
```
import logo from "./logo.svg";
import "./App.css";
import { useCallback, useRef, useState } from "react";
import useBookSearch from "./useBookSearch";

function App() {
  const [query, setQuery] = useState("");
  const [pageNum, setPageNum] = useState(1);

  const { books, hasMore, loading, error } = useBookSearch(query, pageNum);

  const observer = useRef();
  const lastBookElementRef = useCallback((node) => {
    if (loading) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && hasMore) {
        setPageNum((prevPageNum) => prevPageNum + 1);
      }
    });
    if (node) observer.current.observe(node);
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
```
### observer
```
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
```
這部分程式碼是用來實作無限滾動（infinite scrolling）的功能，當使用者滾動到頁面底部時，程式碼會自動載入更多的資料，以達到類似「下拉更新」的效果。


#### loadMoreObserver
useRef() 是 React 提供的一個 hook，它可以讓我們在 function component 中儲存一些變數，並且讓這些變數在重新渲染時保持不變。在這裡，我們使用 useRef() 創建了一個名為 `loadMoreObserver` 的變數，它用來儲存一個 IntersectionObserver 實例。

#### lastBookElementRef
`if (observer.current) observer.current.disconnect();`

這段程式碼檢查 loadMoreObserver.current 是否存在，如果存在則呼叫 disconnect() 方法斷開該 IntersectionObserver 的連接。

在程式碼中，loadMoreObserver.current 參考的是之前創建的 IntersectionObserver 實例。當這個 IntersectionObserver 不再需要時（例如，當滾動事件不再需要被監聽或需要重置時），我們希望斷開與元素的連接，以節省資源並避免意外觸發回調函數。

因此，當 loadMoreObserver.current 存在時，程式碼會呼叫 disconnect() 方法斷開連接。這可以確保當需要重新設置 IntersectionObserver 時，舊的連接已經被解除，從而避免不必要的回調觸發和資源浪費。

---
```
loadMoreObserver.current = new IntersectionObserver((entries) => {
  if (entries[0].isIntersecting && hasMore) {
    setPageNum((prevPageNum) => prevPageNum + 1);
  }
});
```


這段程式碼創建了一個新的 IntersectionObserver 實例，並將其賦值給 loadMoreObserver.current。這個新的 IntersectionObserver 用於監聽元素的可見性變化，並在元素進入畫面可見範圍內且仍有更多資料需要載入時，調用 setPageNum 函數來增加頁數。

具體來說，IntersectionObserver 的建構函數接受一個回調函數作為參數，該回調函數將在被觀察的元素的可見性發生變化時被觸發。在這個例子中，回調函數檢查 entries 陣列中的第一個元素是否進入了可見範圍，並且仍有更多資料需要載入（hasMore 為 true）。如果這兩個條件都滿足，則呼叫 setPageNum 函數來增加頁數，從而觸發新一輪的資料載入。

最後，新建立的 IntersectionObserver 實例被賦值給 loadMoreObserver.current，這樣我們就可以在之後的操作中繼續使用它，例如將其添加到元素的 ref 屬性中以開始監聽可見性變化。

---
`if (node) loadMoreObserver.current.observe(node);`

這段程式碼檢查 node 是否存在，如果存在則讓 loadMoreObserver.current 開始監聽該節點的可見性變化。

在這段程式碼中，我們檢查 node 是否存在，以確保在元素被渲染後再進行監聽操作。當 node 存在時，我們使用 loadMoreObserver.current（即之前創建的 IntersectionObserver 實例）的 observe() 方法來開始監聽該節點的可見性變化。

通常，這個節點會是一個用來觸發載入更多資料的區域，例如頁面底部的加載更多按鈕或無限滾動容器的底部。一旦這個節點進入畫面的可見範圍內，且仍有更多資料需要載入（根據 hasMore 的值），相應的回調函數就會被觸發，從而執行相應的操作（在這個例子中是增加頁數）。

注意，這段程式碼的目的是將 IntersectionObserver 開始監聽指定的節點，以觸發相應的操作。

---
## useBookSearch Hook
```
import axios from "axios";
import React, { useEffect, useState } from "react";

export default function useBookSearch(query, pageNum) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [books, setBooks] = useState([]);
  const [hasMore, setHasMore] = useState(false);

  useEffect(() => {
    setBooks([]);
  }, [query]);

  useEffect(() => {
    setLoading(true);
    setError(false);

    let cancel;

    axios({
      method: "GET",
      url: "http://openlibrary.org/search.json",
      params: { q: query, page: pageNum },
      cancelToken: new axios.CancelToken((c) => (cancel = c)),
    })
      .then((res) => {
        setBooks((prevBooks) => {
          return [
            ...new Set([...prevBooks, ...res.data.docs.map((b) => b.title)]),
          ];
        });
        setHasMore(res.data.docs.length > 0);
        setLoading(false);
        console.log(res.data);
      })
      .catch((e) => {
        if (axios.isCancel(e)) return;
        setError(true);
      });

    return () => cancel();
  }, [query, pageNum]);
  return { loading, error, books, hasMore };
}

```


`useBookSearch`是一個自定義的鉤子，名字叫上沿用了 React Hooks 的自定義。

React 中的 hook 是一種函數，它可以讓你在函數組中使用 React 的特性，例如狀態管理和生命週期方法。自定義 hook 是一種將可重複使用的封裝安裝在任數中的方式，以便在不同的組共享和重複使用。

`useBookSearch` hook 的目的是處理書籍搜索的提交。它封裝了與 API 的交互、數據的獲取和處理、以及狀態的管理，使這些發送可以在不同的組中間件共享並提供一個致的接口。

使用 hook 的好處是，可以將組件的發送與狀態分離，使組件更加簡潔和可讀。通過將復合的附件封裝在hook 中，組件只需要注意顯示和交互的部分，提供了代碼的可維護性和可重複使用性。

同時，使用 hook 還能讓你更好地利用 React 的生命周方法、上下文和其他 hook，以及享受 React 引入的一些優秀的化機製造，如狀態更新的處理和性計算等。

因此，將實際上 `useBookSearch` 成為一個鉤子是為了在多個組中共享和重複使用與書籍搜索相關的總專輯，以提高代號的可維護性和可重複使用性。

---
`...prevBooks` 
展開運算符將先前的書籍列表 prevBooks 中的每本書籍展開為獨立的元素。

---
`...res.data.docs.map((b) => b.title)` 
展開運算符將 API 回傳的書籍資料中的每本書籍的標題展開為獨立的元素。

---
`...new Set([...prevBooks, ...res.data.docs.map((b) => b.title)])`
將這兩個展開後的元素組合在一起，形成一個新的陣列。Set 是 JavaScript 中的一種內建物件，它是一個集合（collection）且不允許重複的值存在。使用 Set 可以確保最終的書籍列表中沒有重複的書籍標題。

總結來說，這段程式碼的目的是將先前的書籍列表和新獲取的書籍標題合併成一個新的陣列，並通過 Set 物件去除重複的書籍標題。這樣就確保了最終的書籍列表中每本書籍的標題都是唯一的。

---
### axios
```
axios({
  method: "GET",
  url: "http://openlibrary.org/search.json",
  params: { q: query, page: pageNum },
  cancelToken: new axios.CancelToken((c) => (cancel = c)),
})
```

[Cancellation](https://axios-http.com/docs/cancellation)
### setBooks
```
setBooks((prevBooks) => {
  return [
    ...new Set([...prevBooks, ...res.data.docs.map((b) => b.title)]),
  ];
});
```

... 是展開運算符（Spread Operator）。它的作用是將一個陣列（或類陣列對象）展開為個別的元素。

#### ...new Set
在 JavaScript 中，Set 物件期望接收一個可迭代的對象（如陣列）作為其構造函數的參數。透過在 Set 構造函數之前使用展開運算符 ...，可以將陣列展開為個別的元素，並將這些元素作為獨立的參數傳遞給 Set 構造函數。

使用 ... 展開運算符可以將陣列中的元素展開，確保每個元素都被視為獨立的值，然後傳遞給 Set 構造函數。這樣才能實現將陣列中的重複元素去除，確保最終的 Set 物件只包含唯一的值。

如果不使用展開運算符 ...，直接將陣列作為參數傳遞給 Set 構造函數，Set 將會將整個陣列視為一個單獨的元素，而不是將陣列中的每個元素視為不同的值。這將導致 Set 只保留陣列本身作為唯一的元素，而不會對陣列中的每個元素進行去重的操作。





#### ...prevBooks
prevBooks 是一個陣列，它代表先前的書籍列表。在這個程式碼片段中，使用 ...prevBooks 將先前的書籍列表展開，將每本書籍作為獨立的項目傳遞。

這個操作的目的是將先前的書籍列表中的所有書籍作為個別的元素，結合新獲取的書籍標題，構成更新後的書籍列表。

舉個例子，假設 prevBooks 是一個包含兩本書籍的陣列：
```
prevBooks = ["Book 1", "Book 2"];
```

使用 ...prevBooks 會將 ["Book 1", "Book 2"] 展開為 "Book 1", "Book 2"，這樣就可以將這些書籍作為獨立的參數傳遞或放入其他位置，例如與新獲取的書籍標題合併成更新後的書籍列表。

---
#### ...res.data.docs.map((b) => b.title)
在這個情境中，...res.data.docs.map((b) => b.title) 的目的是將 res.data.docs.map((b) => b.title) 的結果展開。

res.data.docs 是一個陣列，.map((b) => b.title) 是針對這個陣列的每個元素進行操作，並返回一個包含標題的新陣列。展開運算符 ... 將這個新陣列展開，將每個元素作為獨立的項目傳遞。

舉個例子，假設 res.data.docs 是一個包含兩個物件的陣列：
```
res.data.docs = [
  { title: "Book 1" },
  { title: "Book 2" }
];
```

使用 ...res.data.docs.map((b) => b.title) 會將 ["Book 1", "Book 2"] 展開為 "Book 1", "Book 2"，這樣就可以將這些標題作為獨立的參數傳遞或放入陣列中的其他位置。

## Q&A
### 為什麼使用 useRef
`useRef` 是 React 中一個用於保存可變值的 Hook。在這個例子中，`useRef` 被用來創建一個可變的參考，並將它賦值給 `observer`。

使用 `useRef` 的主要目的是在 React 函數組件中保存一個可變的值，且在重新渲染時不會丟失或重置。這意味著，不像使用狀態變量，`useRef` 的值在組件重新渲染時保持不變。這使得 `useRef` 特別適合保存一些不需要觸發重新渲染的資料，例如 DOM 元素的參考、計時器 ID、外部函數等。

在這個例子中，`useRef` 被用來創建一個對 `IntersectionObserver` 的參考，以便在需要時可以存取該 `IntersectionObserver` 實例，並且可以在多次重新渲染時保持不變。這樣做的原因是，`IntersectionObserver` 的創建和賦值過程只需要在組件首次渲染時執行一次，而不需要每次重新渲染都創建一個新的 `IntersectionObserver` 實例。

總結起來，`useRef` 在這裡的作用是為了在 React 函數組件中保存一個不需要觸發重新渲染的值，並確保在多次重新渲染時保持不變。
### 為什麼使用 useCallback
在這個例子中，使用 `useCallback` 是為了優化性能和避免不必要的重新渲染。

當你將回調函數傳遞給子組件時，如果該回調函數在每次組件重新渲染時都被重新創建，子組件可能會因為接收到新的回調函數而重新渲染，即使實際上回調函數的功能沒有改變。

這是因為在 React 中，當父組件重新渲染時，傳遞給子組件的函數被視為新的引用。這可能導致子組件在接收到新的回調函數時重新渲染，即使父組件的狀態或屬性沒有發生變化。

為了避免這種情況，可以使用 `useCallback` 將回調函數緩存起來。這樣，在組件重新渲染時，如果依賴於該回調函數的其他狀態或屬性沒有改變，React 將從記憶中返回相同的函數引用，而不是創建一個新的函數。

這有助於減少子組件的不必要重新渲染，提高性能。同時，使用 `useCallback` 也可以確保回調函數在依賴於它的其他狀態或屬性變化時被更新。

總結起來，使用 `useCallback` 可以優化性能，避免不必要的重新渲染，並確保回調函數在依賴於它的狀態或屬性發生變化時被更新。

---

## 專業術語
* [axios](https://axios-http.com/)
    * [Cancellation](https://axios-http.com/docs/cancellation)
* `...` [展開運算符（Spread Operator）](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Spread_syntax)
* [IntersectionObserver](https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API)
    provides a way to asynchronously observe changes in the intersection of a target element with an ancestor element or with a top-level document's viewport.
    * [disconnect](https://developer.mozilla.org/en-US/docs/Web/API/IntersectionObserver/disconnect)
        stops watching all of its target elements for visibility changes.
* [useRef](https://legacy.reactjs.org/docs/hooks-reference.html#useref)
    useRef 回傳一個 mutable 的 ref object，.current 屬性被初始為傳入的參數（initialValue）。回傳的 object 在 component 的生命週期將保持不變。
* [useCallback](https://legacy.reactjs.org/docs/hooks-reference.html#usecallback)
    回傳一個 memoized 的 callback。


###### tags: `Video Note` `React.js` `Hooks`