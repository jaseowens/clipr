import "./index.css";

console.log(
  '👋 This message is being logged by "renderer.js", included via webpack'
);

const clipboardContent = document.getElementById("clipboard-content");

// window.electronAPI.setTitle(title)

const createNewCopyBlock = (data: string, prepend: boolean = false) => {
  const box = document.createElement("div");
  box.className = "box";

  box.addEventListener("click", () => {
    (window as any).electronAPI.handleTextSelected(data);
  });

  const copyIconWrapper = document.createElement("div");
  copyIconWrapper.className = "copy-icon-wrapper";

  const copyIcon = document.createElement("img");
  copyIcon.src = "./images/copy.svg";
  copyIcon.alt = "copy icon";
  copyIcon.className = "copy-icon";

  copyIconWrapper.appendChild(copyIcon);

  const clipboardData = document.createElement("p");
  clipboardData.className = "data";
  clipboardData.innerText = data;

  box.appendChild(copyIconWrapper);
  box.appendChild(clipboardData);
  prepend ? clipboardContent.prepend(box) : clipboardContent.appendChild(box);
};

(window as any).electronAPI.bootstrap((_: any, data: string[]) => {
  console.log("BOOTSTRAP!", data);
  data.forEach((copy) => {
    createNewCopyBlock(copy);
  });
});

(window as any).electronAPI.handleTextCopied((_: any, data: string) => {
  console.log("COPY EVENT!", data);
  createNewCopyBlock(data, true);
});
