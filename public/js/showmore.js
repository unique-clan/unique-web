let list = document.querySelectorAll("p");
let observer = new ResizeObserver(entries => {
  entries.forEach(item => {
    item.target.classList[item.target.scrollHeight > item.contentRect.height ? "add" : "remove"]("truncated");
  });
});

list.forEach(p => {
  observer.observe(p);
});
