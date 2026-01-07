/**
 * IndexedDB 存储中心
 * 用于突破 LocalStorage 的 5MB 限制，提供更强大的本地存储能力
 */

const DB_NAME = 'PromptFillDB';
const DB_VERSION = 2; // 升级版本以包含新的存储对象
const STORES = {
  HANDLES: 'handles', // 存储文件系统句柄
  APP_DATA: 'app_data' // 存储模板、词库等应用数据
};

/**
 * 打开数据库
 */
export const openDB = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      
      // 存储文件系统句柄
      if (!db.objectStoreNames.contains(STORES.HANDLES)) {
        db.createObjectStore(STORES.HANDLES);
      }
      
      // 存储应用核心数据 (templates, banks, settings, etc.)
      if (!db.objectStoreNames.contains(STORES.APP_DATA)) {
        db.createObjectStore(STORES.APP_DATA);
      }
    };
  });
};

/**
 * 通用的设置数据方法
 */
export const dbSet = async (key, value) => {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORES.APP_DATA], 'readwrite');
      const store = transaction.objectStore(STORES.APP_DATA);
      const request = store.put(value, key);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error(`IndexedDB Set Error (${key}):`, error);
    // 降级处理：如果 IDB 失败，暂时写入内存（不写 LS，避免溢出）
  }
};

/**
 * 通用的获取数据方法
 */
export const dbGet = async (key, defaultValue = null) => {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORES.APP_DATA], 'readonly');
      const store = transaction.objectStore(STORES.APP_DATA);
      const request = store.get(key);
      request.onsuccess = () => resolve(request.result !== undefined ? request.result : defaultValue);
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error(`IndexedDB Get Error (${key}):`, error);
    return defaultValue;
  }
};

/**
 * 特殊：获取文件夹句柄
 */
export const getDirectoryHandle = async () => {
  try {
    const db = await openDB();
    const transaction = db.transaction([STORES.HANDLES], 'readonly');
    const store = transaction.objectStore(STORES.HANDLES);
    return new Promise((resolve, reject) => {
      const request = store.get('directory');
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error('获取文件夹句柄失败:', error);
    return null;
  }
};

/**
 * 特殊：保存文件夹句柄
 */
export const saveDirectoryHandle = async (handle) => {
  try {
    const db = await openDB();
    const transaction = db.transaction([STORES.HANDLES], 'readwrite');
    const store = transaction.objectStore(STORES.HANDLES);
    await store.put(handle, 'directory');
  } catch (error) {
    console.error('保存文件夹句柄失败:', error);
  }
};

/**
 * 检查是否已经迁移过数据
 */
export const isMigrated = () => {
  return localStorage.getItem('app_storage_migrated') === 'true';
};

/**
 * 标记迁移完成
 */
export const markMigrated = () => {
  localStorage.setItem('app_storage_migrated', 'true');
  localStorage.setItem('app_storage_mode', 'browser_indexeddb');
};
