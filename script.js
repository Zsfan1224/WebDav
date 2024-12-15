// WebDAV 服务器地址和其他配置
const WEBDAV_URL = 'https://your-webdav-server-url/';
let currentPath = '/';  // 当前目录路径
let currentFiles = [];  // 文件列表数据

// 获取文件列表并渲染
async function fetchFiles() {
  showLoading(true);

  try {
    const response = await fetch(`${WEBDAV_URL}${currentPath}`);
    const text = await response.text();
    
    // 解析 WebDAV 返回的文件列表（根据服务器的响应格式进行调整）
    const files = parseWebDAVResponse(text);
    currentFiles = files;

    renderFileList(files);
  } catch (error) {
    alert('获取文件列表失败！');
  } finally {
    showLoading(false);
  }
}

// 解析 WebDAV 响应（简化版）
function parseWebDAVResponse(responseText) {
  const parser = new DOMParser();
  const xml = parser.parseFromString(responseText, "application/xml");
  const entries = xml.getElementsByTagName('d:response');
  const files = [];

  for (let entry of entries) {
    const href = entry.getElementsByTagName('d:href')[0].textContent;
    const displayName = entry.getElementsByTagName('d:displayname')[0].textContent;
    const isCollection = entry.getElementsByTagName('d:collection').length > 0;

    files.push({
      name: displayName,
      path: href,
      isDirectory: isCollection
    });
  }

  return files;
}

// 渲染文件列表
function renderFileList(files) {
  const fileListContainer = document.getElementById('file-list');
  fileListContainer.innerHTML = '';

  files.forEach(file => {
    const fileCard = document.createElement('div');
    fileCard.classList.add('file-card');

    const fileInfo = document.createElement('div');
    fileInfo.classList.add('file-info');
    
    const fileName = document.createElement('h5');
    fileName.textContent = file.name;

    const previewLink = document.createElement('a');
    previewLink.href = '#';
    previewLink.textContent = '预览';
    previewLink.onclick = () => openPreview(file);

    fileInfo.appendChild(fileName);
    fileInfo.appendChild(previewLink);

    if (file.isDirectory) {
      fileCard.onclick = () => openDirectory(file);
    } else {
      fileCard.onclick = () => openFile(file);
    }

    fileCard.appendChild(fileInfo);
    fileListContainer.appendChild(fileCard);
  });

  renderPagination();
}

// 打开文件夹
function openDirectory(file) {
  currentPath = file.path;
  fetchFiles();
}

// 打开文件
function openFile(file) {
  if (file.isDirectory) return;
  openPreview(file);
}

// 文件预览
function openPreview(file) {
  const previewContainer = document.getElementById('file-preview-container');
  previewContainer.innerHTML = '';

  const isImage = file.name.match(/\.(jpg|jpeg|png|gif)$/i);
  const isPDF = file.name.match(/\.pdf$/i);
  const isAudio = file.name.match(/\.(mp3|wav)$/i);

  if (isImage) {
    const img = document.createElement('img');
    img.src = `${WEBDAV_URL}${file.path}`;
    previewContainer.appendChild(img);
  } else if (isPDF) {
    const iframe = document.createElement('iframe');
    iframe.src = `${WEBDAV_URL}${file.path}`;
    iframe.width = "100%";
    iframe.height = "500px";
    previewContainer.appendChild(iframe);
  } else if (isAudio) {
    const audio = document.createElement('audio');
    audio.controls = true;
    audio.src = `${WEBDAV_URL}${file.path}`;
    previewContainer.appendChild(audio);
  } else {
    previewContainer.textContent = '无法预览该文件类型';
  }

  const previewModal = new bootstrap.Modal(document.getElementById('previewModal'));
  previewModal.show();
}

// 显示加载动画
function showLoading(isLoading) {
  const loadingSpinner = document.getElementById('loading');
  loadingSpinner.style.display = isLoading ? 'block' : 'none';
}

// 搜索功能
function filterFiles() {
  const searchTerm = document.getElementById('search-input').value.toLowerCase();
  const filteredFiles = currentFiles.filter(file =>
    file.name.toLowerCase().includes(searchTerm)
  );
  renderFileList(filteredFiles);
}

// 排序文件列表
function sortFiles() {
  const sortBy = document.getElementById('sort-select').value;

  let sortedFiles = [...currentFiles];
  if (sortBy === 'name') {
    sortedFiles.sort((a, b) => a.name.localeCompare(b.name));
  } else if (sortBy === 'size') {
    sortedFiles.sort((a, b) => a.size - b.size); // 假设获取了文件大小
  } else if (sortBy === 'date') {
    sortedFiles.sort((a, b) => new Date(a.date) - new Date(b.date)); // 假设获取了日期
  }

  renderFileList(sortedFiles);
}

// 删除文件
async function deleteFile() {
  const fileToDelete = getSelectedFile();  // 假设你已经选择了文件
  const confirmDelete = confirm(`确定要删除 ${fileToDelete.name} 吗？`);

  if (confirmDelete) {
    try {
      const response = await fetch(`${WEBDAV_URL}${fileToDelete.path}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        alert(`${fileToDelete.name} 删除成功！`);
        fetchFiles();
      } else {
        alert('删除失败！');
      }
    } catch (error) {
      alert('删除失败！');
    }
  }
}

// 重命名文件
async function renameFile() {
  const newName = document.getElementById('new-name').value;
  const fileToRename = getSelectedFile(); // 假设你已经选择了文件

  if (!newName) {
    alert('请输入新文件名');
    return;
  }

  try {
    const response = await fetch(`${WEBDAV_URL}${fileToRename.path}`, {
      method: 'MOVE',
      headers: {
        'Destination': `${WEBDAV_URL}${fileToRename.path.substring(0, fileToRename.path.lastIndexOf('/'))}/${newName}`
      }
    });

    if (response.ok) {
      alert('文件重命名成功');
      fetchFiles();
    } else {
      alert('重命名失败');
    }
  } catch (error) {
    alert('重命名失败');
  }
}

// 获取选中的文件（假设你已经实现了文件选择）
function getSelectedFile() {
  // 这部分逻辑可以根据你的需求自定义
  return { name: 'example.txt', path: '/path/to/file/example.txt' };  // 示例
}

// 初始化文件列表
fetchFiles();
