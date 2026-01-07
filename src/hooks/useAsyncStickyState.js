// 异步持久化存储 Hook (基于 IndexedDB)
import { useState, useEffect, useRef } from 'react';
import { dbGet, dbSet } from '../utils/db';

export const useAsyncStickyState = (defaultValue, key) => {
  const [value, setValue] = useState(defaultValue);
  const [isLoaded, setIsLoaded] = useState(false);
  const isFirstRender = useRef(true);

  // 加载初始数据
  useEffect(() => {
    async function loadData() {
      try {
        const savedValue = await dbGet(key);
        if (savedValue !== null) {
          setValue(savedValue);
        }
      } catch (error) {
        console.error(`加载 IndexedDB 数据失败 (${key}):`, error);
      } finally {
        setIsLoaded(true);
      }
    }
    loadData();
  }, [key]);

  // 监听值变化并保存
  useEffect(() => {
    // 跳过首次渲染（已经加载过了或加载中）
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    // 只有在数据加载完成后才允许保存，防止默认值覆盖已存在的数据
    if (!isLoaded) return;

    const saveData = async () => {
      try {
        const storageMode = window.localStorage.getItem('app_storage_mode') || 'browser';
        // 如果是文件夹模式，交由 App.jsx 的同步逻辑处理
        if (storageMode === 'folder') return;
        
        await dbSet(key, value);
      } catch (error) {
        console.error(`保存到 IndexedDB 失败 (${key}):`, error);
      }
    };

    // 使用 debounce 或简单的延迟以优化性能
    const timer = setTimeout(saveData, 300);
    return () => clearTimeout(timer);
  }, [key, value, isLoaded]);

  return [value, setValue, isLoaded];
};
