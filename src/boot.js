try {
  await import("./app.js");
  document.getElementById("loading").hidden = true;
} catch (error) {
  console.error("小书加载失败", error);
  document.getElementById("load-detail").textContent =
    "小书没有加载完成。请检查网络，并使用支持 WebGL 2 的浏览器重新打开。";
  const button = document.getElementById("retry-btn");
  button.hidden = false;
  button.onclick = () => location.reload();
}
