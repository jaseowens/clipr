import "./index.css";

const createNewCopyBlock = (data: string, prepend: boolean = false) => {
  const clipboardContent = document.getElementById("clipboard-content");

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
  if (data && Array.isArray(data) && data.length > 0) {
    const noContent = document.getElementById("no-content");
    if (noContent) {
      noContent.remove();
    }
    const oldClipboardContent = document.getElementById("clipboard-content");
    if (oldClipboardContent) {
      oldClipboardContent.remove();
    }
    const clipboardContent = document.createElement("div");
    clipboardContent.className = "wrapper";
    clipboardContent.id = "clipboard-content";

    document.body.append(clipboardContent);
    data.forEach((copy) => {
      createNewCopyBlock(copy);
    });
  } else {
    const noContent = document.createElement("div");
    noContent.id = "no-content";

    const noContentText = document.createElement("div");
    noContentText.innerText = "Start copying to see your history here!";
    noContentText.id = "no-content-text";

    noContent.append(noContentText);

    document.body.append(noContent);
  }
});
